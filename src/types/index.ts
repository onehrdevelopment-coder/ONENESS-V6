export type RoleCode = 'HR A' | 'HR B' | 'HR C' | 'HR D' | 'HR E' | 'HR E2' | 'HR F' | 'Manager' | 'HOD' | 'Admin' | 'Demo';

export interface User {
  userId: string;
  name: string;
  email: string;
  roles: string[]; // e.g. ['HR Ops', 'Benefits']
  code: string;    // e.g. 'HR A', 'Demo', 'HOD'
  level: 'Staff' | 'Manager' | 'HOD' | 'Admin';
  title: string;
}

export interface Employee {
  empId: string;
  name: string;
  position: string;
  dept: string;
  grade: string;
  manager: string;
  joinDate: string;
  category: 'Union' | 'Non-union';
  status: 'Active' | 'On notice' | 'Resigned' | 'Probation';
  email: string;
}

export type ModuleType =
  | 'resignation'
  | 'recruitment'
  | 'promotion'
  | 'confirmation'
  | 'renewal'
  | 'upgrading'
  | 'onboarding'
  | 'leave'
  | 'claim'
  | 'socso'
  | 'ltm'
  | 'medreport'
  | 'screening'
  | 'critical'
  | 'maternity'
  | 'benefitq'
  | 'claimrpt'
  | 'policy'
  | 'learning'
  | 'trainreg'
  | 'hrdc'
  | 'trainpay'
  | 'tna'
  | 'blast'
  | 'activity'
  | 'actreg'
  | 'payroll'
  | 'salaryletter'
  | 'deduction'
  | 'payrun'
  | 'er'
  | 'union'
  | 'pms'
  | 'talent'
  | 'ghrreport';

export type TaskKind = 'human' | 'auto' | 'decision';
export type TaskState = 'Not Started' | 'Ready' | 'Waiting' | 'Completed' | 'Escalated' | 'Verified';

export interface Task {
  taskId: string;
  caseId: string;
  seq: number;
  title: string;
  ownerRole: string; // 'HR Ops', 'Benefits', etc.
  kind: TaskKind;
  deps: string[]; // task IDs
  status: TaskState;
  due: string;
  note: string;
  done: string;
  options?: string;
  action?: string;
  canAct?: boolean;
  waitingOn?: string[];
  ready?: boolean;
  state?: TaskState;
}

export interface Case {
  caseId: string;
  type: ModuleType;
  empId: string;
  title: string;
  status: 'Open' | 'In progress' | 'Awaiting verification' | 'Verified' | 'Closed' | 'Escalated';
  stage: string;
  owner: string;
  priority: 'Normal' | 'High' | 'Urgent';
  source: string;
  opened: string;
  keyDate: string;
  blocker: string;
  validation: string;
  evidence: string;
  exception: string;
  payload: any; // JSON string or object
  outcome: string;
}

export interface EvidenceItem {
  evId: string;
  caseId: string;
  taskId: string;
  label: string;
  source: string;
  by: string;
  at: string;
  ref: string;
}

export interface AuditRecord {
  auditId: string;
  at: string;
  user: string;
  caseId: string;
  action: string;
  detail: string;
  role: string;
}

export interface ChangeRecord {
  changeId: string;
  type: ModuleType;
  requesterId: string;
  requester: string;
  at: string;
  status: 'Pending approval' | 'Shadow' | 'Live' | 'Rejected' | 'Rolled back' | 'Superseded';
  version: number;
  baseVersion: number;
  reason: string;
  description: string;
  tasksJson: string;
  approver?: string;
  decidedAt?: string;
  decisionNote?: string;
  shadowRuns?: number;
  shadowNote?: string;
}

export interface LeaveRecord {
  empId: string;
  type: string;
  entitled: number;
  taken: number;
  balance: number;
}

export interface ClaimRecord {
  claimId: string;
  empId: string;
  claimType: string;
  amount: number;
  date: string;
  status: string;
}

export interface LearningRecord {
  courseId: string;
  empId: string;
  course: string;
  cost: number;
  status: string;
}

export interface SampleDoc {
  id: string;
  label: string;
  scenario: string;
  filename: string;
  text: string;
}

export interface FileRecord {
  fileId: string;
  caseId: string;
  empId: string;
  name: string;
  kind: 'source' | 'generated';
  text: string;
  at: string;
  by: string;
  status: 'Filed' | 'Draft' | 'Review';
  url: string;
  empName?: string;
}

export interface DraftRecord {
  draftId: string;
  caseId: string;
  empId: string;
  empName?: string;
  at: string;
  by: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  attach: string;
  status: 'Draft' | 'Sent by user' | 'Deleted';
  role: string;
  gmailUrl?: string; // live mode: link to the real draft in Gmail
}

export interface NotificationRecord {
  notifId: string;
  at: string;
  toRole: string;
  toUser: string;
  caseId: string;
  message: string;
  from: string;
  read: 'yes' | 'no';
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  state: 'authoritative' | 'confirmed' | 'extracted' | 'inferred' | 'conflicting' | 'missing';
  note?: string;
}

export interface SenseRoute {
  role: string;
  code: string;
  label: string;
  mine: boolean;
  ownerName: string;
  restricted: boolean;
}

export interface SenseResult {
  event: ModuleType | 'unknown';
  eventLabel: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  employeeId?: string;
  employeeCandidates?: string[];
  fields: ExtractedField[];
  flags: Array<{ level: 'stop' | 'warn' | 'ok'; text: string; dup?: string }>;
  needs: string[];
  proposedTasks: string[];
  poor?: boolean;
  blocked?: boolean;
  nothingCreated?: boolean;
  suggested?: any;
  source?: { name: string; text: string; url?: string; driveFileId?: string };
  route?: SenseRoute;
}

export type MenuStyle = 'dock' | 'capsule' | 'toolbar' | 'sidebar' | 'mega' | 'launchpad' | 'spotlight';
