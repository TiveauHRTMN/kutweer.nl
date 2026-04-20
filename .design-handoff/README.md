# Handoff: Weerzone — Auth & Abonnementen

## Overview
A complete authentication and subscription flow for **Weerzone** (weerzone.nl) — a Dutch 48-hour hyperlocal weather service. Covers sign up, login, password reset, welcome onboarding, the three subscription plans (Piet / Reed / Steve), checkout, and a full account-management screen (profile, security, subscription, invoices).

Tone and copy follow the live Weerzone brand: friendly, human, no-nonsense Dutch. Matches the visual language of `weerzone.nl` (blue primary, sunshine yellow accent, Manrope type, weerzone logo in a blue pill).

## About the Design Files
The files in this bundle are **design references created in HTML + React (via Babel standalone)** — they are prototypes showing intended look, behavior, and copy, not production code to ship.

The task is to **recreate these designs in the target codebase's environment** (likely the existing Weerzone Next.js app based on the live site) using its established patterns, component library, and routing. Lift the exact copy, spacing, colors, and interaction details from the HTML — but produce idiomatic components in the real stack.

If no environment exists yet, Next.js 14 + TypeScript + Tailwind would match the production site's stack (`weerzone.nl` is Next.js).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and micro-interactions. Pixel-perfect recreation expected. All copy is final Dutch — do not paraphrase.

## Screens / Views

### 1. Sign Up (`route: signup`)
- **Purpose:** Create a new Weerzone account.
- **Layout:** Two-column split at ≥860px (50/50). Left = dark blue marketing panel with logo pill, headline, subtitle, quote. Right = form panel, centered, max-width 420px, 40px padding. Below 860px the left panel is hidden.
- **Fields:** Full name, e-mail, password (with live strength meter), checkbox "Ik ga akkoord met de voorwaarden".
- **Social login:** Google + Apple ghost buttons above divider "of".
- **Submit:** Primary CTA full-width "Account aanmaken" → navigates to `onboarding`.
- **Footer link:** "Heb je al een account? **Inloggen**" → `login`.

### 2. Login (`route: login`)
- Same split shell. E-mail + password. "Onthoud mij" checkbox + "Wachtwoord vergeten?" link to `reset`.
- Submit → `account`.
- Social login same as signup.
- Footer: "Nog geen account? **Aanmelden**" → `signup`.

### 3. Password Reset (`route: reset`)
- Single-field form. Submit shows a confirmation state ("We hebben je een mail gestuurd naar …").
- Back link → `login`.

### 4. Welcome Onboarding (`route: onboarding`)
- **3 steps** with a numbered progress indicator across the top.
  1. **Locatie:** postcode input. We use KNMI HARMONIE at 2,5 km grid.
  2. **Onderwerpen:** multi-select chips — fiets, tuin, kinderen, hond, plat dak, kelder, dieren buiten. Copy lifted from weerzone.nl/prijzen.
  3. **Meldingstijd:** radio — "Vóór 7:00" (default), "Vóór 8:00", "Geen voorkeur".
- Continue button on each step. Last step → `pricing`.

### 5. Pricing (`route: pricing`)
- **Sticky navbar** (WzNavbar): logo pill · nav (Weer / Radar / Prijzen / Over ons) · Inloggen + Aanmelden buttons. Mobile: burger drawer.
- **Hero:** "Nu nog gratis aanmelden" sun-badge, H1 "Een abonnement op Weerzone", subtitle, "1.247 Nederlanders staan al op de lijst" counter pill.
- **3 plan cards** (auto-fit grid, min 290px):
  - **Piet · Basis** — `€2,99/mnd` intro (later `€4,99/mnd`). Tagline: "Elke ochtend een weermail, op jouw postcode."
  - **Reed · Waarschuwing** (highlighted, badge "★ Meest gekozen") — `€4,99/mnd` intro (later `€7,99/mnd`). Tagline: "Waarschuwing als het over jouw grens gaat."
  - **Steve · Zakelijk** — `€29,00/mnd` intro (later `€49,99/mnd`). Tagline: "Weer vertaald naar een bedrijfsbeslissing."
  - Each card: name+tag, tagline (h3), blurb, price box (ink-050 bg, radius 12), primary/ghost CTA, bullet features with circled checks, italic audience line at bottom.
- **"Zo werkt het"** 3-step block: (1) Kies abonnement, (2) Vul profiel in, (3) Morgen om 7:00. Each in a 24px-padded white card with a 36px blue numbered circle.
- **FAQ** accordion with 6 questions. Expanded item = 0 by default. Toggle rotates `+` icon 45°.
- **Dark footer** (#0f1a2c) with logo + 3 link columns + © line.

### 6. Checkout (`route: checkout:<planId>`)
- Sticky navbar. Back link "← Terug naar abonnementen".
- **Two-column grid** (1.3fr / 1fr), collapses at 760px.
- **Left:**
  - Form: Naam, E-mail, Postcode (with hint about KNMI 2,5 km grid).
  - "Betaalmethode — later" section: radio cards for iDEAL / Creditcard / Bancontact. Selected card highlights with brand border + soft brand background.
- **Right (sticky top: 88px):** Besteloverzicht card listing plan, intro price, normal-later price (strikethrough, mute), bold "Vandaag te betalen: €0,00", caption "Straks: {introPrice}", primary CTA "Bevestig aanmelding".
- **Success state:** full-width success card — green check circle, H1 "Welkom bij Weerzone {plan.name}!", confirmation copy mentioning postcode + vastgezette introprijs, CTA to account.

### 7. Account (`route: account`)
- Sticky navbar.
- **Tabbed layout:** "Profiel & meldingen" · "Inloggen & beveiliging" · "Abonnement" · "Facturen".
- **Profiel:** name, e-mail, postcode, notification preferences (mail time, push categories), topic chips same as onboarding.
- **Security:** change password, 2FA toggle, active sessions, dangerous zone with "Account verwijderen".
- **Abonnement:** current plan card with intro price vastgezet line. Below: 3 plan cards showing Piet/Reed/Steve with intro + later price; current plan shows "Huidig" badge, others show "Upgrade"/"Wissel" ghost button. "Opzeggen" link opens modal — "Je houdt toegang tot 4 mei 2026. Daarna staat je account op pauze en krijg je geen weermail meer." with confirm/cancel.
- **Facturen:** table of past invoices (date, plan, bedrag, status, download pdf link).

## Interactions & Behavior
- **Navigation:** client-side only. Route persisted in `localStorage['wz.proto.route']` — refresh preserves place. On every nav, `window.scrollTo(0,0)`.
- **Sticky navbar:** `position: sticky; top: 0; z-index: 50` with `backdrop-filter: blur(12px)` on `rgba(255,255,255,.92)`.
- **Mobile burger:** breakpoint 760px. Desktop nav + auth buttons hidden, burger shown. Drawer slides under navbar, closes on link click.
- **FAQ accordion:** single-open. `+` icon rotates 45° when open. 0.2s transform transition.
- **Password strength meter:** 4 segments, color ramps red → amber → green as complexity rises.
- **Plan cards:** highlighted card (Reed) has `box-shadow: 0 20px 50px rgba(59,127,240,.18), 0 0 0 2px var(--brand)` and badge tab.
- **Checkout radio cards:** clicking anywhere on the label selects; background transitions to brand-soft, border to brand.
- **Cancel subscription modal:** dimmed backdrop, centered dialog, confirm/cancel buttons.

## State Management
- **Routing:** single string `route` in a small state machine. Format `<screen>` or `<screen>:<arg>` (only checkout uses arg).
- **Per-screen local state** (React `useState`):
  - Form fields (name, email, password, postcode, method, etc.)
  - Onboarding: step index + selections
  - Password visibility toggle
  - FAQ open index
  - Account active tab + cancel modal open
  - Checkout `done` success flag

## Design Tokens

All tokens live in `design-system.css` as CSS custom properties. Key values:

### Colors
```
--wz-blue:       #3b7ff0   (primary brand, CTA, links, pill bg)
--wz-blue-deep:  #1d4fb3   (hover, gradient end)
--wz-sun:        #ffd21a   (accent badges, sun glyphs)
--brand:         #3b7ff0   (alias of wz-blue)
--brand-soft:    rgba(59,127,240,.10)

--ink-900:       #0f1a2c   (text, dark footer bg)
--ink-700:       #2b3a55   (body)
--ink-500:       #56627a   (muted)
--ink-300:       #aab4c7   (borders-strong)
--ink-100:       #e3e8f1   (border default)
--ink-050:       #f3f5fa   (soft card bg)

--bg:            #f6f8fc   (app bg)
--border:        #e3e8f1
--text:          #0f1a2c
--text-soft:     #2b3a55
--text-mute:     #56627a

--success:       #2e9a5c
--success-bg:    #e6f5ec
```

### Typography
- **Family:** Manrope, 400 / 500 / 600 / 700 / 800 / 900 (Google Fonts).
- **Mono:** JetBrains Mono 500 (for data/postcodes if needed).
- **Scale (clamp-based fluid):**
  - `h-display`: clamp(32px, 5vw, 52px) / 1.05 / 800 / -0.02em
  - `h-1`: clamp(26px, 3vw, 34px) / 1.15 / 800
  - `h-2`: 22px / 1.25 / 800
  - `h-3`: 17px / 1.35 / 700
  - `t-body`: 15px / 1.55 / 400 / --text-soft
  - `t-small`: 13px / 1.5 / --text-mute
  - `t-micro`: 11px / 1.5 / 700 / 0.08em / uppercase / --text-mute

### Spacing
- Card padding: clamp(20px, 2.5vw, 28px)
- Page padding: clamp(20px, 4vw, 48px) horizontal, clamp(40px, 6vw, 80px) vertical
- Gap between cards in grids: 20px
- Form row gap: 14px

### Radius
- Buttons: 10px
- Inputs: 10px
- Cards: 18px
- Pills / badges: 999px
- Logo pill: 10px (navbar) / 8px (inline)

### Shadows
- `--shadow-sm`: `0 2px 6px rgba(15,26,44,.06), 0 1px 2px rgba(15,26,44,.04)`
- Highlighted plan: `0 20px 50px rgba(59,127,240,.18), 0 0 0 2px var(--brand)`
- Floating: `0 20px 50px rgba(0,0,0,.2)`

### Breakpoints
- **760px:** mobile burger menu appears, checkout grid collapses to 1 column
- **860px:** auth split-shell collapses to single column (side panel hidden)

## Assets

- **`assets/weerzone-logo.png`** — official Weerzone wordmark. PNG, transparent, 2337×549 (aspect 4.26:1). Always render inside a solid blue pill (`--wz-blue` background, 6-10px padding, 8-10px radius). **Never set both width and height** — pin `height: 20-22px` and let width auto-scale. For flex parents, add `align-self: flex-start; flex: 0 0 auto;` to prevent stretching.

## Responsive Behavior
- Navbar: sticky on all viewports, glass effect, burger below 760px.
- Auth split: 50/50 desktop, single-column mobile (marketing side hidden).
- Pricing: `repeat(auto-fit, minmax(290px, 1fr))` — natural 1/2/3 column adaptation.
- Checkout: 1.3/1 desktop, 1 column mobile; sidebar un-stickies naturally when stacked.
- All typography uses `clamp()` — no separate mobile font sizes needed.
- Footer columns: `repeat(auto-fit, minmax(180px, 1fr))`.

## Files in This Bundle

| File | Purpose |
|---|---|
| `Weerzone Auth.html` | Root shell + route table + prototype navigator |
| `design-system.css` | All tokens, utility classes, component styles |
| `components/WzChrome.jsx` | Sticky navbar + footer (shared site chrome) |
| `components/AuthShell.jsx` | Split layout for sign up / login / reset + SocialButtons + Divider |
| `components/AuthScreens.jsx` | SignUpScreen / LoginScreen / ResetScreen |
| `components/FormFields.jsx` | TextField / PasswordField / Checkbox / helpers |
| `components/OnboardingScreen.jsx` | 3-step welcome flow |
| `components/PricingScreen.jsx` | Pricing page + PLANS data array + FAQ |
| `components/CheckoutScreen.jsx` | Checkout form + order summary + success state |
| `components/AccountScreen.jsx` | Tabbed account page incl. subscription management |
| `assets/weerzone-logo.png` | Brand wordmark |

## Implementation Notes

- **Plan data lives in `PricingScreen.jsx`** as the exported `PLANS` array. Same array is re-used by Checkout and Account — keep a single source in the real codebase (e.g. `lib/plans.ts`).
- **Navigator (`#proto-nav`)** in the HTML root is a prototype-only tool. **Do not port it** to production.
- **Dutch copy is final** — all strings were lifted from or written to match weerzone.nl. Do not translate or paraphrase.
- **Prices are introduction prices.** Show both intro and "later" price, with later price struck through where relevant.
- **Payment:** Mollie (iDEAL / Creditcard / Bancontact). Currently shown as "later" — no real payment in the nu-gratis phase.

## Open Questions for Implementation
- Real authentication backend — OAuth providers (Google, Apple) to be wired to actual OAuth or NextAuth.
- Postcode validation: should we use a PostNL API for address lookup, or just format-validate `1234 AB`?
- "1.247 Nederlanders staan al op de lijst" — is this a live count or a static hero number?
- For Steve (business plan), multi-location support implies a different onboarding branch — out of scope in this handoff.
