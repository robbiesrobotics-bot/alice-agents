import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = join(__dirname, '..');

export function readPackageVersion(repoRoot = DEFAULT_REPO_ROOT) {
  const packagePath = join(repoRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  return String(pkg.version || '').trim();
}

export function getExpectedTag(version) {
  return `v${version}`;
}

function git(repoRoot, args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function getTagsOnHead(repoRoot = DEFAULT_REPO_ROOT) {
  const output = git(repoRoot, ['tag', '--points-at', 'HEAD']);
  return output ? output.split('\n').map((line) => line.trim()).filter(Boolean) : [];
}

export function hasChangelogEntry(repoRoot, version) {
  const changelogPath = join(repoRoot, 'landing', 'content', 'changelog.md');
  if (!existsSync(changelogPath)) return false;
  const changelog = readFileSync(changelogPath, 'utf8');
  return changelog.includes(`## v${version} — `);
}

export function getReleaseNotePath(repoRoot, version) {
  return join(repoRoot, 'releases', `v${version}.md`);
}

export function getReleaseNoteChecks(repoRoot, version) {
  const releaseNotePath = getReleaseNotePath(repoRoot, version);
  if (!existsSync(releaseNotePath)) {
    return {
      exists: false,
      hasTitle: false,
      approved: false,
      hasAnnouncementSection: false,
      hasChannelsSection: false,
      path: releaseNotePath,
    };
  }

  const content = readFileSync(releaseNotePath, 'utf8');
  return {
    exists: true,
    hasTitle: new RegExp(`^#\\s+v${version}\\b`, 'm').test(content),
    approved: /^Status:\s*approved\s*$/im.test(content),
    hasAnnouncementSection: /^##\s+Announcement\s*$/im.test(content),
    hasChannelsSection: /^##\s+Channels\s*$/im.test(content),
    path: releaseNotePath,
  };
}

export function collectReleaseIssues(repoRoot = DEFAULT_REPO_ROOT) {
  const version = readPackageVersion(repoRoot);
  const expectedTag = getExpectedTag(version);
  const issues = [];

  if (!version) {
    issues.push('package.json is missing a version.');
    return issues;
  }

  const tagsOnHead = getTagsOnHead(repoRoot);
  if (!tagsOnHead.includes(expectedTag)) {
    issues.push(`HEAD is missing the matching git tag ${expectedTag}.`);
  }

  if (!hasChangelogEntry(repoRoot, version)) {
    issues.push(`landing/content/changelog.md is missing the v${version} entry.`);
  }

  const releaseNote = getReleaseNoteChecks(repoRoot, version);
  if (!releaseNote.exists) {
    issues.push(`Missing release brief: releases/v${version}.md.`);
  } else {
    if (!releaseNote.hasTitle) {
      issues.push(`releases/v${version}.md is missing the '# v${version}' title.`);
    }
    if (!releaseNote.approved) {
      issues.push(`releases/v${version}.md must include 'Status: approved' before publish.`);
    }
    if (!releaseNote.hasAnnouncementSection) {
      issues.push(`releases/v${version}.md is missing the '## Announcement' section.`);
    }
    if (!releaseNote.hasChannelsSection) {
      issues.push(`releases/v${version}.md is missing the '## Channels' section.`);
    }
  }

  return issues;
}

export function runReleaseGuard(repoRoot = DEFAULT_REPO_ROOT) {
  const version = readPackageVersion(repoRoot);
  const issues = collectReleaseIssues(repoRoot);

  if (issues.length) {
    const formatted = issues.map((issue) => `- ${issue}`).join('\n');
    throw new Error(
      `Release guard blocked publish for v${version}.\n${formatted}\n\n` +
        'Fix the release brief, changelog, and git tag before running npm publish again.',
    );
  }

  return `Release guard passed for v${version}.`;
}

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isEntrypoint) {
  try {
    console.log(runReleaseGuard());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
