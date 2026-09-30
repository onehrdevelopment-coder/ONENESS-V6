import {
  User,
  Employee,
  Case,
  Task,
  EvidenceItem,
  AuditRecord,
  ChangeRecord,
  LeaveRecord,
  ClaimRecord,
  LearningRecord,
  SampleDoc,
  FileRecord,
  DraftRecord,
  NotificationRecord,
  SenseResult,
  ExtractedField,
  ModuleType,
  MenuStyle,
} from '../types';

export const ROLES: Record<string, { code: string; label: string; unit: string }> = {
  'HR Ops': { code: 'HR A', label: 'HR Operations & Movement', unit: 'HR Operations' },
  'Benefits': { code: 'HR B', label: 'Benefit Management', unit: 'HR Operations' },
  'Learning': { code: 'HR C', label: 'Learning & Development', unit: 'HR Organisational Excellence' },
  'Engagement': { code: 'HR D', label: 'Employee Engagement', unit: 'HR Organisational Excellence' },
  'Payroll': { code: 'HR E', label: 'Payroll', unit: 'HR Operations' },
  'IR': { code: 'HR E2', label: 'Union & Industrial Relations', unit: 'HR Operations' },
  'Performance': { code: 'HR F', label: 'Performance & Talent', unit: 'HR Organisational Excellence' },
};

export const MODULE_GROUPS: Record<string, ModuleType[]> = {
  'HR Ops': ['resignation', 'recruitment', 'promotion', 'confirmation', 'renewal', 'upgrading', 'onboarding'],
  'Benefits': ['leave', 'claim', 'socso', 'ltm', 'medreport', 'screening', 'critical', 'maternity', 'benefitq', 'claimrpt', 'policy'],
  'Learning': ['learning', 'trainreg', 'hrdc', 'trainpay', 'tna', 'blast'],
  'Engagement': ['activity', 'actreg'],
  'Payroll': ['payroll', 'salaryletter', 'deduction', 'payrun'],
  'IR': ['er', 'union'],
  'Performance': ['pms', 'talent', 'ghrreport'],
};

export const LABELS: Record<string, string> = {
  resignation: 'Resignation',
  recruitment: 'Replacement / recruitment',
  promotion: 'Promotion',
  confirmation: 'Confirmation',
  renewal: 'Contract renewal',
  upgrading: 'Grade upgrading',
  onboarding: 'Onboarding',
  leave: 'Leave',
  claim: 'Medical claim',
  socso: 'SOCSO submission',
  ltm: 'LTM verification',
  medreport: 'Medical report (periodic)',
  screening: 'Executive screening package',
  critical: 'Critical illness monitoring',
  maternity: 'Maternity leave and allowance',
  benefitq: 'Benefit inquiry',
  claimrpt: 'Ramco claim expenses report',
  policy: 'GHR policy management',
  learning: 'Learning request',
  trainreg: 'Training registration',
  hrdc: 'HRDC registration and claim',
  trainpay: 'Training budget and payment',
  tna: 'Training needs analysis',
  blast: 'Monthly training blast',
  activity: 'Engagement activity',
  actreg: 'Activity registration',
  payroll: 'Payroll exception',
  salaryletter: 'Salary confirmation letter',
  deduction: 'Salary deduction',
  payrun: 'Monthly payroll run',
  er: 'Employee relations',
  union: 'Union / industrial relations',
  pms: 'Performance management',
  talent: 'Talent and retention',
  ghrreport: 'GHR report (monthly / quarterly / yearly)',
};

interface TemplateTask {
  t: string;
  role: string;
  kind: 'human' | 'auto' | 'decision';
  deps: number[];
  options?: string;
  action?: string;
}

interface TemplateDef {
  prefix: string;
  label: string;
  restricted?: boolean;
  tasks: TemplateTask[];
}

const TEMPLATES: Record<string, TemplateDef> = {
  resignation: {
    prefix: 'RES',
    label: 'Resignation',
    tasks: [
      { t: 'Validate resignation details', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Confirm notice period and last working day', role: 'HR Ops', kind: 'human', deps: [0] },
      { t: 'Notify reporting manager (Gmail draft)', role: 'HR Ops', kind: 'auto', deps: [1], action: 'draft:manager' },
      { t: 'Check leave balance and encashment', role: 'Benefits', kind: 'auto', deps: [1], action: 'check:leave' },
      { t: 'Add last working day to calendar', role: 'HR Ops', kind: 'auto', deps: [1], action: 'calendar:key' },
      { t: 'Prepare exit checklist (assets, access)', role: 'HR Ops', kind: 'human', deps: [1] },
      { t: 'Check payroll and benefits impact', role: 'Payroll', kind: 'human', deps: [1] },
      { t: 'Decide: replacement required?', role: 'HR Ops', kind: 'decision', deps: [1], options: 'Replace;No replacement' },
      { t: 'Update Ramco (System of Record)', role: 'HR Ops', kind: 'human', deps: [1, 3, 5, 6] },
    ],
  },
  recruitment: {
    prefix: 'REC',
    label: 'Replacement / recruitment',
    tasks: [
      { t: 'Raise requisition and get approval', role: 'HR Ops', kind: 'decision', deps: [], options: 'Approved;Rejected' },
      { t: 'Prepare job description', role: 'HR Ops', kind: 'human', deps: [0] },
      { t: 'Publish vacancy', role: 'HR Ops', kind: 'human', deps: [1] },
      { t: 'Shortlist and interview', role: 'HR Ops', kind: 'human', deps: [2] },
      { t: 'Offer decision', role: 'HR Ops', kind: 'decision', deps: [3], options: 'Offer made;No suitable candidate' },
      { t: 'Handover to onboarding', role: 'HR Ops', kind: 'human', deps: [4] },
    ],
  },
  promotion: {
    prefix: 'PRM',
    label: 'Promotion',
    tasks: [
      { t: 'Validate eligibility and performance rating', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Manager and HOD recommendation', role: 'HR Ops', kind: 'decision', deps: [0], options: 'Approved;Not approved' },
      { t: 'Prepare promotion letter', role: 'HR Ops', kind: 'human', deps: [1] },
      { t: 'Notify payroll of new grade and salary', role: 'Payroll', kind: 'human', deps: [1] },
      { t: 'Update Ramco', role: 'HR Ops', kind: 'human', deps: [2, 3] },
    ],
  },
  confirmation: {
    prefix: 'CNF',
    label: 'Confirmation',
    tasks: [
      { t: 'Check probation end date', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Collect manager assessment', role: 'HR Ops', kind: 'human', deps: [0] },
      { t: 'Decide outcome', role: 'HR Ops', kind: 'decision', deps: [1], options: 'Confirm;Extend probation;Not confirmed' },
      { t: 'Issue confirmation letter', role: 'HR Ops', kind: 'auto', deps: [2], action: 'draft:employee' },
      { t: 'Update Ramco', role: 'HR Ops', kind: 'human', deps: [2] },
    ],
  },
  renewal: {
    prefix: 'RNW',
    label: 'Contract renewal',
    tasks: [
      { t: 'Check contract end date', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Manager recommendation', role: 'HR Ops', kind: 'decision', deps: [0], options: 'Renew;Do not renew' },
      { t: 'Prepare renewal contract', role: 'HR Ops', kind: 'human', deps: [1] },
      { t: 'Update Ramco and payroll', role: 'HR Ops', kind: 'human', deps: [2] },
    ],
  },
  upgrading: {
    prefix: 'UPG',
    label: 'Grade upgrading',
    tasks: [
      { t: 'Validate grade criteria', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Approval', role: 'HR Ops', kind: 'decision', deps: [0], options: 'Approved;Rejected' },
      { t: 'Update grade in Ramco', role: 'HR Ops', kind: 'human', deps: [1] },
      { t: 'Notify payroll', role: 'Payroll', kind: 'human', deps: [1] },
    ],
  },
  onboarding: {
    prefix: 'ONB',
    label: 'Onboarding',
    tasks: [
      { t: 'Prepare contract and documents', role: 'HR Ops', kind: 'human', deps: [] },
      { t: 'Request IT access and assets', role: 'HR Ops', kind: 'human', deps: [0] },
      { t: 'Schedule orientation (calendar)', role: 'HR Ops', kind: 'auto', deps: [0], action: 'calendar:key' },
      { t: 'Create employee in Ramco', role: 'HR Ops', kind: 'human', deps: [0] },
      { t: 'Assign buddy and manager checklist', role: 'HR Ops', kind: 'human', deps: [2] },
      { t: '30-day check-in', role: 'HR Ops', kind: 'human', deps: [3, 4] },
    ],
  },
  leave: {
    prefix: 'LEV',
    label: 'Leave',
    tasks: [
      { t: 'Check entitlement against balance', role: 'Benefits', kind: 'auto', deps: [], action: 'check:leaveReq' },
      { t: 'Manager approval', role: 'Benefits', kind: 'decision', deps: [0], options: 'Approved;Rejected' },
      { t: 'Update Ramco', role: 'Benefits', kind: 'human', deps: [1] },
      { t: 'Notify employee (Gmail draft)', role: 'HR Ops', kind: 'auto', deps: [1], action: 'draft:employee' },
    ],
  },
  claim: {
    prefix: 'CLM',
    label: 'Medical claim',
    tasks: [
      { t: 'Identify claimant and plan', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Check entitlement cap', role: 'Benefits', kind: 'auto', deps: [0], action: 'check:claimCap' },
      { t: 'Verify receipts and evidence', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Approve or reject claim', role: 'Benefits', kind: 'decision', deps: [1, 2], options: 'Approved;Rejected;Partially approved' },
      { t: 'Submit to TPA and update record', role: 'Benefits', kind: 'human', deps: [3] },
    ],
  },
  socso: {
    prefix: 'SOC',
    label: 'SOCSO submission',
    tasks: [
      { t: 'Verify employee and incident details', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Verify supporting documents', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Submit to SOCSO', role: 'Benefits', kind: 'human', deps: [1] },
      { t: 'Record acknowledgement as evidence', role: 'Benefits', kind: 'human', deps: [2] },
    ],
  },
  ltm: {
    prefix: 'LTM',
    label: 'LTM verification',
    tasks: [
      { t: 'Receive request and identify employee', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Verify eligibility', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Verify supporting documents', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Approve or reject', role: 'Benefits', kind: 'decision', deps: [1, 2], options: 'Approved;Rejected' },
      { t: 'Process and update record', role: 'Benefits', kind: 'human', deps: [3] },
    ],
  },
  medreport: {
    prefix: 'MRP',
    label: 'Medical report (periodic)',
    tasks: [
      { t: 'Extract claims data from Ramco', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Compile report', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Review by manager', role: 'Benefits', kind: 'decision', deps: [1], options: 'Approved;Revise' },
      { t: 'Submit to HOD', role: 'Benefits', kind: 'human', deps: [2] },
    ],
  },
  screening: {
    prefix: 'SCR',
    label: 'Executive screening package',
    tasks: [
      { t: 'Receive hospital panel bill', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Verify against package', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Approve GL and payment', role: 'Benefits', kind: 'decision', deps: [1], options: 'Approved;Query hospital' },
      { t: 'Process payment', role: 'Benefits', kind: 'human', deps: [2] },
    ],
  },
  critical: {
    prefix: 'CIL',
    label: 'Critical illness monitoring',
    tasks: [
      { t: 'Register case (restricted detail stays with Benefits)', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Confirm benefit entitlement', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Periodic follow-up', role: 'Benefits', kind: 'human', deps: [1] },
      { t: 'Close case', role: 'Benefits', kind: 'decision', deps: [2], options: 'Continue monitoring;Close' },
    ],
  },
  maternity: {
    prefix: 'MAT',
    label: 'Maternity leave and allowance',
    tasks: [
      { t: 'Verify eligibility', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Calculate leave and allowance', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Approve', role: 'Benefits', kind: 'decision', deps: [1], options: 'Approved;Rejected' },
      { t: 'Notify payroll', role: 'Payroll', kind: 'human', deps: [2] },
      { t: 'Update Ramco', role: 'Benefits', kind: 'human', deps: [2] },
    ],
  },
  benefitq: {
    prefix: 'BNQ',
    label: 'Benefit inquiry',
    tasks: [
      { t: 'Log inquiry', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Check benefit schedule', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Respond to employee', role: 'Benefits', kind: 'auto', deps: [1], action: 'draft:employee' },
    ],
  },
  claimrpt: {
    prefix: 'CRP',
    label: 'Ramco claim expenses report',
    tasks: [
      { t: 'Extract claims from Ramco', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Reconcile with records', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Publish report', role: 'Benefits', kind: 'human', deps: [1] },
    ],
  },
  policy: {
    prefix: 'POL',
    label: 'GHR policy management',
    tasks: [
      { t: 'Log policy request', role: 'Benefits', kind: 'human', deps: [] },
      { t: 'Review current policy', role: 'Benefits', kind: 'human', deps: [0] },
      { t: 'Approve change', role: 'Benefits', kind: 'decision', deps: [1], options: 'Approved;Rejected' },
      { t: 'Publish and communicate', role: 'Benefits', kind: 'human', deps: [2] },
    ],
  },
  learning: {
    prefix: 'LRN',
    label: 'Learning request',
    tasks: [
      { t: 'Check eligibility and budget', role: 'Learning', kind: 'auto', deps: [], action: 'check:learning' },
      { t: 'Approval', role: 'Learning', kind: 'decision', deps: [0], options: 'Approved;Rejected' },
      { t: 'Register participant', role: 'Learning', kind: 'human', deps: [1] },
      { t: 'Prepare HRDC grant documents', role: 'Learning', kind: 'human', deps: [1] },
      { t: 'Confirm completion and close', role: 'Learning', kind: 'human', deps: [2, 3] },
    ],
  },
  trainreg: {
    prefix: 'TRG',
    label: 'Training registration',
    tasks: [
      { t: 'Receive registration', role: 'Learning', kind: 'human', deps: [] },
      { t: 'Check eligibility and budget', role: 'Learning', kind: 'auto', deps: [0], action: 'check:learning' },
      { t: 'Confirm participant', role: 'Learning', kind: 'human', deps: [1] },
      { t: 'Send confirmation', role: 'Learning', kind: 'auto', deps: [2], action: 'draft:employee' },
    ],
  },
  hrdc: {
    prefix: 'HRD',
    label: 'HRDC registration and claim',
    tasks: [
      { t: 'Prepare grant application', role: 'Learning', kind: 'human', deps: [] },
      { t: 'Submit to HRDC', role: 'Learning', kind: 'human', deps: [0] },
      { t: 'Track approval', role: 'Learning', kind: 'human', deps: [1] },
      { t: 'Claim reimbursement', role: 'Learning', kind: 'human', deps: [2] },
    ],
  },
  trainpay: {
    prefix: 'TPY',
    label: 'Training budget and payment',
    tasks: [
      { t: 'Verify invoice', role: 'Learning', kind: 'human', deps: [] },
      { t: 'Check budget utilisation', role: 'Learning', kind: 'human', deps: [0] },
      { t: 'Approve', role: 'Learning', kind: 'decision', deps: [1], options: 'Approved;Rejected' },
      { t: 'Process payment', role: 'Learning', kind: 'human', deps: [2] },
    ],
  },
  tna: {
    prefix: 'TNA',
    label: 'Training needs analysis',
    tasks: [
      { t: 'Issue survey', role: 'Learning', kind: 'human', deps: [] },
      { t: 'Consolidate results', role: 'Learning', kind: 'human', deps: [0] },
      { t: 'Present to HOD', role: 'Learning', kind: 'decision', deps: [1], options: 'Approved;Revise' },
      { t: 'Publish training plan', role: 'Learning', kind: 'human', deps: [2] },
    ],
  },
  blast: {
    prefix: 'BLS',
    label: 'Monthly training blast',
    tasks: [
      { t: 'Prepare monthly calendar', role: 'Learning', kind: 'human', deps: [] },
      { t: 'Send blast (draft)', role: 'Learning', kind: 'auto', deps: [0], action: 'draft:employee' },
      { t: 'Track registrations', role: 'Learning', kind: 'human', deps: [1] },
    ],
  },
  activity: {
    prefix: 'ACT',
    label: 'Engagement activity',
    tasks: [
      { t: 'Plan programme', role: 'Engagement', kind: 'human', deps: [] },
      { t: 'Approve budget', role: 'Engagement', kind: 'decision', deps: [0], options: 'Approved;Rejected' },
      { t: 'Promote to employees (draft)', role: 'Engagement', kind: 'auto', deps: [1], action: 'draft:employee' },
      { t: 'Handle registrations', role: 'Engagement', kind: 'human', deps: [2] },
      { t: 'Post-event report', role: 'Engagement', kind: 'human', deps: [3] },
    ],
  },
  actreg: {
    prefix: 'ARG',
    label: 'Activity registration',
    tasks: [
      { t: 'Register employee', role: 'Engagement', kind: 'human', deps: [] },
      { t: 'Confirm slot', role: 'Engagement', kind: 'human', deps: [0] },
      { t: 'Send confirmation', role: 'Engagement', kind: 'auto', deps: [1], action: 'draft:employee' },
    ],
  },
  payroll: {
    prefix: 'PAY',
    label: 'Payroll exception',
    tasks: [
      { t: 'Identify discrepancy and employee', role: 'Payroll', kind: 'human', deps: [] },
      { t: 'Compare with Ramco record', role: 'Payroll', kind: 'human', deps: [0] },
      { t: 'Decide correction', role: 'Payroll', kind: 'decision', deps: [1], options: 'Correct in next run;Off-cycle payment;No change' },
      { t: 'Verify in next payroll run', role: 'Payroll', kind: 'human', deps: [2] },
    ],
  },
  salaryletter: {
    prefix: 'SAL',
    label: 'Salary confirmation letter',
    tasks: [
      { t: 'Verify request and employee', role: 'Payroll', kind: 'human', deps: [] },
      { t: 'Confirm salary in Ramco', role: 'Payroll', kind: 'human', deps: [0] },
      { t: 'Prepare letter', role: 'Payroll', kind: 'human', deps: [1] },
      { t: 'Issue to employee (draft)', role: 'Payroll', kind: 'auto', deps: [2], action: 'draft:employee' },
    ],
  },
  deduction: {
    prefix: 'DED',
    label: 'Salary deduction',
    tasks: [
      { t: 'Validate deduction request', role: 'Payroll', kind: 'human', deps: [] },
      { t: 'Check consent and policy', role: 'Payroll', kind: 'human', deps: [0] },
      { t: 'Approve', role: 'Payroll', kind: 'decision', deps: [1], options: 'Approved;Rejected' },
      { t: 'Apply in next payroll run', role: 'Payroll', kind: 'human', deps: [2] },
    ],
  },
  payrun: {
    prefix: 'PRN',
    label: 'Monthly payroll run',
    tasks: [
      { t: 'Freeze inputs', role: 'Payroll', kind: 'human', deps: [] },
      { t: 'Validate changes', role: 'Payroll', kind: 'human', deps: [0] },
      { t: 'Process payroll', role: 'Payroll', kind: 'human', deps: [1] },
      { t: 'Verify payslips', role: 'Payroll', kind: 'human', deps: [2] },
    ],
  },
  er: {
    prefix: 'ER',
    label: 'Employee relations',
    restricted: true,
    tasks: [
      { t: 'Intake and classify', role: 'IR', kind: 'human', deps: [] },
      { t: 'Assign case owner', role: 'IR', kind: 'decision', deps: [0], options: 'ER Lead;External advisor' },
      { t: 'Collect evidence', role: 'IR', kind: 'human', deps: [1] },
      { t: 'Policy review', role: 'IR', kind: 'human', deps: [2] },
      { t: 'Decide action', role: 'IR', kind: 'decision', deps: [3], options: 'No action;Counselling;Formal process' },
      { t: 'Outcome and closure', role: 'IR', kind: 'human', deps: [4] },
    ],
  },
  union: {
    prefix: 'UNI',
    label: 'Union / industrial relations',
    tasks: [
      { t: 'Log matter', role: 'IR', kind: 'human', deps: [] },
      { t: 'Review collective agreement', role: 'IR', kind: 'human', deps: [0] },
      { t: 'Consult parties', role: 'IR', kind: 'human', deps: [1] },
      { t: 'Decide action', role: 'IR', kind: 'decision', deps: [2], options: 'Resolved;Escalate to HOD' },
      { t: 'Close', role: 'IR', kind: 'human', deps: [3] },
    ],
  },
  pms: {
    prefix: 'PMS',
    label: 'Performance management',
    tasks: [
      { t: 'Confirm objectives set', role: 'Performance', kind: 'human', deps: [] },
      { t: 'Mid-year review', role: 'Performance', kind: 'human', deps: [0] },
      { t: 'Year-end rating', role: 'Performance', kind: 'human', deps: [1] },
      { t: 'Calibration decision', role: 'Performance', kind: 'decision', deps: [2], options: 'Approved;Revisit' },
    ],
  },
  talent: {
    prefix: 'TAL',
    label: 'Talent and retention',
    tasks: [
      { t: 'Identify at-risk talent', role: 'Performance', kind: 'human', deps: [] },
      { t: 'Retention plan', role: 'Performance', kind: 'decision', deps: [0], options: 'Retain;Succession plan' },
      { t: 'Action plan', role: 'Performance', kind: 'human', deps: [1] },
      { t: 'Review outcome', role: 'Performance', kind: 'human', deps: [2] },
    ],
  },
  ghrreport: {
    prefix: 'GRP',
    label: 'GHR report (monthly / quarterly / yearly)',
    tasks: [
      { t: 'Collect data', role: 'Performance', kind: 'human', deps: [] },
      { t: 'Compile report', role: 'Performance', kind: 'human', deps: [0] },
      { t: 'HOD review', role: 'Performance', kind: 'decision', deps: [1], options: 'Approved;Revise' },
      { t: 'Submit', role: 'Performance', kind: 'human', deps: [2] },
    ],
  },
};

// Date helpers
function pad(n: number): string {
  return (n < 10 ? '0' : '') + n;
}
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function nowStr(d: Date = new Date()): string {
  return `${todayIso()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function parseIso(s: string): Date {
  const p = String(s).split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
export function addDays(s: string, n: number): string {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function addMonths(s: string, m: number): string {
  const d = parseIso(s);
  const day = d.getDate();
  const w = Math.floor(m);
  d.setDate(1);
  d.setMonth(d.getMonth() + w);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  if (m > w) d.setDate(d.getDate() + Math.round((m - w) * 30));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function ago(hours: number): string {
  return nowStr(new Date(Date.now() - hours * 3600000));
}

// 40 Employees
const NAMES = [
  'Aina Rahman', 'Nur Aisyah Karim', 'Farah Nabila', 'Daniel Tan', 'Kavitha Nair',
  'Hafiz Ismail', 'Siti Zulaikha', 'Lim Wei Jian', 'Arjun Menon', 'Nurul Huda',
  'Amirul Hakim', 'Priya Devi', 'Chong Mei Ling', 'Zulkifli Yusof', 'Sharifah Aminah',
  'Ravi Shankar', 'Jasmine Ooi', 'Haziq Danial', 'Norazlina Ahmad', 'Tan Boon Kiat',
  'Mira Sofea', 'Iskandar Zulkarnain', 'Deepa Krishnan', 'Wong Kar Yan', 'Syafiq Roslan',
  'Balqis Hanani', 'Vikram Singh', 'Lee Chia Hui', 'Faizal Anwar', 'Aisyah Humaira',
  'Jeevan Raj', 'Nadia Kamal', 'Ong Jia Wen', 'Hakimi Zainal', 'Suraya Basri',
  'Kumar Pillai', 'Adlina Sofia', 'Izzat Firdaus', 'Melissa Yap', 'Razif Mansor',
];
const DEPTS = ['Marketing', 'Finance', 'Operations', 'Digital', 'Sales', 'Engineering', 'Human Resources', 'Content'];
const GRADES = ['Executive', 'Senior Executive', 'Manager', 'Senior Manager'];

export type SideEffect =
  | { kind: 'draft'; draftId: string }
  | { kind: 'calendar'; caseId: string; date: string; summary: string };

// Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// Initial in-memory / localStorage store
export class OnenessStore {
  users: User[] = [];
  employees: Employee[] = [];
  rules: Record<string, string> = {};
  cases: Case[] = [];
  tasks: Task[] = [];
  evidence: EvidenceItem[] = [];
  auditLog: AuditRecord[] = [];
  changes: ChangeRecord[] = [];
  leave: LeaveRecord[] = [];
  claims: ClaimRecord[] = [];
  learning: LearningRecord[] = [];
  samples: SampleDoc[] = [];
  files: FileRecord[] = [];
  drafts: DraftRecord[] = [];
  notifications: NotificationRecord[] = [];
  system: Record<string, { value: string; by: string; at: string; note: string }> = {};

  activeUserId: string = 'U4'; // Defaults to Hana Rosli (HR A)
  menuStyle: MenuStyle = 'dock';

  // 'demo' = synthetic data in localStorage. 'live' = signed-in Google user, data in their Drive.
  mode: 'demo' | 'live' = 'demo';
  liveEmail = '';
  // Set by the app in live mode: persists data to Drive and runs real Gmail / Calendar actions.
  onLiveSave: ((data: any) => void) | null = null;
  onSideEffect: ((e: SideEffect) => void) | null = null;

  constructor() {
    this.load();
  }

  isLive(): boolean {
    return this.mode === 'live';
  }

  // Draft subject tag: demo drafts are clearly marked as dummy.
  tag(): string {
    return this.isLive() ? '[Oneness]' : '[Oneness DUMMY]';
  }

  footer(): string {
    return this.isLive()
      ? 'Prepared by Oneness. Draft only, please review before sending.'
      : 'Generated by Oneness prototype with synthetic data. Please review before sending.';
  }

  private clearData() {
    this.users = [];
    this.employees = [];
    this.rules = {};
    this.cases = [];
    this.tasks = [];
    this.evidence = [];
    this.auditLog = [];
    this.changes = [];
    this.leave = [];
    this.claims = [];
    this.learning = [];
    this.samples = [];
    this.files = [];
    this.drafts = [];
    this.notifications = [];
    this.system = {};
  }

  startDemo() {
    this.mode = 'demo';
    this.liveEmail = '';
    this.onLiveSave = null;
    this.onSideEffect = null;
    this.clearData();
    this.load();
  }

  // Live workspace for a real Google user. `data` is the JSON loaded from Drive (null on first sign-in).
  startLive(profile: { email: string; name: string }, data: any | null) {
    this.mode = 'live';
    this.liveEmail = profile.email;
    this.clearData();
    if (data && typeof data === 'object') {
      const { mode: _m, liveEmail: _l, onLiveSave: _s, onSideEffect: _e, ...rest } = data;
      Object.assign(this, rest);
    } else {
      // Policy defaults. HR should review these before relying on them.
      this.rules = {
        notice_Executive: '1',
        'notice_Senior Executive': '2',
        notice_Manager: '2',
        'notice_Senior Manager': '3',
        cap_GP: '3000',
        cap_Specialist: '5000',
        cap_Hospitalisation: '30000',
        learning_budget: '5000',
      };
      this.setSys('estop', 'off');
    }
    let me = this.users.find(u => u.email.toLowerCase() === profile.email);
    if (!me) {
      // First person in a workspace becomes its admin. Later people get no roles until assigned.
      const first = this.users.length === 0;
      me = {
        userId: `G-${this.users.length + 1}`,
        name: profile.name,
        email: profile.email,
        roles: first ? ['HR Ops', 'Benefits', 'Payroll', 'Learning', 'Engagement', 'Performance', 'IR'] : [],
        code: first ? 'Admin' : 'Pending',
        level: first ? 'Admin' : 'Staff',
        title: first ? 'Workspace admin' : 'Awaiting role assignment',
      };
      this.users.push(me);
    }
    this.activeUserId = me.userId;
    this.audit('', 'Signed in with Google', profile.email, me.name);
  }

  importEmployeesCsv(csv: string): { ok: boolean; count?: number; error?: string } {
    const rows = parseCsv(csv).filter(r => r.some(c => c.trim()));
    if (rows.length < 2) return { ok: false, error: 'CSV needs a header row and at least one employee.' };
    const head = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
    const col = (k: string) => head.indexOf(k);
    const missing = ['empid', 'name', 'email'].filter(k => col(k) < 0);
    if (missing.length) return { ok: false, error: `Missing column(s): ${missing.join(', ')}` };
    const get = (r: string[], k: string) => (col(k) >= 0 ? (r[col(k)] || '').trim() : '');
    const byId = new Map(this.employees.map(e => [e.empId, e]));
    let count = 0;
    rows.slice(1).forEach(r => {
      const empId = get(r, 'empid');
      if (!empId) return;
      const grade = get(r, 'grade') || 'Executive';
      const dept = get(r, 'dept') || get(r, 'department');
      const status = get(r, 'status') as Employee['status'];
      byId.set(empId, {
        empId,
        name: get(r, 'name'),
        position: get(r, 'position') || [grade, dept].filter(Boolean).join(', '),
        dept,
        grade,
        manager: get(r, 'manager'),
        joinDate: get(r, 'joindate') || todayIso(),
        category: /^union$/i.test(get(r, 'category')) ? 'Union' : 'Non-union',
        status: ['Active', 'On notice', 'Resigned', 'Probation'].includes(status) ? status : 'Active',
        email: get(r, 'email').toLowerCase(),
      });
      count++;
    });
    this.employees = Array.from(byId.values());
    this.audit('', 'Employee master imported', `${count} employee(s) from CSV`);
    return { ok: true, count };
  }

  load() {
    try {
      const saved = localStorage.getItem('oneness_store_v1');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this, data);
        const m = localStorage.getItem('oneness.menu') as MenuStyle;
        if (m) this.menuStyle = m;
        return;
      }
    } catch {
      // ignore
    }
    this.seedAll();
  }

  save() {
    try {
      const data = {
        users: this.users,
        employees: this.employees,
        rules: this.rules,
        cases: this.cases,
        tasks: this.tasks,
        evidence: this.evidence,
        auditLog: this.auditLog,
        changes: this.changes,
        leave: this.leave,
        claims: this.claims,
        learning: this.learning,
        samples: this.samples,
        files: this.files,
        drafts: this.drafts,
        notifications: this.notifications,
        system: this.system,
        activeUserId: this.activeUserId,
        menuStyle: this.menuStyle,
      };
      if (this.isLive()) {
        // Never mix live data into the demo store. Drive is the source of truth.
        this.onLiveSave?.(data);
        return;
      }
      localStorage.setItem('oneness_store_v1', JSON.stringify(data));
      localStorage.setItem('oneness.menu', this.menuStyle);
    } catch {
      // ignore
    }
  }

  currentUser(): User {
    const u = this.users.find(x => x.userId === this.activeUserId);
    return u || this.users[0];
  }

  setActAs(userId: string): User {
    const u = this.users.find(x => x.userId === userId) || this.users[0];
    this.activeUserId = u.userId;
    this.audit('', this.isLive() ? 'Signed in' : 'Act-as switched (demo)', u.userId, u.name);
    this.save();
    return u;
  }

  can(role: string): boolean {
    const u = this.currentUser();
    return u.roles.includes(role) || u.level === 'Admin';
  }

  owners(type: ModuleType): string[] {
    const t = TEMPLATES[type];
    if (!t) return [];
    const set = new Set<string>();
    t.tasks.forEach(task => set.add(task.role));
    return Array.from(set);
  }

  canStart(type: ModuleType): boolean {
    const u = this.currentUser();
    if (u.level === 'Admin') return true;
    return this.owners(type).some(r => u.roles.includes(r));
  }

  caseVisible(c: Case): boolean {
    const t = TEMPLATES[c.type];
    if (!t) return false;
    if (t.restricted && !this.can('IR')) return false;
    return this.canStart(c.type);
  }

  audit(caseId: string, action: string, detail: string, userName?: string, role?: string) {
    const u = userName || this.currentUser().name;
    const c = caseId ? this.cases.find(x => x.caseId === caseId) : null;
    const r = role || (c && TEMPLATES[c.type] ? TEMPLATES[c.type].tasks[0].role : '');
    const item: AuditRecord = {
      auditId: `A-${100000 + this.auditLog.length + 1}`,
      at: nowStr(),
      user: u,
      caseId: caseId || '',
      action,
      detail: detail || '',
      role: r,
    };
    this.auditLog.unshift(item);
    this.save();
  }

  addEvidence(caseId: string, taskId: string, label: string, source: string, ref: string, by?: string) {
    const item: EvidenceItem = {
      evId: `EV-${1000 + this.evidence.length + 1}`,
      caseId,
      taskId: taskId || '',
      label,
      source: source || 'HR note',
      by: by || this.currentUser().name,
      at: nowStr(),
      ref: ref || '',
    };
    this.evidence.push(item);
    this.save();
  }

  saveDraft(subject: string, body: string, meta: { caseId?: string; empId?: string; to?: string; cc?: string; attach?: string; role?: string }, status: 'Draft' | 'Sent by user' | 'Deleted' = 'Draft'): string {
    const id = `D-${2000 + this.drafts.length + 1}`;
    const draft: DraftRecord = {
      draftId: id,
      caseId: meta.caseId || '',
      empId: meta.empId || '',
      at: nowStr(),
      by: this.currentUser().name,
      to: meta.to || '',
      cc: meta.cc || (this.isLive() ? '' : 'hr.ops@example.com'),
      subject,
      body,
      attach: meta.attach || '',
      status,
      role: meta.role || '',
    };
    this.drafts.unshift(draft);
    this.save();
    if (this.isLive() && status === 'Draft') this.onSideEffect?.({ kind: 'draft', draftId: id });
    return id;
  }

  addFile(caseId: string, empId: string, name: string, kind: 'source' | 'generated', text: string, status: 'Filed' | 'Draft' | 'Review' = 'Filed', url: string = ''): string {
    const id = `F-${3000 + this.files.length + 1}`;
    const f: FileRecord = {
      fileId: id,
      caseId: caseId || '',
      empId: empId || '',
      name,
      kind,
      text,
      at: nowStr(),
      by: this.currentUser().name,
      status,
      url,
    };
    this.files.unshift(f);
    this.save();
    return id;
  }

  // System & Emergency Stop
  getSys(k: string): string {
    return this.system[k]?.value || '';
  }

  setSys(k: string, v: string, note?: string) {
    this.system[k] = {
      value: String(v),
      by: this.currentUser()?.name || 'system',
      at: nowStr(),
      note: note || '',
    };
    this.save();
  }

  isEmergencyStop(): boolean {
    return this.getSys('estop') === 'on';
  }

  emergencyStop(reason: string, by?: string): { ok: boolean; error?: string } {
    const r = String(reason || '').trim();
    if (!r) return { ok: false, error: 'Give a short reason (recorded in audit).' };
    if (this.isEmergencyStop()) return { ok: true };
    const user = by || this.currentUser().name;
    this.setSys('estop', 'on', r);
    this.setSys('estop_reason', r);
    this.setSys('estop_by', user);
    this.audit('', 'EMERGENCY STOP activated', `${r} | by ${user}`, user);
    this.notifyLevels(['Manager', 'HOD', 'Admin'], `EMERGENCY STOP: ${r}`, user);
    return { ok: true };
  }

  resumeSystem(reason: string): { ok: boolean; error?: string } {
    const u = this.currentUser();
    if (!['HOD', 'Admin'].includes(u.level)) {
      return { ok: false, error: 'Only a HOD or Admin can resume after an emergency stop.' };
    }
    const r = String(reason || '').trim();
    if (!r) return { ok: false, error: 'Give a reason for resuming (recorded in audit).' };
    this.setSys('estop', 'off');
    this.setSys('resumedAt', nowStr());
    this.setSys('fail_gmail', '0');
    this.setSys('fail_calendar', '0');
    this.setSys('fail_drive', '0');
    this.audit('', 'System RESUMED after emergency stop', r);
    return { ok: true };
  }

  notify(role: string, caseId: string, message: string, from?: string) {
    const targets = this.users.filter(x => x.roles.includes(role) && ['Staff', 'Manager'].includes(x.level));
    targets.forEach(x => {
      const n: NotificationRecord = {
        notifId: `N-${1000 + this.notifications.length + 1}`,
        at: nowStr(),
        toRole: role,
        toUser: x.userId,
        caseId: caseId || '',
        message,
        from: from || 'Oneness',
        read: 'no',
      };
      this.notifications.unshift(n);
    });
    this.save();
  }

  notifyLevels(levels: string[], message: string, from?: string) {
    const targets = this.users.filter(x => levels.includes(x.level));
    targets.forEach(x => {
      const n: NotificationRecord = {
        notifId: `N-${1000 + this.notifications.length + 1}`,
        at: nowStr(),
        toRole: x.level,
        toUser: x.userId,
        caseId: '',
        message,
        from: from || 'Oneness',
        read: 'no',
      };
      this.notifications.unshift(n);
    });
    this.save();
  }

  // Watchdog
  watchdog(): { checks: Array<{ id: string; label: string; level: 'ok' | 'warn' | 'critical'; detail: string }>; worst: 'ok' | 'warn' | 'critical' } {
    const checks: Array<{ id: string; label: string; level: 'ok' | 'warn' | 'critical'; detail: string }> = [];
    const since = nowStr(new Date(Date.now() - 10 * 60000));

    // Connectors
    ['gmail', 'calendar', 'drive'].forEach(k => {
      const n = +this.getSys(`fail_${k}`) || 0;
      const nm = k === 'gmail' ? 'Gmail' : k === 'calendar' ? 'Calendar' : 'Drive';
      checks.push({
        id: `conn_${k}`,
        label: `${nm} connector`,
        level: n >= 3 ? 'critical' : n > 0 ? 'warn' : 'ok',
        detail: n >= 3
          ? `${n} failures in a row. Actions that depend on it are unreliable.`
          : n > 0
          ? `${n} recent failure(s). Watching.`
          : 'Simulated (Workspace actions off in this demo)',
      });
    });

    // Automation rate
    const autoCount = this.auditLog.filter(a => a.user === 'Oneness' && a.at >= since).length;
    checks.push({
      id: 'rate',
      label: 'Automation rate (last 10 min)',
      level: autoCount > 40 ? 'critical' : autoCount > 24 ? 'warn' : 'ok',
      detail: `${autoCount} automated actions (limit 40). A runaway process would be stopped.`,
    });

    // Process integrity
    const empIds = new Set(this.employees.map(e => e.empId));
    const caseMap = new Map(this.cases.map(c => [c.caseId, c]));
    const taskIds = new Set(this.tasks.map(t => t.taskId));

    const orphanTasks = this.tasks.filter(t => !caseMap.has(t.caseId)).length;
    const orphanCases = this.cases.filter(c => c.empId && !empIds.has(c.empId)).length;
    const badDeps = this.tasks.filter(t => t.deps && t.deps.some(d => !taskIds.has(d))).length;
    const closedWithOpenTasks = this.cases.filter(c => {
      const open = this.tasks.filter(t => t.caseId === c.caseId && !['Completed', 'Verified'].includes(t.status)).length;
      return (c.status === 'Closed' || c.status === 'Awaiting verification') && open > 0;
    }).length;

    const integCount = orphanTasks + orphanCases + badDeps + closedWithOpenTasks;
    checks.push({
      id: 'integrity',
      label: 'Process integrity',
      level: integCount ? 'critical' : 'ok',
      detail: integCount
        ? `${integCount} inconsistency(ies): orphan tasks ${orphanTasks}, cases with unknown employee ${orphanCases}, broken dependencies ${badDeps}, closed/verifying with open tasks ${closedWithOpenTasks}.`
        : 'Cases, tasks and dependencies are consistent.',
    });

    // Duplicate open cases
    const seen = new Set<string>();
    let dupCount = 0;
    this.cases.filter(c => c.status !== 'Closed').forEach(c => {
      const k = `${c.type}|${c.empId}`;
      if (c.empId && seen.has(k)) dupCount++;
      seen.add(k);
    });
    checks.push({
      id: 'dup',
      label: 'Duplicate open cases',
      level: dupCount ? 'warn' : 'ok',
      detail: dupCount ? `${dupCount} possible duplicate(s) (same employee and type).` : 'None',
    });

    // Escalations
    const escCount = this.tasks.filter(t => t.status === 'Escalated').length;
    checks.push({
      id: 'esc',
      label: 'Escalations waiting for a human',
      level: escCount > 5 ? 'warn' : 'ok',
      detail: `${escCount} escalated task(s).`,
    });

    // Overdue tasks
    const today = todayIso();
    const overdueCount = this.tasks.filter(t => {
      const c = caseMap.get(t.caseId);
      return c && c.status !== 'Closed' && !['Completed', 'Verified'].includes(t.status) && t.due && t.due < today;
    }).length;
    checks.push({
      id: 'overdue',
      label: 'Overdue tasks',
      level: overdueCount > 8 ? 'warn' : 'ok',
      detail: `${overdueCount} task(s) past due date.`,
    });

    const worst = checks.some(c => c.level === 'critical')
      ? 'critical'
      : checks.some(c => c.level === 'warn')
      ? 'warn'
      : 'ok';

    return { checks, worst };
  }

  runWatchdog() {
    const w = this.watchdog();
    if (w.worst === 'critical' && !this.isEmergencyStop()) {
      const bad = w.checks
        .filter(c => c.level === 'critical')
        .map(c => `${c.label}: ${c.detail}`)
        .join(' | ');
      this.emergencyStop(`Watchdog: ${bad}`, 'Watchdog');
    }
    return w;
  }

  simulateFailure(kind: 'gmail' | 'runaway' | 'corrupt') {
    if (kind === 'gmail') {
      this.setSys('fail_gmail', '3', 'SIMULATED outage');
      this.audit('', 'SIMULATED Gmail outage', 'Demo control');
    } else if (kind === 'runaway') {
      for (let i = 0; i < 48; i++) {
        this.auditLog.unshift({
          auditId: `A-S${i}-${Date.now()}`,
          at: nowStr(),
          user: 'Oneness',
          caseId: '',
          action: 'Simulated runaway action',
          detail: 'Demo control',
          role: 'HR Ops',
        });
      }
    } else if (kind === 'corrupt') {
      const c = this.cases.find(x => x.status !== 'Closed');
      if (c) {
        c.status = 'Closed';
        this.audit(c.caseId, 'SIMULATED corruption', 'Case marked Closed with open tasks (demo)');
      }
    }
    return this.runWatchdog();
  }

  // Next ID helpers
  nextCaseId(prefix: string): string {
    const y = new Date().getFullYear();
    const count = this.cases.filter(c => c.caseId.startsWith(`${prefix}-`)).length + 1;
    let n = count;
    let id = `${prefix}-${y}-${('0000' + n).slice(-4)}`;
    while (this.cases.some(c => c.caseId === id)) {
      n++;
      id = `${prefix}-${y}-${('0000' + n).slice(-4)}`;
    }
    return id;
  }

  createCase(type: ModuleType, empId: string, o: Partial<Case> = {}): Case {
    const tpl = TEMPLATES[type];
    const id = this.nextCaseId(tpl.prefix);
    const emp = empId ? this.employees.find(e => e.empId === empId) : null;

    const c: Case = {
      caseId: id,
      type,
      empId: empId || '',
      title: o.title || `${tpl.label}${emp ? ' - ' + emp.name : ''}`,
      status: 'Open',
      stage: tpl.tasks[0].t,
      owner: o.owner || this.currentUser().name,
      priority: o.priority || 'Normal',
      source: o.source || 'Manual',
      opened: o.opened || todayIso(),
      keyDate: o.keyDate || '',
      blocker: '',
      validation: o.validation || 'Not validated',
      evidence: 'None',
      exception: o.exception || '',
      payload: typeof o.payload === 'object' ? JSON.stringify(o.payload) : o.payload || '{}',
      outcome: o.outcome || '',
    };

    const caseTasks: Task[] = tpl.tasks.map((t, i) => ({
      taskId: `${id}-T${i + 1}`,
      caseId: id,
      seq: i + 1,
      title: t.t,
      ownerRole: t.role,
      kind: t.kind,
      deps: t.deps.map(d => `${id}-T${d + 1}`),
      status: 'Not Started',
      due: addDays(c.opened, 2 * (i + 1)),
      note: '',
      done: '',
      options: t.options || '',
      action: t.action || '',
    }));

    this.cases.unshift(c);
    this.tasks.push(...caseTasks);
    this.audit(id, 'Case created', `${c.title} | source: ${c.source}`, o.owner || this.currentUser().name);

    this.save();
    return c;
  }

  tasksOf(caseId: string): Task[] {
    return this.tasks.filter(t => t.caseId === caseId).sort((a, b) => a.seq - b.seq);
  }

  decorateTasks(tasks: Task[]): Task[] {
    const byId = new Map(tasks.map(t => [t.taskId, t]));
    const u = this.currentUser();

    return tasks.map(t => {
      const deps = t.deps || [];
      const waitingOn = deps
        .map(d => byId.get(d))
        .filter((dep): dep is Task => !!dep && !['Completed', 'Verified'].includes(dep.status))
        .map(dep => dep.title);

      const isCompleted = ['Completed', 'Verified'].includes(t.status);
      const ready = !isCompleted && waitingOn.length === 0;
      const state: Task['status'] = isCompleted
        ? t.status
        : t.status === 'Escalated'
        ? 'Escalated'
        : ready
        ? (t.status === 'Not Started' ? 'Ready' : t.status)
        : 'Waiting';

      const canAct = u.level === 'Admin' || u.roles.includes(t.ownerRole);

      return {
        ...t,
        ready,
        state,
        waitingOn,
        canAct,
      };
    });
  }

  refreshCase(caseId: string) {
    const c = this.cases.find(x => x.caseId === caseId);
    if (!c || c.status === 'Closed') return;

    const ts = this.decorateTasks(this.tasksOf(caseId));
    const open = ts.filter(t => !['Completed', 'Verified'].includes(t.status));
    const evCount = this.evidence.filter(e => e.caseId === caseId).length;

    c.evidence = evCount ? `${evCount} item(s)` : 'None';

    if (!open.length) {
      c.status = c.status === 'Verified' ? 'Verified' : 'Awaiting verification';
      c.stage = 'Ready to verify';
      c.blocker = '';
    } else {
      const esc = open.find(t => t.state === 'Escalated');
      const ready = open.find(t => t.ready);
      c.status = esc ? 'Escalated' : 'In progress';
      c.stage = (esc || ready || open[0]).title;
      const blocked = open.find(t => !t.ready);
      c.blocker = esc ? `Escalated: ${esc.title}` : (!ready && blocked ? `Waiting on: ${(blocked.waitingOn || []).join(', ')}` : '');
    }
    this.save();
  }

  runTask(caseId: string, taskId: string): { ok: boolean; error?: string; escalated?: boolean; note?: string } {
    if (this.isEmergencyStop()) {
      return { ok: false, error: `EMERGENCY STOP is active. (${this.getSys('estop_reason')})` };
    }
    const c = this.cases.find(x => x.caseId === caseId);
    const ts = this.decorateTasks(this.tasksOf(caseId));
    const t = ts.find(x => x.taskId === taskId);
    if (!c || !t) return { ok: false, error: 'Task not found.' };
    if (t.kind !== 'auto') return { ok: false, error: 'This task needs a human. Oneness will not run it.' };
    if (!t.ready) return { ok: false, error: `Not ready. Waiting on: ${(t.waitingOn || []).join(', ')}` };

    const emp = this.employees.find(e => e.empId === c.empId);
    let note = '';
    let passed = true;

    const action = t.action || '';
    if (action.startsWith('check:')) {
      const checkKind = action.split(':')[1];
      const payload = JSON.parse(c.payload || '{}');
      if (checkKind === 'leave') {
        const lv = this.leave.find(l => l.empId === c.empId && l.type === 'Annual');
        note = lv ? `Annual leave balance: ${lv.balance} day(s). Clear or encash before ${c.keyDate} (per policy, HR to confirm).` : 'No leave record found.';
      } else if (checkKind === 'leaveReq') {
        const lv = this.leave.find(l => l.empId === c.empId && l.type === (payload.leaveType || 'Annual'));
        const days = Number(payload.days || 1);
        if (!lv) {
          passed = false;
          note = 'No entitlement record for this leave type.';
        } else if (lv.balance >= days) {
          note = `${days} day(s) requested, balance ${lv.balance}. Within entitlement.`;
        } else {
          passed = false;
          note = `Requested ${days} day(s) but balance is only ${lv.balance}. Needs exception decision.`;
        }
      } else if (checkKind === 'claimCap') {
        const type = payload.claimType || 'GP';
        const cap = Number(this.rules[`cap_${type}`] || 3000);
        const used = this.claims.filter(x => x.empId === c.empId && x.claimType === type && x.status !== 'Rejected').reduce((s, x) => s + x.amount, 0);
        const amt = Number(payload.amount || 0);
        if (used + amt <= cap) {
          note = `${type}: used RM${used} + RM${amt} = RM${used + amt} of RM${cap} cap. Within entitlement.`;
        } else {
          passed = false;
          note = `${type} cap RM${cap} exceeded: used RM${used} + claim RM${amt}. Policy exception.`;
        }
      } else if (checkKind === 'learning') {
        const joinDate = emp ? parseIso(emp.joinDate).getTime() : Date.now();
        const years = (Date.now() - joinDate) / 31557600000;
        const budget = Number(this.rules['learning_budget'] || 5000);
        const cost = Number(payload.cost || 0);
        if (years < 1) {
          passed = false;
          note = 'Service under 1 year. Not eligible per dummy rule.';
        } else if (cost <= budget) {
          note = `Eligible. Cost RM${cost} within RM${budget} budget.`;
        } else {
          passed = false;
          note = `Cost RM${cost} exceeds RM${budget} budget. Exception.`;
        }
      }
    } else if (action.startsWith('draft:')) {
      const isMgr = action.endsWith('manager');
      const toName = isMgr ? (emp?.manager || 'Manager') : (emp?.name || 'Employee');
      const toEmail = isMgr
        ? (this.employees.find(e => e.name === emp?.manager)?.email || (this.isLive() ? '' : 'manager@example.com'))
        : (emp?.email || (this.isLive() ? '' : 'employee@example.com'));
      const draftId = this.saveDraft(
        `${this.tag()} ${c.title}`,
        `Hi ${toName},\n\nThis is a system-generated draft for case ${c.caseId} (${c.title}).\nKey date: ${c.keyDate || 'TBC'}\n\n${this.footer()}`,
        { caseId: c.caseId, empId: c.empId, to: toEmail, role: t.ownerRole }
      );
      note = `Gmail draft prepared (to yourself): ${this.tag()} ${c.title} [${draftId}]`;
    } else if (action.startsWith('calendar:')) {
      const date = c.keyDate || todayIso();
      note = this.isLive()
        ? `Calendar event requested on your Google Calendar: ${c.title} (${date})`
        : `Calendar event created: ${c.title} (${date})`;
      if (this.isLive()) this.onSideEffect?.({ kind: 'calendar', caseId: c.caseId, date, summary: `${this.tag()} ${c.title}` });
    }

    const realTask = this.tasks.find(x => x.taskId === taskId)!;
    if (!passed) {
      realTask.status = 'Escalated';
      realTask.note = note;
      c.exception = note;
      c.priority = 'Urgent';
      this.audit(caseId, 'Escalated by rule check', `${t.title} | ${note}`, 'Oneness', t.ownerRole);
      this.refreshCase(caseId);
      return { ok: false, escalated: true, note };
    }

    realTask.status = 'Completed';
    realTask.note = note;
    realTask.done = todayIso();
    this.addEvidence(caseId, taskId, t.title, 'Oneness (deterministic)', note, 'Oneness');
    this.audit(caseId, 'Task auto-completed', `${t.title} | ${note}`, 'Oneness', t.ownerRole);
    this.refreshCase(caseId);
    return { ok: true, note };
  }

  completeTask(caseId: string, taskId: string, p: { note: string; decision?: string }): { ok: boolean; error?: string; spawned?: string } {
    if (this.isEmergencyStop()) {
      return { ok: false, error: `EMERGENCY STOP is active. (${this.getSys('estop_reason')})` };
    }
    const c = this.cases.find(x => x.caseId === caseId);
    const ts = this.decorateTasks(this.tasksOf(caseId));
    const t = ts.find(x => x.taskId === taskId);
    if (!c || !t) return { ok: false, error: 'Task not found.' };
    if (['Completed', 'Verified'].includes(t.status)) return { ok: false, error: 'Already completed.' };
    if (!this.can(t.ownerRole)) return { ok: false, error: `Your role does not allow this task (needs: ${t.ownerRole}).` };
    if (!t.ready && t.state !== 'Escalated') return { ok: false, error: `Not ready. Waiting on: ${(t.waitingOn || []).join(', ')}` };
    if (!p.note || !p.note.trim()) return { ok: false, error: 'Add a short note. Evidence first: every completion needs a reason or proof.' };
    if (t.kind === 'decision' && !p.decision) return { ok: false, error: 'Choose a decision.' };

    const override = t.state === 'Escalated';
    const realTask = this.tasks.find(x => x.taskId === taskId)!;
    realTask.status = 'Completed';
    realTask.note = (p.decision ? `${p.decision}: ` : '') + p.note;
    realTask.done = todayIso();

    this.addEvidence(caseId, taskId, (override ? 'OVERRIDE - ' : '') + t.title, 'HR note', p.note);
    this.audit(
      caseId,
      override ? 'Human override of escalation' : t.kind === 'decision' ? 'Decision made' : 'Task completed',
      `${t.title}${p.decision ? ' -> ' + p.decision : ''} | ${p.note}`
    );

    let spawned: string | undefined = undefined;
    if (c.type === 'resignation' && /replacement required/i.test(t.title) && p.decision === 'Replace') {
      const emp = this.employees.find(e => e.empId === c.empId);
      const rc = this.createCase('recruitment', c.empId, {
        title: `Replace ${emp ? emp.position + ' (' + emp.name + ')' : ''}`,
        source: `From ${caseId}`,
        priority: 'Normal',
      });
      spawned = rc.caseId;
      this.audit(caseId, 'Downstream case created', `Replacement -> ${rc.caseId}`, 'Oneness');
    }

    if (c.exception && override) {
      c.exception = `${c.exception} [Resolved by HR override]`;
      c.priority = 'High';
    }

    this.refreshCase(caseId);
    return { ok: true, spawned };
  }

  verifyCase(caseId: string): { ok: boolean; outcome?: string; missing?: string[]; error?: string } {
    if (this.isEmergencyStop()) {
      return { ok: false, error: `EMERGENCY STOP is active. (${this.getSys('estop_reason')})` };
    }
    const c = this.cases.find(x => x.caseId === caseId);
    if (!c) return { ok: false, error: 'Case not found.' };

    const ts = this.tasksOf(caseId);
    const evs = this.evidence.filter(e => e.caseId === caseId);
    const missing: string[] = [];

    ts.forEach(t => {
      if (!['Completed', 'Verified'].includes(t.status)) {
        missing.push(`Task not completed: ${t.title}`);
      } else if (!evs.some(e => e.taskId === t.taskId) && !t.note) {
        missing.push(`No evidence for: ${t.title}`);
      }
    });

    if (c.type === 'resignation' && !c.validation.includes('Confirmed')) {
      missing.push('Resignation details not confirmed by HR');
    }

    if (missing.length) {
      this.audit(caseId, 'Verification failed', missing.join(' | '));
      return { ok: false, missing };
    }

    const outcomes: Record<string, string> = {
      resignation: 'Resignation acknowledged, parties notified, Ramco updated, exit handled.',
      leave: 'Leave decision recorded and employee informed.',
      claim: 'Claim decided and TPA/record updated.',
      onboarding: 'Starter fully onboarded.',
      recruitment: 'Vacancy handled to offer/close.',
      payroll: 'Discrepancy corrected and verified in payroll.',
      learning: 'Training completed and documented.',
      er: 'ER case concluded with documented outcome.',
    };

    c.status = 'Closed';
    c.stage = 'Closed';
    c.blocker = '';
    c.outcome = outcomes[c.type] || 'Done';

    this.audit(caseId, 'Outcome verified and case closed', c.outcome);
    this.save();
    return { ok: true, outcome: c.outcome };
  }

  // Sense classification & extraction
  sense(p: { text?: string; name?: string }): SenseResult {
    const text = String(p.text || '');
    const name = String(p.name || '');
    const all = `${text}\n${name}`;
    const flags: Array<{ level: 'stop' | 'warn' | 'ok'; text: string; dup?: string }> = [];
    const needs: string[] = [];

    if (!text.trim() && !name.trim()) {
      return {
        event: 'unknown',
        eventLabel: 'Empty input',
        confidence: 'Low',
        confidenceScore: 0,
        fields: [],
        flags: [{ level: 'stop', text: 'Nothing to sense. Drop a file or paste text.' }],
        needs: [],
        proposedTasks: [],
        nothingCreated: true,
      };
    }

    // Classify event
    const EVENT_PATTERNS: Record<string, RegExp[]> = {
      resignation: [/resign/i, /last working (day|date)/i, /notice period/i, /final day/i, /move on to/i, /tender/i, /last day (with|at|of)/i, /\bresi\w{0,3}n/i],
      leave: [/annual leave/i, /leave request/i, /apply for .{0,20}leave/i, /medical leave|sick leave/i, /\bleave\b.{0,40}\bdays?\b/i],
      claim: [/claim/i, /clinic/i, /receipt/i, /diagnos/i, /hospital/i, /specialist/i, /invoice/i, /panel/i],
      onboarding: [/offer (letter )?accepted/i, /new (joiner|starter)/i, /joining date/i, /will be joining/i],
      learning: [/training/i, /course/i, /workshop/i, /certification/i, /hrdc/i],
      payroll: [/payslip|salary|allowance/i, /overpaid|underpaid|deduction/i, /payroll/i],
      er: [/complain|harass|grievance|misconduct|bully/i],
      promotion: [/promot/i, /recommend.{0,30}(grade|position)|new grade/i],
      confirmation: [/confirmation of (service|employment|probation)|confirm.{0,30}probation/i, /probation(ary)? (period|review|end)/i],
      maternity: [/maternity|pregnan|confinement/i, /allowance|expected delivery|due date/i],
      socso: [/socso|perkeso/i, /accident|injury|invalidity/i],
      salaryletter: [/salary confirmation|confirmation of salary/i, /confirmation letter|letter.{0,15}(bank|loan)/i],
      trainreg: [/register(ed)? (me )?for .{0,40}(training|course|workshop)|training registration/i, /seat|participant/i],
    };

    let bestType: ModuleType | null = null;
    let bestScore = 0;
    Object.keys(EVENT_PATTERNS).forEach(k => {
      const matchCount = EVENT_PATTERNS[k].filter(re => re.test(all)).length;
      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestType = k as ModuleType;
      }
    });

    if (!bestType) {
      return {
        event: 'unknown',
        eventLabel: 'Unrecognised document',
        confidence: 'Low',
        confidenceScore: 0.2,
        fields: [],
        flags: [{ level: 'stop', text: 'I could not tell what happened from this document.' }],
        needs: ['Tell me what this is, or use a different file.'],
        proposedTasks: [],
        nothingCreated: true,
      };
    }

    // Check garble
    const garbleCount = (text.replace(/[A-Za-z0-9\s.,:;'"()/\-@#&]/g, '').length + (text.match(/[A-Za-z]\d[A-Za-z]/g) || []).length);
    const garbleRatio = text.length ? garbleCount / text.length : 0;
    const poor = garbleRatio > 0.06;
    if (poor) {
      flags.push({ level: 'warn', text: 'Poor scan quality. Extracted values may be wrong. Check every field.' });
    }

    // Match employees
    const empMatches: Array<{ id: string; emp: Employee | null; byId?: boolean; byName?: boolean }> = [];
    const idMatches = all.match(/EMP-\d{4}/gi) || [];
    const low = all.toLowerCase();

    idMatches.forEach(id => {
      const clean = id.toUpperCase();
      const found = this.employees.find(e => e.empId === clean) || null;
      empMatches.push({ id: clean, emp: found, byId: true });
    });

    this.employees.forEach(e => {
      if (low.includes(e.name.toLowerCase())) {
        const existing = empMatches.find(m => m.id === e.empId);
        if (existing) {
          existing.byName = true;
        } else {
          empMatches.push({ id: e.empId, emp: e, byName: true });
        }
      }
    });

    const emp = empMatches.length === 1 ? empMatches[0].emp : null;
    if (empMatches.length > 1) {
      flags.push({ level: 'stop', text: `More than one employee found (${empMatches.map(m => m.id).join(', ')}). I will not guess. Pick one or split the document.` });
    } else if (!empMatches.length) {
      flags.push({ level: 'stop', text: 'No employee identified. Check the staff ID or name.' });
    } else if (!emp) {
      flags.push({ level: 'stop', text: `${empMatches[0].id} does not exist in the employee record.` });
    }

    const fields: SenseResult['fields'] = [];
    let conf = 0.4 + Math.min(bestScore, 3) * 0.08;

    if (emp) {
      conf += 0.15;
      fields.push({
        key: 'employee',
        label: 'Employee',
        value: `${emp.name} (${emp.empId})`,
        state: 'authoritative',
        note: empMatches[0].byId && empMatches[0].byName
          ? 'Staff ID and name both match Ramco'
          : empMatches[0].byId
          ? 'Matched by staff ID only'
          : 'Matched by name only. Staff ID not in document',
      });
      fields.push({
        key: 'position',
        label: 'Position / Dept',
        value: `${emp.position} / ${emp.dept}`,
        state: 'authoritative',
        note: 'From Ramco (dummy)',
      });
      fields.push({
        key: 'manager',
        label: 'Reporting to',
        value: emp.manager,
        state: 'authoritative',
        note: 'From Ramco (dummy)',
      });
      if (!empMatches[0].byId) {
        needs.push('Staff ID is not in the document. Confirm this is the right person.');
      }
    }

    const dates = this.extractDates(all);
    let suggested: any = {};

    if (bestType === 'resignation') {
      const lwdRe = /(last (working )?(day|date)|final day|effective)/gi;
      let lwd: { iso: string; index: number } | null = null;
      let m: RegExpExecArray | null;
      let bestDist = 1e9;
      while ((m = lwdRe.exec(all))) {
        for (const d of dates) {
          const dist = d.index - (m.index + m[0].length);
          if (dist >= 0 && dist < 120 && dist < bestDist) {
            bestDist = dist;
            lwd = d;
          }
        }
      }
      const lwdObj: { iso: string; index: number } | null = lwd;
      const docDate = dates.find(d => !lwdObj || d.iso !== lwdObj.iso || d.index !== lwdObj.index) || null;

      const nm = /notice[^.\n]{0,50}?(\d+)\s*(month|week)/i.exec(all) || /(\d+)[\s-]*(month|week)s?'?\s*notice/i.exec(all);
      let notice: number | null = null;
      if (nm) {
        notice = nm[2].toLowerCase() === 'week' ? +(Number(nm[1]) / 4.33).toFixed(2) : Number(nm[1]);
      }

      const rs = /reason[^:]{0,15}:\s*([^\n.]+)/i.exec(all);
      const reason = rs ? rs[1].trim() : '';

      const unusual = !/resign/i.test(all);
      if (unusual) {
        flags.push({ level: 'warn', text: 'The word "resign" is not used. I inferred a resignation from the wording. Confirm it really is one.' });
      }

      if (emp) {
        const dup = this.cases.find(c => c.type === 'resignation' && c.empId === emp.empId && c.status !== 'Closed');
        if (dup) {
          flags.push({ level: 'stop', text: `Duplicate: ${emp.name} already has an open resignation case (${dup.caseId}). Nothing will be created.`, dup: dup.caseId });
        }
        if (emp.status === 'Resigned') {
          flags.push({ level: 'stop', text: `${emp.name} is already marked Resigned in Ramco. Check before creating anything.` });
        }
      }

      fields.push({
        key: 'resignationDate',
        label: 'Resignation date',
        value: docDate ? docDate.iso : '',
        state: docDate ? 'extracted' : 'missing',
        note: docDate ? 'Document date, used as notice start' : 'No date found',
      });
      fields.push({
        key: 'noticeStated',
        label: 'Notice in letter',
        value: notice != null ? `${notice} month(s)` : '',
        state: notice != null ? 'extracted' : 'missing',
        note: notice != null ? '' : 'Letter does not state notice',
      });

      const polM = emp ? Number(this.rules[`notice_${emp.grade}`] || 1) : null;
      if (emp) {
        fields.push({
          key: 'noticePolicy',
          label: 'Notice per policy',
          value: `${polM} month(s)`,
          state: 'inferred',
          note: `Grade ${emp.grade}. DUMMY rule, HR must validate`,
        });
      }

      fields.push({
        key: 'lwdStated',
        label: 'LWD in letter',
        value: lwdObj ? lwdObj.iso : '',
        state: lwdObj ? 'extracted' : 'missing',
        note: lwdObj ? '' : 'Letter does not state a last working day',
      });

      const useM = notice != null ? notice : polM;
      const proposed = docDate && useM != null ? addMonths(docDate.iso, useM) : '';
      let lwdState: ExtractedField['state'] = proposed ? 'inferred' : 'missing';
      let lwdNote = proposed ? `Resignation date + ${useM} month(s)` : 'Cannot calculate';

      if (lwdObj && proposed && lwdObj.iso !== proposed) {
        lwdState = 'conflicting';
        lwdNote = `Letter says ${lwdObj.iso} but calculation gives ${proposed}`;
        needs.push(`LWD conflict: letter ${lwdObj.iso} vs calculated ${proposed}. Which one applies?`);
      } else if (lwdObj && proposed) {
        lwdState = 'extracted';
        lwdNote = 'Letter and calculation agree';
      } else if (lwdObj && !proposed) {
        lwdState = 'extracted';
        lwdNote = 'From letter. Not cross-checked';
      }

      fields.push({
        key: 'lwd',
        label: 'Proposed last working day',
        value: lwdObj && lwdState !== 'conflicting' ? lwdObj.iso : proposed,
        state: lwdState,
        note: lwdNote,
      });

      if (notice != null && polM != null && Math.abs(notice - polM) > 0.01) {
        const nf = fields.find(f => f.key === 'noticeStated');
        if (nf) {
          nf.state = 'conflicting';
          nf.note = `Policy says ${polM} month(s)`;
        }
        needs.push(`Notice conflict: letter ${notice} vs policy ${polM} month(s). HR to decide.`);
      }
      if (notice == null) needs.push('Notice period not stated. Confirm the notice that applies.');
      if (!docDate) needs.push('No resignation date found. Enter it.');

      fields.push({
        key: 'reason',
        label: 'Reason',
        value: reason,
        state: reason ? 'extracted' : 'missing',
        note: reason ? '' : 'Optional',
      });

      if (docDate) conf += 0.1;
      if (lwdObj) conf += 0.08;
      if (notice != null) conf += 0.08;
      if (lwdState === 'conflicting') conf -= 0.15;
      if (unusual) conf -= 0.15;
      if (poor) conf -= 0.25;

      suggested = {
        resignationDate: docDate ? docDate.iso : '',
        lwd: lwdObj && lwdState !== 'conflicting' ? lwdObj.iso : proposed,
        noticeMonths: useM,
        reason,
        alt: lwdState === 'conflicting' && lwdObj ? { letter: lwdObj.iso, calculated: proposed } : null,
      };
    } else {
      const amtMatch = /RM\s?([\d,]+(?:\.\d+)?)/i.exec(all);
      const daysMatch = /(\d+)\s*day/i.exec(all);
      if (amtMatch) {
        fields.push({ key: 'amount', label: 'Amount', value: `RM ${amtMatch[1].replace(/,/g, '')}`, state: 'extracted' });
      }
      if (daysMatch) {
        fields.push({ key: 'days', label: 'Days', value: daysMatch[1], state: 'extracted' });
      }
      if (dates.length) {
        fields.push({ key: 'date', label: 'Date', value: dates[0].iso, state: 'extracted' });
      }
      const ct = /specialist/i.test(all) ? 'Specialist' : /hospital/i.test(all) ? 'Hospitalisation' : 'GP';
      if (bestType === 'claim') {
        fields.push({ key: 'claimType', label: 'Claim type', value: ct, state: 'inferred', note: 'From keywords' });
      }
      if (bestType === 'leave') {
        fields.push({
          key: 'leaveType',
          label: 'Leave type',
          value: /medical|sick/i.test(all) ? 'Medical' : 'Annual',
          state: 'inferred',
          note: 'From keywords',
        });
      }
      suggested = {
        amount: amtMatch ? amtMatch[1].replace(/,/g, '') : '',
        days: daysMatch ? daysMatch[1] : '',
        date: dates.length ? dates[0].iso : '',
        claimType: ct,
        leaveType: /medical|sick/i.test(all) ? 'Medical' : 'Annual',
        cost: amtMatch ? amtMatch[1].replace(/,/g, '') : '',
      };
      if (bestType === 'er') {
        flags.push({ level: 'warn', text: 'Employee relations content is sensitive. Only ER-role users can open this case.' });
      }
      if (poor) conf -= 0.25;
    }

    if (empMatches.length !== 1 || !emp) conf -= 0.25;
    const confidenceScore = Math.max(0.05, Math.min(0.97, +conf.toFixed(2)));
    const confidence: 'High' | 'Medium' | 'Low' = confidenceScore >= 0.8 ? 'High' : confidenceScore >= 0.55 ? 'Medium' : 'Low';
    const blocked = flags.some(f => f.level === 'stop');

    // Route
    const routeRole = TEMPLATES[bestType].tasks[0].role;
    const curUser = this.currentUser();
    const rInfo = ROLES[routeRole] || { code: routeRole, label: routeRole };
    const ownerUser = this.users.find(u => u.code === rInfo.code && u.level === 'Staff') || this.users.find(u => u.roles.includes(routeRole));

    return {
      event: bestType,
      eventLabel: LABELS[bestType],
      confidence,
      confidenceScore,
      employeeId: emp ? emp.empId : undefined,
      employeeCandidates: empMatches.map(m => m.id),
      fields,
      flags,
      needs,
      proposedTasks: TEMPLATES[bestType].tasks.map(t => t.t),
      poor,
      blocked,
      suggested,
      source: { name, text },
      route: {
        role: routeRole,
        code: rInfo.code,
        label: rInfo.label,
        mine: curUser.level === 'Admin' || curUser.roles.includes(routeRole),
        ownerName: ownerUser?.name || rInfo.label,
        restricted: !!TEMPLATES[bestType].restricted,
      },
    };
  }

  extractDates(text: string): Array<{ iso: string; index: number }> {
    const out: Array<{ iso: string; index: number }> = [];
    const r1 = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
    let m: RegExpExecArray | null;
    while ((m = r1.exec(text))) out.push({ iso: m[0], index: m.index });

    const r2 = /\b(\d{1,2})[/. ](\d{1,2})[/. ](\d{4})\b/g;
    while ((m = r2.exec(text))) out.push({ iso: `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`, index: m.index });

    const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
    const r3 = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(\d{4})\b/gi;
    while ((m = r3.exec(text))) out.push({ iso: `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(+m[1])}`, index: m.index });

    return out.sort((a, b) => a.index - b.index);
  }

  confirmSense(p: { type: ModuleType; empId: string; fields: any; suggested?: any; overrideReason?: string; source?: { name: string; text: string; url?: string } }, isHandover: boolean = false): { ok: boolean; caseId?: string; handedOver?: boolean; route?: SenseResult['route']; error?: string } {
    if (this.isEmergencyStop()) {
      return { ok: false, error: `EMERGENCY STOP is active. (${this.getSys('estop_reason')})` };
    }
    const { type, empId, fields: f, suggested: s = {}, overrideReason = '', source: src = { name: '', text: '' } } = p;
    const emp = this.employees.find(e => e.empId === empId);
    if (!emp) return { ok: false, error: 'Pick a valid employee.' };

    if (!isHandover && TEMPLATES[type].restricted && !this.can('IR')) {
      return { ok: false, error: 'This case type is restricted to Industrial Relations.' };
    }
    if (!isHandover && !this.canStart(type)) {
      return { ok: false, error: `Your roles cannot start ${LABELS[type]} cases (needs: ${this.owners(type).join(' / ')}).` };
    }

    if (type === 'resignation') {
      const dup = this.cases.find(c => c.type === 'resignation' && c.empId === emp.empId && c.status !== 'Closed');
      if (dup) return { ok: false, error: `Duplicate. ${dup.caseId} is already open for this employee.` };
      if (emp.status === 'Resigned') return { ok: false, error: `${emp.name} is already Resigned in Ramco.` };
      if (!isHandover && (!f.resignationDate || !f.lwd)) return { ok: false, error: 'HR must confirm resignation date and last working day.' };
      if (!isHandover && s.lwd && s.lwd !== f.lwd && !overrideReason.trim()) {
        return { ok: false, error: `You changed the LWD from ${s.lwd} to ${f.lwd}. Add the reason (recorded in audit).` };
      }
    }

    const routeRole = TEMPLATES[type].tasks[0].role;
    const rInfo = ROLES[routeRole] || { code: routeRole, label: routeRole };
    const ownerUser = this.users.find(u => u.code === rInfo.code && u.level === 'Staff') || this.users.find(u => u.roles.includes(routeRole));

    const c = this.createCase(type, emp.empId, {
      owner: isHandover ? (ownerUser?.name || rInfo.label) : this.currentUser().name,
      title: `${TEMPLATES[type].label} - ${emp.name}`,
      source: `Sense: ${src.name || 'pasted text'}`,
      keyDate: type === 'resignation' ? f.lwd : (f.date || ''),
      validation: isHandover
        ? `Handed over by ${this.currentUser().name}. Owner must validate`
        : type === 'resignation'
        ? `Confirmed by ${this.currentUser().name} on ${todayIso()}`
        : `Confirmed by ${this.currentUser().name}`,
      priority: type === 'er' ? 'High' : 'Normal',
      payload: f,
    });

    this.addEvidence(c.caseId, '', `Original document: ${src.name || 'pasted text'}`, 'Sense intake', src.url || (this.isLive() ? 'pasted text' : 'demo'));
    this.addFile(c.caseId, emp.empId, src.name || 'pasted_text.txt', 'source', src.text || `(file name only) ${src.name || ''}`, 'Filed', src.url || '');

    if (type === 'resignation' && !isHandover) {
      if (s.lwd && s.lwd !== f.lwd) {
        this.audit(c.caseId, 'Human override of AI/system value', `LWD ${s.lwd} -> ${f.lwd} | reason: ${overrideReason}`);
      }
      const ts = this.tasksOf(c.caseId);
      if (ts.length >= 2) {
        ts[0].status = 'Completed';
        ts[0].done = todayIso();
        ts[0].note = `Confirmed at intake: ${emp.name}, resignation date ${f.resignationDate}`;
        this.addEvidence(c.caseId, ts[0].taskId, 'HR validated resignation details', 'HR confirmation', 'Intake validation');

        ts[1].status = 'Completed';
        ts[1].done = todayIso();
        ts[1].note = `Notice ${f.noticeMonths || '?'} month(s), LWD ${f.lwd}${overrideReason ? ' (override: ' + overrideReason + ')' : ''}`;
        this.addEvidence(c.caseId, ts[1].taskId, `Notice period and LWD confirmed: ${f.lwd}`, 'HR confirmation', 'Intake validation');
        this.audit(c.caseId, 'Validation performed', `Resignation date ${f.resignationDate}, LWD ${f.lwd}`);
      }
    }

    this.refreshCase(c.caseId);

    const routeResult: SenseResult['route'] = {
      role: routeRole,
      code: rInfo.code,
      label: rInfo.label,
      mine: this.currentUser().roles.includes(routeRole),
      ownerName: ownerUser?.name || rInfo.label,
      restricted: !!TEMPLATES[type].restricted,
    };

    if (isHandover) {
      const me = this.currentUser().name;
      const restricted = routeResult.restricted;
      const msg = `Handed over by ${me}: ${restricted ? 'a restricted case' : c.title} (${c.caseId})`;
      this.notify(routeResult.role, c.caseId, msg, me);

      const draftId = this.saveDraft(
        `${this.tag()} Handover to ${routeResult.code}: ${restricted ? c.caseId : c.title}`,
        `Hi ${routeResult.ownerName},\n\n${me} received a document that belongs to ${routeResult.label}.\nCase ${c.caseId} has been created and assigned to you.\n\n${this.footer()}`,
        { caseId: c.caseId, empId: c.empId, to: ownerUser?.email || (this.isLive() ? '' : 'hr@example.com'), role: routeResult.role }
      );
      this.audit(c.caseId, `Handed over to ${routeResult.code} (${routeResult.ownerName})`, `From ${me}. Owner notified. ${this.isLive() ? 'Gmail draft' : 'Simulated: Gmail draft'} "${this.tag()} Handover to ${routeResult.code}" [${draftId}]`);
    }

    this.save();
    return { ok: true, caseId: c.caseId, handedOver: isHandover, route: routeResult };
  }

  // Seeding initial data
  seedAll() {
    this.users = [
      { userId: 'U1', name: 'Aliff', email: 'aliff@example.com', roles: ['HR Ops', 'Benefits', 'Payroll', 'Learning', 'Engagement', 'Performance'], code: 'Demo', level: 'Staff', title: 'Demo owner (all HR roles except IR)' },
      { userId: 'U2', name: 'Nadia (IR Lead)', email: 'hr.ir@example.com', roles: ['IR'], code: 'HR E2', level: 'Staff', title: 'Union & Industrial Relations' },
      { userId: 'U3', name: 'Admin (demo)', email: 'admin@example.com', roles: ['HR Ops', 'Benefits', 'Payroll', 'Learning', 'Engagement', 'Performance', 'IR'], code: 'Admin', level: 'Admin', title: 'Prototype admin' },
      { userId: 'U4', name: 'Hana Rosli', email: 'hr.a@example.com', roles: ['HR Ops'], code: 'HR A', level: 'Staff', title: 'HR Operations & Movement' },
      { userId: 'U5', name: 'Iman Azlan', email: 'hr.b@example.com', roles: ['Benefits'], code: 'HR B', level: 'Staff', title: 'Benefit Management' },
      { userId: 'U6', name: 'Joyce Lim', email: 'hr.c@example.com', roles: ['Learning'], code: 'HR C', level: 'Staff', title: 'Learning & Development' },
      { userId: 'U7', name: 'Karthik Rao', email: 'hr.d@example.com', roles: ['Engagement'], code: 'HR D', level: 'Staff', title: 'Employee Engagement' },
      { userId: 'U8', name: 'Liyana Aziz', email: 'hr.e@example.com', roles: ['Payroll'], code: 'HR E', level: 'Staff', title: 'Payroll' },
      { userId: 'U9', name: 'Mior Fadzil', email: 'hr.f@example.com', roles: ['Performance'], code: 'HR F', level: 'Staff', title: 'Performance & Talent' },
      { userId: 'U10', name: 'Rohana Ismail', email: 'mgr.a@example.com', roles: ['HR Ops'], code: 'HR A', level: 'Manager', title: 'Manager, HR Operations & Movement' },
      { userId: 'U11', name: 'Sabrina Yusof', email: 'mgr.b@example.com', roles: ['Benefits'], code: 'HR B', level: 'Manager', title: 'Manager, Benefit Management' },
      { userId: 'U12', name: 'Thomas Goh', email: 'mgr.c@example.com', roles: ['Learning'], code: 'HR C', level: 'Manager', title: 'Manager, Learning & Development' },
      { userId: 'U13', name: 'Umairah Hashim', email: 'mgr.d@example.com', roles: ['Engagement'], code: 'HR D', level: 'Manager', title: 'Manager, Employee Engagement' },
      { userId: 'U14', name: 'Vijay Kumar', email: 'mgr.e@example.com', roles: ['Payroll'], code: 'HR E', level: 'Manager', title: 'Manager, Payroll' },
      { userId: 'U15', name: 'Wan Azhar', email: 'mgr.ir@example.com', roles: ['IR'], code: 'HR E2', level: 'Manager', title: 'Manager, Industrial Relations' },
      { userId: 'U16', name: 'Yasmin Halim', email: 'mgr.f@example.com', roles: ['Performance'], code: 'HR F', level: 'Manager', title: 'Manager, Performance & Talent' },
      { userId: 'U17', name: 'Encik Shahril', email: 'hod.ops@example.com', roles: ['HR Ops', 'Benefits', 'Payroll', 'IR'], code: 'HOD', level: 'HOD', title: 'HOD, HR Operations (Payroll, Benefit, Movement, IR)' },
      { userId: 'U18', name: 'Puan Sarah', email: 'hod.orgex@example.com', roles: ['Learning', 'Engagement', 'Performance'], code: 'HOD', level: 'HOD', title: 'HOD, HR Organisational Excellence (PMS, L&D, Talent)' },
    ];

    const T = todayIso();
    this.employees = NAMES.map((n, i) => {
      const g = GRADES[i % 4];
      const dept = DEPTS[i % 8];
      const mgr = i % 4 === 3 ? 'Office of the CEO' : NAMES[Math.floor(i / 4) * 4 + 3];
      const join = i === 36 ? addDays(T, -20) : `${2014 + ((i * 5) % 12)}-${pad(1 + ((i * 7) % 12))}-${pad(1 + ((i * 11) % 27))}`;
      return {
        empId: `EMP-${('0000' + (i + 1)).slice(-4)}`,
        name: n,
        position: `${g}, ${dept}`,
        dept,
        grade: g,
        manager: mgr,
        joinDate: join,
        category: (i % 5 === 0 ? 'Union' : 'Non-union') as 'Union' | 'Non-union',
        status: (i === 39 ? 'Resigned' : i === 36 ? 'Probation' : 'Active') as Employee['status'],
        email: `${n.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
      };
    });

    this.rules = {
      notice_Executive: '1',
      'notice_Senior Executive': '2',
      notice_Manager: '2',
      'notice_Senior Manager': '3',
      cap_GP: '3000',
      cap_Specialist: '5000',
      cap_Hospitalisation: '30000',
      learning_budget: '5000',
    };

    // Leave & Claims & Learning
    this.leave = [];
    this.claims = [];
    this.learning = [];
    this.employees.forEach((e, i) => {
      const ent = [14, 16, 18, 20][i % 4];
      const taken = (i * 3) % 12;
      this.leave.push(
        { empId: e.empId, type: 'Annual', entitled: ent, taken, balance: ent - taken },
        { empId: e.empId, type: 'Medical', entitled: 14, taken: i % 3, balance: 14 - (i % 3) }
      );
      const cn = 1 + (i % 3);
      for (let k = 0; k < cn; k++) {
        this.claims.push({
          claimId: `CL-${e.empId.slice(4)}-${k + 1}`,
          empId: e.empId,
          claimType: ['GP', 'Specialist', 'GP'][k],
          amount: [120, 850, 260][k] + ((i * 13) % 200),
          date: `2026-0${1 + ((i + k) % 8)}-1${k + 1}`,
          status: 'Paid',
        });
      }
    });
    this.claims.push({
      claimId: 'CL-SPEC-DEMO',
      empId: 'EMP-0002',
      claimType: 'Specialist',
      amount: 4600,
      date: '2026-08-14',
      status: 'Paid',
    });

    ['Leadership Essentials', 'Excel for HR', 'Data Literacy', 'Presentation Skills', 'Project Management'].forEach((c, i) => {
      this.learning.push({
        courseId: `LC-${i + 1}`,
        empId: this.employees[i * 3 + 1].empId,
        course: c,
        cost: 800 + i * 900,
        status: i % 2 ? 'Completed' : 'Registered',
      });
    });

    // Seed Cases
    this.cases = [];
    this.tasks = [];
    this.evidence = [];
    this.auditLog = [];
    this.files = [];
    this.drafts = [];
    this.notifications = [];

    const id = (idx: number) => this.employees[idx].empId;

    // 1. Aina Rahman: Resignation
    const c1 = this.createCase('resignation', id(0), {
      keyDate: addDays(T, 57),
      source: 'Sense: aina_resignation.pdf',
      validation: 'Extracted. Notice NOT validated',
      payload: { resignationDate: addDays(T, 27), noticeMonths: '' },
      opened: addDays(T, -3),
    });
    const c1Tasks = this.tasksOf(c1.caseId);
    if (c1Tasks.length) {
      c1Tasks[0].status = 'Completed';
      c1Tasks[0].done = T;
      c1Tasks[0].note = 'Resignation letter validated';
      this.addEvidence(c1.caseId, c1Tasks[0].taskId, c1Tasks[0].title, 'Seed', 'demo', 'Oneness');
    }
    this.refreshCase(c1.caseId);

    // 2. Hafiz Ismail: resignation ready to verify
    const c2 = this.createCase('resignation', id(5), {
      keyDate: addDays(T, 5),
      source: 'Sense: hafiz_resign.pdf',
      validation: 'Confirmed by Hana Rosli',
      opened: addDays(T, -20),
    });
    this.tasksOf(c2.caseId).forEach(t => {
      t.status = 'Completed';
      t.done = T;
      t.note = 'Done (seed)';
      this.addEvidence(c2.caseId, t.taskId, t.title, 'Seed', 'demo', 'Oneness');
    });
    this.refreshCase(c2.caseId);

    // 3. Leave awaiting approval
    const c3 = this.createCase('leave', id(1), {
      source: 'Employee request',
      keyDate: addDays(T, 6),
      payload: { leaveType: 'Annual', days: 2 },
      opened: T,
    });
    this.runTask(c3.caseId, `${c3.caseId}-T1`);

    // 4. Claim with policy exception (specialist cap exceeded)
    const c4 = this.createCase('claim', id(1), {
      source: 'Sense: specialist_invoice.pdf',
      payload: { claimType: 'Specialist', amount: 1200 },
      priority: 'High',
      exception: 'Specialist cap RM5000 exceeded: used 4600 + claim 1200. Policy exception.',
      opened: T,
    });
    const c4Tasks = this.tasksOf(c4.caseId);
    if (c4Tasks.length) {
      c4Tasks[0].status = 'Completed';
      c4Tasks[0].done = T;
      c4Tasks[0].note = 'Claimant identified';
    }
    this.refreshCase(c4.caseId);

    // 5. Onboarding Adlina Sofia
    const c5 = this.createCase('onboarding', id(36), {
      source: 'Offer accepted',
      keyDate: addDays(T, 2),
      opened: T,
    });
    const c5Tasks = this.tasksOf(c5.caseId);
    if (c5Tasks.length) {
      c5Tasks[0].status = 'Completed';
      c5Tasks[0].done = T;
      c5Tasks[0].note = 'Contract prepared';
    }
    this.refreshCase(c5.caseId);

    // 6. Payroll exception
    const c6 = this.createCase('payroll', id(8), {
      source: 'Payroll query',
      opened: addDays(T, -1),
    });
    const c6Tasks = this.tasksOf(c6.caseId);
    if (c6Tasks.length) {
      c6Tasks[0].status = 'Completed';
      c6Tasks[0].done = T;
      c6Tasks[0].note = 'Identified: allowance not paid';
    }
    this.refreshCase(c6.caseId);

    // 7. Learning request
    this.createCase('learning', id(13), {
      source: 'Employee request',
      payload: { cost: 3200 },
      opened: addDays(T, -2),
    });

    // 8. Hospitalisation claim cap exception
    this.createCase('claim', id(4), {
      source: 'Sense: hospital_bill.pdf',
      payload: { claimType: 'Hospitalisation', amount: 31500 },
      priority: 'High',
      exception: 'Hospitalisation cap RM30000 exceeded by RM1500. Policy exception.',
      opened: addDays(T, -1),
    });

    // 9. ER restricted
    this.createCase('er', id(20), {
      source: 'Manager report',
      priority: 'High',
      owner: 'Nadia (IR Lead)',
      opened: addDays(T, -6),
    });

    // 10. Additional cases across modules
    const modulesSeed: Array<[ModuleType, number, string, any]> = [
      ['promotion', 1, 'Manager recommendation', {}],
      ['confirmation', 36, 'Probation review', {}],
      ['renewal', 22, 'Contract review', {}],
      ['maternity', 2, 'Employee request', {}],
      ['ltm', 6, 'Sense: ltm_form.pdf', {}],
      ['medreport', 0, 'Scheduled: monthly', { frequency: 'monthly' }],
      ['trainreg', 8, 'Employee registration', {}],
      ['activity', 0, 'Engagement calendar', {}],
      ['salaryletter', 4, 'Employee request', {}],
      ['union', 20, 'Union rep request', {}],
      ['pms', 12, 'PMS cycle', {}],
      ['ghrreport', 0, 'Scheduled: quarterly', { frequency: 'quarterly' }],
    ];
    modulesSeed.forEach(([type, empIdx, src, payload], i) => {
      const c = this.createCase(type, id(empIdx), { source: src, payload, opened: addDays(T, -(i % 4)) });
      if (i % 3 === 0) {
        const ts = this.tasksOf(c.caseId);
        if (ts.length) {
          ts[0].status = 'Completed';
          ts[0].done = T;
          ts[0].note = 'Initial verification completed';
        }
      }
      this.refreshCase(c.caseId);
    });

    // Urgent SOCSO for Benefits role
    this.createCase('socso', id(10), {
      source: 'Sense: accident_report.pdf',
      priority: 'Urgent',
      exception: 'SOCSO submission deadline at risk (dummy rule)',
      opened: addDays(T, -4),
    });

    // Seed audit activities
    const RA: Record<string, Array<[string, string]>> = {
      'HR Ops': [
        ['Document classified', 'Resignation letter recognised and matched to employee (dummy)'],
        ['Gmail draft prepared', 'Draft to reporting manager: notice received. Not sent'],
        ['Calendar event created', 'Last working day added to calendar'],
        ['Ramco record checked', 'Employee status and grade match Ramco mirror'],
        ['Evidence filed', 'Source document saved to case evidence'],
        ['Records updated', 'Notice period confirmed and recorded'],
      ],
      'Benefits': [
        ['Claim within entitlement', 'GP claim RM180 within RM3000 cap. No action needed'],
        ['Leave auto-approved (within entitlement)', '2 days annual leave within balance. Ramco update queued for HR B'],
        ['Gmail draft prepared', 'Draft to employee: claim received. Not sent'],
        ['Rule check passed', 'Specialist cap check passed'],
        ['Evidence filed', 'Clinic receipt filed to case evidence'],
      ],
      'Learning': [
        ['Registration confirmed', 'Seat allocated for Excel for HR (dummy)'],
        ['Gmail draft prepared', 'Monthly training blast draft prepared. Not sent'],
        ['Budget check passed', 'Request within RM5000 budget'],
        ['Evidence filed', 'Course brochure filed'],
      ],
      'Engagement': [
        ['Gmail draft prepared', 'Activity promotion draft prepared. Not sent'],
        ['Registration logged', 'Employee registered for engagement activity'],
        ['Calendar event created', 'Activity date added to calendar'],
      ],
      'Payroll': [
        ['Payroll input validated', 'Allowance changes matched to Ramco'],
        ['Gmail draft prepared', 'Salary confirmation letter draft prepared. Not sent'],
        ['Rule check passed', 'Deduction within policy'],
        ['Evidence filed', 'Payslip comparison filed'],
      ],
      'IR': [
        ['Restricted item filed', 'Confidential item filed for IR only'],
        ['Rule check passed', 'Collective agreement clause matched'],
      ],
      'Performance': [
        ['Gmail draft prepared', 'PMS reminder draft prepared. Not sent'],
        ['Report compiled', 'Monthly GHR report compiled from Ramco extract'],
        ['Rule check passed', 'Rating calibration within band'],
      ],
    };

    const rolesList = Object.keys(RA);
    let auditN = 0;
    for (let i = 0; i < 48; i++) {
      const r = rolesList[auditN % rolesList.length];
      const list = RA[r];
      const pair = list[Math.floor(auditN / rolesList.length) % list.length];
      auditN++;
      this.auditLog.push({
        auditId: `A-${500000 + auditN}`,
        at: ago(1 + (i * 17) / 48),
        user: 'Oneness',
        caseId: '',
        action: pair[0],
        detail: pair[1],
        role: r,
      });
    }

    // Seed 25 Samples
    const ex = this.employees[6];
    const mg = this.employees[6];
    const n1 = this.employees.find(e => e.grade === 'Executive' && e.status === 'Active' && e.empId !== 'EMP-0001' && e.empId !== 'EMP-0006') || this.employees[4];
    const n2 = this.employees.find(e => e.grade === 'Manager' && e.status === 'Active') || this.employees[2];
    const sm = this.employees.find(e => e.grade === 'Senior Manager') || this.employees[3];
    const lwd1 = addMonths(T, 1);

    this.samples = [
      { id: 'S01', label: 'Normal resignation', scenario: 'normal', filename: 'S01_resignation_normal.pdf', text: `Date: ${T}\nTo: Human Resources\nSubject: Letter of Resignation\n\nI, ${n1.name} (Staff ID ${n1.empId}), ${n1.position}, hereby tender my resignation. My notice period is 1 month and my last working day will be ${lwd1}.\nReason: pursuing further studies.\n\nYours sincerely,\n${n1.name}` },
      { id: 'S02', label: 'Missing staff ID', scenario: 'missing-id', filename: 'S02_resignation_no_id.pdf', text: `Date: ${T}\nSubject: Resignation\n\nI, ${n1.name}, wish to resign from my position. Notice period: 1 month. Last working day: ${lwd1}.` },
      { id: 'S03', label: 'Missing notice', scenario: 'missing-notice', filename: 'S03_resignation_no_notice.pdf', text: `Date: ${T}\nSubject: Resignation\n\nI, ${n2.name} (${n2.empId}), hereby resign from my role. Thank you for the opportunities.` },
      { id: 'S04', label: 'Conflicting LWD', scenario: 'conflict', filename: 'S04_resignation_conflict.pdf', text: `Date: ${T}\nSubject: Resignation\n\nI, ${n2.name} (${n2.empId}), resign from my post. Notice period: 2 months. My last working day will be ${addDays(T, 20)}.` },
      { id: 'S05', label: 'Wrong document (medical)', scenario: 'wrong-doc', filename: 'S05_clinic_receipt.pdf', text: `Klinik Sihat Sdn Bhd\nReceipt for ${ex.name} (${ex.empId})\nConsultation, GP visit. Diagnosis: fever.\nInvoice total RM 85.00\nDate: ${T}` },
      { id: 'S06', label: 'Duplicate resignation', scenario: 'duplicate', filename: 'S06_aina_resignation_again.pdf', text: `Date: ${addDays(T, -3)}\nSubject: Resignation\n\nI, Aina Rahman (EMP-0001), hereby resign. Notice period 1 month. Last working day ${addDays(T, 57)}.` },
      { id: 'S07', label: 'Poor quality scan', scenario: 'poor-scan', filename: 'S07_scan_0091.pdf', text: `Dat3: ${T}\nSubj: Re$ign@tion l3tter\n\nI ${n1.name} EMP-${n1.empId.slice(4)} h3reby resi9n fr0m my p0st. N0tice 1 m0nth. L@st w0rking day ${lwd1} #### ~~` },
      { id: 'S08', label: 'Multiple employees', scenario: 'multiple', filename: 'S08_two_letters_together.pdf', text: `Resignation letter of ${n1.name} (${n1.empId}), last working day ${lwd1}.\n---\nResignation letter of ${sm.name} (${sm.empId}), last working day ${addMonths(T, 3)}.` },
      { id: 'S09', label: 'Unusual wording', scenario: 'unusual', filename: 'S09_a_new_chapter.pdf', text: `Date: ${T}\n\nDear HR,\n\nI, ${mg.name} (${mg.empId}), have decided to move on to a new chapter. My final day with the company will be ${addMonths(T, 2)}. Thank you for everything.` },
      { id: 'S10', label: 'No matching employee', scenario: 'no-match', filename: 'S10_unknown_person.pdf', text: `Date: ${T}\nSubject: Resignation\n\nI, Zainal Abidin Fake (EMP-9999), resign from my post. Notice period: 1 month. Last working day: ${lwd1}.` },
      { id: 'S11', label: 'Already resigned in Ramco', scenario: 'already-resigned', filename: 'S11_resign_again.pdf', text: `Date: ${T}\nSubject: Resignation\n\nI, Razif Mansor (EMP-0040), hereby resign. Notice period 1 month. Last working day: ${lwd1}.` },
      { id: 'S12', label: 'Leave request', scenario: 'leave', filename: 'S12_leave_request.pdf', text: `Hi HR, I would like to apply for annual leave for 3 days starting ${addDays(T, 14)}. - ${this.employees[3].name} (${this.employees[3].empId})` },
      { id: 'S13', label: 'Leave over balance', scenario: 'leave-exception', filename: 'S13_leave_long.pdf', text: `Leave request: ${this.employees[7].name} (${this.employees[7].empId}) applies for annual leave for 30 days from ${addDays(T, 30)}.` },
      { id: 'S14', label: 'Medical claim (within cap)', scenario: 'claim', filename: 'S14_claim_gp.pdf', text: `Clinic receipt. Patient: ${this.employees[10].name} (${this.employees[10].empId}). GP consultation. Invoice RM 140.00. Date ${T}` },
      { id: 'S15', label: 'Specialist claim (over cap)', scenario: 'claim-exception', filename: 'S15_claim_specialist.pdf', text: `Specialist claim. ${this.employees[1].name} (${this.employees[1].empId}). Specialist consultation invoice RM 900.00, date ${T}` },
      { id: 'S16', label: 'New starter', scenario: 'onboarding', filename: 'S16_offer_accepted.pdf', text: `Offer accepted by ${this.employees[35].name} (${this.employees[35].empId}). New joiner. Joining date ${addDays(T, 21)}.` },
      { id: 'S17', label: 'Training request', scenario: 'learning', filename: 'S17_training_request.pdf', text: `Training request: ${this.employees[13].name} (${this.employees[13].empId}) requests a Leadership workshop course. Cost RM 2,800.` },
      { id: 'S18', label: 'Payroll query', scenario: 'payroll', filename: 'S18_payroll_query.pdf', text: `Query from ${this.employees[8].name} (${this.employees[8].empId}): my salary shows an unexpected deduction this month, I think I was underpaid RM 150.` },
      { id: 'S19', label: 'ER complaint (restricted)', scenario: 'er', filename: 'S19_complaint.pdf', text: `Confidential grievance about workplace bullying raised by ${this.employees[18].name} (${this.employees[18].empId}).` },
      { id: 'S20', label: 'Promotion recommendation', scenario: 'promotion', filename: 'S20_promotion_reco.pdf', text: `Manager recommendation: promote ${this.employees[1].name} (${this.employees[1].empId}) with new grade Manager effective ${addMonths(T, 1)}. Performance rating: Exceeds.` },
      { id: 'S21', label: 'Probation confirmation', scenario: 'confirmation', filename: 'S21_confirmation_request.pdf', text: `Probation period review for ${this.employees[36].name} (${this.employees[36].empId}). Requesting confirmation of service. Manager assessment attached.` },
      { id: 'S22', label: 'Maternity leave', scenario: 'maternity', filename: 'S22_maternity_request.pdf', text: `I, ${this.employees[2].name} (${this.employees[2].empId}), would like to apply for maternity leave. Expected delivery date ${addMonths(T, 2)}. Please advise allowance.` },
      { id: 'S23', label: 'SOCSO submission', scenario: 'socso', filename: 'S23_socso_incident.pdf', text: `SOCSO submission needed: workplace accident involving ${this.employees[10].name} (${this.employees[10].empId}) on ${addDays(T, -2)}. Injury report attached.` },
      { id: 'S24', label: 'Salary confirmation letter', scenario: 'salaryletter', filename: 'S24_salary_letter.pdf', text: `${this.employees[4].name} (${this.employees[4].empId}) requests a salary confirmation letter for a bank loan application.` },
      { id: 'S25', label: 'Training registration', scenario: 'trainreg', filename: 'S25_training_reg.pdf', text: `Please register me for the Excel for HR training. Seat needed for next month. ${this.employees[6].name} (${this.employees[6].empId}).` },
    ];

    // Seed Files for cases
    this.cases.forEach(c => {
      const e = this.employees.find(empItem => empItem.empId === c.empId);
      const txt = c.type === 'resignation'
        ? `Date: 2026-09-27\nTo: Human Resources\nSubject: Letter of Resignation\n\nI, ${e?.name || 'Aina Rahman'} (Staff ID ${c.empId}), ${e?.position || 'Executive, Marketing'}, hereby tender my resignation. My notice period is 1 month and my last working day will be ${c.keyDate || '2026-11-26'}.\n\nYours sincerely,\n${e?.name || 'Aina Rahman'}`
        : `SYNTHETIC DOCUMENT (dummy)\n\nType: ${LABELS[c.type]}\nStaff ID: ${c.empId}\nEmployee: ${e?.name || ''}\nPosition: ${e?.position || ''}\nKey date: ${c.keyDate || 'TBC'}\nSource: ${c.source}\n\nGenerated for Oneness demonstration with synthetic data.`;
      this.addFile(c.caseId, c.empId, `${c.type}_${c.caseId}_letter.txt`, 'source', txt, 'Filed');
      if (c.status !== 'Closed') {
        this.addFile(c.caseId, c.empId, `Case checklist - ${c.caseId}.txt`, 'generated', `Checklist generated by Oneness for ${c.title}.\n1. Validate details\n2. Notify manager\n3. Evidence verification\n4. Update Ramco mirror`, 'Draft');
      }
    });

    // Seed Drafts
    this.saveDraft(
      '[Oneness DUMMY] Confirmation - Adlina Sofia',
      `Hi Razif Mansor,\n\nThis is a system-generated draft for case CNF-2026-0001 (Confirmation - Adlina Sofia).\nKey date: TBC\n\nGenerated by Oneness prototype with synthetic data. Please review before sending.`,
      { caseId: 'CNF-2026-0001', empId: 'EMP-0037', to: 'razif.mansor@example.com', role: 'HR Ops' }
    );
    this.saveDraft(
      '[Oneness DUMMY] Resignation - Hafiz Ismail',
      `Hi Lim Wei Jian,\n\nThis is a system-generated draft for case RES-2026-0002 (Resignation - Hafiz Ismail).\nKey date: 2026-10-05\n\nGenerated by Oneness prototype with synthetic data. Please review before sending.`,
      { caseId: 'RES-2026-0002', empId: 'EMP-0006', to: 'lim.wei.jian@example.com', role: 'HR Ops' }
    );
    this.saveDraft(
      '[Oneness DUMMY] Resignation - Aina Rahman',
      `Hi Daniel Tan,\n\nThis is a system-generated draft for case RES-2026-0001 (Resignation - Aina Rahman).\nKey date: 2026-11-26\n\nGenerated by Oneness prototype with synthetic data. Please review before sending.`,
      { caseId: 'RES-2026-0001', empId: 'EMP-0001', to: 'daniel.tan@example.com', role: 'HR Ops' }
    );

    // Initial system
    this.setSys('estop', 'off');
    this.setSys('resumedAt', nowStr());
    this.activeUserId = 'U4'; // Hana Rosli (HR A)
    this.menuStyle = 'dock';
    this.save();
  }
}

export const store = new OnenessStore();
