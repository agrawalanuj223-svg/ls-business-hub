# L&S Business Hub — Staging Review Deck

## Cover
L&S Business Hub
Staging review: recent updates and guided testing
Prepared for the stakeholder review team

## Slide 1
### Today is a progress review, not a final launch
- Walk through the latest staging updates
- Show how the internal and client experiences are now separated
- Guide reviewers through safe, structured testing
- Capture feedback for the next development cycle

## Slide 2
### The staging environment is the shared review workspace
- Vercel staging hosts the current Next.js experience
- Supabase Cloud staging provides the isolated database, authentication and private storage boundary
- Stakeholders can review the same build online and report issues against one deployment
- The environment remains resettable and uses fictional data only

## Slide 3
### Recent updates establish the product foundation
- Multi-company internal workspace for authorized business operations
- Separate external client portal with a different navigation and data surface
- Session-bound Supabase access so RLS remains active during standard fetching
- Initial companies, partners and service-order views now appear in the dashboards

## Slide 4
### Internal staff can review the operating model
- Review the two fictional demo companies and authorized company coverage
- Explore business-partner counts, service orders, frequencies and contract values
- Confirm that internal navigation feels appropriate for day-to-day operations
- Note unclear labels, missing workflow steps and useful next screens

## Slide 5
### The client portal is intentionally narrower
- Client users see their organization context and client-safe invoice information
- Internal notes, vendors, employee data and audit content remain outside the client surface
- Shared documents are expected to be explicit, not automatic
- Review the experience as a controlled client demonstration—not as a finished portal

## Slide 6
### The testing checklist makes security review repeatable
- Internal section: navigation, company scope, service orders and cross-company denial tests
- External section: client-safe views, Client A versus Client B isolation and private-storage denial tests
- Use only fictional IDs and stop immediately if foreign data appears
- Record route, identity, steps, expected result, actual result and screenshot where safe

## Slide 7
### All visible records are fictional DEMO/SAMPLE data
- Demo companies: DEMO LIFT & SHIFT and DEMO SISTER COMPANY ONE
- Demo clients: Alpha, Beta, Gamma and Delta organizations
- Demo invoice, payment and service-order records are synthetic review fixtures
- Do not enter real client names, amounts, tax identifiers, bank details, addresses, contacts or documents

## Slide 8
### What we need from this review
- Which recent update is most valuable to the business workflow?
- Where did the internal or client experience feel unclear?
- Did company and client boundaries remain understandable throughout testing?
- What should be addressed before the next staging review?
- Feedback will guide the next increment; this review does not declare completion
