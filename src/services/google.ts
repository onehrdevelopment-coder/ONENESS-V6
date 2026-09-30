// Real Google Workspace connector for the live (non-demo) workspace.
// Browser-only: Google Identity Services token model + Drive / Gmail / Calendar REST.
// The access token lives in memory only (never localStorage) and expires after ~1 hour.

const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
const ALLOWED_DOMAIN = ((import.meta as any).env?.VITE_GOOGLE_ALLOWED_DOMAIN as string | undefined) || '';
const ROOT_FOLDER_NAME = ((import.meta as any).env?.VITE_ONENESS_DRIVE_FOLDER as string | undefined) || 'Oneness';
const DATA_FILE_NAME = 'oneness-data.json';

export const SCOPES = [
  'openid',
  'email',
  'profile',
  // Only files Oneness creates or the user opens with it. Not the whole Drive.
  'https://www.googleapis.com/auth/drive.file',
  // Read inbox messages to Sense them.
  'https://www.googleapis.com/auth/gmail.readonly',
  // Create drafts only. Oneness never sends email.
  'https://www.googleapis.com/auth/gmail.compose',
  // Read upcoming events to Sense them, create key-date events.
  'https://www.googleapis.com/auth/calendar.events',
];

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
  hd?: string;
}

export class GoogleAuthExpired extends Error {
  constructor() {
    super('Google session expired. Reconnect to continue.');
  }
}

let accessToken: string | null = null;
let tokenExpiresAt = 0;
let tokenClient: any = null;
let gisLoading: Promise<void> | null = null;

export function isConfigured(): boolean {
  return !!CLIENT_ID;
}

export function allowedDomain(): string {
  return ALLOWED_DOMAIN;
}

export function hasValidToken(): boolean {
  return !!accessToken && Date.now() < tokenExpiresAt - 60_000;
}

function loadGis(): Promise<void> {
  if ((window as any).google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoading) return gisLoading;
  gisLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoading = null;
      reject(new Error('Could not load Google sign-in. Check your connection.'));
    };
    document.head.appendChild(s);
  });
  return gisLoading;
}

// Must be called from a user gesture (click), otherwise the browser blocks the popup.
export async function requestAccess(opts: { prompt?: '' | 'consent' | 'select_account'; hint?: string } = {}): Promise<void> {
  if (!CLIENT_ID) throw new Error('Google sign-in is not configured (VITE_GOOGLE_CLIENT_ID missing).');
  await loadGis();
  const oauth2 = (window as any).google.accounts.oauth2;
  await new Promise<void>((resolve, reject) => {
    tokenClient = oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      hint: opts.hint,
      hd: ALLOWED_DOMAIN || undefined,
      callback: (resp: any) => {
        if (resp.error) return reject(new Error(resp.error_description || resp.error));
        const granted = SCOPES.filter(s => s.startsWith('https://')).every(s =>
          oauth2.hasGrantedAllScopes(resp, s)
        );
        if (!granted) return reject(new Error('Oneness needs Drive, Gmail and Calendar access. Tick every permission and try again.'));
        accessToken = resp.access_token;
        tokenExpiresAt = Date.now() + Number(resp.expires_in || 3600) * 1000;
        resolve();
      },
      error_callback: (err: any) => reject(new Error(err?.message || err?.type || 'Sign-in cancelled.')),
    });
    tokenClient.requestAccessToken({ prompt: opts.prompt ?? 'select_account' });
  });
}

export function signOut() {
  const token = accessToken;
  accessToken = null;
  tokenExpiresAt = 0;
  const oauth2 = (window as any).google?.accounts?.oauth2;
  if (token && oauth2) oauth2.revoke(token, () => undefined);
}

async function api(url: string, init: RequestInit = {}): Promise<Response> {
  if (!hasValidToken()) throw new GoogleAuthExpired();
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...(init.headers || {}) },
  });
  if (res.status === 401) {
    accessToken = null;
    throw new GoogleAuthExpired();
  }
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      msg = j.error?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(`Google API error: ${msg}`);
  }
  return res;
}

async function apiJson<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await api(url, init);
  return res.json();
}

export async function getProfile(): Promise<GoogleProfile> {
  const p = await apiJson('https://openidconnect.googleapis.com/v1/userinfo');
  const email = String(p.email || '').toLowerCase();
  if (!p.email_verified) throw new Error('Google account email is not verified.');
  if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN.toLowerCase()}`)) {
    throw new Error(`Only @${ALLOWED_DOMAIN} accounts can use Oneness.`);
  }
  return { email, name: p.name || email, picture: p.picture, hd: p.hd };
}

// ---------------------------------------------------------------- Drive

const DRIVE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const folderCache = new Map<string, string>();

function q(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function findOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const key = `${parentId || 'root'}/${name}`;
  const cached = folderCache.get(key);
  if (cached) return cached;
  const query = [
    `name = '${q(name)}'`,
    `mimeType = '${FOLDER_MIME}'`,
    'trashed = false',
    parentId ? `'${parentId}' in parents` : `'root' in parents`,
  ].join(' and ');
  const found = await apiJson(`${DRIVE}/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=1`);
  let id: string = found.files?.[0]?.id;
  if (!id) {
    const created = await apiJson(`${DRIVE}/files?fields=id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: parentId ? [parentId] : undefined }),
    });
    id = created.id;
  }
  folderCache.set(key, id);
  return id;
}

// Oneness / a / b / c  -> folder id of c
export async function ensurePath(parts: string[]): Promise<string> {
  let parent = await findOrCreateFolder(ROOT_FOLDER_NAME);
  for (const p of parts) {
    parent = await findOrCreateFolder(p.replace(/[\\/]/g, '-').slice(0, 100) || 'Untitled', parent);
  }
  return parent;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  mimeType?: string;
}

async function multipartUpload(meta: any, body: Blob, fileId?: string): Promise<DriveFile> {
  const boundary = `oneness${Math.random().toString(36).slice(2)}`;
  const payload = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`,
    `--${boundary}\r\nContent-Type: ${body.type || 'application/octet-stream'}\r\n\r\n`,
    body,
    `\r\n--${boundary}--`,
  ]);
  const url = fileId
    ? `${DRIVE_UPLOAD}/files/${fileId}?uploadType=multipart&fields=id,name,webViewLink,mimeType`
    : `${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,name,webViewLink,mimeType`;
  return apiJson(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: payload,
  });
}

export async function uploadFile(file: Blob, name: string, pathParts: string[]): Promise<DriveFile> {
  const parent = await ensurePath(pathParts);
  return multipartUpload({ name, parents: [parent] }, file);
}

export async function moveFile(fileId: string, pathParts: string[]): Promise<DriveFile> {
  const target = await ensurePath(pathParts);
  const cur = await apiJson(`${DRIVE}/files/${fileId}?fields=parents`);
  const remove = (cur.parents || []).join(',');
  return apiJson(
    `${DRIVE}/files/${fileId}?addParents=${target}&removeParents=${remove}&fields=id,name,webViewLink,mimeType`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' }
  );
}

// Text out of PDFs, scans, images and Word files: Drive converts a copy to a Google Doc
// (with OCR), we export it as plain text, then delete the temporary copy.
export async function extractText(fileId: string): Promise<string> {
  const doc = await apiJson(`${DRIVE}/files/${fileId}/copy?fields=id&ocrLanguage=en`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'oneness-ocr-temp', mimeType: 'application/vnd.google-apps.document' }),
  });
  try {
    const res = await api(`${DRIVE}/files/${doc.id}/export?mimeType=text/plain`);
    return (await res.text()).replace(/^﻿/, '').trim();
  } finally {
    api(`${DRIVE}/files/${doc.id}`, { method: 'DELETE' }).catch(() => undefined);
  }
}

// ---- Live workspace data file (Oneness/oneness-data.json)

let dataFileId: string | null = null;

export async function loadData(): Promise<any | null> {
  const root = await ensurePath([]);
  const query = `name = '${DATA_FILE_NAME}' and '${root}' in parents and trashed = false`;
  const found = await apiJson(`${DRIVE}/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=1`);
  dataFileId = found.files?.[0]?.id || null;
  if (!dataFileId) return null;
  const res = await api(`${DRIVE}/files/${dataFileId}?alt=media`);
  return res.json();
}

export async function saveData(data: any): Promise<void> {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  if (dataFileId) {
    await multipartUpload({}, blob, dataFileId);
    return;
  }
  const root = await ensurePath([]);
  const f = await multipartUpload({ name: DATA_FILE_NAME, parents: [root] }, blob);
  dataFileId = f.id;
}

export function resetSession() {
  dataFileId = null;
  folderCache.clear();
}

// ---------------------------------------------------------------- Gmail

const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface MailSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export interface MailAttachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
}

export interface MailMessage extends MailSummary {
  body: string;
  attachments: MailAttachment[];
}

function header(msg: any, name: string): string {
  return (msg.payload?.headers || []).find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToText(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body?.innerText || doc.body?.textContent || '').trim();
}

export async function listMessages(query: string, max = 15): Promise<MailSummary[]> {
  const list = await apiJson(`${GMAIL}/messages?maxResults=${max}&q=${encodeURIComponent(query)}`);
  const ids: string[] = (list.messages || []).map((m: any) => m.id);
  return Promise.all(
    ids.map(async id => {
      const m = await apiJson(
        `${GMAIL}/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`
      );
      return {
        id,
        subject: header(m, 'Subject') || '(no subject)',
        from: header(m, 'From'),
        date: header(m, 'Date'),
        snippet: m.snippet || '',
      };
    })
  );
}

export async function getMessage(id: string): Promise<MailMessage> {
  const m = await apiJson(`${GMAIL}/messages/${id}?format=full`);
  let plain = '';
  let html = '';
  const attachments: MailAttachment[] = [];
  const walk = (part: any) => {
    if (!part) return;
    if (part.filename && part.body?.attachmentId) {
      attachments.push({ filename: part.filename, mimeType: part.mimeType, attachmentId: part.body.attachmentId });
    } else if (part.mimeType === 'text/plain' && part.body?.data) {
      plain += b64urlToText(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      html += b64urlToText(part.body.data);
    }
    (part.parts || []).forEach(walk);
  };
  walk(m.payload);
  return {
    id,
    subject: header(m, 'Subject') || '(no subject)',
    from: header(m, 'From'),
    date: header(m, 'Date'),
    snippet: m.snippet || '',
    body: (plain || htmlToText(html)).trim(),
    attachments,
  };
}

export async function getAttachment(messageId: string, a: MailAttachment): Promise<Blob> {
  const r = await apiJson(`${GMAIL}/messages/${messageId}/attachments/${a.attachmentId}`);
  return new Blob([b64urlToBytes(r.data)], { type: a.mimeType });
}

function encodeHeader(v: string): string {
  return /^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${btoa(unescape(encodeURIComponent(v)))}?=`;
}

// Creates a draft in the signed-in user's Gmail. Never sends.
export async function createDraft(p: { to: string; cc?: string; subject: string; body: string }): Promise<{ id: string; url: string }> {
  const headers = [
    p.to ? `To: ${p.to}` : '',
    p.cc ? `Cc: ${p.cc}` : '',
    `Subject: ${encodeHeader(p.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean);
  const mime = `${headers.join('\r\n')}\r\n\r\n${btoa(unescape(encodeURIComponent(p.body)))}`;
  const raw = btoa(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const d = await apiJson(`${GMAIL}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { raw } }),
  });
  return { id: d.id, url: `https://mail.google.com/mail/u/0/#drafts?compose=${d.message?.id || ''}` };
}

// ---------------------------------------------------------------- Calendar

const CAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  organizer: string;
  link: string;
}

export async function listUpcomingEvents(days = 14, max = 20): Promise<CalendarEvent[]> {
  const now = new Date();
  const until = new Date(now.getTime() + days * 86400000);
  const r = await apiJson(
    `${CAL}?singleEvents=true&orderBy=startTime&maxResults=${max}&timeMin=${now.toISOString()}&timeMax=${until.toISOString()}`
  );
  return (r.items || []).map((e: any) => ({
    id: e.id,
    summary: e.summary || '(no title)',
    description: htmlToText(e.description || ''),
    start: e.start?.dateTime || e.start?.date || '',
    organizer: e.organizer?.email || '',
    link: e.htmlLink || '',
  }));
}

// All-day event on the user's primary calendar.
export async function createAllDayEvent(p: { date: string; summary: string; description: string }): Promise<{ id: string; link: string }> {
  const d = new Date(`${p.date}T00:00:00`);
  const next = new Date(d.getTime() + 86400000);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  const e = await apiJson(CAL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: p.summary,
      description: p.description,
      start: { date: iso(d) },
      end: { date: iso(next) },
      transparency: 'transparent',
    }),
  });
  return { id: e.id, link: e.htmlLink || '' };
}
