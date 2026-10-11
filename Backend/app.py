from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import uuid
import re
import cv2
import pytesseract


# =========================================================
# SMART PRESCRIPTION READER
# Flask Backend
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# UPLOAD FOLDER
# =========================================================

UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

# Windows Tesseract installation path
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Smart Prescription Reader API is running"
    })


# =========================================================
# API STATUS
# =========================================================

@app.route("/api/status", methods=["GET"])
def status():

    return jsonify({
        "success": True,
        "status": "online",
        "project": "Smart Prescription Reader"
    })


# =========================================================
# OCR FUNCTION
# =========================================================

def perform_ocr(image_path):

    # Read image using OpenCV
    image = cv2.imread(image_path)

    if image is None:

        raise ValueError(
            "Unable to read the uploaded image."
        )


    # -----------------------------------------------------
    # Convert image to grayscale
    # -----------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )


    # -----------------------------------------------------
    # Resize image
    # -----------------------------------------------------

    scale = 2

    resized = cv2.resize(
        gray,
        None,
        fx=scale,
        fy=scale,
        interpolation=cv2.INTER_CUBIC
    )


    # -----------------------------------------------------
    # Noise reduction
    # -----------------------------------------------------

    blurred = cv2.GaussianBlur(
        resized,
        (5, 5),
        0
    )


    # -----------------------------------------------------
    # Thresholding
    # -----------------------------------------------------

    processed = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY +
        cv2.THRESH_OTSU
    )[1]


    # -----------------------------------------------------
    # OCR
    # -----------------------------------------------------

    text = pytesseract.image_to_string(
        processed,
        config="--psm 6"
    )


    return text.strip()


# =========================================================
# NLP FUNCTION
# Extract prescription information from OCR text
# =========================================================

def extract_prescription_data(raw_text):

    # -----------------------------------------------------
    # Clean OCR text
    # -----------------------------------------------------

    text = raw_text.strip()

    if not text:

        return {
            "medicine": "Not detected",
            "dosage": "Not detected",
            "frequency": "Not detected",
            "duration": "Not detected",
            "instructions": "Not detected"
        }


    # -----------------------------------------------------
    # Split OCR text into lines
    # -----------------------------------------------------

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]


    # -----------------------------------------------------
    # Variables
    # -----------------------------------------------------

    medicine = None
    dosage = None
    frequency = None
    duration = None
    instructions = None


    # =====================================================
    # DOSAGE DETECTION
    # =====================================================

    dosage_pattern = re.compile(
        r"\b\d+(?:\.\d+)?\s*"
        r"(?:mg|mcg|g|ml|mL|MG|ML|%)\b",
        re.IGNORECASE
    )


    # =====================================================
    # FREQUENCY DETECTION
    # =====================================================

    frequency_patterns = [

        r"\b(?:once|twice|thrice)\s+(?:a|per)\s+day\b",

        r"\b(?:once|twice|thrice)\s+daily\b",

        r"\b(?:one|two|three)\s+times\s+(?:a|per)\s+day\b",

        r"\b(?:OD|BD|TDS|QDS|QID|BID|TID|HS|SOS|PRN)\b",

        r"\b\d+\s*-\s*\d+\s*-\s*\d+\b",

        r"\b\d+\s*-\s*\d+\b"
    ]


    # =====================================================
    # DURATION DETECTION
    # =====================================================

    duration_pattern = re.compile(
        r"\b\d+\s*"
        r"(?:day|days|week|weeks|month|months)\b",
        re.IGNORECASE
    )


    # =====================================================
    # INSTRUCTION KEYWORDS
    # =====================================================

    instruction_keywords = [

        "after food",
        "before food",
        "with food",
        "without food",
        "after meals",
        "before meals",
        "empty stomach",
        "at night",
        "morning",
        "evening",
        "bedtime",
        "drink water"
    ]


    # =====================================================
    # SEARCH THROUGH OCR LINES
    # =====================================================

    for line in lines:

        lower_line = line.lower()


        # -------------------------------------------------
        # Dosage
        # -------------------------------------------------

        dosage_match = dosage_pattern.search(line)

        if dosage_match and dosage is None:

            dosage = dosage_match.group(0)


        # -------------------------------------------------
        # Frequency
        # -------------------------------------------------

        for pattern in frequency_patterns:

            frequency_match = re.search(
                pattern,
                line,
                re.IGNORECASE
            )

            if frequency_match:

                if frequency is None:

                    frequency = (
                        frequency_match.group(0)
                    )

                break


        # -------------------------------------------------
        # Duration
        # -------------------------------------------------

        duration_match = duration_pattern.search(
            line
        )

        if duration_match and duration is None:

            duration = duration_match.group(0)


        # -------------------------------------------------
        # Instructions
        # -------------------------------------------------

        for keyword in instruction_keywords:

            if keyword in lower_line:

                if instructions is None:

                    instructions = line.strip()

                break


    # =====================================================
    # MEDICINE DETECTION
    # =====================================================
    #
    # Try to identify a line that contains a dosage.
    # Usually prescription medicine names appear near
    # their dosage.
    #

    for line in lines:

        dosage_match = dosage_pattern.search(line)

        if dosage_match:

            possible_medicine = (
                dosage_pattern.sub(
                    "",
                    line
                )
            )

            # Remove common prescription symbols/numbers
            possible_medicine = re.sub(
                r"^[\s\d.)\-:]+",
                "",
                possible_medicine
            )

            possible_medicine = possible_medicine.strip()

            if possible_medicine:

                medicine = possible_medicine

                break


    # -----------------------------------------------------
    # If medicine was not found
    # -----------------------------------------------------

    if medicine is None:

        medicine = "Not detected"


    if dosage is None:

        dosage = "Not detected"


    if frequency is None:

        frequency = "Not detected"


    if duration is None:

        duration = "Not detected"


    if instructions is None:

        instructions = "Not detected"


    # =====================================================
    # RETURN NLP RESULT
    # =====================================================

    return {

        "medicine": medicine,

        "dosage": dosage,

        "frequency": frequency,

        "duration": duration,

        "instructions": instructions
    }


# =========================================================
# ANALYZE PRESCRIPTION
# =========================================================

@app.route("/api/analyze", methods=["POST"])
def analyze_prescription():

    # -----------------------------------------------------
    # Check uploaded file
    # -----------------------------------------------------

    if "prescription" not in request.files:

        return jsonify({
            "success": False,
            "message": "No prescription image was uploaded"
        }), 400


    file = request.files["prescription"]


    # -----------------------------------------------------
    # Check filename
    # -----------------------------------------------------

    if file.filename == "":

        return jsonify({
            "success": False,
            "message": "No file selected"
        }), 400


    # -----------------------------------------------------
    # Generate unique filename
    # -----------------------------------------------------

    extension = os.path.splitext(
        file.filename
    )[1]

    filename = (
        str(uuid.uuid4())
        + extension
    )


    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )


    # -----------------------------------------------------
    # Save uploaded image
    # -----------------------------------------------------

    file.save(filepath)


    # -----------------------------------------------------
    # Perform OCR
    # -----------------------------------------------------

    try:

        raw_text = perform_ocr(
            filepath
        )

    except Exception as error:

        print(
            "OCR Error:",
            error
        )

        return jsonify({
            "success": False,
            "message": "OCR processing failed",
            "error": str(error)
        }), 500


    # -----------------------------------------------------
    # NLP PROCESSING
    # -----------------------------------------------------

    try:

        nlp_result = extract_prescription_data(
            raw_text
        )

    except Exception as error:

        print(
            "NLP Error:",
            error
        )

        return jsonify({
            "success": False,
            "message": "NLP processing failed",
            "error": str(error)
        }), 500


    # -----------------------------------------------------
    # Combine OCR + NLP result
    # -----------------------------------------------------

    result = {

        "medicine":
            nlp_result["medicine"],

        "dosage":
            nlp_result["dosage"],

        "frequency":
            nlp_result["frequency"],

        "duration":
            nlp_result["duration"],

        "instructions":
            nlp_result["instructions"],

        "raw_text":
            raw_text
    }


    # -----------------------------------------------------
    # Return response
    # -----------------------------------------------------

    return jsonify({

        "success": True,

        "message":
            "Prescription image processed successfully",

        "filename":
            filename,

        "result":
            result

    })


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )