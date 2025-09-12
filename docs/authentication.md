# Authentication System

This document describes the complete authentication and authorization system implementation for the GO Commerce Administration Console using Keycloak OIDC integration.

## Overview

The authentication system provides:

- **OIDC Integration**: Keycloak-powered authentication with Authorization Code + PKCE flow
- **Role-Based Access Control (RBAC)**: Multi-level permissions with platform and store scopes
- **Multi-Tenant Support**: Store-scoped access control and context switching
- **Session Management**: Automatic token refresh, silent SSO, and secure logout
- **Type-Safe Integration**: Full TypeScript support with strict typing

## Architecture

### Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Vue Components  │───▶│ useAuth         │───▶│ Auth Store      │
│ (Login/Pages)   │    │ (Composable)    │    │ (Pinia)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐           ▼
│ Route Guards    │───▶│ Router Meta     │    ┌─────────────────┐
│ (Auth/RBAC)     │    │ (requiresAuth)  │    │ KeycloakService │
└─────────────────┘    └─────────────────┘    │ (OIDC Client)   │
                                               └─────────────────┘
┌─────────────────┐    ┌─────────────────┐           │
│ API Client      │───▶│ Token Manager   │◀──────────┘
│ (HTTP Client)   │    │ (Storage)       │
└─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Initialization**: App starts → Keycloak check-sso → Silent authentication attempt
2. **Authentication**: User login → Redirect to Keycloak → PKCE flow → Token exchange
3. **Authorization**: Route navigation → Guards check roles → Store context validation
4. **API Requests**: HTTP request → Token injection → X-Store-ID header → Backend call
5. **Token Refresh**: Token near expiry → Automatic refresh → TokenManager update

## Keycloak Configuration

### Environment Variables

Configure these Vite environment variables:

```bash
# Keycloak Configuration
VITE_KEYCLOAK_BASE_URL=http://localhost:9000
VITE_KEYCLOAK_REALM=gocommerce
VITE_KEYCLOAK_CLIENT_ID=gocommerce-admin-console

# Application URLs
VITE_APP_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Keycloak Realm Setup

The Keycloak realm must be configured with:

1. **Client Configuration**:
   - Client ID: `gocommerce-admin-console`
   - Client Protocol: `openid-connect`
   - Access Type: `public` (PKCE-enabled SPA)
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`

2. **PKCE Settings**:
   - Proof Key for Code Exchange Code Challenge Method: `S256`
   - Enable "Standard Flow" (Authorization Code)
   - Disable "Implicit Flow" and "Direct Access Grants"

3. **Client Scopes**:
   - Include `openid`, `profile`, `email`, `roles`
   - Map user roles to token claims

4. **Role Mapping**:
   - Realm roles: `platform-admin`, `store-admin`
   - Client roles: `product-manager`, `order-manager`, `customer-service`

### Silent SSO Configuration

The application includes a silent SSO iframe check at `public/silent-check-sso.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Silent SSO Check</title>
</head>
<body>
    <script>
        parent.postMessage(location.href, location.origin);
    </script>
</body>
</html>
```

## RBAC System

### Role Hierarchy

```
platform-admin (Global Scope)
├── All platform and store functions
├── Multi-store management
└── User and role administration

store-admin (Store Scope)
├── Full store management
├── Store user management
└── Store analytics

product-manager (Store Scope)
├── Product catalog management
├── Inventory management
└── Pricing management

order-manager (Store Scope)
├── Order processing
├── Customer service
└── Fulfillment management

customer-service (Store Scope)
├── Customer support
├── Order history access
└── Basic customer management

customer (Store Scope)
├── Self-service access
└── Order history viewing
```

### Role Mapping

The system maps Keycloak roles to application permissions:

```typescript
// Platform roles (global scope)
realm_access: {
  roles: ['platform-admin']
}

// Store roles (store-scoped)
resource_access: {
  'store-{storeId}': {
    roles: ['store-admin', 'product-manager']
  }
}
```

### Store Access Control

Multi-tenant access is managed through:

1. **Store Context**: Each authenticated user has access to specific stores
2. **Selected Store**: Users select an active store for store-scoped operations
3. **API Context**: All store-scoped API calls include `X-Store-ID` header

## Usage Examples

### Route Protection

Protect routes with metadata:

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/products',
    component: Products,
    meta: {
      requiresAuth: true,
      roles: ['platform-admin', 'store-admin', 'product-manager'],
      storeScoped: true,
      title: 'Products'
    }
  },
  {
    path: '/admin/stores',
    component: StoreManagement,
    meta: {
      requiresAuth: true,
      roles: ['platform-admin'],
      title: 'Store Management'
    }
  }
];
```

### Component Authentication

Use the composable for reactive authentication state:

```vue
<template>
  <div>
    <div v-if="isAuthenticated">
      <h1>Welcome, {{ user?.firstName }}!</h1>
      
      <!-- Role-based content -->
      <div v-if="isPlatformAdmin">
        <PlatformAdminPanel />
      </div>
      
      <!-- Store-scoped content -->
      <div v-if="hasRole('product-manager')">
        <ProductManagement />
      </div>
    </div>
    
    <div v-else-if="isLoading">
      <LoadingSpinner />
    </div>
    
    <div v-else>
      <LoginPrompt />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const {
  isAuthenticated,
  user,
  isLoading,
  hasRole,
  isPlatformAdmin,
  login,
  logout
} = useAuth();
</script>
```

### API Client Usage

The API client automatically handles authentication:

```typescript
// Automatic token injection
const response = await apiClient.get('/products');

// Store-scoped requests (when selectedStoreId is set)
const storeProducts = await apiClient.get('/products'); // Includes X-Store-ID header

// Explicit store context
const storeClient = apiClient.withStore('store-123');
const specificStoreData = await storeClient.get('/analytics');
```

### Manual Authentication

Direct authentication service usage:

```typescript
import { keycloakService } from '@/services/keycloakService';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Initialize authentication
await authStore.init();

// Manual login
await authStore.login();

// Check permissions
if (authStore.hasRole('product-manager')) {
  // User can manage products
}

// Store context
if (authStore.canAccessStore('store-123')) {
  authStore.setSelectedStore('store-123');
}
```

## Token Management

### Token Storage

- **Access Token**: Stored in memory (TokenManager)
- **Refresh Token**: Handled by Keycloak library (secure)
- **User Profile**: Cached in Pinia store
- **Selected Store**: Persisted to localStorage

### Automatic Refresh

The system automatically refreshes tokens:

```typescript
// Proactive refresh (5 minutes before expiry)
const REFRESH_THRESHOLD = 5 * 60; // 5 minutes

// Reactive refresh on token expiry
keycloak.onTokenExpired = async () => {
  await authStore.refresh();
};

// Retry mechanism with exponential backoff
const refreshWithRetry = async (attempt = 1) => {
  try {
    await keycloak.updateToken();
  } catch (error) {
    if (attempt < 3) {
      await delay(1000 * Math.pow(2, attempt));
      return refreshWithRetry(attempt + 1);
    }
    throw error;
  }
};
```

### Token Validation

Token validation includes:

- **Expiry Check**: Automatic expiry detection
- **Role Parsing**: Extract roles from JWT claims
- **Store Access**: Validate store permissions
- **Signature Verification**: Keycloak handles JWT verification

## Error Handling

### Authentication Errors

```typescript
// Custom error types
class AuthInitError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AuthInitError';
    this.cause = cause;
  }
}

class TokenRefreshError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'TokenRefreshError';
    this.cause = cause;
  }
}

// Error handling in components
const { error, clearError } = useAuth();

if (error?.value) {
  if (error.value instanceof TokenRefreshError) {
    // Handle token refresh failure
    await login(); // Re-authenticate
  } else if (error.value instanceof AuthInitError) {
    // Handle initialization failure
    showErrorMessage('Authentication service unavailable');
  }
}
```

### API Error Handling

API errors are automatically handled:

```typescript
// 401 responses trigger automatic token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await authStore.refresh();
      return axios.request(error.config); // Retry with new token
    }
    throw error;
  }
);
```

## Security Considerations

### Token Security

- **No Refresh Token in localStorage**: Only access tokens are cached
- **PKCE Flow**: Protection against authorization code interception
- **Secure Transmission**: All tokens transmitted over HTTPS only
- **Automatic Cleanup**: Tokens cleared on logout and error states

### Role Validation

- **Backend Validation**: All role checks validated on backend
- **JWT Claims**: Roles sourced from signed JWT tokens
- **Store Context**: Store access validated per request
- **Least Privilege**: Users granted minimum required permissions

### Session Management

- **Configurable Timeouts**: Session timeouts per Keycloak configuration
- **Silent Logout**: Automatic logout on token refresh failure
- **Cross-Tab Sync**: Session state synchronized across browser tabs
- **CSRF Protection**: PKCE provides CSRF protection for OAuth flows

## Testing

### Unit Tests

Key testing scenarios:

```typescript
// Service tests
describe('KeycloakService', () => {
  it('initializes with check-sso', async () => {
    await keycloakService.init();
    expect(keycloak.init).toHaveBeenCalledWith({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    });
  });
});

// Store tests
describe('Auth Store', () => {
  it('loads user profile on authentication', async () => {
    await authStore.loadProfile();
    expect(authStore.user).toBeDefined();
    expect(authStore.roles).toContain('store-admin');
  });
});

// Route guard tests
describe('Route Guards', () => {
  it('redirects unauthenticated users to login', () => {
    const result = authGuard({ meta: { requiresAuth: true } });
    expect(result).toEqual({ name: 'Login', query: { redirect: '/dashboard' } });
  });
});
```

### Integration Tests

Test complete authentication flows:

```typescript
describe('Authentication Flow', () => {
  it('completes login flow', async () => {
    // Mock Keycloak login
    mockKeycloak.authenticated = true;
    
    // Initialize auth
    await authStore.init();
    
    // Verify authentication state
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toBeDefined();
    expect(tokenManager.hasAccessToken()).toBe(true);
  });
});
```

## Performance Considerations

### Lazy Loading

Authentication state is loaded on demand:

```typescript
// Lazy store initialization
const authStore = useAuthStore();
if (!authStore.isInitialized) {
  await authStore.init();
}

// Conditional profile loading
const loadProfile = async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    await authStore.loadProfile();
  }
};
```

### Token Refresh Optimization

- **Single-Flight Requests**: Only one refresh request at a time
- **Request Queuing**: Queue requests during token refresh
- **Proactive Refresh**: Refresh before expiry to avoid API errors

## Development Setup

### Local Development

1. **Start Platform Stack** (from project root):
   ```bash
   cd docker
   docker compose up -d
   ```

2. **Verify Keycloak**: Navigate to http://localhost:9000
   - Admin credentials: `admin` / `admin`
   - Realm: `gocommerce` (auto-imported with admin-console client)

3. **Test Users**:
   - Platform Admin: `platform-admin` / `platform-admin`
   - Store Admin: `store-admin` / `store-admin`

4. **Environment Variables**: Already configured in `.env.example`

5. **Run Application**:
   ```bash
   npm run dev
   ```

### Debug Mode

Enable authentication debugging:

```bash
# Enable detailed auth logging
VITE_DEBUG_AUTH=true npm run dev
```

Debug features include:
- Token refresh logging
- Role parsing details
- API request/response tracking
- Authentication state transitions

## Migration Guide

### From Session-Based Auth

When migrating from session-based authentication:

1. **Remove Session Cookies**: Clear existing session storage
2. **Update API Endpoints**: Ensure backend supports Bearer tokens
3. **Role Mapping**: Map existing roles to new RBAC system
4. **Route Protection**: Update route guards to use new auth system

### Backward Compatibility

The system maintains compatibility with existing:
- **API Client**: Existing HTTP client works with new auth headers
- **Route Structure**: Existing routes work with new guard system
- **User Interface**: Minimal UI changes required for auth integration

## Troubleshooting

### Common Issues

**Authentication Failed**:
- Verify Keycloak URL and realm configuration
- Check client ID and redirect URIs
- Ensure PKCE is enabled in Keycloak client

**Token Refresh Errors**:
- Check refresh token expiry settings
- Verify network connectivity to Keycloak
- Review browser console for detailed errors

**Role Access Denied**:
- Verify user has required roles in Keycloak
- Check role mapping configuration
- Ensure store access permissions are set

**Store Context Issues**:
- Verify selectedStoreId is set correctly
- Check store access permissions in user profile
- Ensure X-Store-ID header is being sent

### Debug Commands

```bash
# Check authentication state
window.__GOCOMMERCE_DEBUG__.auth.getState()

# Verify token validity
window.__GOCOMMERCE_DEBUG__.auth.checkToken()

# View user permissions
window.__GOCOMMERCE_DEBUG__.auth.getRoles()

# Test store access
window.__GOCOMMERCE_DEBUG__.auth.checkStoreAccess('store-123')
```

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OIDC Specification](https://openid.net/connect/)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
- [Vue Router Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Pinia State Management](https://pinia.vuejs.org/)

---

For questions or issues related to authentication, please refer to the development team or create a GitHub issue with detailed reproduction steps.

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
