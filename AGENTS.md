# Architecture rules

- Keep candidate psychological instruments in the admin-only, draft-only methodology catalog, separate from existing runnable surveys and stored responses; unverified materials must not change pupil scoring.
- Catalogue entries describe candidates and source-review notes, not validated question definitions or machine-learning training data; a versioned questionnaire bank and assessment pipeline need separate implementation after source and professional review.
- Scope specialist access through current designated classroom membership on every related data path; stale assignments must not retain pupil access.
- Persist survey alerts in the answer transaction and chat signals through an edge-only idempotent RPC before AI calls; AI failures must not lose safety signals.
- The database scoring trigger is a compatibility snapshot of existing scoring, not validation of instruments; change it only together with professionally reviewed scoring rules and compatibility tests.
- Share deterministic chat signal detection between the edge function and client, and show local emergency support without waiting for AI or successful persistence.