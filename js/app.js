// ============================================================================
// FITMATE (KHỎE CÙNG BẠN) - RESPONSIVE MULTI-PLATFORM CONTROLLER
// - User App: Native Mobile App UI (iOS HealthKit / Android Health Connect)
// - PT App: Native Mobile App UI for Freelance Trainers
// - Admin Web: Full Responsive Web Portal for Operations & RAG Governance
// ============================================================================

const state = JSON.parse(JSON.stringify(window.FITMATE_INITIAL_STATE));
state.mobileOs = 'iOS'; // 'iOS' (Apple HealthKit) | 'Android' (Google Health Connect)
let selectedFoodId = 'VN-01';
let selectedPortionIdx = 1;
let selectedMealTime = 'Bữa tối';
let activePlanDayIdx = 1;

// Toast Notification Utility
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    warning: 'bg-amber-600 text-white border-amber-500',
    danger: 'bg-rose-600 text-white border-rose-500',
    info: 'bg-sky-600 text-white border-sky-500'
  };
  el.className = `px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 transition-all duration-300 ${colors[type] || colors.success}`;
  el.innerHTML = `<span>✨</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// Computed Totals for Today's Nutrition
function getTodayNutritionTotals() {
  return state.foodLogsToday.reduce(
    (acc, item) => {
      acc.cal += item.cal;
      acc.p += item.p;
      acc.c += item.c;
      acc.f += item.f;
      return acc;
    },
    { cal: 0, p: 0, c: 0, f: 0 }
  );
}

// Recalculate BMR & TDEE (Mifflin-St Jeor) - UC-02 & UC-07
function recalculateBmrTdee() {
  const u = state.userProfile;
  const s = u.gender === 'Nam' ? 5 : -161;
  const bmr = Math.round(10 * u.weightKg + 6.25 * u.heightCm - 5 * u.age + s);
  const tdee = Math.round(bmr * u.activityLevel);
  let targetCal = tdee;
  if (u.goalType.includes('Giảm cân')) targetCal = tdee - 400;
  else if (u.goalType.includes('Tăng cơ')) targetCal = tdee + 300;

  u.bmr = bmr;
  u.tdee = tdee;
  u.targetCalorie = targetCal;
  u.targetProtein = Math.round(u.weightKg * 2.0);
  u.targetFat = Math.round((targetCal * 0.25) / 9);
  u.targetCarb = Math.round((targetCal - u.targetProtein * 4 - u.targetFat * 9) / 4);
}

// ============================================================================
// PLATFORM ROLE SWITCHER (USER MOBILE APP | PT MOBILE APP | ADMIN WEB)
// ============================================================================
function switchRole(role) {
  state.currentRole = role;
  const activeClasses = {
    user: 'flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 shadow transition flex items-center justify-center gap-1.5',
    pt: 'flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 shadow transition flex items-center justify-center gap-1.5',
    admin: 'flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500 text-white shadow transition flex items-center justify-center gap-1.5'
  };
  const inactiveClass = 'flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5';

  ['user', 'pt', 'admin'].forEach(r => {
    const btn = document.getElementById('role-btn-' + r);
    const view = document.getElementById('role-view-' + r);
    if (r === role) {
      btn.className = activeClasses[r];
      view.classList.remove('hidden');
    } else {
      btn.className = inactiveClass;
      view.classList.add('hidden');
    }
  });
  renderAll();
}

function actionSwitchMobileOs() {
  state.mobileOs = state.mobileOs === 'iOS' ? 'Android' : 'iOS';
  if (state.mobileOs === 'iOS') {
    state.healthSync.provider = 'Apple HealthKit (iOS 18 · Apple Watch S9)';
  } else {
    state.healthSync.provider = 'Google Health Connect (Android 14 · Galaxy Watch)';
  }
  const badge = document.getElementById('user-os-badge');
  if (badge) {
    badge.textContent = state.mobileOs === 'iOS' ? 'iOS · HealthKit' : 'Android · Health Connect';
  }
  showToast(`Đã chuyển nền tảng sang ${state.healthSync.provider} (Bảng 2.4 Assignment 01)!`, 'info');
  renderUserView();
}

function switchUserTab(tab) {
  state.currentUserTab = tab;
  renderUserView();
}

function switchPtTab(tab) {
  state.currentPtTab = tab;
  renderPtView();
}

function switchAdminTab(tab) {
  state.currentAdminTab = tab;
  renderAdminView();
}

// ============================================================================
// 1. RENDER USER APP (MOBILE VIEWPORT + 8 COMPLETE FLOWS)
// ============================================================================
const userFlowMeta = {
  dashboard: { title: 'Tổng quan Hôm nay', icon: '🏠', uc: 'UC-03, UC-06, UC-08', desc: 'Đồng bộ tự động từ Apple HealthKit (iOS) / Health Connect (Android) kèm nút Ngắt kết nối nhanh (Phụ lục E).' },
  onboarding: { title: 'Hồ sơ & Sàng lọc PAR-Q+', icon: '🩺', uc: 'UC-01, UC-02 (FE-1)', desc: 'Tự tính BMR/TDEE và sàng lọc chấn thương/bệnh nền ban đầu trước khi sinh kế hoạch tập.' },
  nutrition: { title: 'Nhật ký Món Việt (<1–3p)', icon: '🍜', uc: 'UC-05 (REQ-01, REQ-02)', desc: 'Giải quyết nỗi đau mất 5 phút nhập Bún bò của PV-U01: Chụp ảnh AI, Mã vạch & Chỉnh khẩu phần 1-chạm.' },
  plan: { title: 'Kế hoạch Tuần & Ảnh AI', icon: '📅', uc: 'UC-07, UC-12 (FE-4, FE-6)', desc: 'Tự động điều chỉnh thực đơn & lịch tập hằng tuần (ĐTB 4,14/5 cao nhất khảo sát Q10) + AI phân tích ảnh body.' },
  rag: { title: 'Tư vấn AI RAG Có nguồn', icon: '🤖', uc: 'UC-09, UC-10 (FE-5)', desc: '100% câu trả lời trích dẫn tài liệu Admin duyệt; tự động chặn bài tập rủi ro khi phát hiện đau khớp gối.' },
  marketplace: { title: 'Sàn Thuê PT Freelancer', icon: '🏋️', uc: 'UC-14 (FE-7, REQ-11)', desc: 'Tìm PT theo huy hiệu Đã xác minh chứng chỉ, đánh giá học viên cũ (4,19/5) và mua gói qua Escrow.' },
  sessions: { title: 'Lịch tập, Escrow & Chat', icon: '💬', uc: 'UC-15, UC-17 (FE-7, FE-8)', desc: 'Giữ tiền trung gian giải ngân từng buổi hoàn thành, hủy/dời lịch trước >=12h và Chat in-app gắn với plan.' },
  privacy: { title: 'Quyền Riêng tư (NĐ 356)', icon: '🔒', uc: 'UC-04 (REQ-09)', desc: 'Bật/tắt chia sẻ từng loại dữ liệu với PT, ngắt kết nối 1-chạm, rút quyền <=15 ngày, xóa dữ liệu <=20 ngày.' }
};

function renderUserView() {
  const tab = state.currentUserTab;
  const meta = userFlowMeta[tab] || userFlowMeta.dashboard;

  // Update mobile top header
  document.getElementById('user-app-header-title').textContent = meta.title;
  document.getElementById('user-app-header-sub').textContent = `${meta.uc} · 🔥 ${state.userProfile.streakDays} ngày Streak`;

  // Update 5 bottom navigation buttons
  const primaryTabs = ['dashboard', 'nutrition', 'plan', 'rag', 'marketplace'];
  primaryTabs.forEach(t => {
    const btn = document.getElementById('u-bnav-' + t);
    if (!btn) return;
    const isAct = (t === tab) || (t === 'marketplace' && tab === 'sessions');
    btn.className = `flex flex-col items-center justify-center py-1 rounded-xl transition ${isAct ? 'text-emerald-600 font-extrabold bg-emerald-50/80' : 'text-slate-500 font-medium hover:text-slate-800'}`;
  });

  // Update desktop quick jumper & SRS context panel
  const jumper = document.getElementById('user-flow-jumper');
  if (jumper) {
    jumper.innerHTML = Object.keys(userFlowMeta).map(k => {
      const m = userFlowMeta[k];
      const active = k === tab;
      return `
        <button onclick="switchUserTab('${k}')" class="p-2 rounded-xl border text-left transition ${active ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
          <div class="text-xs truncate">${m.icon} ${m.title}</div>
          <div class="text-xs opacity-75 truncate">${m.uc}</div>
        </button>
      `;
    }).join('');
  }

  const srsBox = document.getElementById('user-srs-context-box');
  if (srsBox) {
    srsBox.innerHTML = `
      <p class="font-bold text-emerald-700">${meta.icon} ${meta.title} (${meta.uc})</p>
      <p class="text-slate-600 leading-relaxed">${meta.desc}</p>
      <div class="pt-1 border-t border-slate-200 flex items-center justify-between text-slate-500">
        <span>Nền tảng: <b>${state.mobileOs}</b></span>
        <button onclick="actionSwitchMobileOs()" class="text-emerald-600 font-bold hover:underline">Đổi iOS / Android</button>
      </div>
    `;
  }

  // Render inside mobile viewport
  const viewport = document.getElementById('user-mobile-viewport');
  const u = state.userProfile;
  const h = state.healthSync;
  const totals = getTodayNutritionTotals();
  const calRem = Math.max(0, u.targetCalorie - totals.cal);

  if (tab === 'dashboard') {
    viewport.innerHTML = `
      <!-- 1. Native Health Sync Card with Quick Disconnect (Appendix E Mockup Feedback) -->
      <div class="p-3 rounded-2xl border ${h.connected ? 'border-emerald-200 bg-emerald-50/90' : 'border-amber-300 bg-amber-50'} flex items-center justify-between gap-2 shadow-sm">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-xl shrink-0">${h.connected ? '⌚' : '⚠️'}</span>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-extrabold text-slate-900 truncate">${h.provider}</p>
              <span class="w-2 h-2 rounded-full shrink-0 ${h.connected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            </div>
            <p class="text-xs text-slate-600 truncate">
              ${h.connected ? h.lastSync : (state.mobileOs === 'iOS' ? 'HealthKit trả về rỗng: Chưa có dữ liệu (DEF-01)' : 'Đã thu hồi quyền đọc lịch sử 30 ngày')}
            </p>
          </div>
        </div>
        <button onclick="actionToggleHealthSync()" class="px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 ${h.connected ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-600 text-white'}">
          ${h.connected ? 'Ngắt kết nối' : 'Kết nối'}
        </button>
      </div>

      <!-- 2. Calorie Ring & Energy Balance Card (FE-3 / UC-06) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">Năng lượng (TDEE: ${u.tdee} kcal)</span>
          <span class="text-xs font-bold text-emerald-600">Mục tiêu: ${u.targetCalorie} kcal</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-xs text-slate-500">Đã nạp (In)</p>
            <p class="text-base font-black text-sky-600 mt-0.5">${totals.cal}</p>
            <p class="text-xs text-slate-400">kcal</p>
          </div>
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <p class="text-xs font-bold text-emerald-800">Còn lại</p>
            <p class="text-lg font-black text-emerald-600 mt-0.5">${calRem}</p>
            <p class="text-xs text-emerald-700">kcal</p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-xs text-slate-500">Tiêu hao (Out)</p>
            <p class="text-base font-black text-amber-600 mt-0.5">${h.connected ? h.todayMetrics.activeCalOut : '—'}</p>
            <p class="text-xs text-slate-400">${h.connected ? 'kcal' : 'Chưa có DL'}</p>
          </div>
        </div>

        <!-- Macros progress -->
        <div class="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div>
            <div class="flex justify-between font-bold text-slate-700"><span>Đạm</span><span>${totals.p}/${u.targetProtein}g</span></div>
            <div class="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden"><div class="h-1.5 bg-rose-500 rounded-full" style="width:${Math.min(100, Math.round((totals.p / u.targetProtein) * 100))}%"></div></div>
          </div>
          <div>
            <div class="flex justify-between font-bold text-slate-700"><span>Carb</span><span>${totals.c}/${u.targetCarb}g</span></div>
            <div class="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden"><div class="h-1.5 bg-sky-500 rounded-full" style="width:${Math.min(100, Math.round((totals.c / u.targetCarb) * 100))}%"></div></div>
          </div>
          <div>
            <div class="flex justify-between font-bold text-slate-700"><span>Béo</span><span>${totals.f}/${u.targetFat}g</span></div>
            <div class="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden"><div class="h-1.5 bg-amber-500 rounded-full" style="width:${Math.min(100, Math.round((totals.f / u.targetFat) * 100))}%"></div></div>
          </div>
        </div>

        <button onclick="switchUserTab('nutrition')" class="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700">
          + Ghi nhận Bữa ăn Món Việt (&lt; 1 phút)
        </button>
      </div>

      <!-- 3. Device Biometrics & Water Grid (2x2 mobile cards) -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500">👣 Bước chân</p>
          <p class="text-sm font-extrabold text-slate-900 mt-0.5">${h.connected ? h.todayMetrics.steps.toLocaleString('vi-VN') + ' / 8.000' : 'Chưa có dữ liệu'}</p>
        </div>
        <div class="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500">❤️ Nhịp tim</p>
          <p class="text-sm font-extrabold text-rose-600 mt-0.5">${h.connected ? h.todayMetrics.currentHr + ' bpm (Nghỉ 68)' : 'Chưa có dữ liệu'}</p>
        </div>
        <div class="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500">🌙 Giấc ngủ</p>
          <p class="text-sm font-extrabold text-indigo-600 mt-0.5">${h.connected ? h.todayMetrics.sleepHours + 'h (Tốt)' : 'Chưa có dữ liệu'}</p>
        </div>
        <div class="p-3 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-sky-800">💧 Nước</span>
            <button onclick="actionAddWater()" class="px-1.5 py-0.5 rounded bg-sky-600 text-white text-xs font-bold">+250ml</button>
          </div>
          <p class="text-sm font-extrabold text-sky-700 mt-0.5">${u.waterMl} / ${u.targetWaterMl}ml</p>
        </div>
      </div>

      <!-- 4. Weight Progress Mini Bar Chart (REQ-06 - Survey 4.03/5) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-slate-800">📉 Tiến độ Cân nặng 6 tuần</span>
          <span class="text-xs font-extrabold text-emerald-600">-2,2 kg (58,0 → ${u.weightKg}kg)</span>
        </div>
        <div class="grid grid-cols-6 gap-1.5 items-end h-16 pt-2">
          ${u.weightHistory.map((w, idx) => {
            const hPct = Math.max(30, Math.min(100, Math.round(((w - 50) / 10) * 100)));
            return `
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-xs font-bold text-slate-600">${w}</span>
                <div class="w-full rounded-t ${idx === u.weightHistory.length - 1 ? 'bg-emerald-600' : 'bg-emerald-300'}" style="height:${hPct * 0.45}px"></div>
                <span class="text-xs text-slate-400">T${idx + 1}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. Active PT Session & Escrow Quick Card -->
      <div class="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400">🛡️ Gói PT 1-1 · Ví Giữ tiền Escrow</span>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold">Đã giải ngân ${state.activeEscrowContract.completedSessions}/12 buổi</span>
        </div>
        <p class="text-xs font-bold">Hôm nay 18:00: Buổi 5 với ${state.activeEscrowContract.ptName}</p>
        <p class="text-xs text-slate-300">Đang giữ an toàn: <b>${state.activeEscrowContract.heldAmount.toLocaleString('vi-VN')}đ</b></p>
        <div class="flex gap-2 pt-1">
          <button onclick="switchUserTab('sessions')" class="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">
            Mở Lịch tập &amp; Chat PT
          </button>
          <button onclick="switchUserTab('rag')" class="py-2 px-3 rounded-xl bg-slate-800 text-white text-xs font-bold">
            🤖 Hỏi AI
          </button>
        </div>
      </div>
    `;
  } else if (tab === 'onboarding') {
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
        <div>
          <span class="text-xs font-bold text-emerald-600 uppercase">UC-01 &amp; UC-02 · FE-1</span>
          <h3 class="text-sm font-extrabold text-slate-900">Hồ sơ Cơ thể &amp; Tự tính BMR/TDEE</h3>
        </div>

        <div class="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <label class="font-bold text-slate-600 block mb-1">Chiều cao (cm)</label>
            <input type="number" id="inp-height" value="${u.heightCm}" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
          </div>
          <div>
            <label class="font-bold text-slate-600 block mb-1">Cân nặng (kg)</label>
            <input type="number" step="0.1" id="inp-weight" value="${u.weightKg}" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
          </div>
        </div>

        <div class="text-xs">
          <label class="font-bold text-slate-600 block mb-1">Mục tiêu thể hình (Goal)</label>
          <select id="inp-goal" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
            <option value="Giảm cân & Giữ cơ" ${u.goalType.includes('Giảm cân') ? 'selected' : ''}>Giảm cân &amp; Giữ cơ (-400 kcal)</option>
            <option value="Giữ dáng & Săn chắc" ${u.goalType.includes('Giữ dáng') ? 'selected' : ''}>Giữ dáng (Duy trì TDEE)</option>
            <option value="Tăng cơ (Lean Bulk)" ${u.goalType.includes('Tăng cơ') ? 'selected' : ''}>Tăng cơ (+300 kcal)</option>
          </select>
        </div>

        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
          <p class="font-bold text-amber-900">🩺 Sàng lọc An toàn Vận động (PAR-Q+ · REQ-04)</p>
          <label class="flex items-start gap-2">
            <input type="checkbox" checked class="mt-0.5 w-4 h-4 accent-amber-600" />
            <span class="text-amber-900">Đau/tiền sử chấn thương khớp gối phải (AI tự động khóa bài Squat/Jump Lunge nặng)</span>
          </label>
          <label class="flex items-start gap-2">
            <input type="checkbox" class="mt-0.5 w-4 h-4 accent-amber-600" />
            <span class="text-amber-900">Đau thắt lưng / Bệnh lý tim mạch</span>
          </label>
        </div>

        <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-center font-bold text-emerald-800">
          BMR: ${u.bmr} kcal · TDEE: ${u.tdee} kcal → Mục tiêu: ${u.targetCalorie} kcal
        </div>

        <button onclick="actionSaveProfileAndRecalc()" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-sm">
          💾 Lưu Hồ sơ &amp; Tính lại Kế hoạch
        </button>
      </div>
    `;
  } else if (tab === 'nutrition') {
    const foodObj = state.vnFoodDatabase.find(f => f.id === selectedFoodId) || state.vnFoodDatabase[0];
    const portionObj = foodObj.portions[selectedPortionIdx] || foodObj.portions[0];

    viewport.innerHTML = `
      <!-- Fast Capture Buttons (< 1-3 mins requirement - Survey Q17: 91.7%) -->
      <div class="grid grid-cols-2 gap-2">
        <button onclick="actionSimulateAiFoodCamera()" class="p-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
          <span>📸</span><span>Chụp ảnh Món Việt AI</span>
        </button>
        <button onclick="actionSimulateBarcodeScan()" class="p-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
          <span>🏷️</span><span>Quét Mã vạch Siêu thị</span>
        </button>
      </div>

      <!-- Select Dish & Quick Portion Modifier (Solves PV-U01 5-min Bun Bo complaint) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-slate-800">🇻🇳 CSDL Món Việt (Viện Dinh Dưỡng)</span>
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Hoàn tất &lt; 30s</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <select onchange="selectedMealTime = this.value" class="col-span-1 px-2 py-2 rounded-xl border border-slate-300 font-bold">
            <option value="Bữa sáng" ${selectedMealTime === 'Bữa sáng' ? 'selected' : ''}>Bữa sáng</option>
            <option value="Bữa trưa" ${selectedMealTime === 'Bữa trưa' ? 'selected' : ''}>Bữa trưa</option>
            <option value="Bữa tối" ${selectedMealTime === 'Bữa tối' ? 'selected' : ''}>Bữa tối</option>
            <option value="Bữa phụ" ${selectedMealTime === 'Bữa phụ' ? 'selected' : ''}>Bữa phụ</option>
          </select>
          <select onchange="actionSelectFood(this.value)" class="col-span-2 px-2 py-2 rounded-xl border border-slate-300 font-bold">
            ${state.vnFoodDatabase.map(f => `<option value="${f.id}" ${f.id === selectedFoodId ? 'selected' : ''}>${f.name}</option>`).join('')}
          </select>
        </div>

        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-emerald-900">Chỉnh nhanh khẩu phần (1-chạm):</span>
            <span class="text-sm font-black text-emerald-700">${portionObj.cal} kcal</span>
          </div>
          <div class="flex flex-col gap-1.5">
            ${foodObj.portions.map((p, idx) => `
              <button onclick="actionSelectPortion(${idx})" class="w-full text-left px-2.5 py-1.5 rounded-lg font-bold border transition ${idx === selectedPortionIdx ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}">
                ${idx === selectedPortionIdx ? '✓ ' : ''}${p.label}
              </button>
            `).join('')}
          </div>
          <div class="grid grid-cols-3 gap-1.5 text-center pt-1">
            <div class="p-1.5 rounded bg-white border border-emerald-200">Đạm: <b>${portionObj.p}g</b></div>
            <div class="p-1.5 rounded bg-white border border-emerald-200">Carb: <b>${portionObj.c}g</b></div>
            <div class="p-1.5 rounded bg-white border border-emerald-200">Béo: <b>${portionObj.f}g</b></div>
          </div>
          <button onclick="actionAddSelectedFoodToDiary()" class="w-full py-2 rounded-xl bg-emerald-600 text-white font-extrabold shadow-sm">
            + Lưu vào ${selectedMealTime}
          </button>
        </div>
      </div>

      <!-- Today's Logged Meals -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-slate-900">Nhật ký hôm nay (${totals.cal}/${u.targetCalorie} kcal)</span>
        </div>
        <div class="space-y-2">
          ${state.foodLogsToday.map(log => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center gap-2">
              <div class="min-w-0">
                <p class="font-bold text-slate-900 truncate">${log.name}</p>
                <p class="text-slate-500">${log.mealType} (${log.time}) · P:${log.p}g C:${log.c}g F:${log.f}g</p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-black text-emerald-600">${log.cal}</p>
                <button onclick="actionRemoveFoodLog('${log.id}')" class="text-rose-600 hover:underline">Xóa</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'plan') {
    const dayObj = state.weeklyPlan.days[activePlanDayIdx] || state.weeklyPlan.days[0];
    viewport.innerHTML = `
      <!-- Auto-adjusted Weekly Plan Banner (UC-07 / REQ-05 - Survey 4.14/5) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <div class="flex justify-between items-center">
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Tuân thủ ${state.weeklyPlan.complianceRate}%</span>
          <button onclick="actionTriggerWeeklyRecalculation()" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">
            🔄 Tự tính lại Tuần mới
          </button>
        </div>
        <h3 class="text-sm font-extrabold text-slate-900">${state.weeklyPlan.version}</h3>
        <p class="text-slate-600 leading-relaxed">${state.weeklyPlan.adjustmentReason}</p>

        <!-- Day Selector Pills -->
        <div class="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          ${state.weeklyPlan.days.map((d, idx) => `
            <button onclick="activePlanDayIdx = ${idx}; renderUserView();" class="px-3 py-1.5 rounded-xl font-bold shrink-0 border ${idx === activePlanDayIdx ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}">
              ${d.day}
            </button>
          `).join('')}
        </div>

        <!-- Exercise Checklist -->
        <div class="space-y-2 pt-1">
          ${dayObj.exercises.map((ex, exIdx) => `
            <label class="p-2.5 rounded-xl border ${ex.done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" ${ex.done ? 'checked' : ''} onchange="actionToggleExercise(${activePlanDayIdx}, ${exIdx})" class="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0" />
              <div class="min-w-0">
                <p class="font-bold ${ex.done ? 'line-through text-slate-500' : 'text-slate-900'}">${ex.name}</p>
                <p class="text-slate-500 mt-0.5">${ex.sets} · Nghỉ ${ex.rest} · <i>${ex.note}</i></p>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Body Photo AI Progress Analysis (Release 3.0 - FE-6 / UC-12) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-indigo-700">📸 AI Phân tích Hình thể (FE-6 · R3.0)</span>
          <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
            ${state.privacySharing.shareBodyPhotos ? 'PT được xem' : '🔒 Khóa với PT'}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          ${state.bodyPhotos.map(bp => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p class="font-bold text-slate-900">${bp.date}</p>
              <p class="text-emerald-700 font-bold">Eo: ${bp.waistEst} · Mỡ: ${bp.bodyFatEst}</p>
              <p class="text-slate-500">${bp.postureNote}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'rag') {
    viewport.innerHTML = `
      <!-- Medical Disclaimer & 3 Test Scenarios -->
      <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        ⚠️ <b>100% Trích dẫn nguồn Admin duyệt (BO-4):</b> Không chẩn đoán y khoa. Tự động lọc chấn thương &amp; chuyển tiếp PT.
      </div>

      <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button onclick="actionSendRagPreset('normal_dinner')" class="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
          1. Hỏi ăn tối món Việt
        </button>
        <button onclick="actionSendRagPreset('injury_knee')" class="px-2.5 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold shrink-0">
          2. Báo đau sưng khớp gối
        </button>
        <button onclick="actionSendRagPreset('out_of_scope')" class="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold shrink-0">
          3. Hỏi thuốc giảm cân
        </button>
      </div>

      <!-- Chat Messages -->
      <div class="space-y-2.5 text-xs">
        ${state.ragConversation.map(msg => {
          if (msg.sender === 'user') {
            return `
              <div class="p-2.5 rounded-2xl bg-emerald-600 text-white ml-8">
                <p class="font-bold text-emerald-100 mb-0.5">Bạn · ${msg.time}</p>
                <p>${msg.text}</p>
              </div>
            `;
          } else {
            return `
              <div class="p-3 rounded-2xl ${msg.isSafetyAlert ? 'bg-rose-50 border-2 border-rose-300' : 'bg-white border border-slate-200'} mr-4 space-y-2 shadow-sm">
                <p class="font-extrabold ${msg.isSafetyAlert ? 'text-rose-700' : 'text-emerald-700'}">
                  ${msg.isSafetyAlert ? '🛑 Cảnh báo An toàn & Chặn Tự tập (UC-10)' : '🤖 FitMate RAG Tư vấn'}
                </p>
                <p class="text-slate-800 leading-relaxed">${msg.text}</p>
                <div class="p-2 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-700">
                  📚 [${msg.citation}] ✓
                </div>
                ${msg.isSafetyAlert ? `
                  <button onclick="switchUserTab('sessions')" class="w-full py-2 rounded-xl bg-rose-600 text-white font-bold">
                    👨‍⚕️ Chuyển ca cho HLV Hoàng Nam duyệt
                  </button>
                ` : ''}
              </div>
            `;
          }
        }).join('')}
      </div>

      <!-- Input -->
      <div class="flex gap-1.5 pt-1">
        <input type="text" id="rag-custom-input" placeholder="Hỏi về calo món Việt, bài tập..." class="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white" />
        <button onclick="actionSendCustomRag()" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Gửi</button>
      </div>
    `;
  } else if (tab === 'marketplace') {
    viewport.innerHTML = `
      <div class="flex items-center justify-between text-xs">
        <span class="font-extrabold text-slate-800">🏋️ Sàn PT Freelancer (FE-7)</span>
        <button onclick="switchUserTab('sessions')" class="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold">
          Mở Hợp đồng Escrow đang học →
        </button>
      </div>

      <div class="space-y-3 text-xs">
        ${state.ptList.map(pt => `
          <div class="p-3.5 rounded-2xl bg-white border ${pt.verifiedStatus === 'VERIFIED' ? 'border-emerald-200' : 'border-slate-200'} shadow-sm space-y-2">
            <div class="flex justify-between items-start gap-2">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">${pt.name}</h3>
                <p class="text-slate-500">📍 ${pt.location} · ${pt.expYears} năm KN</p>
              </div>
              <span class="px-2 py-0.5 rounded-full font-bold shrink-0 ${pt.verifiedStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}">
                ${pt.verifiedStatus === 'VERIFIED' ? '✓ Đã xác minh CC' : '⏳ Chưa xác minh'}
              </span>
            </div>
            <p class="font-bold text-amber-600">⭐ ${pt.rating} (${pt.reviewCount} đánh giá học viên cũ – Q15: 4,19/5)</p>
            <p class="text-slate-600">${pt.bio}</p>
            <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span class="font-bold">Gói ${pt.packageSessions} buổi (${pt.pricePerSession.toLocaleString('vi-VN')}đ/buổi)</span>
              <span class="text-sm font-black text-emerald-600">${pt.packageTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <button onclick="actionBookPtPackage('${pt.id}')" class="w-full py-2 rounded-xl ${pt.id === state.activeEscrowContract.ptId ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'} font-extrabold">
              ${pt.id === state.activeEscrowContract.ptId ? '✓ Đang học gói này (Xem Lịch & Escrow)' : '🛡️ Mua khóa 1-1 (Giữ tiền Escrow)'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'sessions') {
    const c = state.activeEscrowContract;
    viewport.innerHTML = `
      <!-- Escrow Contract Status -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-sky-700">🛡️ Ví Giữ tiền Trung gian (${c.contractId})</span>
          <button onclick="switchUserTab('marketplace')" class="text-slate-500 underline">← Sàn PT</button>
        </div>
        <p class="font-bold text-slate-900">${c.packageName}</p>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-emerald-800">Đã giải ngân (${c.completedSessions}/12)</span>
            <p class="text-sm font-black text-emerald-600">${c.releasedAmount.toLocaleString('vi-VN')}đ</p>
          </div>
          <div class="p-2 rounded-xl bg-sky-50 border border-sky-200">
            <span class="text-sky-800">Đang giữ an toàn</span>
            <p class="text-sm font-black text-sky-600">${c.heldAmount.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
        <p class="text-slate-500">Quy tắc <code>BR-11</code>: Hủy/dời trước &ge; 12h được bảo lưu 100% buổi tập.</p>

        <div class="space-y-2 pt-1">
          ${c.sessions.slice(3).map(s => `
            <div class="p-2.5 rounded-xl border ${s.status === 'COMPLETED_PAID' ? 'bg-slate-50 border-slate-200' : 'bg-sky-50/50 border-sky-200'} space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="font-bold text-slate-900">Buổi ${s.no}: ${s.topic}</span>
              </div>
              <p class="text-slate-500">🕒 ${s.date}</p>
              ${s.status === 'COMPLETED_PAID' ? `
                <span class="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">✓ Đã hoàn thành &amp; Giải ngân 300k</span>
              ` : `
                <div class="flex gap-1.5 pt-1">
                  <button onclick="actionCompleteEscrowSession('${s.id}')" class="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">
                    ✓ Xác nhận HT (Giải ngân)
                  </button>
                  <button onclick="actionRescheduleSession('${s.id}')" class="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold">
                    Dời lịch (&ge;12h)
                  </button>
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- In-App Chat with PT (FE-8) -->
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <p class="font-extrabold text-slate-900">💬 Chat In-App với ${c.ptName} (FE-8)</p>
        <div class="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
          ${state.ptChatMessages.map(m => `
            <div class="p-2 rounded-xl ${m.sender === 'user' ? 'bg-emerald-600 text-white ml-6' : 'bg-white border border-slate-200 text-slate-800 mr-6'}">
              <p class="font-bold opacity-80">${m.name} · ${m.time}</p>
              <p>${m.text}</p>
            </div>
          `).join('')}
        </div>
        <div class="flex gap-1.5">
          <input type="text" id="user-pt-chat-inp" placeholder="Nhắn tin cho HLV..." class="flex-1 px-3 py-2 rounded-xl border border-slate-300" />
          <button onclick="actionSendPtChat('user')" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold">Gửi</button>
        </div>
      </div>
    `;
  } else if (tab === 'privacy') {
    const p = state.privacySharing;
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-rose-600">🔒 Phân quyền Chia sẻ với PT (UC-04)</span>
          <button onclick="actionRevokeAllPtPermissions()" class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold">
            Ngắt tất cả
          </button>
        </div>
        <p class="text-slate-500">Bật/tắt tại đây sẽ khóa/mở trực tiếp dữ liệu trên <b>PT Mobile App</b> của ${p.assignedPtName}:</p>

        <label class="flex items-center justify-between py-2 border-b border-slate-100">
          <span class="font-semibold">1. Cân nặng &amp; Chỉ số BMR/TDEE</span>
          <input type="checkbox" ${p.shareWeightAndMacros ? 'checked' : ''} onchange="actionTogglePrivacy('shareWeightAndMacros', this.checked)" class="w-4 h-4 accent-emerald-600" />
        </label>
        <label class="flex items-center justify-between py-2 border-b border-slate-100">
          <span class="font-semibold">2. Nhật ký Bữa ăn hằng ngày</span>
          <input type="checkbox" ${p.shareFoodLog ? 'checked' : ''} onchange="actionTogglePrivacy('shareFoodLog', this.checked)" class="w-4 h-4 accent-emerald-600" />
        </label>
        <label class="flex items-center justify-between py-2 border-b border-slate-100">
          <span class="font-semibold">3. Bước chân, Nhịp tim &amp; Giấc ngủ</span>
          <input type="checkbox" ${p.shareWorkoutAndSteps ? 'checked' : ''} onchange="actionTogglePrivacy('shareWorkoutAndSteps', this.checked)" class="w-4 h-4 accent-emerald-600" />
        </label>
        <label class="flex items-center justify-between py-2 border-b border-slate-100 text-rose-700 font-bold">
          <span>4. Ảnh cơ thể định kỳ (Body Photos)</span>
          <input type="checkbox" ${p.shareBodyPhotos ? 'checked' : ''} onchange="actionTogglePrivacy('shareBodyPhotos', this.checked)" class="w-4 h-4 accent-rose-600" />
        </label>
        <label class="flex items-center justify-between py-2 text-rose-700 font-bold">
          <span>5. Vị trí GPS thời gian thực</span>
          <input type="checkbox" ${p.shareGpsLocation ? 'checked' : ''} onchange="actionTogglePrivacy('shareGpsLocation', this.checked)" class="w-4 h-4 accent-rose-600" />
        </label>
      </div>

      <!-- Decree 356/2025/NĐ-CP Legal SLA Box -->
      <div class="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
        <p class="font-bold text-emerald-400">⚖️ Tuân thủ Nghị định 356/2025/NĐ-CP (Mục 2.4 A1):</p>
        <p class="text-slate-300">• Rút đồng ý: Phản hồi &le; 2 ngày làm việc, thực hiện &le; 15 ngày.<br/>• Xóa dữ liệu nhạy cảm: Hoàn tất trong &le; 20 ngày.</p>
        <button onclick="actionRequestDeleteAccountData()" class="w-full py-2 rounded-xl bg-rose-600 text-white font-extrabold">
          ${p.deletionRequestStatus ? '⏳ Đã gửi yêu cầu xóa (#DEL-2026)' : '🗑️ Yêu cầu Xóa Toàn bộ Dữ liệu (SLA 20 ngày)'}
        </button>
      </div>
    `;
  }
}

// ============================================================================
// 2. RENDER PT APP (NATIVE MOBILE APP FOR FREELANCE TRAINERS - BẢNG 5.6)
// ============================================================================
const ptFlowMeta = {
  students: { title: 'Dashboard Học viên', icon: '👥', uc: 'UC-16 (REQ-10)' },
  schedule: { title: 'Lịch hẹn & Hủy <12h', icon: '📅', uc: 'UC-15 (REQ-12)' },
  chat: { title: 'Chat & Duyệt AI RAG', icon: '💬', uc: 'UC-11 (FE-8)' },
  wallet: { title: 'Ví Escrow & Hoa hồng', icon: '💰', uc: 'REQ-14 (12%)' },
  profile: { title: 'Hồ sơ Chứng chỉ & Gói', icon: '🎓', uc: 'UC-13 (REQ-13)' }
};

function renderPtView() {
  const tab = state.currentPtTab;
  const p = state.privacySharing;

  // Update 5 bottom tabs of PT Mobile App
  Object.keys(ptFlowMeta).forEach(k => {
    const btn = document.getElementById('pt-bnav-' + k);
    if (!btn) return;
    const isAct = k === tab;
    btn.className = `flex flex-col items-center justify-center py-1 rounded-xl transition ${isAct ? 'text-sky-600 font-extrabold bg-sky-50' : 'text-slate-500 font-medium'}`;
  });

  // Update desktop quick jumper for PT App
  const jumper = document.getElementById('pt-flow-jumper');
  if (jumper) {
    jumper.innerHTML = Object.keys(ptFlowMeta).map(k => {
      const m = ptFlowMeta[k];
      const act = k === tab;
      return `
        <button onclick="switchPtTab('${k}')" class="p-2 rounded-xl border text-left transition ${act ? 'bg-sky-600 text-white border-sky-600 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
          <div class="text-xs truncate">${m.icon} ${m.title}</div>
          <div class="text-xs opacity-75">${m.uc}</div>
        </button>
      `;
    }).join('');
  }

  // Synchronize live permissions from User App
  const minhAnhPerms = [];
  const minhAnhLocked = [];
  if (p.shareWeightAndMacros) minhAnhPerms.push('Cân nặng & Macro'); else minhAnhLocked.push('Cân nặng & Macro');
  if (p.shareFoodLog) minhAnhPerms.push('Nhật ký ăn'); else minhAnhLocked.push('Nhật ký ăn');
  if (p.shareWorkoutAndSteps) minhAnhPerms.push('Bước chân & Ngủ'); else minhAnhLocked.push('Bước chân & Ngủ');
  if (p.shareBodyPhotos) minhAnhPerms.push('Ảnh body'); else minhAnhLocked.push('Ảnh body');
  minhAnhLocked.push('GPS');
  state.ptStudents[0].sharedPermissions = minhAnhPerms;
  state.ptStudents[0].lockedPermissions = minhAnhLocked;

  const viewport = document.getElementById('pt-mobile-viewport');

  if (tab === 'students') {
    viewport.innerHTML = `
      <!-- KPI Summary Bar on PT Mobile App -->
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div class="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p class="text-slate-500">Đang kèm</p>
          <p class="text-sm font-black text-slate-900">12 HV</p>
        </div>
        <div class="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <p class="text-rose-700 font-bold">Bỏ nhật ký</p>
          <p class="text-sm font-black text-rose-600">1 HV (3 ngày)</p>
        </div>
        <div class="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
          <p class="text-amber-800 font-bold">Ca AI chuyển</p>
          <p class="text-sm font-black text-amber-600">1 ca đau gối</p>
        </div>
      </div>

      <!-- Student Cards (Solves PV-PT01 manual Zalo reminders) -->
      <div class="space-y-3 text-xs">
        ${state.ptStudents.map(st => `
          <div class="p-3.5 rounded-2xl bg-white border ${st.statusBadge === 'MISSED_LOGS' ? 'border-rose-300' : st.statusBadge === 'AI_ESCALATED' ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-2">
            <div class="flex justify-between items-start gap-2">
              <div>
                <p class="text-sm font-extrabold text-slate-900">${st.name}</p>
                <p class="text-slate-500">${st.goal} · ${st.currentWeight}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full font-bold shrink-0 ${st.statusBadge === 'MISSED_LOGS' ? 'bg-rose-100 text-rose-700' : st.statusBadge === 'AI_ESCALATED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}">
                ${st.statusBadge === 'MISSED_LOGS' ? '⚠️ Bỏ log 3 ngày' : st.statusBadge === 'AI_ESCALATED' ? '🩺 AI chuyển ca' : '✓ Tuân thủ ' + st.compliance + '%'}
              </span>
            </div>

            <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              ${st.id === 'STU-01' && !p.shareFoodLog ? '<b class="text-rose-600">🔒 Học viên vừa tắt quyền xem Nhật ký bữa ăn</b>' : st.todaySummary}
            </div>

            <div class="flex flex-wrap gap-1">
              ${st.sharedPermissions.map(pm => `<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">✓ ${pm}</span>`).join('')}
              ${st.lockedPermissions.map(lk => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">🔒 ${lk}</span>`).join('')}
            </div>

            <div class="flex gap-1.5 pt-1">
              ${st.statusBadge === 'MISSED_LOGS' ? `
                <button onclick="showToast('Đã gửi thông báo đẩy nhắc học viên ${st.name} ghi nhật ký!', 'info')" class="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold">
                  📲 Nhắc 1-chạm (Thay Zalo)
                </button>
              ` : ''}
              ${st.statusBadge === 'AI_ESCALATED' ? `
                <button onclick="actionPtApproveEscalatedPlan('${st.id}')" class="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold">
                  ✓ Duyệt đổi sang Glute Bridge
                </button>
              ` : ''}
              <button onclick="switchPtTab('chat')" class="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold">
                💬 Chat &amp; Giáo án
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'schedule') {
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <span class="font-extrabold text-sky-700 uppercase">UC-15 · Lịch dạy Hôm nay &amp; Quy tắc Hủy &lt;12h</span>

        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
          <div class="flex justify-between font-bold text-emerald-950">
            <span>18:00 · Buổi 5/12 – Lê Minh Anh</span>
            <span class="text-emerald-700">264.000đ</span>
          </div>
          <p class="text-slate-600">Thân trên &amp; Kiểm tra khớp gối · Giải ngân tự động sau buổi tập</p>
        </div>

        <div class="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
          <div class="flex justify-between font-bold text-amber-950">
            <span>19:30 · Buổi 3/10 – Nguyễn Hoàng Long</span>
            <span class="text-rose-600">Hủy sát giờ (&lt;4h)</span>
          </div>
          <p class="text-amber-900">Học viên báo hủy lúc 15:45 (vi phạm mốc &ge; 12h theo <code>BR-11</code>). Quyền quyết định của PT:</p>
          <div class="flex gap-1.5">
            <button onclick="showToast('Đã hỗ trợ miễn phạt 1 lần và dời lịch sang Thứ Sáu!', 'success')" class="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold">
              Dời lịch (Miễn phạt)
            </button>
            <button onclick="showToast('Đã tính buổi tập theo quy tắc hủy sát giờ <12h.', 'warning')" class="flex-1 py-2 rounded-lg bg-slate-900 text-white font-bold">
              Tính buổi (&lt;12h)
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'chat') {
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
          <span class="font-extrabold text-slate-900">💬 Chat với Học viên Lê Minh Anh</span>
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Gắn với Kế hoạch Tuần 4</span>
        </div>

        <div class="space-y-2 max-h-80 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
          ${state.ptChatMessages.map(m => `
            <div class="p-2.5 rounded-xl ${m.sender === 'pt' ? 'bg-sky-600 text-white ml-6' : 'bg-white border border-slate-200 text-slate-800 mr-6'}">
              <p class="font-bold opacity-80 mb-0.5">${m.name} · ${m.time}</p>
              <p>${m.text}</p>
            </div>
          `).join('')}
        </div>

        <div class="flex gap-1.5">
          <input type="text" id="pt-reply-inp" placeholder="Gửi lời khuyên / chỉnh giáo án..." class="flex-1 px-3 py-2 rounded-xl border border-slate-300" />
          <button onclick="actionSendPtChat('pt')" class="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold">Gửi</button>
        </div>
      </div>
    `;
  } else if (tab === 'wallet') {
    const c = state.activeEscrowContract;
    const netReceived = Math.round(c.releasedAmount * 0.88);
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <span class="font-extrabold text-emerald-700 uppercase">REQ-12 &amp; REQ-14 · Ví Thu nhập &amp; Escrow</span>
        <div class="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1">
          <p class="text-slate-400">Đã giải ngân từ gói Lê Minh Anh (Sau phí 12%)</p>
          <p class="text-2xl font-black text-emerald-400">${netReceived.toLocaleString('vi-VN')}đ</p>
          <p class="text-slate-300">Đã hoàn thành ${c.completedSessions}/${c.totalSessions} buổi · Đang giữ Escrow: <b>${c.heldAmount.toLocaleString('vi-VN')}đ</b></p>
        </div>
        <div class="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1 text-slate-700">
          <p class="font-bold text-sky-900">📌 Chính sách Bảo vệ PT Freelancer (PV-PT01 câu 7):</p>
          <p>• Hoa hồng nền tảng minh bạch: <b>12%</b> (nằm trong mức 10–15% PT chấp nhận).</p>
          <p>• Học viên cũ PT tự mang lên app: Phí quản lý chỉ <b>5%</b>, không ràng buộc độc quyền.</p>
        </div>
      </div>
    `;
  } else if (tab === 'profile') {
    viewport.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <span class="font-extrabold text-sky-700 uppercase">UC-13 · Hồ sơ Chứng chỉ &amp; Gói tập 1-1</span>
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
          <p class="font-bold text-emerald-900">Trạng thái: Mức 2 – Đã xác minh Chứng chỉ ✓</p>
          <p class="text-slate-600">Chứng chỉ đã duyệt: NASM-CPT Quốc tế, Dinh dưỡng Thể thao VBF.</p>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <p class="font-bold text-slate-900">Gói đang mở bán: Kèm 1-1 Giảm mỡ &amp; Phục hồi (12 buổi)</p>
          <p class="text-emerald-700 font-bold">Giá: 3.600.000đ (300.000đ / buổi · Giải ngân từng buổi)</p>
        </div>
      </div>
    `;
  }
}

// ============================================================================
// 3. RENDER ADMIN WEB (RESPONSIVE DESKTOP & MOBILE WEB PORTAL - BẢNG 5.6)
// ============================================================================
function renderAdminView() {
  const adminTabs = [
    { id: 'rag_kb', icon: '📚', label: 'Kho Tài liệu RAG (BO-4)', badge: state.ragDocuments.length },
    { id: 'pt_verify', icon: '🎓', label: 'Duyệt Chứng chỉ PT (XĐ7)', badge: state.ptList.filter(p => p.verifiedStatus !== 'VERIFIED').length },
    { id: 'disputes', icon: '⚖️', label: 'Khiếu nại Escrow & Log AI', badge: state.adminDisputes.filter(d => d.status === 'OPEN').length }
  ];

  const nav = document.getElementById('admin-sidebar-nav');
  if (nav) {
    nav.innerHTML = adminTabs.map(t => {
      const act = state.currentAdminTab === t.id;
      return `
        <button onclick="switchAdminTab('${t.id}')" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-2 shrink-0 ${act ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}">
          <span>${t.icon} ${t.label}</span>
          <span class="px-2 py-0.5 rounded-full text-xs ${act ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'}">${t.badge}</span>
        </button>
      `;
    }).join('');
  }

  const box = document.getElementById('admin-main-content');
  if (!box) return;

  if (state.currentAdminTab === 'rag_kb') {
    box.innerHTML = `
      <!-- Top KPI Cards of Admin Web -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Tài liệu RAG Đã duyệt (BO-4)</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">${state.ragDocuments.filter(d => d.status === 'APPROVED').length} / ${state.ragDocuments.length} bộ</p>
          <p class="text-xs text-slate-500 mt-0.5">100% câu trả lời Chatbot có trích dẫn nguồn</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">PT Đã xác minh Chứng chỉ (SC-4)</p>
          <p class="text-2xl font-black text-sky-600 mt-1">${state.ptList.filter(p => p.verifiedStatus === 'VERIFIED').length} / ${state.ptList.length} HLV</p>
          <p class="text-xs text-slate-500 mt-0.5">Cơ chế duyệt 2 mức giải quyết XĐ7</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Hợp đồng Giữ tiền Trung gian (Escrow)</p>
          <p class="text-2xl font-black text-indigo-600 mt-1">${state.activeEscrowContract.heldAmount.toLocaleString('vi-VN')}đ</p>
          <p class="text-xs text-slate-500 mt-0.5">Đang bảo vệ an toàn theo từng buổi tập</p>
        </div>
      </div>

      <!-- RAG Knowledge Base Table -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span class="text-xs font-bold uppercase text-indigo-600">UC-18 · FE-9 · REQ-03, REQ-15 (Quản trị Kho Tài liệu Chuyên môn RAG)</span>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">Danh sách Tài liệu Dinh dưỡng &amp; Y học Thể thao</h3>
          </div>
          <button onclick="actionAdminAddRagDoc()" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shrink-0">
            + Tải lên Tài liệu Mới
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500">
                <th class="py-2.5 pr-3">Mã TL</th>
                <th class="py-2.5 pr-3">Tên Tài liệu &amp; Người kiểm duyệt</th>
                <th class="py-2.5 pr-3">Phân loại</th>
                <th class="py-2.5 pr-3">Vector Chunks</th>
                <th class="py-2.5 pr-3">Trạng thái</th>
                <th class="py-2.5">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${state.ragDocuments.map(doc => `
                <tr>
                  <td class="py-3 pr-3 font-extrabold text-indigo-600">${doc.id}</td>
                  <td class="py-3 pr-3 font-bold text-slate-900">${doc.title}<br/><span class="text-xs font-normal text-slate-500">${doc.approvedBy}</span></td>
                  <td class="py-3 pr-3 text-slate-600">${doc.category} (${doc.version})</td>
                  <td class="py-3 pr-3 font-semibold">${doc.chunks} chunks</td>
                  <td class="py-3 pr-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}">
                      ${doc.status === 'APPROVED' ? '✓ Đã duyệt (Active)' : '⏳ Chờ duyệt Vector'}
                    </span>
                  </td>
                  <td class="py-3">
                    ${doc.status === 'PENDING' ? `
                      <button onclick="actionAdminApproveDoc('${doc.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                        ✓ Duyệt &amp; Index Vector
                      </button>
                    ` : `<span class="text-xs text-slate-400">Đang phục vụ RAG</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (state.currentAdminTab === 'pt_verify') {
    box.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <span class="text-xs font-bold uppercase text-indigo-600">UC-13 &amp; UC-18 · REQ-13 · Cơ chế Duyệt PT 2 Mức (Giải quyết Xung đột XĐ7)</span>
        <h3 class="text-lg font-extrabold text-slate-900">🎓 Kiểm duyệt Chứng chỉ Huấn luyện viên Freelancer</h3>
        <p class="text-xs text-slate-500">Khi Admin bấm duyệt cấp huy hiệu ở đây, trên <b>User Mobile App</b> (Tab Thuê PT), hồ sơ của HLV Đặng Tuấn Kiệt sẽ lập tức lên nhãn xanh <b>"✓ Đã xác minh CC"</b>.</p>

        <div class="space-y-3">
          ${state.ptList.map(pt => `
            <div class="p-4 rounded-2xl border ${pt.verifiedStatus === 'VERIFIED' ? 'border-slate-200 bg-slate-50' : 'border-amber-300 bg-amber-50/50'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div>
                <p class="font-bold text-slate-900">${pt.name} (${pt.location} · ${pt.expYears} năm KN)</p>
                <p class="text-xs text-slate-600 mt-0.5">Chứng chỉ đính kèm: <b>${pt.certificates.join(', ')}</b></p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${pt.verifiedStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}">
                  ${pt.verifiedStatus === 'VERIFIED' ? 'Mức 2: Đã xác minh ✓' : 'Mức 1: Chưa xác minh'}
                </span>
                ${pt.verifiedStatus !== 'VERIFIED' ? `
                  <button onclick="actionAdminVerifyPt('${pt.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                    ✓ Cấp Huy hiệu Xác minh
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (state.currentAdminTab === 'disputes') {
    box.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <span class="text-xs font-bold uppercase text-rose-600">UC-17 &amp; UC-18 · REQ-12, REQ-15 · Trọng tài Tranh chấp Giữ tiền Trung gian (Escrow)</span>
        <h3 class="text-lg font-extrabold text-slate-900">⚖️ Xử lý Khiếu nại Khóa tập &amp; Giám sát An toàn Chatbot</h3>

        <div class="space-y-3">
          ${state.adminDisputes.map(d => `
            <div class="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2.5 text-xs sm:text-sm">
              <div class="flex flex-wrap justify-between items-center gap-2">
                <span class="font-bold text-rose-700">Mã khiếu nại: ${d.id} · Ngày tạo: ${d.createdAt}</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${d.status === 'OPEN' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">
                  ${d.status === 'OPEN' ? 'Đang đóng băng ' + d.heldAmount.toLocaleString('vi-VN') + 'đ' : '✓ Đã hoàn tiền 2.100.000đ cho Học viên'}
                </span>
              </div>
              <p class="font-bold text-slate-900">${d.studentName} ↔ ${d.ptName} (${d.packageInfo})</p>
              <p class="text-slate-700"><b>Lý do:</b> ${d.reason}</p>
              <p class="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">🔍 <b>Bằng chứng Log hệ thống:</b> ${d.evidence}</p>
              ${d.status === 'OPEN' ? `
                <button onclick="actionAdminResolveDispute('${d.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                  ✓ Phê duyệt Hoàn tiền 2.100.000đ (7 buổi chưa học) cho Học viên
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// ============================================================================
// SHARED INTERACTIVE ACTIONS
// ============================================================================
function actionToggleHealthSync() {
  state.healthSync.connected = !state.healthSync.connected;
  if (state.healthSync.connected) {
    state.healthSync.lastSync = 'Vừa đồng bộ xong';
    showToast(`Đã kết nối lại ${state.healthSync.provider}!`, 'success');
  } else {
    showToast('Đã ngắt kết nối! Hiển thị "Chưa có dữ liệu" theo đúng chính sách bảo mật Apple HealthKit (DEF-01).', 'warning');
  }
  renderAll();
}

function actionAddWater() {
  state.userProfile.waterMl = Math.min(3500, state.userProfile.waterMl + 250);
  showToast(`Đã cộng +250ml nước (${state.userProfile.waterMl}ml)!`, 'info');
  renderUserView();
}

function actionSaveProfileAndRecalc() {
  const hVal = parseFloat(document.getElementById('inp-height').value) || 160;
  const wVal = parseFloat(document.getElementById('inp-weight').value) || 55.8;
  const gVal = document.getElementById('inp-goal').value;
  state.userProfile.heightCm = hVal;
  state.userProfile.weightKg = wVal;
  state.userProfile.goalType = gVal;
  recalculateBmrTdee();
  showToast(`Đã tính lại: BMR = ${state.userProfile.bmr} kcal, TDEE = ${state.userProfile.tdee} kcal, Mục tiêu = ${state.userProfile.targetCalorie} kcal!`, 'success');
  renderAll();
}

function actionSelectFood(foodId) {
  selectedFoodId = foodId;
  selectedPortionIdx = 0;
  renderUserView();
}

function actionSelectPortion(idx) {
  selectedPortionIdx = idx;
  renderUserView();
}

function actionAddSelectedFoodToDiary() {
  const foodObj = state.vnFoodDatabase.find(f => f.id === selectedFoodId) || state.vnFoodDatabase[0];
  const portionObj = foodObj.portions[selectedPortionIdx] || foodObj.portions[0];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  state.foodLogsToday.push({
    id: 'LOG-' + Date.now(),
    mealType: selectedMealTime,
    time: timeStr,
    name: `${foodObj.name} (${portionObj.label})`,
    portion: foodObj.unit,
    cal: portionObj.cal,
    p: portionObj.p,
    c: portionObj.c,
    f: portionObj.f,
    method: 'CSDL Món Việt (<30s)'
  });

  showToast(`Đã lưu "${foodObj.name}" (+${portionObj.cal} kcal) vào ${selectedMealTime}!`, 'success');
  renderAll();
}

function actionSimulateAiFoodCamera() {
  selectedFoodId = 'VN-01';
  selectedPortionIdx = 0;
  showToast('📸 AI Vision nhận diện: "Bún bò Huế (Ít bún - 390 kcal)" trong 2,5 giây!', 'info');
  renderUserView();
}

function actionSimulateBarcodeScan() {
  selectedFoodId = 'VN-06';
  selectedPortionIdx = 0;
  showToast('🏷️ Quét mã vạch EAN-13 (8934673100124): Sữa tươi không đường Vinamilk 180ml (110 kcal)!', 'info');
  renderUserView();
}

function actionRemoveFoodLog(logId) {
  state.foodLogsToday = state.foodLogsToday.filter(l => l.id !== logId);
  showToast('Đã xóa món ăn khỏi nhật ký.', 'warning');
  renderAll();
}

function actionToggleExercise(dayIdx, exIdx) {
  const ex = state.weeklyPlan.days[dayIdx].exercises[exIdx];
  ex.done = !ex.done;
  showToast(ex.done ? `✓ Đã hoàn thành: ${ex.name}` : `Đã bỏ đánh dấu: ${ex.name}`, 'success');
  renderUserView();
}

function actionTriggerWeeklyRecalculation() {
  state.weeklyPlan.version = 'Tuần 5 (v5.0 – Vừa tự động điều chỉnh theo tuân thủ 94%)';
  state.weeklyPlan.complianceRate = 94;
  state.weeklyPlan.adjustmentReason = 'Dựa trên dữ liệu tuần qua, AI điều chỉnh mục tiêu nạp 1.420 kcal/ngày và tăng 5% mức tạ bài Hip Thrust.';
  showToast('🔄 Đã tự động tính lại Kế hoạch Tuần 5 (UC-07)!', 'success');
  renderUserView();
}

function actionSendRagPreset(preset) {
  const totals = getTodayNutritionTotals();
  const remCal = Math.max(0, state.userProfile.targetCalorie - totals.cal);

  if (preset === 'normal_dinner') {
    state.ragConversation.push({ sender: 'user', time: '10:05', text: `Tối nay mình còn ${remCal} kcal thì ăn món Việt gì ngoài hàng để đủ đạm?` });
    state.ragConversation.push({
      sender: 'ai',
      time: '10:05',
      text: `Với **${remCal} kcal** còn lại, bạn nên chọn: **(1) Phở gà nạc bỏ da, ít bánh (~340 kcal, 25g Đạm)** hoặc **(2) Bún riêu cua đậu phụ luộc, bắp bò (~330 kcal, 24g Đạm)**.`,
      citation: 'DOC-01: Bảng Thành phần Thực phẩm VN - Viện Dinh Dưỡng, tr. 142',
      isSafetyAlert: false
    });
  } else if (preset === 'injury_knee') {
    state.ragConversation.push({ sender: 'user', time: '10:06', text: 'Mình tập Squat bị đau nhói và sưng nhẹ khớp gối phải thì tập bài chân nào tiếp?' });
    state.ragConversation.push({
      sender: 'ai',
      time: '10:06',
      text: 'Phát hiện dấu hiệu **đau nhói & sưng khớp gối cấp tính**. Theo quy tắc `REQ-04`, AI **từ chối tự kê bài tập chân chịu tải** và đã chuyển ca sang **PT Mobile App** của HLV Trần Hoàng Nam.',
      citation: 'DOC-02: Hướng dẫn Sàng lọc An toàn ACSM 2025, Mục 4.2',
      isSafetyAlert: true
    });
    showToast('🛑 Đã chặn bài tập rủi ro & gửi cảnh báo sang PT Mobile App!', 'danger');
  } else if (preset === 'out_of_scope') {
    state.ragConversation.push({ sender: 'user', time: '10:07', text: 'Cho mình xin đơn thuốc giảm cân cấp tốc 4kg/tuần?' });
    state.ragConversation.push({
      sender: 'ai',
      time: '10:07',
      text: '**Từ chối ngoài phạm vi (`RB4`):** FitMate không kê đơn thuốc giảm cân hay lợi tiểu. Mức giảm an toàn là 0,5–0,8kg/tuần.',
      citation: 'DOC-03: Cẩm nang BMR, TDEE & An toàn Chuyển hóa, Mục 1.3',
      isSafetyAlert: true
    });
  }
  renderUserView();
}

function actionSendCustomRag() {
  const inp = document.getElementById('rag-custom-input');
  const q = (inp ? inp.value : '').trim();
  if (!q) return;
  inp.value = '';
  const isInjury = /đau|sưng|chấn thương|thuốc|bệnh/i.test(q);
  state.ragConversation.push({ sender: 'user', time: '10:10', text: q });
  state.ragConversation.push({
    sender: 'ai',
    time: '10:10',
    text: isInjury
      ? 'Câu hỏi liên quan đến **chấn thương / y tế**. Hệ thống tạm khóa gợi ý bài tập nặng và chuyển tiếp cho HLV cá nhân của bạn (`REQ-04`).'
      : 'Theo tài liệu Viện Dinh Dưỡng Quốc Gia đã được Admin duyệt, bạn nên duy trì lượng Đạm **1,8–2,0g/kg cân nặng** và ưu tiên chế biến luộc/áp chảo.',
    citation: isInjury ? 'DOC-02: Sàng lọc An toàn ACSM, Mục 4.2' : 'DOC-01: Viện Dinh Dưỡng Quốc Gia (Đã duyệt)',
    isSafetyAlert: isInjury
  });
  renderUserView();
}

function actionBookPtPackage(ptId) {
  switchUserTab('sessions');
  showToast('Đang mở Hợp đồng Giữ tiền Trung gian (Escrow) & Lịch hẹn!', 'info');
}

function actionCompleteEscrowSession(sessionId) {
  const c = state.activeEscrowContract;
  const s = c.sessions.find(item => item.id === sessionId);
  if (!s || s.status === 'COMPLETED_PAID') return;
  s.status = 'COMPLETED_PAID';
  c.completedSessions += 1;
  c.releasedAmount += c.pricePerSession;
  c.heldAmount = Math.max(0, c.totalAmount - c.releasedAmount);
  showToast(`🎉 Đã giải ngân 264.000đ (sau phí 12%) sang Ví của ${c.ptName} trên PT App!`, 'success');
  renderAll();
}

function actionRescheduleSession(sessionId) {
  const c = state.activeEscrowContract;
  const s = c.sessions.find(item => item.id === sessionId);
  if (!s) return;
  s.date = '16/11/2026 (Đã dời trước >=12h – Bảo lưu 100%)';
  showToast('Đã dời lịch trước mốc 12h! Bảo lưu 100% buổi tập (BR-11).', 'info');
  renderAll();
}

function actionSendPtChat(senderRole) {
  const inpId = senderRole === 'user' ? 'user-pt-chat-inp' : 'pt-reply-inp';
  const inp = document.getElementById(inpId);
  const text = (inp ? inp.value : '').trim();
  if (!text) return;
  inp.value = '';
  state.ptChatMessages.push({
    sender: senderRole,
    name: senderRole === 'user' ? state.userProfile.name : 'HLV Trần Hoàng Nam',
    time: '10:18',
    text
  });
  showToast('Đã đồng bộ tin nhắn giữa User Mobile App và PT Mobile App!', 'success');
  renderAll();
}

function actionTogglePrivacy(key, val) {
  state.privacySharing[key] = val;
  showToast('Đã cập nhật quyền riêng tư! Đã khóa/mở tương ứng trên PT Mobile App.', 'info');
  renderAll();
}

function actionRevokeAllPtPermissions() {
  state.privacySharing.shareWeightAndMacros = false;
  state.privacySharing.shareFoodLog = false;
  state.privacySharing.shareWorkoutAndSteps = false;
  state.privacySharing.shareSleepAndHr = false;
  state.privacySharing.shareBodyPhotos = false;
  state.privacySharing.shareGpsLocation = false;
  showToast('⚡ Đã ngắt toàn bộ quyền xem dữ liệu của PT (UC-04)!', 'danger');
  renderAll();
}

function actionRequestDeleteAccountData() {
  state.privacySharing.deletionRequestStatus = 'PENDING_20_DAYS';
  showToast('Đã tạo yêu cầu xóa dữ liệu #DEL-2026 (Cam kết hoàn tất <= 20 ngày theo NĐ 356/2025/NĐ-CP)!', 'danger');
  renderUserView();
}

function actionPtApproveEscalatedPlan(studentId) {
  const st = state.ptStudents.find(s => s.id === studentId);
  if (!st) return;
  st.statusBadge = 'GOOD';
  st.todaySummary = '✓ HLV Hoàng Nam đã duyệt đổi Squat sang Glute Bridge & Đạp xe tĩnh an toàn.';
  showToast('✓ Đã duyệt giáo án thay thế an toàn cho học viên!', 'success');
  renderPtView();
}

function actionAdminApproveDoc(docId) {
  const doc = state.ragDocuments.find(d => d.id === docId);
  if (!doc) return;
  doc.status = 'APPROVED';
  doc.approvedBy = 'Admin Doãn Minh Hải (Đã duyệt & Index Vector)';
  showToast(`✓ Đã duyệt & băm Vector cho ${doc.id}!`, 'success');
  renderAdminView();
}

function actionAdminAddRagDoc() {
  const newId = 'DOC-0' + (state.ragDocuments.length + 1);
  state.ragDocuments.push({
    id: newId,
    title: 'Hướng dẫn Dinh dưỡng & Phục hồi Cơ bắp Calisthenics 2026.pdf',
    category: 'Calisthenics & Thể hình',
    version: 'v1.0',
    chunks: 290,
    status: 'PENDING',
    approvedBy: 'Chờ Admin duyệt & băm Vector',
    updatedAt: '11/11/2026'
  });
  showToast(`Đã tải lên ${newId}! Hãy bấm "Duyệt & Index Vector".`, 'info');
  renderAdminView();
}

function actionAdminVerifyPt(ptId) {
  const pt = state.ptList.find(p => p.id === ptId);
  if (!pt) return;
  pt.verifiedStatus = 'VERIFIED';
  showToast(`✓ Đã cấp Huy hiệu Xác minh Mức 2 cho ${pt.name}!`, 'success');
  renderAll();
}

function actionAdminResolveDispute(disputeId) {
  const d = state.adminDisputes.find(item => item.id === disputeId);
  if (!d) return;
  d.status = 'REFUNDED_TO_STUDENT';
  showToast(`✓ Đã hoàn tiền 2.100.000đ từ Escrow về cho học viên ${d.studentName}!`, 'success');
  renderAdminView();
}

function renderAll() {
  renderUserView();
  renderPtView();
  renderAdminView();
}

window.addEventListener('DOMContentLoaded', () => {
  recalculateBmrTdee();
  renderAll();
});
