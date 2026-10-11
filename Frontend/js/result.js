/* =========================================================
   SMART PRESCRIPTION READER
   Result Page JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       GET ELEMENTS
       ========================= */

    const resultPrescriptionImage =
        document.getElementById("resultPrescriptionImage");

    const resultImagePlaceholder =
        document.getElementById("resultImagePlaceholder");


    /* =========================
       DISPLAY UPLOADED IMAGE
       ========================= */

    const savedImage =
        sessionStorage.getItem("prescriptionImage");

    if (savedImage) {

        resultPrescriptionImage.src =
            savedImage;

        resultPrescriptionImage.style.display =
            "block";

        if (resultImagePlaceholder) {
            resultImagePlaceholder.style.display =
                "none";
        }

    } else {

        resultPrescriptionImage.style.display =
            "none";

        if (resultImagePlaceholder) {
            resultImagePlaceholder.style.display =
                "flex";
        }
    }


    /* =========================
       GET BACKEND RESULT
       ========================= */

    const savedResult =
        sessionStorage.getItem(
            "prescriptionResult"
        );


    if (savedResult) {

        try {

            const backendData =
                JSON.parse(savedResult);

            console.log(
                "Backend response:",
                backendData
            );


            if (backendData.result) {

                displayResult(
                    backendData.result
                );

            }

        } catch (error) {

            console.error(
                "Unable to read backend result:",
                error
            );

        }

    } else {

        console.log(
            "No backend result found."
        );
    }


    /* =========================
       DISPLAY RESULT
       ========================= */

    function displayResult(result) {

        console.log(
            "Prescription Result:",
            result
        );


        /* Medicine */

        const medicineElement =
            document.getElementById(
                "medicineName"
            );

        if (medicineElement) {

            medicineElement.textContent =
                result.medicine ||
                "Not available";
        }


        /* Dosage */

        const dosageElement =
            document.getElementById(
                "dosage"
            );

        if (dosageElement) {

            dosageElement.textContent =
                result.dosage ||
                "Not available";
        }


        /* Frequency */

        const frequencyElement =
            document.getElementById(
                "frequency"
            );

        if (frequencyElement) {

            frequencyElement.textContent =
                result.frequency ||
                "Not available";
        }


        /* Duration */

        const durationElement =
            document.getElementById(
                "duration"
            );

        if (durationElement) {

            durationElement.textContent =
                result.duration ||
                "Not available";
        }


        /* Instructions */

        const instructionsElement =
            document.getElementById(
                "instructions"
            );

        if (instructionsElement) {

            instructionsElement.textContent =
                result.instructions ||
                "Not available";
        }


        /* Raw OCR Text */

        const rawTextElement =
            document.getElementById(
                "rawText"
            );

        if (rawTextElement) {

            rawTextElement.textContent =
                result.raw_text ||
                "No text available";
        }
    }


    /* =========================
       READ ALOUD
       ========================= */

    window.readPrescription =
        function () {

            const medicine =
                getText(
                    "medicineName"
                );

            const dosage =
                getText(
                    "dosage"
                );

            const frequency =
                getText(
                    "frequency"
                );

            const duration =
                getText(
                    "duration"
                );

            const instructions =
                getText(
                    "instructions"
                );


            const text =
                "Medicine: " +
                medicine +
                ". Dosage: " +
                dosage +
                ". Frequency: " +
                frequency +
                ". Duration: " +
                duration +
                ". Instructions: " +
                instructions;


            if (
                "speechSynthesis" in window
            ) {

                const speech =
                    new SpeechSynthesisUtterance(
                        text
                    );

                speech.lang = "en-US";

                speech.rate = 0.9;

                window.speechSynthesis.cancel();

                window.speechSynthesis.speak(
                    speech
                );

            } else {

                alert(
                    "Text-to-Speech is not supported in this browser."
                );
            }
        };


    /* =========================
       GET TEXT FROM ELEMENT
       ========================= */

    function getText(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return "Not available";
        }

        return element.textContent.trim();
    }


    /* =========================
       TRANSLATE
       ========================= */

    window.translatePrescription =
        function () {

            alert(
                "Translation feature will be connected to the NLP translation module next."
            );

        };


    /* =========================
       EDIT RESULTS
       ========================= */

    window.editPrescription =
        function () {

            alert(
                "Result editing will be enabled after the AI recognition module is connected."
            );

        };


    /* =========================
       SAVE RESULT
       ========================= */

    window.downloadResult =
        function () {

            alert(
                "Save Result will be connected to MySQL/database history later."
            );

        };

});