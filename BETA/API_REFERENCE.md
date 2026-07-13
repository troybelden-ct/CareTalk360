# CareTalkBeta -- API Reference (extracted)

**Source:** caretalkbeta.com production bundle (`main.js`, 5.5MB) -- extracted 2026-07-08  
**Method:** String-literal extraction from minified Angular production bundle. All endpoints, services, and entities documented below are visible as preserved string literals in the compiled code.

## Base URLs

The environment config dynamically derives URLs from the window origin:

```
const origin = window.location.origin;          // e.g. https://caretalkbeta.com
const apiOrigin = origin
  .replace("//www.", "//api.")
  .replace("//caretalk.", "//caretalkapi.");

environment = {
  production: true,
  apiUrl:    `${apiOrigin}api/`,              // e.g. https://api.caretalkbeta.com/api/
  signalUrl: `${apiOrigin}`,                  // e.g. https://api.caretalkbeta.com/
  hubUrl:    `${apiOrigin}hubs/`,             // e.g. https://api.caretalkbeta.com/hubs/
  clientUrl: origin,                           // e.g. https://caretalkbeta.com
  timeOffset: 0
}
```

**Known hardcoded URLs:**
| URL | Context |
|-----|---------|
| `https://api.caretalkbeta.com/api/forms` | Form import (beta target) |
| `https://api.caretalk360.com/api/forms` | Form import (production target) |
| `https://api.caretalkbeta.com/api/auth/user-login` | Login (beta) |
| `https://api.caretalk360.com/api/auth/user-login` | Login (production) |
| `https://api.caretalkbeta.com/index.html` | Swagger (beta) |
| `https://api.caretalk360.com/index.html` | Swagger (production) |
| `https://api.photon.health/graphql` | Photon Health e-prescribing (prod) |
| `https://api.neutron.health/graphql` | Neutron Health e-prescribing (dev) |
| `http://10.0.0.15:8094/index.html` | Internal dev server (inferred) |

---

## 1. Authentication & Authorization

### 1.1 Auth Service

**Base URLs:**
- `loginUrl` = `apiUrl + "auth/user-login"`
- `loginDeveloperUrl` = `apiUrl + "auth/developer-login"`
- `currentUserUrl` = `apiUrl + "auth/currentUser"`

| Method | HTTP | Path | Params / Body | Notes | Description |
|--------|------|------|---------------|-------|-------------|
| `userLogin(data)` | POST | `auth/user-login` | Body: login form value; Header: `{from: "frologin"}` | Returns auth token; stored as `auth_token` in localStorage | Authenticate a user and receive an auth token |
| `userDeveloperLogin(data)` | POST | `auth/developer-login` | Body: login form value | Developer-only login | Authenticate a developer account |
| `saveCurrentUser()` | GET | `auth/currentUser` | -- | Returns current user data, stored in localStorage as `currentUser` | Fetch the currently authenticated user's profile and cache it locally |
| `currentUser()` | GET | `auth/currentUser` | -- | Returns from localStorage cache or fetches from API | Get the current user from local cache or fetch from the API |

**Token storage:** `localStorage.setItem("auth_token", token)` / `localStorage.setItem("currentUser", JSON.stringify(data))`

### 1.2 Route Guards

Four route guards are visible in the bundle (minified names: `E`, `ar`, `fe`, `As`):

| Guard (minified) | Protects | Logic |
|------------------|----------|-------|
| `E` (SubdomainGuard) | Root path `""` | Checks if the URL contains a subdomain via regex, calls `BucketService.checkUrl(subdomain)`. If a `clientId` is returned, navigates to `/client/patient-data?id=clientId`. Otherwise allows access. |
| `ar` (LoginRedirectGuard) | `/login` | Checks if `auth_token` and `currentUser` exist in localStorage. If both present, redirects away from login (user already authenticated). |
| `fe` (AuthGuard) | `/dashboard` (and children) | Verifies token exists and validates the current route against the user's assigned routes. Uses `removeTrailingInteger()` to normalize `:id` params. Redirects to `/login` if unauthorized. |
| `As` (DeveloperGuard) | `/developer-access-only/*` | Guards all developer-only routes (routing admin, logs, migrations). Logic not fully visible but protects the `8d93n1b2z7y3k5l8` developer path. |

**CanDeactivate Guard:** A `canDeActiveGuardService` is used on the appointment telehealth route to prompt "Would you like to complete this appointment?" before leaving.

---

## 2. Services (grouped by domain)

### 2.1 User Management

#### 2.1.1 Admins Service

**Base URL:** `apiUrl + "admins"` (aliased as `AdminsListUrl`)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAdmins(...)` | GET | `admins` | `Page`, `PageSize`, `sortBy`, `sortOrder`, `fullName`, `isActive` | Paginated admin list | List all admins with optional filtering and pagination |
| `getAdmin(id)` | GET | `admins/{id}` | -- | Single admin by ID | Get a single admin by ID |
| `addAdmin(data, isSendingEmail)` | POST | `admins?isSendingEmail={bool}` | Body: admin data | Create admin | Create a new admin user, optionally sending a welcome email |
| `updateAdmin(id, data)` | PUT | `admins/{id}` | Body: admin data | Update admin | Update an existing admin's details |
| `deleteAdmin(id)` | DELETE | `admins/{id}` | -- | Delete admin | Delete an admin by ID |
| `getDoctorPatients(...)` | GET | `admins/doctorPatients` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Doctor's patient list | List patients assigned to a doctor |
| `doctorLookUp(fullName)` | GET | `admins/DoctorsLookUp` | `fullName` | Doctor name lookup | Search for doctors by name |
| `getDoctorsList(...)` | GET | `admins/DoctorsLookUp` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Paginated doctors list | List all doctors with pagination |
| `resetPassword(data)` | POST | `admins/resetpassword` | Body: password reset data | Reset password | Reset a user's password |
| `ChangePassword(data)` | POST | `admins/changepassword` | Body: password change data | Change password | Change the current user's password |
| `RequestForgetPassword(username)` | GET | `admins/RequestForgetPassword?username={username}` | -- | Request password reset | Send a password reset link to the user's email |
| `getUserRoutes()` | GET | `admins/routes` | -- | Get user's assigned routes (cached) | Get the navigation routes assigned to the current user |
| `zipCodeCheck(zip)` | GET | `TimeZones/ValidateZip?zip={zip}` | -- | Validate zip code | Validate a zip code for timezone resolution |

#### 2.1.2 UserTypes Service

**Base URLs:**
- `userTypesListUrl` = `apiUrl + "UserTypes"`
- Separate service: `apiUrl + "UserTypes"` (for `getUserTypeByName`)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getUserTypes(...)` | GET | `UserTypes` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All user types | List all user types with pagination |
| `getUserType(id)` | GET | `UserTypes/{id}` | -- | Single user type | Get a single user type by ID |
| `updateUserType(id, data)` | PUT | `UserTypes/{id}` | Body: user type data | Update user type | Update a user type's configuration |
| `getRoutes(typeId, isAssigned)` | GET | `UserTypes/routes?typeId={typeId}&isAssigned={isAssigned}` | -- | Routes for a user type | Get routes assigned or available for a user type |
| `deleteUserTypeRoute(routeId, typeId)` | DELETE | `UserTypes/routes?routeId={routeId}&typeId={typeId}` | -- | Remove route from type | Remove a route from a user type's permissions |
| `AddUserTypeRoute(data)` | POST | `UserTypes/routes` | Body: route assignment data | Assign route to type | Assign a navigation route to a user type |
| `getUserTypeByName(name)` | GET | `UserTypes/GetTypeByName/{name}` | -- | Lookup user type by name | Look up a user type by its name |

#### 2.1.3 User Relation Service

**Base URLs:**
- `apiUrl` = `apiUrl + "userrelation"`
- `searchEligible` = `apiUrl + "userrelation/GetEligibles"`
- `eligiblesExportedFile` = `apiUrl + "ClientReports"`
- `formExportFile` = `apiUrl + "EligibileSurvey/ExportFormTemplate"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getUsersByParentIdAsync(parentId, typeId, page, pageSize)` | GET | `userrelation/GetUsersByParentIdAsync` | `parentId`, `userRelationTypeId`, `Page`, `PageSize` | Get child users | List child users belonging to a parent entity |
| `getUsersByParentIdWithFilterAsync(filters)` | POST | `userrelation/GetUsersByParentIdAsync` | Query: `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter object | Filtered child users | Search child users with advanced filters |
| `getPatientWithFilterAsync(filters)` | POST | `userrelation/GetEligibles` | Query: `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter object | Search eligible patients | Search for eligible patients with filters |
| `getParentsByUserIdAsync(userId, typeId)` | GET | `userrelation/getParentsByUserIdAsync?userId={userId}&userRelationTypeId={typeId}` | -- | Get parent users | Get the parent entities for a given user |
| `getDoctorsByUserIdAsync(userId)` | GET | `userrelation/GetDoctorsByUserIdAsync?userId={userId}` | -- | Get user's doctors | Get doctors assigned to a user |
| `createUserRelation(data)` | POST | `userrelation` | Body: relation data | Create user relation | Create a relationship between two users |
| `getClientStatus(userId)` | GET | `userrelation/GetClientStatsData?userId={userId}` | -- | Client statistics | Get summary statistics for a client |
| `getUserRelationByName(name)` | GET | `userrelation/GetUserRelationTypeByname?name={name}` | -- | Relation type lookup | Look up a user relation type by name |
| `checkRootClient(clientId)` | GET | `userrelation/CheckClientAbilityToHaveAChild?clientId={clientId}` | -- | Check if client can have children | Check whether a client can have child entities |
| `uploadExcelEligibleFile(reportType, fileId)` | GET | `ClientReports/{reportType}/{fileId}` | -- | Download exported file (blob) | Download an exported eligibility report file |
| `exportFormFile(formId)` | GET | `EligibileSurvey/ExportFormTemplate?formId={formId}` | -- | Export form template (blob) | Export a form template as a downloadable file |

---

### 2.2 Patient Management

#### 2.2.1 Patient Registration Service

**Base URL:** `apiUrl + "Patients/"` (note: uppercase P, trailing slash)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `isPatientExist(data)` | GET | `Patients/CheckElgibility?Value={email}&ClientId={clientId}` | -- | Check patient eligibility by email | Check if a patient is eligible by email address |
| `patientCode(value, code, clientId)` | GET | `Patients/CheckElgibilityCode?value={value}&ClientId={clientId}&code={code}` | -- | Verify eligibility code | Verify a patient's eligibility code |
| `checkedPatientData(data, token)` | GET | `Patients/SearchForPatient?FirstName={fname}&LastName={lname}&zipCode={code}&DateOfBirth={birth}&token={token}` | -- | Search for patient by demographics | Search for a patient by name, zip code, and date of birth |

#### 2.2.2 Patient Clinical Service

**Base URL:** `apiUrl + "patients"` (lowercase p, no trailing slash)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getPatientById(id)` | GET | `patients/{id}` | -- | Patient by ID | Fetch a single patient by ID |
| `getPatientByIdAppointmentForm(eligId)` | GET | `patients/GetPatientByEligibilityId/{eligId}` | -- | Patient by eligibility ID | Fetch a patient by their eligibility ID |
| `updatePatientByIdAppointmentForm(id, data)` | PUT | `patients/UpdatePatientDemoGraphic?id={id}` | Body: demographic data | Update demographics | Update a patient's demographic information |
| `getClinicalDataActivity(id)` | GET | `patients/GetClinicalDataActivity/{id}` | -- | Clinical data activity | Get clinical data activity history for a patient |
| `addPatient(data)` | POST | `patients` | Body: patient data | Create patient | Create a new patient record |
| `updatePatient(id, data)` | PUT | `patients?Id={id}` | Body: patient data | Update patient | Update an existing patient record |

#### 2.2.3 Encounter Summary

**Base URL:** `apiUrl + "EncounterSummary/pdf/"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getPdfCallEncounterSummary(id1, id2)` | GET | `EncounterSummary/pdf/{id1}/{id2}` | Returns PDF blob | Download an encounter summary as a PDF |

---

### 2.3 Client Management

#### 2.3.1 Client Service

**Base URL:** `apiUrl + "Clients"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getClientById(id)` | GET | `Clients/{id}` | -- | Single client | Get a single client by ID |
| `addClient(data)` | POST | `Clients?IsSendingEmail=false` | Body: client data | Create client | Create a new client |
| `updateClient(id, data)` | PUT | `Clients/{id}` | Body: client data | Update client | Update an existing client |
| `deActivateClient(id)` | GET | `Clients/ToggleActiveUser/{id}` | -- | Toggle client active status | Toggle a client's active/inactive status |

#### 2.3.2 Client S3 Bucket Service

**Base URL:** `apiUrl + "ClientS3Bucket"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `addBucket(data)` | POST | `ClientS3Bucket` | Body: bucket config | Create S3 bucket config | Create an S3 bucket configuration for a client |
| `getClientBucket(clientId)` | GET | `ClientS3Bucket/byclient/{clientId}` | -- | Get client's bucket | Get the S3 bucket config for a client |
| `updateBucket(id, data)` | PUT | `ClientS3Bucket/{id}` | Body: bucket data | Update bucket | Update an S3 bucket configuration |
| `deleteBucket(id)` | DELETE | `ClientS3Bucket/{id}` | -- | Delete bucket | Delete an S3 bucket configuration |
| `getBucketLookUp()` | GET | `ClientS3Bucket/ClientsWithS3BucketLookUp?isHaveBucket=false` | -- | Clients without buckets | List clients that do not yet have an S3 bucket |
| `getChildClientsByParentId(parentId)` | GET | `ClientS3Bucket/ClientsWithS3BucketLookUpByParentClientId?parentClientId={parentId}` | -- | Child clients by parent | List child clients with S3 bucket info by parent client |
| `checkUrl(subdomain)` | GET | `ClientS3Bucket/GetBySubDomainAsync?subdomain={subdomain}` | -- | Subdomain lookup (cached) | Resolve a subdomain to its client ID |
| `getAllFiles(...)` | GET | `ClientS3Bucket/Files` | `Page`, `PageSize`, `sortBy`, `sortOrder` | List files in bucket | List files stored in the S3 bucket with pagination |

#### 2.3.3 Client SubDomain Appointment Service

**Base URL:** `apiUrl + "ClientSubDomainAppointment"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getClientSubDomainList(...)` | GET | `ClientSubDomainAppointment/GetList` | `Page`, `PageSize`, `sortBy`, `sortOrder` | List subdomains | List client subdomain appointment configurations |
| `createClientSubDomain(data)` | POST | `ClientSubDomainAppointment` | Body: subdomain data | Create subdomain | Create a client subdomain appointment configuration |
| `updateClientSubDomain(id, data)` | PUT | `ClientSubDomainAppointment/{id}` | Body: subdomain data | Update subdomain | Update a client subdomain appointment configuration |
| `deleteClientSubDomain(id)` | DELETE | `ClientSubDomainAppointment/{id}` | -- | Delete subdomain | Delete a client subdomain appointment configuration |

#### 2.3.4 Client Reports Service

**Base URL:** `apiUrl` (uses `BaseUrl` directly)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getClientProgramsByClientID(...)` | POST | `ClientReports/GetClientReportById` | `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter | Client report by ID | Get a client's program report by client ID |
| `getClientProgramsByClientIDs(...)` | POST | `ClientReports/GetByClientIds` | `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter | Reports by multiple client IDs | Get program reports for multiple clients at once |
| `getClients(...)` | GET | `ClientReports/GetClientsPrograms` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Client programs list | List all clients and their associated programs |

---

### 2.4 Appointments

#### 2.4.1 Patient Appointments Service (main)

**Base URLs:**
- `patientAppointmentUrl` = `apiUrl + "PatientAppointments"`
- `physiciansSchedule` = `apiUrl + "PhysiciansSchedule"`
- `PatientVitalSignUrl` = `apiUrl + "PatientVitalSign"`
- `PatientAnalysisUrl` = `apiUrl + "Analysis"`
- `PatientAppointmentStatsUrl` = `apiUrl + "PatientAppointmentStats"`
- `DoctorAppointmentTypesUrl` = `apiUrl + "Appointments/Lookup"`
- `DoctorAppointmentStatusUrl` = `apiUrl + "PatientAppointmentStatus"`
- `AllDoctorsUrl` = `apiUrl + "DoctorAvailability/GetAvailabileDoctors"`

**PatientAppointments endpoints:**

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getPatientAppointmentById(id)` | GET | `PatientAppointments/{id}` | -- | Single appointment | Get a single appointment by ID |
| `reserveAppointment(data)` | POST | `PatientAppointments` | Body: appointment data | Create/reserve appointment | Create or reserve a new patient appointment |
| `updateAppointmentRoom(id, data)` | PUT | `PatientAppointments/{id}` | Body: `{appointmentStatus, status}` | Update appointment (status, room) | Update an appointment's status or room assignment |
| `updateDoctorAndOrDate(id, doctorId, date)` | PUT | `PatientAppointments/UpdateDoctorAndDate/{id}` | `doctorId`, `appointmentDate` | Reassign doctor/date | Reassign an appointment to a different doctor or date |
| `deletePatientAppointment(id)` | DELETE | `PatientAppointments/{id}` | -- | Delete appointment | Delete a single appointment |
| `deleteAppointmentsList(ids)` | DELETE | `PatientAppointments/DeleteList` | Body: ID array | Bulk delete | Delete multiple appointments at once |
| `getPatientAppointments(patientId, ...)` | GET | `PatientAppointments/ByPatient/{patientId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | By patient | List appointments for a specific patient |
| `getPatientAppointmentsByDoctor(doctorId, ...)` | GET | `PatientAppointments/ByDoctor/{doctorId}` | `Page`, `PageSize`, `sortBy`, `sortOrder`, `status` | By doctor | List appointments for a specific doctor |
| `getPatientAppointmentByDoctorWithPostMethos(filter, ...)` | POST | `PatientAppointments/ByDoctor` | `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter | By doctor (POST with filter) | Search appointments by doctor with advanced filters |
| `getAppointmentWithStatusAndSearch(filter, page, pageSize)` | POST | `PatientAppointments/ByStatus` | `Page`, `PageSize`, `sortBy`, `sortOrder`; Body: filter object | Status-based search | Search appointments by status with filters |
| `getPatientAppointmentsByTime(patientId, params)` | GET | `PatientAppointments/GetLastAndNext/{patientId}` | `getLastAppointment`, `getNextAppointment` | Previous/next appointments | Get a patient's previous and/or next appointment |
| `getNurseReviewedAppointments(id, page, pageSize)` | GET | `PatientAppointments/NurseReviewed/{id}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Nurse-reviewed appointments | List appointments reviewed by a specific nurse |
| `getSupervisorAppointments(id, page, pageSize)` | GET | `PatientAppointments/GetBySupervisorId/{id}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Supervisor's appointments | List appointments under a supervisor |
| `getAppointmentsByEligibleIdForStateId(eligId, stateId)` | GET | `PatientAppointments/UnlicensedForNewState/{eligId}/{stateId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Unlicensed state appointments | Get appointments where the provider is unlicensed for a new state |
| `assignPatientsToDoctor(data)` | PUT | `PatientAppointments/appointments/reassign` | Body: reassignment data | Bulk reassign | Bulk-reassign appointments to a different doctor |
| `getPatientAppointmentStatus()` | GET | `PatientAppointmentStatus` | -- | Status lookup list | Get the list of appointment status values |
| `getAvailableDoctors(date, eligibilityId)` | GET | `DoctorAvailability/GetAvailabileDoctors?date={date}&eligibilityId={eligId}` | -- | Available doctors for a date | Get doctors available on a given date for a patient |

**PatientAppointmentStats endpoints:**

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAppointmentStatsGrouped(groupBy, start, end)` | GET | `PatientAppointmentStats/count-grouped-by-period` | `groupBy`, `startDate`, `endDate` | Stats grouped by period | Get appointment counts grouped by time period |
| `getAppointmentStatsPerHour(groupBy, start, end)` | GET | `PatientAppointmentStats/count-grouped-per-hour` | `groupBy`, `startDate`, `endDate` | Stats per hour | Get appointment counts grouped by hour of day |
| `getAppointmentStatsByState(groupBy, start, end)` | GET | `PatientAppointmentStats/count-grouped-by-state` | `groupBy`, `startDate`, `endDate` | Stats by state | Get appointment counts grouped by state |
| `getApptsTodayCountWithSameLicense(doctorId)` | GET | `PatientAppointmentStats/CountWithSameLicenseByDoctorId/{doctorId}` | -- | Same-license appointment count | Count today's appointments for a doctor with the same state license |

**PhysiciansSchedule endpoints:**

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getDoctorWeekAvailability(doctorId, date)` | GET | `PhysiciansSchedule/user/{doctorId}/date/{isoDate}` | -- | Doctor's weekly schedule | Get a doctor's weekly availability schedule |
| `getAppointmentDetails(patientId, date)` | GET | `PhysiciansSchedule/GetPatientAppointmentDetails?date={date}&pateintId={patientId}` | -- | Appointment details | Get appointment details for a patient on a specific date |
| `getlistDoctor(eligibleId, date, apptId)` | GET | `PhysiciansSchedule/GetFreeDoctors?date={date}&AppointmentId={apptId}&eligibleId={eligibleId}` | -- | Available doctors | Get doctors with free slots for a given date and appointment |
| `getFreeSlots(apptId, date, eligId, page, pageSize)` | GET | `PhysiciansSchedule/GetFreeSlots?date={date}&AppointmentId={apptId}&eligibleId={eligId}&Page={page}&PageSize={pageSize}` | -- | Free time slots | Get available time slots across all doctors |
| `getFreeSlotsByDoctorId(apptId, date, eligId, page, pageSize, doctorId)` | GET | `PhysiciansSchedule/GetFreeSlotsByDoctorId?date={date}&AppointmentId={apptId}&eligibleId={eligId}&Page={page}&PageSize={pageSize}&doctorId={doctorId}` | -- | Free slots for specific doctor | Get available time slots for a specific doctor |
| `updateDoctorAvailability(data)` | POST | `PhysiciansSchedule/week` | Body: availability array | Update weekly schedule | Set a doctor's weekly availability slots |
| `getPhysiciansIntervals(data)` | POST | `PhysiciansSchedule/GetPhysiciansByInterval` | Body: interval filter | Physician availability intervals | Search for physician availability within a time interval |
| `getPhysiciansSchedules(...)` | GET | `PhysiciansSchedule/GetPhysiciansSchedules` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All physician schedules | List all physician schedules with pagination |
| `getListAllUserByDateRange(start, end, page, pageSize)` | GET | `PhysiciansSchedule/GetListAllUserByDateRange` | `startDate`, `endDate`, `Page`, `PageSize`, `sortBy`, `sortOrder` | Schedules by date range | List all user schedules within a date range |
| `GetPhysiciansByCapacity(...)` | GET | `PhysiciansSchedule/GetPhysiciansByCapacity` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Capacity-based lookup | List physicians sorted by remaining capacity |

**VitalSign & Analysis endpoints:**

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getPatientVitalSignUrl(eligId, page, pageSize)` | GET | `PatientVitalSign/GetListByEligibleId?eligableId={eligId}` + pagination | Patient vital signs | List vital signs for a patient by eligibility ID |
| `getPatientVitalSignHGUrl(eligId)` | GET | `PatientVitalSign/CreateHGByEligibleId/{eligId}` | Sync vitals from Health Gorilla | Sync a patient's vital signs from Health Gorilla |
| `getPatientAnalysisUrl(id1, id2)` | GET | `Analysis/VitalSigns/{id1}/{id2}` | Vital sign analysis | Get a vital sign analysis for a patient |

#### 2.4.2 Appointment Types Service

**Base URL:** `apiUrl + "Appointments"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllAppointmentType(page, pageSize)` | GET | `Appointments` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Paginated appointment types | List all appointment types with pagination |
| `getAllAppointmentlist(page, pageSize)` | GET | `Appointments/Lookup` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Appointment type lookup | Get appointment types as a lookup list |
| `getAppointmentTypeID(id)` | GET | `Appointments/{id}` | -- | Single type | Get a single appointment type by ID |
| `createAppointmentType(data)` | POST | `Appointments` | Body: appointment type data | Create type | Create a new appointment type |
| `UpdateAppointmentType(id, data)` | PUT | `Appointments/{id}` | Body: appointment type data | Update type | Update an appointment type |
| `DeleteAppointmentTypeById(id)` | DELETE | `Appointments/{id}` | -- | Delete type | Delete an appointment type |
| `getDoctorsNamesList(apptId)` | GET | `DoctorAppointments/GetListByAppointmentId/{apptId}` | -- | Doctors for appointment type | List doctors assigned to an appointment type |
| `GetProgramAppointments(programId, ...)` | GET | `Appointments/GetProgramAppointments/{programId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Appointments by program | List appointment types for a specific program |

#### 2.4.3 Doctor Appointments Service

**Base URL:** `apiUrl + "DoctorAppointments/"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getArrDoctorAssignations(id, programId, ...)` | GET | `DoctorAppointments/{id}?programId={programId}` | -- | Doctor's assigned appointment types | Get appointment types assigned to a doctor for a program |
| `updateDoctorAppointments(data)` | PUT | `DoctorAppointments/UpdateDoctorAppointment` | Body: assignment data | Update doctor assignment | Update a doctor's appointment type assignments |

#### 2.4.4 Doctor Program Service

**Base URL:** `apiUrl + "DoctorProgram/"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getDoctorAssignations(doctorId, clientId, ...)` | GET | `DoctorProgram/by-doctor` | `doctorId`, `clientId`, `Page`, `PageSize`, `sortBy`, `sortOrder` | Doctor's program assignments | List programs assigned to a doctor for a client |
| `getDoctorThisPrograms(programIds)` | POST | `DoctorProgram/by-programIds` | Body: program ID array | Programs for doctor | Get programs by a list of program IDs |

#### 2.4.5 Appointment Activity Service

**Base URL:** `apiUrl + "AppointmentActivity"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getAppointmentActivityCheck(apptId)` | GET | `AppointmentActivity/GetByAppointmentId/{apptId}` | Check appointment activity | Check the activity status for an appointment |

#### 2.4.6 Patient Appointment Status Log Service

**Base URL:** `apiUrl + "PatientAppointmentStatusLog"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getPatientAppointmentStatusLog(createdAt, apptDate, page, pageSize)` | GET | `PatientAppointmentStatusLog/GetList` | `CreatedAt`, `PatientAppointmentDate`, `Page`, `PageSize`, `sortBy`, `sortOrder` | Status change log | List appointment status change history |

---

### 2.5 Programs & Activities

#### 2.5.1 Programs Service

**Base URL:** `apiUrl + "Programs"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getProgramById(id, ...)` | GET | `Programs/{id}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Single program | Get a single program by ID |
| `addProgram(data)` | POST | `Programs` | Body: program data | Create program | Create a new clinical program |
| `updateProgram(id, data)` | PUT | `Programs/{id}` | Body: program data | Update program | Update an existing program |
| `deActivateProgram(id)` | GET | `Programs/ToggleActiveUser/{id}` | -- | Toggle program active status | Toggle a program's active/inactive status |

#### 2.5.2 Activities Service

**Base URL:** `apiUrl + "Activities"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getAllActivities()` | GET | `Activities` | All activities (no pagination) | Get all activities |

---

### 2.6 Clinical Forms

#### 2.6.1 Forms Service

**Base URLs:**
- `apiUrl` = `apiUrl + "forms"`
- `apiUrlFormTrack` = `apiUrl + "FormTrack"`
- `apiUrlForAppointment` = `apiUrl + "Forms/GetForm"`
- `formImportProductionUrl` = `"https://api.caretalk360.com/api/forms"`
- `formImportbetaUrl` = `"https://api.caretalkbeta.com/api/forms"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllForms(page, pageSize)` | GET | `forms` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Paginated forms list | List all form definitions with pagination |
| `getFormByName(name)` | GET | `forms/{name}` | -- | Form by name/slug | Get a form definition by its name or slug |
| `getAppointmentForm(formId, patientId, apptId)` | GET | `Forms/GetForm/{formId}` | `PatientId`, `AppointmentId` | Form for appointment | Get a form pre-populated for a specific patient appointment |
| `createForm(data)` | POST | `forms` | Body: form definition | Create form | Create a new form definition |
| `updateForm(id, data)` | PUT | `forms/{id}` | Body: form data | Update form | Update a form definition |
| `deleteForm(id)` | DELETE | `forms/{id}` | -- | Delete form | Delete a form definition |
| `SavePatientForm(data, patientId, apptId)` | POST | `forms/SavePatientForm?patientId={patientId}` | `patientAppointmentId` | Save patient form data | Save completed form data for a patient appointment |
| `SaveAnswerForm(data, patientId, apptId, formId)` | POST | `forms/SaveAnswer?patientId={patientId}&patientAppointmentId={apptId}&formId={formId}` | -- | Save answer | Save an individual answer on a form |
| `getAllPatientFormByAppointmentID(apptId)` | GET | `forms/ByAppointmentId/{apptId}` | -- | All forms for appointment | Get all forms associated with an appointment |
| `exportForm(id)` | GET | `forms/{id}/export` | -- | Export form definition | Export a form definition as a portable payload |
| `importForm(data, token, environment)` | POST | `{beta or prod URL}/import` | Body: form data; Header: `Authorization: Bearer {token}`, `skip-interceptor: true` | Import form cross-environment | Import a form definition from another environment |
| `getDynamicFormByEligibleId(eligId, page, pageSize)` | GET | `forms/DynamicFormByEligibleId/{eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Dynamic forms for patient | Get dynamically generated forms for a patient |
| `CreateFormTrack(apptId, formId, start, end)` | POST | `FormTrack` | Body: `{patientAppointmentId, formId, startDateTime, endDateTime}` | Track form timing | Record the start and end time of a form completion |

**FormRound endpoints (direct URL construction):**

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getReviewedFormsByAppointmentId(apptId)` | GET | `FormRound/GetReviewedByPatientAppoitnmentId/{apptId}` | `Page=0`, `PageSize=0` | Get reviewed forms for an appointment |
| `updateFormRoundReviewed(id, reviewed)` | PUT | `FormRound/UpadateReviewedByAsync/{id}` | Body: `{reviewed}` | Mark a form round as reviewed or unreviewed |
| `getLastAnsweredByFormRoundId(formRoundId)` | GET | `UserSurveyResponses/GetLastAnsweredByFormRoundId/{formRoundId}` | -- | Get the last answered response for a form round |

#### 2.6.2 Questions Service

**Base URL:** `apiUrl + "questions"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllQuestions(page, pageSize)` | GET | `questions` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Paginated questions | List all questions with pagination |
| `getQuestions(page, pageSize, sortBy, sortOrder, text, answerTypeId)` | GET | `questions` | `Page`, `PageSize`, `sortBy`, `sortOrder`, `QuestionText`, `AnswerTypeId` | Filtered questions | Search questions by text and answer type |
| `getQuestionsBySectionId(sectionId, page, pageSize)` | GET | `questions/GetQuestionsBySectionId/{sectionId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Questions by section | List questions belonging to a specific section |
| `mapQuestionToSection(questionId, sectionId)` | PUT | `questions/MapQuestionToSection/{questionId}?sectionId={sectionId}` | -- | Map question to section | Assign a question to a form section |
| `createQuestion(data)` | POST | `questions` | Body: question data | Create question | Create a new question |
| `updateQuestion(id, data)` | PUT | `questions/{id}` | Body: question data | Update question | Update an existing question |
| `deleteQuestion(id)` | DELETE | `questions/{id}` | -- | Delete question | Delete a question |
| `deleteUserSurveyResponses(id)` | DELETE | `questions/userSurveyResponses-answer/{id}` | -- | Delete responses | Delete a user's survey responses for a question |
| `questionSearch(text)` | GET | `questions/search?text={text}` | -- | Search questions | Search for questions by text |

**Answer types (visible enum):** `{1: "Text", 2: "Single Choice", 3: "Multiple Choice", 4: "True / False", 5: "Readonly Text"}`

#### 2.6.3 Question Answers Service

**Base URL:** `apiUrl + "questionAnswers"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getAllQuestionAnswers()` | GET | `questionAnswers` | All answers | Get all question answer options |
| `getQuestionAnswerById(id)` | GET | `questionAnswers/{id}` | Single answer | Get a single answer option by ID |
| `getAnswersByQuestionId(questionId)` | GET | `questionAnswers/ByQuestionId/{questionId}` | Answers for a question | Get all answer options for a specific question |
| `createQuestionAnswer(data)` | POST | `questionAnswers` | Create answer | Create a new answer option |
| `updateQuestionAnswer(id, data)` | PUT | `questionAnswers/{id}` | Update answer | Update an answer option |
| `deleteQuestionAnswer(id)` | DELETE | `questionAnswers/{id}` | Delete answer | Delete an answer option |

#### 2.6.4 Question Groups Service

**Base URL:** `apiUrl + "questiongroups"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `createQuestionGroup(data)` | POST | `questiongroups` | Create group | Create a new question group |
| `updateQuestionGroup(id, data)` | PUT | `questiongroups/{id}` | Update group | Update a question group |
| `deleteQuestionGroup(id)` | DELETE | `questiongroups/{id}` | Delete group | Delete a question group |
| `getSectionsForCCDA()` | GET | `questiongroups/GetSectionsForCCDA` | CCDA-mapped sections | Get question group sections mapped to CCDA document structure |

#### 2.6.5 Group Questions Service

**Base URL:** `apiUrl + "groupquestions"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `createGroupQuestion(data)` | POST | `groupquestions` | Assign question to group | Assign a question to a question group |
| `unAssignQuestion(groupId, questionId)` | DELETE | `groupquestions/DeleteByGroupAndQuestion?groupId={groupId}&questionId={questionId}` | Remove question from group | Remove a question from a question group |
| `getQuestionPlacements(questionId)` | GET | `groupquestions/QuestionPlacements/{questionId}` | Where a question is placed | Get all groups where a question is placed |

---

### 2.7 Clinical Data

#### 2.7.1 Patient Medication Service

**Base URL:** `apiUrl + "PatientMedication"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `GetPatientMedications(eligId, ...)` | GET | `PatientMedication/ByEligibleId/{eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Medications by patient | List medications for a patient |
| `GetPatientMedicationsConfirmed(eligId, ...)` | GET | `PatientMedication/WithConfirmedCountByEligibleId/{eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | With confirmed counts | List medications with their confirmation counts |
| `GetMedicationNamesConfirmed(eligId, ...)` | GET | `PatientMedication/MedicationNamesWithConfirmedCountByEligibleId/{eligId}` | `sortBy=EffectiveDateStart`, `sortOrder=desc` | Medication names with counts | List distinct medication names with confirmation counts |
| `GetMedicationDosesByMedicationId(eligId, medId)` | GET | `PatientMedication/MedicationDosesByEligibleIdAndMedicationId` | `eligibleId`, `medicationId` | Doses for a medication | Get dose history for a specific medication |
| `CreatePatientMedication(data)` | POST | `PatientMedication/CreatePatientMedication` | Body: medication data | Create medication | Add a medication to a patient's record |
| `SyncPatientMedications(eligId)` | GET | `PatientMedication/Save?eligibleId={eligId}` | -- | Sync medications | Sync a patient's medications from external sources |
| `UpdatePatientMedicationConfirmById(id, data)` | PUT | `PatientMedication/{id}` | Body: confirmation data | Confirm medication | Confirm or update a medication entry |

#### 2.7.2 Patient Diagnostics Service

**Base URL:** `apiUrl + "PatientDiagnostics"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `GetPatientDiagnostics(eligId, ...)` | GET | `PatientDiagnostics/ByEligibleId/{eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Diagnostics by patient | List diagnostics for a patient |
| `GetPatientDiagnosticsConfirmed(eligId, ...)` | GET | `PatientDiagnostics/WithConfirmedCountByEligibleId/{eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | With confirmed counts | List diagnostics with their confirmation counts |
| `CreatePatientDiagnostic(data)` | POST | `PatientDiagnostics/CreatePatientDiagnostic` | Body: diagnostic data | Create diagnostic | Add a diagnostic to a patient's record |
| `UpdatePatientDiagnosticsConfirmById(id, data)` | PUT | `PatientDiagnostics/{id}` | Body: confirmation data | Confirm diagnostic | Confirm or update a diagnostic entry |
| `SyncPatientDagnostics(eligId)` | GET | `PatientDiagnostics/Save?eligibleId={eligId}` | -- | Sync diagnostics | Sync a patient's diagnostics from external sources |

#### 2.7.3 ICD-10 / Disease Service

**Base URL:** `apiUrl + "Icd10Code"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllDiseases(page, pageSize, ...)` | GET | `Icd10Code` | `Page`, `PageSize`, `sortBy`, `sortOrder`, `diseaseType` (inferred) | ICD-10 code lookup | List ICD-10 codes with optional filtering |
| `createDisease(data)` | POST | `Icd10Code` | Body: disease data | Create disease entry | Create a new ICD-10 code entry |
| `updateDisease(id, data)` | PUT | `Icd10Code/{id}` | Body: disease data | Update disease | Update an ICD-10 code entry |
| `deleteDisease(id)` | DELETE | `Icd10Code/{id}` | -- | Delete disease | Delete an ICD-10 code entry |

#### 2.7.4 Clinical Document Sections Service

**Base URL:** `apiUrl + "ClinicalDocumentSections"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getClinicalDocumentSections(page, pageSize)` | GET | `ClinicalDocumentSections` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Paginated sections | List clinical document sections with pagination |
| `createClinicalDocumentSections(data)` | POST | `ClinicalDocumentSections` | Body: section data | Create section | Create a new clinical document section |
| `updateClinicalDocumentSectionById(id, data)` | PUT | `ClinicalDocumentSections/{id}` | Body: section data | Update section | Update a clinical document section |
| `deleteClinicalDocumentSections(id)` | DELETE | `ClinicalDocumentSections/{id}` | -- | Delete section | Delete a clinical document section |

#### 2.7.5 S3 Clinical Data Service

**Base URL:** `apiUrl + "S3ClinicalData"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getS3ClinicalData(eligId, ...)` | GET | `S3ClinicalData?eligibleId={eligId}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Clinical data from S3 | List clinical data files stored in S3 for a patient |
| `getS3ClinicalDocument(eligId, fileName)` | GET | `S3ClinicalData/GetFile?eligibleId={eligId}&fileName={fileName}` | -- | Download document (blob) | Download a clinical document from S3 |

---

### 2.8 CCDA / Health Gorilla

#### 2.8.1 Health Gorilla Records Service

**Base URL:** `apiUrl + "HealthGorillaRecords"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `createHgProfile(id)` | GET | `HealthGorila/CreateProfile/{id}` | -- | Create HG profile (note: typo "Gorila" is in the actual API) | Create a Health Gorilla profile for a patient |
| `createCCDAndPost(eligId, apptId?)` | POST | `HealthGorillaRecords/CreateCCDAndPost/ForEligibleId/{eligId}?appoientmentId={apptId}` | -- | Generate and post CCD | Generate a CCD document and post it to Health Gorilla |
| `retriveHgData(eligId, type)` | GET | `HealthGorillaRecords/Retrive-HG-Data/ForEligibleId/{eligId}/{type}` | -- | Retrieve HG data by type | Retrieve clinical data from Health Gorilla by data type |

**Sub-resources (all under `HealthGorillaRecords/`):**

For each clinical data type, the pattern is consistent:

| Resource | GET List | GET Confirmed | PUT Confirm | GET Type | Description |
|----------|----------|---------------|-------------|----------|-------------|
| `Labs` | `Labs/ByEligibleId/{eligId}` | `Labs/WithConfirmedCountByEligibleId/{eligId}` | `Labs/UpdateConfirmById/{id}` | -- | Lab results for a patient |
| `Documents` | `Documents/ByEligibleId/{eligId}` | `Documents/WithConfirmedCountByEligibleId/{eligId}` | `Documents/UpdateConfirmById/{id}` | `Documents/GetType/ByEligibleId/{eligId}` | Clinical documents for a patient |
| `Observations` | `Observations/ByEligibleId/{eligId}` | `Observations/WithConfirmedCountByEligibleId/{eligId}` | `Observations/UpdateConfirmById/{id}` | -- | Clinical observations for a patient |
| `Allergies` | `Allergies/ByEligibleId/{eligId}` | `Allergies/WithConfirmedCountByEligibleId/{eligId}` | `Allergies/UpdateConfirmById/{id}` | -- | Allergy records for a patient |
| `Procedures` | `Procedures/ByEligibleId/{eligId}` | `Procedures/WithConfirmedCountByEligibleId/{eligId}` | `Procedures/UpdateConfirmById/{id}` | `Procedures/GetType/ByEligibleId/{eligId}` | Procedure records for a patient |
| `Immunizations` | `Immunizations/ByEligibleId/{eligId}` | `Immunizations/WithConfirmedCountByEligibleId/{eligId}` | `Immunizations/UpdateConfirmById/{id}` | `Immunizations/GetType/ByEligibleId/{eligId}` | Immunization records for a patient |
| `FamilyMemberHistory` | `FamilyMemberHistory/ByEligibleId/{eligId}` | `FamilyMemberHistory/WithConfirmedCountByEligibleId/{eligId}` | `FamilyMemberHistory/UpdateConfirmById/{id}` | -- | Family member history for a patient |
| `CarePlan` | `CarePlan/ByEligibleId/{eligId}` | `CarePlan/WithConfirmedCountByEligibleId/{eligId}` | `CarePlan/UpdateConfirmById/{id}` | -- | Care plan records for a patient |

All list endpoints accept: `Page`, `PageSize`, `sortBy`, `sortOrder`

**Additional:**

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `GetPatientDocumentById(id)` | GET | `HealthGorillaRecords/GetDocumentPdf?id={id}` | Download PDF (blob) | Download a patient document as a PDF |

---

### 2.9 Care Navigation (GAP Management)

#### 2.9.1 GAP Type Service

**Base URL:** `apiUrl + "GAPType"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllGAPType(page, pageSize)` | GET | `GAPType/GetList` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All gap types | List all care gap types with pagination |
| `getGAPTypeID(id)` | GET | `GAPType/GetById?id={id}` | -- | Single gap type | Get a single care gap type by ID |
| `createGAPType(data)` | POST | `GAPType/Create` | Body: gap type data | Create gap type | Create a new care gap type |
| `updateGAPType(id, data)` | PUT | `GAPType/Update?id={id}` | Body: gap type data | Update gap type | Update a care gap type |
| `DeleteGAPTypeById(id)` | DELETE | `GAPType/Delete?Id={id}` | -- | Delete gap type | Delete a care gap type |

#### 2.9.2 GAP Service

**Base URL:** `apiUrl + "GAP"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllGAP(eligId, status, page, pageSize)` | GET | `GAP/GetList?EligibilityId={eligId}&status={status}` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Gaps by patient and status | List care gaps for a patient filtered by status |
| `createGAP(data)` | POST | `GAP/Create` | Body: gap data | Create gap | Create a new care gap record |
| `updateGAP(id, data)` | PUT | `GAP/Update?id={id}` | Body: gap data | Update gap | Update a care gap record |

---

### 2.10 Communications

#### 2.10.1 Twilio Voice Service

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getIceServers()` | GET | `Twilio/GetStunTokenAsync` | STUN/TURN servers for WebRTC | Get STUN/TURN server credentials for WebRTC connections |
| `getAllPreviousCall(userId)` | GET | `Twilio/RecentCallsByUser?userId={userId}` | Recent calls by user | Get recent voice call history for a user |
| `sendSMS(data)` | POST | `Twilio/SendSMS` | `To` (phone), `messageBody` (body) -- query params | Send an SMS message via Twilio |

#### 2.10.2 SMS/Email Messaging Service

**Base URLs:**
- `apiForSendMessage` = `apiUrl + "Emails"`
- `apiSMSMessages` = `apiUrl + "SMSMessages"`
- `apiMessageType` = `apiUrl + "MessageType"`
- `apiSendSMS` = `apiUrl + "Twilio/SendSMS"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllSMS(page, pageSize)` | GET | `SMSMessages` | `Page`, `PageSize`, `sortBy`, `sortOrder` | SMS message templates | List all SMS message templates |
| `AddSMSMessage(data)` | POST | `SMSMessages` | Body: message data | Create SMS template | Create a new SMS message template |
| `updateSMSMessage(id, data)` | PUT | `SMSMessages/{id}` | Body: message data | Update SMS template | Update an SMS message template |
| `DeleteSMSMessage(id)` | DELETE | `SMSMessages/{id}` | -- | Delete SMS template | Delete an SMS message template |
| `sendMessage(data)` | POST | `Emails` | Body: email data | Send email | Send an email message |
| `getAllMessageType(page, pageSize)` | GET | `MessageType` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Message type lookup | List all message types |

#### 2.10.3 SMS Logs Service

**Base URL:** `apiUrl + "smslogs"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getSMSDRLogs(page, pageSize)` | GET | `smslogs` | `Page`, `PageSize`, `sortBy`, `sortOrder` | SMS delivery receipt logs | List SMS delivery receipt logs |

#### 2.10.4 Chat / SignalR Hub

**Hub URL:** `hubUrl + "chathub"` (e.g., `https://api.caretalkbeta.com/hubs/chathub`)

**Connection:** `HubConnectionBuilder.withUrl(hubUrl + "chathub?roomId={roomId}&username={username}&userId={userId}", {accessTokenFactory: () => token})`

**Server-to-Client events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `NewMessage` | message object | Receive a new chat message in the room |
| `UserOnlineInGroup` | user object (`userUsername`) | Notify that a user joined the chat room |
| `UserOfflineInGroup` | user object (`userUsername`) | Notify that a user left the chat room |
| `OnMuteMicro` | `{userUsername, mute}` | Notify that a user toggled their microphone |
| `OnMuteCamera` | `{userUsername, mute}` | Notify that a user toggled their camera |
| `OnShareScreen` | screen share data | Notify that a user started screen sharing |
| `OnShareScreenLastUser` | `{usernameTo, isShare}` | Notify a specific user about screen sharing |
| `OnUserIsSharing` | boolean | Notify that a user's sharing state changed |

**Client-to-Server invocations:**

| Method | Args | Description |
|--------|------|-------------|
| `SendMessage` | message content | Send a chat message to the room |
| `MuteMicro` | mute state | Toggle the local microphone mute state |
| `MuteCamera` | mute state | Toggle the local camera mute state |
| `ShareScreen` | target, state | Start or stop screen sharing |
| `ShareScreenToUser` | target, user, state | Share screen to a specific user |

#### 2.10.5 Video Call SignalR Hub (SignalRTC)

**Hub URL:** `signalUrl + "signalrtc"` (e.g., `https://api.caretalkbeta.com/signalrtc`)

**Server-to-Client events:**

| Event | Description |
|-------|-------------|
| `NewUserArrived` | Notify that a new peer connected to the video call |
| `UserSaidHello` | Notify that a peer responded to a hello handshake |
| `UserDisconnect` | Notify that a peer disconnected from the video call |
| `SendSignal` | Deliver WebRTC signaling data between peers |

**Client-to-Server invocations:**

| Method | Args | Description |
|--------|------|-------------|
| `NewUser` | user data | Register as a new user in the video call |
| `SendSignal` | target, signal | Send a WebRTC signaling message to a peer |
| `HelloUser` | source, target connection ID | Announce presence to a specific peer |

---

### 2.11 Video Conferencing

#### 2.11.1 Room Service

**Base URL:** `apiUrl + "room"` (note: lowercase, no prefix)

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getRooms()` | GET | `room` | -- | All rooms | Get all video conference rooms |
| `getRoomById(id)` | GET | `room/{id}` | -- | Single room | Get a single video conference room by ID |
| `editRoom(id, editName, status)` | PUT | `room?id={id}&editName={editName}&status={status}` | -- | Edit room | Update a room's name or status |
| `addRoom(name)` | POST | `room?name={name}` | -- | Create room | Create a new video conference room |
| `deleteRoom(id)` | DELETE | `room/{id}` | -- | Delete room | Delete a video conference room |

#### 2.11.2 Video Recording Service

**Base URL:** `apiUrl`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `upLoadOnServer()` | POST | `RecordVideo` | Uploads recorded video blob as `FormData` with key `video-blob` | Upload a recorded video to the server |

#### 2.11.3 PeerJS Integration

- Uses **PeerJS** library (`https://peerjs.com`, `https://github.com/peers/peerjs`)
- Peer ID format: `"caretalk360" + roomId` for doctor-initiated calls
- ICE servers fetched from `Twilio/GetStunTokenAsync`
- Supports video, audio, and screen sharing via WebRTC
- Room status polling: checks room status every 5 seconds for patient waiting

---

### 2.12 E-Prescribing (Photon Health / Neutron Health)

#### 2.12.1 Photon Health SDK (GraphQL)

**Production:** `https://api.photon.health/graphql`  
**Development:** `https://api.neutron.health/graphql`  
**Auth0 domain:** `auth.photon.health` (prod) / `auth.neutron.health` (dev)  
**Organization ID:** `org_QllQE3N5giWswxxo` (visible in template)  
**Client ID:** `GKP3lNwJPdBRPA81h2BaySHU4LEjQtkw` (visible in template)

**Photon SDK Services (via Apollo Client):**

| Service | GraphQL Operations |
|---------|-------------------|
| **Prescription** | `query prescriptions(patientId, prescriberId, state, after, first)`, `query prescription(id)`, `mutation createPrescription(...)`, `mutation createPrescriptions(prescriptions: [PrescriptionInput]!)` |
| **PrescriptionTemplate** | `mutation createPrescriptionTemplate(...)`, `mutation updatePrescriptionTemplate(...)`, `mutation deletePrescriptionTemplate(...)` |
| **Catalog** | `query catalog(...)`, `query catalogs(...)`, `mutation addToCatalog(...)`, `mutation removeFromCatalog(...)` |
| **Medication** | `query medications(...)`, `query medicationConcepts(...)`, `query medicationForms(...)`, `query medicationRoutes(...)`, `query medicationStrengths(...)`, `query medicationPackages(...)`, `query medicationProducts(...)` |
| **MedicalEquipment** | `query medicalEquipment(...)` |
| **Patient** | `query patient(...)`, `query patients(...)`, `mutation createPatient(...)`, `mutation updatePatient(...)`, `mutation removePatientAllergy(...)`, `mutation removePatientPreferredPharmacy(...)` |
| **Pharmacy** | `query pharmacy(...)`, `query pharmacies(...)` |
| **Order** | `query order(...)`, `query orders(...)`, `mutation createOrder(...)` |
| **Allergens** | `query allergens(...)` |
| **DispenseUnits** | `query dispenseUnits(...)` |
| **Clients** | `query clients(...)` |
| **Organization** | `query organization(...)`, `query organizations(...)` |
| **Webhooks** | `query webhooks(...)`, `mutation createWebhook(...)`, `mutation deleteWebhookConfig(...)`, `mutation rotateSecret(...)` |

**Photon Enums (visible):**

| Enum | Values |
|------|--------|
| CatalogType | `DRUG`, `PACKAGE`, `PRODUCT` |
| PrescriptionState | `CANCELED`, `NEW`, `SCHEDULED`, `SENT` |
| FulfillmentType | `MAIL_ORDER`, `PICK_UP` |
| MedicationType | `OTC`, `RX` |
| OrderState | `CANCELED`, `COMPLETED`, `ERROR`, `PENDING`, `PLACED` |
| OrderSource | `PHARMACY`, `PRESCRIBER` |
| FillState | `ACTIVE`, `DEPLETED`, `EXPIRED` |
| Schedule | `I`, `II`, `III`, `IV`, `V` |
| MedicationFilter | `CONCEPT`, `FORM`, `ROUTE`, `STRENGTH` |
| Gender | `FEMALE`, `MALE`, `UNKNOWN` |

**UI integration:** Route `/dashboard/patient-teleHealth/photon/:id` renders Photon web components:
```html
<photon-client org="org_QllQE3N5giWswxxo" dev-mode="true" [redirect-uri]="safeUrl">
  <photon-med-history [patient-id]="patientPhotonId" />
  <photon-prescribe-workflow (photon-prescribe-success)="log()" />
</photon-client>
```

---

### 2.13 HiQOR Integration

**Base URL:** `apiUrl + "HiQORIntegration"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `CreateHiQORIntegration(eligId, apptId)` | POST | `HiQORIntegration/GetToken/{eligId}?PatientAppointmentId={apptId}` | -- | Get HiQOR token | Get an authentication token for HiQOR integration |
| `getHiQORIntegration(patientId)` | GET | `HiQORIntegration/GetList/{patientId}` | -- | HiQOR integration list | List HiQOR integration records for a patient |
| `getHiQORIntegrationCheck(apptId)` | GET | `HiQORIntegration/CheckActivityByAppointmentId/{apptId}` | -- | Check activity for appointment | Check if HiQOR activity exists for an appointment |
| `getSnapBPDailyReport(date, page, pageSize)` | GET | `HiQORIntegration/GetSnapBPDailyReport` | `date`, `Page`, `PageSize`, `sortBy`, `sortOrder` | SnapBP daily report | Get the SnapBP daily blood pressure report |

---

### 2.14 Eligible Files & File Category

**Base URLs:**
- `apiFileCategory` = `apiUrl + "FileCategory"`
- `apiEligibleFiles` = `apiUrl + "EligibleFiles"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getFileCategory()` | GET | `FileCategory` | File category lookup | Get all file categories |
| `getListByEligibleId(eligId)` | GET | `EligibleFiles/GetListByEligibleId/{eligId}` | Files for patient | List files associated with a patient |
| `getListByEligibleDownloadID(id)` | GET | `EligibleFiles/download/{id}` | Download file | Download a patient file by ID |
| `getListByEligibleImagesDownload(eligId, categoryId)` | GET | `EligibleFiles/images/download?eligibleId={eligId}&categoryId={categoryId}` | Download images | Download patient images by category |
| `createAppointmentType(data)` | POST | `EligibleFiles/upload` | Upload file (FormData) | Upload a file for a patient |

---

### 2.15 Webhooks & Automation

#### 2.15.1 Trigger WebHooks Service

**Base URL:** `apiUrl + "TriggerWebHooks"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllTriggerWebHooks(page, pageSize)` | GET | `TriggerWebHooks` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All trigger webhooks | List all webhook triggers with pagination |
| `getTriggerWebHooksID(id)` | GET | `TriggerWebHooks/{id}` | -- | Single trigger | Get a single webhook trigger by ID |
| `createTriggerWebHooks(data)` | POST | `TriggerWebHooks` | Body: trigger data | Create trigger | Create a new webhook trigger |
| `updateTriggerWebHooks(data)` | PUT | `TriggerWebHooks` | Body: trigger data | Update trigger | Update a webhook trigger |
| `DeleteTriggerWebHooksById(id)` | DELETE | `TriggerWebHooks/{id}` | -- | Delete trigger | Delete a webhook trigger |

#### 2.15.2 WebHook Log Service

**Base URL:** `apiUrl + "WebHookLog"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllWebHookLog(page, pageSize)` | GET | `WebHookLog` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Webhook execution logs | List webhook execution logs |

#### 2.15.3 WebHook Actions Service

**Base URL:** `apiUrl + "WebHookActions"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllWebHookActions(page, pageSize)` | GET | `WebHookActions` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All webhook actions | List all webhook actions |
| `getWebHookActionsID(id)` | GET | `WebHookActions/{id}` | -- | Single action | Get a single webhook action by ID |
| `createWebHookActions(name)` | POST | `WebHookActions?Name={name}` | -- | Create action | Create a new webhook action |
| `DeleteWebHookActionsById(id)` | DELETE | `WebHookActions/Delete?Id={id}` | -- | Delete action | Delete a webhook action |

#### 2.15.4 Service Action Service

**Base URL:** `apiUrl + "ServiceAction"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllTServiseAction(page, pageSize)` | GET | `ServiceAction` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All service actions | List all service actions |
| `getServiceActionID(id)` | GET | `ServiceAction/{id}` | -- | Single service action | Get a single service action by ID |
| `createServiceAction(data)` | POST | `ServiceAction` | Body: action data | Create service action | Create a new service action |
| `DeleteServiseActionById(id)` | DELETE | `ServiceAction/Delete?Id={id}` | -- | Delete service action | Delete a service action |

---

### 2.16 Physician State Licensing & Supervision

**Base URLs:**
- `baseUrl` = `apiUrl + "PhysiciansStateLicensed"`
- `StatesUrl` = `baseUrl + "/states"`
- `supervisorUrl` = `apiUrl + "PhysicianSupervisor"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getPhysiciansStateLicensed(doctorId)` | GET | `PhysiciansStateLicensed/{doctorId}` | -- | Doctor's state licenses | Get all state licenses for a doctor |
| `getStates()` | GET | `PhysiciansStateLicensed/states` | -- | All states | Get all available states |
| `updatePhysiciansStateLicensed(data)` | PUT | `PhysiciansStateLicensed` | Body: license data | Update license | Update a physician's state license |
| `deletePhysiciansStateLicensed(id)` | DELETE | `PhysiciansStateLicensed/{id}` | -- | Delete license | Delete a physician's state license |
| `AddStatesToDoctorAll(doctorId)` | GET | `PhysiciansStateLicensed/addAllStates/{doctorId}` | -- | Add all states to doctor | Grant a doctor licenses for all 50 states |
| `DeleteDoctorStatesAll(doctorId)` | DELETE | `PhysiciansStateLicensed/deleteDoctorStates/{doctorId}` | -- | Remove all states | Remove all state licenses from a doctor |
| `getSupervisorsByStateId(stateId)` | GET | `PhysiciansStateLicensed/GetByStateId{stateId}` | `Page=1`, `PageSize=1000`, `sortBy=PhysiciansId`, `sortOrder=asc` | Supervisors by state | Get physicians licensed in a specific state |
| `getPhysicianSupervisors(doctorId)` | GET | `PhysicianSupervisor/Physician/{doctorId}` | `Page=1`, `PageSize=1000`, `sortBy=CreatedAt`, `sortOrder=desc` | Doctor's supervisors | Get all supervisors assigned to a doctor |
| `createPhysicianSupervisor(data)` | POST | `PhysicianSupervisor` | Body: supervisor data | Assign supervisor | Assign a supervisor to a physician |
| `updatePhysicianSupervisor(id, data)` | PUT | `PhysicianSupervisor/{id}` | Body: supervisor data | Update supervisor | Update a physician-supervisor assignment |

---

### 2.17 Administration

#### 2.17.1 Activity Logs Service

**Base URL:** `apiUrl + "activityLogs"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getActivityLogs(page, pageSize, ...)` | GET | `activityLogs` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Activity logs | List activity logs with pagination |
| `getActivityLogByID(id)` | GET | `activityLogs/{id}` | -- | Single log entry | Get a single activity log entry by ID |
| `getErrorLogs(page, pageSize, ...)` | GET | `activityLogs/errors` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Error logs | List error logs with pagination |
| `deleteAllErrorLogs()` | DELETE | `activityLogs/errors/Truncate` | -- | Clear all error logs | Delete all error logs |

#### 2.17.2 Settings Service

**Base URL:** `apiUrl + "Setting"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getByName(name)` | GET | `Setting/GetByName` | `name` | Setting by name | Get a setting by its name |
| `getList(page, pageSize)` | GET | `Setting/GetList` | `Page`, `PageSize`, `sortBy=Id`, `sortOrder=desc` | All settings | List all settings with pagination |
| `create(data)` | POST | `Setting/Create` | Body: setting data | Create setting | Create a new setting |
| `update(id, data)` | PUT | `Setting/Update` | `id` | Update setting | Update a setting |
| `delete(id)` | DELETE | `Setting/Delete` | `id` | Delete setting | Delete a setting |
| `reSetVersion()` | GET | `Setting/ReSetVersion` | -- | Reset app version | Reset the application version counter |

#### 2.17.3 Doses / Migration Service

**Base URLs:**
- `baseURL` = `apiUrl + "Doses"`
- `migrationUrl` = `apiUrl + "MigrationFailures"`
- `MigrationsHistoryUrl` = `apiUrl + "MigrationsHistory"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllDosesLogs(page, pageSize)` | GET | `Doses/Logs` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Dose logs | List dose processing logs |
| `getAllDoses(page, pageSize)` | GET | `Doses` | `Page`, `PageSize`, `sortBy`, `sortOrder` | All doses | List all dose records |
| `getAllMigrationsHistory(page, pageSize)` | GET | `MigrationsHistory` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Migration history | List database migration history |
| `getFailureMigrations(page, pageSize)` | GET | `MigrationFailures` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Failed migrations | List failed database migrations |

#### 2.17.4 Routes (Navigation) Service

**Base URL:** `apiUrl + "Routes"`

| Method | HTTP | Path | Notes | Description |
|--------|------|------|-------|-------------|
| `getAllRoutes()` | GET | `Routes` | All routes | Get all navigation routes |
| `getRoutesId(name)` | GET | `Routes/GetByName/{name}` | Route by name | Get a navigation route by name |
| `addNewRoute(data)` | POST | `Routes` | Create route | Create a new navigation route |
| `updateRoutes(id, data)` | PUT | `Routes/{id}` | Update route | Update a navigation route |
| `deleteRoute(id)` | DELETE | `Routes/{id}` | Delete route | Delete a navigation route |
| `syncRoutes(addRoutes, deleteRouteIds)` | PUT | `Routes/SaveRoutesAsync` | Body: `{addRoutes, deleteRouteIds}` | Bulk sync routes by adding and removing in one call |

#### 2.17.5 Navigation Service

**Base URLs:**
- `url` = `apiUrl + "Navigations"`
- `urlNavGroup` = `url + "/NavigationGroupRoute"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getAllNavigationForAdmin(page, pageSize)` | GET | `Navigations/ForAdmins` | `Page`, `PageSize`, `sortBy`, `sortOrder` | Navigation groups (admin) | List navigation groups for admin users |
| `GetNavigations()` | GET | `Navigations` | -- | All navigation groups | Get all navigation groups |
| `getNavigationRoutesById(id)` | GET | `Navigations/{id}` | -- | Routes for navigation group | Get routes assigned to a navigation group |
| `addNavigation(data)` | POST | `Navigations` | Body: `{name, orderNumber}` | Create navigation group | Create a new navigation group |
| `updateNavigation(id, data)` | PUT | `Navigations/{id}` | Body: navigation data | Update navigation | Update a navigation group |
| `deleteNavigation(id)` | DELETE | `Navigations/{id}` | -- | Delete navigation | Delete a navigation group |
| `addNavigationRouteRelation(data)` | POST | `Navigations/NavigationGroupRoute` | Body: `{navigationGroupId, routeId}` | Assign route to nav group | Assign a route to a navigation group |
| `deleteNavigationRelation(id)` | DELETE | `Navigations/NavigationGroupRoute/{id}` | -- | Remove route from nav group | Remove a route from a navigation group |

#### 2.17.6 TimeZone Service

**Base URL:** `apiUrl + "TimeZones"`

| Method | HTTP | Path | Query Params | Notes | Description |
|--------|------|------|-------------|-------|-------------|
| `getServerTimeZone()` | GET | `TimeZones` | -- | Current server timezone | Get the server's current timezone |
| `toggleDayLightSave(isDLS)` | GET | `TimeZones/DayLightSave` | `isDayLightSave` | Toggle DST | Toggle daylight saving time adjustment |
| `isDayLightSaveEnabled()` | GET | `TimeZones/IsDayLightSave` | -- | Check DST status | Check if daylight saving time is currently enabled |

---

### 2.18 Reporting

#### 2.18.1 SnapBP Reporting

Via HiQOR Integration Service (see 2.13):

| Method | Path | Notes | Description |
|--------|------|-------|-------------|
| `getSnapBPDailyReport(date)` | `HiQORIntegration/GetSnapBPDailyReport` | Daily SnapBP report with fields: `patientAppointmentId`, `eligibilityName`, `eligibilityId`, `appointmentDate`, `hasOpenCBPGap`, `snapBPUtilized`, `snapBPInitiatedBy`, `snapBPInitiatedAt` | Get the daily SnapBP blood pressure utilization report |

#### 2.18.2 Routes (visible in bundle)

**SnapBP route:** `/dashboard/administration/snapbp-report` (inferred from route table)

**Completed/Scheduled/Patient appointments:** `/dashboard/administration/completed-appointment`, `/dashboard/administration/scheduled-appointment`, `/dashboard/administration/patient-appointment`

---

## 3. Entity Model (inferred)

### 3.1 Core Entities

| Entity | Visible Fields | Source |
|--------|---------------|--------|
| **Admin/User** | `id`, `userUsername`, `userFname`, `userLname`, `email`, `dateOfBirth`, `zipCode`, `mobilePhone`, `homePhone`, `gender`, `address`, `city`, `state`, `userStateId`, `userType`, `accountType` (1=patient, 2=doctor), `isActive`, `gmtOffset`, `createdAt`, `fullName` | Admin service, localStorage |
| **Patient** | `id`, `patientId`, `eligibilityId`, `firstName`, `lastName`, `dateOfBirth`, `gender`, `email`, `mobilePhone`, `homePhone`, `address`, `city`, `state`, `zipCode`, `mbi`, `ssn`, `planName`, `status`, `photonId`, `healthGorillaId`, `mspPatientId`, `initiatingProvider`, `initiatingVisit`, `eligibleAWV`, `height`, `weight` | Patient service, form controls |
| **Client** | `id`, `clientId`, `name`, `isActive`, `IsSendingEmail` | Client service |
| **Program** | `id`, `programId`, `name`, `isActive` | Program service |
| **PatientAppointment** | `id`, `patientId`, `appointmentId`, `doctorId`, `appointmentDate`, `appointmentStatus` (0=Open, 1=Completed, 9=Canceled), `status`, `appointmentTypeId`, `time`, `programName`, `doctorLastName`, `doctorName`, `userFname`, `userLname`, `dateOfBirth`, `zipCode`, `userMobile`, `gapStatus`, `createdByName`, `completedAt`, `completedById`, `from`, `to`, `doctorUid`, `medicalSpecialty`, `timeZone`, `offset`, `patientGmtOffset`, `appointmentType`, `duration`, `state`, `eligibilityId`, `uuid` | Appointment service, CSV export |
| **AppointmentType** | `id`, `name`, `description`, `type` (S=Synchronous, A=Asynchronous), `active`, `notes`, `class` (I=Initial, S=Subsequent), `cpt`, `frequency`, `prescribes`, `subsequentAppts`, `includeControlled`, `sms`, `email`, `duration`, `startDate`, `formIds`, `activityIds` | Appointment type form |
| **DoctorAvailability** | `id`, `doctorId`, `psDate`, hourly slots: `_0am` through `_11pm` (0/1 per hour) | Availability component |
| **Form** | `id`, `formId`, `name`, `slug` (inferred) | Form service |
| **Question** | `id`, `questionText`, `answerTypeId` (1-5), `sectionId` | Question service |
| **QuestionAnswer** | `id`, `questionId`, answer fields | Answer service |
| **QuestionGroup** | `id`, `name`, `orderNumber` (inferred) | Group service |
| **Room** | `id`, `roomName`, `status` (1=active, 2=inactive), `user.userUsername` | Room service |
| **UserType** | `id`, `name`, `defaultRouteId`, routes array | UserType service |
| **Route** | `id`, `name`, `path`, `order`, `isInheritedByDefault`, `navigationGroupId` | Routes service |
| **NavigationGroup** | `id`, `name`, `orderNumber`, `routes[]`, `isExpanded` (client-side) | Navigation service |
| **Setting** | `id`, `name`, `value` (inferred) | Settings service |
| **GAPType** | `id`, `name`, fields for gap definition | GAP service |
| **GAP** | `id`, `eligibilityId`, `gapTypeId`, `status`, `formSlugName` (inferred) | GAP service |
| **TriggerWebHook** | `id`, trigger configuration fields | WebHook service |
| **WebHookAction** | `id`, `name` | WebHook actions service |
| **ServiceAction** | `id`, action configuration fields | Service action service |

### 3.2 Health Gorilla Entities (inferred)

| Entity | Visible Fields |
|--------|---------------|
| **Lab** | `id`, confirmed flag, standard pagination |
| **Document** | `id`, document type, confirmed flag |
| **Observation** | `id`, confirmed flag |
| **Allergy** | `id`, confirmed flag |
| **Procedure** | `id`, procedure type, confirmed flag |
| **Immunization** | `id`, immunization type, confirmed flag |
| **FamilyMemberHistory** | `id`, confirmed flag |
| **CarePlan** | `id`, confirmed flag |

### 3.3 Photon Health Entities (from GraphQL schema)

| Entity | Visible Fields |
|--------|---------------|
| **Prescription** | `id`, `prescriber`, `patientId`, `patientName`, `prescriberId`, `state` (CANCELED/NEW/SCHEDULED/SENT) |
| **PrescriptionTemplate** | `id`, template fields |
| **Order** | `id`, `state` (CANCELED/COMPLETED/ERROR/PENDING/PLACED), `source` (PHARMACY/PRESCRIBER) |
| **Medication** | Concepts, forms, routes, strengths, packages, products |
| **Patient** (Photon) | `id`, `gender` (FEMALE/MALE/UNKNOWN), allergens, preferred pharmacies |
| **Pharmacy** | Standard pharmacy fields |
| **Catalog** | `id`, type (DRUG/PACKAGE/PRODUCT) |

---

## 4. Integration Map

| External System | Connection Type | Integration Points |
|-----------------|----------------|-------------------|
| **Twilio** | REST API | Voice calls (`RecentCallsByUser`), SMS (`SendSMS`), STUN/TURN servers (`GetStunTokenAsync`) for WebRTC |
| **Photon Health** | GraphQL (Apollo Client) | E-prescribing: prescriptions, medications, patients, pharmacies, orders. Web components embedded via `<photon-client>`. Auth via Auth0 (`auth.photon.health`). Org: `org_QllQE3N5giWswxxo` |
| **Neutron Health** | GraphQL (Apollo Client) | Development mode for Photon. Same schema, different endpoints (`api.neutron.health`, `auth.neutron.health`) |
| **Health Gorilla** | REST API (via CT360 backend) | Labs, documents, observations, allergies, procedures, immunizations, family history, care plans. Profile creation, CCD generation, HG data retrieval. All proxied through `HealthGorillaRecords/` and `HealthGorila/` (note: typo is real) |
| **Auth0** | SDK | Used by Photon Health SDK for authentication. Configured with `domain`, `client_id`, `redirect_uri`, `organization`, `audience`. Cache location: `memory`. |
| **SignalR** (ASP.NET) | WebSocket Hub | Two hubs: `chathub` (chat + video control) and `signalrtc` (WebRTC signaling). Token-based auth via `accessTokenFactory`. |
| **PeerJS** | WebRTC Library | Peer-to-peer video calls. Peer IDs: `"caretalk360" + roomId`. Uses Twilio ICE servers. Supports recording via `MediaRecorder`. |
| **HiQOR** | REST API (via CT360 backend) | Blood pressure monitoring device integration. Token-based (`GetToken`), activity checks, SnapBP daily reports. |
| **Amazon S3** | REST API (via CT360 backend) | Clinical document storage via `S3ClinicalData` and `ClientS3Bucket` services. Subdomain-based bucket routing. |
| **Highcharts** | Client-side library | Data visualization (referenced via `https://www.highcharts.com?credits`) |

---

## 5. Auth Guards (detail)

### Guard 1: SubdomainGuard (`E`)
- **Protects:** Root path `""`
- **Logic:** Extracts subdomain from `window.location.origin` via regex (`https://([^.]+)`). Calls `ClientS3Bucket/GetBySubDomainAsync?subdomain={subdomain}`. If response contains a `clientId`, navigates to `/client/patient-data?id={clientId}`. Filters out `www` and `caretalk` subdomains.
- **Always returns:** `true` (non-blocking; navigates asynchronously)

### Guard 2: LoginRedirectGuard (`ar`)
- **Protects:** `/login`
- **Logic:** Checks `localStorage.getItem("auth_token")` and `localStorage.getItem("currentUser")`. If both exist (user already logged in), redirects away from login page.

### Guard 3: AuthGuard (`fe`)
- **Protects:** `/dashboard` and all child routes
- **Logic:** Verifies auth token exists. Loads user's assigned routes. Normalizes the current URL by replacing `:id` patterns and path integers. Checks if the current route is in the user's allowed routes list. Redirects to `/login` if no token or unauthorized.
- **Runs on:** `runGuardsAndResolvers: "always"`

### Guard 4: DeveloperGuard (`As`)
- **Protects:** `/developer-access-only/8d93n1b2z7y3k5l8/url-developer-routing/*`
- **Guarded routes:** Route management, sync routes, activity logs, system logs, migration logs, migration history
- **Logic:** Developer-only access check (implementation details minified)

### CanDeactivate Guard
- **Protects:** Patient telehealth/appointment view
- **Logic:** If `appointmentStatus === 0` (Open), prompts: "Would you like to complete this appointment?" via `confirmationService.confirm()`. Yes = completes appointment + allows navigation. No = stays on page.

---

## 6. Application Routes (visible)

### Top-level routes:
| Path | Component/Module | Guard |
|------|-----------------|-------|
| `""` | Landing | SubdomainGuard (`E`) |
| `login` | Login | LoginRedirectGuard (`ar`) |
| `login-developer` | Developer Login | -- |
| `reset-password` | Reset Password | -- |
| `change-password` | Change Password | -- |
| `resetversion` | Reset Version | -- |
| `call-conference` | Call Conference | -- |
| `video-conference` | Video Conference (SignalRTC) | -- |
| `meetings` | Meeting Module (lazy) | -- |
| `dashboard` | Dashboard Module (lazy) | AuthGuard (`fe`) |
| `client/patient-data` | Landing Module (lazy) | -- |
| `displaying-form-creator` | Form Creator Display | -- |
| `not-found` | 404 | -- |
| `developer-access-only/8d93n1b2z7y3k5l8/url-developer-routing` | Dev Routing | DeveloperGuard (`As`) |
| `developer-access-only/.../sync-routes` | Sync Routes | DeveloperGuard (`As`) |
| `developer-access-only/.../logs` | Activity Logs | DeveloperGuard (`As`) |
| `developer-access-only/.../system-logs` | System Logs | DeveloperGuard (`As`) |
| `developer-access-only/.../migrations-logs` | Migration Failures | DeveloperGuard (`As`) |
| `developer-access-only/.../Migrations-History` | Migration History | DeveloperGuard (`As`) |
| `**` | Redirect to `dashboard` | -- |

### Dashboard child routes (visible):
| Path | Notes |
|------|-------|
| `admins` | Admin list |
| `doctors` | Doctor list |
| `clients` | Client list |
| `client-eligibility` | Client eligibility |
| `search-eligibility` | Eligibility search |
| `admins/:id` | Admin detail |
| `doctors/:id` | Doctor detail |
| `clientsList` | Clients list |
| `clientsList/addClient` | Add client |
| `clientsList/client/:id` | Edit client |
| `clientsList/clientsprograms/:clientId` | Client programs |
| `clientsprograms/:clientId/programs/add` | Add program |
| `clientsprograms/:clientId/programs/:programId` | Edit program |
| `physician-interval-state` | Physician intervals by state |
| `physician-Capacity` | Physician capacity |
| `Physician-schedules` | Physician schedules |
| `user-types` | User type management |
| `user-types/:id` | Edit user type |
| `register/:id` | Register user |
| `files-display` | Files display |
| `completed-appointment` | Completed appointments |
| `scheduled-appointment` | Scheduled appointments |
| `patient-appointment` | Patient appointments |
| `snapbp-report` | SnapBP report |
| `doctor/appointments/me` | My appointments (provider) |
| `patient-teleHealth` | Telehealth view (canDeactivate guard) |
| `patient-teleHealth/photon/:id` | Photon prescribing |
| `patients/:id` | Patient detail |
| `client-patients/:id` | Client patient detail |
| `add-appointments/:id` | Add appointment type |
| `client-doctors/:id` | Client doctor detail |
| `client-patients` | Client patients list |
| `client-doctors` | Client doctors list |
| `client-agents` | Client agents list |
| `diseases` | ICD-10 disease management |
| `form-creator` | Legacy form creator |
| `admin-settings` | Admin settings |
| `new-form-builder` | New form builder |

---

## 7. Pagination Convention

All paginated endpoints follow the same pattern:

```
?Page={page}&PageSize={pageSize}&sortBy={field}&sortOrder={asc|desc}
```

- `Page`: 1-indexed page number (some endpoints use 0 for "all")
- `PageSize`: items per page (0 sometimes means "all")
- `sortBy`: field name to sort by
- `sortOrder`: `asc` or `desc`

Response format (inferred from `.data` destructuring):
```json
{
  "data": [
    [items_array],
    { "totalPages": N, "totalItems": N }
  ],
  "message": [{ "text": "..." }],
  "status": 200
}
```

---

## 8. Common API Response Pattern

All CT360 API responses follow a consistent envelope:

```json
{
  "data": [ ... ],
  "message": [{ "text": "Success message" }],
  "status": 200
}
```

- Success messages accessed via `response.message[0].text`
- Error handling: `500 === error.status ? error.message : error.error.message[0].text`
- Data arrays are destructured as `const [items, pagination] = response.data`

---

*This document was extracted from the minified Angular production bundle and reflects the API surface visible to the frontend application. Backend-only endpoints, internal middleware, or APIs not called by the frontend are not captured here.*
