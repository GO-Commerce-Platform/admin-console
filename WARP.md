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

## Git/GitHub Workflow & SDD Integration

### Overview
The GO Commerce Administration Console follows a **Specs-Driven Development (SDD)** methodology integrated with a comprehensive Git/GitHub workflow that ensures code quality, traceability, and prevents common workflow mistakes.

### SDD Process Integration

#### Phase 1: WARP (Specification)
```
WARP.md Creation → GitHub Issue Creation → Initial Branch Planning
```
- **Document Requirements**: All features start with specification in WARP.md
- **Issue Creation**: Create GitHub issues for each major feature/epic
- **Epic Planning**: Break down epics into implementable tasks
- **Branch Strategy**: Plan branch structure for complex features

#### Phase 2: PLAN (Technical Design)
```
PLAN.md Creation → Task Breakdown → Issue Refinement → Branch Creation
```
- **Technical Design**: Document architecture in PLAN.md
- **Task Creation**: Break plan into specific, implementable tasks
- **Issue Linking**: Link technical tasks to parent epics
- **Branch Preparation**: Create branches for parallel development

#### Phase 3: TASKS (Implementation Breakdown)
```
TASKS.md Creation → Individual Task Issues → Implementation Branches
```
- **Detailed Tasks**: Create granular task list in TASKS.md
- **Issue Mapping**: Each task maps to a GitHub issue
- **Implementation Ready**: Tasks are small, testable, and independent
- **Branch Strategy**: Feature branches for each significant task group

#### Phase 4: Implementation
```
Feature Branch → Code Changes → Testing → Pull Request → Review → Merge
```
- **Branch Creation**: Create feature branch for each task group
- **Incremental Commits**: Regular commits with proper messages
- **Testing**: Ensure all tests pass before PR creation
- **Pull Request**: Create PR with proper linking to issues
- **Code Review**: Mandatory review before merge
- **Automated Closure**: Issues auto-close on PR merge

### Git Branching Strategy

#### Branch Types and Naming Conventions

**Main Branches:**
- `main` - Production-ready code, protected branch
- `develop` - Integration branch for features (if using GitFlow)

**Supporting Branches:**
- `feature/ADMIN-{issue#}-{short-description}` - New features
- `bugfix/ADMIN-{issue#}-{short-description}` - Bug fixes
- `hotfix/ADMIN-{issue#}-{short-description}` - Critical production fixes
- `release/v{version}` - Release preparation
- `docs/{description}` - Documentation-only changes

**Examples:**
```bash
feature/ADMIN-2-authentication-system
bugfix/ADMIN-15-login-token-refresh
hotfix/ADMIN-23-security-vulnerability
release/v1.2.0
docs/api-documentation-update
```

#### Branch Lifecycle

1. **Creation**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/ADMIN-2-authentication-system
   ```

2. **Development**:
   ```bash
   # Regular commits with proper messages
   git add .
   git commit -m "feat(auth): implement Keycloak service integration"
   
   # Keep branch updated with main
   git fetch origin main
   git rebase origin/main
   ```

3. **Push and PR**:
   ```bash
   git push origin feature/ADMIN-2-authentication-system
   # Create PR via GitHub with proper template
   ```

4. **Post-merge Cleanup**:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/ADMIN-2-authentication-system
   ```

#### Branch Protection Rules
- **main branch**: Requires PR, requires reviews, requires status checks
- **develop branch**: Requires PR, allows force pushes from admins
- **Branch naming**: Enforced via GitHub Actions
- **Commit messages**: Validated via pre-commit hooks

### Issue Lifecycle Management

#### Issue States and Transitions
```
Open → In Progress → In Review → Closed
  ↓        ↓           ↓         ↓
Created → Assigned → PR Created → Merged
```

#### Issue Creation Requirements
- **Title Format**: `[ADMIN-{#}] {Clear, action-oriented description}`
- **Labels**: Type (feature/bug/docs), Priority (low/medium/high/critical)
- **Assignment**: Assign to implementer before work begins
- **Linked Issues**: Link to parent epic/milestone
- **Acceptance Criteria**: Clear definition of "done"

#### Issue Labels Taxonomy
**Type Labels:**
- `type: feature` - New functionality
- `type: bug` - Bug fixes
- `type: docs` - Documentation changes
- `type: refactor` - Code improvements
- `type: test` - Testing additions

**Priority Labels:**
- `priority: critical` - Security/data loss issues
- `priority: high` - Blocking issues
- `priority: medium` - Standard features
- `priority: low` - Nice-to-have improvements

**Status Labels:**
- `status: in-progress` - Currently being worked on
- `status: blocked` - Waiting on dependencies
- `status: needs-review` - Ready for review

**Size Labels:**
- `size: S` - < 1 day work
- `size: M` - 1-3 days work
- `size: L` - 1 week work
- `size: XL` - > 1 week (should be broken down)

#### Issue-PR Linking Requirements
**Mandatory Linking**: Every PR must reference at least one issue

**Linking Keywords** (use in PR description):
- `Closes #123` - Closes issue on merge
- `Fixes #123` - Fixes bug issue on merge
- `Resolves #123` - Resolves issue on merge
- `Relates to #123` - Related but doesn't close

**Multiple Issues**:
```markdown
This PR implements the authentication system.

Closes #2
Closes #3
Relates to #1
```

### Pull Request Standards

#### PR Title Conventions
```
{type}({scope}): {description} - Closes #{issue}

Examples:
feat(auth): implement Keycloak integration - Closes #2
fix(ui): resolve login button hover state - Closes #15
docs(api): update authentication endpoints - Closes #20
```

#### PR Description Template
```markdown
## 🎯 Purpose
Brief description of what this PR accomplishes.

## 🔗 Related Issues
Closes #123
Relates to #456

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No console errors

## 📋 Type of Change
- [ ] 🆕 New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Documentation
- [ ] 🔄 Refactoring
- [ ] ⚡ Performance improvement
- [ ] 🧪 Testing

## 🔍 Review Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Security considerations addressed

## 📸 Screenshots/Demo
<!-- If UI changes, include before/after screenshots -->

## 🚨 Breaking Changes
<!-- List any breaking changes or "None" -->
```

#### Review Requirements
- **Minimum Reviewers**: 1 (for solo development, self-review with checklist)
- **Required Checks**: All CI/CD checks must pass
- **Merge Strategy**: Squash and merge (clean history)
- **Auto-delete**: Delete branch after merge

### Commit Message Standards

#### Conventional Commits Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

#### Scope Definitions (for this project)
- `auth` - Authentication and authorization
- `ui` - User interface components
- `api` - API integration
- `store` - Pinia store management
- `router` - Vue Router configuration
- `types` - TypeScript type definitions
- `config` - Configuration files
- `deps` - Dependencies

#### Commit Message Examples
```bash
# Feature commits
feat(auth): add Keycloak OIDC integration
feat(ui): implement responsive data table component
feat(api): add store management service layer

# Bug fix commits
fix(auth): resolve token refresh infinite loop
fix(ui): correct button hover state styling
fix(router): handle unauthorized route redirects

# Documentation commits
docs(api): update authentication endpoint documentation
docs: add deployment guide to README

# Breaking changes
feat(auth)!: migrate to new authentication service

BREAKING CHANGE: Authentication service now requires
Keycloak configuration. Update environment variables.

# Multi-line commits with body
feat(store): implement product catalog state management

Add comprehensive Pinia store for product catalog including:
- Product CRUD operations
- Category management
- Inventory tracking
- Search and filtering state

Closes #6
```

#### Issue References in Commits
**Required**: Include issue reference in commit footer
```bash
git commit -m "feat(auth): implement user authentication store

Implement comprehensive user authentication state management
with Keycloak integration and token handling.

Closes #2"
```

### Code-Issue Traceability

#### Traceability Requirements
1. **Issue Creation**: All code changes must reference a GitHub issue
2. **Branch Naming**: Branch names must include issue number
3. **Commit References**: Commits should reference issues in footer
4. **PR Linking**: PRs must use closing keywords for issue linking
5. **Code Comments**: Complex implementations reference issue numbers
6. **Documentation**: Major features documented with issue references

#### Traceability Audit Trail
```
GitHub Issue #2 "Authentication System"
    ↓
Branch: feature/ADMIN-2-authentication-system
    ↓
Commits: Multiple commits referencing "Relates to #2" or "Closes #2"
    ↓
Pull Request: "feat(auth): implement authentication system - Closes #2"
    ↓
Merge: Automatically closes Issue #2
    ↓
Deployment: Feature trackable to original requirement
```

#### Code Comment Standards for Traceability
```typescript
// Complex business logic - reference GitHub issue for context
// TODO: Optimize performance - tracked in issue #45
// FIXME: Handle edge case - reported in issue #67
// NOTE: Implementation details in issue #23

/**
 * Authentication service with Keycloak integration
 * 
 * Implements requirements from GitHub issue #2:
 * - OIDC authentication flow
 * - Token refresh mechanism
 * - Role-based access control
 * 
 * @see https://github.com/repo/issues/2
 */
export class AuthService {
  // Implementation
}
```

### Emergency Recovery Procedures

#### Accidentally Closed Issue Recovery
**Scenario**: Issue closed prematurely before code is merged

**Recovery Steps**:
1. **Immediate**: Reopen the GitHub issue
2. **Check Status**: Verify if there are uncommitted changes
3. **Create PR**: Create pull request with existing code
4. **Re-link**: Use "Closes #issue" in PR description
5. **Document**: Add comment explaining the premature closure

```bash
# Check for uncommitted changes
git status

# If changes exist, commit them
git add .
git commit -m "feat(scope): complete implementation for issue #X

Completes work that was started before issue was accidentally closed.

Closes #X"

# Push and create PR
git push origin feature/ADMIN-X-description
gh pr create --title "feat(scope): implement feature - Closes #X" --body "Closes #X"
```

#### Orphaned Branch Cleanup
**Scenario**: Branches exist without corresponding issues or PRs

**Cleanup Process**:
```bash
# List all branches
git branch -a

# Check branch status
git show-branch branch-name

# If branch is merged, delete local and remote
git branch -d branch-name
git push origin --delete branch-name

# If branch has unmerged changes, create issue first
gh issue create --title "Recover work from orphaned branch" --body "Branch: branch-name"
```

#### Failed Merge Recovery
**Scenario**: Merge conflicts or failed CI/CD checks

**Recovery Steps**:
1. **Identify Issue**: Check CI/CD logs and merge conflict details
2. **Local Resolution**: Fix conflicts locally
3. **Test Thoroughly**: Ensure all tests pass
4. **Force Push**: Update PR branch
5. **Re-review**: Request additional review if significant changes

```bash
# Fetch latest changes
git fetch origin main

# Rebase to resolve conflicts
git rebase origin/main

# Resolve conflicts manually, then:
git add .
git rebase --continue

# Run tests
npm run test
npm run lint

# Force push to update PR
git push --force-with-lease origin feature/branch-name
```

#### Lost Work Recovery
**Scenario**: Accidental deletion or reset of work

**Recovery Using Git Reflog**:
```bash
# View recent actions
git reflog

# Find the commit with your work
git show HEAD@{2}

# Recover specific commit
git checkout HEAD@{2}

# Create new branch with recovered work
git checkout -b recover/lost-work-ADMIN-X

# Create issue and PR for recovered work
gh issue create --title "Recover lost work for feature X"
```

#### Broken Main Branch Recovery
**Scenario**: Main branch has critical bugs after merge

**Hotfix Process**:
```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/ADMIN-X-critical-fix

# Make minimal fix
# ... fix code ...

# Test thoroughly
npm run test

# Commit with clear message
git commit -m "fix: critical issue in production

Fixes critical bug introduced in previous merge.
Immediate fix required for production stability.

Closes #X"

# Push and create emergency PR
git push origin hotfix/ADMIN-X-critical-fix
gh pr create --title "HOTFIX: Critical production issue - Closes #X" \
              --body "Emergency fix for critical production issue. Requires immediate review and merge."
```

#### Mistaken Force Push Recovery
**Scenario**: Force push overwrites important commits

**Recovery Steps**:
```bash
# Check if commits exist in other developers' local repos
# Use reflog to find lost commits
git reflog

# If found, recover commits
git cherry-pick commit-hash

# If not found, check GitHub protection logs
# Contact GitHub support if critical data loss

# Prevention: Use --force-with-lease instead of --force
git push --force-with-lease origin branch-name
```

### Workflow Automation

#### Git Hooks Configuration
**Pre-commit Hook**: Validate commit messages and code quality
**Pre-push Hook**: Ensure tests pass before pushing
**Commit-msg Hook**: Validate conventional commit format

#### GitHub Actions Integration
- **Branch naming validation**: Ensure proper naming conventions
- **Issue linking validation**: Verify PRs link to issues
- **Automated labeling**: Apply labels based on file changes
- **Status checks**: Run tests, linting, security scans
- **Auto-merge**: Merge dependabot PRs after validation

#### Automated Issue Management
- **Stale issue detection**: Mark inactive issues as stale
- **Auto-assignment**: Assign issues based on file paths
- **Milestone management**: Automatically update milestones
- **Progress tracking**: Update project boards on issue changes

### Workflow Validation Checklist

#### Pre-Task Validation
- [ ] GitHub issue exists and is assigned
- [ ] Issue has proper labels and milestone
- [ ] Acceptance criteria are defined
- [ ] Branch name follows convention
- [ ] Local repository is up to date

#### During Development Validation
- [ ] Regular commits with proper messages
- [ ] Branch stays current with main
- [ ] Tests pass on each commit
- [ ] Code follows style guidelines
- [ ] Documentation updated as needed

#### Pre-PR Validation
- [ ] All tests pass locally
- [ ] Code review self-checklist completed
- [ ] Issue references in commits
- [ ] Branch pushed to origin
- [ ] CI/CD checks pass

#### Post-Merge Validation
- [ ] Issue automatically closed
- [ ] Branch deleted
- [ ] Deployment successful
- [ ] Documentation updated
- [ ] Stakeholders notified if needed

This comprehensive workflow ensures that every code change is traceable, reviewable, and properly integrated with the overall project management process, preventing common workflow mistakes and maintaining high code quality standards.

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
