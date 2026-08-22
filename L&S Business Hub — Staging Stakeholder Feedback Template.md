# L&S Business Hub — Staging Stakeholder Feedback Template

**Review purpose:** Demonstrate and review recent project updates in the live staging environment.  
**Product status:** In-progress staging build; not a completed final product and not approved for real business data.  
**Data policy:** Use fictional `DEMO/SAMPLE` records only. Do not enter real client names, invoices, payments, documents, credentials or financial information.

## Review information

| Field | Response |
|---|---|
| Reviewer name |  |
| Review role | Internal staff / stakeholder / external-client test user |
| Review date and time |  |
| Staging URL |  |
| Browser and device |  |
| Build, branch or commit |  |
| Demo identity used |  |
| Review completed against | Internal portal / client portal / both |

## Important framing for reviewers

This review is intended to collect practical feedback on the current implementation and recent updates. Screens may be incomplete, some actions may be placeholders, and the information architecture may change before a final release. A successful demonstration does not mean the platform is production-ready, secure for live financial data, or complete across all planned features.

Please report what you observed rather than assuming how an unfinished feature should work. Do not work around an access restriction by creating real records or uploading real files. If an action appears to expose another company's or client's data, stop immediately, record the URL and fictional record identifiers, and report it as a **critical security issue**.

## A. What did you review?

Describe the pages and flows you tested. Include whether you reviewed the internal staff experience, external client experience, company switching, partner/service-order views, fictional invoice summaries, or access-denial behavior.

**Response:**

## B. What worked well?

Describe the parts that were clear, useful or visually appropriate for an established Indian business group. Comment on navigation, terminology, hierarchy, readability, dashboard usefulness, status labels and the distinction between internal and client portals.

**Response:**

## C. What was confusing or incomplete?

Identify screens, labels, workflows, missing information or unexpected behavior that prevented you from understanding what to do next. Separate a usability concern from a deliberately unimplemented Phase 3/Phase 4 feature where possible.

**Response:**

## D. Workflow feedback

| Workflow | What I expected | What happened | Suggested change | Priority |
|---|---|---|---|---|
| View authorized companies |  |  |  |  |
| Review business partners |  |  |  |  |
| Review service orders |  |  |  |  |
| Review client-safe invoice summary |  |  |  |  |
| Switch or confirm organization context |  |  |  |  |
| Review loading/error/empty states |  |  |  |  |

## E. Data and terminology feedback

Comment on whether labels such as **business partner**, **client organization**, **service order**, **billing schedule**, **invoice**, **payment**, **outstanding** and **DEMO/SAMPLE** are understandable. Note any terminology that could cause an operational or financial misunderstanding.

**Response:**

## F. Security and privacy observations

Do not attempt to access real or unapproved data. Using only the fictional demo identities, record whether you observed any of the following:

| Observation | Result / evidence |
|---|---|
| A user saw a company outside their authorized scope |  |
| A client saw another client's invoice, payment or service order |  |
| A client saw internal notes, vendors, employee data or audit logs |  |
| A private document was visible without an explicit share |  |
| A guessed URL or identifier returned a foreign record |  |
| A document download or upload behaved unexpectedly |  |

Any positive finding in this section should be marked **Critical** and reported immediately, even if it occurs only once.

## G. Issue report

Complete one copy for each issue that requires follow-up.

| Field | Response |
|---|---|
| Short issue title |  |
| Severity | Critical / High / Medium / Low / Suggestion |
| Portal | Internal / Client |
| Page or route |  |
| Demo identity and fictional record |  |
| Steps to reproduce |  |
| Expected behavior |  |
| Actual behavior |  |
| Screenshot or screen recording |  |
| Does it expose data across a company/client boundary? | Yes / No / Unsure |
| Suggested resolution |  |

## H. Prioritization

| Priority | Meaning |
|---|---|
| Critical | Possible cross-company/client data exposure, unauthorized document access, privilege escalation or destructive financial behavior |
| High | Blocks a core workflow, produces materially misleading financial information or prevents safe stakeholder testing |
| Medium | Significant usability, terminology, consistency or workflow issue that does not expose data |
| Low | Minor polish, copy or layout improvement |
| Suggestion | Useful future enhancement outside the current staging scope |

## I. Overall review summary

| Question | Response |
|---|---|
| What is the most valuable recent update? |  |
| What should be addressed before the next stakeholder review? |  |
| What should not yet be shown to external stakeholders? |  |
| Did the staging build feel clearly different from a final release? |  |
| Did the DEMO/SAMPLE labeling remain clear? |  |
| Would you approve another review round after fixes? | Yes / No / With conditions |

## Reviewer sign-off

I understand that this is an in-progress staging demonstration using fictional data. I did not enter or upload real business information, and I reported any possible tenant-isolation or privacy issue immediately.

**Name:**  
**Date:**  
**Notes:**
