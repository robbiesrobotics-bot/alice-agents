# A.L.I.C.E. Release Workflow Memory

Use this checklist whenever we ship an `alice-agents` change that should also appear on the marketing site.

1. Make and verify the package changes locally.
2. Run `npm test` in the package repo before versioning anything.
3. Bump the package version in `package.json`.
4. Add the matching release note to the landing changelog in `landing/content/changelog.md`.
5. Commit the package repo changes and the landing repo changes separately.
6. Push the package repo to `robbiesrobotics-bot/alice-agents`.
7. Publish the package with `npm publish`.
8. Push the landing repo to `robbiesrobotics-bot/alice-landing`.
9. Deploy the landing site with `vercel deploy --prod --yes` if the automatic deploy needs a retry.
10. Sanity-check the live changelog page on `getalice.av3.ai`.
