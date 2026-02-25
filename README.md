# Utilio — Slack Developer Toolbox

A compact Slack utility bot built on **Cloudflare Workers**.  
Provides developer-focused commands (encode/decode, UUIDs, timestamps, generators),
with full **Slack OAuth** and workspace management backed by **D1**.

**Tech:** TypeScript, Cloudflare Workers, Hono, D1, Vitest  
**Integrations:** Slack (OAuth, Events, Interactions)

## Features
- Secure Slack OAuth flow and workspace onboarding
- Command-based architecture with modular handlers
- Slack request verification and rate-limiting middleware
- App Home publishing and interactive flows
- Unit-tested with Vitest and Cloudflare API mocks
