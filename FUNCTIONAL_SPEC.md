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

## Acceptance Criteria

- On page load, the app fetches and parses an external JSON file (`questions.json`) in the same origin and loads the question set — PASS.
- Given a loaded page, when the learner clicks `Next`, a question from the loaded data is shown (not always the same) — PASS.
- Given a shown question, when the learner clicks `Translate`, a translation text appears beneath the question — PASS.
- Given a shown question, when the learner clicks `Tip`, the tip (single hint) appears — PASS.
- The app records whether the learner viewed the tip or translation implicitly by tracking those counts — PASS.
- If the JSON file is missing, malformed, or cannot be fetched (CORS/host issues), the app shows a clear error message explaining how to place the `questions.json` file next to the app and provides a small sample format — PASS.

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
