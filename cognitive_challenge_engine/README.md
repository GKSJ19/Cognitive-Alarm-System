# Cognitive Challenge Engine

A working demo of the challenge engine from your mind map: 7 challenge
categories (Mathematical Problems, Logic Puzzles, Memory Challenges, Word
Games, Pattern Recognition, Riddles, Quick Quizzes), all generated live by
the Google Gemini API, served through a FastAPI backend, with a simple
browser UI.

## How it works

- **`challenge_generator.py`** — one tuned prompt per category (matching the
  subtypes in your mind map, e.g. arithmetic/percentages/algebra under Math,
  unscramble/synonym/antonym/vocab under Word Games). Calls `gemini-2.5-flash`
  with JSON-mode output and parses a strict JSON response: question, answer,
  optional multiple-choice options, and a one-line explanation.
- **`main.py`** — FastAPI app. Generates a challenge, stores the answer
  server-side keyed by a random id (so the client never sees the answer
  until it submits), and exposes an endpoint to check a submitted answer.
- **`static/index.html`** — single-page UI. The 7 categories render as nodes
  around a central "engine" core (mirroring your Excalidraw diagram); click
  a node or "Surprise me" to pull a fresh challenge, answer it, and see
  whether you were right.

## Setup

```bash
pip install -r requirements.txt
export GEMINI_API_KEY=your-gemini-key   # get one at aistudio.google.com/apikey
uvicorn main:app --reload
```

On Windows PowerShell, use `$env:GEMINI_API_KEY="your-gemini-key"` instead of
`export`.

Open **http://127.0.0.1:8000/** in a browser.

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List the 7 category ids + display labels |
| GET | `/api/challenge/{category}?difficulty=easy\|medium\|hard` | Generate one challenge in that category |
| GET | `/api/challenge/random?difficulty=...` | Generate one challenge in a random category |
| POST | `/api/challenge/{id}/answer` | Body: `{"answer": "..."}` — check an answer, get correctness + explanation |

## Notes for taking this from demo to production

- **Challenge store**: currently an in-memory Python dict — fine for a demo,
  but it resets on restart and won't work across multiple server workers.
  Swap it for Redis or a DB table with a short TTL (e.g. 5 minutes) per
  challenge id.
- **Retry/validation**: if Gemini's response isn't valid JSON (rare, but
  possible), `generate_challenge` will raise — you may want a retry-once
  wrapper around the API call in production.
- **Rate limiting / abuse**: add rate limiting on `/api/challenge/*` since
  each request costs an API call.
- **Fuzzy answer matching**: answers are currently checked as an exact
  case-insensitive string match. For things like math answers you may want
  numeric comparison, and for short-answer riddles you may want to accept
  close variants.
- **This connects to your `CognitiveAlarmBackend` Drive project** — if you
  connect Google Drive in this chat, I can pull the existing code there and
  wire this in (or merge it) instead of starting fresh.
