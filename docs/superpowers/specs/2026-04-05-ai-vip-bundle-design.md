# AI VIP Bundle Access Design

**Goal:** Add secure VIP access control for AI-translated stories so chapters `1-20` stay free, later chapters unlock through `linh_thach` bundle purchases, and free-to-play users can still progress through the same economy.

**Primary Engineering Direction:** Server-enforced story bundle entitlements with hybrid bundle offers (`21-50`, `21-100`, `full`) and transactional `linh_thach` deductions

**Success Criteria:**
- AI VIP stories can be flagged independently from normal stories without changing existing reading behavior for non-VIP content.
- Chapters `1-20` remain readable for everyone, while later chapters are blocked unless the user owns a covering bundle.
- Users can buy `21-50`, `21-100`, or `full` access using the existing `linh_thach` wallet.
- Users who already own a smaller bundle can upgrade to a larger bundle by paying only the server-calculated price difference.
- Locked chapter APIs never leak chapter content through direct requests, prefetching, or cache collisions.
- The system remains compatible with future top-up flows where real money converts into `linh_thach`, without introducing a second premium currency.

## Current Project Shape

The codebase already has several pieces that make a bundle-based VIP system a good fit:

- `backend/models/userCurrency.model.js` already owns balance reads plus transactional `linh_thach` deduction with `SELECT ... FOR UPDATE`.
- `backend/services/shop.service.js` already uses a safe transaction pattern for purchases, balance deduction, rollback, and post-purchase payloads.
- `backend/controllers/chapter.controller.js` and `backend/routes/chapter.routes.js` already provide the chapter-reading entry points that must become the canonical enforcement boundary.
- `backend/services/task.service.js`, the reward stack, mailbox flows, and the broader gamification surface already establish `linh_thach` as a reusable economy primitive for free-to-play progression.
- The story and chapter domains already separate controllers, services, and models, so VIP logic can be added as a focused domain instead of ad hoc checks inside unrelated code.

That means phase 1 should reuse the existing wallet and transactional patterns, then add a dedicated VIP bundle domain that controls reading access at the API layer.

## Scope

### In scope for phase 1

- mark a story as AI VIP
- configurable free chapter threshold per story, defaulting to `20`
- curated bundle catalog per story with three launch bundles:
  - `21-50`
  - `21-100`
  - `full`
- server-side chapter access checks
- authenticated bundle purchase with `linh_thach`
- upgrade pricing from a smaller owned bundle to a larger target bundle
- locked chapter responses that return bundle metadata without leaking content
- audit-friendly purchase logging
- support for both top-up users and free-to-play users through the same `linh_thach` balance

### Explicitly out of scope for phase 1

- per-chapter purchases
- auto-buy next bundle
- multiple-bundle credit stacking during upgrades
- subscription or rental access
- scheduled price experiments or dynamic pricing
- admin UI for bundle authoring beyond the minimum data needed by the crawl/import pipeline
- retroactive compensation rules for stories that become VIP after readers already progressed deep into them

## Product Rules Approved For This Design

The design assumes the following rules are fixed for phase 1:

- chapters `1-20` are free
- the same `linh_thach` wallet is used by both free-to-play and paying users
- the launch bundle menu is curated and hybrid:
  - `21-50`
  - `21-100`
  - `full`
- a user may buy a larger bundle directly even if they skipped a smaller one
- if a user already owns a smaller qualifying bundle, the larger bundle uses upgrade pricing based on server-side credit
- AI VIP is reserved for AI-translated or crawler-imported stories, not the general catalog

## Proposed Data Model

### Story-level VIP flags

Add the following fields to the story table:

```sql
ALTER TABLE truyen_new
  ADD COLUMN is_ai_vip TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN free_chapter_count INT NOT NULL DEFAULT 20,
  ADD COLUMN vip_bundle_mode VARCHAR(32) NOT NULL DEFAULT 'hybrid';
```

Recommended semantics:

- `is_ai_vip = 0`: story behaves exactly as today
- `is_ai_vip = 1`: chapter access past the free threshold must go through VIP checks
- `free_chapter_count`: default `20`, but kept configurable for future experiments
- `vip_bundle_mode`: stored now so the domain can evolve later without another story-level schema change

### Bundle definition table

Create `story_vip_bundles` to define sellable bundles per story:

```sql
CREATE TABLE story_vip_bundles (
  id INT NOT NULL AUTO_INCREMENT,
  story_id INT NOT NULL,
  bundle_code VARCHAR(64) NOT NULL,
  bundle_type ENUM('range', 'full') NOT NULL,
  from_chapter INT NULL,
  to_chapter INT NULL,
  price_linh_thach INT NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_story_bundle_code (story_id, bundle_code),
  KEY idx_story_bundle_story_active (story_id, is_active, sort_order),
  CONSTRAINT fk_story_vip_bundles_story FOREIGN KEY (story_id) REFERENCES truyen_new(id) ON DELETE CASCADE
);
```

Recommended launch rows per story:

- `starter_21_50`
- `value_21_100`
- `full_access`

Bundle rules:

- `range` bundles must define both `from_chapter` and `to_chapter`
- `full` bundles may leave `to_chapter` null and should be interpreted according to the full-access rule defined later in this document
- imported bundle prices and ranges come from trusted backend/admin tooling, never from the client

### Purchase history table

Create `user_story_vip_purchases` as the source of truth for entitlements and audit:

```sql
CREATE TABLE user_story_vip_purchases (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  story_id INT NOT NULL,
  bundle_id INT NOT NULL,
  purchase_type ENUM('direct', 'upgrade') NOT NULL DEFAULT 'direct',
  source_bundle_id INT NULL,
  list_price_at_purchase INT NOT NULL,
  upgrade_credit_used INT NOT NULL DEFAULT 0,
  price_paid INT NOT NULL,
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_bundle (user_id, bundle_id),
  KEY idx_user_story_vip_purchases_user_story (user_id, story_id, purchased_at),
  KEY idx_user_story_vip_purchases_story (story_id, purchased_at),
  CONSTRAINT fk_user_story_vip_purchases_user FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_story_vip_purchases_story FOREIGN KEY (story_id) REFERENCES truyen_new(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_story_vip_purchases_bundle FOREIGN KEY (bundle_id) REFERENCES story_vip_bundles(id) ON DELETE CASCADE
);
```

Why snapshot price data here:

- future price changes must not rewrite historical purchase truth
- support resolution of support disputes
- make upgrade math auditable after the fact

### Purchase transaction log

Phase 1 should also add a dedicated purchase log rather than relying only on wallet balance changes:

```sql
CREATE TABLE story_vip_purchase_transactions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  story_id INT NOT NULL,
  bundle_id INT NOT NULL,
  purchase_id INT NOT NULL,
  purchase_type ENUM('direct', 'upgrade') NOT NULL,
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  amount_paid INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_story_vip_purchase_transactions_user_created (user_id, created_at),
  KEY idx_story_vip_purchase_transactions_story_created (story_id, created_at)
);
```

This table exists to answer support questions such as "I lost stones but did not receive access" quickly and deterministically.

## Bundle Semantics

### Launch bundle set

Each AI VIP story can expose up to three bundles in phase 1:

- `21-50`
- `21-100`
- `full`

### Visibility rules

- hide a bundle if the story does not yet have enough approved chapters to justify it
- show `21-50` only when the story has at least `50` approved chapters
- show `21-100` only when the story has at least `100` approved chapters
- show `full` only when the story has more than the free threshold, and define its coverage carefully

### Full-access rule for ongoing stories

For stories that are still updating, `full` should mean:

- access to all approved chapters available at the time of purchase

This rule is intentionally narrower than "all future chapters forever." It protects the future economy and avoids unbounded entitlement drift for unfinished stories.

For completed stories, `full` can be treated as truly complete coverage because no new chapters are expected.

To support this safely, phase 1 should snapshot the effective upper bound for `full` purchases at purchase time, either by:

- writing a dedicated `effective_to_chapter` into `user_story_vip_purchases`, or
- resolving `full` purchases against the bundle snapshot fields stored at purchase time

The simpler approach is to extend `user_story_vip_purchases` with:

```sql
ALTER TABLE user_story_vip_purchases
  ADD COLUMN effective_from_chapter INT NULL,
  ADD COLUMN effective_to_chapter INT NULL;
```

Then:

- `21-50` purchase snapshots `21` and `50`
- `21-100` snapshots `21` and `100`
- `full` on an ongoing story snapshots `21` through `current_story_chapter_count`
- `full` on a completed story can snapshot `21` through final chapter count

This makes later access checks deterministic and independent from future bundle edits.

## Access Control Design

### Enforcement boundary

The backend chapter-reading endpoints are the canonical access boundary:

- `GET /api/chuong/:id`
- `GET /api/chuong/slug/:storySlug/:chapterSlug`

Client-side locking is allowed for UX only. It must never be the real guard.

### Chapter access algorithm

When serving a chapter:

1. resolve chapter metadata and story metadata
2. if the story is not AI VIP, return content normally
3. if the chapter number is within `free_chapter_count`, return content normally
4. if the request is unauthenticated, return a locked response
5. if the authenticated user owns a purchase whose effective range covers the chapter number, return content normally
6. otherwise return a locked response with bundle offer metadata

### Why checks belong in the chapter API

This prevents all of the common bypass paths:

- guessing chapter URLs directly
- opening prefetch requests from the client
- replaying old API calls
- reading hidden content from a list response or shared cache

### Locked response shape

Locked chapter responses should return structured metadata without chapter content:

```json
{
  "locked": true,
  "lock_reason": "vip_bundle_required",
  "story_id": 123,
  "chapter_id": 456,
  "chapter_number": 57,
  "free_chapter_count": 20,
  "available_bundles": [
    {
      "id": 10,
      "display_name": "Mo khoa 21-100",
      "price_linh_thach": 180,
      "effective_price_linh_thach": 80,
      "owned": false,
      "recommended": true
    }
  ]
}
```

The response must not include:

- chapter content
- chapter content URLs
- content hashes
- hidden preloaded next-chapter payloads

### Entitlement query

Phase 1 can infer access from the purchase range snapshot:

```sql
SELECT 1
FROM user_story_vip_purchases p
WHERE p.user_id = ?
  AND p.story_id = ?
  AND ? BETWEEN p.effective_from_chapter AND p.effective_to_chapter
LIMIT 1
```

This is intentionally simpler and safer than deriving access from mutable bundle definitions on every read.

## API Design

### Bundle list endpoint

`GET /api/truyen/:storyId/vip/bundles`

Purpose:

- power story detail paywall UI
- power locked chapter bundle recommendations

Response should include:

- story VIP metadata
- bundle catalog
- user ownership flags
- effective price after upgrade credit
- a recommendation marker for the current chapter if called in that context

### Access summary endpoint

`GET /api/truyen/:storyId/vip/access-summary`

Purpose:

- let the client render chapter list badges without fetching every chapter body
- show the highest unlocked chapter and owned bundles for the current user

Response should include:

- `is_ai_vip`
- `free_chapter_count`
- `highest_entitled_chapter`
- `owned_bundles`
- `visible_bundles`

### Purchase endpoint

`POST /api/truyen/:storyId/vip/purchase`

Request:

```json
{
  "bundle_id": 10
}
```

The client must not send:

- requested price
- chapter range
- claimed upgrade source

The server owns all pricing and entitlement calculation.

### Chapter endpoints

No separate "unlock chapter" API is needed in phase 1.

Instead:

- chapter APIs enforce access
- bundle APIs expose purchase options
- purchase API mutates entitlements

## Purchase Flow

### Transaction steps

Bundle purchase should follow the same transactional safety pattern used in `backend/services/shop.service.js`:

1. start database transaction
2. lock the user wallet row with `SELECT linh_thach ... FOR UPDATE`
3. load and validate the target story and target bundle
4. verify the story is AI VIP and the bundle belongs to it
5. verify the bundle is active and currently sellable
6. verify the user does not already own the exact same bundle
7. resolve the best eligible upgrade credit, if any
8. compute the effective price
9. fail if the user balance is insufficient
10. deduct `linh_thach`
11. insert `user_story_vip_purchases`
12. insert `story_vip_purchase_transactions`
13. commit

If any step fails, rollback the transaction.

### Purchase response

Return:

- purchased bundle metadata
- amount paid
- remaining `linh_thach`
- highest unlocked chapter after purchase

That lets the client update the paywall and continue reading without an extra round trip.

## Upgrade Pricing Rules

### Launch rule set

Phase 1 upgrade pricing should be intentionally strict and simple:

- direct purchase of any visible bundle is allowed
- exact rebuy of an already owned bundle is blocked
- if the user owns one smaller qualifying bundle, the target bundle price is reduced by that bundle's credit
- only one credit source is used in phase 1
- multiple smaller bundles do not stack into one upgrade credit in phase 1

### Best credit algorithm

Given a target bundle:

- look at owned purchases for the same story
- keep only purchases fully contained inside the target's effective range
- pick the owned purchase with the highest `price_paid` or highest qualifying credit value
- subtract that credit from the target list price

Formula:

```text
effective_price = target_list_price - best_upgrade_credit
```

Clamp the result at zero if needed, though curated pricing should make negative results impossible.

### Example pricing

If the curated prices are:

- `21-50 = 100`
- `21-100 = 180`
- `full = 300`

Then:

- owned `21-50` -> buy `21-100` => pay `80`
- owned `21-50` -> buy `full` => pay `200`
- owned `21-100` -> buy `full` => pay `120`

### Why not refund

Phase 1 should never:

- add `linh_thach` back to the wallet
- then deduct the larger bundle price

That refund-and-repurchase pattern increases race risk, complicates audit, and creates more states to reconcile.

Upgrade should remain a one-way deduction only.

## Economy Design For Free-to-Play Users

### Currency strategy

Use one shared currency only:

- `linh_thach`

This keeps the top-up roadmap simple because future real-money purchase just fills the same wallet used by free-to-play users.

### Progression philosophy

AI VIP should accelerate reading for paying users, not create an absolute hard wall for free-to-play readers.

That means:

- users can earn `linh_thach` through existing mission, reward, mailbox, and event systems
- users can spend earned `linh_thach` on story bundles exactly the same way as topped-up users

### Economy guardrails

Phase 1 should balance bundles so:

- `21-50` feels reachable for an active free-to-play reader over a short horizon
- `21-100` feels like a medium-term goal
- `full` remains premium enough to preserve monetization value

The exact numeric pricing can change later, but the architectural assumption is that bundles are priced against a finite earning rate, not infinite farm.

## Abuse Prevention

### Wallet safety

Always use transactional deduction through the existing wallet model or a service with the same guarantees:

- balance row lock
- sufficient balance check inside the same transaction
- rollback on any failure

### Idempotency and duplicate protection

Prevent accidental or scripted double purchases with:

- `UNIQUE(user_id, bundle_id)`
- transaction boundary around read + deduct + insert
- graceful "already owned" responses for repeated clicks

### Rate limiting

Add a dedicated limiter to the bundle purchase endpoint.

This is not just for performance. It also reduces the value of brute-force or timing attacks against purchase logic.

### No trust in client-provided pricing

The client must never control:

- bundle price
- chapter range
- upgrade source
- balance delta

The server computes everything from stored data.

### Cache safety

Do not let unlocked and locked chapter responses share the same cache key.

Recommended phase 1 policy:

- chapter content endpoints serving authenticated access should be `private, no-store`
- cache only safe metadata, not raw chapter body, until entitlement-aware caching is explicitly designed

### Content leak prevention

Locked responses must not expose:

- hidden chapter body text
- content URLs
- serialized next chapter payloads
- SSR-injected hidden text blocks

This rule applies to:

- chapter detail API
- chapter list API if it currently embeds content snippets
- story detail API if it prefetches reading payloads

## Operational Edge Cases

### Story has not reached a bundle threshold

If a story has:

- fewer than `50` approved chapters, hide `21-50`
- fewer than `100` approved chapters, hide `21-100`

This avoids selling entitlements to content that does not yet exist.

### Story gains more chapters later

Owned range bundles do not grow automatically.

Examples:

- owned `21-50` remains `21-50`
- owned `21-100` remains `21-100`
- owned `full` on an ongoing story remains "all chapters available at purchase time" unless the business later defines a broader entitlement

### Story switches from non-VIP to VIP

Phase 1 should keep the rule simple:

- previously read depth does not auto-grant VIP access
- chapter access is recalculated from the new VIP configuration plus owned bundles

If this becomes a support concern later, compensation can be added as an explicit admin grant workflow instead of implicit logic.

### Story switches from VIP back to non-VIP

All chapters become readable again.

Purchase records remain stored for audit and analytics.

### Bundle price changes later

Historical purchases must keep their original price snapshot and access range.

Do not mutate old purchase economics by editing bundle rows in place and reinterpreting history.

### Ongoing top-up roadmap

Future money-to-`linh_thach` top-up does not require a redesign because:

- bundle pricing already targets `linh_thach`
- wallet deduction is already separated from entitlement storage
- purchase logging already captures stone spend cleanly

## Backend Architecture

Recommended new backend units:

- `backend/migrations/<n>_add_story_vip_bundle_tables.sql`
- `backend/models/storyVipBundle.model.js`
- `backend/models/storyVipPurchase.model.js`
- `backend/services/storyVipAccess.service.js`
- `backend/controllers/storyVip.controller.js`
- `backend/routes/storyVip.routes.js`

### Responsibility split

#### `storyVipBundle.model.js`

Own:

- bundle queries by story
- visibility filtering inputs
- bundle row loading for purchase

#### `storyVipPurchase.model.js`

Own:

- purchase inserts
- owned purchase lookups
- entitlement range lookups
- transaction log inserts

#### `storyVipAccess.service.js`

Own:

- access checks for chapter reads
- bundle visibility resolution
- upgrade credit calculation
- transactional purchase flow
- locked response assembly

#### chapter controller integration

`backend/controllers/chapter.controller.js` should remain thin and call the VIP access service before returning sensitive content.

This keeps chapter enforcement centralized without turning the controller into a second business domain.

## Frontend Design Direction

Phase 1 frontend work should stay intentionally focused:

- show VIP lock state in chapter list and chapter detail
- show remaining free progress clearly near the chapter `20` threshold
- render bundle cards from backend-provided metadata
- show owned vs upgradeable bundles cleanly
- continue using the existing `linh_thach` UI language already familiar from shop and gamification

Important frontend rule:

- the UI can recommend bundles
- the UI must not attempt to compute entitlements or prices itself

## Error Handling Rules

Return clear backend errors for:

- unauthenticated purchase attempt
- invalid or inactive bundle
- story is not AI VIP
- bundle does not belong to story
- bundle already owned
- bundle already fully covered by owned entitlement
- insufficient `linh_thach`
- chapter access denied because bundle required

The client should be able to distinguish:

- not logged in
- not enough stones
- locked but buyable
- already owned

without reading free-form strings only.

## Testing Strategy

### Backend tests

Add focused tests for:

- non-VIP story chapter remains readable
- VIP story chapter `<= free_chapter_count` remains readable
- VIP paid chapter is locked for guest
- VIP paid chapter is locked for authenticated user without purchase
- `21-50` purchase succeeds with sufficient balance
- duplicate purchase is blocked
- purchase rolls back on insufficient balance
- upgrade from `21-50` to `21-100` uses price difference only
- upgrade to `full` uses the best single qualifying credit
- owned entitlement grants access to covered chapters only
- locked response contains bundle metadata but no content

### Manual verification

Verify manually:

- chapter `20` reads normally
- chapter `21` shows lock state when no purchase exists
- bundle purchase updates remaining `linh_thach`
- after purchase, the user can refresh and still read
- story with fewer than `100` chapters does not show `21-100`
- direct API calls to locked chapters do not reveal content

## Rollout Plan

### Phase 1 release order

1. add migrations for story VIP flags, bundle definitions, purchases, and transaction logs
2. implement models and the VIP access service
3. integrate chapter API enforcement
4. add bundle list and purchase endpoints
5. connect frontend paywall and story bundle surfaces
6. verify wallet deduction, logging, and locked response safety

### Future-compatible extensions

This design intentionally leaves room for:

- auto-buy next bundle
- admin grants for bundles
- bundle analytics and conversion dashboards
- stacked credits across multiple owned bundles
- smarter targeting of bundle offers
- optional per-story top-up promotions

None of those require changing the core decision to model access as server-owned bundle entitlements backed by the existing `linh_thach` wallet.

## Recommended Implementation Direction

Implement the AI VIP bundle feature as a dedicated backend entitlement domain layered onto the existing story and wallet systems. Start with the schema and access-service contract, integrate secure chapter locking next, then add transactional purchase endpoints, and only then build the frontend paywall. This keeps the security boundary correct from the beginning and prevents UI-first leaks that would be expensive to unwind later.
