# CareTalk360 — Page Tracker

Tracks every sidebar menu item, its route, BETA equivalent, and build status.

**Status key:** BUILT = real page exists | PLACEHOLDER = route works, page under development | NOT STARTED = no route yet

---

## Top-Level Links

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| Dashboard | `/dashboard` | `/dashboard` | BUILT |
| Appts. Details | `/appointment-details` | `/dashboard/appointmentsDetails` | BUILT |

## Client Admin

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| Client List | `/client-list` | `/dashboard/administration/clientsList` | BUILT |
| Eligibility Lists | `/eligibility-lists` | `/dashboard/administration/client-eligibility` | PLACEHOLDER |

## User Admin

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| User List | `/user-list` | `/dashboard/administration/admins` | BUILT |
| User Types | `/user-types` | `/dashboard/administration/user-types` | BUILT |
| Create User | `/create-user` | `/dashboard/administration/register/:id` | BUILT |

## Patients

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| Search Patient | `/search-patient` | `/dashboard/administration/search-eligibility` | BUILT |
| Create Patient | `/create-patient` | _(patient creation flow)_ | BUILT |

## Reporting

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| Appointment Report | `/appointment-report` | `/dashboard/administration/completed-appointment` | PLACEHOLDER |
| Physician-interval | `/physician-interval` | `/dashboard/administration/physician-interval-state` | PLACEHOLDER |
| Physician-schedules | `/physician-schedules` | `/dashboard/administration/Physician-schedules` | PLACEHOLDER |
| Physician Capacity | `/physician-capacity` | `/dashboard/administration/physician-Capacity` | PLACEHOLDER |
| SnapBP Report | `/snapbp-report` | `/dashboard/administration/snapbp-report` | PLACEHOLDER |
| Status Report | `/status-report` | `/dashboard/administration/status-report` | PLACEHOLDER |
| Availability Report | `/availability-report` | `/dashboard/administration/availability-report` | PLACEHOLDER |

## Doctor

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| My Appointments | `/doctor-appointments` | `/dashboard/doctor/appointments/me` | BUILT |
| My Availability | `/doctor-availability` | `/dashboard/doctor/availability/me` | PLACEHOLDER |
| My Profile | `/doctor-profile` | `/dashboard/administration/admins/me` | PLACEHOLDER |

## Settings

| Menu Item | Dev Route | BETA Route | Status |
|---|---|---|---|
| Diseases List | `/diseases` | `/dashboard/diseases` | PLACEHOLDER |
| S3 Import Logs | `/s3-import-logs` | `/dashboard/administration/files-display` | PLACEHOLDER |
| Forms import | `/form-import` | `/dashboard/administration/form-import` | PLACEHOLDER |
| SMS logs | `/sms-logs` | `/dashboard/administration/doctor-sms-logs` | PLACEHOLDER |
| SMS Templates | `/sms-templates` | `/dashboard/administration/sms-templates` | PLACEHOLDER |
| Doses Logs | `/doses-logs` | `/dashboard/administration/doses-logs` | PLACEHOLDER |
| Doses | `/doses` | `/dashboard/administration/doses` | PLACEHOLDER |
| CCDA Management | `/ccda-management` | `/dashboard/administration/ccda-management` | PLACEHOLDER |
| TimeZone | `/timezone` | `/dashboard/TimeZone` | PLACEHOLDER |
| System Logs | `/system-logs` | _(developer-access-only)_ | PLACEHOLDER |
| Error Logs | `/error-logs` | `/dashboard/error-logs` | PLACEHOLDER |
| Form Setup | `/form-setup` | `/dashboard/form-setup` | BUILT |
| Form Creator | `/form-creator` | `/dashboard/form-creator` | PLACEHOLDER |
| GAP Type | `/gap-type` | `/dashboard/GAP-Type` | PLACEHOLDER |
| Appointment List | `/appointment-types` | `/dashboard/appointment-type` | BUILT |
| Trigger WebHooks | `/trigger-webhooks` | `/dashboard/TriggerWebHooks` | PLACEHOLDER |
| WebHooks Actions | `/webhooks-actions` | `/dashboard/WebHooks-Actions` | PLACEHOLDER |
| WebHooks Logs | `/webhooks-logs` | `/dashboard/WebHooks-Logs` | PLACEHOLDER |
| Service Actions | `/service-actions` | `/dashboard/Service-Actions` | PLACEHOLDER |
| Client SubDomain | `/client-subdomain` | `/dashboard/ClientSubdomain` | PLACEHOLDER |
| Admin Settings | `/admin-settings` | `/dashboard/admin-settings` | PLACEHOLDER |

## Detail/Edit Routes (not in sidebar)

| Page | Dev Route | BETA Route | Status |
|---|---|---|---|
| Edit User | `/edit-user/:id` | `/dashboard/administration/admins/:id` | BUILT |
| Edit User Type | `/edit-user-type/:id` | `/dashboard/administration/user-types/:id` | BUILT |
| State Details | `/state-details` | `/dashboard/appointmentsByState` | BUILT |
| Provider Details | `/provider-details` | _(provider detail view)_ | BUILT |

---

## Summary

| Status | Count |
|---|---|
| BUILT | 15 |
| PLACEHOLDER | 32 |
| **Total** | **47** |
