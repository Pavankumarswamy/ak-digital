// localStorage helpers for demo admin
export interface Submission {
  id?: string;
  service: string;
  data: Record<string, string>;
  createdAt: string;
}

const SUB_KEY = "ak_submissions";
const CONTACT_KEY = "ak_contacts";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function saveSubmission(s: Submission) {
  const items = read<Submission>(SUB_KEY);
  items.unshift({ ...s, id: crypto.randomUUID() });
  write(SUB_KEY, items);
}
export function getSubmissions(): Submission[] {
  return read<Submission>(SUB_KEY);
}
export function deleteSubmission(id: string) {
  write(SUB_KEY, read<Submission>(SUB_KEY).filter((s) => s.id !== id));
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}
export function saveContact(c: ContactMessage) {
  const items = read<ContactMessage>(CONTACT_KEY);
  items.unshift({ ...c, id: crypto.randomUUID() });
  write(CONTACT_KEY, items);
}
export function getContacts(): ContactMessage[] {
  return read<ContactMessage>(CONTACT_KEY);
}

// Auth (demo only — NOT secure)
const AUTH_KEY = "ak_admin_auth";
export const ADMIN_EMAIL = "admin@akdigital.com";
export const ADMIN_PASSWORD = "ADMIN@AKDIG!@#";

export function loginAdmin(email: string, password: string) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1";
}
export function logoutAdmin() {
  localStorage.removeItem(AUTH_KEY);
}
