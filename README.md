# IRHAM ENTERPRISE

IRHAM ENTERPRISE is a responsive corporate website for international sourcing, export, import, auction bidding, and supplier connections.

## Technology stack

- React 18
- Vite 5
- Express
- Groq-powered optional chatbot
- Node.js test runner

## Project structure

```text
src/          Frontend React application
api/          Serverless API handlers
public/       Public website assets
picture/      Additional product photography
certificate/  Public company certificate images
tests/        Automated Node.js tests
server.js     Local Express server
```

## Installation

Requirements: Node.js 18 or newer and npm.

```bash
npm install
cp .env.example .env
```

Set environment values in `.env`. Never commit `.env` or real API credentials.

## Frontend

```bash
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Backend

```bash
npm start
```

The local API server normally runs at `http://localhost:3000`.

Vite proxies `/api` requests to the backend during local development.

## Environment variables

```bash
VITE_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=your_configured_model
PORT=3000
```

The chatbot uses Groq when `GROQ_API_KEY` is configured. Confirmed business answers remain available without an API key.

## Testing and build

```bash
npm test
npm run build
npm run preview
npm run build-production
```

The production build is written to `dist/`, which is excluded from Git.
