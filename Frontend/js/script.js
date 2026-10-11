/* =========================================================
   SMART PRESCRIPTION READER
   Home Page JavaScript
   ========================================================= */


/* =========================
   PAGE LOAD
   ========================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("SmartRx Home Page Loaded");

    setupNavigationLogging();

});


/* =========================
   OPEN READER
   ========================= */

function openReader() {

    window.location.href = "reader.html";

}


/* =========================
   NAVIGATION LOGGING
   ========================= */

function setupNavigationLogging() {

    const navigationLinks =
        document.querySelectorAll(
            ".navbar nav a"
        );


    navigationLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    console.log(
                        "Navigating to:",
                        this.getAttribute("href")
                    );

                }
            );

        }
    );

}