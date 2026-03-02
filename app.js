/* ====================================================
   NeoJaundice — Application Logic
   ==================================================== */

// ─── Application State ───────────────────────────────
const AppState = {
  currentScreen: 'screen-home',
  prevScreen: null,
  formData: {
    babyId: '',
    babyName: '',
    dob: '',
    ageHours: null,
    ageDays: null,
    gestAge: '',
    birthWeight: '',
    deliveryType: 'Normal',
    feedingType: 'Breastfed',
    yellowing: 'no',
    sclera: 'no',
    prevJaundice: 'no',
    phototherapy: 'no',
    motherBlood: '',
    babyBlood: '',
  },
  captureType: 'skin',
  result: {
    riskLevel: 'moderate',
    riskScore: 6.2,
    guidance: ''
  },
  history: generateMockHistory(),
  currentDetailRecord: null,
};

// ─── Mock History Data ───────────────────────────────
function generateMockHistory() {
  const records = [
    { id: 'BID-20260302-001', name: 'Baby Lakshmi', date: '02 Mar 2026, 09:22', risk: 'moderate', score: 6.2, age: '52h', gestAge: '38 wks', weight: '2.8 kg', feeding: 'Breastfed', yellowing: 'Yes', sclera: 'No', facility: 'PHC Madurai Central', guidance: 'Rescreen after 24 hours. Monitor bilirubin levels closely. Ensure adequate feeding and hydration.', capture: 'Skin' },
    { id: 'BID-20260302-002', name: 'Baby Rajan', date: '02 Mar 2026, 08:45', risk: 'low', score: 2.1, age: '36h', gestAge: '40 wks', weight: '3.1 kg', feeding: 'Breastfed', yellowing: 'No', sclera: 'No', facility: 'PHC Madurai Central', guidance: 'Routine monitoring. Reassess in 48 hours. Ensure adequate breastfeeding.', capture: 'Skin' },
    { id: 'BID-20260301-009', name: 'Baby Preethi', date: '01 Mar 2026, 16:30', risk: 'high', score: 9.8, age: '24h', gestAge: '34 wks', weight: '1.9 kg', feeding: 'Formula', yellowing: 'Yes', sclera: 'Yes', facility: 'PHC Madurai Central', guidance: 'IMMEDIATE REFERRAL REQUIRED. Initiate phototherapy protocols. Contact specialist team immediately.', capture: 'Sclera' },
    { id: 'BID-20260301-008', name: 'Baby Kumar', date: '01 Mar 2026, 14:12', risk: 'low', score: 1.5, age: '48h', gestAge: '39 wks', weight: '3.3 kg', feeding: 'Mixed', yellowing: 'No', sclera: 'No', facility: 'PHC Madurai Central', guidance: 'Routine monitoring. Reassess in 48 hours.', capture: 'Skin' },
    { id: 'BID-20260301-007', name: 'Baby Divya', date: '01 Mar 2026, 10:05', risk: 'moderate', score: 5.4, age: '60h', gestAge: '37 wks', weight: '2.6 kg', feeding: 'Breastfed', yellowing: 'Yes', sclera: 'No', facility: 'PHC Madurai Central', guidance: 'Rescreen after 24 hours. Maintain feeding schedule. Bilirubin monitoring advised.', capture: 'Skin' },
    { id: 'BID-20260228-015', name: 'Baby Sanjay', date: '28 Feb 2026, 11:20', risk: 'low', score: 3.0, age: '72h', gestAge: '41 wks', weight: '3.5 kg', feeding: 'Breastfed', yellowing: 'No', sclera: 'No', facility: 'PHC Madurai Central', guidance: 'Routine monitoring. Physiological jaundice expected to resolve.', capture: 'Skin' },
  ];
  return records;
}

// ─── Navigation ──────────────────────────────────────
function navigate(targetId) {
  const currentEl = document.getElementById(AppState.currentScreen);
  const targetEl = document.getElementById(targetId);
  if (!targetEl || AppState.currentScreen === targetId) return;

  // Determine direction
  const isForward = isForwardNavigation(AppState.currentScreen, targetId);

  if (isForward) {
    currentEl.classList.add('exit-left');
    currentEl.classList.remove('active');
    targetEl.style.transform = 'translateX(100%)';
    targetEl.classList.add('active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetEl.style.transform = 'translateX(0)';
      });
    });
  } else {
    // Going back
    currentEl.style.transform = 'translateX(100%)';
    currentEl.classList.remove('active');
    currentEl.classList.remove('exit-left');
    targetEl.classList.remove('exit-left');
    targetEl.style.transform = '';
    targetEl.classList.add('active');
  }

  setTimeout(() => {
    currentEl.style.transform = '';
    currentEl.classList.remove('exit-left', 'active');
  }, 380);

  AppState.prevScreen = AppState.currentScreen;
  AppState.currentScreen = targetId;

  // On arrival hooks
  if (targetId === 'screen-history') renderHistory();
}

const screenOrder = [
  'screen-home',
  'screen-details',
  'screen-capture',
  'screen-processing',
  'screen-result',
  'screen-history',
  'screen-detail-view',
  'screen-help'
];

function isForwardNavigation(from, to) {
  return screenOrder.indexOf(to) > screenOrder.indexOf(from);
}

// ─── Age Calculation ─────────────────────────────────
function calcAge() {
  const dobEl = document.getElementById('dob');
  if (!dobEl.value) return;

  const dob = new Date(dobEl.value);
  const now = new Date();
  const diffMs = now - dob;
  if (diffMs < 0) {
    document.getElementById('age-hours').value = '--';
    document.getElementById('age-days').value = '--';
    return;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  document.getElementById('age-hours').value = hours;
  document.getElementById('age-days').value = days;

  AppState.formData.ageHours = hours;
  AppState.formData.ageDays = days;
}

// ─── Toggle Selectors ────────────────────────────────
function selectToggle(groupId, btn) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (groupId === 'delivery-type') AppState.formData.deliveryType = btn.dataset.val;
  if (groupId === 'feeding-type') AppState.formData.feedingType = btn.dataset.val;
}

// ─── Yes/No Toggles ──────────────────────────────────
function setYesNo(btn) {
  const id = btn.dataset.id;
  const parent = btn.parentElement;
  parent.querySelectorAll('.yn-btn').forEach(b => {
    b.classList.remove('active-yes', 'active-no');
  });

  if (btn.dataset.val === 'yes') {
    btn.classList.add('active-yes');
    parent.querySelector('[data-val="no"]').classList.add('active-no');
  } else {
    btn.classList.add('active-no');
    parent.querySelector('[data-val="yes"]').classList.remove('active-yes');
  }

  // Save to state
  const keyMap = {
    'yellowing': 'yellowing',
    'sclera': 'sclera',
    'prev-jaundice': 'prevJaundice',
    'phototherapy': 'phototherapy'
  };
  if (keyMap[id]) AppState.formData[keyMap[id]] = btn.dataset.val;
}

// ─── Capture Type Selection ───────────────────────────
function selectCaptureType(type) {
  AppState.captureType = type;
  document.getElementById('ct-skin').classList.toggle('active', type === 'skin');
  document.getElementById('ct-sclera').classList.toggle('active', type === 'sclera');
}

// ─── Proceed to Capture ──────────────────────────────
function proceedToCapture() {
  // Collect form data
  AppState.formData.babyId = document.getElementById('baby-id').value || 'BID-' + Date.now();
  AppState.formData.babyName = document.getElementById('baby-name').value;
  AppState.formData.gestAge = document.getElementById('gest-age').value;
  AppState.formData.birthWeight = document.getElementById('birth-weight').value;
  AppState.formData.motherBlood = document.getElementById('mother-blood').value;
  AppState.formData.babyBlood = document.getElementById('baby-blood').value;

  navigate('screen-capture');
}

// ─── Image Capture ───────────────────────────────────
function captureImage() {
  const captureBtn = document.getElementById('capture-btn');
  const retakeBtn = document.getElementById('retake-btn');

  captureBtn.style.transform = 'scale(0.9)';
  setTimeout(() => { captureBtn.style.transform = ''; }, 150);

  // Flash effect
  const preview = document.getElementById('camera-preview');
  preview.style.background = '#FFFFFF';
  setTimeout(() => {
    preview.style.background = 'linear-gradient(170deg, #0C1C2E 0%, #152840 100%)';
    retakeBtn.disabled = false;
    retakeBtn.style.opacity = '1';
    showToast('Image captured successfully');

    // Auto-navigate to processing after short delay
    setTimeout(() => startProcessing(), 800);
  }, 200);
}

// ─── Processing Animation ────────────────────────────
function startProcessing() {
  navigate('screen-processing');

  const steps = ['ps-1', 'ps-2', 'ps-3', 'ps-4'];
  const percents = [20, 45, 72, 100];
  const bar = document.getElementById('proc-bar');

  // Reset
  steps.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active', 'done');
    const icon = el.querySelector('.proc-icon');
    icon.className = 'proc-icon pending';
  });
  bar.style.width = '0%';

  let i = 0;
  function runStep() {
    if (i >= steps.length) {
      // All done — navigate to result
      setTimeout(() => {
        generateResult();
        navigate('screen-result');
      }, 600);
      return;
    }

    const stepEl = document.getElementById(steps[i]);
    stepEl.classList.add('active');
    const icon = stepEl.querySelector('.proc-icon');
    icon.className = 'proc-icon processing';
    bar.style.width = percents[i] + '%';

    setTimeout(() => {
      stepEl.classList.remove('active');
      stepEl.classList.add('done');
      icon.className = 'proc-icon complete';
      i++;
      setTimeout(runStep, 300);
    }, 900 + Math.random() * 400);
  }

  runStep();
}

// ─── Result Generation ───────────────────────────────
const GUIDANCE_MAP = {
  low: 'Routine monitoring. Reassess in 48 hours. Ensure adequate breastfeeding and hydration. No immediate intervention required.',
  moderate: 'Rescreen after 24 hours. Monitor bilirubin levels closely. Ensure adequate feeding and hydration. Follow up with attending physician.',
  high: 'IMMEDIATE REFERRAL REQUIRED. Initiate phototherapy protocols. Contact specialist team and transfer to neonatal unit without delay.'
};

function generateResult() {
  const fd = AppState.formData;

  // Compute risk score based on indicators
  let score = Math.random() * 4 + 1;
  if (fd.yellowing === 'yes') score += 2.5;
  if (fd.sclera === 'yes') score += 3.0;
  if (fd.prevJaundice === 'yes') score += 1.5;
  if (fd.phototherapy === 'yes') score += 1.5;
  if (fd.gestAge && parseInt(fd.gestAge) < 37) score += 2.5;
  if (fd.birthWeight && parseFloat(fd.birthWeight) < 2.5) score += 1.5;
  score = Math.min(score, 12);

  let riskLevel = score < 4 ? 'low' : score < 8 ? 'moderate' : 'high';

  AppState.result = {
    riskLevel,
    riskScore: parseFloat(score.toFixed(1)),
    guidance: GUIDANCE_MAP[riskLevel]
  };

  renderResult();
}

function renderResult() {
  const { riskLevel, riskScore, guidance } = AppState.result;
  const fd = AppState.formData;

  // Banner
  const banner = document.getElementById('risk-banner');
  banner.className = 'risk-banner ' + riskLevel;

  const riskLabels = { low: 'LOW RISK', moderate: 'MODERATE RISK', high: 'HIGH RISK' };
  document.getElementById('risk-level-text').textContent = riskLabels[riskLevel];
  document.getElementById('risk-score-badge').textContent = riskScore;

  // Risk icons
  const bannerIcon = banner.querySelector('.risk-icon-wrap svg');
  if (riskLevel === 'low') {
    bannerIcon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
  } else if (riskLevel === 'moderate') {
    bannerIcon.innerHTML = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
  } else {
    bannerIcon.innerHTML = '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
  }

  // Meter
  const pct = (riskScore / 12) * 100;
  document.getElementById('risk-meter-thumb').style.left = pct + '%';
  const thumbColors = { low: 'var(--green-500)', moderate: 'var(--amber-500)', high: 'var(--red-500)' };
  document.getElementById('risk-meter-thumb').style.borderColor = thumbColors[riskLevel];

  // Timestamp
  document.getElementById('result-timestamp').textContent = formatTimestamp(new Date());

  // Capture type tag
  document.getElementById('capture-type-tag').textContent = AppState.captureType === 'skin' ? 'Skin' : 'Sclera';

  // Clinical context
  document.getElementById('res-age').textContent = fd.ageHours ? fd.ageHours + 'h / ' + fd.ageDays + 'd' : '—';
  document.getElementById('res-gest').textContent = fd.gestAge ? fd.gestAge + ' weeks' : '—';
  document.getElementById('res-weight').textContent = fd.birthWeight ? fd.birthWeight + ' kg' : '—';
  document.getElementById('res-feeding').textContent = fd.feedingType || '—';
  document.getElementById('res-yellowing').textContent = fd.yellowing === 'yes' ? 'Yes' : 'No';
  document.getElementById('res-sclera').textContent = fd.sclera === 'yes' ? 'Yes' : 'No';

  // Guidance
  const guidanceCard = document.getElementById('guidance-card');
  guidanceCard.className = 'guidance-card ' + (riskLevel === 'low' ? 'low-guidance' : riskLevel === 'high' ? 'high-guidance' : '');
  const guidanceHeader = guidanceCard.querySelector('.guidance-header');
  guidanceHeader.innerHTML = (riskLevel !== 'low'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  ) + 'Screening Guidance';
  document.getElementById('guidance-text').textContent = guidance;
}

// ─── Save Screening ───────────────────────────────────
function saveScreening() {
  const fd = AppState.formData;
  const { riskLevel, riskScore, guidance } = AppState.result;

  const record = {
    id: fd.babyId || 'BID-' + Date.now(),
    name: fd.babyName || 'Baby (unnamed)',
    date: formatTimestamp(new Date()),
    risk: riskLevel,
    score: riskScore,
    age: fd.ageHours ? fd.ageHours + 'h' : '—',
    gestAge: fd.gestAge ? fd.gestAge + ' wks' : '—',
    weight: fd.birthWeight ? fd.birthWeight + ' kg' : '—',
    feeding: fd.feedingType,
    yellowing: fd.yellowing === 'yes' ? 'Yes' : 'No',
    sclera: fd.sclera === 'yes' ? 'Yes' : 'No',
    facility: 'PHC Madurai Central',
    guidance: guidance,
    capture: AppState.captureType === 'skin' ? 'Skin' : 'Sclera',
  };

  AppState.history.unshift(record);
  showToast('✓ Screening saved to history');
  setTimeout(() => navigate('screen-home'), 1200);
}

// ─── History ─────────────────────────────────────────
let currentFilter = 'all';

function renderHistory(filter) {
  if (filter) currentFilter = filter;
  const list = document.getElementById('history-list');
  const records = currentFilter === 'all'
    ? AppState.history
    : AppState.history.filter(r => r.risk === currentFilter);

  list.innerHTML = '';

  if (records.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--gray-400);padding:40px 20px;font-size:14px;font-weight:500;">No records found</div>';
    return;
  }

  records.forEach(rec => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.onclick = () => showDetail(rec);

    const riskLabels = { low: 'Low Risk', moderate: 'Moderate', high: 'High Risk' };

    div.innerHTML = `
      <span class="history-risk-dot ${rec.risk}"></span>
      <div class="history-item-info">
        <div class="history-item-id">${rec.id}</div>
        <div class="history-item-meta">${rec.name} &bull; ${rec.date} &bull; ${rec.age}</div>
      </div>
      <span class="risk-badge ${rec.risk}">${riskLabels[rec.risk]}</span>
      <svg class="history-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;
    list.appendChild(div);
  });
}

function filterHistory(type, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderHistory(type);
}

// ─── Show Detail ──────────────────────────────────────
function showDetail(record) {
  AppState.currentDetailRecord = record;

  const riskMap = { low: 'LOW RISK', moderate: 'MODERATE RISK', high: 'HIGH RISK' };
  const banner = document.getElementById('detail-risk-banner');
  banner.className = 'risk-banner ' + record.risk;
  document.getElementById('detail-risk-text').textContent = riskMap[record.risk];
  document.getElementById('detail-risk-badge').textContent = record.score;
  document.getElementById('detail-capture-type').textContent = record.capture;
  document.getElementById('detail-timestamp').textContent = record.date;
  document.getElementById('detail-facility').textContent = record.facility;

  const fields = [
    ['ID', record.id],
    ['Name', record.name],
    ['Date', record.date],
    ['Age', record.age],
    ['Gestational Age', record.gestAge],
    ['Birth Weight', record.weight],
    ['Feeding Type', record.feeding],
    ['Yellowing Observed', record.yellowing],
    ['Sclera Yellowing', record.sclera],
    ['Capture Type', record.capture],
    ['Risk Score', record.score + ' / 12'],
  ];

  const detailGrid = document.getElementById('detail-full-info');
  detailGrid.innerHTML = fields.map(([label, val]) => `
    <div class="detail-row"><span>${label}</span><span>${val}</span></div>
  `).join('');

  const gc = document.getElementById('detail-guidance-card');
  gc.className = 'guidance-card ' + (record.risk === 'high' ? 'high-guidance' : record.risk === 'low' ? 'low-guidance' : '');
  document.getElementById('detail-guidance-text').textContent = record.guidance;

  navigate('screen-detail-view');
}

// ─── Help Accordions ─────────────────────────────────
function toggleAccordion(headerEl) {
  const content = headerEl.nextElementSibling;
  const isOpen = content.classList.contains('open');

  // Close all
  document.querySelectorAll('.help-content').forEach(c => {
    c.classList.remove('open');
    c.style.maxHeight = '';
  });
  document.querySelectorAll('.help-accordion').forEach(h => h.classList.remove('open'));

  if (!isOpen) {
    content.classList.add('open');
    headerEl.classList.add('open');
  }
}

// ─── Toggle Search (stub) ─────────────────────────────
function toggleSearch() {
  showToast('Search feature coming soon');
}

// ─── Toast Notification ──────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Utility ─────────────────────────────────────────
function formatTimestamp(date) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) + ', ' + date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
}

// ─── Init ─────────────────────────────────────────────
(function init() {
  // Set default DOB for easy demo
  const now = new Date();
  now.setHours(now.getHours() - 52);
  const isoStr = now.toISOString().slice(0, 16);
  const dobEl = document.getElementById('dob');
  if (dobEl) {
    dobEl.value = isoStr;
    calcAge();
  }

  // Pre-fill demo data
  const babyIdEl = document.getElementById('baby-id');
  if (babyIdEl) babyIdEl.value = 'BID-20260302-007';

  // Animate stats on load
  setTimeout(() => {
    document.querySelectorAll('.stat-number').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'all 0.4s ease ' + (i * 0.1) + 's';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }, 200);

  console.log('NeoJaundice v2.4 initialized');
})();
