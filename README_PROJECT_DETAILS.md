# Project Details - Rule-Based Medical Diagnosis Frontend

## Project Name
Rule-Based Medical Diagnosis Frontend

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Python Flask
- Data: Local Python knowledge base file

## Folder Structure
- `index.html` -> main UI layout
- `styles.css` -> all visual styles and responsive design
- `script.js` -> frontend behavior, API calls, helper logic, carousel logic
- `app.py` -> Flask backend, rule engine, API routes
- `medical_disease_knowledge_base.py` -> 50-disease reference dataset
- `requirements.txt` -> Python dependencies

## Setup and Run
1. Open terminal in project folder.
2. Install dependencies:
   - `& "C:\Users\ASUS\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m pip install -r requirements.txt`
3. Start server:
   - `& "C:\Users\ASUS\AppData\Local\Python\pythoncore-3.14-64\python.exe" app.py`
4. Open browser:
   - `http://127.0.0.1:5000`

## If Server Fails with Exit Code 1
Likely port 5000 is already in use.
Use this command, then start again:
- `Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`

## Implemented UI Sections
- Hero section with live console panel and trust metrics
- Algorithm section with animated carousel and controls
- Symptom diagnosis mode with helper tools
- Learn mode with disease information cards
- Result panel with confidence, severity, suggestions, and warnings

## API Endpoints
- `GET /` -> serves app UI
- `GET /api/symptoms` -> list of rule-supported symptoms
- `GET /api/diseases` -> disease dataset for Learn mode
- `GET /api/disease/<name>` -> single disease details
- `POST /api/diagnose` -> rule-based diagnosis response

## Quality and Safety Layers
- Min and max symptom selection checks
- Unsupported symptom blocking
- Unrelated symptom warning logic
- Missing symptom suggestion for exact rule completion
- Partial-match fallback for better usability

## Team Handoff Notes
- Keep diagnosis logic in `app.py` only.
- Keep disease details in `medical_disease_knowledge_base.py` only.
- Keep Learn mode separate from diagnosis logic to avoid confusion.
- When adding new rules, also verify helper keyword mapping in `script.js`.

## Future Enhancements
- Rule editor UI for non-developers
- Save diagnosis history
- Export report to PDF/CSV
- User accounts and role-based access
- Audit logs for rule changes

## Disclaimer
This project is for educational use and clinical decision support demonstration.
It is not a substitute for licensed medical advice, diagnosis, or treatment.
