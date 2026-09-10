# Authentication & Role-Based Access Control (RBAC) Specification

**Project:** Agriculture Supply Chain Management System  
**Module:** Authentication & Access Control  
**Document Path:** `docs/architecture/authentication.md`  
**Master Source of Truth:** `Goal.md`

---

## 1. Authentication Architecture Overview

The system uses a decoupled authentication and authorization model:
- **Identity Provider (IdP):** **Firebase Authentication** handles user identity, credentials, phone/SMS verification, Google login, email/password, and session token issuance.
- **Application Data & RBAC Store:** **MySQL Database** stores domain users, roles, permissions, business profiles (Farmer, Driver, Buyer), and account statuses.
- **Backend Token Verifier:** **NestJS** validates incoming Firebase ID tokens using the official Firebase Admin SDK.

```text
                                AUTHENTICATION & RBAC FLOW
                                
  Client App (Flutter/React)
             │
             ├── 1. Authenticate with Firebase
             │      (Phone SMS / Email / Google)
             ▼
      Firebase Auth
             │
             ├── 2. Issues Firebase ID Token (JWT)
             ▼
  Client HTTP Request ──► Authorization: Bearer <Firebase ID Token>
             │
             ▼
    NestJS Backend (/api/v1/*)
             │
             ├── 3. FirebaseAuthGuard intercepts request
             │
             ├── 4. Firebase Admin SDK: verifyIdToken(token)
             │      └── Resolves verified Firebase UID
             │
             ├── 5. Query MySQL User by firebaseUid
             │      └── Join Role & RolePermissions -> Permission
             │
             ├── 6. Verify User Account Status (ACTIVE)
             │      └── Reject if INACTIVE or SUSPENDED (401/403)
             │
             ├── 7. Attach AuthenticatedUser context to Request
             │
             ├── 8. RolesGuard / PermissionsGuard
             │      └── Validate @Roles() and @RequirePermissions()
             │
             ├── 9. Allow (200 OK) or Deny (403 Forbidden)
             ▼
     Domain Controller
```

---

## 2. Core Security Invariants

1. **No Passwords in MySQL:** Passwords and identity provider credentials are never stored or managed in the application database.
2. **Never Trust Client-Provided Roles:** The backend **never** accepts roles (`"role": "ADMIN"`) or user identifiers from request payloads. User identity and permissions are determined exclusively from the verified server-side database record.
3. **No ID Tokens in Database:** Firebase ID tokens are transient JWTs verified per request and are never stored in MySQL or logged.
4. **Zero Client Privilege Elevation:** Self-registration can never grant `ADMIN` or `SUPER_ADMIN` privileges.
5. **No Runtime Insecure Bypasses:** There is no `DISABLE_AUTH=true` flag. Testing uses dependency injection and mock providers.

---

## 3. Server-Side Roles & Permissions

### 3.1 Supported Roles (`RoleName` Enum)
- `SUPER_ADMIN`: Full system administrative and infrastructure access.
- `ADMIN`: Central operations administrator managing users, logistics, pricing, and matching.
- `STAFF`: Operational staff with read-only and triage permissions.
- `FARMER`: Agricultural producer managing farms, crops, and supply batches.
- `DRIVER`: Logistics partner executing multi-stop pickups, routes, and deliveries.
- `BUYER`: Commercial/institutional buyer posting demand requirements and placing orders.

### 3.2 Granular Permissions (`Permission` Model)
Permissions follow the standard `resource:action` naming convention:
- `users:read`, `users:write`, `users:verify`
- `crops:read`, `crops:write`
- `supply:create`, `supply:read`
- `demand:create`, `demand:read`
- `matching:execute`
- `orders:create`, `orders:read`, `orders:update_status`
- `trips:dispatch`, `trips:execute`
- `locations:record`
- `payments:read`
- `reports:view`
- `settings:manage`
- `audit:view`

---

## 4. NestJS Guards & Decorators

### 4.1 `@Public()`
Designates an endpoint as publicly accessible without an Authorization header (e.g. `/api/v1/health`).
```typescript
@Get('health')
@Public()
getHealth() { ... }
```

### 4.2 `@CurrentUser()`
Injects the strongly-typed `AuthenticatedUser` into controller handler parameters.
```typescript
@Get('me')
@UseGuards(FirebaseAuthGuard)
getMe(@CurrentUser() user: AuthenticatedUser) { ... }
```

### 4.3 `@Roles(...roles)` & `RolesGuard`
Restricts route access to specified roles. `SUPER_ADMIN` automatically satisfies all role checks.
```typescript
@Get('admin/dashboard')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
getDashboard() { ... }
```

### 4.4 `@RequirePermissions(...permissions)` & `PermissionsGuard`
Restricts route access to users holding all specified granular permissions. `SUPER_ADMIN` automatically satisfies all permission checks.
```typescript
@Get('catalog')
@UseGuards(FirebaseAuthGuard, PermissionsGuard)
@RequirePermissions('crops:read')
getCrops() { ... }
```

---

## 5. Error Handling & Status Codes

| Scenario | HTTP Status Code | Response Payload Structure |
| :--- | :--- | :--- |
| Missing / Malformed Authorization header | `401 Unauthorized` | `{ success: false, data: null, message: "Missing or invalid Authorization header...", error: { code: "Unauthorized" } }` |
| Expired / Invalid Firebase token | `401 Unauthorized` | `{ success: false, data: null, message: "Invalid or expired authentication token.", error: { code: "Unauthorized" } }` |
| Firebase UID not registered in MySQL | `401 Unauthorized` | `{ success: false, data: null, message: "User account is not registered...", error: { code: "Unauthorized" } }` |
| Account `INACTIVE` or `SUSPENDED` | `401 Unauthorized` | `{ success: false, data: null, message: "User account is inactive or suspended.", error: { code: "Unauthorized" } }` |
| Insufficient role / permission | `403 Forbidden` | `{ success: false, data: null, message: "Forbidden: Insufficient role permissions.", error: { code: "Forbidden" } }` |

---

## 6. Environment Variables

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n"

# Optional path to credentials file
# FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

---

## 7. Testing Strategy

1. **Unit Tests (`*.spec.ts`):** Verify `AuthService`, `FirebaseAuthGuard`, `RolesGuard`, `PermissionsGuard`, and `AuthController` using mocked `FirebaseAdminService` and `PrismaService`.
2. **E2E Tests (`test/app.e2e-spec.ts`):** Verify complete HTTP request-response flows including 401 unauthenticated, 403 forbidden role/permission checks, and 200 OK authenticated endpoints.
