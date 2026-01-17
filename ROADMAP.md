# Stashport Roadmap

MVP-focused development plan aligned with PRD and scope documents.

**Last Updated:** January 2026
**Current Status:** Phases 1-4 ✅ Complete | MVP Features 🚀

---

## Completed Foundation

### ✅ Phase 1-4: Core Platform
- Authentication (Email, Google, Facebook)
- Itinerary CRUD (create, edit, delete)
- Day & activity management
- Public/private sharing
- Design system & components
- WCAG AA accessibility
- Mobile-responsive design

**See:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## MVP Sprint Plan

### Sprint 1: Foundation (P0s) — ~5-7 hours
| Feature | Priority | Effort |
|---------|----------|--------|
| Post-signup confirmation flow | P0 | 1-2h |
| Autosave & draft recovery | P0 | 2-3h |
| Dashboard pagination (9 cards) | P1 | 1-2h |

### Sprint 2: Discovery & Identity — ~8-10 hours
| Feature | Priority | Effort |
|---------|----------|--------|
| Trip categories / tags | P1 | 3-4h |
| Creator identity (avatar + name) | P1 | 3-4h |
| Trip quick stats | P1 | 1-2h |

### Sprint 3: Sharing & Onboarding — ~14-17 hours
| Feature | Priority | Effort |
|---------|----------|--------|
| Guided onboarding flow | P1 | 3-4h |
| Featured itineraries + Stash | P1 | 6-8h |
| Social caption generator | P1 | 4-5h |

**Total MVP Effort:** ~27-34 hours

---

## Post-MVP (v1.1 / v1.2)

| Feature | Priority | Effort |
|---------|----------|--------|
| User profile settings page | P2 | 4-6h |
| Multi-country itineraries | P2 | 4-6h |
| Multi-day activity indicators | P2 | 4-6h |
| Itinerary stats (views, stashes) | P2 | 4-6h |
| Packing list | P2 | 3-4h |
| Comments on public trips | P2 | 5-6h |

---

## Deferred (After Traction)

| Feature | Reason |
|---------|--------|
| Activity photos | Requires storage setup |
| Cover photos for cards | Depends on photo upload |
| Video embeds | Nice-to-have |
| Maps & route visualization | API costs |
| Real-time collaboration | Complex architecture |
| Templates | User still considering |

---

## MVP Success Criteria

From [stashport_prd.md](./stashport_prd.md):

- ✅ Users complete and publish trips
- ✅ Trips look good enough to share
- ✅ Caption generator shows regular usage
- ✅ Users return to create multiple trips

---

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project entry point |
| [BACKLOG.md](./BACKLOG.md) | Feature backlog & priorities |
| [stashport_mvp_scope.md](./stashport_mvp_scope.md) | MVP scope definition |
| [stashport_prd.md](./stashport_prd.md) | Product requirements |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Phase 1-4 details |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Design tokens & components |
| [FEATURED_ITINERARIES_PLAN.md](./FEATURED_ITINERARIES_PLAN.md) | Featured feature design |

---

## Tech Stack

**Current:**
- Next.js 16 (App Router)
- TypeScript (Strict)
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth)
- Zod validation
- @dnd-kit (drag & drop)

**Planned:**
- Supabase Storage (avatars, photos)
- use-debounce (autosave)

---

**Last Updated:** January 2026
