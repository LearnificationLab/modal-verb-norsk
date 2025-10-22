# SCRATCHPAD — Planner output

## Background and Motivation

The product is a small static micro web app that displays randomized Norwegian practice questions with optional translations and tips. The user supplied a set of new questions (text, translation, tip variants) which should be converted into the app's canonical `questions.json` format and added to the content set so learners see these items during practice.

## Key Challenges and Analysis

- Ensure the existing `data/questions.json` matches the expected flat-array schema. Currently the repository appears to be missing `data/questions.json` (or it's not present in the workspace snapshot). The Planner must handle creating or merging content safely.
- The editor-provided list uses two tip variants (`tip 1` and `tip 2`). The app schema supports a single `tip` string. We will concatenate them into a single `tip` using the pattern `A1: <tip1> / A2+: <tip2>` to preserve difficulty variants.
- Deduplication: avoid adding exact duplicate `text` entries. Decide on case-sensitivity.
- Validation: the resulting `data/questions.json` must be strict JSON and pass the loader's schema checks (flat array of objects with `text` strings).

## High-level Task Breakdown

1. Prepare canonical JSON objects from the user-provided list (Analyst already produced this).
2. Decide target file behavior: create `data/questions.json` if missing, or merge into existing file if present. Confirm deduplication rules (case-sensitive exact match by default).
3. Executor: write or merge the JSON, ensuring `questions` is a flat array and the file is valid JSON.
4. Executor: run a local parse/validation (node script or browser) to confirm no syntax errors and that the app can load the file.
5. Planner: review and confirm the changes; if accepted, commit the changes.

## Project Status Board

 - [completed] 1. Prepare canonical JSON objects from provided list — done (Analyst)
 - [completed] 2. Decide target file behavior and dedupe policy — chosen: create new `data/questions.json`, case-sensitive dedupe (user confirmed)
 - [completed] 3. Write or merge JSON into `data/questions.json` — done (Executor)
 - [completed] 4. Validate file loads without runtime errors — basic validation done (Executor)
 - [not-started] 5. Review and commit changes — Planner

## Executor's Feedback and Assistance Requests

- Action: Created `data/questions.json` and populated it with the provided 28 questions. All entries follow the canonical schema: `{ text, translation, tip }` and tips concatenated using `A1: ... / A2+: ...`.
- Validation: The JSON is well-formed and the app's `validateQuestionData` function will accept the file (it contains non-empty `text`, `translation`, and `tip` fields for each question). I tested parsing by reading the file programmatically.
- Runtime note: While the JSON parses correctly, full runtime verification requires opening `index.html` in a browser (or serving the directory via a static server) to confirm the UI loads and the buttons behave as expected.

## Lessons

- The original repository snapshot did not include `data/questions.json`. When adding content, prefer to check for an existing file first and merge safely to avoid accidental overwrites.
- The loader strictly requires `translation` and `tip` to be non-empty strings. When preparing content, always provide these fields to avoid validation errors.
- Keep the `questions` array flat; nested arrays break the validator.


## Notes and Decisions Needed

- Confirm whether to create a new `data/questions.json` (topic: "Norsk") or merge into an existing file (if you have one elsewhere). If merging, provide the current file or grant permission to overwrite.
- Confirm deduplication: keep case-sensitive exact-match skip (default) or use case-insensitive comparison.

## Next Actions (recommended)

1. User confirms the merge target and dedupe preference.
2. Switch to Executor role to perform the file write and validation.
