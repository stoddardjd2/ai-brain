# AI Brain - Review Agent Scaffold

This repository contains a bootstrapped Next.js + TypeScript application for a transparent AI review/refinement workflow with realtime streaming and deterministic loop controls.

## Included in this bootstrap

- Next.js App Router project (`app/*`) with dashboard panel scaffold.
- API route scaffolding for run start, stream, and manual stop.
- Baseline review engine modules in `src/review/*`.
- Shared contracts and schema validation in `src/contracts/*` (using `zod`).
- In-memory event bus and audit store scaffolding.
- Baseline lint and test setup (`eslint`, `vitest`, `testing-library`).

## Commands

- `npm run dev` - start local development server.
- `npm run lint` - run lint checks.
- `npm run typecheck` - run TypeScript checks.
- `npm run test` - run unit tests once.
- `npm run test:watch` - run tests in watch mode.
- `npm run test:coverage` - run tests with coverage output.

## Notes

The current implementation is intentionally scaffold-first for the bootstrap task. It includes typed module boundaries and deterministic placeholder logic so follow-up tasks can focus on behavior and production integrations.
