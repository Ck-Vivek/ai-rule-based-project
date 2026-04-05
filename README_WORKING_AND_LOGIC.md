# Rule-Based Medical Diagnosis - Working and Logic Guide

## 1) What This Project Does
This project is a rule-based medical diagnosis web application.
Users select symptoms and the system suggests a possible disease using fixed rules (not machine learning).

Example:
- If symptoms include fever + cough, the system can suggest Influenza.
- If symptoms include fever + rash, the system can suggest Viral Infection.

The output is explainable because every suggestion comes from explicit rules.

## 2) Main Features Included
- Symptom-based diagnosis mode (primary mode).
- Learn mode to read about diseases (reference only, no diagnosis trigger).
- Rule engine with exact-match and partial-match behavior.
- Input guardrails:
  - Minimum 2 symptoms required.
  - Maximum 6 symptoms allowed.
  - Unsupported symptoms are blocked.
- Warning system for unrelated extra symptoms.
- Helper system:
  - Natural language symptom suggestion.
  - Preset quick symptom packs.
  - Missing-symptom suggestion button for stronger rule matching.
- Reset selection to start from scratch.
- Algorithm carousel section with autoplay, controls, dots, and keyboard navigation.

## 3) Two Python Files and How They Work

### A) app.py
This is the backend API server and rule engine.

What it does:
- Starts Flask server.
- Exposes API routes used by the frontend.
- Stores explicit diagnosis rules in `DIAGNOSIS_RULES`.
- Validates symptom count and supported symptom vocabulary.
- Runs rule logic:
  - First tries exact rule match.
  - If no exact match, tries best partial match.
- Returns JSON response with:
  - disease name
  - confidence
  - severity
  - matched rules
  - warnings
  - suggested missing symptoms

Key endpoints:
- `GET /api/symptoms` -> returns supported symptom list for diagnosis.
- `GET /api/diseases` -> returns disease records for Learn mode.
- `POST /api/diagnose` -> returns diagnosis output from rule engine.

### B) medical_disease_knowledge_base.py
This is the medical reference dataset file.

What it contains:
- 50 common disease records.
- For each disease:
  - symptoms
  - possible causes
  - risk factors
  - recommended tests
  - specialist
  - urgent red flags
  - basic care

How it is used:
- Backend uses this dataset to enrich rule outputs with practical details (tests, specialist, care, warnings).
- Learn mode displays disease information from this dataset.

## 4) How Logic Is Applied (Simple Flow)
1. User selects symptoms in Diagnosis mode.
2. Frontend sends selected symptoms to `POST /api/diagnose`.
3. Backend validates input limits and allowed symptom names.
4. Backend checks exact rule matches.
5. If exact match exists, returns top exact result.
6. If exact match does not exist, returns best partial rule result with warnings and missing symptom hint.
7. Frontend displays result and lets user apply missing-symptom suggestion in one click.

## 5) How Algorithm Is Built (Simple Team Explanation)
The algorithm is deterministic and transparent:
- Rules are written as `required_symptoms -> disease`.
- Matching checks whether selected symptoms include all required symptoms.
- Confidence is adjusted based on related/unrelated symptoms.
- Partial match fallback avoids dead-end "no match" response.

This is suitable for classroom/project explainability because teammates can inspect and edit rules directly.

## 6) Common Team Customization Points
- Add new rule in `DIAGNOSIS_RULES` in `app.py`.
- Add new disease details in `medical_disease_knowledge_base.py`.
- Update helper keyword mapping in `script.js` for better symptom suggestion.
- Tune min/max symptom limits in `app.py`.

## 7) Important Note
This system is educational decision support only.
It does not replace professional clinical diagnosis.
