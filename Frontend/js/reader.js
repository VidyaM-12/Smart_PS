/* =========================================================
   SMART PRESCRIPTION READER
   Reader Page JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const prescriptionInput =
        document.getElementById("prescriptionInput");

    const uploadArea =
        document.getElementById("uploadArea");

    const previewArea =
        document.getElementById("previewArea");

    const previewImage =
        document.getElementById("previewImage");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const removeButton =
        document.getElementById("removeButton");

    const processButton =
        document.getElementById("processButton");

    const cameraButton =
        document.getElementById("cameraButton");


    /* =========================
       FILE SELECTION
       ========================= */

    prescriptionInput.addEventListener(
        "change",
        function () {

            const file = this.files[0];

            if (!file) {
                return;
            }

            displayImage(file);
        }
    );


    /* =========================
       DISPLAY IMAGE
       ========================= */

    function displayImage(file) {

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select a valid image file."
            );

            prescriptionInput.value = "";

            return;
        }


        const reader = new FileReader();


        reader.onload = function (event) {

            const imageData =
                event.target.result;


            /* Show image on Reader page */

            previewImage.src = imageData;

            previewImage.style.display = "block";


            /* Show file information */

            fileName.textContent =
                file.name;

            fileSize.textContent =
                formatFileSize(file.size);


            /* Switch from upload to preview */

            uploadArea.style.display = "none";

            previewArea.style.display = "block";


            /*
             * Save image temporarily in browser.
             * This allows result.html to display
             * the same uploaded prescription.
             */

            sessionStorage.setItem(
                "prescriptionImage",
                imageData
            );

            sessionStorage.setItem(
                "prescriptionFileName",
                file.name
            );

        };


        reader.onerror = function () {

            alert(
                "Unable to read the selected image."
            );

        };


        reader.readAsDataURL(file);
    }


    /* =========================
       FILE SIZE
       ========================= */

    function formatFileSize(bytes) {

        if (bytes === 0) {
            return "0 Bytes";
        }

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index =
            Math.floor(
                Math.log(bytes) / Math.log(1024)
            );

        return (
            (bytes / Math.pow(1024, index))
                .toFixed(2)
            + " "
            + units[index]
        );
    }


    /* =========================
       REMOVE IMAGE
       ========================= */

    removeButton.addEventListener(
        "click",
        function () {

            prescriptionInput.value = "";

            previewImage.src = "";

            previewArea.style.display = "none";

            uploadArea.style.display = "flex";


            fileName.textContent = "-";

            fileSize.textContent = "-";


            sessionStorage.removeItem(
                "prescriptionImage"
            );

            sessionStorage.removeItem(
                "prescriptionFileName"
            );

            sessionStorage.removeItem(
                "prescriptionResult"
            );

        }
    );


    /* =========================
       DRAG AND DROP
       ========================= */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "drag-over"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "drag-over"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "drag-over"
            );

            const file =
                event.dataTransfer.files[0];

            if (file) {

                /*
                 * Put dropped file into the
                 * file input as well.
                 */
                try {

                    const dataTransfer =
                        new DataTransfer();

                    dataTransfer.items.add(file);

                    prescriptionInput.files =
                        dataTransfer.files;

                } catch (error) {

                    console.log(
                        "Could not update file input:",
                        error
                    );

                }

                displayImage(file);
            }

        }
    );


    /* =========================
       CAMERA
       ========================= */

    cameraButton.addEventListener(
        "click",
        function () {

            prescriptionInput.setAttribute(
                "capture",
                "environment"
            );

            prescriptionInput.click();

        }
    );


    /* =========================
       ANALYZE PRESCRIPTION
       ========================= */

    processButton.addEventListener(
        "click",
        async function () {

            /* Check whether an image was selected */

            if (!prescriptionInput.files.length) {

                alert(
                    "Please select a prescription image first."
                );

                return;
            }


            const file =
                prescriptionInput.files[0];


            /* Check whether the selected file is an image */

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid prescription image."
                );

                return;
            }


            /*
             * Disable button while processing
             * to prevent multiple uploads.
             */

            processButton.disabled = true;

            const originalButtonText =
                processButton.textContent;

            processButton.textContent =
                "Analyzing...";


            /* Create FormData */

            const formData =
                new FormData();

            formData.append(
                "prescription",
                file
            );


            try {

                /*
                 * Send image to Flask backend.
                 *
                 * Flask endpoint:
                 * http://127.0.0.1:5000/api/analyze
                 */

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/analyze",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                /* Convert response to JSON */

                const data =
                    await response.json();


                /* Check backend response */

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to analyze prescription."
                    );
                }


                /*
                 * Save backend result temporarily.
                 * result.js will use this data.
                 */

                sessionStorage.setItem(
                    "prescriptionResult",
                    JSON.stringify(data)
                );


                /*
                 * Keep the uploaded image available
                 * for result.html.
                 */

                const savedImage =
                    sessionStorage.getItem(
                        "prescriptionImage"
                    );


                if (!savedImage) {

                    const imageReader =
                        new FileReader();

                    imageReader.onload =
                        function (event) {

                            sessionStorage.setItem(
                                "prescriptionImage",
                                event.target.result
                            );

                            window.location.href =
                                "result.html";

                        };

                    imageReader.readAsDataURL(file);

                } else {

                    window.location.href =
                        "result.html";

                }

            } catch (error) {

                console.error(
                    "Prescription analysis error:",
                    error
                );


                alert(
                    "Unable to connect to the Smart Prescription Reader server.\n\n" +
                    "Please make sure the Flask backend is running."
                );


                /* Restore button */

                processButton.disabled = false;

                processButton.textContent =
                    originalButtonText;

            }

        }
    );

});