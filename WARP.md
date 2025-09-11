# WARP.md - GO Commerce Administration Console

This file serves as the single source of truth and comprehensive specification for the GO Commerce Administration Console project. It defines the "what" and "why" for our dual-scoped, role-based administration interface.

## Project Overview

The **GO Commerce Administration Console** is a modern, responsive web application that provides comprehensive administration capabilities for the GO Commerce multi-tenant e-commerce SaaS platform. It serves both platform administrators managing multiple stores and store administrators managing their individual stores.

### Vision Statement
Create an intuitive, powerful, and secure administration interface that enables efficient management of the GO Commerce platform at both platform and store levels, with role-based access control and real-time insights.

### Success Criteria
- **User Experience**: Intuitive navigation with < 3 clicks to any major function
- **Performance**: < 2s page load times, < 500ms API response handling
- **Security**: Zero unauthorized access incidents, complete RBAC compliance
- **Scalability**: Support 1000+ concurrent users, handle 10,000+ stores
- **Maintainability**: < 4 hours for new feature integration, 95%+ test coverage

## Core Business Requirements

### 1. Dual-Scope Administration

#### Platform Administration Scope
- **Multi-Store Management**: Create, configure, and monitor multiple stores
- **User Management**: Manage platform users, roles, and permissions
- **Platform Analytics**: Cross-store insights, revenue analytics, performance metrics
- **System Administration**: Platform configuration, integration management
- **Tenant Management**: Schema creation, data isolation verification

#### Store Administration Scope
- **Store Operations**: Individual store configuration and management
- **Product Catalog**: Complete product, category, and inventory management
- **Customer Management**: Customer profiles, segmentation, communication
- **Order Management**: Order processing, fulfillment, customer service
- **Store Analytics**: Store-specific metrics, sales reports, customer insights

### 2. Authentication & Authorization

#### Authentication Requirements
- **Keycloak Integration**: Direct OIDC integration with existing `gocommerce` realm
- **JWT Token Management**: Secure token handling, automatic refresh
- **Session Management**: Configurable timeouts, concurrent session control
- **Multi-Factor Authentication**: Support for MFA when configured in Keycloak

#### Role-Based Access Control (RBAC)
```
platform-admin (Global)
├── All platform and store functions
├── Multi-store analytics and management
└── User and role management

store-admin (Store-scoped)
├── Full store management within assigned store(s)
├── Store-specific user management
└── Store analytics and reporting

product-manager (Store-scoped)
├── Product catalog management
├── Inventory management
└── Pricing management

order-manager (Store-scoped)
├── Order processing and fulfillment
├── Customer service functions
└── Order analytics

customer-service (Store-scoped)
├── Customer support functions
├── Order history access
└── Customer communication

customer (Store-scoped)
├── Basic customer access
└── Order history viewing
```

### 3. Core Feature Requirements

#### Dashboard & Analytics
- **Platform Dashboard**: Multi-store KPIs, system health, alerts
- **Store Dashboard**: Store-specific metrics, recent activity, quick actions
- **Real-time Updates**: Live data updates for critical metrics
- **Customizable Widgets**: User-configurable dashboard layouts

#### Store Management
- **Store Creation**: Guided store setup with schema creation
- **Store Configuration**: Settings, themes, payment gateways
- **Store Monitoring**: Health checks, performance metrics
- **Store Users**: Role assignments, permissions management

#### Product Management
- **Product Catalog**: CRUD operations, bulk imports/exports
- **Category Management**: Hierarchical category structures
- **Inventory Tracking**: Stock levels, low-stock alerts
- **Pricing Management**: Price rules, discounts, promotions

#### Customer Management
- **Customer Profiles**: Individual and company customer types
- **Customer Segmentation**: Dynamic customer groups
- **Communication**: Email campaigns, notifications
- **Customer Service**: Support ticket management

#### Order Management
- **Order Processing**: Status updates, fulfillment workflows
- **Order Search**: Advanced filtering and search capabilities
- **Customer Service**: Order modifications, refunds, exchanges
- **Shipping Management**: Carrier integration, tracking

#### User & Access Management
- **User Administration**: Create, modify, deactivate users
- **Role Management**: Assign and manage user roles
- **Permission Matrix**: Granular permission control
- **Audit Logging**: Track all administrative actions

## Technical Requirements

### Frontend Architecture
- **Framework**: Vue 3.5+ with Composition API and `<script setup>`
- **Language**: TypeScript 5.x with strict mode enabled
- **Build Tool**: Vite 5.x with optimized production builds
- **UI Framework**: Chakra UI Vue for consistent design system
- **State Management**: Pinia for application state management
- **HTTP Client**: Axios with interceptors for API communication
- **Routing**: Vue Router 4 with navigation guards

### Component Architecture
- **Atomic Design**: Atoms, molecules, organisms pattern
- **Feature-Based Structure**: Organize by business domain
- **Reusable Components**: Shared component library
- **Composition Pattern**: Composable functions for business logic

### Integration Requirements

#### API Integration
- **Base URL**: `http://localhost:8080/api/v1` (configurable)
- **Authentication**: Bearer token in Authorization header
- **Multi-tenancy**: Store context in `X-Store-Id` header when required
- **Error Handling**: Standardized error response processing
- **Request/Response Logging**: Development and debugging support

#### Keycloak Integration
- **Realm**: `gocommerce`
- **Client ID**: `gocommerce-admin-console` (to be created)
- **Flow Type**: Authorization Code with PKCE
- **Token Storage**: Secure storage with automatic refresh
- **Logout**: Proper session termination

### Data Models

#### Authentication Models
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  storeAccess: StoreAccess[];
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface Role {
  name: string;
  scope: 'platform' | 'store';
  permissions: string[];
}
```

#### Store Models
```typescript
interface StoreDto {
  id: string;
  ownerId: string;
  name: string;
  subdomain: string;
  email: string;
  currencyCode: string;
  defaultLocale: string;
  status: StoreStatus;
  description?: string;
  fullDomain: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateStoreDto {
  name: string;
  subdomain: string;
  email: string;
  currencyCode: string;
  defaultLocale: string;
  description?: string;
  ownerId: string;
}
```

#### Product Models
```typescript
interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  inventoryQuantity: number;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  inventoryQuantity: number;
  categoryId: string;
}
```

#### Customer Models
```typescript
interface CustomerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  addresses: AddressDto[];
  status: CustomerStatus;
  emailVerified: boolean;
  marketingOptIn: boolean;
  preferredLanguage: string;
  keycloakUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Order Models
```typescript
interface OrderDto {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  items: OrderItemDto[];
  orderDate: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## User Interface Requirements

### Design System
- **Component Library**: Chakra UI Vue components
- **Color Palette**: Professional blue/gray theme with accent colors
- **Typography**: System fonts with clear hierarchy
- **Iconography**: Consistent icon system (Heroicons or similar)
- **Spacing**: 8px grid system for consistent layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo, User Menu, Notifications, Search             │
├─────────────────────────────────────────────────────────────┤
│ Navigation: Role-based menu, Store selector                │
├─────────────┬───────────────────────────────────────────────┤
│ Sidebar     │ Main Content Area                             │
│ - Dashboard │ - Dynamic content based on route             │
│ - Stores    │ - Breadcrumb navigation                       │
│ - Products  │ - Action buttons                              │
│ - Customers │ - Data tables with filtering                  │
│ - Orders    │ - Forms with validation                       │
│ - Users     │ - Modal dialogs                               │
│ - Analytics │ - Loading states                              │
│ - Settings  │ - Error states                                │
└─────────────┴───────────────────────────────────────────────┘
```

### Page Specifications

#### Platform Dashboard
- **Multi-store metrics**: Revenue, orders, customers across stores
- **System health**: API status, database health, cache status
- **Recent activity**: Store creation, user registrations, critical alerts
- **Quick actions**: Create store, manage users, view analytics

#### Store Dashboard
- **Store metrics**: Sales, orders, customers for selected store
- **Recent orders**: Latest order activity with quick actions
- **Inventory alerts**: Low stock, out of stock notifications
- **Quick actions**: Add product, process order, view customers

#### Data Tables
- **Pagination**: Server-side pagination with configurable page sizes
- **Sorting**: Multi-column sorting capabilities
- **Filtering**: Advanced filters with search functionality
- **Actions**: Bulk operations, individual row actions
- **Export**: CSV/Excel export functionality

#### Forms
- **Validation**: Real-time validation with clear error messages
- **Auto-save**: Draft saving for complex forms
- **File Upload**: Drag-and-drop file upload with progress
- **Wizard Support**: Multi-step form workflows

### Responsive Design
- **Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Navigation**: Collapsible sidebar on smaller screens
- **Tables**: Horizontal scroll with sticky columns on mobile
- **Forms**: Stack form elements on mobile devices

## Security Requirements

### Authentication Security
- **Token Storage**: Secure storage using HttpOnly cookies when possible
- **PKCE Flow**: Implement Proof Key for Code Exchange
- **Token Refresh**: Automatic token refresh before expiration
- **Session Timeout**: Configurable inactivity timeout

### Authorization Security
- **Route Guards**: Protect routes based on user roles
- **Component Guards**: Hide/show components based on permissions
- **API Security**: Include proper headers and validate responses
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations

### Data Protection
- **Input Sanitization**: XSS prevention on all user inputs
- **Output Encoding**: Proper encoding of displayed data
- **PII Handling**: Secure handling of personally identifiable information
- **Audit Logging**: Log all administrative actions

## Performance Requirements

### Loading Performance
- **Initial Load**: < 2 seconds for first meaningful paint
- **Route Navigation**: < 500ms for route transitions
- **API Responses**: Handle and display within 500ms
- **Image Loading**: Progressive loading with placeholders

### Runtime Performance
- **Memory Usage**: Efficient state management, cleanup on unmount
- **Bundle Size**: Code splitting, lazy loading for optimal bundle sizes
- **Caching**: Implement appropriate caching strategies
- **Offline Support**: Basic offline functionality for critical features

## Development Standards

### Code Quality
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Enforce code style and best practices
- **Prettier**: Consistent code formatting
- **Pre-commit Hooks**: Lint and format before commits

### Testing Requirements
- **Unit Testing**: Vitest with @testing-library/vue
- **Integration Testing**: API integration test scenarios
- **E2E Testing**: Playwright for critical user journeys
- **Coverage**: Minimum 80% code coverage target

### Documentation
- **Component Documentation**: JSDoc comments for all public APIs
- **README**: Setup, development, and deployment instructions
- **API Documentation**: Integration points and error handling
- **Architecture Documentation**: System design and decisions

## Environment Configuration

### Development Environment
- **API Base URL**: `http://localhost:8080/api/v1`
- **Keycloak URL**: `http://localhost:9000/realms/gocommerce`
- **WebSocket URL**: `ws://localhost:8080/ws` (future real-time features)

### Production Environment
- **Environment Variables**: Configurable base URLs and API keys
- **Build Optimization**: Minification, compression, tree shaking
- **CDN Integration**: Static asset delivery via CDN
- **Monitoring**: Error tracking and performance monitoring

## Integration Specifications

### API Endpoints

#### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

#### Platform Administration Endpoints
- `GET /platform/stores` - List all stores
- `POST /platform/stores` - Create new store
- `PUT /platform/stores/{id}` - Update store
- `DELETE /platform/stores/{id}` - Delete store
- `GET /platform/users` - List platform users
- `POST /platform/users` - Create platform user
- `GET /platform/analytics` - Platform analytics data

#### Store Administration Endpoints
- `GET /stores/{storeId}/products` - List store products
- `POST /stores/{storeId}/products` - Create product
- `PUT /stores/{storeId}/products/{id}` - Update product
- `DELETE /stores/{storeId}/products/{id}` - Delete product
- `GET /stores/{storeId}/customers` - List store customers
- `GET /stores/{storeId}/orders` - List store orders
- `PUT /stores/{storeId}/orders/{id}/status` - Update order status

### Error Handling
- **HTTP Status Codes**: Proper status code usage
- **Error Response Format**: Consistent error response structure
- **User-Friendly Messages**: Clear, actionable error messages
- **Retry Logic**: Automatic retry for transient failures

## Deployment Requirements

### Build Configuration
- **Environment Builds**: Development, staging, production configurations
- **Asset Optimization**: Image compression, font subsetting
- **Service Worker**: Caching strategy for offline support
- **Docker Support**: Containerized deployment capability

### CI/CD Pipeline
- **Automated Testing**: Run all tests on pull requests
- **Build Verification**: Ensure builds succeed before deployment
- **Security Scanning**: Automated security vulnerability checks
- **Deployment**: Automated deployment to staging and production

## Success Metrics

### User Experience Metrics
- **Task Completion Rate**: > 95% for core administrative tasks
- **User Satisfaction**: > 4.5/5 in user feedback surveys
- **Error Rate**: < 1% of user interactions result in errors
- **Support Tickets**: < 10 tickets per month related to UI issues

### Performance Metrics
- **Page Load Speed**: 95th percentile < 3 seconds
- **API Response Time**: 95th percentile < 1 second
- **Uptime**: > 99.5% availability
- **Error Rate**: < 0.1% of API requests result in errors

### Business Metrics
- **Administrative Efficiency**: 50% reduction in time for common tasks
- **User Adoption**: 90% of eligible users actively using the console
- **Feature Usage**: All major features used by > 70% of users
- **Training Time**: < 2 hours for new administrators to become productive

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup and development environment
- Authentication and authorization implementation
- Basic layout and navigation structure
- Core routing and state management

### Phase 2: Core Features (Weeks 3-6)
- Platform and store dashboard implementation
- Store management functionality
- Product catalog management
- User management interface

### Phase 3: Advanced Features (Weeks 7-10)
- Customer management features
- Order management functionality
- Analytics and reporting
- Advanced search and filtering

### Phase 4: Polish & Optimization (Weeks 11-12)
- Performance optimization and caching
- Comprehensive testing and bug fixes
- Documentation completion
- Production deployment preparation

## Constraints & Assumptions

### Technical Constraints
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 90+, Safari 14+)
- **Device Support**: Desktop and tablet optimized, mobile responsive
- **Server Dependencies**: Requires GO Commerce server API availability
- **Network Requirements**: Reliable internet connection for real-time features

### Resource Constraints
- **Development Team**: Single developer (AI-assisted)
- **Timeline**: 12 weeks for full implementation
- **Budget**: Open source libraries preferred
- **Testing**: Automated testing focus due to resource constraints

### Assumptions
- **Server API Stability**: GO Commerce server API is stable and documented
- **Keycloak Configuration**: Keycloak realm is properly configured
- **Data Volume**: Reasonable data volumes (not big data scenarios)
- **User Concurrency**: Moderate concurrent user load expected

---

This specification serves as the definitive guide for all development decisions. Any changes to requirements must be reflected in this document first, ensuring all stakeholders have a clear understanding of the current project scope and expectations.
