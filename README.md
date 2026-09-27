# BYTECODEE API

Express 5 API with PostgreSQL persistence through Prisma, cookie-based sessions, email delivery through Brevo, and Socket.IO messaging. This backend is deployed independently from the client application.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- PostgreSQL database

## Local Development

Install dependencies:

```sh
npm install
```

Create a `.env` file with the required settings:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
ADMIN_REGISTRATION_CODE="replace-with-a-long-random-value"
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="sender@example.com"
BREVO_SENDER_NAME="BYTECODEE"
CLIENT_URL="http://localhost:5173"
PORT=5001
NODE_ENV=development
```

Generate the Prisma client and apply local migrations:

```sh
npm run build
npx prisma migrate dev
```

Start the API:

```sh
npm run dev
```

The API listens on `http://localhost:5001` by default. Check `/api/v1/health` to verify API and database connectivity.

## Commands

| Command                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `npm run dev`               | Start the API with nodemon               |
| `npm run build`             | Generate the Prisma client               |
| `npm start`                 | Start the API in production              |
| `npx prisma migrate dev`    | Create/apply development migrations      |
| `npx prisma migrate deploy` | Apply committed migrations in production |

## Environment Variables

Required: `DATABASE_URL`, `ADMIN_REGISTRATION_CODE`, `BREVO_API_KEY`, and `BREVO_SENDER_EMAIL`.

Optional: `BREVO_SENDER_NAME` (defaults to `BYTECODEE`), `CLIENT_URL` (defaults to `http://localhost:5173`), `PORT` (defaults to `5001`), and `NODE_ENV` (defaults to `development`). `CLIENT_URL` must be the frontend origin only, with no path or trailing slash; it controls both HTTP and Socket.IO CORS.

## Deployment

Configure the service root as this directory. Run `npm run build` during the build step and `npm start` to launch the server. Set the database and Brevo values in the hosting provider's secret environment settings, then set `CLIENT_URL` to the exact production frontend origin. Apply migrations with `npx prisma migrate deploy` as part of the release process.

Never commit `.env` files or share database credentials, API keys, or admin registration codes.
