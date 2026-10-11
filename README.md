# Smart Prescription Reader (SmartRx)

An AI-assisted web application that helps turn **handwritten medical prescriptions** into clear, structured, readable information.

Users upload or capture a prescription image. The Flask backend runs OCR (Tesseract + OpenCV) to extract text, then applies simple pattern-based NLP to pull out the medicine, dosage, frequency, duration and instructions, and presents them in an easy-to-read results page.

> ⚠️ **Medical disclaimer:** This is an academic project. AI/OCR recognition can make mistakes. Always verify medicine, dosage, frequency and duration with a qualified doctor or pharmacist. This tool does **not** replace professional medical advice.

---

## ✨ Features

- **Landing page** with an overview of the product and how it works.
- **Reader page** — upload an image via drag & drop, file picker, or the device camera, with a live preview.
- **OCR extraction** — image preprocessing (grayscale, upscale, denoise, Otsu threshold) + Tesseract OCR.
- **NLP parsing** — regex-based detection of:
  - Medicine name
  - Dosage (e.g. `500 mg`, `5 ml`)
  - Frequency (e.g. `twice daily`, `1-0-1`, `OD/BD/TDS`)
  - Duration (e.g. `5 days`, `2 weeks`)
  - Instructions (e.g. `after food`, `empty stomach`)
- **Results page** — structured view of the extracted data, the original image, and the raw OCR text, plus a text-to-speech "Read Aloud" option.
- **History & About pages** for the UI flow.

---

## 🧱 Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | HTML5, CSS3, vanilla JavaScript              |
| Backend   | Python, Flask, Flask-CORS                    |
| OCR       | Tesseract OCR (`pytesseract`) + OpenCV (`cv2`) |

---

## 📁 Project Structure

```
SmartPrescriptionReader/
├── Backend/
│   ├── app.py            # Flask API (OCR + NLP)
│   └── uploads/          # Uploaded images are saved here at runtime
├── Frontend/
│   ├── index.html        # Home page
│   ├── reader.html       # Upload / capture page
│   ├── result.html       # Analysis results page
│   ├── history.html      # History page
│   ├── about.html        # About page
│   ├── css/              # Stylesheets
│   └── js/               # Page scripts
├── requirements.txt      # Python dependencies
└── README.md
```

---

## ✅ Prerequisites

- **Python 3.8+**
- **Tesseract OCR** engine installed on your system:
  - **Windows:** install from https://github.com/UB-Mannheim/tesseract/wiki (default path `C:\Program Files\Tesseract-OCR\tesseract.exe`). Make sure it is on your `PATH` or matches the path configured in `Backend/app.py`.
  - **macOS:** `brew install tesseract`
  - **Linux (Debian/Ubuntu):** `sudo apt-get install tesseract-ocr`

---

## 🚀 Getting Started

### 1. Clone / open the project

```bash
cd SmartPrescriptionReader
```

### 2. Create and activate a virtual environment

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
python -m venv venv
venv\Scripts\activate.bat

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the backend

```bash
cd Backend
python app.py
```

The API will start on **http://127.0.0.1:5000**.

### 5. Run the frontend

The frontend is plain static HTML/CSS/JS. You can open `Frontend/index.html` directly in a browser, or serve it with a simple static server, for example:

```bash
# from the Frontend folder
python -m http.server 5500
```

Then visit http://127.0.0.1:5500.

> **Note:** The reader page sends the uploaded image to the backend at `http://127.0.0.1:5000/api/analyze`, so make sure the Flask server is running before analyzing a prescription.

---

## 🔌 API Endpoints

| Method | Endpoint        | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/`             | Health check — confirms the API is running.      |
| GET    | `/api/status`   | Returns the service status.                      |
| POST   | `/api/analyze`  | Accepts a `prescription` image file, runs OCR + NLP, and returns structured data. |

**Example (`/api/analyze`) with curl:**

```bash
curl -X POST -F "prescription=@/path/to/prescription.jpg" http://127.0.0.1:5000/api/analyze
```

**Sample response:**

```json
{
  "success": true,
  "message": "Prescription image processed successfully",
  "filename": "a1b2c3d4.jpg",
  "result": {
    "medicine": "Paracetamol",
    "dosage": "500 mg",
    "frequency": "twice daily",
    "duration": "5 days",
    "instructions": "after food",
    "raw_text": "Paracetamol 500 mg ..."
  }
}
```

---

## ⚙️ Configuration

- **Tesseract path:** set in `Backend/app.py` via `pytesseract.pytesseract.tesseract_cmd`. Update it if your Tesseract install lives elsewhere.
- **Upload folder:** `Backend/uploads` (created automatically at startup). Uploaded images are stored here at runtime and are ignored by git.

---

## 🗺️ Roadmap / Future Work

- Connect prescription history to a database (e.g. MySQL) instead of sample data.
- Multilingual translation of extracted information (English, Kannada, Hindi).
- Improved handwriting recognition with trained ML/CNN models.

---

## 📄 License

Created as an academic project.
