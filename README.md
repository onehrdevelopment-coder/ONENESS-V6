# Oneness — HR Operating Intelligence

> **PEOPLE · PROCESS · AI · AS ONE**
> *HR work, handled. You decide.*

**Oneness** is an "HR Operating Intelligence" layer built around **Ramco** (the core HRIS and system of record). It does **not** replace Ramco. 

Instead, it orchestrates the entire operational loop:
1. **Sense**: Receives raw documents, PDFs, emails, or requests and identifies what happened, who it relates to, and which policy applies.
2. **Route**: Assigns the case to the responsible HR role or hands it over across departments with notifications and prepared drafts.
3. **Execute**: Automates routine, reversible steps (rule checks, Gmail drafts to yourself, calendar events, evidence filing) and stops for human decisions.
4. **Verify**: Ensures all evidence is filed and dependencies are satisfied before closing.
5. **Govern**: Complete audit log for every action, real-time Watchdog system integrity monitor, and an instant Emergency Stop.

Two ways in:
- **Continue with Google** → *live workspace*: real Google account, data stored in your Google Drive, input from real files, Gmail and Calendar.
- **Try demo accounts** → *demo login*: all 18 demo roles grouped on one page, **synthetic (dummy)** data in the browser only. Never touches Google.

---

## 🎨 Design & Branding Guidelines

Oneness strictly adheres to the approved Apple-inspired enterprise design constitution:

- **Background**: `#fbfbfd`
- **Text & Ink**: Primary `#1d1d1f`, muted labels `#86868b`, divider lines `#e8e8ed`
- **Primary Accent**: Apple blue `#0071e3`
- **Text Gradient (`.grad`)**: `linear-gradient(90deg, #0071e3, #8e44ad, #ff5a5f)` applied on key headline words
- **Bottom Atmosphere (`.wave`)**: Soft radial blue (`#e3e9ff`) and coral (`#ffe8e5`) glow pinned to the bottom of the viewport
- **Cards**: White (`#ffffff`), `20px` border radius, thin `#e8e8ed` border, subtle elevation `0 6px 24px rgba(0, 0, 0, 0.04)`
- **Buttons**:
  - Primary: Blue pill (`#0071e3`) with white text and spring active feedback
  - Secondary: White pill with `#d2d2d7` border and blue text
  - Danger: Red pill (`#ff3b30`)
- **Typography**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Helvetica Neue", sans-serif` with negative letter-spacing on bold titles
- **Status Colors**: Green (`#30d158`), Red (`#ff3b30`), Amber (`#f59e0b`), Purple (`#8e44ad`), Blue (`#0071e3`)

---

## 👥 Roles & Organizational Architecture

Oneness enforces strict Role-Based Access Control (RBAC):

| Code | Role Name | Unit | Core Modules |
|---|---|---|---|
| **HR A** | HR Operations & Movement | HR Operations | Resignation, Recruitment, Promotion, Confirmation, Contract Renewal, Grade Upgrading, Onboarding |
| **HR B** | Benefit Management | HR Operations | Leave, Medical Claims, SOCSO, LTM Verification, Medical Reports, Executive Screening, Critical Illness, Maternity Leave, Benefit Inquiries, Claim Reports, Policy |
| **HR C** | Learning & Development | HR Org Excellence | Learning Requests, Training Registration, HRDC Claims, Training Budget, TNA, Monthly Training Blast |
| **HR D** | Employee Engagement | HR Org Excellence | Engagement Activities, Activity Registration |
| **HR E** | Payroll | HR Operations | Payroll Exceptions, Salary Confirmation Letters, Salary Deductions, Monthly Payroll Run |
| **HR E2** | Industrial Relations (IR) | HR Operations | Employee Relations (strictly restricted), Union Negotiations |
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
- Core Operating Loop steps animate:
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
Switchable on demand and remembered in `localStorage`:
1. **Dock (Default)**: Apple macOS dock pinned to the bottom with hover magnification, tooltips, and attention badges.
2. **Capsule**: Top-center floating glass capsule with modules dropdown.
3. **Toolbar**: Segmented horizontal toolbar with sub-tabs for role modules.
4. **Sidebar**: Full-height frosted glass sidebar on the left.
5. **Mega Menu**: Top drawer expanding into Navigate, Modules, and Account sections.
6. **Launchpad**: Full-screen grid of app icons.
7. **Spotlight Only**: Minimalist search pill trigger.
- **Command Palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>)**: Keyboard-navigable quick switcher to jump to any page, module, employee, or action.
- **Mobile Tab Bar**: Persistent bottom navigation on phone viewports.

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

## 🚀 Development & Setup

### Prerequisites
- Node.js 18+
- npm or bun

### Commands
```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Run TypeScript typecheck
npm run lint

# Build production bundle
npm run build
```

### Real Google sign-in (live workspace)

1. Google Cloud Console → create/select a project → enable **Google Drive API**, **Gmail API**, **Google Calendar API**.
2. **OAuth consent screen** → User type **Internal** (limits sign-in to your Workspace org and avoids Google's restricted-scope verification for Gmail).
3. **Credentials → Create OAuth client ID → Web application**. Add the app URL and `http://localhost:3000` under *Authorized JavaScript origins*.
4. Set `VITE_GOOGLE_CLIENT_ID` (see `.env.example`), restart `npm run dev`.

| Scope | Why |
|---|---|
| `drive.file` | Only files Oneness creates: `Oneness/oneness-data.json`, `Oneness/Inbox`, `Oneness/HR/<Module>/<Employee>` |
| `gmail.readonly` | List and Sense inbox emails + attachments |
| `gmail.compose` | Create drafts. Oneness never sends. |
| `calendar.events` | Read upcoming events to Sense; create key-date events |

How live mode works:
- **Data**: the whole workspace (cases, tasks, audit, employees) is one JSON file `Oneness/oneness-data.json` in the signed-in user's Drive, auto-saved (debounced) after every change. Status shows in the top bar.
- **Employees**: start empty. Import the employee master as CSV in *People* (`empId, name, email` required).
- **Sense inputs**: drop/choose a file (PDF, Word, image, TXT, EML) → uploaded to `Oneness/Inbox`, non-text files read via Google Docs OCR; or pick an email / calendar event under *From Google Workspace*.
- **Outputs**: automatic tasks create real Gmail drafts (never sent) and all-day Calendar events. On case creation the source file is moved to `Oneness/HR/<Module>/<Employee>`.
- **Session**: the access token is kept in memory only and lasts ~1 hour. When it expires, click *Reconnect* in the top bar; unsaved changes are retried.

Known limits (by design, for now): data is per user (each person's own Drive), no shared team workspace yet; last write wins if the same account uses two tabs; roles are not enforced server-side (there is no server).

---

## 📄 License
Internal Prototype · Media Prima HR Operating Intelligence · Synthetic Data Only
