/**
 * app.core.js — NeoJaundice Pure Business Logic (Testable)
 *
 * All side-effect-free functions exported here for unit testing.
 * The DOM-coupled functions in app.js call these internally.
 */

/* ====================================================
   CONSTANTS
   ==================================================== */

const SCREEN_ORDER = [
    'screen-home',
    'screen-details',
    'screen-capture',
    'screen-processing',
    'screen-result',
    'screen-history',
    'screen-detail-view',
    'screen-help',
];

const RISK_LABELS = {
    low: 'LOW RISK',
    moderate: 'MODERATE RISK',
    high: 'HIGH RISK',
};

const RISK_DISPLAY_LABELS = {
    low: 'Low Risk',
    moderate: 'Moderate',
    high: 'High Risk',
};

const GUIDANCE_MAP = {
    low: 'Routine monitoring. Reassess in 48 hours. Ensure adequate breastfeeding and hydration. No immediate intervention required.',
    moderate: 'Rescreen after 24 hours. Monitor bilirubin levels closely. Ensure adequate feeding and hydration. Follow up with attending physician.',
    high: 'IMMEDIATE REFERRAL REQUIRED. Initiate phototherapy protocols. Contact specialist team and transfer to neonatal unit without delay.',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DELIVERY_TYPES = ['Normal', 'C-Section'];
const FEEDING_TYPES = ['Breastfed', 'Formula', 'Mixed'];

/* ====================================================
   NAVIGATION HELPERS
   ==================================================== */

/**
 * Determines if navigation from → to is a forward direction.
 * @param {string} from - current screen ID
 * @param {string} to   - target screen ID
 * @returns {boolean}
 */
function isForwardNavigation(from, to) {
    return SCREEN_ORDER.indexOf(to) > SCREEN_ORDER.indexOf(from);
}

/**
 * Validates that a screen ID exists in the known screen list.
 * @param {string} screenId
 * @returns {boolean}
 */
function isValidScreen(screenId) {
    return SCREEN_ORDER.includes(screenId);
}

/**
 * Returns the previous screen in order, or null if at the start.
 * @param {string} currentScreenId
 * @returns {string|null}
 */
function getPreviousScreen(currentScreenId) {
    const idx = SCREEN_ORDER.indexOf(currentScreenId);
    return idx > 0 ? SCREEN_ORDER[idx - 1] : null;
}

/**
 * Returns the next screen in order, or null if at the end.
 * @param {string} currentScreenId
 * @returns {string|null}
 */
function getNextScreen(currentScreenId) {
    const idx = SCREEN_ORDER.indexOf(currentScreenId);
    return idx >= 0 && idx < SCREEN_ORDER.length - 1 ? SCREEN_ORDER[idx + 1] : null;
}

/* ====================================================
   AGE CALCULATION
   ==================================================== */

/**
 * Calculates age in hours and days from a Date of Birth.
 * @param {Date} dob - Date of Birth
 * @param {Date} [now] - Reference "now" (defaults to actual now)
 * @returns {{ hours: number, days: number } | { error: string }}
 */
function calculateAge(dob, now = new Date()) {
    if (!(dob instanceof Date) || isNaN(dob.getTime())) {
        return { error: 'Invalid date of birth' };
    }

    const diffMs = now - dob;

    if (diffMs < 0) {
        return { error: 'Date of birth is in the future' };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return { hours, days };
}

/* ====================================================
   RISK SCORE CALCULATION
   ==================================================== */

/**
 * Computes the jaundice risk score from clinical indicators.
 * Returns score clamped to [0, 12].
 *
 * @param {object} formData - Clinical form inputs
 * @param {string} formData.yellowing      - 'yes' | 'no'
 * @param {string} formData.sclera         - 'yes' | 'no'
 * @param {string} formData.prevJaundice   - 'yes' | 'no'
 * @param {string} formData.phototherapy   - 'yes' | 'no'
 * @param {string|number} formData.gestAge - Gestational age in weeks
 * @param {string|number} formData.birthWeight - Birth weight in kg
 * @param {number} [baseScore]             - Fixed base score (for deterministic tests)
 * @returns {number} Risk score [0–12]
 */
function computeRiskScore(formData, baseScore = null) {
    // Use fixed base in tests; random in production
    let score = baseScore !== null ? baseScore : (Math.random() * 4 + 1);

    if (formData.yellowing === 'yes') score += 2.5;
    if (formData.sclera === 'yes') score += 3.0;
    if (formData.prevJaundice === 'yes') score += 1.5;
    if (formData.phototherapy === 'yes') score += 1.5;

    const gestAge = parseInt(formData.gestAge);
    if (!isNaN(gestAge) && gestAge < 37) score += 2.5;

    const weight = parseFloat(formData.birthWeight);
    if (!isNaN(weight) && weight < 2.5) score += 1.5;

    return Math.min(parseFloat(score.toFixed(1)), 12);
}

/**
 * Classifies a numeric score into a risk level string.
 * @param {number} score
 * @returns {'low' | 'moderate' | 'high'}
 */
function classifyRiskLevel(score) {
    if (score < 4) return 'low';
    if (score < 8) return 'moderate';
    return 'high';
}

/**
 * Returns the guidance text for a given risk level.
 * @param {'low'|'moderate'|'high'} riskLevel
 * @returns {string}
 */
function getGuidanceText(riskLevel) {
    return GUIDANCE_MAP[riskLevel] || '';
}

/**
 * Returns the display label for a risk level.
 * @param {'low'|'moderate'|'high'} riskLevel
 * @param {boolean} [badge] - Use badge labels (shorter)
 * @returns {string}
 */
function getRiskLabel(riskLevel, badge = false) {
    return badge ? RISK_DISPLAY_LABELS[riskLevel] || '' : RISK_LABELS[riskLevel] || '';
}

/**
 * Calculates the risk meter percentage from score.
 * @param {number} score   - Risk score (0-12)
 * @param {number} [max=12]
 * @returns {number} Percentage 0-100
 */
function getRiskMeterPercent(score, max = 12) {
    if (max <= 0) return 0;
    return Math.min(Math.max((score / max) * 100, 0), 100);
}

/* ====================================================
   HISTORY FILTERING
   ==================================================== */

/**
 * Filters a history record array by risk level.
 * @param {Array} records   - All screening records
 * @param {string} filter   - 'all' | 'low' | 'moderate' | 'high'
 * @returns {Array}
 */
function filterHistoryRecords(records, filter) {
    if (!filter || filter === 'all') return records;
    return records.filter(r => r.risk === filter);
}

/**
 * Sorts history records by date descending (newest first).
 * @param {Array} records
 * @returns {Array}
 */
function sortHistoryByDate(records) {
    return [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ====================================================
   SAVE SCREENING
   ==================================================== */

/**
 * Constructs a screening record object from form data + result.
 * @param {object} formData
 * @param {object} result      - { riskLevel, riskScore, guidance }
 * @param {string} captureType - 'skin' | 'sclera'
 * @param {Date}   [timestamp]
 * @returns {object} Screening record
 */
function buildScreeningRecord(formData, result, captureType, timestamp = new Date()) {
    return {
        id: formData.babyId || 'BID-' + timestamp.getTime(),
        name: formData.babyName || 'Baby (unnamed)',
        date: formatTimestamp(timestamp),
        risk: result.riskLevel,
        score: result.riskScore,
        age: formData.ageHours ? formData.ageHours + 'h' : '—',
        gestAge: formData.gestAge ? formData.gestAge + ' wks' : '—',
        weight: formData.birthWeight ? formData.birthWeight + ' kg' : '—',
        feeding: formData.feedingType || '—',
        yellowing: formData.yellowing === 'yes' ? 'Yes' : 'No',
        sclera: formData.sclera === 'yes' ? 'Yes' : 'No',
        facility: 'PHC Madurai Central',
        guidance: result.guidance,
        capture: captureType === 'skin' ? 'Skin' : 'Sclera',
    };
}

/**
 * Adds a new record to the front of the history array (immutable).
 * @param {Array} history
 * @param {object} record
 * @returns {Array} New array with record prepended
 */
function prependHistory(history, record) {
    return [record, ...history];
}

/* ====================================================
   FORM VALIDATION
   ==================================================== */

/**
 * Validates that required form fields are present and well-formed.
 * @param {object} formData
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateFormData(formData) {
    const errors = [];

    if (!formData.babyId || formData.babyId.trim() === '') {
        errors.push('Baby ID is required');
    }

    if (!formData.dob && formData.ageHours === null) {
        errors.push('Date of birth or age is required');
    }

    const gestAge = parseInt(formData.gestAge);
    if (formData.gestAge && (isNaN(gestAge) || gestAge < 22 || gestAge > 44)) {
        errors.push('Gestational age must be between 22 and 44 weeks');
    }

    const bw = parseFloat(formData.birthWeight);
    if (formData.birthWeight && (isNaN(bw) || bw <= 0 || bw > 6)) {
        errors.push('Birth weight must be between 0 and 6 kg');
    }

    if (!DELIVERY_TYPES.includes(formData.deliveryType)) {
        errors.push('Invalid delivery type');
    }

    if (!FEEDING_TYPES.includes(formData.feedingType)) {
        errors.push('Invalid feeding type');
    }

    if (formData.motherBlood && !BLOOD_GROUPS.includes(formData.motherBlood)) {
        errors.push('Invalid mother blood group');
    }

    if (formData.babyBlood && !BLOOD_GROUPS.includes(formData.babyBlood)) {
        errors.push('Invalid baby blood group');
    }

    return { valid: errors.length === 0, errors };
}

/* ====================================================
   YES/NO TOGGLES
   ==================================================== */

const YES_NO_KEY_MAP = {
    'yellowing': 'yellowing',
    'sclera': 'sclera',
    'prev-jaundice': 'prevJaundice',
    'phototherapy': 'phototherapy',
};

/**
 * Resolves the formData key from a yes/no toggle ID.
 * @param {string} toggleId
 * @returns {string|null}
 */
function resolveYesNoKey(toggleId) {
    return YES_NO_KEY_MAP[toggleId] || null;
}

/**
 * Applies a yes/no value to form data (immutable).
 * @param {object} formData
 * @param {string} toggleId - 'yellowing' | 'sclera' | 'prev-jaundice' | 'phototherapy'
 * @param {'yes'|'no'} value
 * @returns {object} Updated formData copy
 */
function applyYesNoToggle(formData, toggleId, value) {
    const key = resolveYesNoKey(toggleId);
    if (!key) return formData;
    return { ...formData, [key]: value };
}

/* ====================================================
   CAPTURE TYPE
   ==================================================== */

/**
 * Validates that capture type is one of the allowed values.
 * @param {string} type
 * @returns {boolean}
 */
function isValidCaptureType(type) {
    return type === 'skin' || type === 'sclera';
}

/**
 * Returns display label for capture type.
 * @param {string} type - 'skin' | 'sclera'
 * @returns {string}
 */
function getCaptureTypeLabel(type) {
    return type === 'skin' ? 'Skin' : type === 'sclera' ? 'Sclera' : 'Unknown';
}

/* ====================================================
   MOCK HISTORY GENERATOR
   ==================================================== */

/**
 * Generates sample mock history records for demo/test.
 * @returns {Array}
 */
function generateMockHistory() {
    return [
        {
            id: 'BID-20260302-001',
            name: 'Baby Lakshmi',
            date: '02 Mar 2026, 09:22',
            risk: 'moderate',
            score: 6.2,
            age: '52h',
            gestAge: '38 wks',
            weight: '2.8 kg',
            feeding: 'Breastfed',
            yellowing: 'Yes',
            sclera: 'No',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.moderate,
            capture: 'Skin',
        },
        {
            id: 'BID-20260302-002',
            name: 'Baby Rajan',
            date: '02 Mar 2026, 08:45',
            risk: 'low',
            score: 2.1,
            age: '36h',
            gestAge: '40 wks',
            weight: '3.1 kg',
            feeding: 'Breastfed',
            yellowing: 'No',
            sclera: 'No',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.low,
            capture: 'Skin',
        },
        {
            id: 'BID-20260301-009',
            name: 'Baby Preethi',
            date: '01 Mar 2026, 16:30',
            risk: 'high',
            score: 9.8,
            age: '24h',
            gestAge: '34 wks',
            weight: '1.9 kg',
            feeding: 'Formula',
            yellowing: 'Yes',
            sclera: 'Yes',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.high,
            capture: 'Sclera',
        },
        {
            id: 'BID-20260301-008',
            name: 'Baby Kumar',
            date: '01 Mar 2026, 14:12',
            risk: 'low',
            score: 1.5,
            age: '48h',
            gestAge: '39 wks',
            weight: '3.3 kg',
            feeding: 'Mixed',
            yellowing: 'No',
            sclera: 'No',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.low,
            capture: 'Skin',
        },
        {
            id: 'BID-20260301-007',
            name: 'Baby Divya',
            date: '01 Mar 2026, 10:05',
            risk: 'moderate',
            score: 5.4,
            age: '60h',
            gestAge: '37 wks',
            weight: '2.6 kg',
            feeding: 'Breastfed',
            yellowing: 'Yes',
            sclera: 'No',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.moderate,
            capture: 'Skin',
        },
        {
            id: 'BID-20260228-015',
            name: 'Baby Sanjay',
            date: '28 Feb 2026, 11:20',
            risk: 'low',
            score: 3.0,
            age: '72h',
            gestAge: '41 wks',
            weight: '3.5 kg',
            feeding: 'Breastfed',
            yellowing: 'No',
            sclera: 'No',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.low,
            capture: 'Skin',
        },
    ];
}

/* ====================================================
   TIMESTAMP UTILITY
   ==================================================== */

/**
 * Formats a Date as a localized Indian date-time string.
 * @param {Date} date
 * @returns {string}
 */
function formatTimestamp(date) {
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Parses a timestamp string (safe no-throw).
 * @param {string} timestampStr
 * @returns {Date|null}
 */
function parseTimestamp(timestampStr) {
    try {
        const d = new Date(timestampStr);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

/* ====================================================
   PROCESSING STEPS DEFINITION
   ==================================================== */

const PROCESSING_STEPS = [
    { id: 'ps-1', label: 'Extracting region of interest (ROI)', percent: 20 },
    { id: 'ps-2', label: 'Normalizing color channels', percent: 45 },
    { id: 'ps-3', label: 'Analyzing chromatic features', percent: 72 },
    { id: 'ps-4', label: 'Estimating jaundice risk level', percent: 100 },
];

/**
 * Returns the processing step by index (0-based).
 * @param {number} index
 * @returns {object|null}
 */
function getProcessingStep(index) {
    return PROCESSING_STEPS[index] || null;
}

/**
 * Returns the total number of processing steps.
 * @returns {number}
 */
function getProcessingStepCount() {
    return PROCESSING_STEPS.length;
}

/* ====================================================
   ABI EXPORT (Node.js / Jest)
   ==================================================== */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Navigation
        isForwardNavigation,
        isValidScreen,
        getPreviousScreen,
        getNextScreen,
        SCREEN_ORDER,

        // Age
        calculateAge,

        // Risk
        computeRiskScore,
        classifyRiskLevel,
        getGuidanceText,
        getRiskLabel,
        getRiskMeterPercent,
        GUIDANCE_MAP,
        RISK_LABELS,
        RISK_DISPLAY_LABELS,

        // History
        filterHistoryRecords,
        sortHistoryByDate,
        generateMockHistory,

        // Save
        buildScreeningRecord,
        prependHistory,

        // Form
        validateFormData,
        DELIVERY_TYPES,
        FEEDING_TYPES,
        BLOOD_GROUPS,

        // Yes/No
        applyYesNoToggle,
        resolveYesNoKey,
        YES_NO_KEY_MAP,

        // Capture
        isValidCaptureType,
        getCaptureTypeLabel,

        // Timestamp
        formatTimestamp,
        parseTimestamp,

        // Processing
        PROCESSING_STEPS,
        getProcessingStep,
        getProcessingStepCount,
    };
}
