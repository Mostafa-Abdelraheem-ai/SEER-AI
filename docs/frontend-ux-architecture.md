# Frontend UX Architecture

## Goals

The frontend is designed around one main idea:

- users should not need to understand the input type before asking for help

The UI now acts as a guided assistant instead of a set of disconnected forms.

## Structure

Main folders:

- `components/`
  - reusable UI blocks
  - unified analysis workspace
  - result visualization
  - upload previews
- `pages/`
  - route-level wrappers and dashboards
- `hooks/`
  - shared frontend behavior such as `useSafetyAssistant`
- `services/`
  - API request helpers
  - telemetry/event logging

## Core frontend patterns

### Unified analysis workspace

`components/AnalysisWorkspace.jsx` is the main interaction surface.

It supports:

- text paste
- email paste or `.eml` upload
- link input
- hash input
- image upload with preview
- audio upload with preview
- file upload for attachment checks
- auto-detection of likely input type

### Shared assistant state

`hooks/useSafetyAssistant.js` manages:

- selected mode
- auto-detect mode
- file preview lifecycle
- loading state
- error state
- result state
- submission flow

### Result design

The result experience uses:

- risk verdict badge
- confidence
- fallback/degraded-mode notice
- plain-language summary
- detected tactics
- evidence and citations
- raw data view for advanced users

### Frontend observability

`services/telemetry.js` provides a simple analytics-ready event bus for:

- API latency
- API errors
- UI actions
- render timing

`api/client.js` records request timing and logs failures centrally.

## Main route model

- `/dashboard`
  - landing experience plus embedded assistant
- `/message-check`
  - assistant preset for general analysis
- `/voice-check`
  - assistant preset for voice mode
- `/link-check`
  - assistant preset for link mode
- `/image-privacy`
  - assistant preset for image mode
- `/history`
  - filtered archive of past checks
- `/history/:id`
  - detailed result view

## Design decisions

- Keep route compatibility while unifying the underlying UX.
- Make advanced details available without overwhelming first-time users.
- Prefer one reusable workspace over many duplicated forms.
- Surface AI confidence and evidence in a human-readable way.
