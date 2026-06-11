# Acrehub Buying Circles — Module Index

This index ties together the five phase specs for the Acrehub Buying Circles module.

## What this module is

Acrehub Buying Circles enables smaller buyers to jointly explore, qualify for, and purchase large agricultural land parcels — which are typically cheaper per acre than farm plots but unaffordable for individual smaller buyers. It also provides AcrehubIndia (the services arm) a layered execution model for coordinating buyer groups, legal/revenue facilitation, site visits, vendor work, and ongoing post-purchase governance.

Positioning: marketplace + coordination + services + execution + ongoing stewardship. **Not** a securities product, **not** a CIS, **not** a fractional investment platform.

## The five-phase architecture

| Phase | Spec file | Scope summary | Effort | When to start |
|---|---|---|---|---|
| **1** | `buying-circles-spec.md` | Interest capture, opportunity pages, admin leads, listing integration | ~1 week | Now (lawyer copy review first) |
| **2** | `buying-circles-phase-2-spec.md` | Buying circle creation, private rooms, members, milestones, site visits, documents | ~3 weeks | After Phase 1 has 20+ qualified leads |
| **3** | `buying-circles-phase-3-spec.md` | Service request workflow, vendor CRM, quotes, buyer approval, service updates | ~4-6 weeks | After Phase 2 + at least one informal service delivered |
| **4** | `buying-circles-phase-4-spec.md` | Lead scoring, multi-role team, templates, dashboards, audit log | ~3 weeks | After Phase 3 + team has grown beyond one admin |
| **5** | `buying-circles-phase-5-spec.md` | Post-purchase governance, expenses, voting, exits, annual reviews | ~4-5 weeks | After at least one circle has completed registration |

**Total effort estimate:** ~15-18 weeks of Claude Code work across the five phases, assuming sequential execution.

## What stays constant across all phases

Five things never change regardless of phase:

1. **Compliance positioning** — never a securities/CIS product; always "expression of interest / coordination tool"; lawyer review prerequisite for legal outcomes; clear separation of government fees + vendor cost + AcrehubIndia fee in every cost display.
2. **NRI/OCI gating** — agricultural / farmhouse / plantation purchases by NRI/OCI route to legal review automatically.
3. **No money in software** — all of Phase 1-5 records intent, status, scope, and approval. No payment gateway, no escrow, no automated transfers. Money flows happen outside the platform, on paper / via bank / via lawyer.
4. **Privacy controls** — member identity defaults to masked / first-name-only; phone numbers never auto-visible to other members; cross-circle data isolation enforced via RLS at every layer.
5. **No automated AI legal opinions** — disclaimers everywhere; lawyer review required for anything legally consequential.

## What changes between phases

| Concern | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Users** | Public (interest only) | + Authenticated members in circles | (same) | + Multi-role team | (same + post-purchase members) |
| **Tables** | 2 new | +8 new | +5 new | +5 new (+ views) | +7 new |
| **Routes** | 8 new | +14 new | +9 new | +10 new | +11 new |
| **Money tracked** | None | None | Three-column estimates (read-only) | (same) | Expense ledger + dues |
| **Decisions** | Admin-only | Admin-only | Admin (+ buyer approval summary) | + Member-initiated requests | + Member voting (advisory) |
| **AcrehubIndia revenue** | None | None | Service fees recorded | + Maintenance subscriptions modeled | Recurring maintenance |

## Cross-phase dependencies

- **Phase 2 depends on Phase 1** for `co_buy_interests` (leads convert into circle members)
- **Phase 3 depends on Phase 2** for `co_buy_circles` (service requests attach to circles)
- **Phase 4 extends Phase 1-3** — it doesn't add new core entities, just enriches existing ones
- **Phase 5 depends on Phase 2 + 3** — a circle must have completed registration (Phase 2's `completed` status) to enter post-purchase; Phase 3 services remain available post-purchase as recurring

This means you can't skip phases. Phase 3 without Phase 2 doesn't make sense (no circles to attach services to). Phase 5 without Phase 3 means you'd be tracking post-purchase expenses with no service framework to coordinate the maintenance work.

## Branch + merge strategy

For each phase, the build cycle should be:

```
1. Read the spec file and prior CLAUDE.md
2. git checkout -b feature/buying-circles-phase-N
3. Run the 5 sequential Claude Code prompts in the spec's section 11 (or equivalent)
4. Each prompt produces one logical commit
5. Manual QA per spec testing checklist
6. Compliance copy lawyer review (where required)
7. Open PR to main
8. Soft-launch via direct outreach before public promotion
```

Do NOT have multiple phase branches open simultaneously — they will create messy merge conflicts because each phase extends shared tables (`co_buy_circles`, `co_buy_service_requests`, etc.).

## Non-code work that runs in parallel

Each phase has a "non-code work" section. These items are the ones most often underestimated:

**Phase 1:**
- Lawyer-reviewed compliance copy on the express-interest form
- One real seed opportunity
- Your personal 24-hour SLA on leads
- Lawyer-drafted co-ownership agreement template (start: Karnataka)
- 5 vendor relationships
- Dedicated AcrehubIndia WhatsApp number
- 3-month "no public launch" period

**Phase 2:**
- Lawyer-reviewed default milestones
- State document templates reviewed (KA, TN first)
- WhatsApp group governance documented
- Identity verification policy
- Site visit liability + indemnity

**Phase 3:**
- Lawyer review of all service compliance copy
- AcrehubIndia legal entity structure for services
- GST registration + invoicing
- Vendor agreements on paper
- Internal approval thresholds documented
- Public_summary content review process

**Phase 4:**
- Team role responsibilities + escalation paths
- Lead scoring tuned against real conversion data
- Template content polished from operational experience
- Audit log governance + DPDP compliance
- Weekly Founder Intelligence review meeting

**Phase 5:**
- Lawyer-reviewed disclaimer copy for post-purchase
- Signed co-ownership agreement template per state
- Documented dispute resolution process
- DPDP retention policy
- Professional indemnity insurance
- Annual review meeting process
- AcrehubIndia subscription pricing model

## What I would NOT add without re-discussion

Beyond Phase 5, several feature ideas often come up. These deserve fresh thinking before adding:

- **Public vendor directory** — turns vendor CRM into a marketplace. Different product, regulatory considerations (commission disclosures, ratings, dispute resolution).
- **Resale marketplace** — when a member exits and their share is resold to a new buyer. Effectively a secondary market — securities-adjacent questions.
- **Property tax filing automation** — for jointly-owned property. Out of scope, refer to CA.
- **AI legal opinion generator** — explicitly disclaimed across all phases for good reason. Don't relax this without serious legal exposure analysis.
- **Online payment / escrow** — biggest regulatory shift. Would convert AcrehubIndia from a coordination service into a payment service / regulated entity.
- **Insurance product offerings** — separate license required.
- **Drone surveys, OCR document review** — fine as future enhancements; not on the critical path.

These five phases as specced give AcrehubIndia a complete operational coordination platform. Anything beyond is a separate product decision.

## Quick lookup

If Claude Code needs to know "where does X live":

| Concept | Where in specs |
|---|---|
| Opportunity (the parent of a potential circle) | Phase 1, table `co_buy_opportunities` |
| Lead / Interest | Phase 1, table `co_buy_interests` |
| Circle (the actual buyer group) | Phase 2, table `co_buy_circles` |
| Members of a circle | Phase 2, table `co_buy_circle_members` |
| Document checklist | Phase 2, table `co_buy_documents` |
| Service request | Phase 3, table `co_buy_service_requests` |
| Vendor | Phase 3, table `acrehub_vendors` |
| Vendor quote | Phase 3, table `co_buy_service_vendor_quotes` |
| Team role | Phase 4, table `acrehub_team_roles` |
| Lead score | Phase 4, column on `co_buy_interests` |
| WhatsApp template | Phase 4, table `acrehub_message_templates` |
| Expense | Phase 5, table `co_buy_expenses` |
| Member dues | Phase 5, table `co_buy_member_dues` |
| Governance proposal | Phase 5, table `co_buy_proposals` |
| Vote | Phase 5, table `co_buy_votes` |
| Exit interest | Phase 5, table `co_buy_exit_interests` |
| Annual review | Phase 5, table `co_buy_annual_reviews` |
| Usage zone | Phase 5, table `co_buy_usage_zones` |

---

*Last updated: June 8, 2026. Master index for the Buying Circles module. Reference the individual phase specs for full data models, RLS policies, route structures, component plans, UX flows, risks, testing, and Claude Code build prompts.*
