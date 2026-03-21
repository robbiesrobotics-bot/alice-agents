// lib/license.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const LICENSE_DIR = join(homedir(), '.alice');
const LICENSE_FILE = join(LICENSE_DIR, 'license');
const VALIDATE_URL = 'https://getalice.av3.ai/api/license/validate';
const KEY_REGEX = /^ALICE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const GRACE_PERIOD_MS = 72 * 60 * 60 * 1000;
const REVALIDATE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function parseLicenseRecord(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed?.key) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  return {
    key: trimmed,
    plan: 'pro',
    status: 'validated',
    validatedAt: null,
    updatedAt: null,
    source: 'legacy',
  };
}

function createLicenseRecord(key, data = {}) {
  return {
    key: key.trim().toUpperCase(),
    plan: data.plan || 'pro',
    status: data.status || 'validated',
    validatedAt: data.status === 'validated' ? (data.validatedAt || nowIso()) : (data.validatedAt || null),
    graceUntil: data.status === 'grace' ? (data.graceUntil || new Date(Date.now() + GRACE_PERIOD_MS).toISOString()) : null,
    updatedAt: nowIso(),
    transport: data.transport || null,
    source: data.source || 'local',
  };
}

function shouldRevalidate(record) {
  if (!record?.validatedAt) return true;
  const validatedAt = Date.parse(record.validatedAt);
  if (Number.isNaN(validatedAt)) return true;
  return Date.now() - validatedAt >= REVALIDATE_INTERVAL_MS;
}

export function readStoredLicense() {
  try {
    if (!existsSync(LICENSE_FILE)) return null;
    return parseLicenseRecord(readFileSync(LICENSE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export function storeLicense(key, data = {}) {
  mkdirSync(LICENSE_DIR, { recursive: true });
  const record = createLicenseRecord(key, data);
  writeFileSync(LICENSE_FILE, JSON.stringify(record, null, 2) + '\n', 'utf8');
  return record;
}

export function isValidFormat(key) {
  return KEY_REGEX.test(key?.trim()?.toUpperCase());
}

export async function validateLicenseRemote(key) {
  // Returns { valid: boolean, plan?: string, message?: string, transient?: boolean, graceEligible?: boolean, transport?: string }
  const normalizedKey = key.trim().toUpperCase();
  const postBody = JSON.stringify({ key: normalizedKey });

  try {
    const res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: postBody,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok && [404, 405, 415].includes(res.status)) {
      const fallback = await fetch(`${VALIDATE_URL}?key=${encodeURIComponent(normalizedKey)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!fallback.ok) {
        return {
          valid: false,
          message: 'Validation service unavailable',
          transient: fallback.status >= 500,
          graceEligible: isValidFormat(normalizedKey),
          transport: 'get',
        };
      }
      return { ...(await fallback.json()), transport: 'get' };
    }
    if (!res.ok) {
      return {
        valid: false,
        message: res.status >= 500 ? 'Validation service unavailable' : 'License key not recognized',
        transient: res.status >= 500,
        graceEligible: res.status >= 500 && isValidFormat(normalizedKey),
        transport: 'post',
      };
    }
    return { ...(await res.json()), transport: 'post' };
  } catch {
    return {
      valid: false,
      message: 'Validation service unavailable',
      transient: true,
      graceEligible: isValidFormat(normalizedKey),
      transport: 'post',
    };
  }
}

export async function checkProLicense(options = {}) {
  // Returns: { licensed: boolean, key: string|null, source: 'stored'|'none' }
  const record = readStoredLicense();
  if (!record || !isValidFormat(record.key)) {
    return { licensed: false, key: null, source: 'none' };
  }

  if (record.status === 'grace') {
    const graceUntil = Date.parse(record.graceUntil || '');
    if (!Number.isNaN(graceUntil) && graceUntil > Date.now()) {
      return {
        licensed: true,
        key: record.key,
        source: 'grace',
        provisional: true,
        graceUntil: record.graceUntil,
        needsRevalidation: true,
      };
    }
    return { licensed: false, key: null, source: 'expired_grace', message: 'Temporary grace period expired' };
  }

  const shouldRefresh = options.revalidate === true || shouldRevalidate(record);
  if (shouldRefresh) {
    const refreshed = await validateLicenseRemote(record.key);
    if (refreshed.valid) {
      const stored = storeLicense(record.key, {
        status: 'validated',
        plan: refreshed.plan || record.plan || 'pro',
        transport: refreshed.transport,
        source: 'remote',
      });
      return {
        licensed: true,
        key: stored.key,
        source: 'revalidated',
        provisional: false,
        validatedAt: stored.validatedAt,
        needsRevalidation: false,
      };
    }

    if (refreshed.transient) {
      return {
        licensed: true,
        key: record.key,
        source: 'stored',
        provisional: false,
        validatedAt: record.validatedAt,
        needsRevalidation: true,
        message: refreshed.message,
      };
    }

    return { licensed: false, key: null, source: 'invalid', message: refreshed.message || 'License key not recognized' };
  }

  return {
    licensed: true,
    key: record.key,
    source: record.source || 'stored',
    provisional: false,
    validatedAt: record.validatedAt,
    needsRevalidation: false,
  };
}
