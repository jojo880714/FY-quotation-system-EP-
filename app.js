// ============================================================
// 修改說明 (2026-06-15) — GAS 後端整合 + SSO 身分驗證 + 檔名格式修正
// 修改函式/區塊：
//   1. GAS_BACKEND_URL 常數（新增）— 取代 DRIVE_FOLDER_INTERNAL / DRIVE_FOLDER_STUDENT
//      原因：Drive 上傳改由 GAS Web App 處理，前端不再持有 OAuth token
//   2. uploadToDrive(blob, filename, folderType) — 完整重寫
//      原因：舊版用 window._driveToken（永遠是 null，上傳完全無效）
//            改為 Blob → base64 → POST 到 GAS 後端由 GAS 用服務帳號傳 Drive
//   3. makePngFilename(q, type) — 格式修正
//      原因：舊格式「顧問-學生-校區-日期-v版本_type.png」與架構圖不符
//            新格式：「日期_顧問_廠商_城市_週數_學生_版本_type.png」
//            例：20260615_Aaron_EP_Brisbane_8W_王小明_v1_internal.png
//   4. generateAndUploadPNGs(q) — 移除舊 window._driveToken 判斷，改用 GAS_BACKEND_URL 判斷
//   5. initSSOUser()（新增）— 讀取 URL ?t=JWT_TOKEN，呼叫 GAS 驗證後設定 currentUser
//      原因：CMS SSO 完成後顧問透過 CMS 跳轉帶 token，報價系統自動認得誰在使用
//      備援：若無 token（本機測試/CMS 尚未串接），沿用現有 user picker / PIN 機制
//   6. DOMContentLoaded — 加入 initSSOUser() 呼叫
// ============================================================
// 修改說明 (2026-05-21) — EP Only 版本
// 修改函式/區塊：
//   1. SCHOOL_DATA  — 只保留 "EP"，刪除 ILSC 和 Kaplan 整個物件
//   2. COUNTRY_MAP  — 只保留 EP 校區對照
//   3. adminSettings.rebates — 只保留 EP:5，移除其他廠商
//   4. const schools (step0) — 只保留 ['EP']
//   5. coming (step0) — 保留 IH/BESA/Winning 作為「即將上線」佔位
// 原因：系統縮減為僅支援 EP 語言學校
//
// 修改說明 (2026-05-26) — Phase 5 Firebase Auth 登入制
//   1. doLogin() — 登入表單觸發
//   2. applyFirebaseUser(u) — Auth 狀態變更時同步 currentUser
//   3. renderAccountMgmt() — 帳號管理頁渲染
//   4. createAllAccounts() — 一鍵建立全部預設帳號
//   5. addAccountRow() / deleteAccountRow() — 新增/刪除帳號
//   6. saveAccountMgmt() — 儲存帳號變更
//   7. sidebar footer 加登出按鈕
//
// 修改說明 (2026-06-11e) — 修破圖 + 顧問模式隱藏匯率設定
//   1. switchUser 全面 null-safe（缺 user-avatar 等 id 不再 throw）→ 初始化能跑完 → 匯率設定正常隱藏、身分徽章正常更新
//   2. 燈泡 bootstrap 加早期保險：非管理員一律先隱藏 nav-settings（匯率設定）
//   3. 教學第 1 步改置中、不挖洞（step.center=true）；其餘步驟才挖洞高亮
//   4. 教學卡片按鈕「上一步/下一步」加 white-space:nowrap + minWidth，不再換行；進度點容器設 flex 排整齊
//
// 修改說明 (2026-06-11d) — 修復「下一步」無反應 + 精簡步驟文字
//   1. TUTORIAL_STEPS 由中段 const 搬到檔案最上方並改 var：根治 'Cannot access TUTORIAL_STEPS before initialization' 的 TDZ（載入若中途中斷，也已先定義好）
//   2. 9 步教學文字精簡，每步聚焦「這步在教什麼、看畫面哪裡」
//
// 修改說明 (2026-06-11c) — 教學除錯燈泡 + 移除舊入口
//   1. 右下角常駐 💡 燈泡（createTutBulb，z-index 疊頂、不依賴 index.html），點擊即啟動教學
//   2. 移除舊「使用教學」入口（hideOldTutorialEntry：隱藏所有 onclick 含 startTutorial 的元素）
//   3. 全程 console.log（前綴 [教學]）：點擊→建立 DOM→顯示→渲染每步都有 log，方便看 console 定位
//   4. tutorial-overlay z-index 提升至最大值 2147483647，避免被其他元素蓋住而「建了卻看不到」
//
// 修改說明 (2026-06-11b) — 修復「使用教學」點擊無反應
//   1. _tutStep / _tutActive 由 let 改 var：消除 TDZ（前面若有錯誤中斷載入，也不會在點擊時丟 Cannot access before initialization）
//   2. 新增 ensureTutorialDOM()：若 index.html 缺教學遮罩/卡片 DOM，app.js 啟動教學時自行建立（含 inline 樣式，不依賴外部 CSS）
//   3. startTutorial / renderTutStep / endTutorial 全面 null-safe，缺元素不再整段崩潰
//
// 修改說明 (2026-06-11) — UX 改造：鎖淨利 / 教學 104 風格 / 旺季地區化
//   1. 預設身分改顧問（不信任 localStorage 內 admin，重整一律降回顧問）→ 淨利/計費層/回傭僅 PIN 管理員可見
//   2. 右側報價 QP 的「營業稅」明細列改為僅管理員可見（顧問只看含稅總價）
//   3. 身分徽章 setModeBadge()：sidebar 顯示「👤 顧問模式 / 🔑 管理員模式」
//   4. 使用教學改 104 風格：移除自動彈出、改左側「使用教學」點擊觸發、卡片置於高亮下方、加 resize 重新定位、內容更新為 EP/ILSC/EC/Kaplan/SGIC 五廠商與 30+ 校區
//   5. isPeak() 旺季地區化：開普敦 11–3 月、杜拜 11–2 月、其餘 6–8 月
//
// 修改說明 (2026-05-27) — PIN 碼管理員切換
//   1. sidebar footer 改為固定顯示「放洋留遊學」，移除姓名
//   2. logo 區點擊 3 次觸發 PIN 輸入
//   3. 輸入正確 PIN → 切換管理員模式，匯率設定顯示
//   4. 管理員模式下再點 3 次 → 退出管理員
//
// 修改說明 (2026-05-26) — Phase 4 Google Drive 自動上傳
//   1. uploadToDrive(blob, filename, folderId) — 上傳 PNG 到 Drive
//   2. generateAndUploadPNGs(q) — 儲存後自動產生兩張 PNG 並上傳
//   3. saveAndReveal — 改為儲存後自動觸發 generateAndUploadPNGs
//   4. 檔案命名：顧問名-學生名-校區-日期-v版本_internal/student.png
//   5. DRIVE_FOLDER_INTERNAL / DRIVE_FOLDER_STUDENT 常數
//
// 修改說明 (2026-05-22) — 住宿資料修正
// 修改函式/區塊：
//   1. SCHOOL_DATA accomm — 三類修正（詳見下方）：
//      A. 最少週數卡關：加 minWeeks 欄位
//         - Canary Wharf: McMillan Residence → minWeeks:4
//         - Birmingham: IQ 51 Studios, The Heights → minWeeks:4
//         - Leeds: Threadworks, Briggate → minWeeks:4
//         - Paris: Adagio XV, Adagio Access Vanves → minWeeks:4
//         - Dublin: Shared House 雅房/套房 5筆 → minWeeks:8
//      B. Berlin wt 資料修正：Karlshorst 4種 + Prenzlauer Berg 第一筆 wt:99 → wt:3
//      C. Toronto CASA 補漏：5種各補短期筆（wf:1-4 不同單價）
//      D. Dubai Myriad/KSK：短期筆 wt 已正確（wt:2），確認無誤
//   2. step3 — 住宿卡關邏輯：minWeeks > state.weeks 時顯示 disabled + 提示
//
// 修改說明 (2026-06-09) — 新增 ILSC 廠商支援(EP → EP + ILSC)
// 修改函式/區塊:
//   1. 新增 const ILSC_AUSTRALIA / ILSC_CANADA / ILSC_IRELAND / ILSC_INDIA
//      — ILSC 4 個地區資料,SCHOOL_DATA.ILSC 10 校區用 const 引用
//        (Adelaide/Brisbane/Melbourne/Perth/Sydney 共用 AUSTRALIA;
//         Montréal/Toronto/Vancouver 共用 CANADA; Dublin = IRELAND;
//         New Delhi = INDIA)
//   2. SCHOOL_DATA — 加 "ILSC" key,10 校區指向 4 個地區 const
//   3. COUNTRY_MAP — 加 ILSC 10 校區國家對照
//   4. adminSettings.rebates — 加 ILSC:5
//   5. const schools (step0) — ['EP'] → ['EP','ILSC']
//   6. EP_COURSE_MAP → COURSE_MAP — 改名 + 加 ILSC 10 校區條目,
//      key 改用 'school_campus' 組合(避免 EP/ILSC 同名校區衝突)
//   7. confirmOrder() — mapEntry 查找改用 (q.school + '_' + campus) key
// 原因:正式啟用多廠商模式,ILSC 上架,顧問可以同時報 EP 與 ILSC
// ============================================================

const ILSC_AUSTRALIA={"courses":[{"name":"Full-Time Morning FT AM (24 lessons)","category":"英語課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":460.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":440.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":420.0,"fixed":0.0,"peak":0}]},{"name":"Full-Time Afternoon FT AFT (24 lessons)","category":"英語課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"Full-Time Evening FT PM (24 lessons)","category":"英語課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Morning PT AM (14.5 lessons)","category":"英語課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":400.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Evening PT PM (14.5 lessons)","category":"英語課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":370.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"Homestay Half board Single (18+, Adelaide/Perth)","currency":"AUD","price":385.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"Homestay Half board Single (Under 18, Adelaide/Perth)","currency":"AUD","price":410.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食需求加價","currency":"AUD","price":70.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"Homestay 額外夜費","currency":"AUD","price":100.0,"fixed":0.0,"unit":"按天計算","note":""}],"fees":[{"category":"註冊","name":"註冊費","currency":"AUD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (1-4 weeks)","currency":"AUD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (5+ weeks)","currency":"AUD","price":15.0,"fixed":0.0,"unit":"按週計算","wf":5,"wt":99},{"category":"未成年","name":"未成年服務費 (Under 18)","currency":"AUD","price":0.0,"fixed":175.0,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 (單程)","currency":"AUD","price":0.0,"fixed":200.0,"unit":"固定金額","wf":1,"wt":99}]};
const ILSC_CANADA={"courses":[{"name":"Full-Time Intensive FTI (30 lessons)","category":"英語課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":470.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":450.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":440.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":430.0,"fixed":0.0,"peak":0}]},{"name":"Full-Time Morning FT AM (24 lessons)","category":"英語課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":420.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":400.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":390.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"Full-Time Afternoon FT AFT (24 lessons)","category":"英語課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":350.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Morning PT AM (17 lessons)","category":"英語課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":315.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Afternoon PT AFT (15 lessons)","category":"英語課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":200.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"Homestay Half board (18+, Low season)","currency":"CAD","price":325.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"Homestay Full board (18+, Low season)","currency":"CAD","price":350.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"Homestay Half board (Under 18, Low season)","currency":"CAD","price":345.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":50.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"Homestay 額外夜費","currency":"CAD","price":80.0,"fixed":0.0,"unit":"按天計算","note":""}],"fees":[{"category":"註冊","name":"註冊費","currency":"CAD","price":0.0,"fixed":220.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (1-4 weeks)","currency":"CAD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (5+ weeks)","currency":"CAD","price":15.0,"fixed":0.0,"unit":"按週計算","wf":5,"wt":99},{"category":"接機","name":"機場接送 (單程)","currency":"CAD","price":0.0,"fixed":135.0,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 (來回)","currency":"CAD","price":0.0,"fixed":270.0,"unit":"固定金額","wf":1,"wt":99}]};
const ILSC_IRELAND={"courses":[{"name":"Full-Time Morning FT AM (22.5 lessons, 19 hrs)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":330.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":300.0,"fixed":0.0,"peak":0}]},{"name":"Standard Morning ST AM (18 lessons, 15 hrs)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":300.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":270.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":240.0,"fixed":0.0,"peak":0}]},{"name":"Standard Afternoon ST AFT (18 lessons, 15 hrs)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":230.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"Homestay Standard Half board (16+, Low season)","currency":"EUR","price":300.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"Homestay Twin Half board (Low season)","currency":"EUR","price":250.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"Homestay Executive Half board (Low season)","currency":"EUR","price":395.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":35.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"Homestay 額外夜費","currency":"EUR","price":35.0,"fixed":0.0,"unit":"按天計算","note":""}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (1-4 weeks)","currency":"EUR","price":0.0,"fixed":20.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (5+ weeks)","currency":"EUR","price":5.0,"fixed":0.0,"unit":"按週計算","wf":5,"wt":99},{"category":"學員保護","name":"Learner Protection Fee","currency":"EUR","price":0.0,"fixed":30.0,"unit":"固定金額","wf":1,"wt":99},{"category":"考試","name":"TIE Exam Fee","currency":"EUR","price":0.0,"fixed":120.0,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 (單程)","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":1,"wt":99}]};
const ILSC_INDIA={"courses":[{"name":"Full-Time Intensive FTI (30 lessons)","category":"英語課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":235.0,"fixed":0.0,"peak":0}]},{"name":"Full-Time FT (24 lessons)","category":"英語課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":205.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Morning PT AM (17 lessons)","category":"英語課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":170.0,"fixed":0.0,"peak":0}]},{"name":"Part-Time Evening PT PM (13 lessons)","category":"英語課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":145.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"Homestay Half board (2 meals)","currency":"USD","price":350.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"公寓","name":"Student Apartment Single","currency":"USD","price":280.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"公寓","name":"Student Apartment Shared","currency":"USD","price":205.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"B&B","name":"Bed & Breakfast","currency":"USD","price":300.0,"fixed":0.0,"unit":"按週計算","note":""},{"type":"額外加成","name":"額外夜費","currency":"USD","price":50.0,"fixed":0.0,"unit":"按天計算","note":""}],"fees":[{"category":"註冊","name":"註冊與評估費","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"USD","price":0.0,"fixed":35.0,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 (單程)","currency":"USD","price":0.0,"fixed":40.0,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 (來回)","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99}]};

const KAPLAN_DATA={"Boston": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 420.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 650.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 620.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 520.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 650.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 620.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和強化學術英語課程", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 650.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 620.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 590.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和學術英語課程（非全日制）", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 12, "price": 530.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐)", "currency": "USD", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 470.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Bon (Luxury Single)", "currency": "USD", "price": 760.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Bon (Single)", "currency": "USD", "price": 730.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "波士頓洛根 (Boston Logan) 機場接機", "currency": "USD", "price": 0.0, "fixed": 190.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Chicago": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 370.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 420.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 550.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐)", "currency": "USD", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 310.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 350.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 350.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Flats (Single)", "currency": "USD", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Flats (Studio)", "currency": "USD", "price": 690.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Flats (Twin)", "currency": "USD", "price": 420.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "芝加哥奧黑爾 (Chicago O'Hare) 機場接機", "currency": "USD", "price": 0.0, "fixed": 220.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "USD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 5}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 6, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Los Angeles": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 460.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 410.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 570.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 460.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 600.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 570.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 510.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 600.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 360.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 450.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 360.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 400.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 490.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 400.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Westwood Residence (Luxury Single)", "currency": "USD", "price": 800.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Westwood Residence (Single)", "currency": "USD", "price": 750.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Westwood Residence (Economy Single)", "currency": "USD", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Westwood Residence (Twin)", "currency": "USD", "price": 490.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "洛杉磯 (Los Angeles) 機場接機", "currency": "USD", "price": 0.0, "fixed": 190.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "USD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 5}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 6, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "New York": {"courses": [{"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 600.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 570.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 500.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 690.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 660.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 560.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 690.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 660.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Intensive", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 690.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 660.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 560.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business English (Part-time)", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 600.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 570.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 500.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和強化學術英語課程", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 690.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 660.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 630.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和學術英語課程（非全日制）", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 600.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 12, "price": 570.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 540.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週7餐)", "currency": "USD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 460.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 470.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週7餐)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 490.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (曼哈頓)", "name": "Homestay in Manhattan 單人房", "currency": "USD", "price": 660.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (曼哈頓)", "name": "Homestay in Manhattan 雙人房", "currency": "USD", "price": 540.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (曼哈頓)", "name": "Homestay in Manhattan (Under 18) 單人房", "currency": "USD", "price": 700.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (曼哈頓)", "name": "Homestay in Manhattan (Under 18) 雙人房", "currency": "USD", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Midtown East: Turtle Bay (Single)", "currency": "USD", "price": 920.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Midtown East: Turtle Bay (Twin)", "currency": "USD", "price": 610.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Midtown East: Turtle Bay (Triple)", "currency": "USD", "price": 460.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Hudson Yards (Single)", "currency": "USD", "price": 700.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "肯尼迪(JFK)/紐瓦克(Newark)/拉瓜迪亞(LaGuardia)", "currency": "USD", "price": 0.0, "fixed": 230.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "USD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "New York 30+": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 450.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 600.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 570.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 500.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 690.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 660.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 630.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 560.0, "fixed": 0.0, "peak": 0}]}], "accomm": [], "fees": []}, "San Francisco": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 390.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 450.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 610.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 490.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 610.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 580.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 390.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Berkeley City Dorms (Single)", "currency": "USD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Berkeley City Dorms (Twin)", "currency": "USD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "舊金山 (San Francisco) 機場接機", "currency": "USD", "price": 0.0, "fixed": 230.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "奧克蘭 (Oakland) 機場接機", "currency": "USD", "price": 0.0, "fixed": 230.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "USD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 5}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 6, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Santa Barbara": {"courses": [{"name": "General English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 400.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 450.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 610.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 550.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 490.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "USD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 610.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 590.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 400.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週7餐)", "currency": "USD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "USD", "price": 440.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "USD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "LA Brezza (Luxury Single)", "currency": "USD", "price": 820.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "LA Brezza (Luxury Twin)", "currency": "USD", "price": 550.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "LA Brezza (Single)", "currency": "USD", "price": 760.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "LA Brezza (Twin)", "currency": "USD", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "USD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "USD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "USD", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "洛杉磯 (Los Angeles) 機場接機", "currency": "USD", "price": 0.0, "fixed": 440.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "聖巴巴拉 (Santa Barbara) 機場接機", "currency": "USD", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "USD", "price": 50.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "USD", "price": 120.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "USD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "USD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 5}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "USD", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 6, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "USD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "USD", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "USD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Toronto": {"courses": [{"name": "General English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 430.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 560.0, "fixed": 0.0, "peak": 0}]}, {"name": "學術英語橋梁課程 (Academic English)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思課程 (非全日制)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思強化課程 (Intensive IELTS)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 530.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和強化學術英語課程", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 530.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEFL® 和學術英語課程（非全日制）", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 480.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "CAD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "CAD", "price": 500.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "CAD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "CAD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "CAD", "price": 540.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "CAD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Parkside Student Residence (Single)", "currency": "CAD", "price": 825.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Luxury Single)", "currency": "CAD", "price": 870.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Economy Single)", "currency": "CAD", "price": 560.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (1 Bed Apt)", "currency": "CAD", "price": 970.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Single Shared)", "currency": "CAD", "price": 590.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Single Independent)", "currency": "CAD", "price": 790.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Twin)", "currency": "CAD", "price": 470.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cherry House (Single - Under 18)", "currency": "CAD", "price": 600.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "CAD", "price": 0.0, "fixed": 270.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "監護費 (Custodianship Fee)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "材料費", "name": "課程材料費", "currency": "CAD", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "接機", "name": "皮尔森 (Pearson) 機場接機", "currency": "CAD", "price": 0.0, "fixed": 150.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療保險 (16-69歲)", "currency": "CAD", "price": 30.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "CAD", "price": 110.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "CAD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "CAD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "CAD", "price": 0.0, "fixed": 160.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "CAD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "CAD", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "CAD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "CAD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Toronto 30+": {"courses": [{"name": "General English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 430.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 590.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}], "accomm": [], "fees": []}, "Vancouver": {"courses": [{"name": "General English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 430.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 10, "price": 560.0, "fixed": 0.0, "peak": 0}]}, {"name": "學術英語橋梁課程 (Academic English)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 470.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思課程 (非全日制)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 530.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 480.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思強化課程 (Intensive IELTS)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 580.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 560.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 16, "price": 530.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐)", "currency": "CAD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐)", "currency": "CAD", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐)", "currency": "CAD", "price": 410.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐)", "currency": "CAD", "price": 380.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "King Edward Townhouse (Single)", "currency": "CAD", "price": 660.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "King Edward Townhouse (Twin)", "currency": "CAD", "price": 550.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Viva Tower Apartments (Single)", "currency": "CAD", "price": 660.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Viva Tower Apartments (Twin)", "currency": "CAD", "price": 550.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請費 (Application Fee)", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "CAD", "price": 0.0, "fixed": 270.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "監護費 (Custodianship Fee)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "材料費 (Materials Fee)", "currency": "CAD", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "服務費", "name": "大學申請服務 (University Placement Service)", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "溫哥華 (Vancouver) 機場接機", "currency": "CAD", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療保險 (16-69歲)", "currency": "CAD", "price": 30.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "CAD", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "CAD", "price": 110.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "CAD", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "僅選修課程 (Elective Only Classes)", "currency": "CAD", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "CAD", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 5}, {"category": "課程服務", "name": "托福補充課程 (TOEFL Supplementary)", "currency": "CAD", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 6, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "CAD", "price": 0.0, "fixed": 160.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "CAD", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "CAD", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "CAD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "CAD", "price": 80.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Bournemouth": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 250.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 220.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 310.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 240.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 185.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 280.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Lansdowne Point (Single)", "currency": "GBP", "price": 310.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Lansdowne Point (Single Half-Board)", "currency": "GBP", "price": 500.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Oxford Point Residence (Single)", "currency": "GBP", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 225.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "蓋特威克 (Gatwick) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 280.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "南安普敦 (Southampton) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 185.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "盧頓 (Luton) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 300.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "伯恩茅斯 (Bournemouth) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 130.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "倫敦市中心接機", "currency": "GBP", "price": 0.0, "fixed": 400.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 140.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "近校區住宿 (Close to School)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Bournemouth 30+": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 250.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 220.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 310.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 240.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}], "accomm": [], "fees": []}, "Cambridge": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 340.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 250.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 290.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 310.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Student Castle Cambridge (Single)", "currency": "GBP", "price": 390.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Cam Foundry (Studio)", "currency": "GBP", "price": 420.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 230.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "蓋特威克 (Gatwick) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 270.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "盧頓 (Luton) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 170.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "斯坦斯特德 (Stansted) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 160.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "倫敦城市 (London City) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 210.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "聖潘克拉斯 (St Pancras) 火車站接機", "currency": "GBP", "price": 0.0, "fixed": 210.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "倫敦市中心接機", "currency": "GBP", "price": 0.0, "fixed": 210.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Edinburgh": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 240.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 350.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 340.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 310.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 260.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 310.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 310.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 310.0, "fixed": 0.0, "peak": 0}]}, {"name": "愛丁堡國際藝術節課程", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 410.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/共用衛浴)", "currency": "GBP", "price": 190.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/獨立衛浴)", "currency": "GBP", "price": 240.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 310.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 280.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 330.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Arran House (Single)", "currency": "GBP", "price": 360.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Haymarket (Studio)", "currency": "GBP", "price": 420.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Vita Edinburgh (Studio)", "currency": "GBP", "price": 440.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "愛丁堡 (Edinburgh) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "格拉斯哥 (Glasgow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 240.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "近校區住宿 (Close to School)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Liverpool": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 260.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 230.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 250.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 290.0, "fixed": 0.0, "peak": 0}]}, {"name": "商务英语课程 (补充、强化)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 290.0, "fixed": 0.0, "peak": 0}]}, {"name": "Cambridge General (B2, C1)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 12, "price": 260.0, "fixed": 0.0, "peak": 0}]}, {"name": "Cambridge Intensive (B2, C1)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 12, "price": 330.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 290.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 290.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 200.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Glassworks Liverpool (Single)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Vita Liverpool (Bronze Single)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Vita Liverpool (Silver Single)", "currency": "GBP", "price": 300.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Vita Liverpool (Gold Single)", "currency": "GBP", "price": 330.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 590.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "利物浦 (Liverpool) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "曼徹斯特 (Manchester) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 145.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "利物浦 Lime Street 火車站接機", "currency": "GBP", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "GBP", "price": 90.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 140.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Liverpool 30+": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 260.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 230.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 250.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 290.0, "fixed": 0.0, "peak": 0}]}], "accomm": [], "fees": []}, "London": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 290.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 310.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 360.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 360.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 360.0, "fixed": 0.0, "peak": 0}]}, {"name": "劍橋英語強化課程 (C2 Proficiency)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 470.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 360.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴) - A", "currency": "GBP", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴) - B", "currency": "GBP", "price": 330.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴) - A", "currency": "GBP", "price": 280.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴) - B", "currency": "GBP", "price": 350.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "IQ Shoreditch (Studio)", "currency": "GBP", "price": 610.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Scape Wembley (Studio)", "currency": "GBP", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Aldgate Residence (Studio)", "currency": "GBP", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Battersea Residence (Single)", "currency": "GBP", "price": 540.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 150.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "蓋特威克 (Gatwick) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 190.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "盧頓 (Luton) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 185.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "斯坦斯特德 (Stansted) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 190.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "倫敦城市 (London City) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "聖潘克拉斯 (St Pancras) 火車站接機", "currency": "GBP", "price": 0.0, "fixed": 115.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 150.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "近校區住宿 (Close to School)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "London 30+": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 390.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 350.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 300.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 330.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "商务英语课程 (Business English)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "TOEIC 考試準備課程", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 450.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 380.0, "fixed": 0.0, "peak": 0}]}, {"name": "海外语言课程 (50+)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 2, "price": 500.0, "fixed": 0.0, "peak": 0}]}], "accomm": [], "fees": []}, "Manchester": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 340.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 260.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/共用衛浴)", "currency": "GBP", "price": 180.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/獨立衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 290.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Lambert & Fairfield (Premium Single)", "currency": "GBP", "price": 340.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Lambert & Fairfield (Standard Single)", "currency": "GBP", "price": 310.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Vita Manchester (Studio)", "currency": "GBP", "price": 400.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "曼徹斯特 (Manchester) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 95.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "強化升級課程 (Intensive Upgrade)", "currency": "GBP", "price": 90.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 140.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Oxford": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 340.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 260.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}, {"name": "Cambridge Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 430.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 420.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 320.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (不含餐/獨立衛浴)", "currency": "GBP", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 300.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 220.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 240.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Student Castle (Single)", "currency": "GBP", "price": 400.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "The Mews (Studio)", "currency": "GBP", "price": 450.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 155.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "蓋特威克 (Gatwick) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 210.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "盧頓 (Luton) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 230.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "斯坦斯特德 (Stansted) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 250.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "聖潘克拉斯 (St Pancras) 火車站接機", "currency": "GBP", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "倫敦市中心接機", "currency": "GBP", "price": 0.0, "fixed": 195.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "GBP", "price": 140.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "近校區住宿 (Close to School)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Torquay": {"courses": [{"name": "General English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 300.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 290.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 250.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 220.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 320.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 310.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 280.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 240.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思考試補充課程 (IELTS Supplementary)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 360.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 280.0, "fixed": 0.0, "peak": 0}]}, {"name": "海外語言課程 (Classic Program for 50+)", "category": "英語課程", "currency": "GBP", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 2, "price": 370.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 190.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 240.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 170.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 210.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "GBP", "price": 270.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "GBP", "price": 190.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "St Michael's (Single)", "currency": "GBP", "price": 250.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "GBP", "price": 0.0, "fixed": 140.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "GBP", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "GBP", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "希斯羅 (Heathrow) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 380.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "蓋特威克 (Gatwick) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 480.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "埃克塞特 (Exeter) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 115.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "布里斯托 (Bristol) 機場接機", "currency": "GBP", "price": 0.0, "fixed": 210.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "GBP", "price": 10.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 110.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "GBP", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "GBP", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "GBP", "price": 0.0, "fixed": 1120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "GBP", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "GBP", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "GBP", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "GBP", "price": 40.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "GBP", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "GBP", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}, "Dublin": {"courses": [{"name": "General English", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 350.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 300.0, "fixed": 0.0, "peak": 0}]}, {"name": "Semi-Intensive English", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 400.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 380.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 330.0, "fixed": 0.0, "peak": 0}]}, {"name": "Intensive English", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 460.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 370.0, "fixed": 0.0, "peak": 0}]}, {"name": "Business Supplementary", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 460.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 370.0, "fixed": 0.0, "peak": 0}]}, {"name": "Cambridge General", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 370.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 350.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 330.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 300.0, "fixed": 0.0, "peak": 0}]}, {"name": "Cambridge Supplementary or Intensive", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 460.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 370.0, "fixed": 0.0, "peak": 0}]}, {"name": "雅思補充/強化課程 (IELTS Supplementary/Intensive)", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 460.0, "fixed": 0.0, "peak": 0}, {"wf": 5, "wt": 11, "price": 440.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 19, "price": 410.0, "fixed": 0.0, "peak": 0}, {"wf": 20, "wt": 52, "price": 370.0, "fixed": 0.0, "peak": 0}]}, {"name": "CELTA Teacher Training", "category": "英語課程", "currency": "EUR", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 4, "price": 410.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "EUR", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "EUR", "price": 350.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲+)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "EUR", "price": 230.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/共用衛浴)", "currency": "EUR", "price": 290.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "單人房 (每週14餐/獨立衛浴)", "currency": "EUR", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "寄宿家庭 (18歲以下)", "name": "雙人房 (每週14餐/共用衛浴)", "currency": "EUR", "price": 260.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "LIV Student (Single)", "currency": "EUR", "price": 450.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Arasain P&V (Premium Single)", "currency": "EUR", "price": 440.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Arasain P&V (Standard Single)", "currency": "EUR", "price": 430.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Brewer's Close (Single)", "currency": "EUR", "price": 435.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Cork Street (Studio)", "currency": "EUR", "price": 580.0, "fixed": 0.0, "unit": "按週計算", "note": ""}, {"type": "學生公寓", "name": "Heyday (Single)", "currency": "EUR", "price": 450.0, "fixed": 0.0, "unit": "按週計算", "note": ""}], "fees": [{"category": "註冊", "name": "申請及註冊費 (Application Fee)", "currency": "EUR", "price": 0.0, "fixed": 160.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "行政", "name": "住宿安置費 (Accommodation Placement Fee)", "currency": "EUR", "price": 0.0, "fixed": 40.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "服務費", "name": "變更費 (Change Fee)", "currency": "EUR", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "接機", "name": "都柏林 (Dublin) 機場接機", "currency": "EUR", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "醫療與旅行保險", "currency": "EUR", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "保險", "name": "MEDIPEL 醫療與在籍學員保障 (非歐盟)", "currency": "EUR", "price": 0.0, "fixed": 160.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "在籍學員保障 (非歐盟)", "currency": "EUR", "price": 0.0, "fixed": 50.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "考試費", "name": "雅思考試費 (IELTS Exam Fee)", "currency": "EUR", "price": 0.0, "fixed": 240.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "EUR", "price": 0.0, "fixed": 100.0, "unit": "固定金額", "wf": 1, "wt": 4}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "EUR", "price": 0.0, "fixed": 90.0, "unit": "固定金額", "wf": 5, "wt": 9}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "EUR", "price": 0.0, "fixed": 80.0, "unit": "固定金額", "wf": 10, "wt": 19}, {"category": "課程服務", "name": "一對一課程 (One-to-One)", "currency": "EUR", "price": 0.0, "fixed": 70.0, "unit": "固定金額", "wf": 20, "wt": 99}, {"category": "課程升級", "name": "超級強化升級課程 (Super Intensive Upgrade)", "currency": "EUR", "price": 140.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "保證上午課程 (Guaranteed Morning Class)", "currency": "EUR", "price": 20.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "實習", "name": "虛擬實習 (Virtual Internship)", "currency": "EUR", "price": 0.0, "fixed": 1080.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (12個月)", "currency": "EUR", "price": 0.0, "fixed": 120.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "線上資源", "name": "K+ Online (3個月)", "currency": "EUR", "price": 0.0, "fixed": 60.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "課程服務", "name": "專業沉浸式體驗 (Professional Immersion)", "currency": "EUR", "price": 0.0, "fixed": 800.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "寄宿家庭特殊飲食 (Special Diet)", "currency": "EUR", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "其他服務", "name": "行李寄存 (Luggage Retainer)", "currency": "EUR", "price": 60.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}, {"category": "住宿附加費", "name": "寄宿家庭聖誕節附加費", "currency": "EUR", "price": 70.0, "fixed": 0.0, "unit": "按週計算", "wf": 1, "wt": 99}]}};
const SGIC_DATA={"Toronto": {"courses": [{"name": "Intensive English (30堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 315.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 305.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 295.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 285.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 275.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 265.0, "fixed": 0.0, "peak": 0}]}, {"name": "Full Time Intensive English (40堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 415.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 405.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 395.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 385.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 375.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 365.0, "fixed": 0.0, "peak": 0}]}, {"name": "X-Intensive English (40堂+1:1)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 470.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭", "name": "Room Only 單人房 (無餐)", "currency": "CAD", "price": 280.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Half Board 半食宿 (成人)", "currency": "CAD", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Full Board 全食宿 (成人)", "currency": "CAD", "price": 335.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "行政", "name": "住宿安排費 Accommodation Fee", "currency": "CAD", "price": 230.0, "fixed": 230.0, "unit": "按週計算", "note": "不可退"}], "fees": [{"category": "註冊", "name": "Registration Fee 報名費", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "教材", "name": "Material Fee 教材費", "currency": "CAD", "price": 0.0, "fixed": 60.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "Medical Insurance 醫療保險", "currency": "CAD", "price": 0.0, "fixed": 0.0, "unit": "按天計算", "wf": 1, "wt": 99}]}, "Vancouver": {"courses": [{"name": "Intensive English (30堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 315.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 305.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 295.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 285.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 275.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 265.0, "fixed": 0.0, "peak": 0}]}, {"name": "Full Time Intensive English (40堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 415.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 405.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 395.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 385.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 375.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 365.0, "fixed": 0.0, "peak": 0}]}, {"name": "X-Intensive English (40堂+1:1)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 470.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭", "name": "Room Only 單人房 (無餐)", "currency": "CAD", "price": 285.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Half Board 半食宿 (成人)", "currency": "CAD", "price": 345.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Full Board 全食宿 (成人)", "currency": "CAD", "price": 370.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "行政", "name": "住宿安排費 Accommodation Fee", "currency": "CAD", "price": 230.0, "fixed": 230.0, "unit": "按週計算", "note": "不可退"}], "fees": [{"category": "註冊", "name": "Registration Fee 報名費", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "教材", "name": "Material Fee 教材費", "currency": "CAD", "price": 0.0, "fixed": 60.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "Medical Insurance 醫療保險", "currency": "CAD", "price": 0.0, "fixed": 0.0, "unit": "按天計算", "wf": 1, "wt": 99}]}, "North York": {"courses": [{"name": "Intensive English (30堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 315.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 305.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 295.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 285.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 275.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 265.0, "fixed": 0.0, "peak": 0}]}, {"name": "Full Time Intensive English (40堂/週)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 415.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 405.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 395.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 385.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 375.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 365.0, "fixed": 0.0, "peak": 0}]}, {"name": "X-Intensive English (40堂+1:1)", "category": "英語課程", "currency": "CAD", "unit": "按週計算", "tiers": [{"wf": 1, "wt": 3, "price": 520.0, "fixed": 0.0, "peak": 0}, {"wf": 4, "wt": 11, "price": 510.0, "fixed": 0.0, "peak": 0}, {"wf": 12, "wt": 15, "price": 500.0, "fixed": 0.0, "peak": 0}, {"wf": 16, "wt": 23, "price": 490.0, "fixed": 0.0, "peak": 0}, {"wf": 24, "wt": 31, "price": 480.0, "fixed": 0.0, "peak": 0}, {"wf": 32, "wt": 99, "price": 470.0, "fixed": 0.0, "peak": 0}]}], "accomm": [{"type": "寄宿家庭", "name": "Room Only 單人房 (無餐)", "currency": "CAD", "price": 280.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Half Board 半食宿 (成人)", "currency": "CAD", "price": 320.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "寄宿家庭", "name": "Full Board 全食宿 (成人)", "currency": "CAD", "price": 335.0, "fixed": 0.0, "unit": "按週計算", "note": "旺季6-8月"}, {"type": "行政", "name": "住宿安排費 Accommodation Fee", "currency": "CAD", "price": 230.0, "fixed": 230.0, "unit": "按週計算", "note": "不可退"}], "fees": [{"category": "註冊", "name": "Registration Fee 報名費", "currency": "CAD", "price": 0.0, "fixed": 200.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "教材", "name": "Material Fee 教材費", "currency": "CAD", "price": 0.0, "fixed": 60.0, "unit": "固定金額", "wf": 1, "wt": 99}, {"category": "保險", "name": "Medical Insurance 醫療保險", "currency": "CAD", "price": 0.0, "fixed": 0.0, "unit": "按天計算", "wf": 1, "wt": 99}]}};
const SCHOOL_DATA = {"EP":{"Brisbane":{"courses":[{"name":"經典上午課程 (15h)","category":"課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":400.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (20h)","category":"課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":455.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":430.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"AUD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":135.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"AUD","price":0.0,"fixed":385.0,"unit":"固定金額","note":"18歲以上適用"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (特別半食宿)","currency":"AUD","price":420.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上, 平日2餐/週末3餐"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅供晚餐)","currency":"AUD","price":385.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (不含餐)","currency":"AUD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上, 可自炊"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (特別半食宿)","currency":"AUD","price":385.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 平日2餐/週末3餐"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (僅供晚餐)","currency":"AUD","price":355.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (不含餐)","currency":"AUD","price":310.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"AUD","price":50.0,"fixed":0.0,"unit":"按週計算","note":"如全素、無麩質、清真等"},{"type":"額外加成","name":"額外住宿費 (每晚)","currency":"AUD","price":70.0,"fixed":0.0,"unit":"按天計算","note":"第7晚起算 (延回)"},{"type":"宿舍","name":"EP 學生公寓 (單人房)","currency":"AUD","price":300.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 通勤約40-50分"},{"type":"宿舍","name":"EP 學生公寓 (雙人房單人住)","currency":"AUD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"Double Room Single Occupancy"},{"type":"宿舍","name":"EP 學生公寓 (雙人房)","currency":"AUD","price":450.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"宿舍","name":"Bunk Brisbane (4-6人房)","currency":"AUD","price":415.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 通勤約10分鐘"},{"type":"宿舍","name":"Bunk Brisbane (8-10人房)","currency":"AUD","price":395.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上"},{"type":"宿舍","name":"Bunk Brisbane (女性4人房)","currency":"AUD","price":438.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 限女性"},{"type":"宿舍","name":"Student One (Studio 套房)","currency":"AUD","price":679.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 步行約12分鐘"},{"type":"宿舍","name":"Student One (5房公寓雅房)","currency":"AUD","price":479.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, Shared Room"},{"type":"行政","name":"寢具包 (Student One)","currency":"AUD","price":0.0,"fixed":195.0,"unit":"固定金額","note":"一次性費用 (抵達時支付)"},{"type":"宿舍","name":"CLLIX (Studio 套房)","currency":"AUD","price":1332.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 步行約11分鐘"},{"type":"宿舍","name":"CLLIX (一房公寓)","currency":"AUD","price":1450.0,"fixed":0.0,"unit":"按週計算","note":"1 Bed Apartment"}],"fees":[{"category":"註冊","name":"註冊費","currency":"AUD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"AUD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (中期)","currency":"AUD","price":0.0,"fixed":150.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (長期)","currency":"AUD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (超長期)","currency":"AUD","price":0.0,"fixed":325.0,"unit":"固定金額","wf":24,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"AUD","price":0.0,"fixed":110.0,"unit":"固定金額","wf":1,"wt":99}]},"Canary Wharf":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":325.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":300.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":280.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":255.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":410.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":350.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":300.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":275.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":270.0,"fixed":0.0,"unit":"按週計算","note":"60分車程"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (含早晚餐)","currency":"GBP","price":305.0,"fixed":0.0,"unit":"按週計算","note":"60分車程"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":260.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (含早晚餐)","currency":"GBP","price":290.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Sterling Court 宿舍 (Studio 套房)","currency":"GBP","price":430.0,"fixed":0.0,"unit":"按週計算","note":"18+, 60分車程, 最少1週"},{"type":"宿舍","name":"McMillan Residence 宿舍 (Studio 套房)","currency":"GBP","price":460.0,"fixed":0.0,"unit":"按週計算","note":"18+, 40分車程, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":5,"wt":11}]},"Birmingham":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":345.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":290.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":330.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"通勤約60分"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"GBP","price":240.0,"fixed":0.0,"unit":"按週計算","note":"供早晚餐"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (自炊)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":195.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"GBP","price":220.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (自炊)","currency":"GBP","price":190.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"IQ 51 Studios 宿舍 (Studio 套房)","currency":"GBP","price":295.0,"fixed":0.0,"unit":"按週計算","note":"18+, 通勤15分, 最少4週"},{"type":"宿舍","name":"The Heights 宿舍 (單人套房)","currency":"GBP","price":280.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99}]},"Leeds":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":345.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":290.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":330.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"通勤約60分"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"GBP","price":240.0,"fixed":0.0,"unit":"按週計算","note":"供早晚餐"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (自炊)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":195.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"GBP","price":220.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (自炊)","currency":"GBP","price":190.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"IQ Leeds 宿舍 (單人套房)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少1週"},{"type":"宿舍","name":"Threadworks 宿舍 (單人套房)","currency":"GBP","price":300.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少4週"},{"type":"宿舍","name":"Briggate 宿舍 (Studio 套房)","currency":"GBP","price":320.0,"fixed":0.0,"unit":"按週計算","note":"18+, Studio, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99}]},"Dublin":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":380.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":360.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":280.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":270.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":250.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":230.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程-四天班 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":270.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":250.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":230.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":440.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":420.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":365.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":315.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":295.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":275.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":590.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":550.0,"fixed":0.0,"peak":0}]},{"name":"打工遊學套裝課程 (25週)","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":25,"wt":25,"price":0.0,"fixed":6500.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":5250.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":8625.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":6375.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":130.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":75.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"EUR","price":285.0,"fixed":0.0,"unit":"按週計算","note":"16+, Half Board"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (全食宿)","currency":"EUR","price":300.0,"fixed":0.0,"unit":"按週計算","note":"16+, Full Board"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"EUR","price":275.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (全食宿)","currency":"EUR","price":290.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"深夜入住費 (Late check-in)","currency":"EUR","price":0.0,"fixed":80.0,"unit":"固定金額","note":"23:00 - 07:00 (Mon-Sun)"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"EUR","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Shared House 雅房 (單人)","currency":"EUR","price":300.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 50分車程, 共用衛浴"},{"type":"宿舍","name":"Shared House 雅房 (雙人)","currency":"EUR","price":230.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 共用衛浴"},{"type":"宿舍","name":"Shared House 雅房 (三人)","currency":"EUR","price":195.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 共用衛浴"},{"type":"宿舍","name":"Shared House 套房 (雙人)","currency":"EUR","price":240.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 獨立衛浴 (Ensuite)"},{"type":"宿舍","name":"Shared House 套房 (三人)","currency":"EUR","price":205.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 獨立衛浴 (Ensuite)"},{"type":"宿舍","name":"Niche Living 宿舍 (單人 Studio)","currency":"EUR","price":700.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5分步行, 短期價"},{"type":"宿舍","name":"Niche Living 宿舍 (單人 Studio)","currency":"EUR","price":535.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5分步行, 8週以上優惠"},{"type":"宿舍","name":"Niche Living 宿舍 (雙人 Studio)","currency":"EUR","price":375.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 短期價"},{"type":"宿舍","name":"Niche Living 宿舍 (雙人 Studio)","currency":"EUR","price":295.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 8週以上優惠"},{"type":"飯店","name":"Royal Marine Hotel (單人含早)","currency":"EUR","price":900.0,"fixed":0.0,"unit":"按週計算","note":"淡季價格 (01/01-03/30)"},{"type":"飯店","name":"Royal Marine Hotel (單人含早)","currency":"EUR","price":1200.0,"fixed":0.0,"unit":"按週計算","note":"旺季價格 (04/01-12/31)"},{"type":"飯店","name":"Royal Marine Hotel (雙人無早)","currency":"EUR","price":500.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 淡季 (01/01-03/30)"},{"type":"飯店","name":"Royal Marine Hotel (雙人無早)","currency":"EUR","price":650.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 旺季 (04/01-12/31)"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"學員保護費 (PEL Fee)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"考試費 (TIE)","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"考試費 (IELTS)","currency":"EUR","price":0.0,"fixed":250.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":5,"wt":12}]},"Berlin":{"courses":[{"name":"德語經典上午課程 (20h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"德語半密集上午課程 (25h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"德語白金課程 (30h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":485.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":470.0,"fixed":0.0,"peak":0}]},{"name":"英語經典下午課程 (20h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"英語半密集下午課程 (25h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"英語白金課程 (30h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":485.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":470.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程 (德語/英語)","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"EUR","price":305.0,"fixed":0.0,"unit":"按週計算","note":"需另付 7.5% 城市稅"},{"type":"額外加成","name":"聖誕節加價 (12/21-01/04)","currency":"EUR","price":65.0,"fixed":0.0,"unit":"按週計算","note":"Christmas Supplement"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"深夜入住費 (Late check-in)","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"22:00 - 06:00"},{"type":"宿舍","name":"Kiez Hostel 青年旅館 (多人房)","currency":"EUR","price":150.0,"fixed":0.0,"unit":"按週計算","note":"共用衛浴, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Kiez Hostel 青年旅館 (單人房)","currency":"EUR","price":363.0,"fixed":0.0,"unit":"按週計算","note":"共用衛浴, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio 套房)","currency":"EUR","price":596.0,"fixed":0.0,"unit":"按週計算","note":"1-3週短租價, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio 套房)","currency":"EUR","price":483.0,"fixed":0.0,"unit":"按週計算","note":"4週以上優惠, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (雙人 Studio)","currency":"EUR","price":644.0,"fixed":0.0,"unit":"按週計算","note":"價格為整間房價 (兩人均分), 需兩人同行"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (雙人 Studio)","currency":"EUR","price":555.0,"fixed":0.0,"unit":"按週計算","note":"價格為整間房價 (兩人均分), 需兩人同行"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio XL)","currency":"EUR","price":813.0,"fixed":0.0,"unit":"按週計算","note":"加大套房, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio XL)","currency":"EUR","price":716.0,"fixed":0.0,"unit":"按週計算","note":"加大套房, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (一房公寓)","currency":"EUR","price":902.0,"fixed":0.0,"unit":"按週計算","note":"Apartment, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (一房公寓)","currency":"EUR","price":805.0,"fixed":0.0,"unit":"按週計算","note":"Apartment, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Berlin Prenzlauer Berg 宿舍 (Studio)","currency":"EUR","price":588.0,"fixed":0.0,"unit":"按週計算","note":"1-3週短租價, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Berlin Prenzlauer Berg 宿舍 (Studio)","currency":"EUR","price":475.0,"fixed":0.0,"unit":"按週計算","note":"4週以上優惠, 需另付 7.5% 城市稅"},{"type":"飯店","name":"Meininger Hotel (單人含早)","currency":"EUR","price":555.0,"fixed":0.0,"unit":"按週計算","note":"旺季加價邏輯, 需另付 7.5% 城市稅"},{"type":"飯店","name":"Meininger Hotel (雙人含早)","currency":"EUR","price":660.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 需另付 7.5% 城市稅"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":70.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99}]},"Paris":{"courses":[{"name":"法語經典上午課程 (20h)","category":"法語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"法語半密集上午課程 (25h)","category":"法語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"英語經典下午課程 (20h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"英語半密集下午課程 (25h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程 (法語/英語)","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (半食宿)","currency":"EUR","price":440.0,"fixed":0.0,"unit":"按週計算","note":"18+ (提供早晚餐)"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅含早餐)","currency":"EUR","price":355.0,"fixed":0.0,"unit":"按週計算","note":"18+ (僅提供早餐)"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (半食宿)","currency":"EUR","price":422.0,"fixed":0.0,"unit":"按週計算","note":"18+, 需兩人同行 (每人價格)"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (僅含早餐)","currency":"EUR","price":337.0,"fixed":0.0,"unit":"按週計算","note":"18+, 需兩人同行 (每人價格)"},{"type":"寄宿家庭","name":"寄宿家庭-未成年單人房 (半食宿)","currency":"EUR","price":530.0,"fixed":0.0,"unit":"按週計算","note":"16-17歲專用價格 (含監護)"},{"type":"額外加成","name":"聖誕節加價 (12/20-12/28)","currency":"EUR","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Enjoy Hostel 2* 青年旅館 (3人房)","currency":"EUR","price":350.0,"fixed":0.0,"unit":"按週計算","note":"需另付城市稅 (約€2.60/晚)"},{"type":"公寓","name":"Adagio XV 公寓 (單人 Studio)","currency":"EUR","price":775.0,"fixed":0.0,"unit":"按週計算","note":"最少4週, 需另付城市稅 (約€5.20/晚)"},{"type":"公寓","name":"Adagio Access Vanves (單人 Studio)","currency":"EUR","price":680.0,"fixed":0.0,"unit":"按週計算","note":"最少4週, 需另付城市稅 (約€5.53/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (單人套房)","currency":"EUR","price":780.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (雙人房共用衛浴)","currency":"EUR","price":548.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (三人高級房)","currency":"EUR","price":550.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":70.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99}]},"Toronto":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":430.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":420.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":410.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25堂)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":480.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":470.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":460.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"CAD","price":0.0,"fixed":250.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"行政","name":"住宿急件安排費","currency":"CAD","price":0.0,"fixed":150.0,"unit":"固定金額","note":"抵達前1週內預訂需加收"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (自炊)","currency":"CAD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅含早餐)","currency":"CAD","price":350.0,"fixed":0.0,"unit":"按週計算","note":"Bed & Breakfast"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (半食宿)","currency":"CAD","price":360.0,"fixed":0.0,"unit":"按週計算","note":"Half Board (18歲以下強制)"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (全食宿)","currency":"CAD","price":390.0,"fixed":0.0,"unit":"按週計算","note":"Full Board"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (半食宿)","currency":"CAD","price":312.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (全食宿)","currency":"CAD","price":336.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":55.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"CAD","price":45.0,"fixed":0.0,"unit":"按週計算","note":"Private bathroom"},{"type":"宿舍","name":"CASA - Residence 宿舍 (雙人房共用衛浴)","currency":"CAD","price":365.0,"fixed":0.0,"unit":"按週計算","note":"18+, Shared bedroom & shared bathroom"},{"type":"宿舍","name":"CASA - Residence 宿舍 (雙人房共用衛浴)","currency":"CAD","price":365.0,"fixed":0.0,"unit":"按週計算","note":"18+, Shared bedroom & shared bathroom"},{"type":"宿舍","name":"CASA - Student House 宿舍 (單人房共用衛浴)","currency":"CAD","price":400.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Student House 宿舍 (單人房共用衛浴)","currency":"CAD","price":400.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房共用衛浴)","currency":"CAD","price":465.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房共用衛浴)","currency":"CAD","price":440.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房半獨立衛浴)","currency":"CAD","price":515.0,"fixed":0.0,"unit":"按週計算","note":"18+, Semi-private bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房半獨立衛浴)","currency":"CAD","price":490.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"},{"type":"宿舍","name":"CASA - Dreamhouse Yorkville (單人房獨立衛浴)","currency":"CAD","price":615.0,"fixed":0.0,"unit":"按週計算","note":"18+, Private bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Yorkville (單人房獨立衛浴)","currency":"CAD","price":590.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"}],"fees":[{"category":"註冊","name":"註冊費","currency":"CAD","price":0.0,"fixed":175.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"監護人信函費 (Custodianship)","currency":"CAD","price":0.0,"fixed":125.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":85.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":170.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":12,"wt":24}]},"Dubai":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":350.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":305.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":285.0,"fixed":0.0,"peak":0}]},{"name":"經典早午餐課程 (20堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":320.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":275.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":255.0,"fixed":0.0,"peak":0}]},{"name":"經典輕量彈性課程 (15堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":280.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":235.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":215.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":505.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":465.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":125.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"宿舍","name":"ESAW 宿舍 (雙人房-4人共用)","currency":"USD","price":240.0,"fixed":0.0,"unit":"按週計算","note":"Twin Room (up to 4 students), Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (雙人房-5人共用)","currency":"USD","price":230.0,"fixed":0.0,"unit":"按週計算","note":"Twin Room (up to 5 students), Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (雙人 Studio)","currency":"USD","price":330.0,"fixed":0.0,"unit":"按週計算","note":"Twin studio, Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (單人雅房)","currency":"USD","price":305.0,"fixed":0.0,"unit":"按週計算","note":"Private Room (6人共用衛浴), Shuttle 20 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (雙人房)","currency":"USD","price":350.0,"fixed":0.0,"unit":"按週計算","note":"Twin room, 1-2週短期價, Shuttle 40 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (雙人房)","currency":"USD","price":260.0,"fixed":0.0,"unit":"按週計算","note":"Twin room, 3週以上優惠價, Shuttle 40 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人房)","currency":"USD","price":520.0,"fixed":0.0,"unit":"按週計算","note":"Single room, 1-2週短期價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人房)","currency":"USD","price":450.0,"fixed":0.0,"unit":"按週計算","note":"Single room, 3週以上優惠價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人 Studio)","currency":"USD","price":570.0,"fixed":0.0,"unit":"按週計算","note":"Single studio, 1-2週短期價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人 Studio)","currency":"USD","price":500.0,"fixed":0.0,"unit":"按週計算","note":"Single studio, 3週以上優惠價"}],"fees":[{"category":"註冊","name":"註冊費","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":65.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":130.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":190.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":260.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"USD","price":0.0,"fixed":130.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"USD","price":0.0,"fixed":260.0,"unit":"固定金額","wf":5,"wt":12}]},"Malta":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":295.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":255.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":190.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":240.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":200.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":190.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]},{"name":"經典晚間課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":200.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":160.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":130.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":315.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":265.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":200.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":285.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":245.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":265.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":200.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":535.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":105.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":35.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"宿舍","name":"Student Residence Campus Hub (單人套房)","currency":"EUR","price":375.0,"fixed":0.0,"unit":"按週計算","note":"16+, 20分車程, Single En-suite"},{"type":"宿舍","name":"Student Residence Campus Hub (雙人套房)","currency":"EUR","price":250.0,"fixed":0.0,"unit":"按週計算","note":"16+, 20分車程, Twin En-suite"},{"type":"宿舍","name":"Shared Apartments (標準合住房)","currency":"EUR","price":190.0,"fixed":0.0,"unit":"按週計算","note":"18+, 30分車程, Shared Room"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"稅金","name":"環境稅 (ECO Tax)","currency":"EUR","price":0.0,"fixed":5.0,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證服務費 (Visa Service)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證費 (Extended)","currency":"EUR","price":0.0,"fixed":160.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":47.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":94.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":141.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":188.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":94.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":188.0,"unit":"固定金額","wf":5,"wt":11}]}},"ILSC":{"Adelaide":ILSC_AUSTRALIA,"Brisbane":ILSC_AUSTRALIA,"Melbourne":ILSC_AUSTRALIA,"Perth":ILSC_AUSTRALIA,"Sydney":ILSC_AUSTRALIA,"Montréal":ILSC_CANADA,"Toronto":ILSC_CANADA,"Vancouver":ILSC_CANADA,"Dublin":ILSC_IRELAND,"New Delhi":ILSC_INDIA},"EC":{"Boston":{"courses":[{"name":"Vacation English (GE20)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":505,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":570,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":510,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":480,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":585,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":535,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":505,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":650,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":595,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":525,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":570,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":510,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":570,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":650,"fixed":0,"peak":25}]},{"name":"English & Exam Prep (GE20+10 IELTS)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":650,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":595,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":40,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 B&B","currency":"USD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-65分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"USD","price":370,"fixed":0,"unit":"按週計算","note":"通勤30-65分"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"USD","price":370,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"USD","price":440,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Overlook 單人房獨衛自炊","currency":"USD","price":785,"fixed":0,"unit":"按週計算","note":"通勤50分;24週不收旺季"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"USD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"USD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"USD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":95,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 BOS (單程)","currency":"USD","price":0,"fixed":180,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":170,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":80,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"美國優先國際郵寄","currency":"USD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":35,"unit":"固定金額","wf":1,"wt":99}]},"New York":{"courses":[{"name":"Vacation English (GE20)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":580,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":530,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":495,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":645,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":590,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":515,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":645,"fixed":0,"peak":25}]},{"name":"TOEFL Prep (TOEFL20)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0}]},{"name":"TOEFL Prep (TOEFL20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":645,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":590,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"Dance 舞蹈加課","category":"課程","currency":"USD","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":175,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":40,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 B&B","currency":"USD","price":385,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"USD","price":460,"fixed":0,"unit":"按週計算","note":"通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"USD","price":500,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"USD","price":535,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"曼哈頓 單人房 B&B","currency":"USD","price":655,"fixed":0,"unit":"按週計算","note":"通勤25-45分"},{"type":"寄宿家庭","name":"曼哈頓 單人房 半食宿","currency":"USD","price":785,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"Midtown 雙人房共衛自炊","currency":"USD","price":500,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Midtown 單人房獨衛自炊","currency":"USD","price":850,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"公寓","name":"Upper West Side 單人房共衛自炊","currency":"USD","price":745,"fixed":0,"unit":"按週計算","note":"通勤25分"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"USD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"USD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"USD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":95,"unit":"固定金額","note":""}],"fees":[{"category":"雜費","name":"Landmark Fee","currency":"USD","price":0,"fixed":10,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 JFK/LGA/EWR (單程)","currency":"USD","price":0,"fixed":195,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":170,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":80,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"美國優先國際郵寄","currency":"USD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":35,"unit":"固定金額","wf":1,"wt":99}]},"New York 30+":{"courses":[{"name":"Vacation English (GE20)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":475,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":580,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":530,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":500,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":645,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":590,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":520,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":565,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":645,"fixed":0,"peak":25}]},{"name":"EC Escapes 50+ (1週)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":1,"price":905,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (2週)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":2,"wt":99,"price":825,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"Dancing 舞蹈加課","category":"課程","currency":"USD","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":175,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":40,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 B&B","currency":"USD","price":385,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"USD","price":460,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"USD","price":500,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"USD","price":535,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"曼哈頓 單人房 B&B","currency":"USD","price":655,"fixed":0,"unit":"按週計算","note":"通勤25-45分"},{"type":"寄宿家庭","name":"曼哈頓 單人房 半食宿","currency":"USD","price":785,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"Midtown 雙人房共衛自炊","currency":"USD","price":500,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Midtown 單人房獨衛自炊","currency":"USD","price":850,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"公寓","name":"Upper West Side 單人房共衛自炊","currency":"USD","price":745,"fixed":0,"unit":"按週計算","note":"通勤25分"},{"type":"額外加成","name":"聖誕節加價","currency":"USD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"USD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":95,"unit":"固定金額","note":""}],"fees":[{"category":"雜費","name":"Landmark Fee","currency":"USD","price":0,"fixed":10,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 JFK/LGA/EWR (單程)","currency":"USD","price":0,"fixed":195,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":170,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":80,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"美國優先國際郵寄","currency":"USD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":35,"unit":"固定金額","wf":1,"wt":99}]},"San Francisco":{"courses":[{"name":"Vacation English (GE20)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":435,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":515,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":425,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":525,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":455,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":580,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":530,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":515,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":580,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":40,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 B&B","currency":"USD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"USD","price":370,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"USD","price":370,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"USD","price":440,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"Columbus 單人房共衛自炊","currency":"USD","price":600,"fixed":0,"unit":"按週計算","note":"最少4週,通勤10分"},{"type":"公寓","name":"The Kenmore 雙人房共衛半食宿","currency":"USD","price":550,"fixed":0,"unit":"按週計算","note":"最少2週,16+"},{"type":"公寓","name":"The Kenmore 單人房公共衛半食宿","currency":"USD","price":680,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"公寓","name":"The Kenmore 單人房獨衛半食宿","currency":"USD","price":765,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"USD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"USD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"USD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":95,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 SFO (單程)","currency":"USD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":170,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":80,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"美國優先國際郵寄","currency":"USD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":35,"unit":"固定金額","wf":1,"wt":99}]},"San Diego":{"courses":[{"name":"General English 20","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":370,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":360,"fixed":0,"peak":0}]},{"name":"General English 23","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":380,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":340,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":320,"fixed":0,"peak":0}]},{"name":"General English 28","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":460,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":450,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":430,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":390,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"Academic English 23 (GE20+AE3)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0}]},{"name":"Academic English 24 (GE20+AE4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":380,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":340,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":320,"fixed":0,"peak":0}]},{"name":"Academic English 28 (GE20+AE8)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":460,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":450,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":430,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":390,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"English Plus Career Dev 23 (GE20+CD3)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0}]},{"name":"English Plus Career Dev 24 (GE20+CD4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":380,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":340,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":320,"fixed":0,"peak":0}]},{"name":"English Plus Career Dev 28 (GE20+CD8)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":460,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":450,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":430,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":390,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"TOEFL Prep 23 (GE20+TOEFL3)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0}]},{"name":"TOEFL Prep 24 (GE20+TOEFL4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":380,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":340,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":320,"fixed":0,"peak":0}]},{"name":"TOEFL Prep 28 (GE24+TOEFL4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":460,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":450,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":430,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":390,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"Cambridge CAE23 (GE20+CAE3)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0}]},{"name":"Cambridge CAE24 (GE20+CAE4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":410,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":400,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":380,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":340,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":320,"fixed":0,"peak":0}]},{"name":"Cambridge CAE28 (GE24+CAE4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":460,"fixed":0,"peak":0},{"wf":7,"wt":12,"price":450,"fixed":0,"peak":0},{"wf":13,"wt":19,"price":430,"fixed":0,"peak":0},{"wf":20,"wt":29,"price":390,"fixed":0,"peak":0},{"wf":30,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"Global Pathway 28 (GE20+GP8)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":6880,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":85,"fixed":0,"peak":0}]},{"name":"Surfing 衝浪加課","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":200,"fixed":0,"peak":0}]},{"name":"Volunteering 志工","category":"課程","currency":"USD","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":250,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房共衛早餐","currency":"USD","price":330,"fixed":0,"unit":"按週計算","note":"通勤30-75分;1-4週"},{"type":"額外加成","name":"寄宿家庭-雙人房共衛早餐 額外住宿(每晚)","currency":"USD","price":90,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"寄宿家庭","name":"寄宿家庭-單人房共衛早餐","currency":"USD","price":360,"fixed":0,"unit":"按週計算","note":"通勤30-75分;1-4週"},{"type":"額外加成","name":"寄宿家庭-單人房共衛早餐 額外住宿(每晚)","currency":"USD","price":90,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房共衛早晚餐","currency":"USD","price":360,"fixed":0,"unit":"按週計算","note":";1-4週"},{"type":"額外加成","name":"寄宿家庭-雙人房共衛早晚餐 額外住宿(每晚)","currency":"USD","price":90,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"寄宿家庭","name":"寄宿家庭-單人房共衛早晚餐","currency":"USD","price":390,"fixed":0,"unit":"按週計算","note":";1-4週"},{"type":"額外加成","name":"寄宿家庭-單人房共衛早晚餐 額外住宿(每晚)","currency":"USD","price":90,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"寄宿家庭","name":"寄宿家庭-單人房獨衛早晚餐","currency":"USD","price":490,"fixed":0,"unit":"按週計算","note":";1-4週"},{"type":"額外加成","name":"寄宿家庭-單人房獨衛早晚餐 額外住宿(每晚)","currency":"USD","price":100,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"寄宿家庭","name":"Premium 寄宿家庭-單人房共衛早晚餐","currency":"USD","price":490,"fixed":0,"unit":"按週計算","note":"通勤最多35分;1-4週"},{"type":"額外加成","name":"Premium 寄宿家庭-單人房共衛早晚餐 額外住宿(每晚)","currency":"USD","price":100,"fixed":0,"unit":"按天計算","note":"延住每晚"},{"type":"行政","name":"寄宿家庭安排費","currency":"USD","price":0,"fixed":200,"unit":"固定金額","note":""},{"type":"行政","name":"宿舍/公寓安排費","currency":"USD","price":0,"fixed":100,"unit":"固定金額","note":""},{"type":"額外加成","name":"特殊飲食(無乳糖/無麩質/全素)","currency":"USD","price":50,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食(清真)","currency":"USD","price":75,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"CEL Standard 雙人房共衛自炊","currency":"USD","price":290,"fixed":0,"unit":"按週計算","note":"通勤10-20分;1-11週"},{"type":"公寓","name":"CEL Standard 單人房共衛自炊","currency":"USD","price":530,"fixed":0,"unit":"按週計算","note":"通勤10-20分;1-11週"},{"type":"公寓","name":"CEL Premium 雙人房獨衛自炊","currency":"USD","price":360,"fixed":0,"unit":"按週計算","note":"通勤20分;1-11週"},{"type":"公寓","name":"CEL Premium 單人房獨衛自炊","currency":"USD","price":720,"fixed":0,"unit":"按週計算","note":"通勤20分;1-11週"},{"type":"公寓","name":"CEL Superior 雙人房獨衛自炊","currency":"USD","price":410,"fixed":0,"unit":"按週計算","note":"步行25分;1-11週"},{"type":"公寓","name":"CEL Superior 單人房獨衛自炊","currency":"USD","price":820,"fixed":0,"unit":"按週計算","note":"步行25分;1-11週"}],"fees":[{"category":"實習","name":"EPE Sequential 12週 (4+8) 總額","currency":"USD","price":0,"fixed":2570,"unit":"固定金額","wf":1,"wt":99},{"category":"實習","name":"EPE Combined 12週 (4+8) 總額","currency":"USD","price":0,"fixed":5750,"unit":"固定金額","wf":1,"wt":99},{"category":"實習","name":"EPE Combined 24週 (4+20) 總額","currency":"USD","price":0,"fixed":9110,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 SAN (單程)","currency":"USD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"學習教材費","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":4,"fixed":0,"unit":"按天計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99}]},"Los Angeles":{"courses":[{"name":"Vacation English 20","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":430,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":455,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":425,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":450,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":575,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":525,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":475,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":455,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":575,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":40,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 B&B","currency":"USD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-70分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"USD","price":365,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"USD","price":365,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"USD","price":440,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Santa Monica 雙人房共衛自炊","currency":"USD","price":520,"fixed":0,"unit":"按週計算","note":"最少4週,通勤10分"},{"type":"公寓","name":"Santa Monica 單人房獨衛自炊","currency":"USD","price":955,"fixed":0,"unit":"按週計算","note":"最少4週"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"USD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"USD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"USD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":95,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 LAX (單程)","currency":"USD","price":0,"fixed":165,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":170,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"I-20 文件快遞費","currency":"USD","price":0,"fixed":80,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"美國優先國際郵寄","currency":"USD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":35,"unit":"固定金額","wf":1,"wt":99}]},"Montreal":{"courses":[{"name":"General English/French 20","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":420,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":405,"fixed":0,"peak":0}]},{"name":"General English/French 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":440,"fixed":0,"peak":0}]},{"name":"General English/French 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":455,"fixed":0,"peak":0}]},{"name":"General English/French 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":495,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":440,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510,"fixed":0,"peak":25}]},{"name":"Young Achievers E/F (GE20+4 SF)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":440,"fixed":0,"peak":0}]},{"name":"Bilingual 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":420,"fixed":0,"peak":0}]},{"name":"Bilingual 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":435,"fixed":0,"peak":0}]},{"name":"Bilingual 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"Gastronomy 美食加課","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":310,"fixed":0,"peak":0}]},{"name":"Bartending 調酒加課","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":175,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"CAD","price":270,"fixed":0,"unit":"按週計算","note":"通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"CAD","price":300,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"CAD","price":320,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 全食宿","currency":"CAD","price":365,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"La Marq au 515 單人房共衛自炊","currency":"CAD","price":495,"fixed":0,"unit":"按週計算","note":"通勤20分,含抵達接機"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"CAD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"CAD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"CAD","price":0,"fixed":230,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 YUL (單程)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"CAD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險 (最高64歲)","currency":"CAD","price":30,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (65-70歲)","currency":"CAD","price":58,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"CAD","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"加拿大監護費","currency":"CAD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99}]},"Toronto":{"courses":[{"name":"General English 20","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":410,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":400,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":435,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":490,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25}]},{"name":"English in the City (GE20+4)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"Exam Prep IELTS/TOEFL/TOEIC","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":410,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"CAD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"CAD","price":345,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Parker 經濟單人房共衛自炊","currency":"CAD","price":575,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"公寓","name":"The Parker 單人房共衛自炊","currency":"CAD","price":600,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Parker 單人房獨衛自炊","currency":"CAD","price":715,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Ledbury 經濟單人房共衛自炊","currency":"CAD","price":560,"fixed":0,"unit":"按週計算","note":"通勤35分"},{"type":"公寓","name":"The Ledbury 單人房共衛自炊","currency":"CAD","price":580,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Ledbury 單人房獨衛自炊","currency":"CAD","price":680,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"HOEM 暑期宿舍 單人房共衛自炊","currency":"CAD","price":600,"fixed":0,"unit":"按週計算","note":"通勤30分,6/6-8/15"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"CAD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"CAD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"CAD","price":0,"fixed":230,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 YYZ (單程)","currency":"CAD","price":0,"fixed":135,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"CAD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險 (最高64歲)","currency":"CAD","price":30,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (65-70歲)","currency":"CAD","price":58,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"CAD","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"加拿大監護費","currency":"CAD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"省證明信 LOA","currency":"CAD","price":0,"fixed":110,"unit":"固定金額","wf":1,"wt":99}]},"Toronto 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":410,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":400,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":435,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":490,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"CAD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤45-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"CAD","price":345,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Parker 經濟單人房共衛自炊","currency":"CAD","price":575,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"公寓","name":"The Parker 單人房共衛自炊","currency":"CAD","price":600,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Parker 單人房獨衛自炊","currency":"CAD","price":715,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Ledbury 經濟單人房共衛自炊","currency":"CAD","price":560,"fixed":0,"unit":"按週計算","note":"通勤35分"},{"type":"公寓","name":"The Ledbury 單人房共衛自炊","currency":"CAD","price":580,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"The Ledbury 單人房獨衛自炊","currency":"CAD","price":680,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"HOEM 暑期宿舍 單人房共衛自炊","currency":"CAD","price":600,"fixed":0,"unit":"按週計算","note":"通勤30分,6/6-8/15"},{"type":"額外加成","name":"聖誕節加價","currency":"CAD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"CAD","price":0,"fixed":230,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 YYZ (單程)","currency":"CAD","price":0,"fixed":135,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"CAD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險 (最高64歲)","currency":"CAD","price":30,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (65-70歲)","currency":"CAD","price":58,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"CAD","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"省證明信 LOA","currency":"CAD","price":0,"fixed":110,"unit":"固定金額","wf":1,"wt":99}]},"Vancouver":{"courses":[{"name":"General English 20","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":410,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":400,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":435,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":490,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"Cambridge Exam Prep","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"CAD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤40-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"CAD","price":345,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Richards & Pender 單人房獨衛自炊","currency":"CAD","price":765,"fixed":0,"unit":"按週計算","note":"通勤5分"},{"type":"宿舍","name":"Vancouver Student House 經濟單人共衛","currency":"CAD","price":435,"fixed":0,"unit":"按週計算","note":"最少2週,通勤25-45分"},{"type":"宿舍","name":"Vancouver Student House 單人房共衛","currency":"CAD","price":500,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"Vancouver Student House 單人房獨衛","currency":"CAD","price":535,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"GEC Pearson 單人房獨衛自炊","currency":"CAD","price":605,"fixed":0,"unit":"按週計算","note":"5/2-8/29,通勤25-45分"},{"type":"公寓","name":"Gastown 經濟單人房共衛自炊","currency":"CAD","price":615,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"公寓","name":"Gastown 單人房共衛自炊","currency":"CAD","price":640,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Gastown 單人房獨衛自炊","currency":"CAD","price":720,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"未成年加價 (U18)","currency":"CAD","price":25,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"CAD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"CAD","price":0,"fixed":230,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 YVR (單程)","currency":"CAD","price":0,"fixed":135,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"CAD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險 (最高64歲)","currency":"CAD","price":30,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (65-70歲)","currency":"CAD","price":58,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"CAD","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"加拿大監護費","currency":"CAD","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"省證明信 LOA","currency":"CAD","price":0,"fixed":110,"unit":"固定金額","wf":1,"wt":99}]},"Vancouver 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":410,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":400,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":435,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":465,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":505,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":490,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+4)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":480,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":460,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":155,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"CAD","price":325,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤40-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"CAD","price":345,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Richards & Pender 單人房獨衛自炊","currency":"CAD","price":765,"fixed":0,"unit":"按週計算","note":"通勤5分"},{"type":"宿舍","name":"Vancouver Student House 經濟單人共衛","currency":"CAD","price":435,"fixed":0,"unit":"按週計算","note":"最少2週,通勤25-45分"},{"type":"宿舍","name":"Vancouver Student House 單人房共衛","currency":"CAD","price":500,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"Vancouver Student House 單人房獨衛","currency":"CAD","price":535,"fixed":0,"unit":"按週計算","note":"最少2週"},{"type":"宿舍","name":"GEC Pearson 單人房獨衛自炊","currency":"CAD","price":605,"fixed":0,"unit":"按週計算","note":"5/2-8/29,通勤25-45分"},{"type":"公寓","name":"Gastown 經濟單人房共衛自炊","currency":"CAD","price":615,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"公寓","name":"Gastown 單人房共衛自炊","currency":"CAD","price":640,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Gastown 單人房獨衛自炊","currency":"CAD","price":720,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"聖誕節加價","currency":"CAD","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"CAD","price":0,"fixed":230,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 YVR (單程)","currency":"CAD","price":0,"fixed":135,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"CAD","price":10,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"CAD","price":0,"fixed":120,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"CAD","price":0,"fixed":140,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"法語教材費","currency":"CAD","price":0,"fixed":0,"unit":"固定金額","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (最高64歲)","currency":"CAD","price":30,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"保險","name":"選配學生保險 (65-70歲)","currency":"CAD","price":58,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"CAD","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"省證明信 LOA","currency":"CAD","price":0,"fixed":110,"unit":"固定金額","wf":1,"wt":99}]},"London":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":330,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":450,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":390,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":450,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20}]},{"name":"Exam Prep IELTS","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":290,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤最多60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":250,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":305,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"未成年加價 (U18)","currency":"GBP","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"靠近學校加價(最多45分)","currency":"GBP","price":60,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"獨立衛浴加價(30-60分)","currency":"GBP","price":100,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"iQ Highbury 單人房獨衛自炊","currency":"GBP","price":510,"fixed":0,"unit":"按週計算","note":"通勤23分"},{"type":"宿舍","name":"iQ Shoreditch Studio獨衛自炊","currency":"GBP","price":625,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 LHR (單程)","currency":"GBP","price":0,"fixed":210,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":240,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 STN (單程)","currency":"GBP","price":0,"fixed":240,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LTN (單程)","currency":"GBP","price":0,"fixed":235,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LCY (單程)","currency":"GBP","price":0,"fixed":185,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 St Pancras 車站 (單程)","currency":"GBP","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"London 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":330,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":390,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":360,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":460,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":415,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":375,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":450,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":390,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":450,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":20}]},{"name":"Business English 25+","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (1週)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":1,"price":730,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (2週)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":2,"wt":99,"price":665,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":290,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤最多60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":250,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":305,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"靠近學校加價(最多45分)","currency":"GBP","price":60,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"獨立衛浴加價(30-60分)","currency":"GBP","price":100,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"iQ Highbury 單人房獨衛自炊","currency":"GBP","price":510,"fixed":0,"unit":"按週計算","note":"通勤23分"},{"type":"宿舍","name":"iQ Shoreditch Studio獨衛自炊","currency":"GBP","price":625,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 LHR (單程)","currency":"GBP","price":0,"fixed":210,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":240,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 STN (單程)","currency":"GBP","price":0,"fixed":240,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LTN (單程)","currency":"GBP","price":0,"fixed":235,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LCY (單程)","currency":"GBP","price":0,"fixed":185,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 St Pancras 車站 (單程)","currency":"GBP","price":0,"fixed":140,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Cambridge":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":375,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":390,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":340,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20}]},{"name":"Exam Prep IELTS","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":375,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0}]},{"name":"FlexiTrack Standard (12GE+4 1:1)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":515,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":485,"fixed":0,"peak":0}]},{"name":"FlexiTrack Intensive (12GE+10EfW+4 1:1)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":625,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":595,"fixed":0,"peak":0}]},{"name":"English Now FE Standard (12GE+8AE)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":375,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"English Now FE Intensive (12GE+8AE+10Exam)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":390,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":340,"fixed":0,"peak":0}]},{"name":"English Now Global Success Std (12GE+8GS)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":375,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"English Now Global Success Int (12GE+8GS+10SF)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":390,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":340,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":220,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":275,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"Student Castle Studio獨衛自炊","currency":"GBP","price":450,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Newmarket Road 單人房共衛自炊","currency":"GBP","price":300,"fixed":0,"unit":"按週計算","note":"通勤30分,至6/21"},{"type":"宿舍","name":"Newmarket Road 單人房獨衛自炊","currency":"GBP","price":325,"fixed":0,"unit":"按週計算","note":"至6/21"},{"type":"宿舍","name":"Anglia House 暑期 單人房獨衛自炊","currency":"GBP","price":430,"fixed":0,"unit":"按週計算","note":"6/27-8/15,通勤25分"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"GBP","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 STN (單程)","currency":"GBP","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LTN (單程)","currency":"GBP","price":0,"fixed":155,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 SEN (單程)","currency":"GBP","price":0,"fixed":210,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LHR/LCY/St Pancras (單程)","currency":"GBP","price":0,"fixed":245,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":260,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Brighton":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":290,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":360,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20}]},{"name":"Exam Prep IELTS 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":340,"fixed":0,"peak":0}]},{"name":"Exam Prep IELTS 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":220,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":275,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"未成年加價 (U18)","currency":"GBP","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"獨立衛浴加價","currency":"GBP","price":90,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"Abacus House 單人房獨衛自炊","currency":"GBP","price":390,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Pavilion Point Studio獨衛自炊","currency":"GBP","price":430,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"宿舍","name":"North Laine 青年(16-17) 單人獨衛半食宿","currency":"GBP","price":505,"fixed":0,"unit":"按週計算","note":"6/27-8/22,通勤9分"},{"type":"宿舍","name":"North Laine 18+ 單人房獨衛自炊","currency":"GBP","price":425,"fixed":0,"unit":"按週計算","note":"6/27-8/29"},{"type":"宿舍","name":"North Laine 18+ Studio獨衛自炊","currency":"GBP","price":465,"fixed":0,"unit":"按週計算","note":"6/27-8/22"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":130,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LHR (單程)","currency":"GBP","price":0,"fixed":205,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 Ashford 車站 (單程)","currency":"GBP","price":0,"fixed":200,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 St Pancras 車站 (單程)","currency":"GBP","price":0,"fixed":235,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LTN/STN/SEN (單程)","currency":"GBP","price":0,"fixed":310,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Brighton 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":460,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":505,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":505,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":505,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":220,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":240,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":275,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"獨立衛浴加價","currency":"GBP","price":90,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"North Laine 18+ 單人房獨衛自炊","currency":"GBP","price":425,"fixed":0,"unit":"按週計算","note":"6/27-8/29"},{"type":"宿舍","name":"North Laine 18+ Studio獨衛自炊","currency":"GBP","price":465,"fixed":0,"unit":"按週計算","note":"6/27-8/22"},{"type":"宿舍","name":"Abacus House 單人房獨衛自炊","currency":"GBP","price":390,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Pavilion Point Studio獨衛自炊","currency":"GBP","price":430,"fixed":0,"unit":"按週計算","note":"通勤15分"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":130,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LHR (單程)","currency":"GBP","price":0,"fixed":205,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 Ashford 車站 (單程)","currency":"GBP","price":0,"fixed":200,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 St Pancras 車站 (單程)","currency":"GBP","price":0,"fixed":235,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LTN/STN/SEN (單程)","currency":"GBP","price":0,"fixed":310,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Bristol":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":365,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":295,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":370,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":345,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":370,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":455,"fixed":0,"peak":20}]},{"name":"Exam Prep IELTS","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":365,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":295,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":230,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":215,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":230,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":265,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"Unite Avon Point 單人房獨衛自炊","currency":"GBP","price":380,"fixed":0,"unit":"按週計算","note":"通勤20分"},{"type":"宿舍","name":"Unite House 暑期 單人房獨衛自炊","currency":"GBP","price":330,"fixed":0,"unit":"按週計算","note":"6/27-8/15,通勤10分"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"GBP","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 BRS (單程)","currency":"GBP","price":0,"fixed":95,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LHR (單程)","currency":"GBP","price":0,"fixed":335,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 LGW (單程)","currency":"GBP","price":0,"fixed":425,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Manchester":{"courses":[{"name":"General English 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":350,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":290,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":370,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20}]},{"name":"Exam Prep IELTS 20","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":350,"fixed":0,"peak":0}]},{"name":"Exam Prep IELTS 30","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":485,"fixed":0,"peak":20},{"wf":12,"wt":23,"price":405,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":120,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"GBP","price":230,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-60分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 自炊","currency":"GBP","price":215,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"GBP","price":230,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"GBP","price":265,"fixed":0,"unit":"按週計算","note":""},{"type":"宿舍","name":"Vita Studio獨衛自炊","currency":"GBP","price":385,"fixed":0,"unit":"按週計算","note":"通勤12分"},{"type":"宿舍","name":"IQ Lambert & Fairfield 單人房獨衛自炊","currency":"GBP","price":340,"fixed":0,"unit":"按週計算","note":"通勤6分"},{"type":"宿舍","name":"Summer Residence 單人房獨衛自炊","currency":"GBP","price":355,"fixed":0,"unit":"按週計算","note":"通勤30分"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"GBP","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"GBP","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"行政","name":"住宿安排費","currency":"GBP","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 Manchester Piccadilly 車站 (單程)","currency":"GBP","price":0,"fixed":115,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 MAN (單程)","currency":"GBP","price":0,"fixed":135,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"GBP","price":0,"fixed":60,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"GBP","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"GBP","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"GBP","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"GBP","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"GBP","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0,"fixed":18,"unit":"固定金額","wf":1,"wt":99}]},"Dublin":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":420,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":325,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":420,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25}]},{"name":"Exam Prep IELTS","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":125,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"EUR","price":275,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-75分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"EUR","price":275,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":305,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"未成年加價 (U18)","currency":"EUR","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"EUR","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"宿舍","name":"Orla Carman’s Hall 單人房獨衛自炊","currency":"EUR","price":450,"fixed":0,"unit":"按週計算","note":"通勤20-30分"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 DUB (單程)","currency":"EUR","price":0,"fixed":120,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"考試押金 (非EEA 25週+)","currency":"EUR","price":0,"fixed":225,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"學習者保障費 (非EEA 12週+)","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99}]},"Dublin 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":365,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":400,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":380,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":290,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":420,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":395,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":300,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":420,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":325,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":420,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":445,"fixed":0,"peak":25}]},{"name":"EC Escapes 50+ (1週)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":1,"price":755,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (2週)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":2,"wt":99,"price":665,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":125,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":35,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"EUR","price":275,"fixed":0,"unit":"按週計算","note":"需兩人同行,通勤30-75分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"EUR","price":275,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":305,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"聖誕節加價","currency":"EUR","price":40,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"宿舍","name":"Orla Carman’s Hall 單人房獨衛自炊","currency":"EUR","price":450,"fixed":0,"unit":"按週計算","note":"通勤20-30分"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 DUB (單程)","currency":"EUR","price":0,"fixed":120,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":75,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"考試押金 (非EEA 25週+)","currency":"EUR","price":0,"fixed":225,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"學習者保障費 (非EEA 12週+)","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99}]},"Malta":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":300,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":255,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":240,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":300,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25}]},{"name":"Mini Group","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":495,"fixed":0,"peak":0}]},{"name":"Intensive Mini Group","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":615,"fixed":0,"peak":0}]},{"name":"Business Mini Group 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":540,"fixed":0,"peak":0}]},{"name":"Intensive Business Mini Group 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":670,"fixed":0,"peak":0}]},{"name":"Cambridge Exam Prep","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0}]},{"name":"Exam Prep IELTS","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"師訓 English & Digital Skills 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":25}]},{"name":"師訓 English & Teaching Methodology 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":95,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":30,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"EUR","price":250,"fixed":0,"unit":"按週計算","note":"通勤15-45分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"EUR","price":340,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":360,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"未成年加價 (U18)","currency":"EUR","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":50,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"公寓","name":"學生公寓-雙人房共衛自炊","currency":"EUR","price":220,"fixed":0,"unit":"按週計算","note":"通勤5-30分"},{"type":"公寓","name":"學生公寓-單人房共衛自炊","currency":"EUR","price":345,"fixed":0,"unit":"按週計算","note":"獨衛加價€50/週"},{"type":"公寓","name":"學生公寓-Studio(最多2人)獨衛自炊","currency":"EUR","price":495,"fixed":0,"unit":"按週計算","note":"整間計價"},{"type":"宿舍","name":"Campus Hub 雙人房共衛自炊","currency":"EUR","price":210,"fixed":0,"unit":"按週計算","note":"通勤30分"},{"type":"宿舍","name":"Campus Hub 單人房獨衛自炊","currency":"EUR","price":390,"fixed":0,"unit":"按週計算","note":"通勤30分"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 MLA (單程)","currency":"EUR","price":0,"fixed":25,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 MLA 尊榮 (單程)","currency":"EUR","price":0,"fixed":50,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"VFS 簽證預約費 (標準)","currency":"EUR","price":0,"fixed":100,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"VFS 簽證預約費 (加急)","currency":"EUR","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證行政費 (境內延簽)","currency":"EUR","price":0,"fixed":50,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99},{"category":"稅金","name":"環保稅 (每晚)","currency":"EUR","price":0.5,"fixed":0,"unit":"按天計算","wf":1,"wt":99}]},"Malta 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":300,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":255,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":240,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":345,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":285,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":260,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":365,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":305,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":280,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":300,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":320,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":410,"fixed":0,"peak":25}]},{"name":"Business Mini Group 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":540,"fixed":0,"peak":0}]},{"name":"Business Mini Group Intensive 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":670,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (1週)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":1,"price":695,"fixed":0,"peak":0}]},{"name":"EC Escapes 50+ (2週)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":2,"wt":99,"price":635,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"師訓 English & Digital Skills 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":25}]},{"name":"師訓 English & Teaching Methodology 25+","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":385,"fixed":0,"peak":25}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":95,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":30,"fixed":0,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-雙人房 半食宿","currency":"EUR","price":250,"fixed":0,"unit":"按週計算","note":"通勤15-45分"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 B&B","currency":"EUR","price":340,"fixed":0,"unit":"按週計算","note":""},{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":360,"fixed":0,"unit":"按週計算","note":""},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":50,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"公寓","name":"學生公寓-雙人房共衛自炊","currency":"EUR","price":220,"fixed":0,"unit":"按週計算","note":"通勤5-30分"},{"type":"公寓","name":"學生公寓-單人房共衛自炊","currency":"EUR","price":345,"fixed":0,"unit":"按週計算","note":"獨衛加價€50/週"},{"type":"公寓","name":"學生公寓-Studio(最多2人)獨衛自炊","currency":"EUR","price":495,"fixed":0,"unit":"按週計算","note":"整間計價"},{"type":"宿舍","name":"Campus Hub 雙人房共衛自炊","currency":"EUR","price":210,"fixed":0,"unit":"按週計算","note":"通勤30分"},{"type":"宿舍","name":"Campus Hub 單人房獨衛自炊","currency":"EUR","price":390,"fixed":0,"unit":"按週計算","note":"通勤30分"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 MLA (單程)","currency":"EUR","price":0,"fixed":25,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 MLA 尊榮 (單程)","currency":"EUR","price":0,"fixed":50,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":14,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"VFS 簽證預約費 (標準)","currency":"EUR","price":0,"fixed":100,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"VFS 簽證預約費 (加急)","currency":"EUR","price":0,"fixed":150,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證行政費 (境內延簽)","currency":"EUR","price":0,"fixed":50,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99},{"category":"稅金","name":"環保稅 (每晚)","currency":"EUR","price":0.5,"fixed":0,"unit":"按天計算","wf":1,"wt":99}]},"Cape Town":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":345,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":270,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":240,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":380,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":325,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":380,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25}]},{"name":"Exam Prep IELTS","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":345,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":270,"fixed":0,"peak":0}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":75,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"Safari 1日","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":220,"peak":0}]},{"name":"Safari 3日 Garden Route","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":395,"peak":0}]},{"name":"Safari 4日 Kruger","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":1100,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"通勤15-30分"},{"type":"額外加成","name":"未成年加價 (U18)","currency":"EUR","price":20,"fixed":0,"unit":"按週計算","note":"限18歲以下,強制"},{"type":"額外加成","name":"聖誕節加價","currency":"EUR","price":30,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"獨立衛浴加價","currency":"EUR","price":70,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Green Point 宿舍房(最多8人)共衛自炊","currency":"EUR","price":145,"fixed":0,"unit":"按週計算","note":"通勤25-30分"},{"type":"公寓","name":"Green Point 雙人房共衛自炊","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"公寓","name":"Green Point 單人房獨衛自炊","currency":"EUR","price":495,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"BlackBrick Foreshore Studio獨衛自炊","currency":"EUR","price":435,"fixed":0,"unit":"按週計算","note":"通勤10分"},{"type":"宿舍","name":"Dorp Street 單人房共衛 B&B","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"通勤15分,週末自炊"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"志工","name":"志工計畫 訂金","currency":"EUR","price":0,"fixed":400,"unit":"固定金額","wf":1,"wt":99},{"category":"實習","name":"實習計畫 安置費","currency":"EUR","price":0,"fixed":400,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 CPT (單程)","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99}]},"Cape Town 30+":{"courses":[{"name":"General English 20","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":345,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":270,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":240,"fixed":0,"peak":0}]},{"name":"General English 24","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":365,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":300,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":260,"fixed":0,"peak":0}]},{"name":"General English 26","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":390,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":325,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":290,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":380,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":325,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":380,"fixed":0,"peak":0}]},{"name":"English in the City (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450,"fixed":0,"peak":25}]},{"name":"保證上午班加價","category":"額外加成","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":40,"fixed":0,"peak":0},{"wf":12,"wt":23,"price":35,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":75,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":30,"fixed":0,"peak":0}]},{"name":"Safari 1日","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":220,"peak":0}]},{"name":"Safari 3日 Garden Route","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":395,"peak":0}]},{"name":"Safari 4日 Kruger","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":1,"wt":99,"price":0,"fixed":1100,"peak":0}]}],"accomm":[{"type":"寄宿家庭","name":"寄宿家庭-單人房 半食宿","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"通勤15-30分"},{"type":"額外加成","name":"聖誕節加價","currency":"EUR","price":30,"fixed":0,"unit":"按週計算","note":"12/19-20 及 12/26-27 週末"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":45,"fixed":0,"unit":"按週計算","note":"視供應狀況"},{"type":"額外加成","name":"獨立衛浴加價","currency":"EUR","price":70,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"Green Point 宿舍房(最多8人)共衛自炊","currency":"EUR","price":145,"fixed":0,"unit":"按週計算","note":"通勤25-30分"},{"type":"公寓","name":"Green Point 雙人房共衛自炊","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"需兩人同行"},{"type":"公寓","name":"Green Point 單人房獨衛自炊","currency":"EUR","price":495,"fixed":0,"unit":"按週計算","note":""},{"type":"公寓","name":"BlackBrick Foreshore Studio獨衛自炊","currency":"EUR","price":435,"fixed":0,"unit":"按週計算","note":"通勤10分"},{"type":"宿舍","name":"Dorp Street 單人房共衛 B&B","currency":"EUR","price":270,"fixed":0,"unit":"按週計算","note":"通勤15分,週末自炊"},{"type":"行政","name":"住宿安排費","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","note":""}],"fees":[{"category":"志工","name":"志工計畫 訂金","currency":"EUR","price":0,"fixed":400,"unit":"固定金額","wf":1,"wt":99},{"category":"實習","name":"實習計畫 安置費","currency":"EUR","price":0,"fixed":400,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 CPT (單程)","currency":"EUR","price":0,"fixed":40,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"EUR","price":0,"fixed":55,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"EUR","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"EUR","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"EUR","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"EUR","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"簽證","name":"簽證文件快遞費","currency":"EUR","price":0,"fixed":85,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0,"fixed":20,"unit":"固定金額","wf":1,"wt":99}]},"Dubai":{"courses":[{"name":"General English 20 (上午)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":335,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":310,"fixed":0,"peak":0}]},{"name":"General English 20 (下午)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":310,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":270,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":245,"fixed":0,"peak":0}]},{"name":"General English 30","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0},{"wf":24,"wt":99,"price":440,"fixed":0,"peak":0}]},{"name":"English for Work (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0}]},{"name":"Writing with AI (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25}]},{"name":"Exam Prep IELTS (GE20+10)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":520,"fixed":0,"peak":25},{"wf":12,"wt":23,"price":480,"fixed":0,"peak":0}]},{"name":"一對一加課","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":75,"fixed":0,"peak":0}]},{"name":"EC x FutureLearn 線上加購","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":99,"price":30,"fixed":0,"peak":0}]}],"accomm":[{"type":"公寓","name":"學生公寓-雙人房共衛自炊","currency":"USD","price":275,"fixed":0,"unit":"按週計算","note":"通勤25分;旺季另含 10/17-1/2"},{"type":"公寓","name":"學生公寓-單人房獨衛自炊","currency":"USD","price":450,"fixed":0,"unit":"按週計算","note":"旺季另含 10/17-1/2"},{"type":"公寓","name":"學生公寓-豪華單人房獨衛自炊","currency":"USD","price":750,"fixed":0,"unit":"按週計算","note":"旺季另含 10/17-1/2"},{"type":"宿舍","name":"學生宿舍-雙人房共衛自炊","currency":"USD","price":250,"fixed":0,"unit":"按週計算","note":"通勤50分;旺季另含 10/17-1/2"},{"type":"宿舍","name":"學生宿舍-單人房獨衛自炊","currency":"USD","price":425,"fixed":0,"unit":"按週計算","note":"旺季另含 10/17-1/2"},{"type":"宿舍","name":"學生宿舍-青年(16-17)豪華單人獨衛","currency":"USD","price":525,"fixed":0,"unit":"按週計算","note":"旺季另含 10/17-1/2"},{"type":"行政","name":"住宿安排費","currency":"USD","price":0,"fixed":100,"unit":"固定金額","note":""}],"fees":[{"category":"接機","name":"機場接送 DXB (單程)","currency":"USD","price":0,"fixed":100,"unit":"固定金額","wf":1,"wt":99},{"category":"接機","name":"機場接送 DXB (來回)","currency":"USD","price":0,"fixed":175,"unit":"固定金額","wf":1,"wt":99},{"category":"註冊","name":"註冊費","currency":"USD","price":0,"fixed":100,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"USD","price":7,"fixed":0,"unit":"按週計算","wf":1,"wt":11},{"category":"教材","name":"教材費 (中期)","currency":"USD","price":0,"fixed":84,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (長期)","currency":"USD","price":0,"fixed":105,"unit":"固定金額","wf":24,"wt":99},{"category":"保險","name":"選配學生保險","currency":"USD","price":25,"fixed":0,"unit":"按週計算","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0,"fixed":50,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"180天簽證申請費","currency":"USD","price":0,"fixed":700,"unit":"固定金額","wf":1,"wt":99}]}},"Kaplan":KAPLAN_DATA,"SGIC":SGIC_DATA};

const COUNTRY_MAP = {
  EP:{Brisbane:'🇦🇺 澳洲','Canary Wharf':'🇬🇧 英國',Birmingham:'🇬🇧 英國',Leeds:'🇬🇧 英國',Dublin:'🇮🇪 愛爾蘭',Berlin:'🇩🇪 德國',Paris:'🇫🇷 法國',Toronto:'🇨🇦 加拿大',Dubai:'🇦🇪 杜拜',Malta:'🇲🇹 馬爾他'},
  ILSC:{Adelaide:'🇦🇺 澳洲',Brisbane:'🇦🇺 澳洲',Melbourne:'🇦🇺 澳洲',Perth:'🇦🇺 澳洲',Sydney:'🇦🇺 澳洲','Montréal':'🇨🇦 加拿大',Toronto:'🇨🇦 加拿大',Vancouver:'🇨🇦 加拿大',Dublin:'🇮🇪 愛爾蘭','New Delhi':'🇮🇳 印度'},
EC:{'Boston':'🇺🇸 美國','New York':'🇺🇸 美國','New York 30+':'🇺🇸 美國','San Francisco':'🇺🇸 美國','San Diego':'🇺🇸 美國','Los Angeles':'🇺🇸 美國','Montreal':'🇨🇦 加拿大','Toronto':'🇨🇦 加拿大','Toronto 30+':'🇨🇦 加拿大','Vancouver':'🇨🇦 加拿大','Vancouver 30+':'🇨🇦 加拿大','London':'🇬🇧 英國','London 30+':'🇬🇧 英國','Cambridge':'🇬🇧 英國','Brighton':'🇬🇧 英國','Brighton 30+':'🇬🇧 英國','Bristol':'🇬🇧 英國','Manchester':'🇬🇧 英國','Dublin':'🇮🇪 愛爾蘭','Dublin 30+':'🇮🇪 愛爾蘭','Malta':'🇲🇹 馬爾他','Malta 30+':'🇲🇹 馬爾他','Cape Town':'🇿🇦 南非','Cape Town 30+':'🇿🇦 南非','Dubai':'🇦🇪 杜拜'},
  Kaplan:{'Boston':'🇺🇸 美國','Chicago':'🇺🇸 美國','Los Angeles':'🇺🇸 美國','New York':'🇺🇸 美國','New York 30+':'🇺🇸 美國','San Francisco':'🇺🇸 美國','Santa Barbara':'🇺🇸 美國','Toronto':'🇨🇦 加拿大','Toronto 30+':'🇨🇦 加拿大','Vancouver':'🇨🇦 加拿大','Bournemouth':'🇬🇧 英國','Bournemouth 30+':'🇬🇧 英國','Cambridge':'🇬🇧 英國','Edinburgh':'🇬🇧 英國','Liverpool':'🇬🇧 英國','Liverpool 30+':'🇬🇧 英國','London':'🇬🇧 英國','London 30+':'🇬🇧 英國','Manchester':'🇬🇧 英國','Oxford':'🇬🇧 英國','Torquay':'🇬🇧 英國','Dublin':'🇮🇪 愛爾蘭'},
  SGIC:{'Toronto':'🇨🇦 加拿大','Vancouver':'🇨🇦 加拿大','North York':'🇨🇦 加拿大'}
};
const CUR_SYM={AUD:'A$',GBP:'£',EUR:'€',USD:'US$',CAD:'C$'};
const STEPS=[
  {name:'選擇學校',en:'Select School'},
  {name:'校區與課程',en:'Campus & Course'},
  {name:'週數與日期',en:'Duration & Date'},
  {name:'住宿安排',en:'Accommodation'},
  {name:'加購項目',en:'Add-ons'},
  {name:'折扣方案',en:'Discount'},
  {name:'確認報價',en:'Confirm Quote'},
];

let state={step:0,school:null,campus:null,course:null,weeks:4,startDate:'',accomm:null,extras:{},disc:{type:'原價',pct:0,fixed:0,schoolDiscount:null},studentName:'',studentEmail:'',notes:'',_rounded:false,_roundedFinal:0};
let rates=JSON.parse(localStorage.getItem('fy_rates')||'null')||{AUD:21.5,GBP:40.2,EUR:33.8,USD:32.1,CAD:23.5};

// ── Users ──
// === 教學步驟（前置 + var，根治 TDZ：載入若中斷也已定義，點擊教學一定存取得到）===
var TUTORIAL_STEPS = [
  { target: '.logo-area', center: true,
    title: '歡迎 👋',
    body: '這套工具幫你快速報價五家語校（EP / ILSC / EC / Kaplan / SGIC）。跟著 9 步走一遍報價流程。',
    position: 'right' },
  { target: '.nav-item.active, button[onclick*="wizard"]',
    title: '從「新增報價」開始',
    body: '看左側選單——每次報價都從這裡進入，右邊會出現 7 個步驟。',
    position: 'right' },
  { target: '#step-content',
    title: '選學校與校區',
    body: '先點一家語校，再選城市校區與課程。標「30+」是同城市長期班，住宿沿用母校區。',
    position: 'left' },
  { target: '#step-content',
    title: '填週數與學生資料',
    body: '輸入學生姓名與學習週數。週數會決定學費級距，也影響可選的住宿。',
    position: 'left' },
  { target: '#step-content',
    title: '選住宿',
    body: '灰色＝週數不夠不能選。旺季加價依校區自動計算（開普敦、杜拜旺季月份不同）。',
    position: 'left' },
  { target: '#step-content',
    title: '加購與折扣',
    body: '可加簽證、考試、接機、保險。折扣分「廠商折扣」與「公司折扣」，可疊加。',
    position: 'left' },
  { target: '.quote-panel',
    title: '看右側即時費用',
    body: '每個選擇都即時更新右邊明細。顧問只看含稅總價；淨利與成本需管理員 PIN 才可見。',
    position: 'left' },
  { target: '#step-content',
    title: '確認與開單',
    body: '按「四捨整數」後儲存報價，可下載學生版 PNG，並產生開單指示（自動拆 A 課程＋B 海外學雜費）。',
    position: 'left' },
  { target: 'button[onclick*="history"]',
    title: '歷史紀錄',
    body: '所有報價存在「歷史報價紀錄」，可搜尋、複製、重新載入，已開單會標記。',
    position: 'right' },
];

// === 教學除錯燈泡（最優先載入，獨立於後續初始化，避免被任何錯誤中斷）===
(function(){
  function boot(){
    try{
      createTutBulb(); hideOldTutorialEntry();
      // 早期保險：預設（非 PIN 管理員）一律隱藏匯率設定，避免 init 中斷時露出
      if(!window._isAdminMode){ var _ns=document.getElementById('nav-settings'); if(_ns) _ns.style.display='none'; }
      console.log('[教學] 💡 燈泡與入口初始化完成');
    }
    catch(e){ console.error('[教學] ❌ 燈泡初始化失敗:', e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

const DEFAULT_USERS=[
  {id:'admin',name:'管理員',role:'admin',avatar:'管'},
  {id:'u1',name:'Emily',role:'advisor',avatar:'E'},
  {id:'u2',name:'Aaron',role:'advisor',avatar:'A'},
  {id:'u3',name:'Bobo',role:'advisor',avatar:'B'},
  {id:'u4',name:'Yiwei',role:'advisor',avatar:'Y'},
];
let users=JSON.parse(localStorage.getItem('fy_users')||'null')||DEFAULT_USERS;
let currentUser=(function(){
  // 預設顧問：不信任 localStorage 內的 admin 身分，重整一律降回顧問，淨利需 PIN 才解鎖
  var saved=JSON.parse(localStorage.getItem('fy_current_user')||'null');
  if(saved && saved.role!=='admin') return saved;
  return users.find(u=>u.role==='advisor')||users[0];
})();

function switchUser(uid){
  currentUser=users.find(u=>u.id===uid)||users[0];
  localStorage.setItem('fy_current_user',JSON.stringify(currentUser));
  var _av=document.getElementById('user-avatar'); if(_av) _av.textContent=currentUser.avatar;
  var _nm=document.getElementById('user-name-display'); if(_nm) _nm.textContent=currentUser.name;
  var _rl=document.getElementById('user-role-display'); if(_rl) _rl.textContent=(currentUser.role==='admin'?'管理員':'顧問')+'・點擊切換';
  var _um=document.getElementById('user-modal'); if(_um) _um.style.display='none';
  const navSettings=document.getElementById('nav-settings');
  if(navSettings) navSettings.style.display=window._isAdminMode?'':'none';
  if(currentUser.role!=='admin'){
    const ap=document.querySelector('.page.active');
    if(ap&&ap.id==='page-settings') showPage('wizard');
  }
  const activePage=document.querySelector('.page.active');
  if(activePage&&activePage.id==='page-history') renderHistory();
  updateBadge();
  renderQP();
}

function showUserSwitch(){
  const list=document.getElementById('user-list');
  list.innerHTML=users.map(u=>`
    <div onclick="switchUser('${u.id}')" style="display:flex;align-items:center;gap:12px;padding:10px 12px;
      border-radius:8px;cursor:pointer;background:${currentUser.id===u.id?'var(--pink-light)':'var(--bg)'};
      border:1px solid ${currentUser.id===u.id?'var(--pink)':'var(--border)'}">
      <div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'var(--pink)':'var(--pink-light)'};
        color:${u.role==='admin'?'#fff':'var(--pink)'};display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:600">${u.avatar}</div>
      <div>
        <div style="font-size:13px;font-weight:500">${u.name}</div>
        <div style="font-size:11px;color:var(--text3)">${u.role==='admin'?'管理員（全部可見）':'顧問（只看自己的報價）'}</div>
      </div>
      ${currentUser.id===u.id?'<div style="margin-left:auto;color:var(--pink);font-size:12px">✓ 目前</div>':''}
    </div>`).join('');
  document.getElementById('user-modal').style.display='flex';
}

// ── adminSettings：rebates 加入 ILSC ──
let adminSettings=JSON.parse(localStorage.getItem('fy_admin')||'null')||{
  fxBuffer:2,commissionPct:2,taxRate:5,quoteValidDays:30,
  rateUpdatedAt:new Date().toISOString().split('T')[0],
  rateAlertDays:7,
  rebates:{EP:5,ILSC:5,EC:5,Kaplan:5,SGIC:5},
  discountPlans:[
    {id:'dp1',school:'EP',campus:'Brisbane',label:'EP Brisbane 淡季優惠',pct:30,fixed:0,validFrom:'2026-04-01',validTo:'2026-06-30',active:true}
  ]
};
// 補丁:若使用者 localStorage 已有舊 adminSettings(只有 EP),自動補 ILSC:5
if(adminSettings.rebates){
  let _changed=false;
  ['ILSC','EC','Kaplan','SGIC'].forEach(function(_s){
    if(!(_s in adminSettings.rebates)){ adminSettings.rebates[_s]=5; _changed=true; }
  });
  if(_changed) localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
}
let history=JSON.parse(localStorage.getItem('fy_history')||'[]');
let companyInfo=JSON.parse(localStorage.getItem('fy_company')||'null')||{company:'放洋留遊學',phone:'',email:'',website:'',note:'以上報價僅供參考，實際費用依學校公告為準。'};

function sf(v){try{const f=parseFloat(v);return isNaN(f)?0:f;}catch{return 0;}}
function fmt(v,cur){return(CUR_SYM[cur]||cur)+Math.round(v).toLocaleString();}
function twd(v,cur){return Math.round(v*(rates[cur]||1));}
function isPeak(){
  const d=new Date(state.startDate||new Date());const m=d.getMonth();
  const camp=(state.campus||'');
  if(camp.indexOf('Cape Town')>=0) return (m>=10||m<=2);  // 開普敦旺季 11–3 月
  if(camp.indexOf('Dubai')>=0)     return (m>=10||m<=1);  // 杜拜旺季 11–2 月
  return (m>=5&&m<=7);                                     // 其餘地區 6–8 月
}
function getTier(tiers,w){for(const t of tiers)if(w>=(t.wf||1)&&w<=(t.wt||99))return t;return tiers[tiers.length-1];}



// ── Phase 4：Google Drive 上傳（透過 GAS 後端）──
// 部署 Code.gs 後填入 GAS Web App URL（格式：https://script.google.com/macros/s/…/exec）
// 未填時 Drive 上傳靜默跳過，其他功能不受影響
const GAS_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbyY9ZXqr8iz0SrxlqHKiCBpElzZfOAyv_qvfCJJ6S9W4L2EqOmJZnEJ10togV9-0DD7/exec';

async function uploadToDrive(blob, filename, folderType){
  // folderType: 'internal' | 'student'
  // GAS 後端持有 Drive folder ID，前端不再持有 token
  if(!GAS_BACKEND_URL){
    console.warn('[Drive] GAS_BACKEND_URL 未設定，跳過上傳');
    return {ok:false, reason:'no_backend_url'};
  }
  return new Promise((resolve)=>{
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const base64 = reader.result.split(',')[1];
        const res = await fetch(GAS_BACKEND_URL, {
          method:'POST',
          // 不設 Content-Type header → 瀏覽器預設 text/plain → simple request → 無 CORS preflight
          // GAS 仍可從 e.postData.contents 讀到完整 JSON 字串
          body: JSON.stringify({ action:'uploadPNG', filename, folderType, base64Data: base64 })
        });
        const data = await res.json();
        if(data.ok){ resolve({ok:true, fileId:data.fileId}); }
        else{ console.error('[Drive] upload error:', data.error); resolve({ok:false, reason:data.error||'unknown'}); }
      } catch(e){
        console.error('[Drive] uploadToDrive exception', e);
        resolve({ok:false, reason: e.message});
      }
    };
    reader.onerror = ()=> resolve({ok:false, reason:'FileReader error'});
    reader.readAsDataURL(blob);
  });
}

function makePngFilename(q, type){
  // 格式：日期_顧問_廠商_城市_週數_學生_版本_type.png
  // 例：20260615_Aaron_EP_Brisbane_8W_王小明_v1_internal.png
  const date    = (q.date||new Date().toLocaleDateString('zh-TW')).replace(/[\/\-]/g,'');
  const advisor = (q.advisorName||'顧問').replace(/\s/g,'');
  const school  = (q.school||'EP');
  const campus  = (q.campus||'').replace(/\s/g,'');
  const weeks   = (q.weeks||0)+'W';
  const student = (q.studentName||'未填').replace(/\s/g,'');
  const version = (q.version||'v1');
  return `${date}_${advisor}_${school}_${campus}_${weeks}_${student}_${version}_${type}.png`;
}

async function generateAndUploadPNGs(q){
  const indicator = document.getElementById('sync-indicator');
  const setStatus = (msg, color)=>{
    if(indicator){ indicator.textContent=msg; indicator.style.color=color||'#6b7280'; }
  };

  if(!GAS_BACKEND_URL){
    // GAS 尚未設定：靜默跳過，顯示已同步（不嚇到顧問）
    setStatus('☁️ 已同步', '#059669');
    return;
  }

  setStatus('📤 上傳報價單...', '#f97316');
  const errors = [];

  for(const type of ['internal','student']){
    try{
      const blob = await exportPNGBlob(type);
      if(!blob){ errors.push(type+':無法產生 PNG'); continue; }
      const filename = makePngFilename(q, type);
      const result = await uploadToDrive(blob, filename, type); // type = folderType
      if(!result.ok) errors.push(type+':'+result.reason);
    } catch(e){
      errors.push(type+':'+e.message);
    }
  }

  if(errors.length===0){
    setStatus('☁️ 報價單已上傳 Drive', '#059669');
  } else {
    setStatus('⚠️ Drive 上傳部分失敗', '#dc2626');
    console.error('[Drive] errors:', errors);
  }
}


// ── PIN 碼管理員切換 ──
const ADMIN_PIN = '991234';
let _pinClickCount = 0;
let _pinClickTimer = null;
let _isAdminMode = false;

function handleLogoClick(){
  _pinClickCount++;
  clearTimeout(_pinClickTimer);
  _pinClickTimer = setTimeout(()=>{ _pinClickCount=0; }, 800);
  if(_pinClickCount >= 3){
    _pinClickCount = 0;
    if(_isAdminMode){
      // 已是管理員 → 退出
      exitAdminMode();
    } else {
      // 顯示 PIN 輸入
      showPinModal();
    }
  }
}

function showPinModal(){
  let overlay = document.getElementById('pin-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'pin-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px 28px 22px;width:280px;box-shadow:0 8px 32px rgba(0,0,0,.18)">
        <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:4px">管理員驗證</div>
        <div style="font-size:11px;color:#9999aa;margin-bottom:16px">請輸入 PIN 碼</div>
        <input id="pin-input" type="password" inputmode="numeric" maxlength="8"
          style="width:100%;padding:10px 12px;border:1.5px solid #ebebf0;border-radius:8px;font-size:18px;letter-spacing:.2em;text-align:center;font-family:monospace;outline:none"
          onfocus="this.style.borderColor='#e91e8c'" onblur="this.style.borderColor='#ebebf0'"
          onkeydown="if(event.key==='Enter')submitPin()">
        <div id="pin-err" style="font-size:11px;color:#dc2626;min-height:16px;margin-top:6px;text-align:center"></div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button onclick="submitPin()" style="flex:1;padding:10px;background:#e91e8c;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">確認</button>
          <button onclick="closePinModal()" style="flex:1;padding:10px;background:#f0f0f5;color:#555;border:none;border-radius:8px;font-size:13px;cursor:pointer">取消</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
  setTimeout(()=>{ const inp=document.getElementById('pin-input'); if(inp){inp.value='';inp.focus();} },100);
  document.getElementById('pin-err').textContent='';
}

function closePinModal(){
  const o = document.getElementById('pin-overlay');
  if(o) o.style.display='none';
}

function submitPin(){
  const inp = document.getElementById('pin-input');
  const err = document.getElementById('pin-err');
  if(!inp) return;
  if(inp.value === ADMIN_PIN){
    closePinModal();
    enterAdminMode();
  } else {
    err.textContent = 'PIN 碼錯誤';
    inp.value='';
    inp.focus();
  }
}

function enterAdminMode(){
  _isAdminMode = true;
  currentUser = users.find(u=>u.role==='admin') || users[0];
  const ns = document.getElementById('nav-settings');
  if(ns) ns.style.display='';
  const na = document.getElementById('nav-analytics');
  if(na) na.style.display='';
  const badge = document.getElementById('admin-badge');
  if(badge) badge.style.display='inline-block';
  updateBadge();
  setModeBadge(true);
  renderQP();
}

function exitAdminMode(){
  _isAdminMode = false;
  currentUser = users.find(u=>u.role==='advisor') || users[1];
  const ns = document.getElementById('nav-settings');
  if(ns) ns.style.display='none';
  const na = document.getElementById('nav-analytics');
  if(na) na.style.display='none';
  const badge = document.getElementById('admin-badge');
  if(badge) badge.style.display='none';
  // 若在管理員頁面，跳回報價
  const ap = document.querySelector('.page.active');
  if(ap && (ap.id==='page-settings' || ap.id==='page-analytics')) showPage('wizard');
  updateBadge();
  setModeBadge(false);
  renderQP();
}

// ── Phase 3：課程名稱對照表(開單用) ──
// 從 EP_COURSE_MAP 改名為 COURSE_MAP,key 改用 'school_campus' 組合避免 EP/ILSC 同名校區衝突
const COURSE_MAP = {
  // EP 10 校區
  'EP_Canary Wharf': { zhName: '倫敦客製化遊學',   enName: 'Canary Wharf',  price: 28000 },
  'EP_Birmingham':   { zhName: '伯明罕客製化遊學',  enName: 'Birmingham',    price: 24500 },
  'EP_Leeds':        { zhName: '里茲客製化遊學',    enName: 'Leeds',         price: 24500 },
  'EP_Dublin':       { zhName: '都柏林客製化遊學',  enName: 'Dublin',        price: 23000 },
  'EP_Berlin':       { zhName: '柏林客製化遊學',    enName: 'Berlin',        price: 16500 },
  'EP_Paris':        { zhName: '巴黎客製化遊學',    enName: 'Paris',         price: 23500 },
  'EP_Brisbane':     { zhName: '布里斯本客製化遊學', enName: 'Brisbane',     price: 15000 },
  'EP_Malta':        { zhName: '馬爾他客製化遊學',  enName: 'Malta',         price: 17000 },
  'EP_Dubai':        { zhName: '杜拜客製化遊學',    enName: 'Dubai',         price: 18500 },
  'EP_Toronto':      { zhName: '多倫多客製化遊學',  enName: 'Toronto',       price: 18000 },
  // ILSC 10 校區 — 同地區同價(澳洲 5 校區、加拿大 3 校區共用同價)
  'ILSC_Adelaide':   { zhName: '阿德雷得客製化遊學', enName: 'Adelaide',     price: 18500 },
  'ILSC_Brisbane':   { zhName: '布里斯本客製化遊學', enName: 'Brisbane',     price: 18500 },
  'ILSC_Melbourne':  { zhName: '墨爾本客製化遊學',   enName: 'Melbourne',    price: 18500 },
  'ILSC_Perth':      { zhName: '伯斯客製化遊學',     enName: 'Perth',        price: 18500 },
  'ILSC_Sydney':     { zhName: '雪梨客製化遊學',     enName: 'Sydney',       price: 18500 },
  'ILSC_Montréal':   { zhName: '蒙特婁客製化遊學',   enName: 'Montréal',     price: 17500 },
  'ILSC_Toronto':    { zhName: '多倫多客製化遊學',   enName: 'Toronto',      price: 17500 },
  'ILSC_Vancouver':  { zhName: '溫哥華客製化遊學',   enName: 'Vancouver',    price: 17500 },
  'ILSC_Dublin':     { zhName: '都柏林客製化遊學',   enName: 'Dublin',       price: 23000 },
  'ILSC_New Delhi':  { zhName: '新德里客製化遊學',   enName: 'New Delhi',    price: 18000 },
  // ===== 2026-06-10 新增 EC / Kaplan / SGIC =====
'EC_Boston': { zhName: '波士頓客製化遊學', enName: 'Boston', price: 27000 },
  'EC_New York': { zhName: '紐約客製化遊學', enName: 'New York', price: 28500 },
  'EC_New York 30+': { zhName: '紐約客製化遊學', enName: 'New York 30+', price: 28500 },
  'EC_San Francisco': { zhName: '舊金山客製化遊學', enName: 'San Francisco', price: 25000 },
  'EC_San Diego': { zhName: '聖地牙哥客製化遊學', enName: 'San Diego', price: 22500 },
  'EC_Los Angeles': { zhName: '洛杉磯客製化遊學', enName: 'Los Angeles', price: 25000 },
  'EC_Montreal': { zhName: '蒙特婁客製化遊學', enName: 'Montreal', price: 16500 },
  'EC_Toronto': { zhName: '多倫多客製化遊學', enName: 'Toronto', price: 18000 },
  'EC_Toronto 30+': { zhName: '多倫多客製化遊學', enName: 'Toronto 30+', price: 18000 },
  'EC_Vancouver': { zhName: '溫哥華客製化遊學', enName: 'Vancouver', price: 18000 },
  'EC_Vancouver 30+': { zhName: '溫哥華客製化遊學', enName: 'Vancouver 30+', price: 18000 },
  'EC_London': { zhName: '倫敦客製化遊學', enName: 'London', price: 26500 },
  'EC_London 30+': { zhName: '倫敦客製化遊學', enName: 'London 30+', price: 26500 },
  'EC_Cambridge': { zhName: '劍橋客製化遊學', enName: 'Cambridge', price: 24500 },
  'EC_Brighton': { zhName: '布萊頓客製化遊學', enName: 'Brighton', price: 25000 },
  'EC_Brighton 30+': { zhName: '布萊頓客製化遊學', enName: 'Brighton 30+', price: 25000 },
  'EC_Bristol': { zhName: '布里斯托客製化遊學', enName: 'Bristol', price: 24000 },
  'EC_Manchester': { zhName: '曼徹斯特客製化遊學', enName: 'Manchester', price: 24500 },
  'EC_Dublin': { zhName: '都柏林客製化遊學', enName: 'Dublin', price: 23000 },
  'EC_Dublin 30+': { zhName: '都柏林客製化遊學', enName: 'Dublin 30+', price: 23000 },
  'EC_Malta': { zhName: '馬爾他客製化遊學', enName: 'Malta', price: 19000 },
  'EC_Malta 30+': { zhName: '馬爾他客製化遊學', enName: 'Malta 30+', price: 19000 },
  'EC_Cape Town': { zhName: '開普敦客製化遊學', enName: 'Cape Town', price: 21500 },
  'EC_Cape Town 30+': { zhName: '開普敦客製化遊學', enName: 'Cape Town 30+', price: 21500 },
  'EC_Dubai': { zhName: '杜拜客製化遊學', enName: 'Dubai', price: 20500 },
  'Kaplan_Boston': { zhName: '波士頓客製化遊學', enName: 'Boston', price: 27000 },
  'Kaplan_Chicago': { zhName: '芝加哥客製化遊學', enName: 'Chicago', price: 23000 },
  'Kaplan_Los Angeles': { zhName: '洛杉磯客製化遊學', enName: 'Los Angeles', price: 28000 },
  'Kaplan_New York': { zhName: '紐約客製化遊學', enName: 'New York', price: 32000 },
  'Kaplan_New York 30+': { zhName: '紐約客製化遊學', enName: 'New York 30+', price: 32000 },
  'Kaplan_San Francisco': { zhName: '舊金山客製化遊學', enName: 'San Francisco', price: 27000 },
  'Kaplan_Santa Barbara': { zhName: '聖塔芭芭拉客製化遊學', enName: 'Santa Barbara', price: 28000 },
  'Kaplan_Toronto': { zhName: '多倫多客製化遊學', enName: 'Toronto', price: 20000 },
  'Kaplan_Toronto 30+': { zhName: '多倫多客製化遊學', enName: 'Toronto 30+', price: 20000 },
  'Kaplan_Vancouver': { zhName: '溫哥華客製化遊學', enName: 'Vancouver', price: 20000 },
  'Kaplan_Bournemouth': { zhName: '伯恩茅斯客製化遊學', enName: 'Bournemouth', price: 20500 },
  'Kaplan_Bournemouth 30+': { zhName: '伯恩茅斯客製化遊學', enName: 'Bournemouth 30+', price: 20500 },
  'Kaplan_Cambridge': { zhName: '劍橋客製化遊學', enName: 'Cambridge', price: 24500 },
  'Kaplan_Edinburgh': { zhName: '愛丁堡客製化遊學', enName: 'Edinburgh', price: 21500 },
  'Kaplan_Liverpool': { zhName: '利物浦客製化遊學', enName: 'Liverpool', price: 21000 },
  'Kaplan_Liverpool 30+': { zhName: '利物浦客製化遊學', enName: 'Liverpool 30+', price: 21000 },
  'Kaplan_London': { zhName: '倫敦客製化遊學', enName: 'London', price: 26000 },
  'Kaplan_London 30+': { zhName: '倫敦客製化遊學', enName: 'London 30+', price: 26000 },
  'Kaplan_Manchester': { zhName: '曼徹斯特客製化遊學', enName: 'Manchester', price: 21500 },
  'Kaplan_Oxford': { zhName: '牛津客製化遊學', enName: 'Oxford', price: 23000 },
  'Kaplan_Torquay': { zhName: '托基客製化遊學', enName: 'Torquay', price: 20000 },
  'Kaplan_Dublin': { zhName: '都柏林客製化遊學', enName: 'Dublin', price: 22000 },
  'SGIC_Toronto': { zhName: '多倫多客製化遊學', enName: 'Toronto', price: 14000 },
  'SGIC_Vancouver': { zhName: '溫哥華客製化遊學', enName: 'Vancouver', price: 14000 },
  'SGIC_North York': { zhName: '北約克客製化遊學', enName: 'North York', price: 14000 },
};
// 向後相容:舊版引用 EP_COURSE_MAP 的程式(若有)仍可運作
const EP_COURSE_MAP = COURSE_MAP;



function renderAccountTable(){
  const el = document.getElementById('account-mgmt-body');
  if(!el) return;
  const rows = _accountList.map((a,i)=>`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 90px 80px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f5">
      <div style="font-size:13px;font-weight:500">${a.zhName} <span style="font-size:11px;color:#999;font-weight:400">${a.name}</span></div>
      <div style="font-size:12px;color:#555;font-family:monospace">${a.email}</div>
      <div style="font-size:12px;color:#555;font-family:monospace">${a.empId}</div>
      <div>
        <select onchange="changeRole(${i},this.value)" style="font-size:11px;padding:3px 6px;border-radius:5px;border:1px solid #ddd;background:#fff">
          <option value="advisor" ${a.role==='advisor'?'selected':''}>顧問</option>
          <option value="admin"   ${a.role==='admin'  ?'selected':''}>管理員</option>
        </select>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-sm" onclick="resetPwd(${i})" style="font-size:10px;padding:3px 8px">重設密碼</button>
      </div>
    </div>`).join('');

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 90px 80px;gap:8px;padding:6px 0;border-bottom:1.5px solid #e8e8f0;margin-bottom:4px">
      <div style="font-size:10px;font-weight:600;color:#999;text-transform:uppercase">姓名</div>
      <div style="font-size:10px;font-weight:600;color:#999;text-transform:uppercase">Email</div>
      <div style="font-size:10px;font-weight:600;color:#999;text-transform:uppercase">員編</div>
      <div style="font-size:10px;font-weight:600;color:#999;text-transform:uppercase">權限</div>
      <div style="font-size:10px;font-weight:600;color:#999;text-transform:uppercase">操作</div>
    </div>
    ${rows}
    <div style="margin-top:14px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-pink-outline btn-sm" onclick="showAddAccountForm()">＋ 新增帳號</button>
      <button class="btn btn-pink btn-sm" onclick="createAllAccounts()" id="btn-create-all">一鍵建立全部帳號</button>
      <span id="acct-msg" style="font-size:11px;color:#059669"></span>
    </div>
    <div id="add-account-form" style="display:none;margin-top:16px;background:#f8f8fa;border-radius:10px;padding:16px">
      <div style="font-size:12px;font-weight:600;margin-bottom:12px">新增帳號</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;color:#555;display:block;margin-bottom:4px">中文姓名</label>
          <input id="new-zh" class="form-input" style="font-size:12px" placeholder="例：王小明"></div>
        <div><label style="font-size:11px;color:#555;display:block;margin-bottom:4px">英文名</label>
          <input id="new-en" class="form-input" style="font-size:12px" placeholder="例：Ming"></div>
        <div><label style="font-size:11px;color:#555;display:block;margin-bottom:4px">員編</label>
          <input id="new-emp" class="form-input" style="font-family:monospace;font-size:12px" placeholder="tkb0000000"></div>
        <div><label style="font-size:11px;color:#555;display:block;margin-bottom:4px">權限</label>
          <select id="new-role" class="form-input" style="font-size:12px">
            <option value="advisor">顧問</option>
            <option value="admin">管理員</option>
          </select></div>
      </div>
      <div style="font-size:11px;color:#999;margin-bottom:10px">Email = 員編@gmail.com，預設密碼 = 員編（小寫）</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-pink btn-sm" onclick="submitAddAccount()">建立帳號</button>
        <button class="btn btn-sm" onclick="document.getElementById('add-account-form').style.display='none'">取消</button>
        <span id="add-acct-msg" style="font-size:11px;color:#059669"></span>
      </div>
    </div>`;
}

function changeRole(idx, role){
  if(_accountList[idx]) _accountList[idx].role = role;
}

async function resetPwd(idx){
  const a = _accountList[idx];
  if(!a) return;
  if(!confirm('確定要將 '+a.name+' 的密碼重設為員編（'+a.empId+'）？')) return;
  // 需要管理員先登入，呼叫 Firebase Admin SDK（前端無法直接改他人密碼）
  // 替代方案：發送密碼重設信
  alert('⚠️ 請到 Firebase Console → Authentication 手動重設密碼\n或請當事人用忘記密碼功能。');
}

function showAddAccountForm(){
  const f = document.getElementById('add-account-form');
  if(f) f.style.display = f.style.display==='none'?'block':'none';
}

async function submitAddAccount(){
  const zhName = document.getElementById('new-zh')?.value.trim();
  const name   = document.getElementById('new-en')?.value.trim();
  const empId  = document.getElementById('new-emp')?.value.trim().toLowerCase();
  const role   = document.getElementById('new-role')?.value||'advisor';
  const msgEl  = document.getElementById('add-acct-msg');

  if(!zhName||!name||!empId){ if(msgEl){ msgEl.style.color='#dc2626'; msgEl.textContent='請填寫所有欄位'; } return; }
  if(!/^tkb\d{7}$/.test(empId)){ if(msgEl){ msgEl.style.color='#dc2626'; msgEl.textContent='員編格式錯誤（tkb + 7碼）'; } return; }

  const email = empId + '@gmail.com';
  const password = empId;
  if(msgEl){ msgEl.style.color='#f97316'; msgEl.textContent='建立中...'; }

  const result = window.fbCreateUser ? await window.fbCreateUser(email, password) : {ok:false};
  if(!result.ok){
    const errMsg = result.error==='auth/email-already-in-use'?'此帳號已存在':'建立失敗：'+(result.error||'');
    if(msgEl){ msgEl.style.color='#dc2626'; msgEl.textContent=errMsg; }
    return;
  }

  const account = { empId, name, zhName, email, role };
  _accountList.push(account);
  if(window.fbSaveAccount) await window.fbSaveAccount(account);
  document.getElementById('add-account-form').style.display='none';
  renderAccountTable();
  if(msgEl){ msgEl.style.color='#059669'; msgEl.textContent='✓ 帳號已建立'; }
}

async function createAllAccounts(){
  const btn = document.getElementById('btn-create-all');
  const msgEl = document.getElementById('acct-msg');
  if(!confirm('確定要一鍵建立全部 '+DEFAULT_ACCOUNTS.length+' 個帳號嗎？\n已存在的帳號會跳過。')) return;
  if(btn){ btn.disabled=true; btn.textContent='建立中...'; }
  let ok=0, skip=0, fail=0;
  for(const a of DEFAULT_ACCOUNTS){
    const result = window.fbCreateUser ? await window.fbCreateUser(a.email, a.empId) : {ok:false};
    if(result.ok){ ok++; if(window.fbSaveAccount) await window.fbSaveAccount(a); }
    else if(result.error==='auth/email-already-in-use'){ skip++; }
    else { fail++; console.error('建立失敗', a.email, result.error); }
  }
  if(btn){ btn.disabled=false; btn.textContent='一鍵建立全部帳號'; }
  if(msgEl) msgEl.textContent = '完成：建立 '+ok+' 個，跳過 '+skip+' 個，失敗 '+fail+' 個';
  renderAccountTable();
}

// ── Navigation ──
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-'+id);
  if(pg) pg.classList.add('active');
  // 用 id 找對應的 nav 按鈕，避免 index 偏移 bug
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const navMap = {wizard:'[onclick*="showPage(\'wizard\')"]', history:'[onclick*="showPage(\'history\')"]', settings:'#nav-settings', analytics:'#nav-analytics', data:'[onclick*="showPage(\'data\')"]'};
  const sel = navMap[id];
  if(sel){ const nb=document.querySelector(sel); if(nb) nb.classList.add('active'); }
  const titles={wizard:'新增報價',history:'歷史報價紀錄',settings:'匯率設定',data:'費用資料管理',analytics:'數據分析'};
  document.getElementById('topbar-title').textContent=titles[id]||'';
  document.getElementById('topbar-sub').textContent='';
  if(id==='settings')renderSettings();
  if(id==='data')renderDataPage();
  if(id==='history')renderHistory();
  if(id==='wizard')renderWizard();
  if(id==='analytics')renderAnalytics();
  updateBadge();
}

// ── Wizard ──
function renderWizard(){
  const nav=document.getElementById('step-nav-items');
  nav.innerHTML=STEPS.map((s,i)=>{
    const done=i<state.step, active=i===state.step;
    const cls=done?'done':active?'active':'';
    const clickable=i<=state.step?'clickable':'';
    const conn=i<STEPS.length-1?'<div class="step-connector"></div>':'';
    return`<div class="step-item ${cls} ${clickable}" onclick="tryGoStep(${i})">
      <div class="step-circle">${done?'✓':i+1}</div>
      <div><div class="step-label">${s.name}</div><div class="step-en">${s.en}</div></div>
    </div>${conn}`;
  }).join('');
  renderStep();
}

function tryGoStep(i){if(i<=state.step){state.step=i;renderWizard();renderQP();}}
function next(){if(state.step<6){state.step++;renderWizard();renderQP();}}
function prev(){if(state.step>0){state.step--;renderWizard();}}

function renderStep(){
  [step0,step1,step2,step3,step4,step5disc,step6confirm][state.step]();
}

// Step 0 — 顯示 EP + ILSC，coming 為預留佔位
function step0(){
  const schools=['EP','ILSC','EC','Kaplan','SGIC'];
  const coming=['IH','BESA','Winning'];
  const html=`<div class="step-header">
    <div class="step-num-tag">步驟 1 / 7</div>
    <div class="step-title">選擇語言學校</div>
    <div class="step-desc">Select Language School</div>
  </div>
  <div class="form-section">
    <div class="form-section-title">合作學校</div>
    <div class="school-grid">
      ${schools.map(s=>{
        const sel=state.school===s;
        const cnt=Object.keys(SCHOOL_DATA[s]).length;
        return`<div class="school-card ${sel?'selected':''}" onclick="pickSchool('${s}')">
          <div class="school-logo">${s[0]}</div>
          <div class="school-name">${s}</div>
          <div class="school-sub">${cnt} 個校區</div>
          <div class="school-check">${sel?'✓':''}</div>
        </div>`;
      }).join('')}
      ${coming.map(s=>`<div class="school-card disabled">
        <div class="school-logo" style="opacity:.4">${s[0]}</div>
        <div class="school-name" style="color:var(--text3)">${s}</div>
        <div class="school-sub">即將上線</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="step-footer">
    <div></div>
    <button class="btn btn-pink" onclick="next()" ${!state.school?'disabled':''}>下一步 →</button>
  </div>`;
  document.getElementById('step-content').innerHTML=html;
}

function pickSchool(s){
  if(state.school!==s){state.school=s;state.campus=null;state.course=null;state.accomm=null;state.extras={};}
  step0();
}

// Step 1
function step1(){
  if(!state.school){state.step=0;renderWizard();return;}
  const campuses=Object.keys(SCHOOL_DATA[state.school]).filter(c=>SCHOOL_DATA[state.school][c].courses.length>0);
  const countryMap=COUNTRY_MAP[state.school]||{};

  let courseHTML='';
  if(state.campus){
    const courses=(SCHOOL_DATA[state.school][state.campus]?.courses||[]).filter(c=>c.unit!=='按堂計算'&&c.unit!=='堂');
    courseHTML=`<div class="form-section">
      <div class="form-section-title">課程選擇</div>
      <div class="course-list">
        ${courses.map(c=>{
          const tier=getTier(c.tiers,state.weeks||4);
          const price=tier.price||tier.fixed;
          const sel=state.course?.name===c.name;
          return`<div class="course-item ${sel?'selected':''}" onclick='pickCourse(${JSON.stringify(c)})'>
            <div class="course-radio"></div>
            <div style="flex:1"><div class="course-name">${c.name}</div><div class="course-cat">${c.category} · ${c.unit}</div></div>
            <div style="text-align:right"><div class="course-price">${fmt(price,c.currency)}</div><div class="course-price-sub">/ 週參考</div></div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  document.getElementById('step-content').innerHTML=`<div class="step-header">
    <div class="step-num-tag">步驟 2 / 7</div>
    <div class="step-title">校區與課程選擇</div>
    <div class="step-desc">Campus & Course Selection</div>
  </div>
  <div class="form-section">
    <div class="form-section-title">選擇校區</div>
    <div class="campus-grid">
      ${campuses.map(c=>{
        const sel=state.campus===c;
        const cur=(SCHOOL_DATA[state.school][c]?.courses[0]?.currency)||'';
        return`<div class="campus-card ${sel?'selected':''}" onclick="pickCampus('${c.replace(/'/g,"\\'")}')">
          <div class="campus-country">${countryMap[c]||''}</div>
          <div class="campus-name">${c}</div>
          <div class="campus-cur">${cur}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
  ${courseHTML}
  <div class="step-footer">
    <button class="btn" onclick="prev()">← 上一步</button>
    <button class="btn btn-pink" onclick="next()" ${!state.campus||!state.course?'disabled':''}>下一步 →</button>
  </div>`;
}

function pickCampus(c){state.campus=c;state.course=null;state.accomm=null;step1();}
function pickCourse(c){state.course=c;step1();renderQP();}

// Step 2
function step2(){
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('step-content').innerHTML=`<div class="step-header">
    <div class="step-num-tag">步驟 3 / 7</div>
    <div class="step-title">週數與日期</div>
    <div class="step-desc">Duration & Start Date</div>
  </div>
  <div class="form-section">
    <div class="form-section-title">課程時長</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">課程週數 <span>*</span></label>
        <input class="form-input" type="number" id="inp-weeks" min="1" max="52" value="${state.weeks||4}" oninput="state.weeks=parseInt(this.value)||1;renderQP()">
        <div class="form-hint">週數影響學費價格區間及教材費</div>
      </div>
      <div class="form-group">
        <label class="form-label">開始日期 <span>*</span></label>
        <input class="form-input" type="date" id="inp-date" value="${state.startDate||today}" onchange="state.startDate=this.value;checkPeak();renderQP()">
      </div>
    </div>
    <div id="peak-notice"></div>
  </div>
  <div class="form-section">
    <div class="form-section-title">學生資訊</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">學生姓名</label>
        <input class="form-input" placeholder="王小明" value="${state.studentName}" oninput="state.studentName=this.value">
      </div>
      <div class="form-group">
        <label class="form-label">電子信箱</label>
        <input class="form-input" type="email" placeholder="student@email.com" value="${state.studentEmail}" oninput="state.studentEmail=this.value">
      </div>
    </div>
  </div>
  <div class="step-footer">
    <button class="btn" onclick="prev()">← 上一步</button>
    <button class="btn btn-pink" onclick="saveStep2()">下一步 →</button>
  </div>`;
  checkPeak();
}

function checkPeak(){
  const n=document.getElementById('peak-notice');
  if(!n)return;
  const pk=isPeak();
  n.innerHTML=pk?'<div class="notice"><strong>⚠ 旺季提醒：</strong>6–8 月為旺季，部分課程與住宿將加收旺季附加費，已自動計入報價。</div>':'';
}
function saveStep2(){
  state.weeks=parseInt(document.getElementById('inp-weeks').value)||4;
  state.startDate=document.getElementById('inp-date').value;
  next();
}

// Step 3
function step3(){
  const campusData=state.school&&state.campus?getEffectiveCampusData(state.school,state.campus):null;
  const accomms=(campusData?.accomm||[]).filter(a=>a.type!=='押金'&&a.type!=='行政'&&a.type!=='額外加成');
  const byType={};
  accomms.forEach(a=>{if(!byType[a.type])byType[a.type]=[];byType[a.type].push(a);});
  const noAccomm=state.accomm==='none';

  const w=state.weeks||4;
  const sections=Object.entries(byType).map(([type,items])=>`
    <div class="form-section">
      <div class="form-section-title">${type}</div>
      <div class="accomm-grid">
        ${items.map(a=>{
          const price=a.price||a.fixed;
          const unit=a.unit==='按週計算'||a.unit==='每週'?'/週':a.unit==='按天計算'?'/晚':'固定';
          const sel=state.accomm&&state.accomm!=='none'&&state.accomm.name===a.name&&state.accomm.type===a.type&&state.accomm.price===a.price&&state.accomm.fixed===a.fixed;
          // 最少/最多週數卡關
          const tooFew  = a.minWeeks && w < a.minWeeks;
          const tooMany = a.maxWeeks && w > a.maxWeeks;
          const blocked = tooFew || tooMany;
          const blockMsg = tooFew
            ? `⚠ 最少需 ${a.minWeeks} 週`
            : tooMany
              ? `⚠ 最多適用 ${a.maxWeeks} 週`
              : '';
          return`<div class="accomm-card ${sel?'selected':''} ${blocked?'disabled':''}"
            style="${blocked?'opacity:.45;cursor:not-allowed;':''}"
            ${blocked?'':'onclick=\'pickAccomm('+JSON.stringify(a)+')\''}>
            <div class="accomm-type">${type}</div>
            <div class="accomm-name">${a.name}</div>
            <div class="accomm-price">${fmt(price,a.currency)} <span style="font-size:10px;color:var(--text3)">${unit}</span></div>
            ${a.note&&a.note!=='nan'?`<div class="accomm-note">${a.note}</div>`:''}
            ${blocked?`<div style="font-size:10px;color:#dc2626;font-weight:500;margin-top:4px">${blockMsg}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');

  document.getElementById('step-content').innerHTML=`<div class="step-header">
    <div class="step-num-tag">步驟 4 / 7</div>
    <div class="step-title">住宿安排</div>
    <div class="step-desc">Accommodation Selection</div>
  </div>
  ${sections||'<div class="info-notice">此校區無住宿選項，請自行安排或洽詢。</div>'}
  <div class="form-section">
    <div class="accomm-card ${noAccomm?'selected':''}" onclick="pickAccomm('none')" style="cursor:pointer">
      <div class="accomm-type">不需要住宿</div>
      <div class="accomm-name">自行安排住宿</div>
      <div class="accomm-note">僅計算學費與行政費用</div>
    </div>
  </div>
  <div class="step-footer">
    <button class="btn" onclick="prev()">← 上一步</button>
    <button class="btn btn-pink" onclick="next()" ${!state.accomm?'disabled':''}>下一步 →</button>
  </div>`;
}

function pickAccomm(a){state.accomm=a;step3();renderQP();}

// Step 4
function step4(){
  const campusData=state.school&&state.campus?getEffectiveCampusData(state.school,state.campus):null;
  const fees=campusData?.fees||[];
  const extras=fees.filter(f=>['接機','保險','簽證','考試'].includes(f.category));

  document.getElementById('step-content').innerHTML=`<div class="step-header">
    <div class="step-num-tag">步驟 5 / 7</div>
    <div class="step-title">加購項目</div>
    <div class="step-desc">Additional Services</div>
  </div>
  ${extras.length>0?`<div class="form-section">
    <div class="form-section-title">選購服務</div>
    <div class="extra-list">
      ${extras.map(f=>{
        const on=!!state.extras[f.name];
        const price=f.price||f.fixed;
        return`<div class="extra-item ${on?'on':''}" onclick='toggleExtra(${JSON.stringify(f)})'>
          <button class="toggle ${on?'on':''}" onclick="event.stopPropagation();toggleExtra(${JSON.stringify(f).replace(/"/g,"'")})"></button>
          <div class="extra-info"><div class="extra-name">${f.name}</div><div class="extra-sub">${f.category} · ${f.unit}</div></div>
          <div class="extra-price">${fmt(price,f.currency)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`:'<div class="info-notice">此校區無額外加購服務</div>'}
  <div class="form-section">
    <div class="form-section-title">備註</div>
    <div class="form-group">
      <input class="form-input" placeholder="其他備註事項…" value="${state.notes}" oninput="state.notes=this.value">
    </div>
  </div>
  <div class="step-footer">
    <button class="btn" onclick="prev()">← 上一步</button>
    <button class="btn btn-pink" onclick="next()">下一步 →</button>
  </div>`;
}

function toggleExtra(f){
  if(state.extras[f.name])delete state.extras[f.name];else state.extras[f.name]=f;
  step4();renderQP();
}

// Step 5 - Discount
function step5disc(){
  const d=state.disc;
  const schoolDiscs=(adminSettings.discountPlans||[]).filter(p=>{
    if(!p.active||p.school!==state.school)return false;
    if(p.campus&&p.campus!==state.campus)return false;
    if(!state.startDate)return true;
    const dt=new Date(state.startDate);
    const from=p.validFrom?new Date(p.validFrom):null;
    const to=p.validTo?new Date(p.validTo):null;
    if(from&&dt<from)return false;
    if(to&&dt>to)return false;
    return true;
  });
  window._sdPlans=schoolDiscs;

  const cPlans=[
    {type:'原價',label:'原價',sub:'不套用公司折扣',pct:0,fixed:0},
    {type:'優惠價',label:'優惠價',sub:'公司季節優惠方案',pct:d.type==='優惠價'?d.pct:10,fixed:0},
    {type:'出清價',label:'出清價',sub:'特殊出清方案',pct:d.type==='出清價'?d.pct:20,fixed:0},
    {type:'折抵3000',label:'折抵 NT$3,000',sub:'固定金額折抵',pct:0,fixed:3000},
    {type:'折抵6000',label:'折抵 NT$6,000',sub:'固定金額折抵',pct:0,fixed:6000},
  ];

  let sdHTML='';
  if(schoolDiscs.length>0){
    let rows=schoolDiscs.map((p,i)=>{
      const on=d.schoolDiscount&&d.schoolDiscount.id===p.id;
      const priceLabel=p.pct>0?'-'+p.pct+'%':p.fixed>0?'-NT$'+p.fixed.toLocaleString():'—';
      return '<div class="course-item disc-sd-item'+(on?' selected':'')+'" data-sidx="'+i+'">'
        +'<div class="course-radio"></div>'
        +'<div style="flex:1"><div class="course-name">'+p.label+'</div>'
        +'<div class="course-cat">廠商折扣 · '+(p.validFrom||'')+(p.validTo?' ～ '+p.validTo:'')+'</div></div>'
        +'<div style="text-align:right"><div class="course-price">'+priceLabel+'</div></div>'
        +'</div>';
    }).join('');
    const noSel=d.schoolDiscount?'':'selected';
    rows+='<div class="course-item disc-sd-none '+ noSel +'">'
      +'<div class="course-radio"></div><div><div class="course-name">不套用廠商折扣</div></div></div>';
    sdHTML='<div class="form-section" style="border:1.5px solid #bae6fd">'
      +'<div class="form-section-title" style="color:#0369a1">🏫 廠商折扣</div>'
      +'<div style="font-size:11px;color:var(--text3);margin-bottom:10px">學校提供的期間限定折扣</div>'
      +'<div class="course-list" id="disc-sd-list">'+rows+'</div></div>';
  } else {
    sdHTML='<div class="info-notice">此學校 / 校區目前無廠商折扣方案</div>';
  }

  const coRows=cPlans.map(p=>{
    const sel=d.type===p.type;
    const priceLabel=p.pct>0?'-'+p.pct+'%':p.fixed>0?'-NT$'+p.fixed.toLocaleString():'不折扣';
    return '<div class="course-item disc-cd-item'+(sel?' selected':'')+'" data-dtype="'+p.type+'" data-dpct="'+p.pct+'" data-dfixed="'+p.fixed+'">'
      +'<div class="course-radio"></div>'
      +'<div style="flex:1"><div class="course-name">'+p.label+'</div><div class="course-cat">公司折扣 · '+p.sub+'</div></div>'
      +'<div style="text-align:right"><div class="course-price">'+priceLabel+'</div></div>'
      +'</div>';
  }).join('');

  const showCustomPct=(d.type==='優惠價'||d.type==='出清價');
  const coHTML='<div class="form-section">'
    +'<div class="form-section-title">🏷️ 公司折扣</div>'
    +'<div style="font-size:11px;color:var(--text3);margin-bottom:10px">選擇公司折扣類型，可與廠商折扣疊加</div>'
    +'<div class="course-list" id="disc-cd-list">'+coRows+'</div>'
    +(showCustomPct
      ?'<div class="form-group" style="margin-top:10px;max-width:200px">'
        +'<label class="form-label">自訂折扣 %（0–99）</label>'
        +'<input class="form-input" id="disc-pct-inp" type="number" min="0" max="99" value="'+d.pct+'">'
        +'</div>'
      :'')
    +'</div>';

  document.getElementById('step-content').innerHTML=
    '<div class="step-header">'
    +'<div class="step-num-tag">步驟 6 / 7</div>'
    +'<div class="step-title">折扣方案</div>'
    +'<div class="step-desc">Discount Selection</div>'
    +'</div>'
    +sdHTML+coHTML
    +'<div class="step-footer">'
    +'<button class="btn" id="disc-prev-btn">← 上一步</button>'
    +'<button class="btn btn-pink" id="disc-next-btn">下一步 →</button>'
    +'</div>';

  document.getElementById('disc-prev-btn').onclick=function(){prev();};
  document.getElementById('disc-next-btn').onclick=function(){next();};

  document.querySelectorAll('.disc-sd-item').forEach(function(el){
    el.onclick=function(){
      const idx=parseInt(this.dataset.sidx);
      state.disc.schoolDiscount=window._sdPlans[idx]||null;
      _updateDiscUI();renderQP();
    };
  });
  const sdNoneEl=document.querySelector('.disc-sd-none');
  if(sdNoneEl) sdNoneEl.onclick=function(){
    state.disc.schoolDiscount=null;
    _updateDiscUI();renderQP();
  };

  document.querySelectorAll('.disc-cd-item').forEach(function(el){
    el.onclick=function(){
      state.disc.type=this.dataset.dtype;
      state.disc.pct=parseFloat(this.dataset.dpct)||0;
      state.disc.fixed=parseFloat(this.dataset.dfixed)||0;
      _updateDiscUI();renderQP();
    };
  });

  const pctInp=document.getElementById('disc-pct-inp');
  if(pctInp) pctInp.oninput=function(){state.disc.pct=parseInt(this.value)||0;renderQP();};
}

function _updateDiscUI(){
  const d=state.disc;
  document.querySelectorAll('.disc-sd-item').forEach(function(el){
    const idx=parseInt(el.dataset.sidx);
    const p=window._sdPlans&&window._sdPlans[idx];
    el.classList.toggle('selected', !!(d.schoolDiscount&&p&&d.schoolDiscount.id===p.id));
  });
  const sdNoneEl=document.querySelector('.disc-sd-none');
  if(sdNoneEl) sdNoneEl.classList.toggle('selected',!d.schoolDiscount);
  document.querySelectorAll('.disc-cd-item').forEach(function(el){
    el.classList.toggle('selected', el.dataset.dtype===d.type);
  });
}

// Step 6 - Confirm
function step6confirm(){
  document.getElementById('btn-save').style.display='flex';
  const isAdmin=currentUser&&currentUser.role==='admin';
  const calc=calculate();
  const pk=isPeak();
  const fxPct=(((calc.fxBuf||1)-1)*100).toFixed(0);
  const commPct=((calc.commPct||0)*100).toFixed(0);

  let itemRows='';
  calc.items.forEach(i=>{
    itemRows+='<div class="qp-row">'
      +'<div><div class="qp-item-name">'+i.name+(pk?'<span class="peak-badge">旺季</span>':'')+'</div>'
      +'<div class="qp-item-note">'+i.note+'</div></div>'
      +'<div style="text-align:right"><div class="qp-item-price">'+i.display+'</div>'
      +'<div class="qp-item-twd">≈ NT$'+i.twd.toLocaleString()+'</div></div>'
      +'</div>';
  });

  let intRows='<div class="qp-row" style="background:#f8f8fa;padding:6px 8px;border-radius:6px;margin:2px 0">'
    +'<div class="qp-item-name" style="color:var(--text3)">台幣成本（含匯差 +'+fxPct+'%）</div>'
    +'<div class="qp-item-price" style="color:var(--text3)">NT$ '+calc.costTWD.toLocaleString()+'</div></div>'
    +'<div class="qp-row" style="background:#f8f8fa;padding:6px 8px;border-radius:6px;margin:2px 0">'
    +'<div class="qp-item-name" style="color:var(--text3)">未稅售價（含獎金 +'+commPct+'%）</div>'
    +'<div class="qp-item-price" style="color:var(--text3)">NT$ '+calc.preTaxSell.toLocaleString()+'</div></div>';

  let discRows='';
  (calc.discLines||[]).forEach(d=>{
    const isSchool=d.type==='school';
    discRows+='<div class="qp-row">'
      +'<div class="qp-item-name" style="color:'+(isSchool?'#0369a1':'#e91e8c')+'">'
      +(isSchool?'🏫 ':' 🏷️ ')+d.label+'</div>'
      +'<div class="qp-item-price" style="color:#10b981">－NT$ '+Math.abs(d.amt).toLocaleString()+'</div>'
      +'</div>';
  });

  document.getElementById('step-content').innerHTML=
    '<div class="step-header">'
    +'<div class="step-num-tag">步驟 7 / 7</div>'
    +'<div class="step-title">確認報價</div>'
    +'<div class="step-desc">Confirm & Export</div>'
    +'</div>'

    +'<div class="form-section">'
    +'<div class="form-section-title">報價摘要</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px">'
    +'<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">學校 · 校區</div><div style="font-size:14px;font-weight:600">'+state.school+' · '+state.campus+'</div></div>'
    +'<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">課程週數</div><div style="font-size:14px;font-weight:600">'+state.weeks+' 週</div></div>'
    +'<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">課程名稱</div><div style="font-size:13px">'+(state.course?.name||'—')+'</div></div>'
    +'<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">開始日期</div><div style="font-size:13px">'+(state.startDate||'—')+'</div></div>'
    +'</div></div>'

    +'<div class="form-section">'
    +'<div class="form-section-title">費用明細（外幣）</div>'
    +itemRows+'</div>'

    +(isAdmin?('<div class="form-section" style="background:#fafafa">'
    +'<div class="form-section-title" style="color:var(--text3)">計費層（管理員）</div>'
    +intRows+'</div>'):'')
    +(discRows?('<div style="margin-top:8px;margin-bottom:4px;font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.06em;text-transform:uppercase">折扣明細</div>'+discRows):'')
    +(isAdmin?('<div class="qp-row" style="margin-top:4px"><div class="qp-item-name" style="color:var(--text3)">營業稅 '+(adminSettings.taxRate||5)+'%</div>'
    +'<div class="qp-item-price" style="color:var(--text3)">NT$ '+calc.taxAmt.toLocaleString()+'</div></div>'):'')
    +'</div>'

    +'<div id="final-price-block" style="background:var(--pink);border-radius:10px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    +'<div><div style="font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.75)">含稅售價 · 給學生</div>'
    +'<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:2px">'+calc.totalOrig+'</div></div>'
    +'<div style="font-size:26px;font-weight:700;color:#fff" id="final-price-bar">NT$ '+calc.displayFinal.toLocaleString()+'</div>'
    +'</div>'

    +'<div class="notice" style="margin-bottom:0">旺季（6–8月）費用已計入。匯率、匯差、獎金、稅率以系統設定為準。報價僅供參考。</div>'

    +(isAdmin?(
    '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 18px;margin-top:12px">'
    +'<div style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#059669;margin-bottom:10px">淨利試算（管理員）</div>'
    +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#555">含稅售價</span><span style="font-weight:600">NT$ '+calc.displayFinal.toLocaleString()+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#555">－ 原始成本（外幣）</span><span style="color:#dc2626;font-weight:500">－NT$ '+calc.rawCostTWD.toLocaleString()+'</span></div>'
    +(calc.schoolDiscAmt>0?'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#0369a1">＋ 廠商折扣省下</span><span style="color:#0369a1;font-weight:500">＋NT$ '+calc.schoolDiscAmt.toLocaleString()+'</span></div>':'')
    +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#555">＋ 預估回傭（'+calc.rebatePct+'%）</span><span style="color:#059669;font-weight:500">＋NT$ '+calc.rebateTWD.toLocaleString()+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#555">－ 顧問獎金</span><span style="color:#dc2626;font-weight:500">－NT$ '+calc.commissionTWD.toLocaleString()+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #dcfce7;font-size:12px"><span style="color:#555">－ 營業稅</span><span style="color:#dc2626;font-weight:500">－NT$ '+calc.taxAmt.toLocaleString()+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:8px">'
    +'<div><div style="font-size:11px;font-weight:600;color:#15803d">預估淨利</div><div style="font-size:10px;color:#6b7280;margin-top:1px">回傭為預估值，以學校結算為準</div></div>'
    +'<div style="text-align:right"><div style="font-size:22px;font-weight:700;color:#15803d">NT$ '+calc.netProfit.toLocaleString()+'</div>'
    +'<div style="font-size:12px;font-weight:600;color:#059669">淨利率 '+calc.netMargin.toFixed(1)+'%</div></div>'
    +'</div></div>'
    ):'')

    +'<div id="download-section" style="display:none;margin-top:8px"></div>'
    +'<div class="step-footer">'
    +'<button class="btn" onclick="prev()">← 上一步</button>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="btn" id="btn-round" onclick="doRound()" style="background:#fff8f0;border:1.5px solid #f97316;color:#f97316;font-weight:600">▲ 四捨整數</button>'
    +'<button class="btn btn-pink" id="btn-save-main" onclick="saveAndReveal()">✓ 儲存報價</button>'
    +'</div>'
    +'</div>';
}


function doRound(){
  const calc = calculate();
  const rounded = applyRounding(calc.finalTWD);
  state._rounded = true;
  state._roundedFinal = rounded;
  step6confirm();
  renderQP();
  // 重繪後確保按鈕顯示已取整狀態
  const btn = document.getElementById('btn-round');
  if(btn){ btn.textContent = '✔ 已取整 NT$'+rounded.toLocaleString(); btn.disabled=true; btn.style.opacity='0.6'; }
}
function saveAndReveal(){
  saveQuote();
  const isAdmin = currentUser && currentUser.role === 'admin';
  const dl = document.getElementById('download-section');
  if(!dl) return;
  dl.style.display = 'block';
  // 取得當前報價 id（saveQuote 已 unshift 到 history[0]）
  const savedId = history[0] ? history[0].id : null;
  dl.innerHTML =
    '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:14px 18px;margin-bottom:12px">'
    +'<div style="font-size:11px;font-weight:600;color:#15803d;margin-bottom:10px;letter-spacing:.05em">✅ 報價已儲存，請下載報價單</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +(isAdmin?'<button class="btn" id="btn-dl-internal" style="background:#fff">📊 內部報價（PNG）</button>':'')
    +'<button class="btn btn-pink" id="btn-dl-student">📄 學生報價（PNG）</button>'
    +'<button class="btn" id="btn-open-order" style="background:#fff8f0;border:1.5px solid #f97316;color:#f97316;font-weight:600">📋 產生開單指示</button>'
    +'</div>'
    +'</div>'
    +'<div id="order-section" style="display:none"></div>';
  if(isAdmin){
    const bi = document.getElementById('btn-dl-internal');
    if(bi) bi.onclick = function(){ exportPDF('internal'); };
  }
  const bs = document.getElementById('btn-dl-student');
  if(bs) bs.onclick = function(){ exportPDF('student'); };
  const bo = document.getElementById('btn-open-order');
  if(bo) bo.onclick = function(){ showOrderInput(savedId); };
  const sb = document.getElementById('btn-save-main');
  if(sb){ sb.textContent='✓ 已儲存'; sb.disabled=true; sb.style.opacity='0.6'; }
}

// ── Helper: 取得 campusData，30+ 校區 fallback 到同城市一般校區 ──
function getEffectiveCampusData(school, campus){
  const data = SCHOOL_DATA[school]?.[campus];
  if(!data) return null;
  const hasAccomm = (data.accomm||[]).length > 0;
  const hasFees   = (data.fees||[]).length > 0;
  if(!hasAccomm && !hasFees && campus.includes(' 30+')){
    const baseCampus = campus.replace(' 30+','').trim();
    const baseData = SCHOOL_DATA[school]?.[baseCampus];
    if(baseData){
      return {
        courses: data.courses,
        accomm:  baseData.accomm || [],
        fees:    baseData.fees   || [],
      };
    }
  }
  return data;
}


// ── 取整邏輯 ──
function roundFinal(n){
  const rem = n % 1000;
  const base = n - rem;
  const r500 = rem % 500;
  const base500 = rem - r500;
  // 百位以下
  const under500 = r500; // 0-499
  let adj = 0;
  if(under500 <= 500) adj = 0;       // ≤500 歸0（含500本身已是整500）
  if(under500 > 500) adj = 500;      // 501-999 → +500（不可能>999，r500最大499）
  // 實際：r500 是 rem%500，所以 r500 ∈ [0,499]
  // ≤500 → 0，所以整段：rem的百位以下直接捨去
  // 但題目：≤500→0，501-999→500，≥1000→百位
  // 等效：對 n 整體做
  const hundreds = Math.floor(n / 100) * 100; // 先取到百
  const tail = n % 100;  // 個位+十位
  // tail ≤ 49 → 捨 → +0
  // tail ≥ 50 → 進 → +100... 不對，我們要的是對「百位以下的餘數」
  // 重新理解：
  // 取 n 的「500以下部分」= n % 500
  // n % 500 ≤ 0 → 0（即整500）
  // n % 500 ∈ [1,500] → 視為「不足500」→ 歸0（往下取整500）
  // 但題目說501-999→500，代表是看整體數字的最後三位(個十百)
  // 邏輯重寫：
  const last3 = n % 1000;
  if(last3 === 0)   return n;
  if(last3 <= 500)  return n - last3;           // 歸到千位
  if(last3 <= 999)  return n - last3 + 500;     // 取500
  return n;
}
// 正確版：題目說「500以下歸0，501-999用500」
// 即：看含稅售價的 %1000 餘數
// 0       → 不動
// 1-500   → 去掉尾數，變成整千
// 501-999 → 取整千+500
function applyRounding(n){
  const r = n % 1000;
  if(r === 0)   return n;
  if(r <= 500)  return n - r;
  return n - r + 500;
}
// ── Calculate ──
function calculate(){
  if(!state.school||!state.campus||!state.course)return{items:[],costTWD:0,preTaxSell:0,discountAmt:0,totalDiscount:0,taxAmt:0,finalTWD:0,displayFinal:0,totalOrig:'',discLines:[],fxBuf:1,commPct:0,rebatePct:0,rebateTWD:0,commissionTWD:0,netProfit:0,netMargin:0,rawCostTWD:0,discountedCostTWD:0,schoolDiscAmt:0};
  const campusData=getEffectiveCampusData(state.school,state.campus);
  const fees=campusData?.fees||[];
  const w=state.weeks||4;
  const pk=isPeak();
  const items=[];

  // Course
  const c=state.course;
  const tier=getTier(c.tiers,w);
  const baseP=tier.price||tier.fixed;
  const cur=c.currency;
  const isWkly=c.unit==='按週計算'||c.unit==='每週';
  const pkAdd=pk?(tier.peak||0):0;
  const cAmt=isWkly?(baseP+pkAdd)*w:baseP;
  items.push({name:c.name,note:isWkly?(w+'週 × '+fmt(baseP,cur)+(pkAdd>0?' + 旺季'+fmt(pkAdd,cur)+'/週':'')):'固定費用',amt:cAmt,twd:twd(cAmt,cur),currency:cur,display:fmt(cAmt,cur)});

  // Admin (auto)
  fees.filter(f=>['教材','註冊','銀行'].includes(f.category)&&w>=(f.wf||1)&&w<=(f.wt||99)).forEach(f=>{
    const p=f.price||f.fixed; if(!p)return;
    const isW=f.unit==='每週'||f.unit==='按週計算';
    const a=isW?p*w:p;
    items.push({name:f.name,note:'自動計入',amt:a,twd:twd(a,f.currency),currency:f.currency,display:fmt(a,f.currency)});
  });

  // Accomm
  if(state.accomm&&state.accomm!=='none'){
    const a=state.accomm;
    const aP=a.price||a.fixed;
    const aC=a.currency;
    const aW=a.unit==='按週計算'||a.unit==='每週';
    const aA=aW?aP*w:aP;
    items.push({name:a.name,note:aW?(w+'週 × '+fmt(aP,aC)):'固定費用',amt:aA,twd:twd(aA,aC),currency:aC,display:fmt(aA,aC)});
    const arr=fees.find(f=>f.category==='行政'&&(f.name.includes('住宿')||f.name.includes('安排')));
    if(arr){const p=arr.price||arr.fixed;if(p>0)items.push({name:arr.name,note:'住宿行政費',amt:p,twd:twd(p,arr.currency),currency:arr.currency,display:fmt(p,arr.currency)});}
  }

  // Extras
  Object.values(state.extras).forEach(f=>{
    const p=f.price||f.fixed; const aC=f.currency;
    const isW=f.unit==='每週'||f.unit==='按週計算';
    const a=isW?p*w:p;
    items.push({name:f.name,note:f.category,amt:a,twd:twd(a,aC),currency:aC,display:fmt(a,aC)});
  });

  // Layer 1
  const rawCostTWD = items.reduce((s,i)=>s+(i.twd||0), 0);

  // Layer 2: 廠商折扣
  const disc = state.disc || {type:'原價', pct:0, fixed:0, schoolDiscount:null};
  const discLines = [];
  let schoolDiscAmt = 0;
  let discountedCostTWD = rawCostTWD;

  if(disc.schoolDiscount){
    const sd = disc.schoolDiscount;
    schoolDiscAmt = sd.pct > 0
      ? Math.round(rawCostTWD * sd.pct / 100)
      : (sd.fixed || 0);
    discountedCostTWD = rawCostTWD - schoolDiscAmt;
    discLines.push({label: sd.label + '（廠商折扣）', amt: -schoolDiscAmt, type:'school'});
  }

  // Layer 3: 匯差緩衝
  const fxBuf = 1 + (adminSettings.fxBuffer||0) / 100;
  const costTWD = Math.round(discountedCostTWD * fxBuf);

  // Layer 4: 顧問獎金
  const commPct = (adminSettings.commissionPct||0) / 100;
  const preTaxSell = Math.round(costTWD * (1 + commPct));

  // Layer 5: 公司折扣
  let afterCoDisc = preTaxSell;
  if(disc.type !== '原價'){
    let coAmt = 0;
    if(disc.pct > 0)   coAmt = Math.round(preTaxSell * disc.pct / 100);
    else if(disc.fixed > 0) coAmt = disc.fixed;
    afterCoDisc = preTaxSell - coAmt;
    if(coAmt > 0) discLines.push({label: disc.type + '（公司折扣）', amt: -coAmt, type:'company'});
  }

  // Layer 6: 營業稅
  const taxAmt  = Math.round(afterCoDisc * (adminSettings.taxRate||5) / 100);
  const finalTWD = afterCoDisc + taxAmt;

  const discountAmt = preTaxSell - afterCoDisc;
  const totalDiscount = schoolDiscAmt + discountAmt;

  const byCur = {};
  items.forEach(i=>{ byCur[i.currency] = (byCur[i.currency]||0) + i.amt; });
  const totalOrig = Object.entries(byCur).map(([cur,v])=>fmt(v,cur)).join(' + ');

  // 淨利試算
  const rebatePct    = (adminSettings.rebates && adminSettings.rebates[state.school]) || 0;
  const rebateTWD    = Math.round(discountedCostTWD * rebatePct / 100);
  const commissionTWD = preTaxSell - costTWD;
  const netProfit = afterCoDisc - costTWD + rebateTWD;
  const netMargin = finalTWD > 0 ? Math.round(netProfit / finalTWD * 1000) / 10 : 0;

  const displayFinal = state._rounded ? state._roundedFinal : finalTWD;
  return{items, costTWD, preTaxSell, discountAmt, totalDiscount, taxAmt, finalTWD, displayFinal, totalOrig, discLines,
    fxBuf, commPct, rawCostTWD, discountedCostTWD, schoolDiscAmt,
    rebatePct, rebateTWD, commissionTWD, netProfit, netMargin};
}

// ── Quote Panel ──
function renderQP(){
  const calc=calculate();
  const body=document.getElementById('qp-body');
  const meta=document.getElementById('qp-meta');
  if(!state.school){body.innerHTML='<div class="qp-empty"><div class="qp-empty-icon">📋</div>完成選擇後<br>費用將自動顯示於此</div>';return;}
  meta.textContent=[state.school,state.campus,state.weeks?(state.weeks+'週'):''].filter(Boolean).join(' · ');
  if(!calc.items.length){body.innerHTML='<div class="qp-empty">選擇課程後即顯示報價</div>';return;}
  const pk=isPeak();

  let html='<div class="qp-section-title">費用項目（外幣）</div>';
  calc.items.forEach(i=>{
    html+='<div class="qp-row">'
      +'<div><div class="qp-item-name">'+i.name+(pk?'<span class="peak-badge">旺季</span>':'')+'</div>'
      +'<div class="qp-item-note">'+( i.note||'')+'</div></div>'
      +'<div style="text-align:right"><div class="qp-item-price">'+i.display+'</div>'
      +'<div class="qp-item-twd">NT$'+i.twd.toLocaleString()+'</div></div>'
      +'</div>';
  });

  const qpIsAdmin=currentUser&&currentUser.role==='admin';
  if(qpIsAdmin){
    html+='<div class="qp-divider"></div>';
    html+='<div class="qp-section-title">計費層（管理員）</div>';
    html+='<div class="qp-row"><div><div class="qp-item-name">外幣原始成本</div>'
      +'<div class="qp-item-note">未含匯差</div></div>'
      +'<div style="text-align:right"><div class="qp-item-price" style="color:var(--text)">NT$ '+calc.rawCostTWD.toLocaleString()+'</div></div></div>';
    if((calc.schoolDiscAmt||0)>0){
      html+='<div class="qp-row"><div><div class="qp-item-name" style="color:#0369a1">廠商折扣省下成本</div>'
        +'<div class="qp-item-note" style="color:#0369a1">學校給放洋的優惠</div></div>'
        +'<div style="text-align:right"><div class="qp-item-price" style="color:#0369a1">－NT$ '+calc.schoolDiscAmt.toLocaleString()+'</div></div></div>';
    }
    html+='<div class="qp-row"><div><div class="qp-item-name">台幣成本（折後含匯差）</div>'
      +'<div class="qp-item-note">匯差緩衝 +'+(((calc.fxBuf||1)-1)*100).toFixed(0)+'%</div></div>'
      +'<div style="text-align:right"><div class="qp-item-price" style="color:var(--text)">NT$ '+calc.costTWD.toLocaleString()+'</div></div></div>';
    html+='<div class="qp-row"><div><div class="qp-item-name">未稅售價</div>'
      +'<div class="qp-item-note">含顧問獎金 +'+(((calc.commPct||0))*100).toFixed(0)+'%</div></div>'
      +'<div style="text-align:right"><div class="qp-item-price" style="color:var(--text)">NT$ '+calc.preTaxSell.toLocaleString()+'</div></div></div>';
  }

  if(calc.discLines&&calc.discLines.length>0){
    html+='<div class="qp-divider"></div>';
    html+='<div class="qp-section-title">折扣明細</div>';
    calc.discLines.forEach(d=>{
      const isSchool=d.type==='school';
      html+='<div class="qp-row">'
        +'<div><div class="qp-item-name">'+d.label+'</div>'
        +'<div class="qp-item-note" style="color:'+(isSchool?'#0369a1':'#9d174d')+'">'+( isSchool?'🏫 廠商':'🏷️ 公司')+'</div></div>'
        +'<div style="text-align:right"><div class="qp-item-price" style="color:#10b981">-NT$ '+(Math.abs(d.amt)).toLocaleString()+'</div></div>'
        +'</div>';
    });
  }

  if(qpIsAdmin){
  html+='<div class="qp-divider"></div>';
  html+='<div class="qp-row"><div><div class="qp-item-name">營業稅</div>'
    +'<div class="qp-item-note">'+(adminSettings.taxRate||5)+'%</div></div>'
    +'<div style="text-align:right"><div class="qp-item-price" style="color:var(--text)">NT$ '+calc.taxAmt.toLocaleString()+'</div></div></div>';
  }

  html+='<div class="qp-total-section">'
    +'<div class="qp-total-label">含稅售價（給學生）</div>'
    +'<div class="qp-total-amount">NT$ '+calc.displayFinal.toLocaleString()+'</div>'
    +'<div class="qp-total-sub">外幣原價：'+calc.totalOrig+'</div>'
    +'</div>';
  html+='<div style="font-size:10px;color:var(--text3);margin-top:10px;line-height:1.7">'
    +'匯率：'+Object.entries(rates).map(([c,r])=>c+' = '+r).join('・')
    +'</div>';
  if(qpIsAdmin&&calc.netProfit!==undefined){
    const npColor=calc.netProfit>=0?'#059669':'#dc2626';
    html+='<div style="margin-top:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;padding:9px 11px">'
      +'<div style="font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#059669;margin-bottom:5px">淨利試算</div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px">'
      +'<span style="color:var(--text2)">回傭 '+calc.rebatePct+'%</span>'
      +'<span style="color:#059669;font-weight:500">+NT$'+calc.rebateTWD.toLocaleString()+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:5px;padding-top:5px;border-top:1px solid #dcfce7">'
      +'<span style="font-size:11px;font-weight:600;color:#15803d">預估淨利</span>'
      +'<div style="text-align:right"><span style="font-size:16px;font-weight:700;color:'+npColor+'">NT$'+calc.netProfit.toLocaleString()+'</span>'
      +'<span style="font-size:10px;color:'+npColor+';margin-left:4px">'+calc.netMargin.toFixed(1)+'%</span></div>'
      +'</div></div>';
  }

  body.innerHTML=html;
}

// ── Save ──
function saveQuote(){
  const calc=calculate();
  const baseName=(state.studentName||'未填')+'-'+(state.school||'')+'-'+(state.startDate||'未定');
  const sameBase=history.filter(h=>h.baseName===baseName);
  const version='v'+(sameBase.length+1);
  const quoteName=baseName+'-'+version;
  const q={id:Date.now(),date:new Date().toLocaleDateString('zh-TW'),quoteName,baseName,version,
    advisorId:currentUser.id,advisorName:currentUser.name,
    studentName:state.studentName||'未填',studentEmail:state.studentEmail,
    school:state.school,campus:state.campus,course:state.course?.name,weeks:state.weeks,
    startDate:state.startDate,accomm:state.accomm==='none'?null:state.accomm?.name,
    costTWD:calc.costTWD,preTaxSell:calc.preTaxSell,finalTWD:calc.displayFinal,rawFinalTWD:calc.finalTWD,
    discountAmt:calc.discountAmt,totalOrig:calc.totalOrig,items:calc.items,
    discLines:calc.discLines,netProfit:calc.netProfit,netMargin:calc.netMargin,
    rebateTWD:calc.rebateTWD,schoolDiscAmt:calc.schoolDiscAmt,
    _state:{school:state.school,campus:state.campus,course:state.course,
      weeks:state.weeks,startDate:state.startDate,accomm:state.accomm,
      extras:state.extras,disc:state.disc,
      studentName:state.studentName,studentEmail:state.studentEmail,notes:state.notes},
    status:'draft'};
  history.unshift(q);
  localStorage.setItem('fy_history',JSON.stringify(history));
  updateBadge();
  if(window.fbSaveQuote){
    window.fbSaveQuote(q).then(ok=>{
      const ind=document.getElementById('sync-indicator');
      if(ind){ ind.textContent=ok?'☁️ 已同步':'⚠️ 雲端同步失敗'; ind.style.color=ok?'#059669':'#dc2626'; }
    });
  }
  alert('✅ 報價已儲存！\n'+q.studentName+' · '+state.school+' '+state.campus+'\nNT$ '+Math.round(calc.displayFinal).toLocaleString());
  // Phase 4：自動上傳兩張 PNG 到 Drive
  setTimeout(()=>generateAndUploadPNGs(q), 300);
}

function resetWizard(){
  if(!confirm('確定要重新填寫？'))return;
  state={step:0,school:null,campus:null,course:null,weeks:4,startDate:'',accomm:null,extras:{},disc:{type:'原價',pct:0,fixed:0,schoolDiscount:null},studentName:'',studentEmail:'',notes:''};
  document.getElementById('btn-save').style.display='none';
  renderWizard();renderQP();
}

function updateBadge(){document.getElementById('history-badge').textContent=history.length;}
function setModeBadge(isAdmin){
  // 身分徽章（null-safe）：顧問 / 管理員
  var el=document.getElementById('user-role-display');
  if(el) el.textContent = isAdmin ? '🔑 管理員模式' : '👤 顧問模式';
}

// ── Settings ──
function renderSettings(){
  const curs=[{c:'AUD',f:'🇦🇺',n:'澳幣'},{c:'GBP',f:'🇬🇧',n:'英鎊'},{c:'EUR',f:'🇪🇺',n:'歐元'},{c:'USD',f:'🇺🇸',n:'美元'},{c:'CAD',f:'🇨🇦',n:'加幣'}];
  document.getElementById('rate-grid').innerHTML=curs.map(x=>`<div class="rate-item">
    <div class="rate-top"><span class="rate-flag">${x.f}</span><div><div class="rate-code">${x.c}</div><div class="rate-name">${x.n}</div></div></div>
    <div class="rate-row"><span class="rate-label">1 ${x.c} =</span><input class="rate-input" id="r-${x.c}" type="number" value="${rates[x.c]}" step="0.1" min="0.1"><span class="rate-label">TWD</span></div>
  </div>`).join('');
  document.getElementById('s-company').value=companyInfo.company;
  document.getElementById('s-phone').value=companyInfo.phone;
  document.getElementById('s-email').value=companyInfo.email;
  document.getElementById('s-website').value=companyInfo.website;
  document.getElementById('s-note').value=companyInfo.note;
  const fxEl=document.getElementById('a-fxbuf');
  const coEl=document.getElementById('a-comm');
  const txEl=document.getElementById('a-tax');
  const vEl=document.getElementById('a-valid');
  const aEl=document.getElementById('a-alert');
  if(fxEl)fxEl.value=adminSettings.fxBuffer||2;
  if(coEl)coEl.value=adminSettings.commissionPct||2;
  if(txEl)txEl.value=adminSettings.taxRate||5;
  if(vEl)vEl.value=adminSettings.quoteValidDays||30;
  if(aEl)aEl.value=adminSettings.rateAlertDays||7;
  renderRebateGrid();
  renderDiscountPlans();
  renderRateFreshness();

}

function renderRebateGrid(){
  const el=document.getElementById('rebate-grid');
  if(!el)return;
  const schools=Object.keys(SCHOOL_DATA);
  const flags={EP:'🌏',ILSC:'🌐',EC:'🇺🇸',Kaplan:'🎓',SGIC:'🍁'};
  const rebates=adminSettings.rebates||{};
  el.innerHTML=schools.map(s=>`
    <div class="rate-item">
      <div class="rate-top">
        <span class="rate-flag">${flags[s]||'🏫'}</span>
        <div><div class="rate-code">${s}</div><div class="rate-name">回傭率</div></div>
      </div>
      <div class="rate-row">
        <input class="rate-input" id="reb-${s}" type="number" value="${rebates[s]||0}" step="0.1" min="0" max="50">
        <span class="rate-label"> %</span>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:5px">預估：A$100 → 回傭 A$${((rebates[s]||0)).toFixed(1)}</div>
    </div>`).join('');
}

function saveRates(){
  ['AUD','GBP','EUR','USD','CAD'].forEach(cur=>{const v=parseFloat(document.getElementById('r-'+cur).value);if(!isNaN(v))rates[cur]=v;});
  localStorage.setItem('fy_rates',JSON.stringify(rates));
  adminSettings.rateUpdatedAt=new Date().toISOString().split('T')[0];
  localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
  if(window.fbSaveSettings){ window.fbSaveSettings('rates',rates); window.fbSaveSettings('admin',adminSettings); }
  const m=document.getElementById('rate-msg');m.textContent='✓ 匯率已儲存';setTimeout(()=>m.textContent='',2500);
  renderRateFreshness();
}

function renderRateFreshness(){
  const el=document.getElementById('rate-freshness');
  if(!el)return;
  const updated=adminSettings.rateUpdatedAt||'';
  if(!updated){el.innerHTML='<span style="color:var(--text3);font-size:10px">尚未記錄更新日期</span>';return;}
  const days=Math.floor((Date.now()-new Date(updated).getTime())/(1000*60*60*24));
  const alertDays=adminSettings.rateAlertDays||7;
  const color=days>=alertDays?'#dc2626':'#059669';
  const icon=days>=alertDays?'⚠️':'✓';
  el.innerHTML='<div style="font-size:11px;color:'+color+';font-weight:500">'+icon+' 上次更新：'+updated+'</div>'
    +'<div style="font-size:10px;color:var(--text3);margin-top:2px">距今 '+days+' 天'+(days>=alertDays?' · <span style="color:#dc2626">建議更新</span>':'')+'</div>';
}

function saveSettings(){
  companyInfo={company:document.getElementById('s-company').value,phone:document.getElementById('s-phone').value,email:document.getElementById('s-email').value,website:document.getElementById('s-website').value,note:document.getElementById('s-note').value};
  localStorage.setItem('fy_company',JSON.stringify(companyInfo));alert('✅ 設定已儲存');
}

// ── History ──
function renderHistory(){
  const list=document.getElementById('history-list');
  const isAdmin=currentUser.role==='admin';
  const validDays=adminSettings.quoteValidDays||30;
  const qs=isAdmin?history:history.filter(q=>!q.advisorId||q.advisorId===currentUser.id);
  if(!qs.length){
    list.innerHTML='<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">'+(isAdmin?'尚無報價紀錄':'您尚無報價紀錄')+'</div><div class="empty-state-sub">建立第一份報價後將顯示於此</div></div>';
    return;
  }
  list.innerHTML=qs.map(q=>{
    const expired=(function(){
      if(!q.date)return false;
      const d=new Date(q.date.replace(/\//g,'-'));
      return(Date.now()-d.getTime())>validDays*86400000;
    })();
    const qName = q.quoteName || (q.studentName+'-'+(q.school||'')+'-'+(q.startDate||''));
    return '<div class="history-row" style="'+(expired?'opacity:.65':'')+'">'+
      '<div class="td" style="min-width:0">'+
        '<div style="font-weight:500;font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+qName+'</div>'+
        '<div style="font-size:10px;color:var(--text3);margin-top:1px">'+(q.course||'—')+' · '+(q.weeks||'—')+'週</div>'+
      '</div>'+
      '<div class="td">'+(q.school||'—')+' · '+(q.campus||'—')+'</div>'+
      '<div class="td td-amount">NT$ '+Math.round(q.finalTWD||q.totalTWD||0).toLocaleString()+'</div>'+
      '<div class="td">'+
        '<span class="status-pill '+(q.status==='ordered'?'status-sent':q.status==='draft'?'status-draft':'status-sent')+'">'+(q.status==='ordered'?'已開單':q.status==='draft'?'草稿':'已寄出')+'</span>'+
        (expired?'<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:4px;padding:1px 6px;margin-left:4px">已過期</span>':'')+
        (isAdmin&&q.advisorName?'<div style="font-size:10px;color:var(--text3);margin-top:1px">'+q.advisorName+'</div>':'')+
      '</div>'+
      '<div class="td" style="display:flex;gap:6px">'+
        '<button class="btn btn-sm" onclick="copyQ('+q.id+')">複製</button>'+
        '<button class="btn btn-sm" onclick="loadQ('+q.id+')">載入</button>'+
      '</div>'+
      '</div>';
  }).join('');
}

function filterHistory(q){
  document.querySelectorAll('.history-row').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}

function loadQ(id){
  const q=history.find(h=>h.id===id);
  if(!q)return;
  if(q._state){
    Object.assign(state, JSON.parse(JSON.stringify(q._state)));
    state.step=6;
  } else {
    state.school=q.school||null;
    state.campus=q.campus||null;
    state.weeks=q.weeks||4;
    state.startDate=q.startDate||'';
    state.studentName=q.studentName||'';
    state.studentEmail=q.studentEmail||'';
    state.step=6;
  }
  showPage('wizard');
  renderWizard();renderQP();
}

function copyQ(id){
  const q=history.find(h=>h.id===id);
  if(!q)return;
  if(q._state){
    Object.assign(state, JSON.parse(JSON.stringify(q._state)));
  } else {
    state.school=q.school||null;
    state.campus=q.campus||null;
    state.weeks=q.weeks||4;
    state.startDate=q.startDate||'';
    state.studentName=q.studentName||'';
    state.studentEmail=q.studentEmail||'';
    state.course=null;
    state.accomm=null;
    state.extras={};
    state.disc={type:'原價',pct:0,fixed:0,schoolDiscount:null};
  }
  state.step=0;
  showPage('wizard');
  renderWizard();renderQP();
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);'
    +'background:#1a1a2e;color:#fff;font-size:12px;padding:10px 18px;border-radius:8px;'
    +'z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  toast.textContent='✅ 已複製報價，請確認或修改後重新儲存為新版本';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),3500);
}


// ── Phase 3：開單指示 ──
const EMP_ID_RE = /^tkb000\d{4}$/;

function showOrderInput(quoteId){
  const sec = document.getElementById('order-section');
  if(!sec) return;
  sec.style.display = 'block';
  sec.innerHTML =
    '<div style="background:#fff8f0;border:1.5px solid #f97316;border-radius:10px;padding:16px 18px;margin-top:4px">'
    +'<div style="font-size:12px;font-weight:600;color:#ea580c;margin-bottom:12px;letter-spacing:.04em">📋 產生開單指示</div>'
    +'<div style="font-size:11px;color:#555;margin-bottom:8px">請輸入員編以驗證身份後產生開單資料</div>'
    +'<div style="display:flex;gap:8px;align-items:center">'
    +'<input id="emp-id-input" class="form-input" style="max-width:200px;font-family:monospace" '
    +'placeholder="tkb000xxxx" maxlength="10">'
    +'<button class="btn btn-pink" onclick="confirmOrder('+quoteId+')">確認開單</button>'
    +'</div>'
    +'<div id="emp-id-err" style="font-size:10px;color:#dc2626;margin-top:6px;display:none">員編格式錯誤，請輸入 tkb000 + 4碼數字</div>'
    +'</div>';
  setTimeout(()=>{ const inp=document.getElementById('emp-id-input'); if(inp) inp.focus(); },100);
}

function confirmOrder(quoteId){
  const inp = document.getElementById('emp-id-input');
  const err = document.getElementById('emp-id-err');
  if(!inp) return;
  const empId = inp.value.trim().toLowerCase();
  if(!EMP_ID_RE.test(empId)){
    if(err){ err.style.display='block'; }
    inp.style.borderColor='#dc2626';
    return;
  }
  if(err) err.style.display='none';
  inp.style.borderColor='';

  // 取得報價資料
  const q = history.find(h=>h.id===quoteId);
  if(!q){ alert('找不到報價資料'); return; }

  const campus = q.campus || state.campus || '';
  const weeks  = q.weeks  || state.weeks  || 1;
  // 2026-06-09:查找改用 school+campus 組合 key,避免 EP/ILSC 同名校區衝突
  const school = q.school || state.school || '';
  const mapKey = school + '_' + campus;
  const mapEntry = COURSE_MAP[mapKey] || { zhName: campus+'客製化遊學', enName: campus, price: 0 };
  const aPricePerWeek = mapEntry.price;
  const aTotal = aPricePerWeek * weeks;
  const finalTWD = q.finalTWD || 0;
  const bTotal = Math.max(0, finalTWD - aTotal);

  // 開單紀錄物件
  const orderRecord = {
    orderId: 'ORD-' + Date.now(),
    quoteId: quoteId,
    empId: empId,
    advisorName: currentUser.name,
    createdAt: new Date().toISOString(),
    school: school,
    campus: campus,
    weeks: weeks,
    courseZhName: mapEntry.zhName,
    courseEnName: mapEntry.enName,
    aPricePerWeek: aPricePerWeek,
    aTotal: aTotal,
    bTotal: bTotal,
    finalTWD: finalTWD,
    studentName: q.studentName || '',
  };

  // 更新歷史報價狀態
  const idx = history.findIndex(h=>h.id===quoteId);
  if(idx>=0){
    history[idx].status = 'ordered';
    history[idx].orderId = orderRecord.orderId;
    history[idx].empId = empId;
    localStorage.setItem('fy_history', JSON.stringify(history));
    if(window.fbSaveQuote) window.fbSaveQuote(history[idx]);
  }

  // Firebase 存開單紀錄
  if(window._db){
    const { setDoc, doc } = window._firestore || {};
    // 用 window.fbSaveOrder（下面在 index.html 加）
    if(window.fbSaveOrder) window.fbSaveOrder(orderRecord);
  }

  renderOrderCard(orderRecord);
}

function renderOrderCard(o){
  window._currentOrder = o;
  const sec = document.getElementById('order-section');
  if(!sec) return;
  sec.innerHTML =
    '<div style="background:#fff8f0;border:1.5px solid #f97316;border-radius:10px;padding:18px 20px;margin-top:4px">'
    +'<div style="margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:#ea580c">📋 開單指示</div>'
    +'</div>'

    // 學生 + 顧問
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
    +'<div style="background:#fff;border:1px solid #fed7aa;border-radius:7px;padding:10px 12px">'
    +'<div style="font-size:9px;color:#f97316;font-weight:700;letter-spacing:.08em;margin-bottom:3px">學生姓名</div>'
    +'<div style="font-size:13px;font-weight:600">'+o.studentName+'</div>'
    +'</div>'
    +'<div style="background:#fff;border:1px solid #fed7aa;border-radius:7px;padding:10px 12px">'
    +'<div style="font-size:9px;color:#f97316;font-weight:700;letter-spacing:.08em;margin-bottom:3px">員編</div>'
    +'<div style="font-size:13px;font-weight:600;font-family:monospace">'+o.empId+'</div>'
    +'</div>'
    +'</div>'

    // A 課程
    +'<div style="background:#fff;border:1px solid #fed7aa;border-radius:7px;padding:12px 14px;margin-bottom:8px">'
    +'<div style="font-size:9px;color:#f97316;font-weight:700;letter-spacing:.08em;margin-bottom:6px">A 課程（主課）</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline">'
    +'<div>'
    +'<div style="font-size:14px;font-weight:700">'+o.courseZhName+'</div>'
    +'<div style="font-size:11px;color:#999;margin-top:2px">'+(o.school?o.school+' · ':'')+o.courseEnName+' · '+o.weeks+'週 × NT$'+o.aPricePerWeek.toLocaleString()+'/週</div>'
    +'</div>'
    +'<div style="font-size:18px;font-weight:700;color:#ea580c">NT$ '+o.aTotal.toLocaleString()+'</div>'
    +'</div>'
    +'</div>'

    // B 海外學雜費
    +'<div style="background:#fff;border:1px solid #fed7aa;border-radius:7px;padding:12px 14px;margin-bottom:14px">'
    +'<div style="font-size:9px;color:#f97316;font-weight:700;letter-spacing:.08em;margin-bottom:6px">B 海外學雜費</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline">'
    +'<div>'
    +'<div style="font-size:14px;font-weight:700">海外學雜費</div>'
    +'<div style="font-size:11px;color:#999;margin-top:2px">含稅總額 NT$'+o.finalTWD.toLocaleString()+' － A課程 NT$'+o.aTotal.toLocaleString()+'</div>'
    +'</div>'
    +'<div style="font-size:18px;font-weight:700;color:#ea580c">NT$ '+o.bTotal.toLocaleString()+'</div>'
    +'</div>'
    +'</div>'

    // 說明
    +'<div style="background:#fffbf2;border:1px solid #fde68a;border-radius:7px;padding:10px 12px;font-size:11px;color:#92400e;line-height:1.7;margin-bottom:14px">'
    +'⚠️ 整體費用依照實際報價單為主，本開單指示僅供內部作業參考。'
    +'</div>'

    // 按鈕
    +'<div style="display:flex;gap:8px">'
    +'<button class="btn" onclick="copyOrderText(this)" style="background:#fff;border:1.5px solid #f97316;color:#f97316">📋 複製開單內容</button>'
    +'</div>'
    +'</div>';
}

function copyOrderText(btn){
  // 從最後一次 renderOrderCard 存的資料組純文字
  const o = window._currentOrder;
  if(!o){ alert('找不到開單資料'); return; }
  const text = [
    '【開單指示】',
    '學生姓名：' + o.studentName,
    '員編：' + o.empId,
    '',
    '▎ A 課程（主課）',
    (o.school?o.school+' · ':'') + o.courseZhName + '（' + o.courseEnName + '）',
    o.weeks + '週 × NT$' + o.aPricePerWeek.toLocaleString() + '/週 ＝ NT$' + o.aTotal.toLocaleString(),
    '',
    '▎ B 海外學雜費',
    'NT$' + o.bTotal.toLocaleString(),
    '',
    '⚠️ 整體費用依照實際報價單為主，本開單指示僅供內部作業參考。',
  ].join('\n');
  navigator.clipboard && navigator.clipboard.writeText(text).then(()=>{
    btn.textContent='✓ 已複製'; setTimeout(()=>btn.textContent='📋 複製開單內容',2000);
  });
}

async function exportPNGBlob(type){
  const isInternal = type === 'internal';
  const wrap = buildPDFWrap(isInternal);
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, {
      scale: 2, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false, width: 720,
    });
    return await new Promise(res => canvas.toBlob(res, 'image/png'));
  } catch(e){
    console.error('exportPNGBlob error', e);
    return null;
  } finally {
    if(wrap.parentNode) document.body.removeChild(wrap);
  }
}

// ── PDF Export ──
function buildPDFWrap(isInternal){
  const calc      = calculate();
  const pk         = isPeak();
  const ci         = companyInfo;
  const dateStr    = new Date().toLocaleDateString('zh-TW').replace(/\//g,'-');

  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:fixed','top:-9999px','left:-9999px',
    'width:720px','background:#fff','padding:40px',
    'font-family:"Noto Sans TC",sans-serif','font-size:13px','color:#1a1a2e',
    'border-radius:0','z-index:-1'
  ].join(';');

  const headerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;
                margin-bottom:28px;padding-bottom:16px;border-bottom:3px solid #e91e8c">
      <div>
        <div style="font-size:10px;letter-spacing:.15em;text-transform:uppercase;
                    color:#e91e8c;font-weight:600;margin-bottom:4px">Language School Quotation</div>
        <div style="font-size:22px;font-weight:700">${ci.company}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:26px;font-weight:700;color:#e91e8c;letter-spacing:.05em">QUOTATION</div>
        <div style="font-size:11px;color:#999;margin-top:3px">${dateStr}${isInternal?' &#12288;[內部版本]':''}</div>
      </div>
    </div>`;

  const infoHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;margin-bottom:22px;
                border:1.5px solid #fce4f3;border-radius:8px;overflow:hidden">
      ${[
        ['學生姓名 Student', state.studentName||'—'],
        ['電子信箱 Email',   state.studentEmail||'—'],
        ['學校 · 校區',      (state.school||'')+'・'+(state.campus||'')],
        ['週數 / 開始日期',  (state.weeks||'')+'週 / '+(state.startDate||'待定')],
      ].map((r,i)=>`
        <div style="padding:10px 14px;background:${i%2===0?'#fce4f3':'#fdf0f9'}">
          <div style="font-size:9px;font-weight:700;color:#c01070;letter-spacing:.1em;
                      text-transform:uppercase;margin-bottom:3px">${r[0]}</div>
          <div style="font-size:13px;font-weight:600">${r[1]}</div>
        </div>`).join('')}
    </div>`;

  const thStyle = 'font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;' +
                  'color:#777;padding:8px 10px;text-align:left;border-bottom:1.5px solid #e8e8f0;background:#f8f8fa';
  const tdStyle = 'padding:10px 10px;font-size:12px;color:#333;vertical-align:top;border-bottom:1px solid #f0f0f5';

  const totalDiscAmt = (calc.schoolDiscAmt||0) + (calc.discountAmt||0);
  const mainCur = calc.items.length>0 ? calc.items[0].currency : 'AUD';
  const mainRate = rates[mainCur] || 1;
  const fxBufVal = 1+(adminSettings.fxBuffer||0)/100;
  const discForeignAmt = Math.round(totalDiscAmt / mainRate / fxBufVal);
  const discForeignStr = totalDiscAmt>0
    ? '-'+(mainCur==='AUD'?'A$':mainCur==='GBP'?'£':mainCur==='EUR'?'€':mainCur==='USD'?'$':'$')+discForeignAmt.toLocaleString()
    : '';

  const internalDiscRows = isInternal
    ? (calc.discLines||[]).map(d=>`<tr>
        <td colspan="2" style="${tdStyle};color:#e91e8c;font-size:11px">${d.label}</td>
        <td style="${tdStyle};text-align:right"></td>
        <td style="${tdStyle};font-weight:700;color:#10b981;text-align:right">-NT$ ${Math.abs(d.amt).toLocaleString()}</td>
       </tr>`).join('')
    : '';

  const studentDiscRow = (!isInternal && totalDiscAmt > 0)
    ? `<tr>
        <td style="${tdStyle};color:#e91e8c;font-weight:600;border-top:1.5px solid #fce4f3">優惠折扣</td>
        <td style="${tdStyle};font-weight:700;color:#10b981;text-align:right;border-top:1.5px solid #fce4f3">${discForeignStr}</td>
       </tr>` : '';

  const tableHTML = isInternal ? `
    <div style="font-size:10px;font-weight:700;color:#e91e8c;letter-spacing:.1em;
                text-transform:uppercase;margin-bottom:8px;padding-bottom:6px;
                border-bottom:1.5px solid #fce4f3">費用明細 Cost Breakdown</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <thead><tr>
        <th style="${thStyle}">費用項目</th>
        <th style="${thStyle}">說明</th>
        <th style="${thStyle};text-align:right">原幣金額</th>
        <th style="${thStyle};text-align:right">新台幣換算</th>
      </tr></thead>
      <tbody>
        ${calc.items.map(i=>`<tr>
          <td style="${tdStyle}">${i.name}${pk?'<span style="font-size:9px;background:#fff7ed;color:#d97706;border:1px solid #fde68a;padding:1px 5px;border-radius:4px;margin-left:5px;font-weight:600">旺季</span>':''}</td>
          <td style="${tdStyle};color:#999;font-size:11px">${i.note||''}</td>
          <td style="${tdStyle};font-weight:600;color:#555;text-align:right">${i.display}</td>
          <td style="${tdStyle};font-weight:700;color:#e91e8c;text-align:right">NT$ ${i.twd.toLocaleString()}</td>
        </tr>`).join('')}
        ${internalDiscRows}
      </tbody>
    </table>` : `
    <div style="font-size:10px;font-weight:700;color:#e91e8c;letter-spacing:.1em;
                text-transform:uppercase;margin-bottom:8px;padding-bottom:6px;
                border-bottom:1.5px solid #fce4f3">費用明細 Cost Breakdown</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;table-layout:fixed">
      <colgroup><col style="width:70%"><col style="width:30%"></colgroup>
      <thead><tr>
        <th style="${thStyle}">費用項目</th>
        <th style="${thStyle};text-align:right">金額</th>
      </tr></thead>
      <tbody>
        ${calc.items.map(i=>`<tr>
          <td style="${tdStyle}">${i.name}${pk?'<span style="font-size:9px;background:#fff7ed;color:#d97706;border:1px solid #fde68a;padding:1px 5px;border-radius:4px;margin-left:5px;font-weight:600">旺季</span>':''}</td>
          <td style="${tdStyle};font-weight:600;color:#555;text-align:right">${i.display}</td>
        </tr>`).join('')}
        ${studentDiscRow}
      </tbody>
    </table>`;

  const totalHTML = isInternal ? `
    <div style="background:#e91e8c;border-radius:10px;padding:16px 20px;
                display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
                    color:rgba(255,255,255,.75);margin-bottom:3px">含稅售價 (Internal)</div>
        <div style="font-size:11px;color:rgba(255,255,255,.65)">≈ ${calc.totalOrig}</div>
      </div>
      <div style="font-size:28px;font-weight:700;color:#fff">NT$ ${calc.displayFinal.toLocaleString()}</div>
    </div>` : `
    <div style="background:#e91e8c;border-radius:10px;padding:16px 20px;
                display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
                    color:rgba(255,255,255,.75);margin-bottom:3px">台幣含稅總費用</div>
        <div style="font-size:11px;color:rgba(255,255,255,.65)">實際以匯款日匯率為準</div>
      </div>
      <div style="font-size:28px;font-weight:700;color:#fff">NT$ ${calc.displayFinal.toLocaleString()}</div>
    </div>`;

  const internalHTML = isInternal ? `
    <div style="background:#f8f8fa;border-radius:8px;padding:12px 14px;font-size:11px;
                color:#555;margin-bottom:16px">
      <div style="font-weight:600;margin-bottom:8px;color:#333">內部計費明細</div>
      ${[
        ['外幣原始成本', 'NT$ '+calc.rawCostTWD.toLocaleString(), ''],
        ...(calc.schoolDiscAmt>0?[['廠商折扣省下', 'NT$ '+calc.schoolDiscAmt.toLocaleString(), '#0369a1']]:[] ),
        ['台幣成本（含匯差 +'+((calc.fxBuf-1)*100).toFixed(0)+'%）', 'NT$ '+calc.costTWD.toLocaleString(), ''],
        ['顧問獎金 (+'+((calc.commPct||0)*100).toFixed(0)+'%)', 'NT$ '+calc.commissionTWD.toLocaleString(), ''],
        ['未稅售價', 'NT$ '+calc.preTaxSell.toLocaleString(), '#333'],
        ...((calc.discLines||[]).map(d=>[d.label, '-NT$ '+Math.abs(d.amt).toLocaleString(), '#e91e8c'])),
        ['營業稅 '+(adminSettings.taxRate||5)+'%', 'NT$ '+calc.taxAmt.toLocaleString(), ''],
      ].map(([l,v,col])=>`
        <div style="display:flex;justify-content:space-between;padding:3px 0;
                    ${col?'color:'+col+';font-weight:600':''}">
          <span>${l}</span><span>${v}</span>
        </div>`).join('')}
      <div style="border-top:1.5px solid #e8e8f0;margin-top:6px;padding-top:6px">
        <div style="display:flex;justify-content:space-between;padding:3px 0;color:#059669">
          <span>＋ 預估回傭 (${calc.rebatePct}%)</span>
          <span>+NT$ ${calc.rebateTWD.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;
                    font-weight:700;font-size:12px;margin-top:3px">
          <span style="color:#15803d">預估淨利</span>
          <span style="color:#15803d">NT$ ${calc.netProfit.toLocaleString()} (${calc.netMargin.toFixed(1)}%)</span>
        </div>
      </div>
    </div>` : '';

  // 有效期限計算
  const validDays = adminSettings.quoteValidDays || 30;
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + validDays);
  const expireStr = expireDate.toLocaleDateString('zh-TW').replace(/\//g, '/');

  const footerHTML = `
    <div style="background:#fffbf2;border:1px solid #fde68a;border-radius:7px;
                padding:8px 14px;margin-bottom:12px;font-size:10px;color:#92400e;
                display:flex;justify-content:space-between;align-items:center">
      <span>⏳ 本報價單有效期限至 <strong>${expireStr}</strong>（${validDays} 天）</span>
      <span style="font-size:9px;color:#b45309">逾期請重新報價</span>
    </div>
    <div style="border-top:1px solid #eee;padding-top:14px;
                display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
      <div style="font-size:10px;color:#999;line-height:1.9;flex:1">
        ${isInternal
          ? (ci.note||'')+'<br>匯率參考：'+Object.entries(rates).map(([cur,r])=>'1 '+cur+' = '+r+' TWD').join('　')
          : (ci.note||'')}
      </div>
      <div style="text-align:right">
        <div style="font-size:13px;font-weight:700;margin-bottom:3px">${ci.company}</div>
        <div style="font-size:11px;color:#666;line-height:1.9">
          ${[ci.phone,ci.email,ci.website].filter(Boolean).join('<br>')}
        </div>
      </div>
    </div>`;

  wrap.innerHTML = headerHTML + infoHTML + tableHTML + totalHTML + internalHTML + footerHTML;
  return wrap;
}

function exportPDF(mode='student'){
  const isInternal = mode === 'internal';
  const wrap = buildPDFWrap(isInternal);
  const studentLabel = state.studentName || '報價單';
  const dateStr    = new Date().toLocaleDateString('zh-TW').replace(/\//g,'-');
  document.body.appendChild(wrap);

  const filename = (isInternal?'內部報價_':'報價單_') + studentLabel + '_' + dateStr + '.png';
  const btnId = isInternal ? 'btn-internal-pdf' : 'btn-student-pdf';
  const btn   = document.getElementById(btnId);
  const origTxt = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled=true; btn.innerHTML='⏳ 產生中...'; }

  html2canvas(wrap, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 720,
  }).then(function(canvas){
    document.body.removeChild(wrap);
    if(btn){ btn.disabled=false; btn.innerHTML=origTxt; }
    canvas.toBlob(function(blob){
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 3000);
      const footer = document.querySelector('.step-footer');
      if(footer && !footer.querySelector('.dl-tip')){
        const tip = document.createElement('div');
        tip.className = 'dl-tip';
        tip.style.cssText = 'font-size:11px;color:var(--text3);margin-top:10px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:9px 12px;line-height:1.7;width:100%';
        tip.textContent = '✅ 報價單已下載為 PNG 圖片！';
        footer.appendChild(tip);
        setTimeout(()=>tip.remove(), 5000);
      }
    }, 'image/png');
  }).catch(function(err){
    document.body.removeChild(wrap);
    if(btn){ btn.disabled=false; btn.innerHTML=origTxt; }
    alert('截圖失敗：' + err.message);
  });
}

function saveAdmin(){
  adminSettings.fxBuffer=parseFloat(document.getElementById('a-fxbuf').value)||0;
  adminSettings.commissionPct=parseFloat(document.getElementById('a-comm').value)||0;
  adminSettings.taxRate=parseFloat(document.getElementById('a-tax').value)||5;
  const vEl=document.getElementById('a-valid');
  const aEl=document.getElementById('a-alert');
  if(vEl)adminSettings.quoteValidDays=parseInt(vEl.value)||30;
  if(aEl)adminSettings.rateAlertDays=parseInt(aEl.value)||7;
  localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
  if(window.fbSaveSettings){ window.fbSaveSettings('admin',adminSettings); }
  const m=document.getElementById('admin-msg');m.textContent='✓ 已儲存';setTimeout(()=>m.textContent='',2000);
}

function saveRebates(){
  const schools=Object.keys(SCHOOL_DATA);
  if(!adminSettings.rebates)adminSettings.rebates={};
  schools.forEach(s=>{
    const el=document.getElementById('reb-'+s);
    if(el)adminSettings.rebates[s]=parseFloat(el.value)||0;
  });
  localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
  if(window.fbSaveSettings){ window.fbSaveSettings('admin',adminSettings); }
  const m=document.getElementById('rebate-msg');m.textContent='✓ 已儲存';setTimeout(()=>m.textContent='',2000);
}

function renderDiscountPlans(){
  const el=document.getElementById('discount-plan-list');
  if(!el)return;
  const plans=adminSettings.discountPlans||[];
  if(!plans.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:8px 0">尚無折扣方案</div>';return;}
  el.innerHTML=plans.map((p,i)=>'<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start">'
    +'<div style="flex:1">'
    +'<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px">'+p.label+'</div>'
    +'<div style="font-size:11px;color:var(--text3)">'+p.school+(p.campus?' · '+p.campus:'')
    +' &nbsp;|&nbsp; '+(p.pct>0?'-'+p.pct+'%':p.fixed>0?'-NT$'+p.fixed:'—')
    +' &nbsp;|&nbsp; '+(p.validFrom||'')+(p.validTo?' ～ '+p.validTo:'')+'</div>'
    +'</div>'
    +'<label style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3);cursor:pointer">'
    +'<input type="checkbox" data-pidx="'+i+'" '+(p.active?'checked':'')+'> 啟用</label>'
    +'<button class="btn btn-sm" data-didx="'+i+'" style="color:var(--danger,#ef4444);border-color:transparent">刪除</button>'
    +'</div>').join('');
  el.querySelectorAll('input[data-pidx]').forEach(inp=>{
    inp.addEventListener('change',function(){togglePlan(parseInt(this.dataset.pidx),this.checked);});
  });
  el.querySelectorAll('button[data-didx]').forEach(btn=>{
    btn.addEventListener('click',function(){deletePlan(parseInt(this.dataset.didx));});
  });
}

function addDiscountPlan(){
  const schools=Object.keys(SCHOOL_DATA);
  const schoolOpts=schools.map(s=>'<option>'+s+'</option>').join('');
  const modal=document.createElement('div');
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  modal.innerHTML='<div style="background:#fff;border-radius:14px;padding:24px;width:440px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.2)">'
    +'<div style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text)">新增廠商折扣方案</div>'
    +'<div style="display:grid;gap:10px">'
    +'<div class="form-group"><label class="form-label">方案名稱</label><input class="form-input" id="np-label" placeholder="EP Brisbane 淡季優惠"></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div class="form-group"><label class="form-label">學校</label><select class="form-select" id="np-school">'+schoolOpts+'</select></div>'
    +'<div class="form-group"><label class="form-label">校區（留空=全部）</label><input class="form-input" id="np-campus" placeholder="Brisbane"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div class="form-group"><label class="form-label">折扣 %（0=不用）</label><input class="form-input" type="number" id="np-pct" value="0" min="0" max="99"></div>'
    +'<div class="form-group"><label class="form-label">固定折抵 NT$</label><input class="form-input" type="number" id="np-fixed" value="0" min="0"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div class="form-group"><label class="form-label">開始日期</label><input class="form-input" type="date" id="np-from"></div>'
    +'<div class="form-group"><label class="form-label">結束日期</label><input class="form-input" type="date" id="np-to"></div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">'
    +'<button class="btn" id="modal-cancel-btn">取消</button>'
    +'<button class="btn btn-pink" onclick="confirmAddPlan(this)">新增</button>'
    +'</div></div>';
  document.body.appendChild(modal);
  document.getElementById('modal-cancel-btn').addEventListener('click',function(){this.closest('[style*="fixed"]').remove();});
}

function confirmAddPlan(btn){
  const m=btn.closest('[style*="fixed"]');
  const plan={
    id:'dp'+Date.now(),
    label:document.getElementById('np-label').value||'新方案',
    school:document.getElementById('np-school').value,
    campus:document.getElementById('np-campus').value||'',
    pct:parseFloat(document.getElementById('np-pct').value)||0,
    fixed:parseFloat(document.getElementById('np-fixed').value)||0,
    validFrom:document.getElementById('np-from').value||'',
    validTo:document.getElementById('np-to').value||'',
    active:true
  };
  adminSettings.discountPlans.push(plan);
  localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
  m.remove();
  renderDiscountPlans();
}

function togglePlan(i,v){adminSettings.discountPlans[i].active=v;localStorage.setItem('fy_admin',JSON.stringify(adminSettings));}
function deletePlan(i){if(!confirm('確定刪除此方案？'))return;adminSettings.discountPlans.splice(i,1);localStorage.setItem('fy_admin',JSON.stringify(adminSettings));renderDiscountPlans();}

// ── Data Management Page ──
let dataState = {school: Object.keys(SCHOOL_DATA)[0], campus: null};

function renderDataPage(){
  const schools = Object.keys(SCHOOL_DATA);
  const comingSoon = ['IH','BESA','Winning'];

  const totalCampuses = schools.reduce((s,sch)=>s+Object.keys(SCHOOL_DATA[sch]).length,0);
  const totalRules = schools.reduce((s,sch)=>s+Object.values(SCHOOL_DATA[sch]).reduce((s2,camp)=>
    s2+(camp.courses||[]).length+(camp.accomm||[]).length+(camp.fees||[]).length,0),0);
  const statsEl = document.getElementById('data-stats');
  if(statsEl) statsEl.innerHTML = [
    [schools.length,'已上線學校','#e91e8c'],
    [totalCampuses,'校區','#7c3aed'],
    [totalRules.toLocaleString(),'費用規則','#0369a1'],
  ].map(([n,l,col])=>'<div style="text-align:center;padding:6px 14px;background:#fff;border:1px solid var(--border);border-radius:8px">'
    +'<div style="font-size:16px;font-weight:700;color:'+col+'">'+n+'</div>'
    +'<div style="font-size:10px;color:var(--text3);margin-top:1px">'+l+'</div>'
    +'</div>').join('');

  const tabsEl = document.getElementById('data-school-tabs');
  const allSchools = [...schools, ...comingSoon];
  if(tabsEl) tabsEl.innerHTML = allSchools.map(s=>{
    const active = s===dataState.school;
    const avail = schools.includes(s);
    return `<button onclick="${avail?`switchDataSchool('${s}')`:'void(0)'}"
      style="padding:7px 16px;border-radius:8px;border:1px solid ${active?'var(--pink)':'var(--border)'};
      background:${active?'var(--pink-light)':'var(--bg)'};color:${active?'var(--pink)':avail?'var(--text)':'var(--text3)'};
      font-size:12px;font-weight:${active?'600':'400'};cursor:${avail?'pointer':'not-allowed'};
      display:flex;align-items:center;gap:5px">
      ${s}${!avail?'<span style="font-size:9px;background:#f3f4f6;color:#9ca3af;padding:1px 5px;border-radius:4px">待上架</span>':''}
    </button>`;
  }).join('');

  renderDataCampuses();
}

function switchDataSchool(school){
  dataState.school = school;
  dataState.campus = null;
  renderDataPage();
}

function renderDataCampuses(){
  const campuses = Object.keys(SCHOOL_DATA[dataState.school]||{});
  if(!dataState.campus) dataState.campus = campuses[0];

  const listEl = document.getElementById('data-campus-list');
  if(listEl) listEl.innerHTML = campuses.map(function(camp){
    const active = camp===dataState.campus;
    const data = SCHOOL_DATA[dataState.school][camp];
    const nC=(data.courses||[]).length, nA=(data.accomm||[]).length, nF=(data.fees||[]).length;
    return '<div onclick="switchDataCampus(\''+camp.replace(/'/g,"\\'")+'\')"'
      +' style="padding:14px 18px;cursor:pointer;border-bottom:1px solid var(--border);'
      +'background:'+(active?'var(--pink-light)':'transparent')+';'
      +'border-left:4px solid '+(active?'var(--pink)':'transparent')+'">'
      +'<div style="font-size:13px;font-weight:'+(active?'600':'400')+';color:'+(active?'var(--pink)':'var(--text)')+'">'+camp+'</div>'
      +'<div style="display:flex;gap:12px;margin-top:4px">'
      +'<span style="font-size:10px;color:var(--text3)">課程 '+nC+'</span>'
      +'<span style="font-size:10px;color:var(--text3)">住宿 '+nA+'</span>'
      +'<span style="font-size:10px;color:var(--text3)">規費 '+nF+'</span>'
      +'</div></div>';
  }).join('');

  renderDataDetail();
}

function switchDataCampus(campus){
  dataState.campus = campus;
  renderDataCampuses();
}

function renderDataDetail(){
  const el = document.getElementById('data-detail');
  if(!el) return;
  const camp = SCHOOL_DATA[dataState.school]?.[dataState.campus];
  if(!camp){ el.innerHTML=''; return; }

  const cur = (c) => c==='AUD'?'A$':c==='GBP'?'£':c==='EUR'?'€':c==='USD'?'US$':'$';
  const fmtPrice = (item) => {
    if(item.fixed>0) return cur(item.currency)+(item.fixed)+' 固定';
    if(item.price>0) return cur(item.currency)+(item.price)+'/週';
    return '—';
  };
  const badge = (txt,col) => txt
    ? `<span style="font-size:10px;padding:2px 7px;border-radius:4px;background:${col||'#f3f4f6'};
        color:${col?'#fff':'#555'};font-weight:500;white-space:nowrap">${txt}</span>`
    : '';

  const courseCards = (camp.courses||[]).map(item=>{
    const tiers = item.tiers||[];
    const tierRows = tiers.map(t=>{
      const range = (t.wf===t.wt) ? t.wf+'週' : t.wf+'–'+t.wt+'週';
      const price = t.price>0 ? cur(item.currency)+t.price+'/週' : t.fixed>0 ? cur(item.currency)+t.fixed+' 固定' : '—';
      const peak = t.peak>0 ? `<span style="color:#d97706;font-size:10px;margin-left:6px">旺季 +${cur(item.currency)}${t.peak}</span>` : '';
      return `<div style="display:flex;justify-content:space-between;align-items:center;
        padding:5px 0;border-bottom:1px solid #f5f5f7">
        <span style="font-size:11px;color:#888">${range}</span>
        <span style="font-size:13px;font-weight:600;color:#e91e8c">${price}${peak}</span>
      </div>`;
    }).join('');
    return `<div style="background:#fff;border:1px solid #eee;border-radius:10px;padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:13px;font-weight:600;color:#1a1a2e;flex:1">${item.name}</span>
        ${badge(item.category,'#6b7280')}
        ${badge(item.currency,'#0369a1')}
      </div>
      <div style="font-size:10px;color:#aaa;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">${item.unit}</div>
      ${tierRows}
    </div>`;
  }).join('');

  const courseSection = (camp.courses||[]).length ? `
    <div style="margin-bottom:18px">
      <div style="font-size:11px;font-weight:600;color:#555;margin-bottom:10px;
        text-transform:uppercase;letter-spacing:.07em;display:flex;align-items:center;gap:8px">
        課程 Courses
        <span style="background:#fce4f3;color:#e91e8c;font-size:10px;padding:2px 8px;border-radius:10px">
          ${(camp.courses||[]).length} 筆</span>
      </div>
      ${courseCards}
    </div>` : '';

  const accommByType = {};
  (camp.accomm||[]).forEach(item=>{
    const t = item.type||'其他';
    if(!accommByType[t]) accommByType[t]=[];
    accommByType[t].push(item);
  });

  const accommSection = (camp.accomm||[]).length ? `
    <div style="margin-bottom:18px">
      <div style="font-size:11px;font-weight:600;color:#555;margin-bottom:10px;
        text-transform:uppercase;letter-spacing:.07em;display:flex;align-items:center;gap:8px">
        住宿 Accommodation
        <span style="background:#e0e7ff;color:#3730a3;font-size:10px;padding:2px 8px;border-radius:10px">
          ${(camp.accomm||[]).length} 筆</span>
      </div>
      ${Object.entries(accommByType).map(([type, items])=>`
        <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:.06em;
          margin-bottom:6px;margin-top:10px">${type}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">
          ${items.map(item=>`
            <div style="background:#fff;border:1px solid #eee;border-radius:10px;padding:11px 13px">
              <div style="font-size:12px;font-weight:600;margin-bottom:5px;color:#1a1a2e;line-height:1.4">${item.name}</div>
              <div style="font-size:15px;font-weight:700;color:#e91e8c;margin-bottom:4px">${fmtPrice(item)}</div>
              ${item.note?`<div style="font-size:10px;color:#aaa;line-height:1.5">${item.note}</div>`:''}
            </div>`).join('')}
        </div>`).join('')}
    </div>` : '';

  const feeSection = (camp.fees||[]).length ? `
    <div style="margin-bottom:18px">
      <div style="font-size:11px;font-weight:600;color:#555;margin-bottom:10px;
        text-transform:uppercase;letter-spacing:.07em;display:flex;align-items:center;gap:8px">
        規費 Fees
        <span style="background:#dcfce7;color:#15803d;font-size:10px;padding:2px 8px;border-radius:10px">
          ${(camp.fees||[]).length} 筆</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">
        ${(camp.fees||[]).map(item=>{
          const range = (item.wf&&item.wt) ? item.wf+'–'+item.wt+'週適用' : '';
          return `<div style="background:#fff;border:1px solid #eee;border-radius:10px;padding:11px 13px">
            <div style="font-size:11px;color:#888;margin-bottom:3px">${item.category||''}</div>
            <div style="font-size:12px;font-weight:600;margin-bottom:5px;color:#1a1a2e">${item.name}</div>
            <div style="font-size:15px;font-weight:700;color:#059669">${fmtPrice(item)}</div>
            ${range?`<div style="font-size:10px;color:#aaa;margin-top:3px">${range}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  el.innerHTML =
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;color:var(--text)">${dataState.school} · ${dataState.campus}</div>
      <div style="font-size:11px;color:var(--text3)">
        課程 ${(camp.courses||[]).length} · 住宿 ${(camp.accomm||[]).length} · 規費 ${(camp.fees||[]).length}
      </div>
    </div>`
    + courseSection + accommSection + feeSection;
}

// ── Init ──
renderWizard();renderQP();updateBadge();
switchUser(currentUser.id);
setModeBadge(_isAdminMode);
// 初始化匯率設定可見性（由末尾 DOMContentLoaded 統一處理）

// ── Tutorial System(EP → EP / ILSC 多廠商版本) ──
// （TUTORIAL_STEPS 已前置到檔案最上方，改 var 以根治 TDZ）

const PANEL_SECTIONS = [
  {
    title: '📋 報價流程總覽',
    items: [
      { label: 'Step 1', text: '選擇學校(EP / ILSC)' },
      { label: 'Step 2', text: '選擇校區與課程' },
      { label: 'Step 3', text: '填寫週數與學生資料' },
      { label: 'Step 4', text: '選擇住宿(注意最少週數)' },
      { label: 'Step 5', text: '加購選項(簽證、考試費等)' },
      { label: 'Step 6', text: '套用折扣方案' },
      { label: 'Step 7', text: '確認報價、下載 PNG、開單指示' },
    ]
  },
  {
    title: '💡 常用功能說明',
    items: [
      { label: '即時預覽', text: '右側費用面板隨選擇即時更新,包含外幣與台幣換算' },
      { label: '▲ 四捨整數', text: 'Step 7 的按鈕,讓含稅總額變成整千或整千五百' },
      { label: '開單指示', text: '儲存後輸入員編,產生 A 課程 + B 海外學雜費的開單金額' },
      { label: '歷史報價', text: '可搜尋、複製、重新載入舊報價,已開單報價有橘色標籤' },
    ]
  },
  {
    title: '⚠️ 注意事項',
    items: [
      { label: '住宿限制', text: '灰色住宿代表週數不足,需調整週數才能選取' },
      { label: '規費自動計入', text: '註冊費、教材費、銀行手續費會自動帶入,無需手動勾選' },
      { label: '報價有效期', text: 'PNG 報價單上會顯示有效期限,逾期請重新產生' },
      { label: '開單金額說明', text: '開單金額以定價計算,實際費用以報價單為主' },
    ]
  },
];

var _tutStep = 0;
var _tutActive = false;

function tutLog(){ try{ console.log.apply(console, ['[教學]'].concat([].slice.call(arguments))); }catch(e){} }

function createTutBulb(){
  if(document.getElementById('fy-tut-bulb')) return;          // 已存在不重複建
  var b=document.createElement('div');
  b.id='fy-tut-bulb';
  b.title='使用教學';
  b.textContent='💡';
  b.style.cssText='position:fixed;right:24px;bottom:24px;width:52px;height:52px;border-radius:50%;'
    +'background:linear-gradient(135deg,#ff4fa3,#e91e8c);color:#fff;font-size:24px;line-height:52px;'
    +'text-align:center;cursor:pointer;z-index:2147483646;box-shadow:0 6px 20px rgba(233,30,140,.45);'
    +'user-select:none;transition:transform .15s';
  b.onmouseenter=function(){ b.style.transform='scale(1.08)'; };
  b.onmouseleave=function(){ b.style.transform='scale(1)'; };
  b.onclick=function(){
    tutLog('💡 icon clicked — 點擊事件已觸發');
    try{ startTutorial(true); tutLog('startTutorial(true) 呼叫完成'); }
    catch(e){ console.error('[教學] ❌ startTutorial 丟錯:', e); }
  };
  document.body.appendChild(b);
  tutLog('燈泡已建立並 append 到 body（右下角）');
}

function hideOldTutorialEntry(){
  // 移除/隱藏舊的「使用教學」入口（任何 onclick 內含 startTutorial 的元素，但保留新燈泡）
  try{
    var hit=document.querySelectorAll('[onclick*="startTutorial"]');
    var cnt=0;
    hit.forEach(function(el){ if(el.id!=='fy-tut-bulb'){ el.style.display='none'; cnt++; } });
    tutLog('已隱藏舊教學入口數量:', cnt);
  }catch(e){ console.error('[教學] ❌ 隱藏舊入口失敗:', e); }
}

function ensureTutorialDOM(){
  // 若 index.html 沒有教學 DOM，app.js 自行建立（含 inline 樣式，不依賴外部 CSS）
  if(document.getElementById('tutorial-overlay')){ tutLog('tutorial-overlay 已存在，沿用'); return; }
  tutLog('ensureTutorialDOM() 開始建立 overlay');
  var ov=document.createElement('div');
  ov.id='tutorial-overlay';
  ov.style.cssText='display:none;position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  ov.innerHTML=''
    +'<div id="tut-mask-top" style="position:absolute;top:0;left:0;width:100%;background:rgba(0,0,0,.55);pointer-events:auto"></div>'
    +'<div id="tut-mask-bottom" style="position:absolute;bottom:0;left:0;width:100%;background:rgba(0,0,0,.55);pointer-events:auto"></div>'
    +'<div id="tut-mask-left" style="position:absolute;width:0;pointer-events:auto"></div>'
    +'<div id="tut-mask-right" style="position:absolute;width:0;pointer-events:auto"></div>'
    +'<div id="tut-highlight" style="position:absolute;border-radius:12px;box-shadow:0 0 0 3px #e91e8c;pointer-events:none;transition:all .25s"></div>'
    +'<div id="tut-tooltip" style="position:absolute;width:320px;max-width:90vw;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:20px;pointer-events:auto;transition:left .2s,top .2s;font-family:inherit">'
    +'  <div id="tut-step-label" style="font-size:12px;color:#e91e8c;font-weight:700;margin-bottom:6px"></div>'
    +'  <div id="tut-title" style="font-size:17px;font-weight:800;color:#1a1a2e;margin-bottom:8px"></div>'
    +'  <div id="tut-body" style="font-size:13px;line-height:1.7;color:#555;margin-bottom:16px"></div>'
    +'  <div style="display:flex;align-items:center;justify-content:space-between">'
    +'    <div id="tut-dots" style="display:flex;gap:5px;align-items:center"></div>'
    +'    <div style="display:flex;gap:8px">'
    +'      <button id="tut-btn-prev" onclick="tutPrev()" style="border:1px solid #e3e3ee;background:#fff;color:#888;border-radius:20px;padding:7px 14px;font-size:13px;cursor:pointer">上一步</button>'
    +'      <button id="tut-btn-next" onclick="tutNext()" style="border:none;background:#e91e8c;color:#fff;border-radius:20px;padding:7px 18px;font-size:13px;font-weight:700;cursor:pointer">下一步 →</button>'
    +'    </div>'
    +'  </div>'
    +'  <div onclick="endTutorial()" style="position:absolute;top:14px;right:16px;font-size:18px;color:#bbb;cursor:pointer;line-height:1">×</div>'
    +'</div>';
  document.body.appendChild(ov);
  tutLog('tutorial-overlay 已建立並 append 到 body（z-index 疊頂）');
}
function startTutorial(manual = false){
  tutLog('startTutorial 進入, manual =', manual);
  // 手動點擊或第一次進入才啟動
  if(!manual && localStorage.getItem('fy_tutorial_done')){ tutLog('已看過教學且非手動 → 略過'); return; }
  ensureTutorialDOM();
  _tutStep = 0;
  _tutActive = true;
  try{ showPage('wizard'); }catch(e){ console.error('[教學] showPage 出錯(不影響教學):', e); }
  var ov=document.getElementById('tutorial-overlay');
  if(ov){ ov.style.display='block'; ov.style.pointerEvents='all'; tutLog('overlay.display 設為 block'); }
  else { console.error('[教學] ❌ 找不到 tutorial-overlay，無法顯示'); }
  renderTutStep();
}
// 視窗大小改變時重新定位教學卡片，避免跑位
if(!window._tutResizeBound){ window._tutResizeBound=true; window.addEventListener('resize',function(){ if(typeof _tutActive!=='undefined' && _tutActive) renderTutStep(); }); }

function endTutorial(){
  _tutActive = false;
  var ov=document.getElementById('tutorial-overlay');
  if(ov) ov.style.display = 'none';
  localStorage.setItem('fy_tutorial_done', '1');
}

function tutNext(){
  if(_tutStep < TUTORIAL_STEPS.length - 1){
    _tutStep++;
    renderTutStep();
  } else {
    endTutorial();
  }
}

function tutPrev(){
  if(_tutStep > 0){
    _tutStep--;
    renderTutStep();
  }
}

function renderTutStep(){
  ensureTutorialDOM();
  if(!document.getElementById('tutorial-overlay')) return;
  const step = TUTORIAL_STEPS[_tutStep];
  const total = TUTORIAL_STEPS.length;

  // 更新文字（null-safe）
  var _set=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};
  _set('tut-step-label','步驟 ' + (_tutStep+1) + ' / ' + total);
  _set('tut-title',step.title);
  _set('tut-body',step.body);

  // dots
  const dots = document.getElementById('tut-dots');
  if(dots){ dots.style.display='flex'; dots.style.gap='5px'; dots.style.alignItems='center'; }
  if(dots) dots.innerHTML = TUTORIAL_STEPS.map((_,i) =>
    `<div style="width:${i===_tutStep?16:6}px;height:6px;border-radius:3px;background:${i===_tutStep?'#e91e8c':'#ddd'};transition:all .3s"></div>`
  ).join('');

  // 按鈕
  const prev = document.getElementById('tut-btn-prev');
  const next = document.getElementById('tut-btn-next');
  if(prev){ prev.style.opacity = _tutStep === 0 ? '0.3' : '1'; prev.style.pointerEvents = _tutStep === 0 ? 'none' : 'all';
            prev.style.whiteSpace='nowrap'; prev.style.minWidth='72px'; prev.style.padding='8px 14px'; prev.style.fontSize='13px'; }
  if(next){ next.textContent = _tutStep === total-1 ? '完成 ✓' : '下一步 →';
            next.style.whiteSpace='nowrap'; next.style.minWidth='88px'; next.style.padding='8px 16px'; next.style.fontSize='13px'; }

  // highlight 目標元素
  const el = step.center ? null : document.querySelector(step.target);  // center=true → 不挖洞、卡片置中
  const overlay = document.getElementById('tutorial-overlay');
  const highlight = document.getElementById('tut-highlight');
  const tooltip = document.getElementById('tut-tooltip');

  if(el){
    const rect = el.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 遮罩四塊
    document.getElementById('tut-mask-top').style.height    = Math.max(0,rect.top-pad)+'px';
    document.getElementById('tut-mask-bottom').style.height = Math.max(0,vh-rect.bottom-pad)+'px';
    document.getElementById('tut-mask-left').style.cssText  = `position:absolute;top:${rect.top-pad}px;height:${rect.height+pad*2}px;width:${Math.max(0,rect.left-pad)}px;background:rgba(0,0,0,.55)`;
    document.getElementById('tut-mask-right').style.cssText = `position:absolute;top:${rect.top-pad}px;height:${rect.height+pad*2}px;left:${rect.right+pad}px;right:0;background:rgba(0,0,0,.55)`;

    // highlight
    highlight.style.top    = (rect.top-pad)+'px';
    highlight.style.left   = (rect.left-pad)+'px';
    highlight.style.width  = (rect.width+pad*2)+'px';
    highlight.style.height = (rect.height+pad*2)+'px';

    // tooltip 位置（104 風格：卡片置於聚焦區塊「下方」，空間不足則改上方）
    const tipW = 320, tipH = (tooltip.offsetHeight || 200);
    let tipLeft = rect.left + rect.width/2 - tipW/2;   // 水平對齊高亮中心
    let tipTop  = rect.bottom + pad + 14;              // 預設置於下方
    if(tipTop + tipH > vh - 12){                        // 下方放不下 → 改置於上方
      tipTop = rect.top - pad - 14 - tipH;
    }
    tipLeft = Math.max(12, Math.min(tipLeft, vw - tipW - 12));
    tipTop  = Math.max(12, Math.min(tipTop,  vh - tipH - 12));
    tooltip.style.left = tipLeft+'px';
    tooltip.style.top  = tipTop+'px';
  } else {
    // 找不到目標元素：遮罩全暗、隱藏 highlight、卡片置中（null-safe，不破壞流程）
    const vw2 = window.innerWidth, vh2 = window.innerHeight;
    document.getElementById('tut-mask-top').style.height = vh2+'px';
    document.getElementById('tut-mask-bottom').style.height = '0px';
    document.getElementById('tut-mask-left').style.cssText = 'position:absolute;width:0';
    document.getElementById('tut-mask-right').style.cssText = 'position:absolute;width:0';
    highlight.style.width='0'; highlight.style.height='0';
    const tipW2 = 320, tipH2 = (tooltip.offsetHeight || 200);
    tooltip.style.left = Math.max(12,(vw2-tipW2)/2)+'px';
    tooltip.style.top  = Math.max(12,(vh2-tipH2)/2)+'px';
  }
}

// ── Tutorial Panel(側邊說明) ──
function toggleTutorialPanel(){
  const panel = document.getElementById('tutorial-panel');
  if(panel.style.display==='none') showTutorialPanel();
  else panel.style.display='none';
}

function showTutorialPanel(){
  const panel = document.getElementById('tutorial-panel');
  const body  = document.getElementById('tutorial-panel-body');

  body.innerHTML = PANEL_SECTIONS.map(s=>`
    <div style="margin-bottom:22px">
      <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:10px">${s.title}</div>
      ${s.items.map(item=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f5">
          <div style="font-size:10px;font-weight:600;color:var(--pink);background:var(--pink-light);padding:2px 8px;border-radius:4px;white-space:nowrap;height:fit-content;margin-top:1px">${item.label}</div>
          <div style="font-size:12px;color:#555566;line-height:1.6">${item.text}</div>
        </div>`).join('')}
    </div>`).join('') +
    `<div style="margin-top:8px;padding-top:16px;border-top:1px solid #f0f0f5">
      <button onclick="startTutorial(true)" style="width:100%;padding:10px;background:var(--pink);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">
        🎬 重新播放引導教學
      </button>
    </div>`;

  panel.style.display = 'block';
}

// ── 數據分析 ──
let _charts = {}; // Chart.js 實例管理（重繪前先 destroy 避免記憶體洩漏）

function renderAnalytics(){
  if(!_isAdminMode){ showPage('wizard'); return; }

  const raw  = JSON.parse(localStorage.getItem('fy_history')||'[]');
  const data = [...raw].sort((a,b)=>(b.id||0)-(a.id||0)); // 最新在前
  const totalCount = data.length;

  // ── 淨利率正規化（自動偵測 decimal vs percentage 格式）──
  function toMarginPct(nm){
    if(nm==null||isNaN(nm)) return null;
    const n=Number(nm);
    if(n<=0) return null;
    return n>2 ? n : n*100; // >2 = 已是百分比 (e.g.33.9)，≤2 = 小數 (e.g.0.339)
  }

  // ── 總覽卡片數據 ──
  const totalAmt   = data.reduce((s,q)=>s+(Number(q.rawFinalTWD)||Number(q.finalTWD)||0),0);
  const avgWeeks   = totalCount?(data.reduce((s,q)=>s+(Number(q.weeks)||0),0)/totalCount).toFixed(1):'–';
  const margins    = data.map(q=>toMarginPct(q.netMargin)).filter(v=>v!==null);
  const avgMargin  = margins.length?(margins.reduce((a,b)=>a+b,0)/margins.length).toFixed(1):'–';
  const maxAmt     = data.reduce((m,q)=>Math.max(m,Number(q.rawFinalTWD)||Number(q.finalTWD)||0),0);
  const maxWeeks   = data.reduce((m,q)=>Math.max(m,Number(q.weeks)||0),0);
  const maxMargin  = margins.length?Math.max(...margins).toFixed(1):'–';
  const now        = new Date();
  const thisMonth  = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const thisMoCnt  = data.filter(q=>{
    if(!q.date) return false;
    const p=String(q.date).replace(/\//g,'-').split('-');
    return p[0]+'-'+String(p[1]).padStart(2,'0')===thisMonth;
  }).length;

  document.getElementById('analytics-cards').innerHTML=`
    <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">總報價筆數</div>
      <div style="font-size:32px;font-weight:700;color:var(--pink);line-height:1">${totalCount}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">本月新增 <strong>${thisMoCnt}</strong> 筆</div>
    </div>
    <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">總報價金額</div>
      <div style="font-size:22px;font-weight:700;color:var(--text);line-height:1.2">NT$ ${Math.round(totalAmt).toLocaleString()}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">最高單筆 NT$ ${Math.round(maxAmt).toLocaleString()}</div>
    </div>
    <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">平均週數</div>
      <div style="font-size:32px;font-weight:700;color:#6366f1;line-height:1">${avgWeeks}<span style="font-size:16px;font-weight:400"> W</span></div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">最長 <strong>${maxWeeks}</strong> 週</div>
    </div>
    <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">平均淨利率</div>
      <div style="font-size:32px;font-weight:700;color:#059669;line-height:1">${avgMargin}<span style="font-size:16px;font-weight:400"> %</span></div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">最高 <strong>${maxMargin}</strong>%</div>
    </div>`;

  const subEl=document.getElementById('analytics-subtitle');
  if(subEl) subEl.textContent=`共 ${totalCount} 筆報價紀錄　最後更新：${now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}`;

  const emptyEl=document.getElementById('analytics-empty');
  const rows=['analytics-row1','analytics-row2','analytics-row3'];
  if(totalCount===0){
    if(emptyEl) emptyEl.style.display='block';
    rows.forEach(r=>{const el=document.getElementById(r);if(el)el.style.display='none';});
    return;
  }
  if(emptyEl) emptyEl.style.display='none';
  rows.forEach(r=>{const el=document.getElementById(r);if(el)el.style.display= r==='analytics-row3'?'block':'grid';});

  const PINK='#e91e8c';
  const PAL=['#e91e8c','#6366f1','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#f97316','#14b8a6','#ec4899'];
  const BASE={responsive:true,maintainAspectRatio:false};
  function dc(id){if(_charts[id]){_charts[id].destroy();delete _charts[id];}}

  // ── 1. 按月趨勢（長條 + 折線 雙軸）──
  {
    const mCount={},mAmt={};
    data.forEach(q=>{
      if(!q.date) return;
      const p=String(q.date).replace(/\//g,'-').split('-');
      if(p.length<2) return;
      const k=p[0]+'-'+String(p[1]).padStart(2,'0');
      mCount[k]=(mCount[k]||0)+1;
      mAmt[k]=(mAmt[k]||0)+(Number(q.rawFinalTWD)||Number(q.finalTWD)||0);
    });
    const keys=Object.keys(mCount).sort();
    dc('chart-monthly');
    const ctx=document.getElementById('chart-monthly');
    if(ctx) _charts['chart-monthly']=new Chart(ctx,{
      type:'bar',
      data:{labels:keys,datasets:[
        {type:'bar',label:'報價筆數',data:keys.map(k=>mCount[k]),backgroundColor:'#6366f1',borderRadius:5,yAxisID:'y'},
        {type:'line',label:'金額(萬)',data:keys.map(k=>+(mAmt[k]/10000).toFixed(1)),borderColor:PINK,backgroundColor:'rgba(233,30,140,.08)',borderWidth:2,pointBackgroundColor:PINK,tension:.3,yAxisID:'y1'}
      ]},
      options:{...BASE,plugins:{legend:{display:true,labels:{font:{size:10},boxWidth:10,padding:8}},tooltip:{mode:'index'}},
        scales:{y:{position:'left',ticks:{stepSize:1,font:{size:10}},title:{display:true,text:'筆',font:{size:9}}},
                y1:{position:'right',ticks:{font:{size:10}},title:{display:true,text:'萬',font:{size:9}},grid:{drawOnChartArea:false}}}}
    });
  }

  // ── 2. 校區排行（橫向長條 + 百分比標籤）──
  {
    const m={};
    data.forEach(q=>{const c=q.campus||'未知';m[c]=(m[c]||0)+1;});
    const s=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const labels=s.map(([n,v])=>`${n}  ${((v/totalCount)*100).toFixed(0)}%`);
    dc('chart-campus');
    const ctx=document.getElementById('chart-campus');
    if(ctx) _charts['chart-campus']=new Chart(ctx,{
      type:'bar',
      data:{labels,datasets:[{label:'筆數',data:s.map(([,v])=>v),backgroundColor:PINK,borderRadius:5}]},
      options:{...BASE,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{stepSize:1,font:{size:10}}},y:{ticks:{font:{size:10}}}}}
    });
  }

  // ── 3. 顧問績效（橫向長條 + 淨利率明細）──
  {
    const aMap={};
    data.forEach(q=>{
      const n=q.advisorName||'未知';
      if(!aMap[n]) aMap[n]={count:0,margins:[]};
      aMap[n].count++;
      const mp=toMarginPct(q.netMargin);
      if(mp!==null) aMap[n].margins.push(mp);
    });
    const s=Object.entries(aMap).sort((a,b)=>b[1].count-a[1].count);
    dc('chart-advisor');
    const ctx=document.getElementById('chart-advisor');
    if(ctx) _charts['chart-advisor']=new Chart(ctx,{
      type:'bar',
      data:{labels:s.map(([n])=>n),datasets:[{label:'筆數',data:s.map(([,d])=>d.count),backgroundColor:PAL,borderRadius:5}]},
      options:{...BASE,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{stepSize:1,font:{size:10}}},y:{ticks:{font:{size:11}}}}}
    });
    const detEl=document.getElementById('advisor-detail');
    if(detEl) detEl.innerHTML=s.map(([n,d])=>{
      const avg=d.margins.length?(d.margins.reduce((a,b)=>a+b,0)/d.margins.length).toFixed(1):'–';
      return`<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f5f5f8;font-size:11px">
        <span style="color:var(--text);font-weight:500">${n}</span>
        <span style="color:var(--text3)">${d.count} 筆</span>
        <span style="color:#059669;font-weight:600">淨利 ${avg}%</span>
      </div>`;
    }).join('');
  }

  // ── 4. 週數分布（Doughnut + 筆數標籤）──
  {
    const rng={'1–4 週':0,'5–8 週':0,'9–12 週':0,'13 週以上':0};
    data.forEach(q=>{const w=Number(q.weeks)||0;if(w<=4)rng['1–4 週']++;else if(w<=8)rng['5–8 週']++;else if(w<=12)rng['9–12 週']++;else rng['13 週以上']++;});
    const labels=Object.keys(rng).map(k=>`${k} (${rng[k]}筆)`);
    dc('chart-weeks');
    const ctx=document.getElementById('chart-weeks');
    if(ctx) _charts['chart-weeks']=new Chart(ctx,{
      type:'doughnut',
      data:{labels,datasets:[{data:Object.values(rng),backgroundColor:[PINK,'#6366f1','#f59e0b','#10b981']}]},
      options:{...BASE,plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:10,padding:6}}}}
    });
  }

  // ── 5. 住宿偏好（橫向長條 Top6）──
  {
    const m={};
    data.forEach(q=>{
      const raw=q.accomm||(q._state?.accomm==='none'?null:q._state?.accomm?.name)||null;
      const a=raw?(String(raw).length>20?String(raw).slice(0,20)+'…':String(raw)):'不住宿';
      m[a]=(m[a]||0)+1;
    });
    const s=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
    dc('chart-accomm');
    const ctx=document.getElementById('chart-accomm');
    if(ctx) _charts['chart-accomm']=new Chart(ctx,{
      type:'bar',
      data:{labels:s.map(([n])=>n),datasets:[{label:'次數',data:s.map(([,v])=>v),backgroundColor:'#f59e0b',borderRadius:5}]},
      options:{...BASE,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{stepSize:1,font:{size:10}}},y:{ticks:{font:{size:10}}}}}
    });
  }

  // ── 6. 折扣分析（Doughnut + 平均折扣金額）──
  {
    const wDisc=data.filter(q=>q.discountAmt&&Number(q.discountAmt)>0);
    const noDisc=data.length-wDisc.length;
    const avgDisc=wDisc.length?Math.round(wDisc.reduce((s,q)=>s+Number(q.discountAmt),0)/wDisc.length):0;
    dc('chart-discount');
    const ctx=document.getElementById('chart-discount');
    if(ctx) _charts['chart-discount']=new Chart(ctx,{
      type:'doughnut',
      data:{labels:[`原價 (${noDisc}筆)`,`有折扣 (${wDisc.length}筆)`],datasets:[{data:[noDisc,wDisc.length],backgroundColor:['#e5e7eb',PINK]}]},
      options:{...BASE,plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:10,padding:6}}}}
    });
    const detEl=document.getElementById('discount-detail');
    if(detEl) detEl.innerHTML=wDisc.length>0
      ?`<div style="text-align:center;font-size:11px;color:var(--text2)">有折扣報價平均折扣 <strong style="color:var(--pink)">NT$ ${avgDisc.toLocaleString()}</strong></div>`
      :`<div style="text-align:center;font-size:11px;color:var(--text3)">目前無套用折扣的報價</div>`;
  }

  // ── 7. 最近 10 筆明細表 ──
  {
    const recent=data.slice(0,10);
    const sLabel={draft:'草稿',ordered:'已開單',expired:'已過期'};
    const sColor={draft:'#6b7280',ordered:'#059669',expired:'#dc2626'};
    const rows=recent.map(q=>{
      const mp=toMarginPct(q.netMargin);
      const mStr=mp!==null?`${mp.toFixed(1)}%`:'–';
      const mColor=mp!==null?(mp>=20?'#059669':mp>=10?'#f59e0b':'#dc2626'):'#9ca3af';
      const st=q.status||'draft';
      return`<tr style="border-top:1px solid #f5f5f8">
        <td style="padding:9px 6px;color:var(--text3);white-space:nowrap">${q.date||'–'}</td>
        <td style="padding:9px 6px;font-weight:500">${q.advisorName||'–'}</td>
        <td style="padding:9px 6px">${q.campus||'–'}</td>
        <td style="padding:9px 6px;text-align:center">${q.weeks||'–'} W</td>
        <td style="padding:9px 6px;text-align:right;font-weight:500">NT$ ${Math.round(Number(q.rawFinalTWD)||Number(q.finalTWD)||0).toLocaleString()}</td>
        <td style="padding:9px 6px;text-align:center;color:${mColor};font-weight:600">${mStr}</td>
        <td style="padding:9px 6px;text-align:center"><span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${sColor[st]}22;color:${sColor[st]};font-weight:500">${sLabel[st]||st}</span></td>
      </tr>`;
    }).join('');
    const tbl=document.getElementById('analytics-table');
    if(tbl) tbl.innerHTML=`<thead><tr style="border-bottom:2px solid #f0f0f5">
      <th style="padding:6px 6px;text-align:left;font-size:11px;font-weight:600;color:var(--text3)">日期</th>
      <th style="padding:6px 6px;text-align:left;font-size:11px;font-weight:600;color:var(--text3)">顧問</th>
      <th style="padding:6px 6px;text-align:left;font-size:11px;font-weight:600;color:var(--text3)">校區</th>
      <th style="padding:6px 6px;text-align:center;font-size:11px;font-weight:600;color:var(--text3)">週數</th>
      <th style="padding:6px 6px;text-align:right;font-size:11px;font-weight:600;color:var(--text3)">含稅總價</th>
      <th style="padding:6px 6px;text-align:center;font-size:11px;font-weight:600;color:var(--text3)">淨利率</th>
      <th style="padding:6px 6px;text-align:center;font-size:11px;font-weight:600;color:var(--text3)">狀態</th>
    </tr></thead><tbody>${rows}</tbody>`;
  }
}

// ── SSO 身分初始化 ──
// CMS（Supabase）登入後跳轉到：https://fy-quotation-system-ep.vercel.app/?t=JWT_TOKEN
// 本函式讀取 URL 中的 ?t=... → 呼叫 GAS 後端驗證 JWT → 設定 currentUser
// 備援：若無 token / GAS 未設定 → 沿用現有 user picker / PIN 機制（測試環境照常運作）
async function initSSOUser(){
  const params = new URLSearchParams(window.location.search);
  const token = params.get('t');
  if(!token || !GAS_BACKEND_URL) return;

  try{
    const res = await fetch(GAS_BACKEND_URL, {
      method:'POST',
      // 不設 Content-Type header → simple request → 無 CORS preflight
      body: JSON.stringify({ action:'verifyToken', token })
    });
    const data = await res.json();
    if(!data.ok){ console.warn('[SSO] token 驗證失敗:', data.error); return; }

    const u = data.user;
    // JWT payload 格式：{ sub:'tkb0003007', name:'馮若陽', role:'manager' }
    const ssoRole = u.role==='manager' ? 'admin' : 'advisor';
    currentUser = {
      id:     u.sub,
      name:   u.name,
      role:   ssoRole,
      avatar: (u.name||'？')[0]
    };
    if(ssoRole==='admin'){
      _isAdminMode = true;
      const ns = document.getElementById('nav-settings');
      if(ns) ns.style.display='';
    }
    // 更新身分徽章
    var _av=document.getElementById('user-avatar'); if(_av) _av.textContent=currentUser.avatar;
    var _nm=document.getElementById('user-name-display'); if(_nm) _nm.textContent=currentUser.name;
    setModeBadge(ssoRole==='admin');
    renderQP();

    // 安全：清掉 URL 的 token 參數（避免 token 留在瀏覽器歷史）
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);

    console.log('[SSO] 登入成功:', currentUser.name, '|', ssoRole);
  } catch(e){
    console.warn('[SSO] 初始化錯誤:', e.message);
  }
}

// ── 統一初始化(DOMContentLoaded) ──
document.addEventListener('DOMContentLoaded', function(){
  // 1. 匯率設定 + 數據分析 預設隱藏（管理員 PIN 後才顯示）
  const ns = document.getElementById('nav-settings');
  if(ns) ns.style.display = 'none';
  const na = document.getElementById('nav-analytics');
  if(na) na.style.display = 'none';
  // 2. SSO 身分初始化（CMS 帶 ?t=JWT 進來時自動設定顧問身分）
  initSSOUser();
  // 3. Tutorial 第一次自動啟動
  // （已移除自動彈出：教學改由左側「使用教學」按鈕點擊觸發 startTutorial(true)）
});
