// ============================================================================
// FITMATE (KHỎE CÙNG BẠN) - CENTRALIZED MOCK DATABASE & INITIAL STATE
// Covers all 11 Domain Entities (Appendix A) & 18 Use Cases (UC-01..UC-18)
// ============================================================================

window.FITMATE_INITIAL_STATE = {
  currentRole: 'user', // 'user' | 'pt' | 'admin'
  currentUserTab: 'dashboard', // 'onboarding' | 'dashboard' | 'nutrition' | 'plan' | 'rag' | 'marketplace' | 'sessions' | 'privacy'
  currentPtTab: 'students', // 'students' | 'schedule' | 'packages' | 'chat' | 'wallet'
  currentAdminTab: 'rag_kb', // 'rag_kb' | 'pt_verify' | 'disputes' | 'ai_logs' | 'finance'

  // 1. Entity: Hồ sơ người dùng (User Profile) & 2. Mục tiêu (Goal)
  userProfile: {
    id: 'USR-01',
    name: 'Lê Minh Anh',
    age: 22,
    gender: 'Nữ',
    heightCm: 160,
    weightKg: 55.8,
    startWeightKg: 58.0,
    targetWeightKg: 52.0,
    goalType: 'Giảm cân & Giữ cơ', // 'Giảm cân & Giữ cơ' | 'Tăng cơ' | 'Giữ dáng'
    activityLevel: 1.375, // Tập nhẹ 3-4 buổi/tuần
    bmr: 1345,
    tdee: 1850,
    targetCalorie: 1450,
    targetProtein: 110,
    targetCarb: 145,
    targetFat: 45,
    waterMl: 1600,
    targetWaterMl: 2200,
    streakDays: 14,
    tier: 'Premium (99.000đ/tháng)',
    parqPassed: true,
    parqNotes: 'Đau nhẹ khớp gối phải khi Squat nặng (đã bật bộ lọc an toàn AI)',
    injuries: ['Khớp gối phải'],
    weightHistory: [58.0, 57.5, 57.1, 56.6, 56.2, 55.8]
  },

  // 3. Entity: Bản ghi sức khỏe (Health Record - Apple HealthKit / Google Health Connect)
  healthSync: {
    provider: 'Apple HealthKit (iOS 18 · Apple Watch S9)',
    connected: true,
    lastSync: 'Vừa đồng bộ (09:40)',
    permissions: {
      steps: true,
      heartRate: true,
      activeEnergy: true,
      sleep: true,
      weight: true
    },
    todayMetrics: {
      steps: 7840,
      targetSteps: 8000,
      restingHr: 68,
      currentHr: 74,
      sleepHours: 7.4,
      sleepQuality: '88% (Ngủ sâu 2h15p)',
      activeCalOut: 420
    }
  },

  // Quyền chia sẻ dữ liệu với PT (UC-04 / REQ-09 / NĐ 356/2025/NĐ-CP)
  privacySharing: {
    assignedPtId: 'PT-01',
    assignedPtName: 'HLV Trần Hoàng Nam',
    shareWeightAndMacros: true,
    shareFoodLog: true,
    shareWorkoutAndSteps: true,
    shareSleepAndHr: true,
    shareInjuryScreening: true,
    shareBodyPhotos: false, // Mặc định khóa theo PV-U01
    shareGpsLocation: false, // Mặc định khóa
    aiTrainingOptIn: false,
    deletionRequestStatus: null // null | 'PENDING_20_DAYS'
  },

  // Cơ sở dữ liệu Món ăn Việt Nam chuẩn hóa (REQ-02 - Viện Dinh Dưỡng QG)
  vnFoodDatabase: [
    { id: 'VN-01', name: 'Bún bò Huế', unit: '1 tô tiêu chuẩn (550g)', cal: 480, p: 28, c: 58, f: 14, category: 'Món nước', barcode: null, portions: [
      { label: 'Ít bún (-90 kcal)', cal: 390, p: 27, c: 38, f: 14 },
      { label: 'Tô tiêu chuẩn (480 kcal)', cal: 480, p: 28, c: 58, f: 14 },
      { label: 'Bỏ giò heo, nạm nạc (-130 kcal)', cal: 350, p: 26, c: 56, f: 4 }
    ]},
    { id: 'VN-02', name: 'Phở bò tái nạm', unit: '1 tô vừa (500g)', cal: 430, p: 26, c: 59, f: 10, category: 'Món nước', barcode: null, portions: [
      { label: 'Phở tái nạc, ít bánh (340 kcal)', cal: 340, p: 25, c: 42, f: 7 },
      { label: 'Tô tiêu chuẩn (430 kcal)', cal: 430, p: 26, c: 59, f: 10 },
      { label: 'Nước béo + thêm quẩy (560 kcal)', cal: 560, p: 27, c: 72, f: 18 }
    ]},
    { id: 'VN-03', name: 'Cơm tấm sườn nướng', unit: '1 đĩa vừa (420g)', cal: 520, p: 30, c: 64, f: 16, category: 'Cơm Việt', barcode: null, portions: [
      { label: '1/2 cơm, sườn nạc, không mỡ hành (410 kcal)', cal: 410, p: 29, c: 40, f: 14 },
      { label: 'Cơm sườn tiêu chuẩn (520 kcal)', cal: 520, p: 30, c: 64, f: 16 },
      { label: 'Sườn + Bì + Chả trứng (680 kcal)', cal: 680, p: 38, c: 68, f: 28 }
    ]},
    { id: 'VN-04', name: 'Bánh mì thịt nguội / ức gà áp chảo', unit: '1 ổ (220g)', cal: 360, p: 22, c: 44, f: 10, category: 'Ăn sáng', barcode: null, portions: [
      { label: 'Bánh mì ức gà, không sốt bơ (310 kcal)', cal: 310, p: 26, c: 42, f: 4 },
      { label: 'Ổ tiêu chuẩn (360 kcal)', cal: 360, p: 22, c: 44, f: 10 }
    ]},
    { id: 'VN-05', name: 'Ức gà luộc / áp chảo + Khoai lang + Bông cải', unit: '1 phần (350g)', cal: 340, p: 38, c: 34, f: 5, category: 'Eat Clean', barcode: null, portions: [
      { label: 'Khẩu phần chuẩn 150g ức gà (340 kcal)', cal: 340, p: 38, c: 34, f: 5 },
      { label: 'Tăng đạm 200g ức gà (410 kcal)', cal: 410, p: 49, c: 34, f: 6 }
    ]},
    { id: 'VN-06', name: 'Sữa tươi tiệt trùng không đường Vinamilk 180ml', unit: '1 hộp 180ml', cal: 110, p: 6, c: 8, f: 6, category: 'Đóng gói (Mã vạch)', barcode: '8934673100124', portions: [
      { label: '1 hộp 180ml (110 kcal)', cal: 110, p: 6, c: 8, f: 6 },
      { label: '2 hộp 360ml (220 kcal)', cal: 220, p: 12, c: 16, f: 12 }
    ]},
    { id: 'VN-07', name: 'Sữa chua Hy Lạp không đường TH true YOGURT', unit: '1 hộp 100g', cal: 95, p: 9, c: 6, f: 4, category: 'Đóng gói (Mã vạch)', barcode: '8935217400258', portions: [
      { label: '1 hộp 100g (95 kcal)', cal: 95, p: 9, c: 6, f: 4 }
    ]},
    { id: 'VN-08', name: 'Bún riêu cua đậu phụ bắp bò', unit: '1 tô vừa (500g)', cal: 410, p: 25, c: 52, f: 11, category: 'Món nước', barcode: null, portions: [
      { label: 'Ít bún, đậu phụ luộc (330 kcal)', cal: 330, p: 24, c: 36, f: 9 },
      { label: 'Tô tiêu chuẩn (410 kcal)', cal: 410, p: 25, c: 52, f: 11 }
    ]}
  ],

  // 5. Entity: Nhật ký bữa ăn hôm nay (Food Diary)
  foodLogsToday: [
    { id: 'LOG-1', mealType: 'Bữa sáng', time: '07:30', name: 'Bánh mì ức gà áp chảo (Không sốt bơ)', portion: '1 ổ (220g)', cal: 310, p: 26, c: 42, f: 4, method: 'CSDL Món Việt' },
    { id: 'LOG-2', mealType: 'Bữa trưa', time: '12:15', name: 'Cơm tấm sườn nướng (1/2 cơm, sườn nạc)', portion: '1 đĩa vừa', cal: 410, p: 29, c: 40, f: 14, method: '📸 AI Chụp ảnh (18s)' },
    { id: 'LOG-3', mealType: 'Bữa phụ chiều', time: '16:00', name: 'Sữa tươi tiệt trùng không đường Vinamilk', portion: '1 hộp 180ml', cal: 110, p: 6, c: 8, f: 6, method: '🏷️ Mã vạch 8934673100124' }
  ],

  // 4. Entity: Kế hoạch tập luyện & thực đơn tự điều chỉnh hằng tuần (UC-07 / REQ-05)
  weeklyPlan: {
    version: 'Tuần 4 (v4.2 – Đã tự điều chỉnh & HLV Hoàng Nam duyệt)',
    complianceRate: 92,
    adjustmentReason: 'Tuần 3 bạn đạt 92% buổi tập, trung bình 7.920 bước/ngày và giảm 0,4kg (56,2kg → 55,8kg). Hệ thống giữ mức 1.450 kcal/ngày và thay bài Barbell Squat bằng Glute Bridge & Đạp xe để bảo vệ khớp gối phải.',
    days: [
      {
        day: 'Thứ Hai', focus: 'Thân dưới (Bảo vệ khớp gối) & Core', duration: '45 phút', estCal: 280, completed: true,
        exercises: [
          { name: 'Khởi động khớp hông & Đạp xe tĩnh kháng lực nhẹ', sets: '1 hiệp × 8 phút', rest: '60s', done: true, note: 'Làm ấm dịch khớp gối' },
          { name: 'Hip Thrust / Glute Bridge với tạ đơn', sets: '4 hiệp × 12 lần (16kg)', rest: '60s', done: true, note: 'Thay thế Squat theo duyệt của HLV Nam' },
          { name: 'Romanian Deadlift (RDL) với tạ đơn', sets: '3 hiệp × 12 lần (10kg/tay)', rest: '60s', done: true, note: 'Giữ lưng thẳng, tập trung đùi sau' },
          { name: 'Plank siết bụng & Deadbug', sets: '3 hiệp × 45 giây', rest: '45s', done: true, note: 'Giữ nhịp thở đều' }
        ]
      },
      {
        day: 'Thứ Tư (Hôm nay)', focus: 'Thân trên (Lưng - Vai - Tay) & Calisthenics', duration: '45 phút', estCal: 310, completed: false,
        exercises: [
          { name: 'Kéo cáp lưng xô (Lat Pulldown)', sets: '4 hiệp × 12 lần (25kg)', rest: '60s', done: true, note: 'Hạ bả vai trước khi kéo' },
          { name: 'Chống đẩy trên bục cao (Incline Push-up)', sets: '3 hiệp × 12 lần', rest: '60s', done: true, note: 'Bài tập Calisthenics chuẩn form' },
          { name: 'Đẩy vai tạ đơn ngồi (Seated Dumbbell Press)', sets: '3 hiệp × 12 lần (6kg/tay)', rest: '60s', done: false, note: 'Không võng lưng dưới' },
          { name: 'Đi bộ dốc nhẹ trên máy (Incline Walk)', sets: '1 hiệp × 15 phút', rest: '—', done: false, note: 'Giữ nhịp tim vùng 2 (125–135 bpm)' }
        ]
      },
      {
        day: 'Thứ Sáu', focus: 'Full Body Functional & Đốt mỡ', duration: '50 phút', estCal: 340, completed: false,
        exercises: [
          { name: 'Kéo lưng với dây TRX / Seated Cable Row', sets: '4 hiệp × 12 lần', rest: '60s', done: false, note: 'Kiểm soát nhịp nhả tạ 2 giây' },
          { name: 'Bước lên bục thấp (Low Step-up 20cm)', sets: '3 hiệp × 10 lần/chân', rest: '60s', done: false, note: 'Biên độ an toàn cho khớp gối' },
          { name: 'Farmer Walk (Đi bộ xách tạ giữ Core)', sets: '3 hiệp × 40 mét', rest: '60s', done: false, note: 'Tăng sức bền toàn thân' }
        ]
      }
    ]
  },

  // Ảnh cơ thể phân tích AI định kỳ (Release 3.0 - FE-6 / UC-12)
  bodyPhotos: [
    { id: 'IMG-01', date: '15/10/2026 (Tuần 1)', weight: 58.0, waistEst: '71,5 cm', bodyFatEst: '27,8%', postureNote: 'Hơi đổ vai trước nhẹ (Forward Shoulder)', encrypted: true },
    { id: 'IMG-02', date: '11/11/2026 (Tuần 4)', weight: 55.8, waistEst: '68,2 cm (-3,3cm)', bodyFatEst: '25,4% (-2,4%)', postureNote: 'Trục vai và lưng trên cân đối hơn rõ rệt', encrypted: true }
  ],

  // 6. Entity: Kho tài liệu tri thức RAG (Knowledge Base Documents - Admin duyệt)
  ragDocuments: [
    { id: 'DOC-01', title: 'Bảng Thành phần Thực phẩm Việt Nam – Viện Dinh Dưỡng Quốc Gia', category: 'Dinh dưỡng món Việt', version: 'v2025.2', chunks: 1840, status: 'APPROVED', approvedBy: 'Admin Minh Hải & Chuyên gia S10', updatedAt: '12/10/2026' },
    { id: 'DOC-02', title: 'Hướng dẫn Sàng lọc An toàn & Kháng lực ACSM / NSCA', category: 'Y học Thể thao & Chấn thương', version: 'v2025.1', chunks: 640, status: 'APPROVED', approvedBy: 'BS. Nguyễn Lan Hương (S10)', updatedAt: '18/10/2026' },
    { id: 'DOC-03', title: 'Cẩm nang Tính toán BMR, TDEE & Điều chỉnh Macro Chu kỳ Tuần', category: 'Sinh lý Dinh dưỡng', version: 'v1.4', chunks: 420, status: 'APPROVED', approvedBy: 'Admin Minh Hải', updatedAt: '25/10/2026' },
    { id: 'DOC-04', title: 'Phác đồ Thực đơn Giảm mỡ Bền vững cho Sinh viên & Văn phòng VN 2026', category: 'Thực đơn Mẫu VN', version: 'v1.0', chunks: 315, status: 'PENDING', approvedBy: 'Chờ Admin duyệt & băm Vector', updatedAt: '10/11/2026' }
  ],

  // 7. Entity: Hội thoại RAG Chatbot (UC-09, UC-10)
  ragConversation: [
    {
      sender: 'ai',
      time: '09:30',
      text: 'Xin chào Minh Anh! Hôm nay bạn đã nạp **830 / 1.450 kcal** (còn **620 kcal** và **49g Đạm** cho bữa tối). Mọi câu trả lời của mình đều trích xuất 100% từ kho tài liệu chuyên môn đã được Admin duyệt. Bạn cần tư vấn thực đơn hay bài tập hôm nay?',
      citation: 'DOC-03: Cẩm nang Tính toán BMR, TDEE & Macro, Mục 2.1',
      docId: 'DOC-03',
      isSafetyAlert: false,
      ptReviewed: true
    }
  ],

  // 8. Entity: Danh sách PT Freelancer & 9. Khóa tập (PT Marketplace - FE-7)
  ptList: [
    {
      id: 'PT-01',
      name: 'HLV Trần Hoàng Nam',
      age: 29,
      location: 'Quận 3 & Online (TP.HCM)',
      expYears: 5,
      verifiedStatus: 'VERIFIED', // 'VERIFIED' | 'UNVERIFIED_FAST'
      certificates: ['NASM-CPT Quốc tế', 'Chứng chỉ Dinh dưỡng Thể thao VBF'],
      specialties: ['Giảm mỡ bền vững', 'Phục hồi khớp gối & lưng', 'Calisthenics'],
      rating: 4.9,
      reviewCount: 42,
      pricePerSession: 300000,
      packageSessions: 12,
      packageTotal: 3600000,
      commissionRate: 12, // 12% hoa hồng nền tảng (REQ-14)
      bio: '5 năm kinh nghiệm kèm 1-1 cho sinh viên và dân văn phòng. Chuyên thiết kế thực đơn món Việt dễ ăn ngoài hàng và bài tập bảo vệ khớp.',
      reviews: [
        { student: 'Nguyễn Thu Trang', rating: 5, text: 'Anh Nam chỉnh form cực kỹ, xem dữ liệu Apple Watch trên FitMate nên không phải nhắn Zalo nhắc ăn mỗi tối nữa!' },
        { student: 'Lê Minh Anh', rating: 5, text: 'Đau gối nhẹ được anh đổi bài tập ngay trên app, giảm 2,2kg sau 3 tuần rất khỏe.' }
      ]
    },
    {
      id: 'PT-02',
      name: 'HLV Nguyễn Thảo Vy',
      age: 26,
      location: 'Cầu Giấy & Đống Đa (Hà Nội)',
      expYears: 4,
      verifiedStatus: 'VERIFIED',
      certificates: ['ACE-CPT', 'HLV Yoga & Pilates Phục hồi Tư thế'],
      specialties: ['Giữ dáng & Siết eo', 'Chỉnh tư thế văn phòng', 'Nữ giới'],
      rating: 4.85,
      reviewCount: 31,
      pricePerSession: 280000,
      packageSessions: 10,
      packageTotal: 2800000,
      commissionRate: 12,
      bio: 'Đồng hành nhẹ nhàng, tập trung cải thiện võng lưng, lệch vai và thực đơn Eat Clean thuần Việt nhanh gọn.',
      reviews: [
        { student: 'Hoàng Mai Linh', rating: 5, text: 'Chị Vy siêu tâm lý, tiền giữ qua Escrow giải ngân từng buổi nên rất yên tâm.' }
      ]
    },
    {
      id: 'PT-03',
      name: 'HLV Đặng Tuấn Kiệt',
      age: 27,
      location: 'Bình Thạnh (TP.HCM)',
      expYears: 3,
      verifiedStatus: 'UNVERIFIED_FAST', // Mức 1: Đăng ký nhanh, chờ Admin cấp tick xanh Mức 2 (XĐ7)
      certificates: ['Chứng chỉ Liên đoàn Thể hình VN (Đang chờ đối chiếu bản gốc)'],
      specialties: ['Tăng cơ nam', 'Street Workout / Calisthenics'],
      rating: 4.7,
      reviewCount: 9,
      pricePerSession: 220000,
      packageSessions: 10,
      packageTotal: 2200000,
      commissionRate: 12,
      bio: 'Chuyên Calisthenics tăng cơ tại nhà hoặc công viên không cần nhiều tạ.',
      reviews: []
    }
  ],

  // 10. Entity: Buổi tập (Sessions) & 11. Giao dịch giữ tiền trung gian (Escrow Transaction)
  activeEscrowContract: {
    contractId: 'ESC-2026-089',
    studentName: 'Lê Minh Anh',
    ptId: 'PT-01',
    ptName: 'HLV Trần Hoàng Nam',
    packageName: 'Gói Kèm 1-1: Giảm mỡ & Bảo vệ khớp gối (12 buổi)',
    totalAmount: 3600000,
    pricePerSession: 300000,
    platformFeePercent: 12,
    totalSessions: 12,
    completedSessions: 4,
    releasedAmount: 1200000,
    heldAmount: 2400000,
    status: 'ACTIVE_ESCROW',
    sessions: [
      { id: 'SES-01', no: 1, date: '21/10/2026 · 18:00', topic: 'Đánh giá InBody, Sàng lọc khớp gối & Kỹ thuật Hip Hinge', status: 'COMPLETED_PAID', payout: 264000, fee: 36000 },
      { id: 'SES-02', no: 2, date: '25/10/2026 · 18:00', topic: 'Thân trên cơ bản & Điều chỉnh thực đơn món Việt', status: 'COMPLETED_PAID', payout: 264000, fee: 36000 },
      { id: 'SES-03', no: 3, date: '01/11/2026 · 18:00', topic: 'Glute Bridge, RDL & Core chống võng lưng', status: 'COMPLETED_PAID', payout: 264000, fee: 36000 },
      { id: 'SES-04', no: 4, date: '06/11/2026 · 18:00', topic: 'Calisthenics thân trên & Kiểm tra tiến độ Tuần 3', status: 'COMPLETED_PAID', payout: 264000, fee: 36000 },
      { id: 'SES-05', no: 5, date: '11/11/2026 (Hôm nay) · 18:00', topic: 'Buổi 5: Lưng - Vai - Tay & Duyệt kế hoạch Tuần 4', status: 'SCHEDULED', payout: 264000, fee: 36000 },
      { id: 'SES-06', no: 6, date: '14/11/2026 (Thứ Bảy) · 09:00', topic: 'Buổi 6: Thân dưới an toàn khớp gối & Cardio Zone 2', status: 'SCHEDULED', payout: 264000, fee: 36000 }
    ]
  },

  // Danh sách học viên của PT Trần Hoàng Nam (PT App Dashboard - UC-16 / REQ-10)
  ptStudents: [
    {
      id: 'STU-01',
      name: 'Lê Minh Anh (22t)',
      goal: 'Giảm cân (58kg → 52kg)',
      currentWeight: '55,8 kg (-2,2kg)',
      compliance: 92,
      streak: 14,
      sessionsDone: '4 / 12 buổi',
      missedLogDays: 0,
      statusBadge: 'GOOD',
      sharedPermissions: ['Cân nặng & Macro', 'Nhật ký bữa ăn', 'Bước chân & Giấc ngủ', 'Sàng lọc chấn thương'],
      lockedPermissions: ['Ảnh cơ thể (Body Photos)', 'Vị trí GPS'],
      todaySummary: 'Đã nạp 830/1.450 kcal · 7.840 bước · Ngủ 7h24p'
    },
    {
      id: 'STU-02',
      name: 'Nguyễn Hoàng Long (25t)',
      goal: 'Tăng cơ giảm mỡ (74kg → 70kg)',
      currentWeight: '72,9 kg (-1,1kg)',
      compliance: 54,
      streak: 0,
      sessionsDone: '3 / 10 buổi',
      missedLogDays: 3,
      statusBadge: 'MISSED_LOGS', // Cảnh báo tự động bỏ nhật ký >= 3 ngày (PV-PT01 câu 10)
      sharedPermissions: ['Cân nặng & Macro', 'Nhật ký bữa ăn', 'Lịch tập'],
      lockedPermissions: ['Ảnh cơ thể', 'Giấc ngủ', 'Vị trí GPS'],
      todaySummary: 'Chưa ghi bữa ăn 3 ngày · Hôm nay báo hủy lịch sát giờ (trước 4 tiếng)'
    },
    {
      id: 'STU-03',
      name: 'Phạm Quốc Bảo (28t)',
      goal: 'Giảm mỡ bụng văn phòng',
      currentWeight: '78,4 kg (-1,6kg)',
      compliance: 85,
      streak: 6,
      sessionsDone: '6 / 12 buổi',
      missedLogDays: 0,
      statusBadge: 'AI_ESCALATED', // Chuyển tiếp từ RAG Chatbot do đau khớp gối (UC-10, UC-11)
      sharedPermissions: ['Cân nặng & Macro', 'Nhật ký bữa ăn', 'Sàng lọc chấn thương'],
      lockedPermissions: ['Ảnh cơ thể', 'Vị trí GPS'],
      todaySummary: '🩺 AI Chatbot vừa chuyển tiếp: Học viên báo đau nhói khớp gối phải khi tập Squat, chờ PT duyệt đổi bài.'
    }
  ],

  // Tin nhắn Chat In-App gắn với Kế hoạch giữa PT và Học viên (FE-8 / UC-16)
  ptChatMessages: [
    { sender: 'pt', name: 'HLV Trần Hoàng Nam', time: '08:15', text: 'Chào Minh Anh, anh thấy trên Dashboard FitMate tuần qua em đi bộ đều 7.900 bước/ngày và giảm 0,4kg rất chuẩn! Chiều nay 18:00 mình tập Buổi 5 nhé.' },
    { sender: 'user', name: 'Lê Minh Anh', time: '08:42', text: 'Vâng anh Nam! Hôm qua em hơi mỏi gối phải nên em hỏi AI RAG, hệ thống đã đổi bài Squat sang Glute Bridge trong kế hoạch Tuần 4 rồi ạ.' },
    { sender: 'pt', name: 'HLV Trần Hoàng Nam', time: '08:50', text: 'Anh vừa bấm duyệt phác đồ đó trên PT App rồi. Trưa nay ăn Cơm tấm em nhớ chọn phần ít mỡ hành như gợi ý trong app nhé!' }
  ],

  // Khiếu nại giao dịch Escrow trên Admin Web (UC-17, UC-18 / REQ-15)
  adminDisputes: [
    {
      id: 'DSP-104',
      createdAt: '10/11/2026',
      studentName: 'Vũ Thu Hà',
      ptName: 'HLV Lê Văn Tùng',
      packageInfo: 'Gói 10 buổi (3.000.000đ) · Đã tập 3 buổi, còn giữ Escrow 7 buổi (2.100.000đ)',
      reason: 'PT tự ý đổi lịch sát giờ (< 4 tiếng) 3 lần liên tiếp khiến học viên không sắp xếp được thời gian. Học viên yêu cầu hủy gói và nhận lại tiền 7 buổi đang giữ trong Escrow.',
      evidence: 'Log đặt lịch tự động trên hệ thống xác nhận PT bấm dời lịch lúc 15:10 cho các buổi 18:00 ngày 02/11, 05/11 và 09/11.',
      heldAmount: 2100000,
      status: 'OPEN' // 'OPEN' | 'REFUNDED_TO_STUDENT' | 'RELEASED_TO_PT'
    }
  ]
};
