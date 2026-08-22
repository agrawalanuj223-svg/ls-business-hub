# L&S Business Hub — Role and Permission Matrix

The matrix describes intended capabilities. Every capability must be enforced in server-side service functions and, where the operation touches tenant rows, by PostgreSQL RLS. A UI control may be hidden for convenience but is never the enforcement mechanism.

| Capability | Group Admin | Company Admin | Finance | Staff | Viewer | Client Admin | Client User | Client Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| View assigned-company dashboard | Yes | Yes | Yes | Yes | Yes | Client-safe only | Client-safe only | Client-safe only |
| View all-company consolidated reports | Yes | No | No | No | No | No | No | No |
| Manage companies | Yes | Limited/authorized | No | No | No | No | No | No |
| Manage internal users and roles | Yes | Authorized company scope | No | No | No | No | No | No |
| View business partners | Yes | Yes | Yes | Assigned scope | Read-only assigned | Own organization only | Own organization only | Own organization only |
| Create/update business partners | Yes | Yes | No | Authorized operational scope | No | No | No | No |
| Create/update service orders | Yes | Yes | No | Yes | No | No | No | No |
| Manage billing schedules | Yes | Yes | Finance/authorized | Yes | No | No | No | No |
| Create/update invoices | Yes | Yes | Yes | No by default | No | No | No | No |
| Record/update payments | Yes | Yes | Yes | No | No | No | No | No |
| View receivables and aging | Yes | Yes | Yes | No by default | Read-only authorized | Own client-safe data | Own client-safe data | Own client-safe data |
| Upload internal documents | Yes | Yes | Authorized | Yes | No | No | No | No |
| Share documents with clients | Yes | Yes | Authorized | Authorized | No | No | No | No |
| View internal audit logs | Yes | Authorized | No | No | No | No | No | No |
| Invite client users | Yes | Yes | Authorized | No by default | No | Limited to own organization if enabled | No | No |
| View shared client documents | Internal scope | Internal scope | Internal scope | Internal scope | Internal scope | Yes | Yes | Yes |
| Download shared client documents | According to document grant | According to document grant | According to document grant | According to document grant | According to document grant | According to grant | According to grant | According to grant |
| Export reports | Yes | Yes | Yes | Authorized | Authorized read-only | Client-safe statements only | Client-safe statements only | Client-safe statements only |
| Archive/cancel financial records | Yes | Authorized | Authorized by policy | No | No | No | No | No |

## Scope rules

Internal roles are always paired with one or more active company memberships. A group administrator may receive a controlled all-company reporting scope, but writes must still identify one concrete company and pass that company's authorization check.

Client roles are always paired with one active client organization membership. Client-safe views expose only allowlisted fields. Internal notes, vendors, margins, employee data, audit logs and approval information are excluded even when an invoice or service order is visible.

Permission changes, invitations, document shares, role changes and destructive lifecycle actions create audit events. A role cannot grant itself broader scope, and an organization cannot be selected by a client during invitation redemption.
