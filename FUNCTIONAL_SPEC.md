# Functional Specification — Topic Shuffle (Micro Web Game)

## Problem Statement

Language teachers need a lightweight, embeddable web activity that prompts learners with random questions, offers optional translation and hints, and encourages reflection. The app must be simple to host as a static site and easy to embed in an LMS or Wix page.

## User Stories

- As a learner, I want to receive a random question so I can practice speaking or writing spontaneously.
- As a learner, I want an optional translation of the question so I can check meaning when I'm unsure.
- As a learner, I want an optional tip/answer variant so I can scaffold my response.
- As a learner, I want to move to the next question with a single button click.
- As a teacher, I want the app to be embeddable (iframe) and require no server-side components.

## Functional Requirements (must-haves)

1. Load questions dynamically from an external JSON file (for example `questions.json`) and display a random question from that data each time the learner requests a new question.
2. Provide a `Translate` button that reveals a translation for the current question.
3. Provide a `Tip` button that reveals a single suggested answer or hint (`tip`) for the current question; the tip should be optional and toggleable.
4. Provide a `Next` button to move to the next random question.
5. UI should be simple, accessible, and mobile-friendly (tailwind CSS allowed).
6. The app must be static (HTML/CSS/JS) and embeddable in an iframe.

## Editing and adding questions (user-focused)

- Teachers or content editors must be able to add, remove, or edit questions by updating the local `questions.json` file that ships with the app (for example `data/questions.json`).
- The process for adding questions should be simple and documented for non-technical teachers: add a new object with `text`, `translation`, and optional `tip` into the `questions` array and save the file. The app will load that updated file on page reload.
- The app must validate the file and show a clear, user-friendly error if the JSON is malformed or does not match the expected shape (for example if `questions` is not an array of question objects). The error message should show the expected minimal example and mention common pitfalls (trailing commas, wrong nesting).
- The app should not require teachers to run build steps or use npm; editing the JSON and re-uploading the static files should be sufficient.

## Acceptance Criteria

- On page load, the app fetches and parses an external JSON file (`questions.json`) in the same origin and loads the question set — PASS.
- Given a loaded page, when the learner clicks `Next`, a question from the loaded data is shown (not always the same) — PASS.
- Given a shown question, when the learner clicks `Translate`, a translation text appears beneath the question — PASS.
- Given a shown question, when the learner clicks `Tip`, the tip (single hint) appears — PASS.
- The app records whether the learner viewed the tip or translation implicitly by tracking those counts — PASS.
- If the JSON file is missing, malformed, or cannot be fetched (CORS/host issues), the app shows a clear error message explaining how to place the `questions.json` file next to the app and provides a small sample format — PASS.

- Given a `questions.json` that follows the required shape, adding a new question object and reloading the page displays the new question at some point when cycling through random questions — PASS.
- Given a `questions.json` with a common structural mistake (for example, the `questions` value is a nested array instead of an array of question objects), the app shows a clear validation error explaining the problem and includes a tiny snippet of the expected shape — PASS.
- The app's validation guidance includes a short human-readable checklist for teachers: (1) ensure `questions` is an array of objects, (2) each object has `text` (required), `translation` (recommended), and `tip` (optional), (3) avoid trailing commas — PASS.

## JSON file format requirement

- The app expects a `questions.json` file that follows the example you provided. The root may include optional metadata (for example `topic`) and must include a `questions` array. Each question object should include the question text and include a translation and a tip.

- Canonical schema (JSON):

```json
{
  "topic"?: string,
  "questions": [
    {
      "text": string,
      "translation": string,
      "tip": string
    }
  ]
}
```

- Example:

```json
{
  "topic": "Mathematics",
  "questions": [
    { "text": "What is the value of π (pi) to two decimal places?", "tip": "3 and some more digits", "translation": "¿Cuál es el valor de π (pi) con dos decimales?" },
    { "text": "What is the square root of 64?", "tip": "It's a whole number", "translation": "¿Cuál es la raíz cuadrada de 64?" }
  ]
}
```

- Notes for robustness:
  - The loader will validate that `questions` is an array and that each question has a `text` string. If validation fails the app will show a helpful error message with the expected shape and the example above.
  - Teachers can replace `questions.json` with their own file following this schema. Avoid trailing commas (strict JSON) when editing the file.

### Quick user guidance (for non-technical editors)

- To add a question, open `data/questions.json` in a text editor and add a new object inside the `questions` array. Example minimal entry:

```json
{ "text": "Hvor bor du?", "translation": "Where do you live?", "tip": "Jeg bor i Oslo." }
```

- Save the file and refresh the page. If the app reports a validation error, follow the on-screen advice — it will show the expected structure and a small example you can copy.

## Handling user-provided question lists (analyst guidance)

When a content editor (teacher) supplies a list of questions to add to the product, follow these rules to keep the app robust and predictable:

- Accepted input formats: plain text lists, CSV-like lists, or a JSON array of question objects. The preferred and canonical format is strict JSON following the schema in this document.
- Tip variant mapping: The product schema stores a single `tip` string per question. If the editor provides two tips (for example `tip 1` and `tip 2` representing A1 / A2+ variants), convert them to a single string using this pattern:

  A1: <tip 1> / A2+: <tip 2>

  This preserves the learner-facing labels and matches existing `questions.json` entries.

- Translation requirement: Each question should include a `translation` string when available. If a translation is missing, use an empty string but mark the entry as "translation-missing" in a short review checklist.

- Deduplication policy: By default, skip adding a new question if its `text` exactly equals an existing question `text` (case-sensitive match). If the editor requests duplicates to be preserved, allow them explicitly.

- File target: Append new questions to `data/questions.json` by default. If the editor prefers a separate file, accept `data/custom_questions.json` but note the app only loads `questions.json`; merging will be required before deployment.

- Validation: Before saving the updated `questions.json`:
  1. Ensure the file is strict JSON (no trailing commas).
  2. Ensure `questions` is a flat array of objects (not a nested array). The current repository contains a `data/questions.json` where `questions` is accidentally wrapped in an extra array — that must be fixed to a flat array before appending. (See "Actionable issues" below.)
  3. Ensure each question object has at least a non-empty `text` string.

- Actionable issues the team should resolve before content import:
  - Fix the existing `data/questions.json` if `questions` is a nested array (for example: `"questions": [ [ { ... } ] ]` should be `"questions": [ { ... } ]`). Failure to fix this will break the loader's validation.

- Acceptance criteria for importing the provided list:
  1. The updated `data/questions.json` is valid JSON and the `questions` value is a flat array — PASS.
  2. Each new entry matches the schema: `{ "text": string, "translation": string, "tip": string }` — PASS.
  3. No parser or runtime errors occur when the app loads the file in the browser console — PASS.
  4. Newly added questions appear when cycling through random questions after a page reload — PASS.

### Minimal transformation example

Given an editor-provided item:

Text: Hva kan du gjøre hjemme?
Translation: Что ты умеешь делать дома?
Tip 1: Jeg kan lage mat og vaske klær.
Tip 2: Jeg kan lage middag, rydde rommet og passe barna når det trengs.

Transform to the canonical JSON object:

```json
{ "text": "Hva kan du gjøre hjemme?", "translation": "Что ты умеешь делать дома?", "tip": "A1: Jeg kan lage mat og vaske klær. / A2+: Jeg kan lage middag, rydde rommet og passe barna når det trengs." }
```

If the team agrees with these rules, an Executor can perform the file edits: (1) fix the flat-array bug if present, (2) transform each provided item to the canonical object shape, (3) deduplicate according to the policy, and (4) append and validate the result.

## Data model (client-side)

- Question: { text, translation, tip }
- Session stats (in-memory or localStorage): { tipShown, translationsShown }

Per-question transient state (not stored in JSON): { currentQuestionId, tipViewed: boolean, translationViewed: boolean }

## Assumptions

- The teacher will provide an external `questions.json` file or edit the sample `questions.json` that ships with the app. The app will fetch that file from the same origin.
- If the app is embedded cross-origin, the teacher is responsible for hosting the JSON on the same host or enabling proper CORS headers (out-of-scope for the app itself).
- No user accounts or cloud storage are required for version 1.
- Accessibility considerations (keyboard navigation, readable color contrast) will be basic but considered.

## Out of Scope

- User authentication, server-side analytics, or collaborative features.
