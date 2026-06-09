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

const SCHOOL_DATA = {"EP":{"Brisbane":{"courses":[{"name":"經典上午課程 (15h)","category":"課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":400.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (20h)","category":"課程","currency":"AUD","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":475.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":455.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":430.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"AUD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":135.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"AUD","price":0.0,"fixed":385.0,"unit":"固定金額","note":"18歲以上適用"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (特別半食宿)","currency":"AUD","price":420.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上, 平日2餐/週末3餐"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅供晚餐)","currency":"AUD","price":385.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (不含餐)","currency":"AUD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"限18歲以上, 可自炊"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (特別半食宿)","currency":"AUD","price":385.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 平日2餐/週末3餐"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (僅供晚餐)","currency":"AUD","price":355.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (不含餐)","currency":"AUD","price":310.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"AUD","price":50.0,"fixed":0.0,"unit":"按週計算","note":"如全素、無麩質、清真等"},{"type":"額外加成","name":"額外住宿費 (每晚)","currency":"AUD","price":70.0,"fixed":0.0,"unit":"按天計算","note":"第7晚起算 (延回)"},{"type":"宿舍","name":"EP 學生公寓 (單人房)","currency":"AUD","price":300.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 通勤約40-50分"},{"type":"宿舍","name":"EP 學生公寓 (雙人房單人住)","currency":"AUD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"Double Room Single Occupancy"},{"type":"宿舍","name":"EP 學生公寓 (雙人房)","currency":"AUD","price":450.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"宿舍","name":"Bunk Brisbane (4-6人房)","currency":"AUD","price":415.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 通勤約10分鐘"},{"type":"宿舍","name":"Bunk Brisbane (8-10人房)","currency":"AUD","price":395.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上"},{"type":"宿舍","name":"Bunk Brisbane (女性4人房)","currency":"AUD","price":438.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 限女性"},{"type":"宿舍","name":"Student One (Studio 套房)","currency":"AUD","price":679.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 步行約12分鐘"},{"type":"宿舍","name":"Student One (5房公寓雅房)","currency":"AUD","price":479.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, Shared Room"},{"type":"行政","name":"寢具包 (Student One)","currency":"AUD","price":0.0,"fixed":195.0,"unit":"固定金額","note":"一次性費用 (抵達時支付)"},{"type":"宿舍","name":"CLLIX (Studio 套房)","currency":"AUD","price":1332.0,"fixed":0.0,"unit":"按週計算","note":"18歲以上, 步行約11分鐘"},{"type":"宿舍","name":"CLLIX (一房公寓)","currency":"AUD","price":1450.0,"fixed":0.0,"unit":"按週計算","note":"1 Bed Apartment"}],"fees":[{"category":"註冊","name":"註冊費","currency":"AUD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (短期)","currency":"AUD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (中期)","currency":"AUD","price":0.0,"fixed":150.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (長期)","currency":"AUD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (超長期)","currency":"AUD","price":0.0,"fixed":325.0,"unit":"固定金額","wf":24,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"AUD","price":0.0,"fixed":110.0,"unit":"固定金額","wf":1,"wt":99}]},"Canary Wharf":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":325.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":300.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":280.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":255.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":450.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":410.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":380.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":350.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":300.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":275.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":510.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":270.0,"fixed":0.0,"unit":"按週計算","note":"60分車程"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (含早晚餐)","currency":"GBP","price":305.0,"fixed":0.0,"unit":"按週計算","note":"60分車程"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":260.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (含早晚餐)","currency":"GBP","price":290.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Sterling Court 宿舍 (Studio 套房)","currency":"GBP","price":430.0,"fixed":0.0,"unit":"按週計算","note":"18+, 60分車程, 最少1週"},{"type":"宿舍","name":"McMillan Residence 宿舍 (Studio 套房)","currency":"GBP","price":460.0,"fixed":0.0,"unit":"按週計算","note":"18+, 40分車程, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":5,"wt":11}]},"Birmingham":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":345.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":290.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":330.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"通勤約60分"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"GBP","price":240.0,"fixed":0.0,"unit":"按週計算","note":"供早晚餐"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (自炊)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":195.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"GBP","price":220.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (自炊)","currency":"GBP","price":190.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"IQ 51 Studios 宿舍 (Studio 套房)","currency":"GBP","price":295.0,"fixed":0.0,"unit":"按週計算","note":"18+, 通勤15分, 最少4週"},{"type":"宿舍","name":"The Heights 宿舍 (單人套房)","currency":"GBP","price":280.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99}]},"Leeds":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":380.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":345.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":290.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (27h)","category":"課程","currency":"GBP","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":435.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":365.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":330.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"GBP","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (僅含早餐)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"通勤約60分"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"GBP","price":240.0,"fixed":0.0,"unit":"按週計算","note":"供早晚餐"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (自炊)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (僅含早餐)","currency":"GBP","price":195.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"GBP","price":220.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (自炊)","currency":"GBP","price":190.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"GBP","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"GBP","price":55.0,"fixed":0.0,"unit":"按週計算","note":"需視供應狀況"},{"type":"額外加成","name":"未成年住宿加價 (Under 18)","currency":"GBP","price":25.0,"fixed":0.0,"unit":"按週計算","note":"強制項目"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"GBP","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"IQ Leeds 宿舍 (單人套房)","currency":"GBP","price":210.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少1週"},{"type":"宿舍","name":"Threadworks 宿舍 (單人套房)","currency":"GBP","price":300.0,"fixed":0.0,"unit":"按週計算","note":"18+, En-suite Room, 最少4週"},{"type":"宿舍","name":"Briggate 宿舍 (Studio 套房)","currency":"GBP","price":320.0,"fixed":0.0,"unit":"按週計算","note":"18+, Studio, 最少4週"},{"type":"額外加成","name":"延回加價 (Homestay/Residence)","currency":"GBP","price":60.0,"fixed":0.0,"unit":"按天計算","note":"Extra Night"}],"fees":[{"category":"註冊","name":"註冊費","currency":"GBP","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":45.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":85.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":130.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"GBP","price":0.0,"fixed":175.0,"unit":"固定金額","wf":24,"wt":99}]},"Dublin":{"courses":[{"name":"經典上午課程 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":380.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":360.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":280.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":270.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":250.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":230.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程-四天班 (20h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":270.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":250.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":230.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":440.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":420.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":365.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":315.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":295.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":275.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40h)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":590.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":550.0,"fixed":0.0,"peak":0}]},{"name":"打工遊學套裝課程 (25週)","category":"課程","currency":"EUR","unit":"固定金額","tiers":[{"wf":25,"wt":25,"price":0.0,"fixed":6500.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":5250.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":8625.0,"peak":0},{"wf":25,"wt":25,"price":0.0,"fixed":6375.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":130.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":75.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"EUR","price":285.0,"fixed":0.0,"unit":"按週計算","note":"16+, Half Board"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (全食宿)","currency":"EUR","price":300.0,"fixed":0.0,"unit":"按週計算","note":"16+, Full Board"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (半食宿)","currency":"EUR","price":275.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-標準雙人房 (全食宿)","currency":"EUR","price":290.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"深夜入住費 (Late check-in)","currency":"EUR","price":0.0,"fixed":80.0,"unit":"固定金額","note":"23:00 - 07:00 (Mon-Sun)"},{"type":"額外加成","name":"聖誕節加價 (12/24-12/31)","currency":"EUR","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Shared House 雅房 (單人)","currency":"EUR","price":300.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 50分車程, 共用衛浴"},{"type":"宿舍","name":"Shared House 雅房 (雙人)","currency":"EUR","price":230.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 共用衛浴"},{"type":"宿舍","name":"Shared House 雅房 (三人)","currency":"EUR","price":195.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 共用衛浴"},{"type":"宿舍","name":"Shared House 套房 (雙人)","currency":"EUR","price":240.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 獨立衛浴 (Ensuite)"},{"type":"宿舍","name":"Shared House 套房 (三人)","currency":"EUR","price":205.0,"fixed":0.0,"unit":"按週計算","note":"20-35歲, 獨立衛浴 (Ensuite)"},{"type":"宿舍","name":"Niche Living 宿舍 (單人 Studio)","currency":"EUR","price":700.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5分步行, 短期價"},{"type":"宿舍","name":"Niche Living 宿舍 (單人 Studio)","currency":"EUR","price":535.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5分步行, 8週以上優惠"},{"type":"宿舍","name":"Niche Living 宿舍 (雙人 Studio)","currency":"EUR","price":375.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 短期價"},{"type":"宿舍","name":"Niche Living 宿舍 (雙人 Studio)","currency":"EUR","price":295.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 8週以上優惠"},{"type":"飯店","name":"Royal Marine Hotel (單人含早)","currency":"EUR","price":900.0,"fixed":0.0,"unit":"按週計算","note":"淡季價格 (01/01-03/30)"},{"type":"飯店","name":"Royal Marine Hotel (單人含早)","currency":"EUR","price":1200.0,"fixed":0.0,"unit":"按週計算","note":"旺季價格 (04/01-12/31)"},{"type":"飯店","name":"Royal Marine Hotel (雙人無早)","currency":"EUR","price":500.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 淡季 (01/01-03/30)"},{"type":"飯店","name":"Royal Marine Hotel (雙人無早)","currency":"EUR","price":650.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 旺季 (04/01-12/31)"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"學員保護費 (PEL Fee)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"考試費 (TIE)","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"考試費 (IELTS)","currency":"EUR","price":0.0,"fixed":250.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":5,"wt":12}]},"Berlin":{"courses":[{"name":"德語經典上午課程 (20h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"德語半密集上午課程 (25h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"德語白金課程 (30h)","category":"德語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":485.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":470.0,"fixed":0.0,"peak":0}]},{"name":"英語經典下午課程 (20h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"英語半密集下午課程 (25h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"英語白金課程 (30h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":500.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":485.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":470.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程 (德語/英語)","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-標準單人房 (半食宿)","currency":"EUR","price":305.0,"fixed":0.0,"unit":"按週計算","note":"需另付 7.5% 城市稅"},{"type":"額外加成","name":"聖誕節加價 (12/21-01/04)","currency":"EUR","price":65.0,"fixed":0.0,"unit":"按週計算","note":"Christmas Supplement"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"EUR","price":40.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"深夜入住費 (Late check-in)","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"22:00 - 06:00"},{"type":"宿舍","name":"Kiez Hostel 青年旅館 (多人房)","currency":"EUR","price":150.0,"fixed":0.0,"unit":"按週計算","note":"共用衛浴, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Kiez Hostel 青年旅館 (單人房)","currency":"EUR","price":363.0,"fixed":0.0,"unit":"按週計算","note":"共用衛浴, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio 套房)","currency":"EUR","price":596.0,"fixed":0.0,"unit":"按週計算","note":"1-3週短租價, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio 套房)","currency":"EUR","price":483.0,"fixed":0.0,"unit":"按週計算","note":"4週以上優惠, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (雙人 Studio)","currency":"EUR","price":644.0,"fixed":0.0,"unit":"按週計算","note":"價格為整間房價 (兩人均分), 需兩人同行"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (雙人 Studio)","currency":"EUR","price":555.0,"fixed":0.0,"unit":"按週計算","note":"價格為整間房價 (兩人均分), 需兩人同行"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio XL)","currency":"EUR","price":813.0,"fixed":0.0,"unit":"按週計算","note":"加大套房, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (Studio XL)","currency":"EUR","price":716.0,"fixed":0.0,"unit":"按週計算","note":"加大套房, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (一房公寓)","currency":"EUR","price":902.0,"fixed":0.0,"unit":"按週計算","note":"Apartment, 需另付 7.5% 城市稅"},{"type":"公寓","name":"Berlin Karlshorst 公寓 (一房公寓)","currency":"EUR","price":805.0,"fixed":0.0,"unit":"按週計算","note":"Apartment, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Berlin Prenzlauer Berg 宿舍 (Studio)","currency":"EUR","price":588.0,"fixed":0.0,"unit":"按週計算","note":"1-3週短租價, 需另付 7.5% 城市稅"},{"type":"宿舍","name":"Berlin Prenzlauer Berg 宿舍 (Studio)","currency":"EUR","price":475.0,"fixed":0.0,"unit":"按週計算","note":"4週以上優惠, 需另付 7.5% 城市稅"},{"type":"飯店","name":"Meininger Hotel (單人含早)","currency":"EUR","price":555.0,"fixed":0.0,"unit":"按週計算","note":"旺季加價邏輯, 需另付 7.5% 城市稅"},{"type":"飯店","name":"Meininger Hotel (雙人含早)","currency":"EUR","price":660.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行, 需另付 7.5% 城市稅"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":70.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99}]},"Paris":{"courses":[{"name":"法語經典上午課程 (20h)","category":"法語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"法語半密集上午課程 (25h)","category":"法語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"英語經典下午課程 (20h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":320.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":285.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":265.0,"fixed":0.0,"peak":0}]},{"name":"英語半密集下午課程 (25h)","category":"英語課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":360.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":325.0,"fixed":0.0,"peak":0},{"wf":24,"wt":99,"price":310.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程 (法語/英語)","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":90.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":45.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (半食宿)","currency":"EUR","price":440.0,"fixed":0.0,"unit":"按週計算","note":"18+ (提供早晚餐)"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅含早餐)","currency":"EUR","price":355.0,"fixed":0.0,"unit":"按週計算","note":"18+ (僅提供早餐)"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (半食宿)","currency":"EUR","price":422.0,"fixed":0.0,"unit":"按週計算","note":"18+, 需兩人同行 (每人價格)"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (僅含早餐)","currency":"EUR","price":337.0,"fixed":0.0,"unit":"按週計算","note":"18+, 需兩人同行 (每人價格)"},{"type":"寄宿家庭","name":"寄宿家庭-未成年單人房 (半食宿)","currency":"EUR","price":530.0,"fixed":0.0,"unit":"按週計算","note":"16-17歲專用價格 (含監護)"},{"type":"額外加成","name":"聖誕節加價 (12/20-12/28)","currency":"EUR","price":70.0,"fixed":0.0,"unit":"按週計算","note":"僅聖誕週"},{"type":"宿舍","name":"Enjoy Hostel 2* 青年旅館 (3人房)","currency":"EUR","price":350.0,"fixed":0.0,"unit":"按週計算","note":"需另付城市稅 (約€2.60/晚)"},{"type":"公寓","name":"Adagio XV 公寓 (單人 Studio)","currency":"EUR","price":775.0,"fixed":0.0,"unit":"按週計算","note":"最少4週, 需另付城市稅 (約€5.20/晚)"},{"type":"公寓","name":"Adagio Access Vanves (單人 Studio)","currency":"EUR","price":680.0,"fixed":0.0,"unit":"按週計算","note":"最少4週, 需另付城市稅 (約€5.53/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (單人套房)","currency":"EUR","price":780.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (雙人房共用衛浴)","currency":"EUR","price":548.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"},{"type":"宿舍","name":"FIAP 3* 宿舍 (三人高級房)","currency":"EUR","price":550.0,"fixed":0.0,"unit":"按週計算","note":"18+, 半食宿, 需另付城市稅 (約€2.60/晚)"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":70.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":100.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":150.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費","currency":"EUR","price":0.0,"fixed":200.0,"unit":"固定金額","wf":24,"wt":99}]},"Toronto":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":430.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":420.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":410.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25堂)","category":"課程","currency":"CAD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":480.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":470.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":460.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"CAD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"CAD","price":0.0,"fixed":250.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"行政","name":"住宿急件安排費","currency":"CAD","price":0.0,"fixed":150.0,"unit":"固定金額","note":"抵達前1週內預訂需加收"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (自炊)","currency":"CAD","price":340.0,"fixed":0.0,"unit":"按週計算","note":"Self Catering"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (僅含早餐)","currency":"CAD","price":350.0,"fixed":0.0,"unit":"按週計算","note":"Bed & Breakfast"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (半食宿)","currency":"CAD","price":360.0,"fixed":0.0,"unit":"按週計算","note":"Half Board (18歲以下強制)"},{"type":"寄宿家庭","name":"寄宿家庭-單人房 (全食宿)","currency":"CAD","price":390.0,"fixed":0.0,"unit":"按週計算","note":"Full Board"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (半食宿)","currency":"CAD","price":312.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"寄宿家庭","name":"寄宿家庭-雙人房 (全食宿)","currency":"CAD","price":336.0,"fixed":0.0,"unit":"按週計算","note":"需兩人同行"},{"type":"額外加成","name":"特殊飲食需求加價","currency":"CAD","price":55.0,"fixed":0.0,"unit":"按週計算","note":"Halal/Vegan等"},{"type":"額外加成","name":"獨立衛浴加價 (寄宿家庭)","currency":"CAD","price":45.0,"fixed":0.0,"unit":"按週計算","note":"Private bathroom"},{"type":"宿舍","name":"CASA - Residence 宿舍 (雙人房共用衛浴)","currency":"CAD","price":365.0,"fixed":0.0,"unit":"按週計算","note":"18+, Shared bedroom & shared bathroom"},{"type":"宿舍","name":"CASA - Residence 宿舍 (雙人房共用衛浴)","currency":"CAD","price":365.0,"fixed":0.0,"unit":"按週計算","note":"18+, Shared bedroom & shared bathroom"},{"type":"宿舍","name":"CASA - Student House 宿舍 (單人房共用衛浴)","currency":"CAD","price":400.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Student House 宿舍 (單人房共用衛浴)","currency":"CAD","price":400.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房共用衛浴)","currency":"CAD","price":465.0,"fixed":0.0,"unit":"按週計算","note":"18+, Single room & shared bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房共用衛浴)","currency":"CAD","price":440.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房半獨立衛浴)","currency":"CAD","price":515.0,"fixed":0.0,"unit":"按週計算","note":"18+, Semi-private bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Village (單人房半獨立衛浴)","currency":"CAD","price":490.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"},{"type":"宿舍","name":"CASA - Dreamhouse Yorkville (單人房獨立衛浴)","currency":"CAD","price":615.0,"fixed":0.0,"unit":"按週計算","note":"18+, Private bathroom"},{"type":"宿舍","name":"CASA - Dreamhouse Yorkville (單人房獨立衛浴)","currency":"CAD","price":590.0,"fixed":0.0,"unit":"按週計算","note":"18+, 5週以上優惠價"}],"fees":[{"category":"註冊","name":"註冊費","currency":"CAD","price":0.0,"fixed":175.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"CAD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":99},{"category":"雜費","name":"監護人信函費 (Custodianship)","currency":"CAD","price":0.0,"fixed":125.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":85.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":170.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費","currency":"CAD","price":0.0,"fixed":250.0,"unit":"固定金額","wf":12,"wt":24}]},"Dubai":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":350.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":305.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":285.0,"fixed":0.0,"peak":0}]},{"name":"經典早午餐課程 (20堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":320.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":275.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":255.0,"fixed":0.0,"peak":0}]},{"name":"經典輕量彈性課程 (15堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":280.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":235.0,"fixed":0.0,"peak":0},{"wf":13,"wt":24,"price":215.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40堂)","category":"課程","currency":"USD","unit":"按週計算","tiers":[{"wf":1,"wt":6,"price":505.0,"fixed":0.0,"peak":0},{"wf":7,"wt":12,"price":465.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"USD","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":125.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"宿舍","name":"ESAW 宿舍 (雙人房-4人共用)","currency":"USD","price":240.0,"fixed":0.0,"unit":"按週計算","note":"Twin Room (up to 4 students), Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (雙人房-5人共用)","currency":"USD","price":230.0,"fixed":0.0,"unit":"按週計算","note":"Twin Room (up to 5 students), Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (雙人 Studio)","currency":"USD","price":330.0,"fixed":0.0,"unit":"按週計算","note":"Twin studio, Shuttle 20 mins"},{"type":"宿舍","name":"ESAW 宿舍 (單人雅房)","currency":"USD","price":305.0,"fixed":0.0,"unit":"按週計算","note":"Private Room (6人共用衛浴), Shuttle 20 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (雙人房)","currency":"USD","price":350.0,"fixed":0.0,"unit":"按週計算","note":"Twin room, 1-2週短期價, Shuttle 40 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (雙人房)","currency":"USD","price":260.0,"fixed":0.0,"unit":"按週計算","note":"Twin room, 3週以上優惠價, Shuttle 40 mins"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人房)","currency":"USD","price":520.0,"fixed":0.0,"unit":"按週計算","note":"Single room, 1-2週短期價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人房)","currency":"USD","price":450.0,"fixed":0.0,"unit":"按週計算","note":"Single room, 3週以上優惠價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人 Studio)","currency":"USD","price":570.0,"fixed":0.0,"unit":"按週計算","note":"Single studio, 1-2週短期價"},{"type":"宿舍","name":"Myriad 或 KSK homes (單人 Studio)","currency":"USD","price":500.0,"fixed":0.0,"unit":"按週計算","note":"Single studio, 3週以上優惠價"}],"fees":[{"category":"註冊","name":"註冊費","currency":"USD","price":0.0,"fixed":75.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"USD","price":0.0,"fixed":60.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":65.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":130.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":190.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"USD","price":0.0,"fixed":260.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"USD","price":0.0,"fixed":130.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"USD","price":0.0,"fixed":260.0,"unit":"固定金額","wf":5,"wt":12}]},"Malta":{"courses":[{"name":"經典上午課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":295.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":255.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":190.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]},{"name":"經典下午課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":240.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":200.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":190.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":160.0,"fixed":0.0,"peak":0}]},{"name":"經典晚間課程 (20堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":200.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":160.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":130.0,"fixed":0.0,"peak":0}]},{"name":"半密集上午課程 (25堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":405.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":315.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":265.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":200.0,"fixed":0.0,"peak":0}]},{"name":"半密集下午課程 (25堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":285.0,"fixed":0.0,"peak":0},{"wf":12,"wt":23,"price":245.0,"fixed":0.0,"peak":0},{"wf":24,"wt":35,"price":265.0,"fixed":0.0,"peak":0},{"wf":36,"wt":99,"price":200.0,"fixed":0.0,"peak":0}]},{"name":"超密集課程 (40堂)","category":"課程","currency":"EUR","unit":"按週計算","tiers":[{"wf":1,"wt":11,"price":535.0,"fixed":0.0,"peak":0}]},{"name":"一對一課程","category":"課程","currency":"EUR","unit":"按堂計算","tiers":[{"wf":1,"wt":99,"price":105.0,"fixed":0.0,"peak":0}]}],"accomm":[{"type":"行政","name":"住宿安排費","currency":"EUR","price":0.0,"fixed":35.0,"unit":"固定金額","note":"Accommodation Placement Fee"},{"type":"宿舍","name":"Student Residence Campus Hub (單人套房)","currency":"EUR","price":375.0,"fixed":0.0,"unit":"按週計算","note":"16+, 20分車程, Single En-suite"},{"type":"宿舍","name":"Student Residence Campus Hub (雙人套房)","currency":"EUR","price":250.0,"fixed":0.0,"unit":"按週計算","note":"16+, 20分車程, Twin En-suite"},{"type":"宿舍","name":"Shared Apartments (標準合住房)","currency":"EUR","price":190.0,"fixed":0.0,"unit":"按週計算","note":"18+, 30分車程, Shared Room"}],"fees":[{"category":"註冊","name":"註冊費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"銀行","name":"銀行轉帳手續費","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"稅金","name":"環境稅 (ECO Tax)","currency":"EUR","price":0.0,"fixed":5.0,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證服務費 (Visa Service)","currency":"EUR","price":0.0,"fixed":50.0,"unit":"固定金額","wf":1,"wt":99},{"category":"簽證","name":"簽證費 (Extended)","currency":"EUR","price":0.0,"fixed":160.0,"unit":"固定金額","wf":1,"wt":99},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":47.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":94.0,"unit":"固定金額","wf":5,"wt":11},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":141.0,"unit":"固定金額","wf":12,"wt":23},{"category":"教材","name":"教材費 (標準課程)","currency":"EUR","price":0.0,"fixed":188.0,"unit":"固定金額","wf":24,"wt":99},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":94.0,"unit":"固定金額","wf":1,"wt":4},{"category":"教材","name":"教材費 (超密集課程)","currency":"EUR","price":0.0,"fixed":188.0,"unit":"固定金額","wf":5,"wt":11}]}},"ILSC":{"Adelaide":ILSC_AUSTRALIA,"Brisbane":ILSC_AUSTRALIA,"Melbourne":ILSC_AUSTRALIA,"Perth":ILSC_AUSTRALIA,"Sydney":ILSC_AUSTRALIA,"Montréal":ILSC_CANADA,"Toronto":ILSC_CANADA,"Vancouver":ILSC_CANADA,"Dublin":ILSC_IRELAND,"New Delhi":ILSC_INDIA}};

const COUNTRY_MAP = {
  EP:{Brisbane:'🇦🇺 澳洲','Canary Wharf':'🇬🇧 英國',Birmingham:'🇬🇧 英國',Leeds:'🇬🇧 英國',Dublin:'🇮🇪 愛爾蘭',Berlin:'🇩🇪 德國',Paris:'🇫🇷 法國',Toronto:'🇨🇦 加拿大',Dubai:'🇦🇪 杜拜',Malta:'🇲🇹 馬爾他'},
  ILSC:{Adelaide:'🇦🇺 澳洲',Brisbane:'🇦🇺 澳洲',Melbourne:'🇦🇺 澳洲',Perth:'🇦🇺 澳洲',Sydney:'🇦🇺 澳洲','Montréal':'🇨🇦 加拿大',Toronto:'🇨🇦 加拿大',Vancouver:'🇨🇦 加拿大',Dublin:'🇮🇪 愛爾蘭','New Delhi':'🇮🇳 印度'}
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
const DEFAULT_USERS=[
  {id:'admin',name:'管理員',role:'admin',avatar:'管'},
  {id:'u1',name:'Emily',role:'advisor',avatar:'E'},
  {id:'u2',name:'Aaron',role:'advisor',avatar:'A'},
  {id:'u3',name:'Bobo',role:'advisor',avatar:'B'},
  {id:'u4',name:'Yiwei',role:'advisor',avatar:'Y'},
];
let users=JSON.parse(localStorage.getItem('fy_users')||'null')||DEFAULT_USERS;
let currentUser=JSON.parse(localStorage.getItem('fy_current_user')||'null')||users[0];

function switchUser(uid){
  currentUser=users.find(u=>u.id===uid)||users[0];
  localStorage.setItem('fy_current_user',JSON.stringify(currentUser));
  document.getElementById('user-avatar').textContent=currentUser.avatar;
  document.getElementById('user-name-display').textContent=currentUser.name;
  document.getElementById('user-role-display').textContent=(currentUser.role==='admin'?'管理員':'顧問')+'・點擊切換';
  document.getElementById('user-modal').style.display='none';
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
  rebates:{EP:5,ILSC:5},
  discountPlans:[
    {id:'dp1',school:'EP',campus:'Brisbane',label:'EP Brisbane 淡季優惠',pct:30,fixed:0,validFrom:'2026-04-01',validTo:'2026-06-30',active:true}
  ]
};
// 補丁:若使用者 localStorage 已有舊 adminSettings(只有 EP),自動補 ILSC:5
if(adminSettings.rebates && !('ILSC' in adminSettings.rebates)){
  adminSettings.rebates.ILSC = 5;
  localStorage.setItem('fy_admin',JSON.stringify(adminSettings));
}
let history=JSON.parse(localStorage.getItem('fy_history')||'[]');
let companyInfo=JSON.parse(localStorage.getItem('fy_company')||'null')||{company:'放洋留遊學',phone:'',email:'',website:'',note:'以上報價僅供參考，實際費用依學校公告為準。'};

function sf(v){try{const f=parseFloat(v);return isNaN(f)?0:f;}catch{return 0;}}
function fmt(v,cur){return(CUR_SYM[cur]||cur)+Math.round(v).toLocaleString();}
function twd(v,cur){return Math.round(v*(rates[cur]||1));}
function isPeak(){const d=new Date(state.startDate||new Date());const m=d.getMonth();return m>=5&&m<=7;}
function getTier(tiers,w){for(const t of tiers)if(w>=(t.wf||1)&&w<=(t.wt||99))return t;return tiers[tiers.length-1];}



// ── Phase 4：Google Drive 上傳 ──
const DRIVE_FOLDER_INTERNAL = '1Kh4_bOPT_mF9vwp3CuOJZqId5k_FLGvs';
const DRIVE_FOLDER_STUDENT  = '1uWT88IMggk6lUXKlZyK2Y-xZ9Iigxxsf';

async function uploadToDrive(blob, filename, folderId){
  // 使用 Google Drive API v3 multipart upload
  // 需要 OAuth token（由 gapi 或 Google Identity Services 提供）
  const token = window._driveToken;
  if(!token){ console.warn('Drive token 未設定，跳過上傳'); return {ok:false, reason:'no_token'}; }

  const meta = JSON.stringify({ name: filename, parents: [folderId] });
  const boundary = 'fy_upload_boundary';
  const body = [
    '--' + boundary,
    'Content-Type: application/json; charset=UTF-8',
    '',
    meta,
    '--' + boundary,
    'Content-Type: image/png',
    '',
  ].join('\r\n');

  const bodyBlob = new Blob(
    [ body + '\r\n', blob, '\r\n--' + boundary + '--' ],
    { type: 'multipart/related; boundary=' + boundary }
  );

  try {
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'multipart/related; boundary=' + boundary,
        },
        body: bodyBlob,
      }
    );
    const data = await res.json();
    if(data.id){ return {ok:true, fileId:data.id}; }
    else { console.error('Drive upload error', data); return {ok:false, reason: data.error?.message||'unknown'}; }
  } catch(e){
    console.error('Drive upload exception', e);
    return {ok:false, reason: e.message};
  }
}

function makePngFilename(q, type){
  // 顧問名-學生名-校區-日期-v版本_type.png
  const advisor = (q.advisorName||'顧問').replace(/\s/g,'');
  const student = (q.studentName||'未填').replace(/\s/g,'');
  const campus  = (q.campus||'').replace(/\s/g,'');
  const dateStr = (q.date||new Date().toLocaleDateString('zh-TW')).replace(/\//g,'');
  const version = q.version || 'v1';
  return `${advisor}-${student}-${campus}-${dateStr}-${version}_${type}.png`;
}

async function generateAndUploadPNGs(q){
  const indicator = document.getElementById('sync-indicator');
  const setStatus = (msg, color) => {
    if(indicator){ indicator.textContent = msg; indicator.style.color = color||'#6b7280'; }
  };

  setStatus('📤 上傳報價單...', '#f97316');

  let internalOk = false, studentOk = false;
  const errors = [];

  // 產生兩張 PNG
  for(const type of ['internal','student']){
    try{
      const blob = await exportPNGBlob(type);
      if(!blob){ errors.push(type+':無法產生'); continue; }
      const filename = makePngFilename(q, type);
      const folderId = type === 'internal' ? DRIVE_FOLDER_INTERNAL : DRIVE_FOLDER_STUDENT;
      const result = await uploadToDrive(blob, filename, folderId);
      if(result.ok){
        if(type==='internal') internalOk = true;
        else studentOk = true;
      } else if(result.reason === 'no_token'){
        // 沒有 token → 靜默跳過，不報錯（Phase 5 Login 完成後會有 token）
        break;
      } else {
        errors.push(type+':'+result.reason);
      }
    } catch(e){
      errors.push(type+':'+e.message);
    }
  }

  if(!window._driveToken){
    setStatus('☁️ 已同步', '#059669');
    return;
  }

  if(errors.length === 0){
    setStatus('☁️ 報價單已上傳 Drive', '#059669');
  } else {
    setStatus('⚠️ Drive 上傳部分失敗', '#dc2626');
    console.error('Drive upload errors:', errors);
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
  const badge = document.getElementById('admin-badge');
  if(badge) badge.style.display='inline-block';
  updateBadge();
  renderQP();
}

function exitAdminMode(){
  _isAdminMode = false;
  currentUser = users.find(u=>u.role==='advisor') || users[1];
  const ns = document.getElementById('nav-settings');
  if(ns) ns.style.display='none';
  const badge = document.getElementById('admin-badge');
  if(badge) badge.style.display='none';
  // 若在管理員頁面，跳回報價
  const ap = document.querySelector('.page.active');
  if(ap && ap.id==='page-settings') showPage('wizard');
  updateBadge();
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
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const idx={wizard:0,history:1,settings:2,data:3};
  document.querySelectorAll('.nav-item')[idx[id]??0].classList.add('active');
  const titles={wizard:'新增報價',history:'歷史報價紀錄',settings:'匯率設定',data:'費用資料管理'};
  document.getElementById('topbar-title').textContent=titles[id]||'';
  document.getElementById('topbar-sub').textContent='';
  if(id==='settings')renderSettings();
  if(id==='data')renderDataPage();
  if(id==='history')renderHistory();
  if(id==='wizard')renderWizard();
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
  const schools=['EP','ILSC'];
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

  html+='<div class="qp-divider"></div>';
  html+='<div class="qp-row"><div><div class="qp-item-name">營業稅</div>'
    +'<div class="qp-item-note">'+(adminSettings.taxRate||5)+'%</div></div>'
    +'<div style="text-align:right"><div class="qp-item-price" style="color:var(--text)">NT$ '+calc.taxAmt.toLocaleString()+'</div></div></div>';

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
  const flags={EP:'🌏',ILSC:'🌐'};
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
// 初始化匯率設定可見性（由末尾 DOMContentLoaded 統一處理）

// ── Tutorial System(EP → EP / ILSC 多廠商版本) ──
const TUTORIAL_STEPS = [
  {
    target: '.logo-area',
    title: '歡迎使用多廠商報價系統 👋',
    body: '這是放洋留遊學的多廠商語言學校報價工具,目前支援 EP + ILSC。本教學將帶你了解完整的報價流程,大約需要 2 分鐘。',
    position: 'right',
  },
  {
    target: '.nav-item.active, button[onclick*="wizard"]',
    title: '從「新增報價」開始',
    body: '每次要幫學生報價,都從這裡點進去。報價分為 7 個步驟,系統會引導你逐步完成。',
    position: 'right',
  },
  {
    target: '#step-content',
    title: 'Step 1–2:選學校與課程',
    body: '可選擇 EP 或 ILSC 兩家廠商,再選城市校區跟課程類型。EP 有 10 個校區、ILSC 有 10 個校區。選完後右側會即時顯示費用。',
    position: 'left',
  },
  {
    target: '#step-content',
    title: 'Step 3:填寫學生資料',
    body: '輸入學生姓名、Email 和學習週數。週數會影響住宿的可選項目（部分住宿有最少週數限制）。',
    position: 'left',
  },
  {
    target: '#step-content',
    title: 'Step 4:選擇住宿',
    body: '灰色的住宿選項代表週數不符合最少入住要求。部分住宿有短期價和優惠價兩種,請依學生週數選擇。',
    position: 'left',
  },
  {
    target: '#step-content',
    title: 'Step 5–6:加購與折扣',
    body: '可加購簽證費、考試費等。折扣方案由管理員設定,如有廠商限時優惠可在這裡套用。',
    position: 'left',
  },
  {
    target: '.quote-panel',
    title: '右側即時費用預覽',
    body: '每個步驟的選擇都會即時更新右側費用,包含課程、住宿、規費的完整明細。數字單位為外幣和台幣兩種顯示。',
    position: 'left',
  },
  {
    target: '#step-content',
    title: 'Step 7:確認報價與開單',
    body: '確認費用後可按「▲ 四捨整數」讓金額更漂亮,再按「✓ 儲存報價」。儲存後可下載 PNG 報價單,以及產生開單指示。',
    position: 'left',
  },
  {
    target: 'button[onclick*="history"]',
    title: '歷史報價紀錄',
    body: '所有報價都會存在這裡,支援搜尋和重新載入。已開單的報價會顯示「已開單」標籤,方便追蹤進度。',
    position: 'right',
  },
];

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

let _tutStep = 0;
let _tutActive = false;

function startTutorial(manual = false){
  // 手動點擊或第一次進入才啟動
  if(!manual && localStorage.getItem('fy_tutorial_done')) return;
  _tutStep = 0;
  _tutActive = true;
  showPage('wizard');
  document.getElementById('tutorial-overlay').style.display = 'block';
  document.getElementById('tutorial-overlay').style.pointerEvents = 'all';
  renderTutStep();
}

function endTutorial(){
  _tutActive = false;
  document.getElementById('tutorial-overlay').style.display = 'none';
  localStorage.setItem('fy_tutorial_done', '1');
  // 同時開啟側邊說明面板
  showTutorialPanel();
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
  const step = TUTORIAL_STEPS[_tutStep];
  const total = TUTORIAL_STEPS.length;

  // 更新文字
  document.getElementById('tut-step-label').textContent = '步驟 ' + (_tutStep+1) + ' / ' + total;
  document.getElementById('tut-title').textContent = step.title;
  document.getElementById('tut-body').textContent = step.body;

  // dots
  const dots = document.getElementById('tut-dots');
  dots.innerHTML = TUTORIAL_STEPS.map((_,i) =>
    `<div style="width:${i===_tutStep?16:6}px;height:6px;border-radius:3px;background:${i===_tutStep?'#e91e8c':'#ddd'};transition:all .3s"></div>`
  ).join('');

  // 按鈕
  const prev = document.getElementById('tut-btn-prev');
  const next = document.getElementById('tut-btn-next');
  prev.style.opacity = _tutStep === 0 ? '0.3' : '1';
  prev.style.pointerEvents = _tutStep === 0 ? 'none' : 'all';
  next.textContent = _tutStep === total-1 ? '完成 ✓' : '下一步 →';

  // highlight 目標元素
  const el = document.querySelector(step.target);
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

    // tooltip 位置
    const tipW = 300, tipH = 220;
    let tipLeft, tipTop;
    if(step.position === 'right'){
      tipLeft = rect.right + pad + 16;
      tipTop  = rect.top + rect.height/2 - tipH/2;
    } else {
      tipLeft = rect.left - tipW - pad - 16;
      tipTop  = rect.top + rect.height/2 - tipH/2;
    }
    tipLeft = Math.max(12, Math.min(tipLeft, vw-tipW-12));
    tipTop  = Math.max(12, Math.min(tipTop,  vh-tipH-12));
    tooltip.style.left = tipLeft+'px';
    tooltip.style.top  = tipTop+'px';
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

// ── 統一初始化(DOMContentLoaded) ──
document.addEventListener('DOMContentLoaded', function(){
  // 1. 匯率設定預設隱藏
  const ns = document.getElementById('nav-settings');
  if(ns) ns.style.display = 'none';
  // 2. Tutorial 第一次自動啟動
  setTimeout(function(){
    if(!localStorage.getItem('fy_tutorial_done')){
      startTutorial(false);
    }
  }, 1000);
});
