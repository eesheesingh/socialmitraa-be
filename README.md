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

## How to push code to your GitHub account

This repo is managed separately from the frontend (`../app`). To push changes:

1. **Set your Git identity** (inside this folder):
   ```bash
   cd backend
   git config user.name "eesheesingh"
   git config user.email "eesheesingh@users.noreply.github.com"
   ```

2. **Check the remote:**
   ```bash
   git remote -v
   # should point to https://github.com/eesheesingh/socialmitraa-be.git
   ```

3. **Stage, commit, and push:**
   ```bash
   git add .
   git commit -m "your commit message"
   git push origin main
   ```

4. **Authentication:** GitHub does not accept account passwords for `git push`.
   You need a **Personal Access Token (PAT)**:
   - Go to https://github.com/settings/tokens/new
   - Select the **repo** scope
   - Generate and copy the token
   - When prompted for a password during `git push`, paste the PAT

   The PAT is stored in `.env.local` as `GITHUB_TOKEN` for this project.
   `.env.local` is gitignored, so it will not be committed.
