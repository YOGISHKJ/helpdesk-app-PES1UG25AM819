# Campus Help Desk Board

Yogish K J | PES1UG25AM819

## Run locally

1. Install Node.js dependencies with `npm install`.
2. Set `DATABASE_URL` and `REDIS_URL` in `.env.local` (see `.env.example`).
3. Create the `helpdesk` database, then run `scripts/setup.sql` with `psql` while connected as a PostgreSQL administrator.
4. Start Redis at `localhost:6379`.
5. Run `npm run dev` and open http://localhost:3000.

## Viva notes

PostgreSQL stores all requests permanently. GET `/api/requests` checks Redis key `help:latest`; a cache hit returns Redis data, while a miss reads the latest ten PostgreSQL rows and caches the result for 60 seconds. A new post or resolve action deletes that cache key. Redis errors are ignored for request storage and list reads, so PostgreSQL continues serving the board. `/api/views` increments `help:views` atomically with Redis `INCR`.

Demo order: post a request; refresh to see PostgreSQL as the source; refresh again within 60 seconds to see Redis; post another request to clear the cache; reload to see PostgreSQL again and the view count change; submit an empty form to see validation. Use “Mark resolved” on an open request to show the resolved badge and strike-through.
