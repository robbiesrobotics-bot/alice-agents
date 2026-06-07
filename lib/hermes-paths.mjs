import { join } from "node:path";
import { homedir } from "node:os";

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Return the Hermes data home. HERMES_HOME is treated as authoritative because
 * Hermes profile runs export it for subprocesses; otherwise use ~/.hermes.
 */
export function getHermesBaseDir({ env = process.env, home = homedir() } = {}) {
  return clean(env.HERMES_HOME) || join(home, ".hermes");
}

/**
 * Return the active Hermes profile directory for writes. The default profile
 * uses ~/.hermes; named profiles use ~/.hermes/profiles/<profile> unless
 * HERMES_HOME already points at an explicit profile home.
 */
export function getHermesProfileDir({ env = process.env, home = homedir(), profile = null } = {}) {
  const explicitHome = clean(env.HERMES_HOME);
  if (explicitHome) return explicitHome;

  const baseDir = getHermesBaseDir({ env, home });
  const profileName = clean(profile) || clean(env.HERMES_PROFILE) || clean(env.HERMES_PROFILE_NAME);
  if (!profileName || profileName === "default") return baseDir;
  return join(baseDir, "profiles", profileName);
}

export function getHermesConfigPath(options = {}) {
  return join(getHermesProfileDir(options), "config.yaml");
}

export function getHermesSkillsDir(options = {}) {
  return join(getHermesProfileDir(options), "skills");
}

export function getHermesMemoriesDir(options = {}) {
  return join(getHermesProfileDir(options), "memories");
}

export function getHermesAliceConfigPath(options = {}) {
  return join(getHermesProfileDir(options), ".alice-config.json");
}
