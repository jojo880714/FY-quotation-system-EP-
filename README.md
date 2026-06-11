# FY Quotation System
> 放洋留遊學 × 多廠商語言學校報價系統

| 2026-06-10 | 新增 EC(25校區)、Kaplan(22校區)、SGIC(3校區)三家上架;SCHOOL_DATA / COUNTRY_MAP / COURSE_MAP / rebates / schools 全面擴充為五廠商 |
---
## 專案概覽
為放洋語言學校產品線設計的線上報價工具,支援多廠商、多校區的客製化遊學報價。
- **EP 語言學校** — 10 校區獨立定價(每校區一個 A 週費)
- **ILSC 語言學校** — 10 校區同地區同價(澳洲5/加拿大3/愛爾蘭/印度)

報價系統部署於 Firebase,顧問用 Wizard 對學生開報價單,管理員可看完整淨利試算。

---
## 技術架構
| 項目 | 說明 |
|------|------|
| 前端 | 純 HTML + Vanilla JS(單頁應用) |
| 資料庫 | Firebase Firestore(`fy2026-223ce`,asia-east1) |
| 本地快取 | localStorage(`fy_admin`) |
| 匯出 | html2canvas → PNG 報價單 |
| 課表產生 | Claude.ai Skill(`fy-quote-table-generator.skill`) |

---
## 檔案結構
```
├── index.html                                    # 主結構 HTML + Firebase 初始化
├── app.js                                        # 全部 JS 邏輯、資料、計算引擎、UI
├── fy-quote-table-generator.skill                # 課表自動產生器(Claude.ai skill)
├── 語言學校詳細費用清單_20260211.xlsx            # EP 費用清單(來源資料)
├── 語言學校詳細費用清單_ILSC_20260609.xlsx       # ILSC 費用清單(來源資料)
├── EP_A週費課表.xlsx                             # EP 上架課表(skill 產出)
├── ILSC_A週費課表.xlsx                           # ILSC 上架課表(skill 產出)
└── EP_ILSC_合併課表.xlsx                         # 合併版含跨廠商 dedup(skill 產出,主要上架用)
```

---
## 課表維護流程
```
[廠商原始報價單 PDF/Excel]
       ↓ PM 整理
[語言學校詳細費用清單.xlsx]   ← 每廠商一份,一個工作表
       ↓ 跑 fy-quote-table-generator skill
[A 週費課表.xlsx]             ← 11 欄真實上架格式 + 海外學雜費獨立列
       ↓ 業務上架
[放洋報價系統 (index.html)]   ← 顧問用此對學生報價
       ↓ 顧問選校區、週數、住宿
[PNG 報價單給學生]
```

廠商漲價時:更新對應的「費用清單 xlsx」→ 跑 skill → 取代舊課表 → 上架。主推 SKU 固化在 skill 內 `scripts/generator.py`,不需要每次重設。

---
## 支援學校

### EP 語言學校(10 校區,每校區獨立定價)
| 校區 | 幣別 | A 週費(課程最低 + 住宿最低) |
|------|------|-------------------------------|
| Canary Wharf(倫敦) | GBP | NT$28,000 |
| Birmingham(伯明罕) | GBP | NT$24,500 |
| Leeds(里茲) | GBP | NT$24,500 |
| Dublin(都柏林) | EUR | NT$23,000 |
| Paris(巴黎) | EUR | NT$23,500 |
| Berlin(柏林) | EUR | NT$16,500 |
| Brisbane(布里斯本) | AUD | NT$15,000 |
| Malta(馬爾他) | EUR | NT$17,000 |
| Dubai(杜拜) | USD | NT$18,500 |
| Toronto(多倫多) | CAD | NT$18,000 |

### ILSC 語言學校(10 校區,同地區同價)
| 地區 | 涵蓋校區 | 幣別 | A 週費 |
|------|---------|------|--------|
| 澳洲 | Adelaide / Brisbane / Melbourne / Perth / Sydney | AUD | NT$18,500 |
| 加拿大 | Montréal / Toronto / Vancouver | CAD | NT$17,500 |
| 愛爾蘭 | Dublin | EUR | NT$23,000 |
| 印度 | New Delhi | USD | NT$18,000 |

### EC 語言學校（25 校區，各校區獨立定價）
美國(波士頓/紐約/舊金山/聖地牙哥/洛杉磯)、加拿大(蒙特婁/多倫多/溫哥華)、
英國(倫敦/劍橋/布萊頓/布里斯托/曼徹斯特)、愛爾蘭(都柏林)、馬爾他、南非(開普敦)、杜拜。
含 30+ 校區(住宿/雜費沿用母城市,由 getEffectiveCampusData 自動 fallback)。

### Kaplan 語言學校（22 校區，各校區獨立定價）
北美(波士頓/芝加哥/洛杉磯/紐約/舊金山/聖塔芭芭拉/多倫多/溫哥華)、
英國(倫敦/牛津/劍橋/曼徹斯特/利物浦/愛丁堡/伯恩茅斯/托基)、愛爾蘭(都柏林)。
全課程(General/Semi-Intensive/Intensive/Business/TOEFL)+ 全住宿 + 全雜費。

### SGIC 語言學校（3 校區，加拿大）
多倫多 / 溫哥華 / North York(住宿用多倫多價)。三種英語課:
Intensive English(30堂)/ Full Time(40堂)/ X-Intensive(40堂+1:1)。

主推 SKU:FT AM 上午全職課程(24 lessons)+ Homestay Half board Single(住宿取地區內最低)。

### 跨廠商同名地點 dedup 規則
EP 跟 ILSC 都有 Brisbane / Toronto / Dublin 時,課表只保留一筆,規則 = **取定價最低**。

| 地點 | EP | ILSC | 課表保留 |
|------|------|------|----------|
| 布里斯本 | NT$15,000 | NT$18,500 | EP 15,000 |
| 多倫多 | NT$18,000 | NT$17,500 | ILSC 17,500 |
| 都柏林 | NT$23,000 | NT$23,000 | 同價,保留先到 |

由 skill 的 `deduplicate_by_city_zh()` 自動處理,合併課表共 17 筆(原 20 筆 - 3 筆衝突)。

---
## 報價計算邏輯
### 六層計費架構
```
外幣原始成本
  → × (1 - 廠商折扣%)         # 折在成本上
  → × 匯率 × (1 + 匯差%)      # 台幣換算
  → × (1 + 顧問獎金%)         # 佣金計入
  → - 公司折扣                # 二次折扣
  → × (1 + 營業稅%)           # 含稅售價
```
**淨利 = 稅前收入 - 折後成本 + 廠商回傭**

### 預設匯率(可於後台調整)
| 幣別 | 預設匯率 |
|------|----------|
| AUD | 21.5 |
| GBP | 40.2 |
| EUR | 33.8 |
| USD | 32.1 |
| CAD | 23.5 |

---
## 系統功能
### 報價 Wizard(7 步驟)
1. 選擇學校(EP / ILSC)
2. 選擇校區與課程
3. 設定週數與學生資訊
4. 選擇住宿
5. 加購選項(簽證、考試費等)
6. 折扣設定(廠商折扣 + 公司折扣)
7. 確認與匯出

### 即時費用預覽
- 右側面板即時更新
- 顯示各費用明細(外幣 + 台幣換算)
- 管理員可見計費層與淨利試算

### 報價單匯出
- **學生版** — 只顯示費用明細與台幣總額,不含計費層
- **內部版** — 顯示完整六層計費、回傭與淨利試算
- 格式:PNG 圖片(html2canvas)

### 歷史報價紀錄
- 命名規則:`學生-學校-日期-v版本數`
- 支援複製、載入舊報價
- Firebase Firestore 雲端同步,多裝置共用

### 課表自動產生(fy-quote-table-generator skill)
Claude.ai 用的 skill 工具,自動把費用清單 xlsx 轉成上架課表 xlsx。

**安裝:** Claude.ai → Settings → Capabilities → Skills → 上傳 `fy-quote-table-generator.skill`

**用法:** 對話中說「跑課表」、「丟費用表算課表」、「重新跑 A 週費」,Claude 會自動處理。

**支援廠商:** EP + ILSC。新增廠商範本見 skill 內 `references/how-to-add-vendor.md`。

---
## 帳號與權限
| 帳號 | 身份 | 權限 |
|------|------|------|
| 管理員 | admin | 可見所有報價、管理費率、淨利試算 |
| Emily (u1) | advisor | 只看自己的報價 |
| Aaron (u2) | advisor | 只看自己的報價 |
| Bobo (u3) | advisor | 只看自己的報價 |
| Yiwei (u4) | advisor | 只看自己的報價 |

---
## 管理員設定(費率管理)
可於後台調整:
- 匯率(AUD / GBP / EUR / USD / CAD)
- 匯差緩衝 %(預設 2%)
- 顧問獎金 %(預設 2%)
- 營業稅 %(預設 5%)
- 廠商回傭率(EP 預設 5%)
- 報價有效天數(預設 30 天)
- 匯率提醒天數(預設 7 天)
- 廠商折扣方案(期間限定,按校區設定)
- 公司折扣方案(原價 / 優惠價 / 出清價 / 固定折抵)

---
## Coming Soon(預留校區)
`IH` / `BESA` / `Winning`(已預留佔位,尚未上線)

---
## 課表結構(11 欄真實上架格式)
對齊「遊學課表_20260521」上架格式:

| 欄位 | 內容 |
|------|------|
| A: 課號 | 業務填 |
| B: 課程名稱 | 倫敦客製化遊學 / 阿德雷得客製化遊學 ... |
| C: 有效期限 | 24M |
| D: 定價 | 純整數(28000) |
| E: 優惠價 | 「無」 |
| F: 月清+網銷折扣 | 「無」 |
| G: 課程內容 | 1.以周為單位 / 2.剩下費用會以海外學雜費補足 |
| H: (空欄) | |
| I: 第3層(所別組別) | 客製化語言學校 |
| J: 第4層(科目) | 空白 |
| K: 第5層(課程類型) | 1W |

最後一列加「海外學雜費」獨立 SKU(24M、其他欄位空白,實際金額由報價系統動態計算)。

---
## 版本紀錄
| 日期 | 說明 |
|------|------|
| 2026-05-21 | EP Only — 移除 ILSC、Kaplan 所有資料,系統縮減為單一廠商 |
| 2026-06-09 | 新增 ILSC(同地區同價,4 地區 10 校區)、新增 fy-quote-table-generator skill v1.2、跨廠商同名地點 dedup、課表對齊 11 欄真實上架格式 |

---
## Firebase 設定
```
Project ID : fy2026-223ce
Region     : asia-east1
```
> Firebase API Key 已內嵌於 `index.html`,請勿公開 repo 或設定 Firestore 安全規則。
