# Private CV staging

Place the authentic PDF here as `shaun-mathiasz-cv.pdf` and run `npm run cv:upload` after connecting a private Blob store. PDFs in this directory are ignored by Git and are never served by the app. No runtime filesystem fallback exists.

The original public CV has been moved here locally without changing its contents. The migration must upload and verify it before any release. Older deployments, Git history and downloaded copies require separate handling; moving this source file cannot revoke them.
