# Social Mitra — Backend (NestJS)

Standalone REST API for the Social Mitra platform. Runs **separately** from the
frontend (`../app`). Shares the same PostgreSQL database via Drizzle ORM.

## Stack
- NestJS 10 (Express)
- Drizzle ORM + PostgreSQL (`pg`)
- class-validator DTOs, cookie-based JWT session auth
- Same session cookie (`kimi_sid`, HS256/APP_SECRET) as the legacy backend, so
  sessions are interchangeable during the migration.

## Run
```bash
npm install
cp .env.example .env   # fill in values (defaults target the local Docker Postgres)
npm run start:dev      # http://localhost:3001/api  (watch mode)
# or
npm run build && npm run start:prod
```
The local DB is the Docker container `local-postgres`, database `social_mitra`.
Schema is shared with the frontend app; sync with `npm run db:push`.

## Endpoints (this pass — core slice)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | public | email + password sign-up |
| POST | `/api/auth/login` | public | email + password |
| POST | `/api/auth/logout` | session | clears cookie |
| GET | `/api/auth/me` | session | current user (no passwordHash) |
| PATCH | `/api/auth/role` | session | set role |
| POST | `/api/auth/complete-onboarding` | session | |
| GET | `/api/oauth/callback` | public | Kimi OAuth callback |
| GET | `/api/campaigns` | public | active campaigns |
| GET | `/api/campaigns/mine` | session | brand's campaigns |
| GET | `/api/campaigns/:id` | public | |
| POST | `/api/campaigns` | session | create |
| PATCH | `/api/campaigns/:id` | session | update (owner) |
| POST | `/api/campaigns/:id/apply` | session | influencer applies |
| GET | `/api/campaigns/:id/applications` | session | owner only |
| GET | `/api/campaigns/applications/mine` | session | influencer's applications |
| GET | `/api/brands` | public | |
| GET | `/api/brands/me` | session | own profile |
| PUT | `/api/brands/me` | session | upsert profile |
| GET | `/api/brands/:id` | public | |

## Still to migrate
The remaining ~19 tRPC routers (match, payment, barter, affiliate, instagram,
admin, etc.) still live in `../app/api` and are served by the frontend's dev
server. Port them into NestJS modules incrementally, then remove `../app/api`.
