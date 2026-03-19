import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

function loadJson(pathParts) {
  return JSON.parse(readFileSync(join(ROOT, ...pathParts), 'utf8'));
}

describe('orchestrator aliases', () => {
  for (const templateName of ['agents-starter.json']) {
    test(`${templateName} exposes A.L.I.C.E. display name and aliases`, () => {
      const template = loadJson(['templates', templateName]);
      const orchestrator = template.find((agent) => agent.id === 'olivia');

      assert.ok(orchestrator, 'orchestrator should exist');
      assert.equal(orchestrator.name, 'A.L.I.C.E.');
      assert.match(orchestrator.description, /Alice/i);
      assert.deepEqual(orchestrator.extraConfig.groupChat.mentionPatterns, [
        '@alice',
        '@a.l.i.c.e.',
        '@olivia',
        'alice',
        'a.l.i.c.e.',
        'olivia',
      ]);
    });
  }
});
