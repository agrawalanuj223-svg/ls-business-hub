# L&S Business Hub — Live Staging Testing Checklist

**Review purpose:** Validate recent project updates in the live staging environment and identify issues for the next development cycle.  
**Product status:** In-progress demonstration build; not a completed final product and not approved for production data.  
**Required data:** Fictional `DEMO/SAMPLE` data only.  
**Reviewers:** Internal staff review for the business owner and Ishika; separate external client-portal review for a controlled test identity.

## Before testing

| Check | Done | Notes |
|---|:---:|---|
| Confirm the URL is the Vercel staging/Preview deployment, not production | ☐ |  |
| Confirm the connected Supabase project is the dedicated staging project | ☐ |  |
| Confirm the visible workspace is labeled `DEMO/SAMPLE` | ☐ |  |
| Confirm no real client names, invoice numbers, amounts, GSTINs, bank details, addresses, phone numbers, emails or documents will be entered | ☐ |  |
| Record reviewer name, date, browser, device, deployment commit and test identity | ☐ |  |
| Open the stakeholder feedback template for recording observations | ☐ |  |
| Know the stop rule: immediately stop and report any possible cross-company or cross-client data exposure | ☐ |  |

> **Stop rule:** If a reviewer sees information belonging to another company or client organization, do not continue exploring that path. Record the fictional record identifier, route, timestamp and screenshot if safe, then report it as **Critical**.

## Test data map

Use only the following fictional staging identities and records. Do not substitute live business information.

| Fictional fixture | Intended use |
|---|---|
| `DEMO LIFT & SHIFT` | Internal company A review |
| `DEMO SISTER COMPANY ONE` | Internal company B boundary review |
| `DEMO CLIENT ALPHA ORGANIZATION` | Client A portal review |
| `DEMO CLIENT BETA ORGANIZATION` | Client B boundary target |
| `DEMO CLIENT GAMMA ORGANIZATION` | Sister-company client review |
| `DEMO CLIENT DELTA ORGANIZATION` | Sister-company client review |
| `DEMO-INV-ALPHA-001` | Fictional client-safe invoice review |
| `DEMO-INV-BETA-001` | Foreign-client access-denial target |

---

# Section 1 — Internal staff review

**Reviewers:** Business owner and Ishika, using controlled internal demo identities.  
**Goal:** Review recent internal portal updates, confirm that the multi-company experience is understandable, and verify that staff sessions cannot cross their authorized company boundary.

## 1.1 Internal portal and navigation

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| Open `/internal` while signed in as an authorized internal demo user | Internal staff shell loads | ☐ |  |
| Review the sidebar and header | Navigation clearly reads as an internal operations console | ☐ |  |
| Confirm the portal is visually distinct from the client portal | Dark internal shell, staff terminology and internal navigation are apparent | ☐ |  |
| Confirm `DEMO / SAMPLE DATA` is visible | Reviewers are not led to believe this is a final production system | ☐ |  |
| Review loading, empty and error states if encountered | State is understandable and does not reveal sensitive details | ☐ |  |

## 1.2 Companies and company context

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| View the authorized company list | Fictional companies appear according to the signed-in user's scope | ☐ |  |
| Review Company A records | Only records authorized for the user are visible | ☐ |  |
| Attempt to use a foreign fictional company ID in an authorized URL/filter | No foreign records are returned; access is denied or appears as not found | ☐ |  |
| Confirm company context affects partners and service orders | Related lists do not silently mix unauthorized companies | ☐ |  |
| Confirm no real company data is present | All visible records remain fictional/demo | ☐ |  |

## 1.3 Business partners and service orders

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| Review fictional client and partner counts | Counts are consistent with the demo seed and current scope | ☐ |  |
| Open a fictional partner record if available | Partner type and contact presentation are understandable | ☐ |  |
| Review recent service orders | Fictional order numbers, descriptions, frequencies and values are visible | ☐ |  |
| Confirm Indian currency formatting | Demo values use INR and Indian-friendly formatting where applicable | ☐ |  |
| Attempt to submit a service-order or partner request with Company B's `company_id` while scoped to Company A | The request is rejected by server authorization/RLS; no record is created | ☐ |  |
| Confirm sensitive internal notes are not shown in external client surfaces | Internal-only information stays in the internal portal | ☐ |  |

## 1.4 Internal security boundary checks

These are controlled negative tests using fictional IDs. They are not permission to probe production.

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| Replace a Company A route ID with a Company B fictional ID | No Company B record is returned | ☐ |  |
| Call an internal API with `company_id` set to the other demo company | Empty/denied response; no cross-company data | ☐ |  |
| Try to read the other company's fictional service order | Access is blocked | ☐ |  |
| Try to read the other company's fictional invoice/payment | Access is blocked | ☐ |  |
| Try to guess a private document path for the other company | Download fails | ☐ |  |
| Try an internal operation without an authenticated session | HTTP 401 or equivalent protected-route response | ☐ |  |
| Confirm audit/security behavior is not exposed to ordinary client users | Internal audit content remains internal-only | ☐ |  |

## 1.5 Internal usability review

Record observations in the feedback template rather than changing demo data unnecessarily.

| Question | Response |
|---|---|
| Can you tell which company or scope you are viewing at all times? |  |
| Is the terminology suitable for LIFT & SHIFT and sister companies? |  |
| Are the most important operational metrics easy to find? |  |
| Which screen would you use most often in day-to-day work? |  |
| What should be clearer before the next staging review? |  |

---

# Section 2 — External client portal review

**Reviewer:** A controlled external-client demo identity, not a real client account.  
**Goal:** Confirm that the client experience is visually and functionally separate and that the client can see only its own authorized organization data and explicitly shared documents.

## 2.1 Client portal entry and identity

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| Open `/client` using the fictional Client A identity | Client portal loads, or unauthenticated access is correctly blocked | ☐ |  |
| Confirm client navigation is distinct from internal navigation | Client sees only client-safe sections such as invoices, payments, statements and shared documents | ☐ |  |
| Confirm organization context is visible | The fictional organization name is clear | ☐ |  |
| Confirm `DEMO/SAMPLE` framing is visible | Reviewers understand this is an in-progress demonstration | ☐ |  |
| Confirm no internal staff navigation is exposed | Companies, vendors, audit logs and internal settings are absent | ☐ |  |

## 2.2 Client-safe information

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| View the Client A dashboard | Only Client A authorized information is displayed | ☐ |  |
| Review the fictional invoice summary | Invoice number, date, billing period, due date, total, paid, outstanding and status are understandable | ☐ |  |
| Review payment information if present | Only client-safe payment history is shown | ☐ |  |
| Confirm client-safe fields only | No margins, internal costs, internal notes, vendors, employee information or audit logs appear | ☐ |  |
| Review statement or document areas if available | Only authorized, explicitly shared information is shown | ☐ |  |

## 2.3 Client isolation attack-path checks

Use Client A as the signed-in identity and the fictional Client B invoice/record identifiers as targets.

| Test | Expected result | Done | Evidence / notes |
|---|---|:---:|---|
| Replace Client A's invoice ID with the Client B fictional invoice ID | Empty/not-found/denied response; Client B data is never rendered | ☐ |  |
| Call the client-safe invoice summary route/RPC with Client B's fictional invoice ID | Empty result or authorization-safe response | ☐ |  |
| Directly request a Client B invoice URL | Access is blocked | ☐ |  |
| Directly request Client B payments or service-order identifiers | Access is blocked | ☐ |  |
| Guess a Client B private document path | Download fails | ☐ |  |
| Attempt to view internal staff routes from a client session | Access is blocked; no internal data is shown | ☐ |  |
| Attempt to submit a forged organization or `company_id` value | Request is rejected; membership cannot be changed by client input | ☐ |  |
| Attempt an upload to the private business-document bucket as Client A | Upload is rejected by storage authorization | ☐ |  |
| Attempt a private-bucket upload while signed out | Upload is rejected | ☐ |  |

## 2.4 Client usability review

| Question | Response |
|---|---|
| Is it immediately clear which organization the client represents? |  |
| Is the invoice summary understandable without internal accounting context? |  |
| Are outstanding and payment statuses clear? |  |
| Does the client portal feel separate from the internal staff console? |  |
| What information would a real client reasonably expect later, but should not be added before authorization design is complete? |  |

---

## Defect severity and reporting

| Severity | Use when |
|---|---|
| Critical | Any cross-company/client data exposure, unauthorized private document access, privilege escalation or destructive financial behavior |
| High | A core staging workflow is blocked, or the displayed financial result is materially misleading |
| Medium | A meaningful usability, terminology, consistency or workflow problem does not expose data |
| Low | Minor copy, spacing, alignment or visual polish issue |
| Suggestion | Future enhancement outside the current staging scope |

For every issue, record the route, fictional identity, fictional record, exact steps, expected result, actual result, timestamp and screenshot where safe. Do not include real personal or financial data in screenshots or comments.

## Completion summary

| Gate | Result |
|---|---|
| Internal portal reviewed by business owner | ☐ Pass ☐ Needs follow-up |
| Internal portal reviewed by Ishika | ☐ Pass ☐ Needs follow-up |
| Company isolation negative tests completed | ☐ Pass ☐ Needs follow-up |
| Client portal reviewed with fictional identity | ☐ Pass ☐ Needs follow-up |
| Client isolation negative tests completed | ☐ Pass ☐ Needs follow-up |
| Private storage upload/download checks completed | ☐ Pass ☐ Needs follow-up |
| No real data entered or uploaded | ☐ Confirmed ☐ Issue |
| Stakeholder feedback template submitted | ☐ Yes ☐ No |
| Environment remains clearly identified as staging/in-progress | ☐ Yes ☐ No |

**Final review note:** Passing this checklist means that the current staging demonstration was reviewed against these scenarios. It does not mean the product is complete, production-ready, or approved for live operational and financial data.
