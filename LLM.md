# LLM Guide

Guidelines for AI assistants working on this Pipedrive + Stripe integration app.

---

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components (each in own folder with style.css)
│   ├── constants/          # Static config/data
│   └── utils/              # Frontend utilities
│
├── endpoints/              # Express API route handlers
├── database/               # Database layer (Drizzle ORM)
├── middlewares/            # Express middlewares
├── utils/                  # Backend utilities
│
├── server.js               # Express server entry point
├── config.js               # App configuration
└── public/                 # Static files
```

---

## Component Rules

1. **Each component gets its own folder** in `src/components/`
2. **Include a `style.css`** in each component folder
3. **Use default exports only** — no named exports
4. **Build reusable components** — don't dump UI inline in pages

---

## Preferences

- **Use SVGs** for charts/visualizations (not Chart.js)
- **Functional components** with hooks
- **BEM naming** for CSS classes

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 17 |
| Backend | Express.js |
| Database | PostgreSQL + Drizzle ORM |
| Auth | OAuth 2.0 + JWT |
| SDK | @pipedrive/app-extensions-sdk |

---

## OAuth Refresh Token Flow

Tokens are managed in `database/oauth.js`. The refresh flow:

1. **On API call** → `getValidTokens(userId, companyId)` checks if token expired
2. **If expired** → Calls `refreshAccessToken()` in `utils/pipedrive-api.js`
3. **Refresh request** → POST to `https://oauth.pipedrive.com/oauth/token` with:
   - `grant_type: refresh_token`
   - `refresh_token`, `client_id`, `client_secret`
4. **On success** → New tokens saved to `oauthTokens` table
5. **On failure** → Throws error, user must re-authorize

**Key files:**
- `database/oauth.js` → `getValidTokens()` handles auto-refresh
- `utils/pipedrive-api.js` → `refreshAccessToken()` makes the token request
