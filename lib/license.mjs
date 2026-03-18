// lib/license.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const LICENSE_DIR = join(homedir(), '.alice');
const LICENSE_FILE = join(LICENSE_DIR, 'license');
const VALIDATE_URL = 'https://getalice.av3.ai/api/license/validate';
const KEY_REGEX = /^ALICE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function readStoredLicense() {
  try {
    if (!existsSync(LICENSE_FILE)) return null;
    return readFileSync(LICENSE_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

export function storeLicense(key) {
  mkdirSync(LICENSE_DIR, { recursive: true });
  writeFileSync(LICENSE_FILE, key.trim(), 'utf8');
}

export function isValidFormat(key) {
  return KEY_REGEX.test(key?.trim()?.toUpperCase());
}

export async function validateLicenseRemote(key) {
  // Returns { valid: boolean, plan: string, message?: string }
  try {
    const res = await fetch(`${VALIDATE_URL}?key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { valid: false, message: 'Validation service unavailable' };
    return await res.json();
  } catch {
    // Network error — fail open (allow install, validate next time)
    return { valid: true, plan: 'pro', message: 'offline' };
  }
}

export async function checkProLicense() {
  // Returns: { licensed: boolean, key: string|null, source: 'stored'|'none' }
  const stored = readStoredLicense();
  if (stored && isValidFormat(stored)) {
    return { licensed: true, key: stored, source: 'stored' };
  }
  return { licensed: false, key: null, source: 'none' };
}
