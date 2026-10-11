/* =========================================================
   SMART PRESCRIPTION READER
   History Page JavaScript
   ========================================================= */


/* =========================
   VIEW PRESCRIPTION
   ========================= */

function viewPrescription(name) {

    alert(
        "Opening " + name + "...\n\n" +
        "The complete prescription record will be loaded " +
        "from the database after the backend is connected."
    );

}


/* =========================
   DELETE PRESCRIPTION
   ========================= */

function deletePrescription(button) {

    const card =
        button.closest(".history-card");

    const confirmed =
        confirm(
            "Are you sure you want to delete this prescription?"
        );

    if (!confirmed) {
        return;
    }

    card.remove();


    updateHistoryCount();

}


/* =========================
   UPDATE COUNT
   ========================= */

function updateHistoryCount() {

    const cards =
        document.querySelectorAll(
            ".history-card"
        );

    const total =
        cards.length;

    const summaryNumbers =
        document.querySelectorAll(
            ".summary-card strong"
        );

    if (summaryNumbers.length > 0) {

        summaryNumbers[0].textContent =
            total;

    }


    if (total === 0) {

        document.getElementById(
            "emptyHistory"
        ).style.display = "block";

    }

}


/* =========================
   FILTER
   ========================= */

const historyFilter =
    document.getElementById(
        "historyFilter"
    );


if (historyFilter) {

    historyFilter.addEventListener(
        "change",
        function () {

            const cards =
                document.querySelectorAll(
                    ".history-card"
                );


            cards.forEach(function (card) {

                /*
                 * These are sample records for now.
                 * Real date filtering will be performed
                 * by the backend/database later.
                 */

                if (this.value === "all") {

                    card.style.display =
                        "grid";

                } else {

                    card.style.display =
                        "grid";

                }

            }, this);

        }
    );

}