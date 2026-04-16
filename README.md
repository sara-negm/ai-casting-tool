# AI Casting Tool

An AI-powered talent discovery and ranking tool for performance creative agencies. Given a natural-language campaign brief, the tool extracts structured search criteria, filters an internal creator database, and ranks matches using data-grounded reasoning with benchmark comparisons.

Built with React, TypeScript, Vite, and Claude (Anthropic API).

## Problem

Talent sourcing is spread across multiple platforms (TikTok, Instagram, YouTube) and performance data from past ad campaigns lives separately in a data warehouse. Casting directors spend hours manually cross-referencing profiles, follower counts, engagement rates, and ad metrics to find the right creators for a brief.

## Solution

This tool unifies platform metrics and ad performance data into a single view, then uses a structured AI pipeline to match creators to campaign briefs with transparent, auditable reasoning.

### How the AI pipeline works

The tool does not send a single prompt and render the response. It decomposes the task into distinct steps with clear separation between AI and deterministic code:

1. **Extract criteria (AI)** --- Claude parses a natural-language brief like *"high-performing female fitness creators under 500k for a supplement brand"* into structured filters: `{ niche: "Fitness", gender: "Female", maxFollowers: 500000, performance: "high" }`. The extracted filters are shown as chips so the user can verify what the system understood.

2. **Filter dataset (code)** --- A deterministic TypeScript function applies the extracted filters against the internal creator database. No AI involved --- fast, auditable, predictable.

3. **Rank for fit (AI)** --- Claude scores and ranks the filtered creators using per-niche and per-platform benchmark data computed from the full dataset. Every reason must cite concrete numbers and deltas (e.g. *"CTR +27% vs Skincare avg"*). Each creator gets a comparative positioning statement explaining how they stack up against peers, not just why they're a good fit in isolation.

### Per-creator features

- **Performance Overview** --- unified view of platform metrics (followers, engagement) and ad warehouse data (CTR, completion rate) with source attribution
- **AI confidence score** --- 0--100 composite score with a visual bar and methodology explanation
- **Structured highlights** --- 2--4 scannable bullets per creator, each grounded in specific data points
- **Comparative reasoning** --- every creator gets a "Why ranked #N" or "How this ranks vs peers" statement showing tradeoff thinking, not just justification
- **Tiered badges** --- Best Match / Strong Match / Good Match with clear score thresholds
- **Research with AI** --- Claude uses web search to compile a live research brief on any creator (recent partnerships, audience sentiment, red flags)
- **Generate outreach email** --- one-click personalized pitch email using the creator's niche, past brands, and the current campaign context
- **View profile** --- direct link to their TikTok/Instagram/YouTube page

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite
- **AI**: Claude Sonnet 4.5 via Anthropic API (web search tool for research)
- **Icons**: Lucide React
- **Hosting**: Vercel (Edge Function proxy for API key security)

## Project structure

```
src/
  api/
    claudeProxy.ts      # Shared fetch helper --- all AI calls go through /api/claude
    extractFilters.ts    # Step 1: brief -> structured filters (AI)
    rankTalent.ts        # Step 3: filtered set -> scored rankings (AI)
    generateEmail.ts     # Per-card outreach email generation (AI)
    researchTalent.ts    # Per-card web research summary (AI + web search)
  components/
    SearchBar.tsx        # Live keyword search + AI search trigger
    FilterBar.tsx        # Manual filter dropdowns (platform, niche, gender, size)
    ExtractedChips.tsx   # Visual chips showing what AI extracted from the brief
    PipelineTrace.tsx    # 3-step pipeline visualization
    TalentGrid.tsx       # Card list with rank-aware ordering
    TalentCard.tsx       # Individual creator card with stats, actions, AI reasoning
    SiteHeader.tsx       # Title + result count
    SelectionBar.tsx     # Multi-select floating action bar
    ContactModal.tsx     # Bulk message modal
  data/
    talent.ts            # Hardcoded creator database (simulates platform + warehouse join)
  utils/
    filters.ts           # Deterministic filter logic for manual dropdowns
    search.ts            # Client-side keyword search across all fields
    stats.ts             # Benchmark computation (per-niche, per-platform averages)
    followers.ts         # Follower count formatting and tier classification
    socialLinks.ts       # Platform profile URL builder
  types.ts               # Shared TypeScript interfaces
api/
  claude.ts              # Vercel Edge Function --- server-side Anthropic API proxy
```

## Setup

### Prerequisites

- Node.js 18+
- An Anthropic API key

### Local development

```bash
git clone https://github.com/sara-negm/ai-casting-tool.git
cd ai-casting-tool
npm install
```

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:8000. The Vite dev server includes a middleware proxy that routes `/api/claude` requests to Anthropic using the server-side key.

### Production (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add `ANTHROPIC_API_KEY` in Project > Settings > Environment Variables
4. Deploy

The Edge Function at `api/claude.ts` handles all Anthropic API calls server-side. The API key never reaches the client bundle.

## Architecture decisions

- **3-step pipeline over single prompt**: separating extraction, filtering, and ranking makes the AI's reasoning auditable and the filtering deterministic. A single prompt would conflate structure parsing with scoring, making it harder to debug or explain.
- **Benchmarks computed in code, not by AI**: per-niche and per-platform averages are calculated in TypeScript and passed to the ranking prompt as context. This ensures the AI cites real numbers rather than hallucinating statistics.
- **Comparative reasoning required**: the ranking prompt mandates that every creator gets a positioning statement against their peers, not just a justification for their own score. This surfaces tradeoffs and prevents justification bias.
- **Server-side API proxy**: the Anthropic key lives in a Vercel Edge Function, not in the client bundle. The Vite dev middleware mirrors this locally so the same `/api/claude` endpoint works in both environments.
- **Data source attribution**: platform metrics and ad performance data are visually labeled by source to communicate the multi-system data join, even though the prototype uses a single hardcoded dataset.
