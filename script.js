const symptomTabsContainer = document.getElementById('symptomTabs');
const terminalOutput = document.getElementById('terminalOutput');
const runDiagnosisBtn = document.getElementById('runDiagnosisBtn');
const diagnosisTitle = document.getElementById('diagnosisTitle');
const diagnosisCondition = document.getElementById('diagnosisCondition');
const severityValue = document.getElementById('severityValue');
const recommendationList = document.getElementById('recommendationList');
const confidenceValue = document.getElementById('confidenceValue');
const confidenceBar = document.querySelector('.meter-bar span');
const diseaseTabs = document.getElementById('diseaseTabs');
const navLinks = document.querySelectorAll('.nav-link');
const headerGetStartedBtn = document.getElementById('headerGetStartedBtn');
const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
const viewClinicalSpecsBtn = document.getElementById('viewClinicalSpecsBtn');
const selectedSymptomsInfo = document.getElementById('selectedSymptomsInfo');
const modeButtons = document.querySelectorAll('.mode-btn');
const diagnosisModePanel = document.getElementById('diagnosisModePanel');
const learnModePanel = document.getElementById('learnModePanel');
const learnDiseaseTitle = document.getElementById('learnDiseaseTitle');
const learnDiseaseSummary = document.getElementById('learnDiseaseSummary');
const learnDiseaseList = document.getElementById('learnDiseaseList');
const symptomSearchInput = document.getElementById('symptomSearchInput');
const symptomHelperInput = document.getElementById('symptomHelperInput');
const suggestSymptomsBtn = document.getElementById('suggestSymptomsBtn');
const helperStatusText = document.getElementById('helperStatusText');
const presetRow = document.getElementById('presetRow');
const resetSelectionBtn = document.getElementById('resetSelectionBtn');
const helperSuggestBox = document.getElementById('helperSuggestBox');
const helperSuggestText = document.getElementById('helperSuggestText');
const applySuggestionBtn = document.getElementById('applySuggestionBtn');
const engineTrack = document.getElementById('engineTrack');
const enginePrevBtn = document.getElementById('enginePrevBtn');
const engineNextBtn = document.getElementById('engineNextBtn');
const engineDots = document.querySelectorAll('.engine-dot');
const engineCarousel = document.getElementById('engineCarousel');
const mobileTabs = document.querySelectorAll('.mobile-tab');

const API_BASE_URL = window.location.origin;
let diseaseRecords = [];
let availableSymptoms = [];
let currentSymptomFilter = '';
let selectedSymptomsState = new Set();
let latestSuggestedSymptoms = [];
let engineSlideIndex = 0;
let engineAutoplayId = null;
const ENGINE_AUTOPLAY_MS = 3600;

const MAX_SELECTED_SYMPTOMS = 6;
const MIN_SELECTED_SYMPTOMS = 2;

const HELPER_KEYWORD_TO_SYMPTOM = {
  fever: 'fever',
  temperature: 'fever',
  cough: 'cough',
  cold: 'cough',
  throat: 'sore throat',
  headache: 'headache',
  migraine: 'throbbing headache',
  nausea: 'nausea',
  vomit: 'vomiting',
  vomiting: 'vomiting',
  diarrhea: 'diarrhea',
  loosemotion: 'diarrhea',
  rash: 'rash',
  itching: 'itchy skin',
  itchy: 'itchy skin',
  breathless: 'shortness of breath',
  breathlessness: 'shortness of breath',
  breathing: 'shortness of breath',
  wheezing: 'wheezing',
  chestpain: 'chest pain',
  chest: 'chest pain',
  stomach: 'abdominal pain',
  abdomen: 'abdominal pain',
  abdominal: 'abdominal pain',
  urine: 'frequent urination',
  urination: 'frequent urination',
  burning: 'burning urination',
  tired: 'fatigue',
  fatigue: 'fatigue',
  weak: 'fatigue',
  bodyache: 'body aches',
  bodypain: 'body aches',
  palpitations: 'palpitations',
  tremor: 'tremor',
  mood: 'persistent low mood',
  depressed: 'persistent low mood',
  anxiety: 'excessive worry',
  worry: 'excessive worry',
  concentration: 'poor concentration'
};

const HELPER_PHRASE_TO_SYMPTOM = [
  { phrase: 'body pain', symptom: 'body aches' },
  { phrase: 'body ache', symptom: 'body aches' },
  { phrase: 'muscle pain', symptom: 'body aches' },
  { phrase: 'chest pain', symptom: 'chest pain' },
  { phrase: 'breathing problem', symptom: 'shortness of breath' },
  { phrase: 'cannot breathe', symptom: 'shortness of breath' },
  { phrase: 'urine burning', symptom: 'burning urination' },
  { phrase: 'burning urine', symptom: 'burning urination' },
  { phrase: 'stomach pain', symptom: 'abdominal pain' },
  { phrase: 'taste loss', symptom: 'loss of taste/smell' },
  { phrase: 'smell loss', symptom: 'loss of taste/smell' }
];

const PRESET_TO_SYMPTOMS = {
  flu_like: ['fever', 'cough', 'body aches'],
  respiratory: ['shortness of breath', 'cough', 'chest discomfort'],
  digestive: ['abdominal pain', 'nausea', 'diarrhea'],
  urinary: ['burning urination', 'frequent urination', 'lower abdominal pain'],
  skin: ['rash', 'itchy skin', 'redness']
};

const bootLines = [
  '> INITIALIZING SYSTEM... OK',
  '> LOADING KNOWLEDGE GRAPH [v4.8.3]... COMPLETE',
  '> WAITING FOR DATA INPUT...'
];

function renderTerminal(lines) {
  terminalOutput.innerHTML = lines.map((line) => `<div>${line}</div>`).join('');
}

function updateEngineCarousel(index) {
  if (!engineTrack) {
    return;
  }

  const totalSlides = engineDots.length;
  if (!totalSlides) {
    return;
  }

  const normalized = (index + totalSlides) % totalSlides;
  engineSlideIndex = normalized;
  engineTrack.style.transform = `translateX(-${normalized * 100}%)`;

  engineDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === normalized);
  });
}

function stopEngineAutoplay() {
  if (engineAutoplayId) {
    clearInterval(engineAutoplayId);
    engineAutoplayId = null;
  }
}

function startEngineAutoplay() {
  stopEngineAutoplay();
  if (!engineTrack || engineDots.length < 2) {
    return;
  }

  engineAutoplayId = setInterval(() => {
    updateEngineCarousel(engineSlideIndex + 1);
  }, ENGINE_AUTOPLAY_MS);
}

function bindEngineCarousel() {
  if (!engineTrack) {
    return;
  }

  let touchStartX = 0;
  let touchEndX = 0;

  if (enginePrevBtn) {
    enginePrevBtn.addEventListener('click', () => {
      updateEngineCarousel(engineSlideIndex - 1);
      startEngineAutoplay();
    });
  }

  if (engineNextBtn) {
    engineNextBtn.addEventListener('click', () => {
      updateEngineCarousel(engineSlideIndex + 1);
      startEngineAutoplay();
    });
  }

  engineDots.forEach((dot) => {
    dot.style.setProperty('--engine-autoplay-duration', `${ENGINE_AUTOPLAY_MS}ms`);
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.slide || 0);
      updateEngineCarousel(index);
      startEngineAutoplay();
    });
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      updateEngineCarousel(engineSlideIndex - 1);
      startEngineAutoplay();
    }

    if (event.key === 'ArrowRight') {
      updateEngineCarousel(engineSlideIndex + 1);
      startEngineAutoplay();
    }
  });

  if (engineCarousel) {
    engineCarousel.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    engineCarousel.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      if (Math.abs(distance) < 40) {
        return;
      }

      if (distance > 0) {
        updateEngineCarousel(engineSlideIndex + 1);
      } else {
        updateEngineCarousel(engineSlideIndex - 1);
      }
      startEngineAutoplay();
    }, { passive: true });

    engineCarousel.addEventListener('mouseenter', () => {
      stopEngineAutoplay();
    });

    engineCarousel.addEventListener('mouseleave', () => {
      startEngineAutoplay();
    });
  }

  updateEngineCarousel(0);
  startEngineAutoplay();
}

function renderDiagnosis(result) {
  diagnosisTitle.textContent = result.name;
  diagnosisCondition.textContent = result.condition;
  severityValue.textContent = result.severity;
  confidenceValue.textContent = `${result.confidence}%`;

  recommendationList.innerHTML = '';
  result.recommendations.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    recommendationList.appendChild(li);
  });

  if (Array.isArray(result.recommended_tests) && result.recommended_tests.length > 0) {
    const testsLi = document.createElement('li');
    testsLi.textContent = `Suggested tests: ${result.recommended_tests.join(', ')}`;
    recommendationList.appendChild(testsLi);
  }

  if (result.specialist) {
    const specialistLi = document.createElement('li');
    specialistLi.textContent = `Consult specialist: ${result.specialist}`;
    recommendationList.appendChild(specialistLi);
  }

  if (Array.isArray(result.matched_rules) && result.matched_rules.length > 0) {
    const ruleLi = document.createElement('li');
    ruleLi.textContent = `Matched rule: ${result.matched_rules[0]}`;
    recommendationList.appendChild(ruleLi);
  }

  if (Array.isArray(result.warnings) && result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      const warnLi = document.createElement('li');
      warnLi.textContent = `Warning: ${warning}`;
      recommendationList.appendChild(warnLi);
    });
  }

  if (Array.isArray(result.suggested_symptoms) && result.suggested_symptoms.length > 0) {
    latestSuggestedSymptoms = result.suggested_symptoms;
    helperSuggestText.textContent = `Suggestion: add ${result.suggested_symptoms.join(', ')} for a stronger exact rule match.`;
    helperSuggestBox.classList.remove('hidden-panel');
  } else {
    latestSuggestedSymptoms = [];
    helperSuggestText.textContent = 'No completion suggestion yet.';
    helperSuggestBox.classList.add('hidden-panel');
  }

  confidenceBar.style.width = `${result.confidence}%`;
}

function getSelectedSymptoms() {
  return Array.from(selectedSymptomsState);
}

function setHelperStatus(message) {
  helperStatusText.textContent = message;
}

function renderSelectedSymptomsInfo() {
  const selectedSymptoms = getSelectedSymptoms();
  selectedSymptomsInfo.textContent = `Selected symptoms: ${selectedSymptoms.join(', ') || 'none'}`;
}

function buildDiseaseProfileResult(disease) {
  const symptoms = Array.isArray(disease.symptoms) ? disease.symptoms.join(', ') : 'not available';
  const causes = Array.isArray(disease.possible_causes) && disease.possible_causes.length
    ? disease.possible_causes.join(', ')
    : 'not specified';

  return {
    name: disease.name,
    confidence: 99.9,
    severity: 'Reference Profile (Knowledge Base)',
    condition: `Disease profile loaded. Symptoms: ${symptoms}. Possible causes: ${causes}.`,
    recommendations: Array.isArray(disease.basic_care) ? disease.basic_care : [],
    recommended_tests: Array.isArray(disease.recommended_tests) ? disease.recommended_tests : [],
    specialist: disease.specialist || 'General Physician'
  };
}

function renderLearnDisease(disease) {
  const profile = buildDiseaseProfileResult(disease);
  learnDiseaseTitle.textContent = disease.name;
  learnDiseaseSummary.textContent = profile.condition;
  learnDiseaseList.innerHTML = '';

  const items = [
    `Symptoms: ${(disease.symptoms || []).join(', ') || 'not available'}`,
    `Risk factors: ${(disease.risk_factors || []).join(', ') || 'not available'}`,
    `Recommended tests: ${(disease.recommended_tests || []).join(', ') || 'not available'}`,
    `Specialist: ${disease.specialist || 'General Physician'}`,
    `Basic care: ${(disease.basic_care || []).join(', ') || 'not available'}`
  ];

  items.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    learnDiseaseList.appendChild(li);
  });
}

async function requestDiagnosis(symptoms) {
  const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ symptoms })
  });

  const data = await response.json();
  if (!response.ok) {
    const detailedError = [
      data.error || data.message || 'Diagnosis request failed.',
      Array.isArray(data.unsupported_symptoms) && data.unsupported_symptoms.length
        ? `Unsupported symptoms: ${data.unsupported_symptoms.join(', ')}`
        : ''
    ]
      .filter(Boolean)
      .join(' | ');
    throw new Error(detailedError);
  }

  return data;
}

async function requestSymptoms() {
  const response = await fetch(`${API_BASE_URL}/api/symptoms`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load symptoms.');
  }

  return Array.isArray(data.symptoms) ? data.symptoms : [];
}

async function requestDiseases() {
  const response = await fetch(`${API_BASE_URL}/api/diseases`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load diseases.');
  }

  return data.diseases || [];
}

function toTitleCase(value) {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function renderSymptomButtons() {
  const filtered = availableSymptoms.filter((symptom) => symptom.includes(currentSymptomFilter));

  symptomTabsContainer.innerHTML = '';

  filtered.forEach((symptom) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'symptom-tab';
    button.dataset.symptom = symptom;
    button.textContent = toTitleCase(symptom);

    if (selectedSymptomsState.has(symptom)) {
      button.classList.add('active');
    }

    symptomTabsContainer.appendChild(button);
  });
}

function getVisibleSymptomButtons() {
  return Array.from(symptomTabsContainer.querySelectorAll('.symptom-tab'));
}

function setSelectedSymptoms(symptoms) {
  selectedSymptomsState = new Set(symptoms);
  renderSymptomButtons();
  renderSelectedSymptomsInfo();
}

function applySymptomSelectionSafely(symptomsToSelect) {
  const unique = Array.from(new Set(symptomsToSelect)).filter((symptom) => availableSymptoms.includes(symptom));
  const limited = unique.slice(0, MAX_SELECTED_SYMPTOMS);
  setSelectedSymptoms(limited);
  return limited;
}

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z]/g, '');
}

function suggestSymptomsFromText(inputText) {
  const normalizedText = inputText.toLowerCase();
  const suggestions = new Set();

  HELPER_PHRASE_TO_SYMPTOM.forEach((item) => {
    if (normalizedText.includes(item.phrase) && availableSymptoms.includes(item.symptom)) {
      suggestions.add(item.symptom);
    }
  });

  const words = inputText
    .split(/\s+/)
    .map((word) => normalizeWord(word))
    .filter(Boolean);

  words.forEach((word) => {
    const mapped = HELPER_KEYWORD_TO_SYMPTOM[word];
    if (mapped && availableSymptoms.includes(mapped)) {
      suggestions.add(mapped);
    }
  });

  return Array.from(suggestions);
}

function bindSymptomSearch() {
  symptomSearchInput.addEventListener('input', () => {
    currentSymptomFilter = symptomSearchInput.value.trim().toLowerCase();
    renderSymptomButtons();
  });
}

function bindHelperEvents() {
  suggestSymptomsBtn.addEventListener('click', () => {
    const text = symptomHelperInput.value.trim();
    if (!text) {
      setHelperStatus('Type your symptoms first (example: fever and cough).');
      return;
    }

    const suggested = suggestSymptomsFromText(text);
    if (suggested.length === 0) {
      setHelperStatus('Could not map your text. Try simple words like fever, cough, rash, nausea.');
      return;
    }

    const finalSelection = applySymptomSelectionSafely(suggested);
    setHelperStatus(`Suggested and selected: ${finalSelection.join(', ')}`);
    renderTerminal([
      '> HELPER APPLIED SUGGESTIONS',
      `> SELECTED: ${finalSelection.join(', ').toUpperCase()}`,
      '> REVIEW AND RUN DIAGNOSIS'
    ]);
  });

  presetRow.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.classList.contains('preset-btn')) {
      return;
    }

    const presetKey = target.dataset.preset;
    const presetSymptoms = PRESET_TO_SYMPTOMS[presetKey] || [];
    const finalSelection = applySymptomSelectionSafely(presetSymptoms);
    setHelperStatus(`Preset loaded: ${finalSelection.join(', ')}`);
    renderTerminal([
      '> PRESET APPLIED',
      `> CURRENT SELECTION: ${finalSelection.join(', ').toUpperCase()}`,
      '> RUN DIAGNOSIS WHEN READY'
    ]);
  });

  applySuggestionBtn.addEventListener('click', () => {
    if (!latestSuggestedSymptoms.length) {
      setHelperStatus('No suggestion available. Run diagnosis first.');
      return;
    }

    const combined = Array.from(new Set([...getSelectedSymptoms(), ...latestSuggestedSymptoms]));
    const finalSelection = applySymptomSelectionSafely(combined);
    setHelperStatus(`Suggestion applied: ${latestSuggestedSymptoms.join(', ')}`);
    helperSuggestBox.classList.add('hidden-panel');
    renderTerminal([
      '> MISSING SYMPTOM SUGGESTION APPLIED',
      `> CURRENT SELECTION: ${finalSelection.join(', ').toUpperCase()}`,
      '> RUN DIAGNOSIS AGAIN FOR UPDATED RESULT'
    ]);
  });
}

function resetAllSelections() {
  selectedSymptomsState = new Set();
  currentSymptomFilter = '';
  latestSuggestedSymptoms = [];
  symptomSearchInput.value = '';
  symptomHelperInput.value = '';
  renderSymptomButtons();
  renderSelectedSymptomsInfo();
  helperSuggestText.textContent = 'No completion suggestion yet.';
  helperSuggestBox.classList.add('hidden-panel');
  setHelperStatus('Reset complete. Select new symptoms to start again.');
  renderTerminal([
    '> RESET COMPLETE',
    '> ALL SELECTED SYMPTOMS CLEARED',
    '> START AGAIN WITH NEW INPUT'
  ]);
}

function setActiveDiseaseChip(chosenName) {
  const allChips = document.querySelectorAll('.disease-chip');
  allChips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.diseaseName === chosenName);
  });
}

function renderDiseaseTabs(records) {
  diseaseTabs.innerHTML = '';

  records.forEach((disease) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'disease-chip';
    chip.textContent = disease.name;
    chip.dataset.diseaseName = disease.name;

    chip.addEventListener('click', () => {
      setActiveDiseaseChip(disease.name);
      renderLearnDisease(disease);
      renderTerminal([
        `> KNOWLEDGE PROFILE SELECTED: ${String(disease.name).toUpperCase()}`,
        '> DISEASE REFERENCE DETAILS LOADED',
        '> LEARN MODE ONLY: DIAGNOSIS USES SYMPTOM INPUT'
      ]);
    });

    diseaseTabs.appendChild(chip);
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setActiveMobileTab(tabName) {
  mobileTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
}

function setActiveTopNavByTarget(target) {
  navLinks.forEach((navItem) => {
    navItem.classList.toggle('active', navItem.dataset.target === target);
  });
}

function bindMobileTabs() {
  mobileTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      const mode = tab.dataset.mode;

      if (target) {
        scrollToSection(target);
        setActiveTopNavByTarget(target);
      }

      if (mode) {
        setMode(mode);
      }

      setActiveMobileTab(tab.dataset.tab);
    });
  });
}

function bindNavAndButtons() {
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.dataset.target;
      if (target) {
        scrollToSection(target);
      }

      setActiveTopNavByTarget(target);

      if (target === 'heroSection') {
        setActiveMobileTab('home');
      } else if (target === 'engineSection') {
        setActiveMobileTab('algorithm');
      } else if (target === 'symptomsSection') {
        setActiveMobileTab('diagnose');
      }
    });
  });

  headerGetStartedBtn.addEventListener('click', () => {
    scrollToSection('symptomsSection');
    setActiveMobileTab('diagnose');
    setActiveTopNavByTarget('symptomsSection');
    renderTerminal([
      '> GET STARTED TRIGGER RECEIVED',
      '> NAVIGATING TO SYMPTOM ANALYSIS',
      '> SELECT DISEASE OR SYMPTOMS TO PROCEED'
    ]);
  });

  heroGetStartedBtn.addEventListener('click', () => {
    scrollToSection('symptomsSection');
    setActiveMobileTab('diagnose');
    setActiveTopNavByTarget('symptomsSection');
    renderTerminal([
      '> STARTING DIAGNOSTIC WORKFLOW',
      '> OPENED ANALYSIS PANEL',
      '> READY FOR INPUT'
    ]);
  });

  viewClinicalSpecsBtn.addEventListener('click', () => {
    scrollToSection('engineSection');
    setActiveMobileTab('algorithm');
    setActiveTopNavByTarget('engineSection');
    renderTerminal([
      '> CLINICAL SPECIFICATION VIEW REQUESTED',
      '> DISPLAYING PRECISION ENGINE BLOCK',
      '> REVIEW INFERENCE PIPELINE'
    ]);
  });
}

function setMode(mode) {
  const isDiagnosisMode = mode === 'diagnosis';
  diagnosisModePanel.classList.toggle('hidden-panel', !isDiagnosisMode);
  learnModePanel.classList.toggle('hidden-panel', isDiagnosisMode);

  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });

  if (isDiagnosisMode) {
    renderTerminal([
      '> MODE SET: DIAGNOSIS',
      '> INPUT MUST BE SYMPTOMS',
      '> DISEASE CHIPS DO NOT AFFECT DIAGNOSIS'
    ]);
  } else {
    renderTerminal([
      '> MODE SET: LEARN',
      '> BROWSE DISEASE PROFILES',
      '> THIS MODE DOES NOT RUN DIAGNOSIS'
    ]);
  }
}

function bindModeEvents() {
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setMode(button.dataset.mode);
    });
  });
}

async function runDiagnosisForActiveSymptom() {
  const selectedSymptoms = getSelectedSymptoms();
  runDiagnosisBtn.disabled = true;

  if (selectedSymptoms.length < MIN_SELECTED_SYMPTOMS) {
    renderTerminal([
      `> SELECT AT LEAST ${MIN_SELECTED_SYMPTOMS} SYMPTOMS`,
      '> CURRENT SELECTION IS TOO LOW',
      '> THEN RUN DIAGNOSIS AGAIN'
    ]);
    runDiagnosisBtn.disabled = false;
    return;
  }

  if (selectedSymptoms.length > MAX_SELECTED_SYMPTOMS) {
    renderTerminal([
      `> SELECTION LIMIT EXCEEDED: MAX ${MAX_SELECTED_SYMPTOMS}`,
      `> CURRENT COUNT: ${selectedSymptoms.length}`,
      '> REMOVE EXTRA SYMPTOMS AND TRY AGAIN'
    ]);
    runDiagnosisBtn.disabled = false;
    return;
  }

  renderTerminal([
    `> EXECUTING RULE ENGINE FOR: ${selectedSymptoms.join(', ').toUpperCase()}`,
    '> CALLING PYTHON RULE ENGINE...',
    '> PLEASE WAIT...'
  ]);

  try {
    const result = await requestDiagnosis(selectedSymptoms);
    renderTerminal([
      `> INPUT SYMPTOMS: ${selectedSymptoms.join(', ').toUpperCase()}`,
      `> CONFIDENCE SCORE: ${result.confidence}%`,
      `> PRIMARY INFERENCE: ${String(result.name).toUpperCase()}`
    ]);
    renderDiagnosis(result);
  } catch (error) {
    renderTerminal([
      '> BACKEND CONNECTION FAILED',
      '> START PYTHON SERVER: python app.py',
      `> ERROR: ${error.message}`
    ]);
  } finally {
    runDiagnosisBtn.disabled = false;
  }
}

function bindSymptomEvents() {
  symptomTabsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.classList.contains('symptom-tab')) {
      return;
    }

    const symptom = target.dataset.symptom;
    const wasActive = selectedSymptomsState.has(symptom);
    const selectedCount = selectedSymptomsState.size;
    if (!wasActive && selectedCount >= MAX_SELECTED_SYMPTOMS) {
      renderTerminal([
        `> MAX ${MAX_SELECTED_SYMPTOMS} SYMPTOMS ALLOWED`,
        '> EXTRA SELECTION BLOCKED',
        '> UNSELECT ONE SYMPTOM TO ADD ANOTHER'
      ]);
      return;
    }

    if (wasActive) {
      selectedSymptomsState.delete(symptom);
      target.classList.remove('active');
    } else {
      selectedSymptomsState.add(symptom);
      target.classList.add('active');
    }

    const selectedSymptoms = getSelectedSymptoms();
    renderSelectedSymptomsInfo();

    renderTerminal([
      `> INPUT TOKEN TOGGLED: ${String(symptom).toUpperCase()}`,
      `> CURRENT SELECTION: ${selectedSymptoms.join(', ').toUpperCase() || 'NONE'}`,
      '> READY FOR RULE-BASED DIAGNOSIS'
    ]);
  });

  runDiagnosisBtn.addEventListener('click', async () => {
    await runDiagnosisForActiveSymptom();
  });

  resetSelectionBtn.addEventListener('click', () => {
    resetAllSelections();
  });
}

async function initializeApp() {
  renderTerminal(bootLines);
  bindEngineCarousel();
  bindMobileTabs();
  bindNavAndButtons();
  bindModeEvents();
  bindSymptomSearch();
  bindHelperEvents();
  bindSymptomEvents();

  try {
    availableSymptoms = await requestSymptoms();
    renderSymptomButtons();

    setSelectedSymptoms(availableSymptoms.slice(0, 2));
    setHelperStatus('Helper ready. Describe symptoms or use presets.');
    helperSuggestBox.classList.add('hidden-panel');

    diseaseRecords = await requestDiseases();
    renderDiseaseTabs(diseaseRecords);

    if (diseaseRecords.length > 0) {
      setActiveDiseaseChip(diseaseRecords[0].name);
      renderLearnDisease(diseaseRecords[0]);
    }

    renderTerminal([
      '> INITIALIZATION COMPLETE',
      `> RULE SUPPORTED SYMPTOMS: ${availableSymptoms.length}`,
      `> DISEASE RECORDS LOADED: ${diseaseRecords.length}`,
      '> USE DIAGNOSIS MODE FOR RULE INPUT'
    ]);
  } catch (error) {
    renderTerminal([
      '> ERROR LOADING DISEASE RECORDS',
      '> CHECK BACKEND STATUS',
      `> ERROR: ${error.message}`
    ]);
  }

  setMode('diagnosis');
  await runDiagnosisForActiveSymptom();
}

initializeApp();
