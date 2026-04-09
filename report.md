# BigBurgh.com Analysis Report

## What It Is

BigBurgh is a mobile-optimized web app that aggregates free services for homeless individuals (or those at risk of homelessness) in the Pittsburgh, PA area. It was created through a collaboration between the Homeless Children's Education Fund (HCEF) and the Pittsburgh Bureau of Police, and built by Informing Design, Inc. The app is designed for use by homeless individuals directly, as well as by police officers and social workers who encounter people in need on the street.

---

## What It Does Well

### 1. Clear Target Audience & Demographic Filtering
The "For You" dial on the home screen lets users quickly self-identify by demographic (Male/Female, 24 & younger / 25 & older, Veterans, Immigrants & Refugees, Seniors 60+, Families). This filters the entire service catalog to show only relevant results. This is a genuinely useful feature for a population with diverse and specific needs.

### 2. Strong Service Category Taxonomy
Services are organized into intuitive, needs-based categories that reflect real priorities:
- **Basics**: Pantry/Supplies, Meals
- **Housing**: Overnight, Daytime, Housing Crisis
- **Experts**: Health, Financial/Legal Help, Jobs & Education, Activities & Events

This hierarchy (Basics > Housing > Experts) correctly prioritizes immediate survival needs.

### 3. Crisis Resources Are Prominent
The "Crisis Lines & Safe Places" button is always visible at the bottom of the screen. It covers critical categories:
- Safe Haven for Children and Teens
- Domestic Violence Shelters
- Rape Hotline
- LGBT Safe Places
- Mental Health Crisis
- Vets Hotlines
- Needle Exchange
- Sex Trafficking Safe Places & Hotline
- PA Benefits Hotline

Each category lists specific organizations with clickable phone numbers.

### 4. Location-Aware Service Listings
Once a location is set, services are sorted by distance (e.g., "0.2 mi", "0.8 mi") with neighborhood labels (Downtown, North Side, Uptown, etc.). This is practical for people navigating on foot.

### 5. Map Integration
Google Maps integration shows service locations visually. Users can toggle between map and list views.

### 6. Real-Time Status Indicators
Some services show status like "Open" or "Opening soon", giving users real-time information about availability.

### 7. Bilingual Support
Spanish language toggle ("Espanol") is available in the header.

### 8. Favorites
A heart icon in the header links to a favorites page, letting users bookmark services they use regularly.

### 9. "Live Help" Concept
The About page describes a "Live Street Help" feature conceived as an "Uber for the homeless" -- users could chat with available outreach workers sorted by neighborhood who could drive to meet someone in need. This is an innovative concept.

---

## What It Does Poorly

### 1. Deeply Broken UX & Navigation
- **The app is extremely difficult to use.** The pie-chart/dial interfaces look visually distinctive but are functionally terrible. Click targets are implemented as invisible overlay `div` elements (`z-20`, `z-30`) stacked on top of content, causing constant click interception failures.
- **Direct URL navigation doesn't work.** The app uses hash routing (`/#/services/male-25over/meals`) but resets state on direct navigation, forcing users to always start from the home screen and click through the entire flow. This means you can't bookmark or share a link to a specific service listing.
- **The menu system is buggy.** Clicking on service list items sometimes triggers the hamburger menu instead of navigating to the service detail. Elements overlap and intercept clicks from each other.
- **No back button support.** Browser back behavior is inconsistent.

### 2. Not Accessible
- The dial interfaces are entirely image/div-based with no semantic HTML, ARIA labels, or keyboard navigation.
- Screen readers would struggle with the pie-chart navigation -- it's essentially a set of absolutely-positioned divs with z-index layering.
- The app fails basic WCAG compliance. For an app serving a vulnerable population, this is a serious issue.

### 3. Poor Mobile Experience Despite "Mobile-Optimized" Claim
- The dial interfaces require precise tapping on small, oddly-shaped regions.
- The service list is partially obscured by a fixed bottom bar ("Show List / Change Location / Current Location") that overlaps with list items, making the last visible items untappable.
- No responsive breakpoints -- the dials are fixed-size.

### 4. Location Defaults to Wrong City
When testing, the map defaulted to Louisville, KY -- not Pittsburgh. A Pittsburgh-focused app should default to Pittsburgh, or at minimum use geolocation immediately. The "Enter Location" modal that appears is an unnecessary friction point.

### 5. Outdated Visual Design
- The green pie-chart aesthetic looks dated (circa 2012-2015).
- Heavy use of black silhouette clip-art icons.
- Gray bottom bar with low contrast text.
- No modern design system -- inconsistent spacing, typography, and color usage.

### 6. Limited Service Detail
From the list view, each service shows only: name, distance, neighborhood, and open/closed status. Missing critical information visible at a glance:
- Address
- Hours of operation
- Phone number
- What's actually offered
- Eligibility requirements

Users must click into each service (when the click works) to learn anything useful.

### 7. No Search
There is no way to search for a specific service, organization, or keyword. Users must navigate through demographic > category > scroll through a list. If someone knows the name of a place they need, they can't find it quickly.

### 8. "Live Help" Appears Non-Functional
The Live Help button navigated to the service categories page rather than any chat or outreach worker interface. This flagship feature appears to be broken or decommissioned.

### 9. Minimal Content & Navigation
The hamburger menu contains only "About" and "Terms of Service." There's no FAQ, no information about how to get listed, no feedback form (despite the About page mentioning one), and no way to report incorrect information.

### 10. SPA Without SSR = Poor Discoverability
The app is a JavaScript SPA (appears to be Ionic/Angular or similar) that renders nothing without JavaScript. Web scrapers and search engines see only "BigBurgh" -- no service content is indexable. Someone Googling "free meals Pittsburgh homeless" will never find this app's content.

### 11. No Offline Support
For a population that may have intermittent internet access via library computers or limited phone data, there's no offline capability, no PWA features, and no way to download information for later reference.

---

## What a Better App (BetterBurgh) Would Look Like

### Core Principles
1. **Simplicity over cleverness.** Standard UI patterns (lists, cards, tabs) over custom dials. Every interaction should work on the first tap.
2. **Information density.** Show the most important details (address, hours, phone) without requiring extra clicks.
3. **Accessibility first.** Semantic HTML, keyboard navigation, screen reader support, high contrast, large touch targets.
4. **Works everywhere.** Server-rendered content for SEO/shareability, progressive enhancement for interactivity, offline-capable.

### Key Features

#### Search-First Homepage
- Large search bar at the top: "What do you need?" with suggested categories below.
- Quick-access buttons for the most common needs: Food, Shelter, Crisis Help.
- No demographic gate -- show all services by default with optional filters.

#### Service Listings
Each service card should show at a glance:
- **Name** and organization
- **Address** with a small map pin link (not a full map)
- **Hours** with today's schedule highlighted and "Open Now" / "Closed" badge
- **Phone number** (tap-to-call)
- **Distance** from user (if location shared)
- **Tags**: what demographics are served, what's offered
- **Last verified date**: so users know if the info is current

#### Smart Filtering (Not Demographic Gating)
- Filter by: category, open now, distance, serves [demographic], day of week
- Multiple filters can be combined
- Filters are optional -- never block access to content

#### Crisis Resources
- Persistent, always-visible "Crisis Help" button (floating or pinned)
- Tap-to-call phone numbers with clear descriptions
- 988 Suicide & Crisis Lifeline prominently featured
- Text-based crisis options for those who can't make voice calls

#### Offline Support (PWA)
- Service worker caches all service data for offline access
- "Download for offline" option for the full directory
- Print-friendly views for posting in shelters, libraries, and social service offices

#### Real-Time Information
- Community-sourced "open now" confirmations
- Wait time estimates where applicable
- Capacity status for shelters ("beds available" vs "full")
- Event calendar for one-time meals, clothing drives, etc.

#### Multi-Language Support
- Full Spanish translation (not just a toggle that may or may not work)
- Consider additional languages based on Pittsburgh's immigrant/refugee population

#### Outreach Worker Integration (Live Help, Done Right)
- Simple chat or SMS-based system connecting to on-call outreach workers
- Clear indication of availability ("2 outreach workers available in East Liberty")
- Fallback to crisis line when no workers available
- Works via SMS for users without smartphones

#### Technical Architecture
- **Server-side rendering** (Next.js, Astro, or similar) for SEO and fast initial load
- **Progressive Web App** with offline caching
- **Semantic HTML** with full ARIA support
- **Simple, clean design** using a proven component library (e.g., Tailwind + headless UI)
- **Shareable URLs** -- every service, category, and filtered view has a stable, bookmarkable URL
- **Admin panel** for service providers to update their own listings
- **Open data API** so other apps and organizations can consume the directory

#### Content Strategy
- Partner with 211 (United Way) and Allegheny County DHS for authoritative data
- Establish a regular verification cadence (monthly calls/emails to listed organizations)
- Allow service providers to self-update through a simple portal
- Community reporting: "Is this information correct?" button on every listing

---

## Summary

BigBurgh has the right idea -- a curated, free, mobile-friendly directory of homeless services in Pittsburgh. Its demographic filtering, crisis resource prominence, and location-aware listings are solid concepts. But the execution is severely hampered by an overly clever UI that's difficult to use, inaccessible, buggy, and outdated. The "Live Help" feature appears broken. The app is invisible to search engines and unusable offline.

A better alternative would prioritize **simplicity, accessibility, and reliability** over visual novelty. Standard UI patterns, server-rendered content, offline capability, and a search-first approach would make the same information dramatically more useful to the people who need it most.

---

## Appendix: Marketing vs. Reality (informingdesign.com/bigburgh)

The following analysis contrasts how BigBurgh is presented on Informing Design's marketing page with the hands-on findings documented above.

### What the Marketing Page Claims

- BigBurgh "broke the mold" by serving police officers, professionals, bystanders, and homeless individuals.
- The app operates in Pittsburgh and Louisville (as LouieConnect.com), with expansion planned to two additional cities.
- Founder Bob Firth identified existing homeless apps as "slow or cumbersome or both" and designed BigBurgh to be "effortless" with "relevant, up-to-date information in an instant."
- The UI features "spinning dials in the cloud" and established "a model for continuous agency engagement on the ground."
- The app achieved "unprecedented levels of usage" after three years in Pittsburgh and one in Louisville, generating "several times the usage (per capita)" compared to Australia's Ask Izzy app.
- The "Live Help" panic button sends mass emails to outreach professionals, with response times averaging "20 minutes or less" in Pittsburgh (operating 12 hours daily, 6 days weekly).
- The "Hotline/Safe Place Panic Button" receives "hundreds of uses per month" in Pittsburgh and Louisville.
- The app is built on "modern software frameworks" and Google's Firebase cloud database.
- Each city operates via a web dashboard with analytics tracking usage by service type, user category, and time periods.
- 5,000 business cards are printed monthly for distribution; seven kiosks are deployed in Louisville.
- Testimonial from Cathe Dykstra (Family Scholar House, Louisville): "I love talking about how we brought BigBurgh to Louisville and how we are using it for the benefit of our entire community."

### Where Marketing and Reality Align

- **Origin and partners**: Both sources agree on the Pittsburgh Bureau of Police + HCEF collaboration and the core goal of connecting homeless individuals with services.
- **Crisis resources**: The marketing highlights the "Hotline/Safe Place Panic Button" getting "hundreds of uses per month." Hands-on testing confirms crisis resources are prominent and well-organized. This appears to be the app's strongest feature in practice.
- **Web app (no app store)**: Both agree on this approach, which is genuinely a good choice for the target population.

### Where Marketing Diverges from Reality

#### 1. "Spinning dials" — Presented as Innovation, Found to Be the Core Problem
The marketing frames the pie-chart dial UI as a breakthrough. Hands-on testing identifies it as the app's biggest usability failure: invisible overlay divs, click interception bugs, no accessibility, and poor mobile touch targets. What's marketed as "inviting and fast-acting" is in practice extremely difficult to use.

#### 2. "Unprecedented levels of usage" — Unverifiable
The marketing claims usage "several times per capita" compared to Ask Izzy. No data source is provided. Given the broken navigation, non-indexable SPA, and lack of search, these numbers are hard to reconcile with the actual user experience.

#### 3. Live Help — Flagship Feature vs. Broken Feature
The marketing describes a working panic button system with 20-minute response times and reply-all email coordination. Testing found the Live Help button navigates to the service categories page instead — it appears non-functional or decommissioned. This is the single biggest gap between marketing and reality.

#### 4. "Effortless" and "Up-to-Date Information in an Instant"
- **Effortless**: Testing documented that direct URLs don't work, there's no search, no back button support, and the demographic gate forces a multi-step flow before any content is visible.
- **Up-to-date**: The marketing mentions needing "one full-time staff member per million population" for data maintenance, but the app has no "last verified" dates, no self-update portal for providers, and no community reporting mechanism.

#### 5. Louisville Expansion — Framed as Growth, But Reveals Configuration Issues
The marketing presents Louisville (LouieConnect.com) as successful expansion. Testing found the map defaulted to Louisville, KY instead of Pittsburgh, suggesting possible configuration issues or that the Pittsburgh instance may be deprioritized.

#### 6. "Modern Software Frameworks" and Firebase
The marketing emphasizes technical modernity. Testing found a JavaScript SPA with no server-side rendering, no offline support, no PWA features, and content invisible to search engines — problems that genuinely modern frameworks solve out of the box.

#### 7. Physical Distribution Compensating for Digital Discoverability Failure
The marketing mentions 5,000 business cards/month and seven Louisville kiosks. This physical distribution strategy may be compensating for the fact that the app is completely invisible to search engines — someone Googling "free meals Pittsburgh homeless" will never find it.

### Takeaway

The marketing page describes the app BigBurgh was *designed to be*. This report describes the app BigBurgh *actually is* today. The gap is significant — particularly around Live Help (marketed as working, found broken), the dial UI (marketed as innovative, found unusable), and data freshness (marketed as a priority, no visible mechanism). The crisis resources appear to be the one feature that lives up to the marketing.

---

## Appendix: Terms of Service Analysis (bigburgh.com/#/about-app)

The About/TOS page contains both a description of the app and a full Terms of Service. The TOS is built from a free Contractology/freenetlaw template, which is acknowledged at the bottom of the document. While boilerplate terms are normal for small projects, several provisions are revealing when read alongside the app's stated mission and the findings above.

### 1. Intellectual Property Claims Over the UI Patterns

The TOS states: *"the map overlays, and the 'look and feel' of the dial interfaces, the distinction between everyday needs and urgent needs, and the Live Street Help function are the intellectual property of Informing Design, Inc."*

The dial UI — identified in this report as the app's core usability problem — is a proprietary asset that Informing Design claims ownership over and licenses to other cities. This creates a structural conflict: the dials *are* the product being sold, which means replacing them with standard, accessible UI patterns would undermine the commercial differentiator. The homeless population's usability needs become secondary to the commercial value of a distinctive interface.

### 2. "No Warranties" on Information Accuracy — for a Crisis Resource App

The TOS states: *"Informing Design does not warrant that... the information on this website is complete, true, accurate or non-misleading."*

This is standard legal boilerplate. However, when the marketing page claims "information that is absolutely, positively up to date" and the app directs vulnerable people to shelters and crisis services, the disclaimer creates a stark contradiction. The marketing sells trust in the data; the legal terms disclaim it entirely.

### 3. Anti-Scraping Clause Blocks What Would Help Most

The TOS states: *"You must not conduct any systematic or automated data collection activities (including without limitation scraping, data mining, data extraction and data harvesting)"*

This prevents other organizations from programmatically accessing the service directory — directly conflicting with the idea of an open data API. Information about free public services is being treated as proprietary content.

### 4. Aggressive User Content Rights Grant

The TOS states: *"You grant to Informing Design a worldwide, irrevocable, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute your user content"*

For what amounts to a feedback form (which appears non-functional anyway), this is an unusually aggressive rights grant. Users submitting corrections about shelter hours would be signing over worldwide, irrevocable content rights.

### 5. HCEF/Informing Design Entity Confusion

The indemnity section reads: *"You hereby indemnify HCEF and undertake to keep Informing Design indemnified"* — mixing up the two organizations mid-sentence. This is a find-and-replace error from adapting the template, suggesting the legal terms were not carefully reviewed.

### 6. Ownership Transition: Public Project to Private Product

The TOS states: *"Welcome to the BigBurgh.com website, which is now operated directly by Informing Design, Inc."*

The app was originally an HCEF project funded by Pittsburgh foundations. The TOS confirms that Informing Design now operates it directly. Combined with the IP claims and the Louisville expansion (marketed as a commercial offering), a publicly-funded community resource appears to have been absorbed into a private company's product portfolio, with the proprietary dial UI as the differentiating asset being licensed to new cities.

### Takeaway

The TOS reinforces the report's technical findings and adds a structural dimension: the app's problems are not just technical debt or neglect. They are tied to a business model that treats the UI novelty and service data as proprietary commercial assets. A truly mission-driven app would use standard UI patterns and open data. BigBurgh cannot do that without giving away what Informing Design is selling.
