# TripAI

A frontend-only, AI-assisted travel and homestay recommendation platform built with React, Vite, and Tailwind CSS. Built as a final-year engineering project demo — no backend required.

## Running locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Demo accounts

Use these on the Login page, or tap the "Traveler demo" / "Owner demo" buttons to autofill them:

| Role      | Email               | Password      |
|-----------|---------------------|---------------|
| Traveler  | aarav@example.com   | password123   |
| Owner     | sita@example.com    | password123   |

You can also register a new account as either role — it's added to in-memory mock data and persists for the session (not across page refreshes, since there's no backend).

## How the project is organized

```
src/
├── components/
│   ├── shared/      # Button, Modal, Toast, Pagination, etc — generic, reusable
│   ├── cards/        # DestinationCard, HomestayCard, RecommendationCard, etc
│   └── layout/        # Navbar, Footer, Sidebar
├── layouts/             # PublicLayout, TravelerLayout, OwnerLayout (each wraps <Outlet/>)
├── pages/
│   ├── public/            # Home, Destinations, Homestays, Login, Register, etc
│   ├── traveler/           # Traveler-only dashboard pages
│   └── owner/               # Owner-only dashboard pages
├── context/                  # AuthContext (login/session), AppContext (bookings/favorites/reviews/homestays/toasts)
├── data/                        # Mock JSON-like data + the recommendation engine
├── hooks/                         # useDelayedLoading (fake loading states for list pages)
└── routes/                          # ProtectedRoute (role-based route guarding)
```

## The "AI Recommendation" engine

This is a **rule-based scoring system**, not a trained ML model — there's no backend in this project, so it's built to look and behave like one while staying fully explainable. See `src/data/recommendations.js`.

For each destination, it computes a weighted score across:
- **Travel type match** (30%) — does it match Adventure/Nature/Cultural/etc?
- **Activity match** (30%) — keyword-matches your selected activities against the destination's description and things-to-do list
- **Budget fit** (20%) — how close the destination's estimated cost is to your stated budget
- **Region match** (10%) — does it match your preferred region?
- **Overall rating** (10%) — a small boost for consistently well-rated destinations

The top-ranked destinations are returned along with a **human-readable reason** built from which factors scored highest, plus their best-rated nearby homestays.

### Swapping in a real backend later

The calling code (`RecommendationForm.jsx`) only depends on `getRecommendations(preferences)` returning the same shape — a list of `{ destination, score, reason, suggestedHomestays }`. To connect a real backend (e.g. one using NLP intent extraction on a free-text query, plus sentiment-ranked review scores), you'd:
1. Replace the body of `getRecommendations` with an API call
2. Keep the return shape the same
3. Everything else (the form, the cards, the loading state) keeps working unchanged

## Notes

- All data is mock data in `src/data/` — there is no backend, no real authentication, and nothing persists except your login session (stored in `localStorage` so refreshing doesn't log you out).
- Images are loaded from Unsplash via direct URLs — an internet connection is needed to see them.
- This was built for a project demo/presentation, not production use (no real auth security, no real payment flow, etc).
