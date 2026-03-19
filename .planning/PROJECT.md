# AI Review Agent

## What This Is

An AI quality-gate and refinement engine that takes raw user input, transforms it into a structured prompt, critiques it with multiple reviewers, iterates on high-impact fixes, and returns an improved final output. It is not a chatbot: it is a transparent review pipeline with realtime visibility into every stage, score, and loop decision. The primary user is a single operator who needs trustworthy, debuggable, production-grade output quality control.

## Core Value

Every decision, score, and loop in the review process is visible and explainable in realtime.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] System accepts raw input and creates an AI-optimized structured prompt.
- [ ] System runs multi-agent adversarial review and scores output quality across defined dimensions.
- [ ] System applies targeted revisions and loops until deterministic stop conditions are met.
- [ ] UI streams full pipeline activity in realtime with no black-box behavior.
- [ ] System persists complete audit history for replay, debugging, and analytics.

### Out of Scope

- Multi-tenant organization support in v1 — single-user auth is selected for initial delivery.
- Non-realtime batch-only UX in v1 — transparency requires progressive, live updates.
- Broad domain-specific custom rubrics for every vertical in v1 — start with robust default dimensions and extensible architecture.

## Context

- Product scope is a production-grade AI Review Agent with a strict transparency requirement.
- Selected stack direction: Next.js (full-stack), SSE transport, single-user auth.
- Quality is prioritized over cheapest or fastest execution.
- The system must expose the complete loop process, including reviewer evidence, scoring deltas, and stop rationale.
- Required capabilities include optimizer, classifier, rubric selector, reviewer swarm, aggregator/judge, revision engine, loop controller, output formatter, and event stream.

## Constraints

- **Runtime/Framework**: Next.js full-stack architecture — implementation must fit App Router and server runtime patterns.
- **Realtime**: SSE-first streaming — all pipeline progress and decisions must be pushed progressively.
- **Auth**: Single-user access model in v1 — avoid overbuilding multi-user role systems initially.
- **Quality Priority**: Higher-quality review and judging behavior takes precedence over lowest cost and minimum latency.
- **Determinism/Trust**: Loop control, scoring logic, and stop conditions must be explicit, reproducible, and auditable.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Next.js for full-stack app | Keeps UI, API routes, and streaming integration cohesive in one stack | — Pending |
| Use SSE as default realtime transport | Simpler progressive server->client updates and strong support for event timeline UX | — Pending |
| Start with single-user auth | Reduce complexity and ship core value faster | — Pending |
| Optimize for quality-first review behavior | Product value depends on high-signal critique and reliable loop decisions | — Pending |

---
*Last updated: 2026-03-18 after initialization*
