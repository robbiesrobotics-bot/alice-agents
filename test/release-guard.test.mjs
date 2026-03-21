import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { collectReleaseIssues, runReleaseGuard } from '../lib/release-guard.mjs';

const tempRoots = [];

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function createRepo({ version = '9.9.9', changelog = true, releaseNote = true, approved = true, tagged = true } = {}) {
  const repoRoot = join(tmpdir(), `alice-release-guard-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  tempRoots.push(repoRoot);

  mkdirSync(join(repoRoot, 'landing', 'content'), { recursive: true });
  mkdirSync(join(repoRoot, 'releases'), { recursive: true });

  writeFileSync(
    join(repoRoot, 'package.json'),
    JSON.stringify({ name: '@robbiesrobotics/alice-agents', version }, null, 2) + '\n',
  );
  writeFileSync(
    join(repoRoot, 'landing', 'content', 'changelog.md'),
    changelog ? `# Changelog\n\n## v${version} — 2026-03-20\n- Added release guard\n` : '# Changelog\n',
  );
  if (releaseNote) {
    writeFileSync(
      join(repoRoot, 'releases', `v${version}.md`),
      [
        `# v${version}`,
        '',
        `Status: ${approved ? 'approved' : 'draft'}`,
        '',
        '## Summary',
        '- Release summary',
        '',
        '## Announcement',
        'We shipped the release.',
        '',
        '## Channels',
        '- Changelog',
        '- Email',
      ].join('\n') + '\n',
    );
  }

  git(repoRoot, 'init');
  git(repoRoot, 'config', 'user.name', 'Release Guard Test');
  git(repoRoot, 'config', 'user.email', 'release-guard@example.com');
  git(repoRoot, 'add', '.');
  git(repoRoot, 'commit', '-m', 'test release');

  if (tagged) {
    git(repoRoot, 'tag', `v${version}`);
  }

  return repoRoot;
}

after(() => {
  for (const dir of tempRoots) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('release guard', () => {
  test('passes when tag, changelog, and approved release brief all exist', () => {
    const repoRoot = createRepo();
    assert.equal(collectReleaseIssues(repoRoot).length, 0);
    assert.equal(runReleaseGuard(repoRoot), 'Release guard passed for v9.9.9.');
  });

  test('fails when HEAD is missing the matching tag', () => {
    const repoRoot = createRepo({ tagged: false });
    const issues = collectReleaseIssues(repoRoot);
    assert.ok(issues.some((issue) => issue.includes('matching git tag v9.9.9')));
  });

  test('fails when release brief is missing approval', () => {
    const repoRoot = createRepo({ approved: false });
    const issues = collectReleaseIssues(repoRoot);
    assert.ok(issues.some((issue) => issue.includes('Status: approved')));
  });

  test('fails when changelog entry is missing', () => {
    const repoRoot = createRepo({ changelog: false });
    const issues = collectReleaseIssues(repoRoot);
    assert.ok(issues.some((issue) => issue.includes('landing/content/changelog.md')));
  });
});
