@AGENTS.md

# Rules for this project

- NEVER install, update or remove a dependency (npm/yarn/pnpm/npx) without an explicit "yes" from the user for that specific package. A question from the user is not approval. Ask first, wait for the answer.
- Never open, read, print or edit `.env.local` or any `.env*` file with real values.
- Scripts that need secrets (e.g. seed) are run by the user, never by Claude.
- Explanations to the user in Hebrew; code, identifiers and code comments in English.
