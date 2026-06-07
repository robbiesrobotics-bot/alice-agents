import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";

const {
  getHermesBaseDir,
  getHermesProfileDir,
  getHermesConfigPath,
  getHermesSkillsDir,
  getHermesAliceConfigPath,
} = await import("../lib/hermes-paths.mjs");

describe("Hermes profile-aware paths", () => {
  test("defaults to the root ~/.hermes profile", () => {
    const env = {};
    const home = "/Users/example";
    assert.equal(getHermesBaseDir({ env, home }), join(home, ".hermes"));
    assert.equal(getHermesProfileDir({ env, home }), join(home, ".hermes"));
    assert.equal(getHermesConfigPath({ env, home }), join(home, ".hermes", "config.yaml"));
  });

  test("HERMES_PROFILE targets ~/.hermes/profiles/<name> for profile-local installs", () => {
    const env = { HERMES_PROFILE: "rob" };
    const home = "/Users/example";
    const profileDir = join(home, ".hermes", "profiles", "rob");
    assert.equal(getHermesProfileDir({ env, home }), profileDir);
    assert.equal(getHermesConfigPath({ env, home }), join(profileDir, "config.yaml"));
    assert.equal(getHermesSkillsDir({ env, home }), join(profileDir, "skills"));
    assert.equal(getHermesAliceConfigPath({ env, home }), join(profileDir, ".alice-config.json"));
  });

  test("HERMES_HOME wins when Hermes runs with an explicit profile home", () => {
    const env = { HERMES_HOME: "/tmp/hermes-profile", HERMES_PROFILE: "ignored" };
    assert.equal(getHermesBaseDir({ env, home: "/Users/example" }), "/tmp/hermes-profile");
    assert.equal(getHermesProfileDir({ env, home: "/Users/example" }), "/tmp/hermes-profile");
    assert.equal(getHermesSkillsDir({ env, home: "/Users/example" }), join("/tmp/hermes-profile", "skills"));
  });

  test("default profile name remains the root Hermes home", () => {
    const env = { HERMES_PROFILE: "default" };
    const home = "/Users/example";
    assert.equal(getHermesProfileDir({ env, home }), join(home, ".hermes"));
  });
});
