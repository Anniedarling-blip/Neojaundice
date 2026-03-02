/**
 * NeoJaundice — Comprehensive Unit Tests
 * Tests every component of app.core.js
 *
 * Run:  npm test
 * Coverage: npm run test:coverage
 */

const {
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
} = require('../app.core.js');

/* ======================================================================
   1. NAVIGATION COMPONENT TESTS
   ====================================================================== */

describe('Navigation — isForwardNavigation()', () => {
    test('home→details is forward', () => {
        expect(isForwardNavigation('screen-home', 'screen-details')).toBe(true);
    });

    test('home→capture is forward (skip)', () => {
        expect(isForwardNavigation('screen-home', 'screen-capture')).toBe(true);
    });

    test('home→help is forward (last screen)', () => {
        expect(isForwardNavigation('screen-home', 'screen-help')).toBe(true);
    });

    test('details→home is backward', () => {
        expect(isForwardNavigation('screen-details', 'screen-home')).toBe(false);
    });

    test('result→capture is backward', () => {
        expect(isForwardNavigation('screen-result', 'screen-capture')).toBe(false);
    });

    test('same screen is not forward', () => {
        expect(isForwardNavigation('screen-home', 'screen-home')).toBe(false);
    });

    test('processing→result is forward (sequential)', () => {
        expect(isForwardNavigation('screen-processing', 'screen-result')).toBe(true);
    });
});

describe('Navigation — isValidScreen()', () => {
    test('returns true for all valid screens', () => {
        SCREEN_ORDER.forEach(id => {
            expect(isValidScreen(id)).toBe(true);
        });
    });

    test('returns false for unknown screen', () => {
        expect(isValidScreen('screen-unknown')).toBe(false);
    });

    test('returns false for empty string', () => {
        expect(isValidScreen('')).toBe(false);
    });

    test('returns false for null/undefined', () => {
        expect(isValidScreen(null)).toBe(false);
        expect(isValidScreen(undefined)).toBe(false);
    });
});

describe('Navigation — getPreviousScreen()', () => {
    test('returns null for first screen (home)', () => {
        expect(getPreviousScreen('screen-home')).toBeNull();
    });

    test('returns home for details', () => {
        expect(getPreviousScreen('screen-details')).toBe('screen-home');
    });

    test('returns details for capture', () => {
        expect(getPreviousScreen('screen-capture')).toBe('screen-details');
    });

    test('returns capture for processing', () => {
        expect(getPreviousScreen('screen-processing')).toBe('screen-capture');
    });
});

describe('Navigation — getNextScreen()', () => {
    test('returns details for home', () => {
        expect(getNextScreen('screen-home')).toBe('screen-details');
    });

    test('returns capture for details', () => {
        expect(getNextScreen('screen-details')).toBe('screen-capture');
    });

    test('returns null for last screen (help)', () => {
        expect(getNextScreen('screen-help')).toBeNull();
    });

    test('returns result for processing', () => {
        expect(getNextScreen('screen-processing')).toBe('screen-result');
    });
});

describe('Navigation — SCREEN_ORDER constant', () => {
    test('has 8 screens', () => {
        expect(SCREEN_ORDER).toHaveLength(8);
    });

    test('starts with screen-home', () => {
        expect(SCREEN_ORDER[0]).toBe('screen-home');
    });

    test('ends with screen-help', () => {
        expect(SCREEN_ORDER[SCREEN_ORDER.length - 1]).toBe('screen-help');
    });

    test('contains screen-processing', () => {
        expect(SCREEN_ORDER).toContain('screen-processing');
    });
});

/* ======================================================================
   2. AGE CALCULATION COMPONENT TESTS
   ====================================================================== */

describe('Age Calculation — calculateAge()', () => {
    const fixedNow = new Date('2026-03-02T11:30:00');

    test('calculates 24 hours correctly', () => {
        const dob = new Date('2026-03-01T11:30:00');
        const result = calculateAge(dob, fixedNow);
        expect(result.hours).toBe(24);
        expect(result.days).toBe(1);
    });

    test('calculates 52 hours correctly', () => {
        const dob = new Date('2026-02-28T07:30:00');
        const result = calculateAge(dob, fixedNow);
        expect(result.hours).toBe(52);
        expect(result.days).toBe(2);
    });

    test('calculates 72 hours = 3 days', () => {
        const dob = new Date('2026-02-27T11:30:00');
        const result = calculateAge(dob, fixedNow);
        expect(result.hours).toBe(72);
        expect(result.days).toBe(3);
    });

    test('returns error for future DOB', () => {
        const futureDob = new Date('2030-01-01');
        const result = calculateAge(futureDob, fixedNow);
        expect(result).toHaveProperty('error');
        expect(result.error).toMatch(/future/i);
    });

    test('returns error for invalid date', () => {
        const result = calculateAge(new Date('not-a-date'), fixedNow);
        expect(result).toHaveProperty('error');
    });

    test('returns 0 hours for same-time DOB', () => {
        const result = calculateAge(fixedNow, fixedNow);
        expect(result.hours).toBe(0);
        expect(result.days).toBe(0);
    });

    test('hours is always >= days * 24', () => {
        const dob = new Date('2026-03-01T07:00:00');
        const result = calculateAge(dob, fixedNow);
        expect(result.hours).toBeGreaterThanOrEqual(result.days * 24);
    });

    test('returns an object with hours and days', () => {
        const dob = new Date('2026-03-01T11:30:00');
        const result = calculateAge(dob, fixedNow);
        expect(result).toHaveProperty('hours');
        expect(result).toHaveProperty('days');
    });
});

/* ======================================================================
   3. RISK SCORE CALCULATION COMPONENT TESTS
   ====================================================================== */

describe('Risk Score — computeRiskScore()', () => {
    const baseFormData = {
        yellowing: 'no',
        sclera: 'no',
        prevJaundice: 'no',
        phototherapy: 'no',
        gestAge: '40',
        birthWeight: '3.0',
    };

    test('base score only (no risk factors) at base=1', () => {
        const score = computeRiskScore(baseFormData, 1);
        expect(score).toBe(1.0);
    });

    test('yellowing=yes adds 2.5', () => {
        const score = computeRiskScore({ ...baseFormData, yellowing: 'yes' }, 1);
        expect(score).toBe(3.5);
    });

    test('sclera=yes adds 3.0', () => {
        const score = computeRiskScore({ ...baseFormData, sclera: 'yes' }, 1);
        expect(score).toBe(4.0);
    });

    test('prevJaundice=yes adds 1.5', () => {
        const score = computeRiskScore({ ...baseFormData, prevJaundice: 'yes' }, 1);
        expect(score).toBe(2.5);
    });

    test('phototherapy=yes adds 1.5', () => {
        const score = computeRiskScore({ ...baseFormData, phototherapy: 'yes' }, 1);
        expect(score).toBe(2.5);
    });

    test('preterm gestAge<37 adds 2.5', () => {
        const score = computeRiskScore({ ...baseFormData, gestAge: '34' }, 1);
        expect(score).toBe(3.5);
    });

    test('gestAge=37 does NOT add penalty', () => {
        const score = computeRiskScore({ ...baseFormData, gestAge: '37' }, 1);
        expect(score).toBe(1.0);
    });

    test('birthWeight<2.5 adds 1.5', () => {
        const score = computeRiskScore({ ...baseFormData, birthWeight: '2.0' }, 1);
        expect(score).toBe(2.5);
    });

    test('birthWeight=2.5 does NOT add penalty', () => {
        const score = computeRiskScore({ ...baseFormData, birthWeight: '2.5' }, 1);
        expect(score).toBe(1.0);
    });

    test('all risk factors = clamped to 12', () => {
        const score = computeRiskScore({
            yellowing: 'yes',
            sclera: 'yes',
            prevJaundice: 'yes',
            phototherapy: 'yes',
            gestAge: '32',
            birthWeight: '1.5',
        }, 5);
        expect(score).toBe(12);
    });

    test('score never exceeds 12', () => {
        const score = computeRiskScore({
            yellowing: 'yes', sclera: 'yes',
            prevJaundice: 'yes', phototherapy: 'yes',
            gestAge: '28', birthWeight: '1.0'
        }, 10);
        expect(score).toBeLessThanOrEqual(12);
    });

    test('score is always >= 0', () => {
        const score = computeRiskScore(baseFormData, 0);
        expect(score).toBeGreaterThanOrEqual(0);
    });

    test('empty gestAge string is ignored safely', () => {
        expect(() => computeRiskScore({ ...baseFormData, gestAge: '' }, 1)).not.toThrow();
    });

    test('empty birthWeight string is ignored safely', () => {
        expect(() => computeRiskScore({ ...baseFormData, birthWeight: '' }, 1)).not.toThrow();
    });
});

describe('Risk Score — classifyRiskLevel()', () => {
    test('score 0 → low', () => expect(classifyRiskLevel(0)).toBe('low'));
    test('score 1 → low', () => expect(classifyRiskLevel(1)).toBe('low'));
    test('score 3.9 → low', () => expect(classifyRiskLevel(3.9)).toBe('low'));
    test('score 4.0 → moderate', () => expect(classifyRiskLevel(4.0)).toBe('moderate'));
    test('score 6.2 → moderate', () => expect(classifyRiskLevel(6.2)).toBe('moderate'));
    test('score 7.9 → moderate', () => expect(classifyRiskLevel(7.9)).toBe('moderate'));
    test('score 8.0 → high', () => expect(classifyRiskLevel(8.0)).toBe('high'));
    test('score 9.8 → high', () => expect(classifyRiskLevel(9.8)).toBe('high'));
    test('score 12 → high', () => expect(classifyRiskLevel(12)).toBe('high'));
});

describe('Risk Score — getGuidanceText()', () => {
    test('low risk returns non-empty guidance', () => {
        expect(getGuidanceText('low')).toBeTruthy();
        expect(getGuidanceText('low')).toMatch(/Routine monitoring/i);
    });

    test('moderate risk returns non-empty guidance', () => {
        expect(getGuidanceText('moderate')).toBeTruthy();
        expect(getGuidanceText('moderate')).toMatch(/Rescreen after 24/i);
    });

    test('high risk returns non-empty guidance', () => {
        expect(getGuidanceText('high')).toBeTruthy();
        expect(getGuidanceText('high')).toMatch(/IMMEDIATE REFERRAL/i);
    });

    test('unknown level returns empty string', () => {
        expect(getGuidanceText('unknown')).toBe('');
    });

    test('high guidance recommends phototherapy', () => {
        expect(getGuidanceText('high')).toMatch(/phototherapy/i);
    });

    test('low guidance mentions no immediate intervention', () => {
        expect(getGuidanceText('low')).toMatch(/No immediate intervention/i);
    });
});

describe('Risk Score — getRiskLabel()', () => {
    test('low → "LOW RISK"', () => expect(getRiskLabel('low')).toBe('LOW RISK'));
    test('moderate → "MODERATE RISK"', () => expect(getRiskLabel('moderate')).toBe('MODERATE RISK'));
    test('high → "HIGH RISK"', () => expect(getRiskLabel('high')).toBe('HIGH RISK'));
    test('low badge → "Low Risk"', () => expect(getRiskLabel('low', true)).toBe('Low Risk'));
    test('moderate badge → "Moderate"', () => expect(getRiskLabel('moderate', true)).toBe('Moderate'));
    test('high badge → "High Risk"', () => expect(getRiskLabel('high', true)).toBe('High Risk'));
    test('unknown → empty string', () => expect(getRiskLabel('unknown')).toBe(''));
});

describe('Risk Score — getRiskMeterPercent()', () => {
    test('score 6 / max 12 = 50%', () => {
        expect(getRiskMeterPercent(6, 12)).toBe(50);
    });

    test('score 0 = 0%', () => {
        expect(getRiskMeterPercent(0)).toBe(0);
    });

    test('score 12 = 100%', () => {
        expect(getRiskMeterPercent(12)).toBe(100);
    });

    test('score above max is clamped to 100%', () => {
        expect(getRiskMeterPercent(15, 12)).toBe(100);
    });

    test('negative score is clamped to 0%', () => {
        expect(getRiskMeterPercent(-1)).toBe(0);
    });

    test('score 9.8 is ~81.7%', () => {
        expect(getRiskMeterPercent(9.8)).toBeCloseTo(81.7, 0);
    });
});

/* ======================================================================
   4. HISTORY FILTERING COMPONENT TESTS
   ====================================================================== */

describe('History — filterHistoryRecords()', () => {
    const records = generateMockHistory();

    test('filter=all returns all records', () => {
        expect(filterHistoryRecords(records, 'all')).toHaveLength(records.length);
    });

    test('filter=null returns all records', () => {
        expect(filterHistoryRecords(records, null)).toHaveLength(records.length);
    });

    test('filter=low returns only low-risk records', () => {
        const result = filterHistoryRecords(records, 'low');
        result.forEach(r => expect(r.risk).toBe('low'));
    });

    test('filter=moderate returns only moderate-risk records', () => {
        const result = filterHistoryRecords(records, 'moderate');
        result.forEach(r => expect(r.risk).toBe('moderate'));
    });

    test('filter=high returns only high-risk records', () => {
        const result = filterHistoryRecords(records, 'high');
        result.forEach(r => expect(r.risk).toBe('high'));
    });

    test('count for low + moderate + high = total', () => {
        const low = filterHistoryRecords(records, 'low').length;
        const mod = filterHistoryRecords(records, 'moderate').length;
        const high = filterHistoryRecords(records, 'high').length;
        expect(low + mod + high).toBe(records.length);
    });

    test('filter on empty array returns empty array', () => {
        expect(filterHistoryRecords([], 'low')).toHaveLength(0);
    });

    test('does not mutate original records array', () => {
        const original = [...records];
        filterHistoryRecords(records, 'low');
        expect(records).toHaveLength(original.length);
    });
});

describe('History — sortHistoryByDate()', () => {
    test('returns new array (immutable)', () => {
        const records = generateMockHistory();
        const sorted = sortHistoryByDate(records);
        expect(sorted).not.toBe(records);
    });

    test('original array is not mutated', () => {
        const records = generateMockHistory();
        const first = records[0].id;
        sortHistoryByDate(records);
        expect(records[0].id).toBe(first);
    });

    test('empty array returns empty array', () => {
        expect(sortHistoryByDate([])).toHaveLength(0);
    });
});

describe('History — generateMockHistory()', () => {
    let history;
    beforeEach(() => { history = generateMockHistory(); });

    test('returns 6 records', () => {
        expect(history).toHaveLength(6);
    });

    test('all records have required fields', () => {
        history.forEach(r => {
            expect(r).toHaveProperty('id');
            expect(r).toHaveProperty('name');
            expect(r).toHaveProperty('date');
            expect(r).toHaveProperty('risk');
            expect(r).toHaveProperty('score');
            expect(r).toHaveProperty('guidance');
            expect(r).toHaveProperty('facility');
            expect(r).toHaveProperty('capture');
        });
    });

    test('all risk values are valid', () => {
        history.forEach(r => {
            expect(['low', 'moderate', 'high']).toContain(r.risk);
        });
    });

    test('all scores are in range 0-12', () => {
        history.forEach(r => {
            expect(r.score).toBeGreaterThanOrEqual(0);
            expect(r.score).toBeLessThanOrEqual(12);
        });
    });

    test('contains at least one low, moderate, and high record', () => {
        const risks = history.map(r => r.risk);
        expect(risks).toContain('low');
        expect(risks).toContain('moderate');
        expect(risks).toContain('high');
    });

    test('all IDs are unique', () => {
        const ids = history.map(r => r.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    test('high-risk Baby Preethi has score 9.8', () => {
        const preethi = history.find(r => r.name === 'Baby Preethi');
        expect(preethi).toBeDefined();
        expect(preethi.score).toBe(9.8);
        expect(preethi.risk).toBe('high');
    });
});

/* ======================================================================
   5. SAVE / BUILD RECORD COMPONENT TESTS
   ====================================================================== */

describe('Save Screening — buildScreeningRecord()', () => {
    const baseFormData = {
        babyId: 'BID-TEST-001',
        babyName: 'Baby Test',
        ageHours: 48,
        ageDays: 2,
        gestAge: '38',
        birthWeight: '2.9',
        feedingType: 'Breastfed',
        yellowing: 'yes',
        sclera: 'no',
    };

    const result = { riskLevel: 'moderate', riskScore: 6.2, guidance: GUIDANCE_MAP.moderate };
    const ts = new Date('2026-03-02T11:30:00');

    let record;
    beforeEach(() => {
        record = buildScreeningRecord(baseFormData, result, 'skin', ts);
    });

    test('record has correct ID', () => {
        expect(record.id).toBe('BID-TEST-001');
    });

    test('record has correct name', () => {
        expect(record.name).toBe('Baby Test');
    });

    test('record has correct risk level', () => {
        expect(record.risk).toBe('moderate');
    });

    test('record has correct risk score', () => {
        expect(record.score).toBe(6.2);
    });

    test('record age includes hours', () => {
        expect(record.age).toBe('48h');
    });

    test('record gestAge formatted as wks', () => {
        expect(record.gestAge).toBe('38 wks');
    });

    test('record weight formatted as kg', () => {
        expect(record.weight).toBe('2.9 kg');
    });

    test('yellowing=yes maps to "Yes"', () => {
        expect(record.yellowing).toBe('Yes');
    });

    test('sclera=no maps to "No"', () => {
        expect(record.sclera).toBe('No');
    });

    test('capture skin maps to "Skin"', () => {
        expect(record.capture).toBe('Skin');
    });

    test('capture sclera maps to "Sclera"', () => {
        const r2 = buildScreeningRecord(baseFormData, result, 'sclera', ts);
        expect(r2.capture).toBe('Sclera');
    });

    test('falls back to unnamed when babyName is empty', () => {
        const r2 = buildScreeningRecord({ ...baseFormData, babyName: '' }, result, 'skin', ts);
        expect(r2.name).toBe('Baby (unnamed)');
    });

    test('falls back to BID timestamp when babyId empty', () => {
        const r2 = buildScreeningRecord({ ...baseFormData, babyId: '' }, result, 'skin', ts);
        expect(r2.id).toMatch(/^BID-/);
    });

    test('guidance is stored correctly', () => {
        expect(record.guidance).toBe(GUIDANCE_MAP.moderate);
    });

    test('facility is always PHC Madurai Central', () => {
        expect(record.facility).toBe('PHC Madurai Central');
    });

    test('ageHours=null → age is —', () => {
        const r2 = buildScreeningRecord({ ...baseFormData, ageHours: null }, result, 'skin', ts);
        expect(r2.age).toBe('—');
    });

    test('missing gestAge → gestAge is —', () => {
        const r2 = buildScreeningRecord({ ...baseFormData, gestAge: '' }, result, 'skin', ts);
        expect(r2.gestAge).toBe('—');
    });
});

describe('Save Screening — prependHistory()', () => {
    test('adds record to front of empty array', () => {
        const result = prependHistory([], { id: 'x' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('x');
    });

    test('new record is at index 0', () => {
        const history = [{ id: 'old' }];
        const result = prependHistory(history, { id: 'new' });
        expect(result[0].id).toBe('new');
    });

    test('does not mutate original array', () => {
        const history = [{ id: 'old' }];
        prependHistory(history, { id: 'new' });
        expect(history).toHaveLength(1);
        expect(history[0].id).toBe('old');
    });

    test('total length increases by 1', () => {
        const history = generateMockHistory();
        const result = prependHistory(history, { id: 'new' });
        expect(result).toHaveLength(history.length + 1);
    });
});

/* ======================================================================
   6. FORM VALIDATION COMPONENT TESTS
   ====================================================================== */

describe('Form Validation — validateFormData()', () => {
    const validFormData = {
        babyId: 'BID-001',
        dob: '2026-03-01',
        ageHours: 24,
        gestAge: '38',
        birthWeight: '3.0',
        deliveryType: 'Normal',
        feedingType: 'Breastfed',
        motherBlood: 'O+',
        babyBlood: 'A+',
    };

    test('valid form data passes', () => {
        const { valid } = validateFormData(validFormData);
        expect(valid).toBe(true);
    });

    test('missing babyId fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, babyId: '' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('Baby ID'))).toBe(true);
    });

    test('missing both dob and ageHours fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, dob: undefined, ageHours: null });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('age') || e.includes('Date'))).toBe(true);
    });

    test('gestAge below 22 fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, gestAge: '20' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('Gestational age'))).toBe(true);
    });

    test('gestAge above 44 fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, gestAge: '46' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('Gestational age'))).toBe(true);
    });

    test('gestAge 22 is valid', () => {
        const { valid } = validateFormData({ ...validFormData, gestAge: '22' });
        expect(valid).toBe(true);
    });

    test('gestAge 44 is valid', () => {
        const { valid } = validateFormData({ ...validFormData, gestAge: '44' });
        expect(valid).toBe(true);
    });

    test('birthWeight <= 0 fails', () => {
        const { valid } = validateFormData({ ...validFormData, birthWeight: '0' });
        expect(valid).toBe(false);
    });

    test('birthWeight > 6 fails', () => {
        const { valid } = validateFormData({ ...validFormData, birthWeight: '7' });
        expect(valid).toBe(false);
    });

    test('invalid deliveryType fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, deliveryType: 'Robot' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('delivery'))).toBe(true);
    });

    test('invalid feedingType fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, feedingType: 'IV' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('feeding'))).toBe(true);
    });

    test('invalid motherBlood fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, motherBlood: 'Z+' });
        expect(valid).toBe(false);
        expect(errors.some(e => e.includes('blood'))).toBe(true);
    });

    test('invalid babyBlood fails', () => {
        const { valid, errors } = validateFormData({ ...validFormData, babyBlood: 'Z-' });
        expect(valid).toBe(false);
    });

    test('empty motherBlood/babyBlood is allowed (optional)', () => {
        const { valid } = validateFormData({ ...validFormData, motherBlood: '', babyBlood: '' });
        expect(valid).toBe(true);
    });

    test('all valid delivery types are accepted', () => {
        DELIVERY_TYPES.forEach(type => {
            const { valid } = validateFormData({ ...validFormData, deliveryType: type });
            expect(valid).toBe(true);
        });
    });

    test('all valid feeding types are accepted', () => {
        FEEDING_TYPES.forEach(type => {
            const { valid } = validateFormData({ ...validFormData, feedingType: type });
            expect(valid).toBe(true);
        });
    });

    test('all valid blood groups are accepted', () => {
        BLOOD_GROUPS.forEach(bg => {
            const { valid } = validateFormData({ ...validFormData, motherBlood: bg, babyBlood: bg });
            expect(valid).toBe(true);
        });
    });
});

/* ======================================================================
   7. YES/NO TOGGLE COMPONENT TESTS
   ====================================================================== */

describe('Yes/No Toggles — resolveYesNoKey()', () => {
    test('yellowing → yellowing', () => {
        expect(resolveYesNoKey('yellowing')).toBe('yellowing');
    });

    test('sclera → sclera', () => {
        expect(resolveYesNoKey('sclera')).toBe('sclera');
    });

    test('prev-jaundice → prevJaundice', () => {
        expect(resolveYesNoKey('prev-jaundice')).toBe('prevJaundice');
    });

    test('phototherapy → phototherapy', () => {
        expect(resolveYesNoKey('phototherapy')).toBe('phototherapy');
    });

    test('unknown returns null', () => {
        expect(resolveYesNoKey('blood-type')).toBeNull();
    });

    test('empty string returns null', () => {
        expect(resolveYesNoKey('')).toBeNull();
    });
});

describe('Yes/No Toggles — applyYesNoToggle()', () => {
    const base = { yellowing: 'no', sclera: 'no', prevJaundice: 'no', phototherapy: 'no' };

    test('sets yellowing to yes', () => {
        const result = applyYesNoToggle(base, 'yellowing', 'yes');
        expect(result.yellowing).toBe('yes');
    });

    test('sets sclera to yes', () => {
        const result = applyYesNoToggle(base, 'sclera', 'yes');
        expect(result.sclera).toBe('yes');
    });

    test('sets prevJaundice via "prev-jaundice" key', () => {
        const result = applyYesNoToggle(base, 'prev-jaundice', 'yes');
        expect(result.prevJaundice).toBe('yes');
    });

    test('sets phototherapy to no', () => {
        const fd = { ...base, phototherapy: 'yes' };
        const result = applyYesNoToggle(fd, 'phototherapy', 'no');
        expect(result.phototherapy).toBe('no');
    });

    test('does not mutate original formData', () => {
        const original = { ...base };
        applyYesNoToggle(original, 'yellowing', 'yes');
        expect(original.yellowing).toBe('no');
    });

    test('unknown toggle ID returns original formData unchanged', () => {
        const result = applyYesNoToggle(base, 'unknown-field', 'yes');
        expect(result).toEqual(base);
    });
});

/* ======================================================================
   8. CAPTURE TYPE COMPONENT TESTS
   ====================================================================== */

describe('Capture Type — isValidCaptureType()', () => {
    test('"skin" is valid', () => expect(isValidCaptureType('skin')).toBe(true));
    test('"sclera" is valid', () => expect(isValidCaptureType('sclera')).toBe(true));
    test('"eye" is invalid', () => expect(isValidCaptureType('eye')).toBe(false));
    test('empty string is invalid', () => expect(isValidCaptureType('')).toBe(false));
    test('null is invalid', () => expect(isValidCaptureType(null)).toBe(false));
    test('"SKIN" (uppercase) is invalid (case-sensitive)', () => {
        expect(isValidCaptureType('SKIN')).toBe(false);
    });
});

describe('Capture Type — getCaptureTypeLabel()', () => {
    test('"skin" → "Skin"', () => expect(getCaptureTypeLabel('skin')).toBe('Skin'));
    test('"sclera" → "Sclera"', () => expect(getCaptureTypeLabel('sclera')).toBe('Sclera'));
    test('unknown → "Unknown"', () => expect(getCaptureTypeLabel('xyz')).toBe('Unknown'));
});

/* ======================================================================
   9. TIMESTAMP UTILITY COMPONENT TESTS
   ====================================================================== */

describe('Timestamp — formatTimestamp()', () => {
    test('returns a non-empty string', () => {
        expect(formatTimestamp(new Date())).toBeTruthy();
        expect(typeof formatTimestamp(new Date())).toBe('string');
    });

    test('contains year 2026 for a 2026 date', () => {
        const d = new Date('2026-03-02T11:30:00');
        expect(formatTimestamp(d)).toMatch('2026');
    });

    test('contains "Mar" for March', () => {
        const d = new Date('2026-03-02T11:30:00');
        expect(formatTimestamp(d)).toMatch(/Mar/i);
    });

    test('contains a colon (HH:MM format)', () => {
        expect(formatTimestamp(new Date())).toMatch(/:/);
    });
});

describe('Timestamp — parseTimestamp()', () => {
    test('returns null for invalid string', () => {
        expect(parseTimestamp('not-a-date')).toBeNull();
    });

    test('returns null for empty string', () => {
        expect(parseTimestamp('')).toBeNull();
    });

    test('returns a Date for valid ISO string', () => {
        const result = parseTimestamp('2026-03-02T11:30:00');
        expect(result).toBeInstanceOf(Date);
    });
});

/* ======================================================================
   10. PROCESSING STEPS COMPONENT TESTS
   ====================================================================== */

describe('Processing Steps — constants & helpers', () => {
    test('PROCESSING_STEPS has 4 steps', () => {
        expect(PROCESSING_STEPS).toHaveLength(4);
    });

    test('each step has id, label, percent fields', () => {
        PROCESSING_STEPS.forEach(step => {
            expect(step).toHaveProperty('id');
            expect(step).toHaveProperty('label');
            expect(step).toHaveProperty('percent');
        });
    });

    test('first step percent is 20', () => {
        expect(PROCESSING_STEPS[0].percent).toBe(20);
    });

    test('last step percent is 100', () => {
        expect(PROCESSING_STEPS[PROCESSING_STEPS.length - 1].percent).toBe(100);
    });

    test('percent values are monotonically increasing', () => {
        for (let i = 1; i < PROCESSING_STEPS.length; i++) {
            expect(PROCESSING_STEPS[i].percent).toBeGreaterThan(PROCESSING_STEPS[i - 1].percent);
        }
    });

    test('getProcessingStep(0) returns first step', () => {
        expect(getProcessingStep(0)).toEqual(PROCESSING_STEPS[0]);
    });

    test('getProcessingStep(3) returns last step', () => {
        expect(getProcessingStep(3)).toEqual(PROCESSING_STEPS[3]);
    });

    test('getProcessingStep(99) returns null', () => {
        expect(getProcessingStep(99)).toBeNull();
    });

    test('getProcessingStepCount() returns 4', () => {
        expect(getProcessingStepCount()).toBe(4);
    });

    test('all step IDs follow ps-N pattern', () => {
        PROCESSING_STEPS.forEach((step, i) => {
            expect(step.id).toBe(`ps-${i + 1}`);
        });
    });

    test('step labels are descriptive (non-empty)', () => {
        PROCESSING_STEPS.forEach(step => {
            expect(step.label.length).toBeGreaterThan(5);
        });
    });
});

/* ======================================================================
   11. CONSTANTS INTEGRITY TESTS
   ====================================================================== */

describe('Constants — BLOOD_GROUPS', () => {
    test('contains 8 blood groups', () => {
        expect(BLOOD_GROUPS).toHaveLength(8);
    });

    test('includes O+ and O-', () => {
        expect(BLOOD_GROUPS).toContain('O+');
        expect(BLOOD_GROUPS).toContain('O-');
    });

    test('includes AB+ and AB-', () => {
        expect(BLOOD_GROUPS).toContain('AB+');
        expect(BLOOD_GROUPS).toContain('AB-');
    });

    test('all groups have + or - suffix', () => {
        BLOOD_GROUPS.forEach(bg => {
            expect(bg).toMatch(/[+-]$/);
        });
    });
});

describe('Constants — DELIVERY_TYPES', () => {
    test('contains Normal and C-Section', () => {
        expect(DELIVERY_TYPES).toContain('Normal');
        expect(DELIVERY_TYPES).toContain('C-Section');
    });

    test('has exactly 2 options', () => {
        expect(DELIVERY_TYPES).toHaveLength(2);
    });
});

describe('Constants — FEEDING_TYPES', () => {
    test('contains Breastfed, Formula, Mixed', () => {
        expect(FEEDING_TYPES).toContain('Breastfed');
        expect(FEEDING_TYPES).toContain('Formula');
        expect(FEEDING_TYPES).toContain('Mixed');
    });

    test('has exactly 3 options', () => {
        expect(FEEDING_TYPES).toHaveLength(3);
    });
});

describe('Constants — GUIDANCE_MAP', () => {
    test('has entries for low, moderate, high', () => {
        expect(GUIDANCE_MAP).toHaveProperty('low');
        expect(GUIDANCE_MAP).toHaveProperty('moderate');
        expect(GUIDANCE_MAP).toHaveProperty('high');
    });

    test('all guidances are strings', () => {
        Object.values(GUIDANCE_MAP).forEach(v => {
            expect(typeof v).toBe('string');
            expect(v.length).toBeGreaterThan(10);
        });
    });
});

/* ======================================================================
   12. INTEGRATION-STYLE TESTS (Pure Logic Pipelines)
   ====================================================================== */

describe('Integration — Full Screening Pipeline', () => {
    test('moderate-risk patient produces correct classification chain', () => {
        const formData = {
            yellowing: 'yes',
            sclera: 'no',
            prevJaundice: 'no',
            phototherapy: 'no',
            gestAge: '38',
            birthWeight: '2.9',
        };

        const score = computeRiskScore(formData, 2.0); // base=2.0, +2.5=4.5
        const level = classifyRiskLevel(score);
        const guid = getGuidanceText(level);
        const label = getRiskLabel(level);
        const pct = getRiskMeterPercent(score);

        expect(score).toBe(4.5);
        expect(level).toBe('moderate');
        expect(guid).toMatch(/Rescreen/i);
        expect(label).toBe('MODERATE RISK');
        expect(pct).toBeCloseTo(37.5, 0);
    });

    test('full pipeline: high-risk preterm baby → referral guidance', () => {
        const formData = {
            yellowing: 'yes',
            sclera: 'yes',
            prevJaundice: 'yes',
            phototherapy: 'no',
            gestAge: '33',
            birthWeight: '1.8',
        };

        const score = computeRiskScore(formData, 1.0); // 1+2.5+3+1.5+2.5+1.5=12
        const level = classifyRiskLevel(score);
        const guid = getGuidanceText(level);

        expect(score).toBe(12);
        expect(level).toBe('high');
        expect(guid).toMatch(/IMMEDIATE REFERRAL/);
    });

    test('buildScreeningRecord → prependHistory pipeline', () => {
        const formData = {
            babyId: 'BID-TEST-999',
            babyName: 'Baby Pipelinetest',
            ageHours: 36,
            gestAge: '39',
            birthWeight: '3.0',
            feedingType: 'Formula',
            yellowing: 'no',
            sclera: 'no',
        };
        const result = { riskLevel: 'low', riskScore: 2.5, guidance: GUIDANCE_MAP.low };
        const history = generateMockHistory();
        const record = buildScreeningRecord(formData, result, 'skin', new Date());
        const updated = prependHistory(history, record);

        expect(updated[0].id).toBe('BID-TEST-999');
        expect(updated[0].risk).toBe('low');
        expect(updated).toHaveLength(history.length + 1);
    });

    test('save + filter history pipeline', () => {
        const newRecord = {
            id: 'BID-NEW',
            name: 'Baby New',
            date: '02 Mar 2026, 11:30',
            risk: 'high',
            score: 10.5,
            age: '12h',
            gestAge: '32 wks',
            weight: '1.6 kg',
            feeding: 'Formula',
            yellowing: 'Yes',
            sclera: 'Yes',
            facility: 'PHC Madurai Central',
            guidance: GUIDANCE_MAP.high,
            capture: 'Sclera',
        };

        const history = generateMockHistory();
        const updated = prependHistory(history, newRecord);
        const highRecords = filterHistoryRecords(updated, 'high');

        // Should include Baby Preethi + Baby New
        expect(highRecords.length).toBeGreaterThanOrEqual(2);
        expect(highRecords.some(r => r.id === 'BID-NEW')).toBe(true);
    });
});
