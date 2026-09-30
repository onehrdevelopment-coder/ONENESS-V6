# Oneness — HR Operating Intelligence

> **PEOPLE · PROCESS · AI · AS ONE**  
> *HR work, handled. You decide.* / *Urusan HR selesai. Anda buat keputusan.*

[![Open in Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-Open%20App-0071e3?style=for-the-badge&logo=google)](https://ai.studio/apps/ad3749b9-1b5c-4a26-afc2-1484b625901a)

### 🔗 Pautan Langsung Aplikasi / Live App Link
**👉 [https://ai.studio/apps/ad3749b9-1b5c-4a26-afc2-1484b625901a](https://ai.studio/apps/ad3749b9-1b5c-4a26-afc2-1484b625901a)**

---

### 🌐 Pilih Bahasa / Choose Language
- 🇲🇾 **[Bahasa Melayu](#-bahasa-melayu)**
- 🇬🇧 **[English](#-english)**

---

<a name="-bahasa-melayu"></a>
# 🇲🇾 Bahasa Melayu

## 📌 Pengenalan & Gambaran Keseluruhan

**Oneness** ialah lapisan *"HR Operating Intelligence"* yang dibina mengelilingi **Ramco** (sistem HRIS teras dan rekod rasmi). Oneness **tidak menggantikan** Ramco.

Sebaliknya, Oneness menyelaras keseluruhan kitaran operasi HR:
1. **Sense (Mengesan)**: Menerima dokumen mentah, PDF, emel, atau permohonan; seterusnya mengenal pasti apa yang berlaku, siapa pekerja terbabit, dan dasar/polisi mana yang terpakai.
2. **Route (Menghala)**: Menugaskan kes kepada peranan HR yang tepat atau menyerahkan kes antara jabatan (handover) lengkap dengan notifikasi dan draf emel yang siap disediakan.
3. **Execute (Melaksana)**: Mengautomasikan langkah-langkah rutin yang boleh diundur (*reversible steps*) seperti semakan polisi, penyediaan draf Gmail ke diri sendiri, acara kalendar, dan pemfailan bukti; lalu berhenti seketika untuk menunggu keputusan manusia.
4. **Verify (Mengesahkan)**: Memastikan setiap bukti difailkan dan kebergantungan tugas (*dependencies*) selesai sebelum kes ditutup.
5. **Govern (Tadbir Urus)**: Jejak audit (*audit trail*) penuh bagi setiap tindakan, pemantau integriti masa nyata (*Watchdog*), serta butang Henti Cemas (*Emergency Stop*) serta-merta.

> ℹ️ *Semua data pekerja yang digunakan dalam prototaip ini adalah data sintetik (dummy) semata-mata.*

---

## 🎨 Panduan Reka Bentuk & Penjenamaan (Branding)

Oneness mematuhi panduan reka bentuk gaya Apple peringkat perusahaan (*enterprise grade*):

- **Latar Belakang**: `#fbfbfd`
- **Teks & Dakwat**: Teks utama `#1d1d1f`, label lembut `#86868b`, garisan pembahagi `#e8e8ed`
- **Warna Aksen Utama**: Biru Apple `#0071e3`
- **Gradien Tajuk (`.grad`)**: `linear-gradient(90deg, #0071e3, #8e44ad, #ff5a5f)` pada kata kunci tajuk utama
- **Suasana Bawah Viewport (`.wave`)**: Kilauan lembut biru lembut (`#e3e9ff`) dan karang (`#ffe8e5`) di bahagian bawah skrin
- **Kad & Panel**: Putih bersih (`#ffffff`), bucu melengkung `20px`, sempadan nipis `#e8e8ed`, bayang halus `0 6px 24px rgba(0, 0, 0, 0.04)`
- **Butang Tindakan**:
  - Utama: Bentuk pil biru (`#0071e3`) dengan teks putih dan tindak balas animasi spring
  - Sekunder: Bentuk pil putih dengan sempadan `#d2d2d7` dan teks biru
  - Bahaya: Bentuk pil merah (`#ff3b30`)
- **Tipografi**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Helvetica Neue", sans-serif` dengan *letter-spacing* padat pada tajuk tebal
- **Warna Status**: Hijau (`#30d158`), Merah (`#ff3b30`), Amber (`#f59e0b`), Ungu (`#8e44ad`), Biru (`#0071e3`)

---

## 👥 Peranan & Kawalan Akses (RBAC)

Sistem menguatkuasakan Kawalan Akses Berdasarkan Peranan (*Role-Based Access Control*):

| Kod | Nama Peranan | Unit | Modul Utama |
|---|---|---|---|
| **HR A** | Operasi & Pergerakan HR | HR Operations | Perletakan Jawatan, Pengambilan, Kenaikan Pangkat, Pengesahan Jawatan, Pembaharuan Kontrak, Peningkatan Gred, Onboarding |
| **HR B** | Pengurusan Manfaat | HR Operations | Cuti, Tuntutan Perubatan, SOCSO, Pengesahan LTM, Laporan Perubatan, Saringan Eksekutif, Penyakit Kritikal, Cuti Bersalin, Pertanyaan Faedah, Laporan Tuntutan, Polisi |
| **HR C** | Pembelajaran & Pembangunan (L&D) | HR Org Excellence | Permohonan Latihan, Pendaftaran Latihan, Tuntutan HRDC, Bajet Latihan, TNA, Hebahan Latihan Bulanan |
| **HR D** | Penglibatan Pekerja (Engagement) | HR Org Excellence | Aktiviti Penglibatan, Pendaftaran Aktiviti |
| **HR E** | Penggajian (Payroll) | HR Operations | Pengecualian Gaji, Surat Pengesahan Gaji, Potongan Gaji, Pemprosesan Gaji Bulanan |
| **HR E2** | Perhubungan Perusahaan (IR) | HR Operations | Perhubungan Pekerja/Aduan (terhad & rahsia), Rundingan Kesatuan |
| **HR F** | Prestasi & Bakat | HR Org Excellence | Pengurusan Prestasi (PMS), Bakat & Pengekalan Pekerja, Laporan GHR |
| **Manager** | Pengurus Unit | Unit Berkaitan | Kelulusan peringkat unit, pelepasan, dan pengesahan keputusan |
| **HOD Ops** | Ketua Jabatan (Operasi) | Operations | Pengawasan Penggajian, Manfaat, Pergerakan & IR |
| **HOD OrgEx** | Ketua Jabatan (Org Excellence) | Org Excellence | Pengawasan PMS, L&D, Bakat & Penglibatan Pekerja |
| **Admin** | Pentadbir Sistem | Menyeluruh | Tadbir urus tanpa batasan, penetapan semula sistem, audit menyeluruh |

---

## ⚡ Ciri-Ciri Utama & Aliran Kerja

### 1. Enjin Pengesanan Universal (Drop Anywhere)
- Seret dan lepas (*drag-and-drop*) mana-mana fail PDF, TXT, atau EML di mana-mana bahagian skrin untuk mencetuskan paparan penuh **"Drop anywhere to Sense"**.
- Animasi penunjuk bacaan fail (contoh: `Reading S01_resignation_normal.pdf...`).
- Kitaran Operasi Teras beranimasi secara berperingkat:
  `SENSE → IDENTIFY → UNDERSTAND → CLASSIFY → ROUTE`
- **Penghalaan Berdasarkan Peranan**:
  - **Peranan Sendiri**: *"Untuk peranan anda. Oneness akan membuka kes dan tugas pertama untuk anda."*
  - **Peranan Lain**: *"Milik [Peranan]... Oneness mencipta kes, menugaskan pemilik, memberitahu pasukan dan merekodkan serah-tugas."*
  - **Sensitif/Rahsia (IR)**: Serah-tugas selamat tanpa membocorkan butiran aduan pekerja kepada pihak yang tidak dibenarkan.

### 2. Pengurusan Kes & Enjin Kebergantungan (Dependencies)
- Tugas disusun mengikut urutan dan terbahagi kepada 3 jenis:
  - **Tugas Manusia**: Memerlukan pengesahan manual dan nota/bukti sebelum selesai.
  - **Tugas Keputusan**: Cabang pilihan (contoh: *Ganti Pekerja vs. Tiada Penggantian*, *Lulus vs. Tolak*). Memilih *Ganti Pekerja* dalam kes perletakan jawatan akan secara automatik membuka kes Pengambilan Pekerja yang baharu.
  - **Tugas Automatik**: *"Biar Oneness laksanakan"* (semakan syarat polisi deterministik, penjanaan acara kalendar, penyediaan draf Gmail).
- Kes tidak boleh disahkan atau ditutup selagi terdapat bukti yang belum lengkap atau tugas yang masih tergantung.

### 3. Pratonton Fail & Semakan Draf Emel
- **Pratonton Fail**: Paparan bersebelahan dengan teks yang dikesan diserlahkan dalam warna kuning (tarikh, nama pekerja, tempoh notis), bersama metadata baca-sahaja.
- **Semakan Draf Gmail**: Memaparkan draf emel bersama senarai semak keselamatan **"Checked by Oneness"** (penerima disahkan, semakan alamat dalaman, tiada data perbankan sensitif, boleh diubah atau dibatalkan).
- **Struktur Folder Drive**: Susunan hierarki folder kemas (`Oneness / HR / <Modul> / <Pekerja>`).

### 4. Tadbir Urus, Watchdog & Henti Cemas (Emergency Stop)
- **Butang Henti Cemas**: Tersembunyi secara lalai; muncul perlahan di bucu bawah kanan apabila tetikus didekatkan (*hover*), atau melalui menu sistem.
- Menekan *Emergency Stop* menghentikan semua automasi, kelulusan, dan sambungan luar serta-merta, lalu memaparkan sepanduk merah amaran di seluruh sistem.
- Hanya **HOD** atau **Admin** yang dibenarkan menyambung semula operasi (dengan kewajipan memasukkan sebab audit).
- **Watchdog**: Memeriksa kesihatan sambungan Google Workspace, kadar automasi (had 40 tindakan/10 minit), dan integriti proses. Sekiranya dikesan ketidakkonsistenan, sistem dihentikan secara automatik.
- **Jejak Audit**: Log terperinci setiap peristiwa lengkap dengan nama pengguna, masa, ID kes, tindakan, dan penerangan. Boleh dicari dan dieksport ke **CSV**.

### 5. 7 Pilihan Gaya Menu Navigasi
Boleh ditukar bila-bila masa dan disimpan dalam storan penyemak imbas:
1. **Dock (Lalai)**: Bar dock gaya macOS di bahagian bawah dengan pembesaran ikon dan lencana perhatian.
2. **Capsule**: Kapsul kaca terapung di bahagian atas tengah.
3. **Toolbar**: Bar alat mendatar dengan sub-tab modul.
4. **Sidebar**: Bar sisi kaca legap di sebelah kiri.
5. **Mega Menu**: Laci menu penuh dengan pecahan Navigasi, Modul, dan Akaun.
6. **Launchpad**: Grid ikon aplikasi skrin penuh.
7. **Spotlight Sahaja**: Butang carian pantas minimalis.
- **Palet Arahan (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>)**: Navigasi papan kekunci untuk beralih pantas ke sebarang paparan, modul, pekerja atau tindakan.

---

## 🧪 25 Senario Ujian Bawaan (S01–S25)

Prototaip dilengkapi dengan 25 fail dan senario sintetik sedia diuji di bahagian **Sense**:
- **S01**: Perletakan jawatan biasa (Eksekutif, notis 1 bulan, kiraan LWD automatik)
- **S02**: ID staf tiada (Sistem meminta pengesahan nama pekerja)
- **S03**: Notis tidak dinyatakan (Sistem mengesan kehilangan tempoh notis)
- **S04**: Tarikh LWD bercanggah (Tarikh surat bercanggah dengan syarat 2 bulan polisi)
- **S05**: Dokumen salah (Resit klinik dikesan sebagai tuntutan, bukan perletakan jawatan)
- **S06**: Surat pendua (Percubaan perletakan jawatan kedua disekat)
- **S07**: Imbasan kabur (Teks garbled dikesan dan diserahkan kepada semakan manusia)
- **S08**: Berbilang pekerja (Dua surat pekerja berbeza dalam satu dokumen disekat)
- **S09**: Ayat luar kebiasaan (*"bergerak ke fasa hidup yang baharu"*)
- **S10**: Pekerja tidak wujud (EMP-9999 disekat)
- **S11**: Pekerja sudah pun berhenti dalam rekod Ramco
- **S12–S13**: Permohonan cuti biasa vs. permohonan melebihi baki kelayakan
- **S14–S15**: Tuntutan klinik am vs. tuntutan pakar melebihi had (RM 5,000)
- **S16**: Onboarding pekerja baharu
- **S17**: Semakan bajet latihan & pembangunan
- **S18**: Aduan potongan gaji tidak tepat
- **S19**: Aduan sulit perhubungan pekerja (terhad kepada unit IR)
- **S20–S25**: Kenaikan pangkat, pengesahan jawatan, cuti bersalin, kemalangan SOCSO, surat gaji bank, dan pendaftaran kursus.

---

<br/>

<a name="-english"></a>
# 🇬🇧 English

## 📌 Introduction & Overview

**Oneness** is an "HR Operating Intelligence" layer built around **Ramco** (the core HRIS and system of record). It does **not** replace Ramco.

Instead, it orchestrates the entire operational loop:
1. **Sense**: Ingests raw documents, PDFs, emails, or requests; identifies what occurred, who it relates to, and which policy applies.
2. **Route**: Assigns the case to the responsible HR role or hands it over across departments complete with alerts and ready drafts.
3. **Execute**: Automates routine, reversible steps (deterministic policy checks, self-addressed Gmail drafts, calendar events, evidence filing) and stops for human decisions.
4. **Verify**: Ensures all documentary evidence is filed and task dependencies are satisfied before closing.
5. **Govern**: Full immutable audit trail for every action, real-time Watchdog system integrity monitor, and an instant Emergency Stop.

> ℹ️ *All employee and case data in this prototype is strictly synthetic (dummy).*

---

## 🎨 Design & Branding Guidelines

Oneness strictly implements the approved Apple-inspired enterprise design constitution:

- **Background**: `#fbfbfd`
- **Text & Ink**: Primary `#1d1d1f`, muted labels `#86868b`, divider lines `#e8e8ed`
- **Primary Accent**: Apple blue `#0071e3`
- **Headline Gradient (`.grad`)**: `linear-gradient(90deg, #0071e3, #8e44ad, #ff5a5f)` applied on key headline words
- **Bottom Atmosphere (`.wave`)**: Soft radial blue (`#e3e9ff`) and coral (`#ffe8e5`) glow pinned to the bottom of the viewport
- **Cards & Surfaces**: Clean white (`#ffffff`), `20px` border radius, `#e8e8ed` hairline border, subtle elevation `0 6px 24px rgba(0, 0, 0, 0.04)`
- **Action Buttons**:
  - Primary: Blue pill (`#0071e3`) with white text and spring active feedback
  - Secondary: White pill with `#d2d2d7` border and blue text
  - Danger: Red pill (`#ff3b30`)
- **Typography**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Helvetica Neue", sans-serif` with tight letter-spacing on bold titles
- **Status Colors**: Green (`#30d158`), Red (`#ff3b30`), Amber (`#f59e0b`), Purple (`#8e44ad`), Blue (`#0071e3`)

---

## 👥 Roles & Organizational Architecture (RBAC)

The system enforces strict Role-Based Access Control:

| Code | Role Name | Unit | Core Modules |
|---|---|---|---|
| **HR A** | HR Operations & Movement | HR Operations | Resignation, Recruitment, Promotion, Confirmation, Contract Renewal, Grade Upgrading, Onboarding |
| **HR B** | Benefit Management | HR Operations | Leave, Medical Claims, SOCSO, LTM Verification, Medical Reports, Executive Screening, Critical Illness, Maternity Leave, Benefit Inquiries, Claim Reports, Policy |
| **HR C** | Learning & Development | HR Org Excellence | Learning Requests, Training Registration, HRDC Claims, Training Budget, TNA, Monthly Training Blast |
| **HR D** | Employee Engagement | HR Org Excellence | Engagement Activities, Activity Registration |
| **HR E** | Payroll | HR Operations | Payroll Exceptions, Salary Confirmation Letters, Salary Deductions, Monthly Payroll Run |
| **HR E2** | Industrial Relations (IR) | HR Operations | Employee Relations (strictly restricted grievance), Union Negotiations |
| **HR F** | Performance & Talent | HR Org Excellence | Performance Management (PMS), Talent & Retention, GHR Reports |
| **Manager** | Unit Manager | Respective Unit | Unit-level approvals, overrides, and decision sign-offs |
| **HOD Ops** | Head of Dept (Operations) | Operations | Payroll, Benefits, Movement, and Industrial Relations oversight |
| **HOD OrgEx** | Head of Dept (Org Excellence) | Org Excellence | PMS, L&D, Talent, and Engagement oversight |
| **Admin** | Prototype Administrator | System-wide | Unrestricted governance, system resets, full audit review |

---

## ⚡ Core Features & Workflows

### 1. Universal Sense Engine & Drop Anywhere
- Drag and drop any PDF, TXT, or EML file onto the screen to trigger the full-screen **"Drop anywhere to Sense"** backdrop.
- File reading pill indicator (`Reading S01_resignation_normal.pdf...`) animates during parsing.
- Core Operating Loop steps animate sequentially:
  `SENSE → IDENTIFY → UNDERSTAND → CLASSIFY → ROUTE`
- **Role-based Routing**:
  - **Own Role**: *"For your role. Oneness will create the case and open the first task for you."*
  - **Other Role**: *"Belongs to [Role]... Oneness will create the case, assign it, notify the team and log the handover."*
  - **Restricted (IR)**: Handed over securely without leaking sensitive employee grievance details.

### 2. Case Management & Dependency Engine
- Tasks are sequenced with dependencies and categorized into:
  - **Human tasks**: Require manual verification and evidence/notes.
  - **Decision tasks**: Branching options (e.g. *Replace vs. No replacement*, *Approved vs. Rejected*). Selecting *Replace* in a Resignation case automatically spawns a downstream Recruitment case.
  - **Automatic tasks**: *"Let Oneness do it"* (deterministic rule checks, calendar event creation, Gmail draft preparation).
- Cases cannot be verified or closed without complete evidence and task sign-off.

### 3. File Preview & Gmail Draft Review
- **File Preview**: Side-by-side view with detected parameters highlighted in yellow directly in the document text, plus read-only extracted metadata fields.
- **Gmail Draft Review**: Displays the draft with the **"Checked by Oneness"** security checklist (recipient verified, internal address check, no sensitive banking data, reversible).
- **Drive Case Folder**: Reversible folder hierarchy (`Oneness / HR / <Module> / <Employee>`).

### 4. Governance, Watchdog & Emergency Stop
- **Emergency Stop Button**: Hidden by default; fades into the bottom-right corner when hovered (or accessed via the menu).
- Pressing Emergency Stop halts all automated tasks, approvals, and Google Workspace operations immediately, activating a system-wide red banner.
- Only a **HOD** or **Admin** can resume the system (with a mandatory audit reason).
- **Watchdog**: Continuously checks connector health, runaway automation rates (>40 actions/10 min), and process integrity. Critical issues automatically trip the Emergency Stop and display the dark red *"Watchdog stopped everything"* alert.
- **Audit Trail**: Detailed log of every action with user, timestamp, case, action, and reasoning. Includes real-time search and **CSV export**.

### 5. 7 Selectable Navigation Styles
Switchable on demand and remembered across sessions:
1. **Dock (Default)**: Apple macOS dock pinned to the bottom with hover magnification, tooltips, and attention badges.
2. **Capsule**: Top-center floating glass capsule with modules dropdown.
3. **Toolbar**: Segmented horizontal toolbar with sub-tabs for role modules.
4. **Sidebar**: Full-height frosted glass sidebar on the left.
5. **Mega Menu**: Top drawer expanding into Navigate, Modules, and Account sections.
6. **Launchpad**: Full-screen grid of app icons.
7. **Spotlight Only**: Minimalist search pill trigger.
- **Command Palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>)**: Keyboard-navigable quick switcher to jump to any page, module, employee, or action.

---

## 🧪 Included Test Scenarios (S01–S25)

The app comes preloaded with 25 synthetic scenarios ready to test in **Sense**:
- **S01**: Normal resignation (Executive, 1 month notice, LWD calculation)
- **S02**: Missing staff ID (Prompts human to confirm person)
- **S03**: Missing notice period (Flags missing policy duration)
- **S04**: Conflicting LWD (Letter date conflicts with 2-month policy)
- **S05**: Wrong document (Medical clinic receipt detected as a claim)
- **S06**: Duplicate resignation (Aina Rahman duplicate blocked)
- **S07**: Poor scan quality (Garbled OCR text flagged for human review)
- **S08**: Multiple employees (Multiple resignation letters in one file blocked)
- **S09**: Unusual wording (*"moving on to a new chapter"*)
- **S10**: Non-existent employee (EMP-9999 blocked)
- **S11**: Already resigned in Ramco mirror
- **S12–S13**: Leave requests within vs. exceeding balance
- **S14–S15**: Medical claims within vs. exceeding Specialist cap (RM 5,000)
- **S16**: New joiner onboarding
- **S17**: Learning & development budget check
- **S18**: Payroll underpayment discrepancy
- **S19**: Confidential employee relations grievance (restricted to IR)
- **S20–S25**: Promotion recommendation, probation confirmation, maternity leave handover, SOCSO accident report, salary letter, and training registration.

---

## 🚀 Development & Setup / Pembangunan & Persediaan

### Keperluan / Prerequisites
- Node.js 18+
- npm / bun

### Arahan / Commands
```bash
# Pasang kebergantungan / Install dependencies
npm install

# Jalankan pelayan pembangunan Vite / Start Vite dev server on port 3000
npm run dev

# Jalankan semakan taip TypeScript / Run TypeScript typecheck
npm run lint

# Bina pakej pengeluaran / Build production bundle
npm run build
```

### ☁️ Cloud & Persistence (Firebase Firestore)
- **Pangkalan Data / Database:** Firebase Firestore dikonfigurasikan di rantau `asia-southeast1` dengan peraturan ABAC (`firestore.rules`).
- **Autentikasi / Auth:** Google Workspace Sign-In berserta akaun peranan demo.
- **Pautan Langsung Aplikasi / App Link:** [https://ai.studio/apps/ad3749b9-1b5c-4a26-afc2-1484b625901a](https://ai.studio/apps/ad3749b9-1b5c-4a26-afc2-1484b625901a)

---

## 📄 Lesen / License
Internal Prototype · Media Prima HR Operating Intelligence · Synthetic Data Only
