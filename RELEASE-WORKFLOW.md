# A.L.I.C.E. Release Workflow Memory

Use this checklist whenever we ship an `alice-agents` change that should also appear on the marketing site.

1. Make and verify the package changes locally.
2. Run `npm test` in the package repo before versioning anything.
3. Bump the package version in `package.json`.
4. Add the matching release note to the landing changelog in `landing/content/changelog.md`.
5. Create `releases/vX.Y.Z.md` from `releases/TEMPLATE.md`, write the Clara-ready announcement, and mark it `Status: approved` only after review.
6. Commit the package repo changes and the landing repo changes separately.
7. Tag the package repo commit with the exact version tag, for example `git tag v1.4.6`.
8. Push the package repo and tag to `robbiesrobotics-bot/alice-agents`.
9. Publish the package with `npm publish`.
10. Push the landing repo to `robbiesrobotics-bot/alice-landing`.
11. Deploy the landing site with `vercel deploy --prod --yes` if the automatic deploy needs a retry.
12. Sanity-check the live changelog page on `getalice.av3.ai`.

## Guardrail

`npm publish` now runs `npm run release:check` automatically via `prepublishOnly`.
Publish will be blocked unless all three are true:

1. `HEAD` has the exact matching git tag like `v1.4.6`
2. `landing/content/changelog.md` contains the matching version entry
3. `releases/v1.4.6.md` exists, contains `## Announcement` and `## Channels`, and is marked `Status: approved`
