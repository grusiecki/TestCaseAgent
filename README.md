Tester Agent — AI‑powered Test Case Generator MVP 
Overview
Tester Agent is an internal web application for QA teams that automates generating complete test cases from pasted documentation (user stories, acceptance criteria) and exports them directly to a TestRail‑compatible CSV .
The MVP runs in an invite‑only model, with authentication on Supabase and Row Level Security (RLS) policies ensuring per‑user data isolation .
Value
The tool reduces the time needed to create test cases, standardizes the format, and helps capture edge cases that are easy to miss during a manual process .
Export to TestRail’s Test Case (Text) format enables immediate import and continued work within existing QA workflows without manual conversion .
Key features
	•	Generating TC titles (0–20) with preview, deletion, and the ability to add custom entries before expanding them into full test cases .
	•	Automatically expanding each title into a full TC (Preconditions, Steps, Expected Result) with editing, autosave in localStorage, and navigation between TCs .
	•	Exporting a single‑row CSV (UTF‑8) compatible with TestRail “Test Case (Text)” with headers: Title, Steps, Expected Result, Preconditions .
	•	A dashboard with project list, statistics and history, project detail view, and CSV re‑export .
	•	RLS in Supabase: users see only their own projects/test cases; policies based on auth.uid() .
Architecture
	•	Frontend: Astro as a “server‑first” framework + islands of interactivity, with React components for interactive parts and TypeScript for typing .
	•	UI: Tailwind CSS v4 and shadcn/ui for accessible, composable components with solid default styles .
	•	Backend: Supabase (PostgreSQL, Auth, RLS, Storage), browser SDK with RLS enforced at the database layer .
	•	AI: OpenRouter — unified API to many models (OpenAI/Anthropic/Google, etc.), with parameter control and fallbacks .
	•	Deployment: Docker images and hosting on DigitalOcean (App Platform or droplet), with a container registry and a simple deployment flow .
Tech stack
	•	Astro 5: framework optimized for fast sites and SSR/SSG, with React integration .
	•	React 19: stable release with improvements in RSC, forms, and performance .
	•	Tailwind v4: new engine, simplified configuration, and a modern CSS utilities API .
	•	shadcn/ui: a set of composable, accessible components with "open code" for full customizability .
	•	Supabase (Auth, DB, RLS, Storage): authorization and RLS policies directly in Postgres .
	•	OpenRouter: unified API for LLMs, Bearer authorization, parameters, and limits .
	•	Docker + DigitalOcean: image build, registry, deployment via App Platform or droplet .
	•	Testing: Vitest for unit and integration tests, Playwright for E2E and API tests, React Testing Library for component testing .
Requirements
	•	Node.js 18+ and pnpm/yarn/npm for local work with Astro/React .
	•	Supabase account with a project, configured Auth, and RLS enabled .
	•	OpenRouter API key and a selected LLM model .
	•	Docker for local containerization and/or deployment .
Quick start (local)
	1.	Clone the repository and install dependencies (pnpm/yarn/npm) .
	2.	Configure .env (Supabase URL/anon key, OpenRouter API key, model) .
	3.	Run the Astro dev server and sign in via Supabase Auth (invite‑only) .
Sample .env:
# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# OpenRouter
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openrouter/auto

# App
JWT_MAX_AGE_DAYS=7
MAX_INPUT_CHARS=5000
MAX_TITLES_PER_SESSION=20
Supabase configuration (short)
	•	Enable RLS for the projects and test_cases tables, then add policies based on auth.uid() .
	•	Ensure the FK relationship: test_cases.project_id -> projects.id, and select only by the user’s projects .
Example SELECT policy (pattern):
create policy "Users can select own projects"
on public.projects for select
using (user_id = auth.uid());
AI integration (OpenRouter)
	•	Communication with models via OpenRouter Responses/Chat/Completions; Bearer auth; prompt parameters and limits per documentation .
	•	Recommended: fallback routing/model selection and error/timeout handling on the client side .
Application workflow
	•	Stage 1 — Input: textarea with 100–5000 character validation, character counter, and a “Generate Test Cases” button once requirements are met .
	•	Stage 2 — Titles: a list of 0–20 proposals with removal/addition, counter, and session limit .
	•	Stage 3 — Details: automatic generation of fields (Preconditions, Steps, Expected Result), editing and autosave, Prev/Next navigation .
	•	Stage 4 — Export: project summary, export to a TestRail‑compatible CSV (Title, Steps, Expected Result, Preconditions), and a 1–5 rating .
Export to TestRail (CSV)
	•	“Test Case (Text)” template: single row per test case; all fields as long text in a single cell, UTF‑8, headers in the first row .
	•	TestRail distinguishes single‑row and multi‑row layouts; the MVP uses single‑row mapping .
Sample CSV headers:
Title,Steps,Expected Result,Preconditions
Error handling and resilience
	•	AI errors: retry and fallback prompt on malformed JSON or network errors, with a safe user‑facing message .
	•	Timeouts: cut off long requests and allow regeneration .
	•	Offline/network: cache in localStorage and synchronize when connectivity returns .
	•	Write errors: preserve work locally, client‑side retry, and messages after repeated failures .
Security and RLS
	•	Enforce RLS on all tables accessible from the frontend; policies like “SELECT WHERE user_id = auth.uid()” limit visibility to the owner’s data .
	•	Input sanitization and validation on the backend, length limits, and avoiding injection via policies and typing .
	•	Sessions: JWT tokens in secure storage and refresh before expiry according to Supabase Auth configuration .
UI/UX
	•	Tailwind v4: high performance, simplified setup, modern API, and built‑in content detection mechanisms .
	•	shadcn/ui: “open code,” full customizability, consistent component composition patterns .
	•	Astro + React: server‑first rendering and islands of interactivity with efficient React 19 integration .
Build and run in Docker
	•	Docker images provide portable application execution with required dependencies in a single package .
	•	Basic flow: Dockerfile → build → run container locally → push to registry for deployment .
Local run example:
docker build -t tester-agent:local .
docker run --env-file .env -p 4321:4321 tester-agent:local
Deployment on DigitalOcean
	•	App Platform: deploy from a container image in DO Container Registry or another registry, configure environment variables and scaling .
	•	Droplet: alternatively, self‑managed deployment with preinstalled Docker and a restart policy for stability .
Tips: expose the correct port, add environment variables (Supabase/OpenRouter keys), monitor deployment logs .
CI/CD (outline)
	•	Pipeline: image build, basic tests, push to registry, and rollout to the target environment upon approval .
	•	Container registry: use DO Container Registry or Docker Hub with version tags and release channels .
	•	GitHub Actions: automated test execution on every push and pull request .
Testing strategy
	•	Multi‑level approach: static code analysis (ESLint/Prettier), unit tests, component tests, integration tests, E2E tests, API tests, and non‑functional tests .
	•	Test pyramid: focus on unit and integration tests as the foundation, with critical user flows covered by E2E tests .
	•	Priorities: P1 (Critical) — project creation flow, authentication, data persistence; P2 (High) — dashboard features, title editing, CSV export; P3 (Medium) — form validation, edge cases, responsiveness; P4 (Low) — minor UI elements .
	•	Acceptance criteria: >80% code coverage for business logic, all P1 and P2 scenarios passing, no critical or blocking bugs .
	•	Test environments: local (unit/integration), staging/test on DigitalOcean (E2E, performance, UAT) with separate Supabase instance .
	•	Tools: Vitest (test runner), React Testing Library (component tests), Playwright (E2E and API tests), GitHub Actions (CI/CD automation) .
Key test areas
	•	Authentication: login, logout, password reset, session management .
	•	Project creation: documentation input validation, title generation, title editing (add/remove/modify up to 20) .
	•	Detail generation: AI integration, navigation between test cases, manual editing with autosave, error handling .
	•	Dashboard: project list with pagination, project deletion (soft delete), statistics display .
	•	CSV export: data preview, file generation, TestRail compatibility .
	•	API endpoints: all CRUD operations, input validation (Zod schemas), error handling, rate limiting .
	•	Middleware: rate limiting, payload size limits, authorization checks .
Running tests
Unit and integration tests (Vitest)
	•	Run all unit tests: `npm test` or `npm run test`
	•	Run tests in watch mode: `npm run test:watch`
	•	Run tests with coverage: `npm run test:coverage`
	•	Run specific test file: `npm test -- path/to/test.test.ts`
	•	Run specific test suite: `npm test -- -t "test suite name"`
	•	Run tests in UI mode: `npm run test:ui`
Examples:
# Run all unit tests
npm test

# Run validation tests only
npm test -- src/components/dashboard/utils/__tests__/validation.test.ts

# Run tests matching pattern
npm test -- -t "validateProject"

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
E2E tests (Playwright)
	•	Run all E2E tests: `npm run test:e2e`
	•	Run E2E tests in headed mode: `npm run test:e2e -- --headed`
	•	Run specific E2E test file: `npm run test:e2e -- tests/e2e/auth.e2e.test.ts`
	•	Run E2E tests in UI mode: `npm run test:e2e -- --ui`
	•	Debug E2E tests: `npm run test:e2e -- --debug`
Examples:
# Run all E2E tests
npm run test:e2e

# Run authentication tests only
npm run test:e2e -- tests/e2e/auth.e2e.test.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode with Playwright Inspector
npm run test:e2e -- --debug

# Run in UI mode
npm run test:e2e -- --ui
Test reports and debugging
	•	Unit test results: displayed in terminal with verbose output
	•	Coverage reports: generated in `coverage/` directory (HTML report at `coverage/index.html`)
	•	E2E test reports: generated in `playwright-report/` directory
	•	E2E test artifacts: screenshots and videos saved in `test-results/` on failure
	•	View Playwright report: `npx playwright show-report`
CI/CD integration
	•	Tests run automatically on every push and pull request via GitHub Actions
	•	Unit tests must pass before E2E tests are executed
	•	Coverage thresholds enforced: 80% lines, 80% functions, 75% branches, 80% statements
	•	Failed tests block deployment to staging/production environments
MVP boundaries
	•	No roles/sharing or team editing, no direct integrations with TestRail/Jira, no advanced analytics, no dark mode, and no keyboard shortcuts .
	•	Generation and interface output in English only at this stage on the AI side .
Roadmap (post‑MVP)
	•	Model selection in OpenRouter, test template library, and export to Jira/Azure DevOps/Zephyr .
	•	API integration with TestRail and team/collab features, expanded analytics .
	•	Multilingual interface and content generation .
Success metrics
	•	CSV Export Rate: share of projects completed with a CSV export — key adoption metric .
	•	Time to First Export: time from registration to first export — onboarding effectiveness metric .
	•	AI Generation Success Rate and Average Generation Time: stability and speed of calls to OpenRouter .
	•	User Satisfaction Score (post‑export rating): qualitative user feedback .
Developer tips
	•	TestRail: in the import wizard choose the single‑row layout and map the Title/Steps/Expected Result/Preconditions columns .
	•	Supabase RLS: remember to enable RLS and test policies for SELECT/INSERT/UPDATE/DELETE separately .
	•	OpenRouter: plan retry/fallback and token limits, log response times and error codes .
	•	Testing: run unit/integration tests with `npm test` or `npm run test:watch`; run E2E tests with `npm run test:e2e`; aim for >80% code coverage on new business logic .
	•	Test data: use at least two test users to verify data isolation; prepare documentation samples of varying lengths (150–4500 words) and edge cases (special characters, long strings) .
License
License information will be added before the repository is made public or with the first release version .
