from __future__ import annotations  # Enable modern type hints behavior across Python versions.

from typing import Any, Dict, List  # Import type helpers used in function signatures.

from flask import Flask, jsonify, request, send_from_directory  # Import Flask tools for API and static file serving.

from medical_disease_knowledge_base import COMMON_DISEASES  # Import the disease knowledge base records.

app = Flask(__name__, static_folder=".", static_url_path="")  # Serve frontend files from the same project folder.

MAX_SELECTED_SYMPTOMS = 6  # Set an upper limit to avoid noisy and low-quality rule inputs.
MIN_SELECTED_SYMPTOMS = 2  # Require at least two symptoms for more reliable rule matching.


def normalize_symptom(symptom: str) -> str:  # Create a normalized symptom string for matching.
    return " ".join(symptom.strip().lower().split())  # Remove extra spaces and make lowercase.

# Define explicit rule-based combinations as requested by project guide.
DIAGNOSIS_RULES: List[Dict[str, Any]] = [
    {
        "required_symptoms": {"fever", "cough"},
        "disease": "Influenza",
        "confidence": 91.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: fever + cough suggests Flu/Influenza pattern.",
        "recommendations": ["rest", "hydration", "fever control"],
        "recommended_tests": ["rapid flu test", "PCR"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"fever", "rash"},
        "disease": "Viral Infection",
        "confidence": 88.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: fever + rash suggests a viral infection pattern.",
        "recommendations": ["hydration", "medical monitoring", "rest"],
        "recommended_tests": ["CBC", "viral panel"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"headache", "nausea"},
        "disease": "Migraine",
        "confidence": 86.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: headache + nausea suggests migraine-like presentation.",
        "recommendations": ["dark quiet room", "hydration", "trigger diary"],
        "recommended_tests": ["clinical diagnosis"],
        "specialist": "Neurologist",
    },
    {
        "required_symptoms": {"cough", "shortness of breath"},
        "disease": "Acute Bronchitis",
        "confidence": 84.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: cough + shortness of breath suggests bronchial inflammation.",
        "recommendations": ["warm fluids", "avoid smoke", "medical review"],
        "recommended_tests": ["clinical exam", "chest X-ray if needed"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"fever", "headache", "rash"},
        "disease": "Dengue Fever",
        "confidence": 93.0,
        "severity": "Moderate to High Level 3/3",
        "condition": "Rule matched: fever + headache + rash suggests dengue pattern.",
        "recommendations": ["hydration", "strict medical monitoring", "avoid NSAID self-use"],
        "recommended_tests": ["NS1 antigen", "IgM", "CBC platelet count"],
        "specialist": "General Physician / Infectious Disease Specialist",
    },
    {
        "required_symptoms": {"fever", "sore throat"},
        "disease": "Strep Throat",
        "confidence": 82.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: fever + sore throat suggests throat infection pattern.",
        "recommendations": ["warm fluids", "rest", "timely treatment"],
        "recommended_tests": ["rapid strep test", "throat culture"],
        "specialist": "General Physician / ENT Specialist",
    },
    {
        "required_symptoms": {"fever", "abdominal pain"},
        "disease": "Typhoid Fever",
        "confidence": 83.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: fever + abdominal pain suggests typhoid-like pattern.",
        "recommendations": ["safe fluids", "timely antibiotics by doctor", "rest"],
        "recommended_tests": ["blood culture", "CBC"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"chest pain", "shortness of breath"},
        "disease": "Coronary Artery Disease",
        "confidence": 90.0,
        "severity": "High Level 3/3",
        "condition": "Rule matched: chest pain + shortness of breath indicates possible cardiac risk.",
        "recommendations": ["urgent medical assessment", "do not delay consultation"],
        "recommended_tests": ["ECG", "troponin", "echo"],
        "specialist": "Cardiologist",
    },
    {
        "required_symptoms": {"fever", "body aches", "fatigue"},
        "disease": "Influenza",
        "confidence": 89.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: fever + body aches + fatigue supports influenza-like illness.",
        "recommendations": ["rest", "hydration", "fever control"],
        "recommended_tests": ["rapid flu test"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"fever", "loss of taste/smell", "dry cough"},
        "disease": "COVID-19",
        "confidence": 94.0,
        "severity": "Moderate to High Level 3/3",
        "condition": "Rule matched: fever + dry cough + loss of taste/smell suggests COVID-19 pattern.",
        "recommendations": ["isolation", "hydration", "medical monitoring"],
        "recommended_tests": ["rapid antigen", "RT-PCR"],
        "specialist": "General Physician / Pulmonologist",
    },
    {
        "required_symptoms": {"wheezing", "chest tightness", "night cough"},
        "disease": "Asthma",
        "confidence": 90.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: wheezing + chest tightness + night cough suggests asthma pattern.",
        "recommendations": ["inhaler adherence", "trigger avoidance"],
        "recommended_tests": ["spirometry"],
        "specialist": "Pulmonologist",
    },
    {
        "required_symptoms": {"productive cough", "mild fever", "chest discomfort"},
        "disease": "Acute Bronchitis",
        "confidence": 85.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: productive cough + chest discomfort + mild fever supports bronchitis pattern.",
        "recommendations": ["warm fluids", "rest", "avoid smoke"],
        "recommended_tests": ["clinical exam"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"diarrhea", "vomiting", "abdominal cramps"},
        "disease": "Gastroenteritis",
        "confidence": 88.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: diarrhea + vomiting + abdominal cramps suggests gastroenteritis.",
        "recommendations": ["oral rehydration", "light diet", "rest"],
        "recommended_tests": ["stool test if severe"],
        "specialist": "General Physician",
    },
    {
        "required_symptoms": {"heartburn", "acid regurgitation"},
        "disease": "GERD",
        "confidence": 84.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: heartburn + acid regurgitation suggests GERD pattern.",
        "recommendations": ["small meals", "avoid lying after food"],
        "recommended_tests": ["clinical trial therapy"],
        "specialist": "Gastroenterologist",
    },
    {
        "required_symptoms": {"increased thirst", "frequent urination", "fatigue"},
        "disease": "Type 2 Diabetes Mellitus",
        "confidence": 92.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: increased thirst + frequent urination + fatigue suggests diabetes pattern.",
        "recommendations": ["diet control", "exercise", "glucose checks"],
        "recommended_tests": ["fasting glucose", "HbA1c"],
        "specialist": "Endocrinologist",
    },
    {
        "required_symptoms": {"fatigue", "weight gain", "cold intolerance"},
        "disease": "Hypothyroidism",
        "confidence": 86.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: fatigue + weight gain + cold intolerance suggests hypothyroidism.",
        "recommendations": ["thyroid medication adherence", "follow-up labs"],
        "recommended_tests": ["TSH", "free T4"],
        "specialist": "Endocrinologist",
    },
    {
        "required_symptoms": {"weight loss", "palpitations", "tremor"},
        "disease": "Hyperthyroidism",
        "confidence": 87.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: weight loss + palpitations + tremor suggests hyperthyroidism.",
        "recommendations": ["medical management", "endocrine follow-up"],
        "recommended_tests": ["TSH", "free T4/T3"],
        "specialist": "Endocrinologist",
    },
    {
        "required_symptoms": {"burning urination", "frequent urination", "lower abdominal pain"},
        "disease": "Urinary Tract Infection",
        "confidence": 90.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: urinary burning + frequency + lower abdominal pain suggests UTI.",
        "recommendations": ["hydration", "timely treatment"],
        "recommended_tests": ["urine routine", "urine culture"],
        "specialist": "General Physician / Urologist",
    },
    {
        "required_symptoms": {"severe flank pain", "blood in urine", "nausea"},
        "disease": "Kidney Stones",
        "confidence": 89.0,
        "severity": "Moderate to High Level 3/3",
        "condition": "Rule matched: severe flank pain + blood in urine + nausea suggests kidney stones.",
        "recommendations": ["hydration", "urgent pain management"],
        "recommended_tests": ["urine analysis", "ultrasound"],
        "specialist": "Urologist",
    },
    {
        "required_symptoms": {"joint pain", "morning stiffness", "joint swelling"},
        "disease": "Rheumatoid Arthritis",
        "confidence": 88.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: joint pain + swelling + morning stiffness suggests rheumatoid arthritis.",
        "recommendations": ["early rheumatology review", "joint-friendly exercise"],
        "recommended_tests": ["RF", "anti-CCP", "ESR/CRP"],
        "specialist": "Rheumatologist",
    },
    {
        "required_symptoms": {"itchy skin", "dry patches", "redness"},
        "disease": "Eczema (Atopic Dermatitis)",
        "confidence": 83.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: itchy skin + dry patches + redness suggests eczema.",
        "recommendations": ["regular moisturization", "trigger avoidance"],
        "recommended_tests": ["clinical diagnosis"],
        "specialist": "Dermatologist",
    },
    {
        "required_symptoms": {"throbbing headache", "nausea", "light sensitivity"},
        "disease": "Migraine",
        "confidence": 89.0,
        "severity": "Mild to Moderate Level 1/3",
        "condition": "Rule matched: throbbing headache + nausea + light sensitivity suggests migraine.",
        "recommendations": ["dark quiet room", "hydration", "trigger control"],
        "recommended_tests": ["clinical diagnosis"],
        "specialist": "Neurologist",
    },
    {
        "required_symptoms": {"persistent low mood", "loss of interest", "sleep changes"},
        "disease": "Depression",
        "confidence": 82.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: persistent low mood + loss of interest + sleep changes suggests depressive pattern.",
        "recommendations": ["mental health consultation", "sleep routine", "support system"],
        "recommended_tests": ["clinical psychiatric evaluation"],
        "specialist": "Psychiatrist / Clinical Psychologist",
    },
    {
        "required_symptoms": {"excessive worry", "restlessness", "poor concentration"},
        "disease": "Generalized Anxiety Disorder",
        "confidence": 81.0,
        "severity": "Moderate Level 2/3",
        "condition": "Rule matched: excessive worry + restlessness + poor concentration suggests anxiety pattern.",
        "recommendations": ["therapy", "breathing exercises", "sleep hygiene"],
        "recommended_tests": ["clinical mental health assessment"],
        "specialist": "Psychiatrist / Clinical Psychologist",
    },
]

RULE_SYMPTOM_VOCAB = sorted(
    {normalize_symptom(item) for rule in DIAGNOSIS_RULES for item in rule.get("required_symptoms", set())}
)  # Build the approved symptom vocabulary used by the rule engine.


def serialize_disease_record(disease: Dict[str, Any]) -> Dict[str, Any]:  # Convert raw disease record into API-safe response shape.
    return {  # Return only frontend-required fields.
        "name": disease.get("disease", "Unknown Condition"),
        "symptoms": disease.get("symptoms", []),
        "possible_causes": disease.get("possible_causes", []),
        "risk_factors": disease.get("risk_factors", []),
        "recommended_tests": disease.get("recommended_tests", []),
        "specialist": disease.get("specialist", "General Physician"),
        "urgent_red_flags": disease.get("urgent_red_flags", []),
        "basic_care": disease.get("basic_care", []),
    }


def find_disease_record_by_name(name: str) -> Dict[str, Any] | None:  # Find one disease record by disease name.
    normalized_name = normalize_symptom(name)  # Normalize incoming disease name for comparison.
    for disease in COMMON_DISEASES:  # Loop all diseases in knowledge base.
        if normalize_symptom(str(disease.get("disease", ""))) == normalized_name:  # Match normalized names.
            return disease  # Return matched disease record.
    return None  # Return None when no disease exists.


def diagnose_with_rules(input_symptoms: List[str]) -> Dict[str, Any]:  # Apply explicit rule matching and return a diagnosis payload.
    symptom_set = {normalize_symptom(item) for item in input_symptoms if item.strip()}  # Normalize selected symptoms into a set.
    matched_rules = []  # Collect all rules that fully match user input.

    # --- DFS ALGORITHM (Depth-First Search) FOR EXPERT SYSTEM BACKWARD CHAINING ---
    # This DFS function recursively verifies if a specific rule (Disease) is satisfied.
    # It treats the rule as the 'Goal Node' and its symptoms as 'Sub-Goal Nodes' in a graph.
    def dfs_match_rule(path_index: int, required_symptoms_list: List[str]) -> bool:
        # BASE CASE: If the index reaches the length of the list, we have deeply searched
        # the entire path without failing. This means all required symptoms are completely matched!
        if path_index >= len(required_symptoms_list):
            return True  # DFS Path is valid and fully matched successfully.

        # CURRENT NODE: Get the current symptom node we need to evaluate at this depth level.
        current_symptom_node = required_symptoms_list[path_index]

        # NODE EVALUATION: Check if the user has this symptom in their reported symptom set.
        if current_symptom_node in symptom_set:
            # RECURSIVE TRAVERSAL: The symptom is found. The DFS algorithm goes one level deeper
            # into the graph to evaluate the next symptom node in the path sequence.
            return dfs_match_rule(path_index + 1, required_symptoms_list)
        else:
            # BACKTRACKING: The symptom is missing. This means the current DFS path is invalid.
            # We return False immediately to stop searching deeper and backtrack to try another rule.
            return False
    # --------------------------------------------------------------------------------

    for rule in DIAGNOSIS_RULES:  # Evaluate each predefined diagnosis rule.
        # Convert the required symptoms into a list, which defines the path our DFS will traverse.
        required_list = [normalize_symptom(item) for item in rule.get("required_symptoms", set())]
        
        # Start the DFS traversal from the very first symptom node (index 0) of the current rule.
        is_exact_match = dfs_match_rule(0, required_list)
        
        # If the DFS successfully traversed all required symptoms, it's a match.
        if is_exact_match:
            matched_rules.append(rule)  # Save the matching rule to our valid path list.

    if matched_rules:  # Use strongest matched rule when one or more rules are satisfied.
        matched_rules.sort(key=lambda item: (len(item["required_symptoms"]), item["confidence"]), reverse=True)  # Prefer more specific and higher confidence rules.
        top_rule = matched_rules[0]  # Pick top matching rule.
        record = find_disease_record_by_name(str(top_rule["disease"]))  # Try to enrich response from disease database.
        recommendations = top_rule.get("recommendations", [])  # Start from rule-level recommendations.
        recommended_tests = top_rule.get("recommended_tests", [])  # Start from rule-level test recommendations.
        specialist = top_rule.get("specialist", "General Physician")  # Start from rule-level specialist.
        red_flags = []  # Default red flags.

        if record:  # Enrich fields from disease knowledge base when available.
            recommendations = record.get("basic_care", recommendations)
            recommended_tests = record.get("recommended_tests", recommended_tests)
            specialist = record.get("specialist", specialist)
            red_flags = record.get("urgent_red_flags", [])

        matched_rule_names = [
            f"{'+'.join(sorted(rule['required_symptoms']))} -> {rule['disease']}"
            for rule in matched_rules[:3]
        ]  # Prepare top matched rule text for transparency.

        top_required = {normalize_symptom(item) for item in top_rule["required_symptoms"]}  # Normalize top-rule required symptoms.
        unrelated = sorted(symptom_set - top_required)  # Detect selected symptoms that are not part of winning rule.
        adjusted_confidence = float(top_rule["confidence"]) - (6.0 * len(unrelated))  # Reduce confidence when unrelated symptoms are present.
        adjusted_confidence = max(55.0, round(adjusted_confidence, 1))  # Keep confidence within practical floor.
        warnings = []  # Collect non-blocking warnings for frontend.
        if unrelated:  # Add warning details when unrelated symptoms exist.
            warnings.append(
                "Some selected symptoms do not fit the top rule: " + ", ".join(unrelated)
            )

        return {
            "name": top_rule["disease"],
            "confidence": adjusted_confidence,
            "severity": top_rule["severity"],
            "condition": top_rule["condition"],
            "recommendations": recommendations,
            "recommended_tests": recommended_tests,
            "specialist": specialist,
            "red_flags": red_flags,
            "matched_rules": matched_rule_names,
            "warnings": warnings,
            "suggested_symptoms": [],
            "disclaimer": "Educational support only. Always consult a qualified doctor.",
        }

    partial_candidates = []  # Keep partial matches when no rule fully matches.
    for rule in DIAGNOSIS_RULES:  # Evaluate overlap against every rule.
        required = {normalize_symptom(item) for item in rule.get("required_symptoms", set())}  # Normalize required symptoms.
        overlap = symptom_set.intersection(required)  # Compute shared symptoms.
        if not overlap:  # Skip rules with zero overlap.
            continue
        missing = sorted(required - symptom_set)  # Missing symptoms from the rule.
        unrelated = sorted(symptom_set - required)  # Extra selected symptoms not used by this rule.
        partial_candidates.append({
            "rule": rule,
            "overlap": sorted(overlap),
            "missing": missing,
            "unrelated": unrelated,
            "overlap_count": len(overlap),
            "required_count": len(required),
        })

    if partial_candidates:  # Return best partial rule instead of hard no-match.
        partial_candidates.sort(
            key=lambda item: (
                item["overlap_count"],
                item["overlap_count"] / item["required_count"],
                item["rule"].get("confidence", 0),
            ),
            reverse=True,
        )
        best_partial = partial_candidates[0]  # Pick highest quality partial candidate.
        top_rule = best_partial["rule"]  # Extract rule payload.
        record = find_disease_record_by_name(str(top_rule["disease"]))  # Enrich with disease details if available.

        recommendations = top_rule.get("recommendations", [])  # Start from rule defaults.
        recommended_tests = top_rule.get("recommended_tests", [])  # Start from rule defaults.
        specialist = top_rule.get("specialist", "General Physician")  # Start from rule defaults.
        red_flags = []  # Default red flags.
        if record:  # Enrich from main disease knowledge base when present.
            recommendations = record.get("basic_care", recommendations)
            recommended_tests = record.get("recommended_tests", recommended_tests)
            specialist = record.get("specialist", specialist)
            red_flags = record.get("urgent_red_flags", [])

        missing_count = len(best_partial["missing"])  # Count missing rule symptoms.
        unrelated_count = len(best_partial["unrelated"])  # Count extra unrelated selected symptoms.
        base = 68.0 + (best_partial["overlap_count"] * 7.0) - (missing_count * 8.0) - (unrelated_count * 4.0)  # Partial confidence scoring.
        confidence = round(max(50.0, min(base, 86.0)), 1)  # Clamp into safe confidence range.

        warnings = [
            "No exact rule match found. Showing best partial match.",
        ]  # Build warnings list for transparency.
        if best_partial["missing"]:
            warnings.append("Missing symptoms for exact match: " + ", ".join(best_partial["missing"]))
        if best_partial["unrelated"]:
            warnings.append("Extra unrelated selected symptoms: " + ", ".join(best_partial["unrelated"]))

        partial_rule_names = [
            f"{'+'.join(sorted(item['rule']['required_symptoms']))} -> {item['rule']['disease']} (partial)"
            for item in partial_candidates[:3]
        ]

        return {
            "name": top_rule["disease"],
            "confidence": confidence,
            "severity": "Partial Rule Match - Review Symptoms",
            "condition": "No exact rule matched, but closest rule pattern suggests this possible disease.",
            "recommendations": recommendations,
            "recommended_tests": recommended_tests,
            "specialist": specialist,
            "red_flags": red_flags,
            "matched_rules": partial_rule_names,
            "warnings": warnings,
            "suggested_symptoms": best_partial["missing"],
            "disclaimer": "Educational support only. Always consult a qualified doctor.",
        }

    return {  # Fallback response when no explicit rule is fully matched.
        "name": "No Exact Rule Match",
        "confidence": 40.0,
        "severity": "Low Confidence - Add More Symptoms",
        "condition": "No exact rule matched your selected symptoms. Please add more symptoms for better rule-based suggestion.",
        "recommendations": ["select 2 or more relevant symptoms", "consult a doctor for proper diagnosis"],
        "recommended_tests": ["clinical exam"],
        "specialist": "General Physician",
        "red_flags": [],
        "matched_rules": [],
        "warnings": ["Selected symptom combination is not covered by existing rules."],
        "suggested_symptoms": [],
        "disclaimer": "Educational support only. Always consult a qualified doctor.",
    }


@app.get("/")  # Serve the main frontend page.
def root() -> Any:  # Return index HTML document.
    return send_from_directory(".", "index.html")  # Send index file from project root.


@app.get("/api/symptoms")  # Return a list of all unique symptoms in the knowledge base.
def get_symptoms() -> Any:  # API endpoint for populating symptom options.
    return jsonify({"symptoms": RULE_SYMPTOM_VOCAB})  # Return rule-engine symptom vocabulary only.


@app.get("/api/diseases")  # Return all disease names and key details for selector UI.
def get_diseases() -> Any:  # API endpoint for loading disease list.
    serialized = [serialize_disease_record(item) for item in COMMON_DISEASES]  # Convert all disease records to frontend payload.
    return jsonify({"count": len(serialized), "diseases": serialized})  # Return disease records with count.


@app.get("/api/disease/<string:disease_name>")  # Return one disease profile by name.
def get_disease_by_name(disease_name: str) -> Any:  # API endpoint for one disease detail request.
    normalized_name = normalize_symptom(disease_name)  # Normalize path parameter for case-insensitive match.
    for disease in COMMON_DISEASES:  # Loop through all disease records.
        if normalize_symptom(str(disease.get("disease", ""))) == normalized_name:  # Compare normalized names.
            return jsonify({"disease": serialize_disease_record(disease)})  # Return matched disease record.
    return jsonify({"error": "Disease not found."}), 404  # Return 404 for unknown disease name.


@app.post("/api/diagnose")  # Diagnose endpoint used by the frontend button click.
def diagnose() -> Any:  # Compute the best disease guess from selected symptoms.
    payload = request.get_json(silent=True) or {}  # Read JSON body safely and fallback to empty object.
    symptom = str(payload.get("symptom", "")).strip()  # Read single symptom input if provided.
    symptoms = payload.get("symptoms", [])  # Read symptom list input if provided.

    if symptom and symptom not in symptoms:  # Add single symptom into symptoms list when not already present.
        symptoms = [*symptoms, symptom]  # Create a new list with the single symptom appended.

    cleaned_symptoms = [str(s).strip() for s in symptoms if str(s).strip()]  # Remove empty values and normalize input type.

    if len(cleaned_symptoms) < MIN_SELECTED_SYMPTOMS:  # Enforce minimum symptoms for better diagnosis quality.
        return jsonify({"error": f"Select at least {MIN_SELECTED_SYMPTOMS} symptoms for diagnosis."}), 400

    if len(cleaned_symptoms) > MAX_SELECTED_SYMPTOMS:  # Enforce maximum symptoms to prevent noisy combinations.
        return jsonify({"error": f"You can select at most {MAX_SELECTED_SYMPTOMS} symptoms."}), 400

    normalized_selected = [normalize_symptom(item) for item in cleaned_symptoms]  # Normalize selected symptoms for validation.
    unsupported = sorted({item for item in normalized_selected if item not in RULE_SYMPTOM_VOCAB})  # Detect unsupported symptoms.
    if unsupported:  # Block requests containing symptoms not covered by rule engine.
        return jsonify({
            "error": "Some symptoms are not supported by current rules.",
            "unsupported_symptoms": unsupported,
        }), 400

    response_payload = diagnose_with_rules(normalized_selected)  # Apply explicit symptom combination rules.
    return jsonify(response_payload)  # Return diagnosis as JSON.


if __name__ == "__main__":  # Run development server only when file is executed directly.
    app.run(host="127.0.0.1", port=5000, debug=True)  # Start local server for frontend + API.
