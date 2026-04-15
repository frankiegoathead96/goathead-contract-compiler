# goathead-contract-compiler

A monorepo for the Goathead Contract Compiler app.

## Getting started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with a real PostgreSQL URL:
   ```text
   DATABASE_URL="postgres://user:password@host:port/database"
   ```
4. Initialize the database schema:
   ```bash
   pnpm db:push
   ```
5. Start the app:
   ```bash
   pnpm dev
   ```

This will start the backend API and the frontend app together.

## Deployment

For Vercel monorepo deployment, the frontend is in `artifacts/contract-compiler` and the backend is in `artifacts/api-server`.

