# PLAN.md - GO Commerce Administration Console Technical Implementation Plan

This document provides the detailed technical implementation plan for the GO Commerce Administration Console, translating the specifications in `WARP.md` into concrete technical architecture, data models, and implementation strategies.

## Project Architecture Overview

### 1. Frontend Architecture Stack

#### Core Technologies
```yaml
Framework: Vue 3.5+
  - Composition API with <script setup> syntax
  - TypeScript 5.x strict mode
  - Single File Components (SFC)

Build System: Vite 5.x
  - ES modules and tree shaking
  - Hot Module Replacement (HMR)
  - Code splitting and lazy loading
  - Environment-based configuration

UI Framework: Chakra UI Vue
  - Component-based design system
  - Theme customization
  - Accessibility compliance
  - Responsive design utilities

State Management: Pinia
  - Composition API integration
  - TypeScript support
  - DevTools integration
  - Modular store architecture

HTTP Client: Axios
  - Request/response interceptors
  - Automatic token refresh
  - Error handling middleware
  - Request/response logging

Authentication: Keycloak OIDC
  - Authorization Code with PKCE flow
  - JWT token management
  - Role-based access control
  - Multi-tenant support
```

#### Project Structure
```
admin-console/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── atoms/             # Basic UI elements
│   │   ├── molecules/         # Composed components
│   │   └── organisms/         # Complex components
│   ├── composables/           # Vue composition functions
│   ├── layouts/               # Page layout components
│   ├── pages/                 # Route-based page components
│   ├── router/                # Vue Router configuration
│   ├── stores/                # Pinia store modules
│   ├── services/              # API service layer
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── assets/                # Images, fonts, styles
│   └── App.vue                # Root application component
├── tests/                     # Test files
├── docs/                      # Documentation
└── config/                    # Configuration files
```

### 2. State Management Architecture

#### Pinia Store Structure
```typescript
// stores/index.ts - Root store configuration
export const pinia = createPinia()

// Store modules by feature domain:
stores/
├── auth.ts                    # Authentication state
├── user.ts                    # User profile and preferences
├── stores.ts                  # Multi-store management
├── products.ts                # Product catalog state
├── customers.ts               # Customer management state
├── orders.ts                  # Order management state
├── ui.ts                      # UI state (modals, notifications)
└── analytics.ts               # Analytics and reporting state
```

#### Store Architecture Pattern
```typescript
// Example store structure
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const currentRoles = computed(() => user.value?.roles || [])
  
  // Actions
  async function login(credentials: LoginCredentials) { }
  async function logout() { }
  async function refreshToken() { }
  
  // Getters/Computed
  const hasRole = (role: string) => currentRoles.value.includes(role)
  const canAccessStore = (storeId: string) => { }
  
  return {
    user, isAuthenticated, currentRoles,
    login, logout, refreshToken,
    hasRole, canAccessStore
  }
})
```

### 3. Component Architecture

#### Atomic Design System Implementation
```typescript
// Atoms - Basic building blocks
components/atoms/
├── Button.vue                 # Base button component
├── Input.vue                  # Form input component
├── Badge.vue                  # Status badge component
├── Icon.vue                   # SVG icon component
└── Loading.vue                # Loading spinner component

// Molecules - Composed components
components/molecules/
├── SearchBox.vue              # Search input with suggestions
├── DataTableHeader.vue        # Table header with sorting
├── FormField.vue              # Input with label and validation
├── NavigationItem.vue         # Sidebar navigation item
└── MetricCard.vue             # Dashboard metric display

// Organisms - Complex components
components/organisms/
├── DataTable.vue              # Complete data table with pagination
├── ProductForm.vue            # Product creation/editing form
├── OrderStatus.vue            # Order status management
├── UserPermissions.vue        # User role and permission editor
└── StoreSelector.vue          # Multi-store selection dropdown
```

#### Component Composition Pattern
```typescript
// composables/useDataTable.ts
export function useDataTable<T>(config: DataTableConfig<T>) {
  const data = ref<T[]>([])
  const loading = ref(false)
  const pagination = ref({ page: 1, size: 10, total: 0 })
  const filters = ref({})
  const sorting = ref({ field: '', direction: 'asc' })
  
  async function fetchData() { }
  function updateFilters(newFilters: Partial<typeof filters.value>) { }
  function updateSorting(field: string) { }
  function changePage(page: number) { }
  
  return {
    data, loading, pagination, filters, sorting,
    fetchData, updateFilters, updateSorting, changePage
  }
}
```

### 4. Routing Architecture

#### Route Structure
```typescript
// router/index.ts
const routes: RouteRecordRaw[] = [
  // Authentication routes
  { path: '/login', component: () => import('@/pages/auth/Login.vue') },
  { path: '/logout', component: () => import('@/pages/auth/Logout.vue') },
  
  // Protected routes with authentication guard
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Platform-level routes (platform-admin only)
      {
        path: 'platform',
        meta: { roles: ['platform-admin'] },
        children: [
          { path: 'dashboard', component: () => import('@/pages/platform/Dashboard.vue') },
          { path: 'stores', component: () => import('@/pages/platform/Stores.vue') },
          { path: 'users', component: () => import('@/pages/platform/Users.vue') },
          { path: 'analytics', component: () => import('@/pages/platform/Analytics.vue') }
        ]
      },
      
      // Store-level routes (store-scoped roles)
      {
        path: 'store/:storeId',
        meta: { requiresStoreAccess: true },
        children: [
          { path: 'dashboard', component: () => import('@/pages/store/Dashboard.vue') },
          { 
            path: 'products', 
            component: () => import('@/pages/store/Products.vue'),
            meta: { roles: ['store-admin', 'product-manager'] }
          },
          {
            path: 'customers',
            component: () => import('@/pages/store/Customers.vue'),
            meta: { roles: ['store-admin', 'customer-service'] }
          },
          {
            path: 'orders',
            component: () => import('@/pages/store/Orders.vue'),
            meta: { roles: ['store-admin', 'order-manager'] }
          }
        ]
      }
    ]
  }
]
```

#### Route Guards Implementation
```typescript
// router/guards.ts
export function setupRouteGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // Authentication check
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next('/login')
    }
    
    // Role-based authorization
    if (to.meta.roles && !hasRequiredRole(to.meta.roles)) {
      return next('/unauthorized')
    }
    
    // Store access validation
    if (to.meta.requiresStoreAccess && to.params.storeId) {
      if (!authStore.canAccessStore(to.params.storeId as string)) {
        return next('/unauthorized')
      }
    }
    
    next()
  })
}
```

## Data Models and TypeScript Interfaces

### 1. Authentication and User Models

```typescript
// types/auth.ts
export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  roles: Role[]
  storeAccess: StoreAccess[]
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  name: RoleName
  scope: 'platform' | 'store'
  permissions: Permission[]
  storeId?: string // Only for store-scoped roles
}

export type RoleName = 
  | 'platform-admin'
  | 'store-admin' 
  | 'product-manager'
  | 'order-manager'
  | 'customer-service'
  | 'customer'

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface StoreAccess {
  storeId: string
  storeName: string
  roles: RoleName[]
  isDefault: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  defaultStore?: string
  dashboardLayout: Record<string, any>
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
  scope: string
}

export interface LoginCredentials {
  username: string
  password: string
}
```

### 2. Store Management Models

```typescript
// types/store.ts
export interface StoreDto {
  id: string
  ownerId: string
  name: string
  subdomain: string
  email: string
  phone?: string
  currencyCode: string
  defaultLocale: string
  timezone: string
  status: StoreStatus
  description?: string
  fullDomain: string
  settings: StoreSettings
  theme: StoreTheme
  subscription: StoreSubscription
  createdAt: Date
  updatedAt: Date
}

export interface CreateStoreDto {
  name: string
  subdomain: string
  email: string
  phone?: string
  currencyCode: string
  defaultLocale: string
  timezone: string
  description?: string
  ownerId: string
  templateId?: string
}

export interface UpdateStoreDto {
  name?: string
  email?: string
  phone?: string
  description?: string
  settings?: Partial<StoreSettings>
  theme?: Partial<StoreTheme>
}

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface StoreSettings {
  taxEnabled: boolean
  taxRate: number
  shippingEnabled: boolean
  inventoryTracking: boolean
  lowStockThreshold: number
  orderNotifications: boolean
  emailTemplates: Record<string, string>
  paymentGateways: PaymentGateway[]
}

export interface PaymentGateway {
  id: string
  name: string
  enabled: boolean
  configuration: Record<string, any>
}

export interface StoreTheme {
  primaryColor: string
  secondaryColor: string
  logo?: string
  favicon?: string
  customCss?: string
}

export interface StoreSubscription {
  plan: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd?: Date
}
```

### 3. Product Management Models

```typescript
// types/product.ts
export interface ProductDto {
  id: string
  sku: string
  name: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  cost: number
  inventoryQuantity: number
  inventoryPolicy: InventoryPolicy
  trackQuantity: boolean
  isActive: boolean
  isVisible: boolean
  categoryId?: string
  category?: CategoryDto
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  seoTitle?: string
  seoDescription?: string
  weight?: number
  dimensions?: ProductDimensions
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductDto {
  sku: string
  name: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  cost: number
  inventoryQuantity: number
  inventoryPolicy: InventoryPolicy
  trackQuantity: boolean
  categoryId?: string
  tags: string[]
  images: CreateProductImage[]
  attributes: ProductAttribute[]
  seoTitle?: string
  seoDescription?: string
  weight?: number
  dimensions?: ProductDimensions
}

export interface CategoryDto {
  id: string
  name: string
  description?: string
  parentId?: string
  children: CategoryDto[]
  isActive: boolean
  sortOrder: number
  image?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  position: number
  isMain: boolean
}

export interface CreateProductImage {
  file: File
  altText?: string
  position: number
  isMain: boolean
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  price: number
  comparePrice?: number
  cost: number
  inventoryQuantity: number
  isActive: boolean
  attributes: VariantAttribute[]
  image?: ProductImage
}

export interface ProductAttribute {
  name: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
}

export interface VariantAttribute {
  name: string
  value: string
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
}

export enum InventoryPolicy {
  DENY = 'deny',
  CONTINUE = 'continue'
}
```

### 4. Customer Management Models

```typescript
// types/customer.ts
export interface CustomerDto {
  id: string
  type: CustomerType
  email: string
  firstName: string
  lastName: string
  displayName: string
  phone?: string
  dateOfBirth?: Date
  gender?: Gender
  addresses: AddressDto[]
  defaultBillingAddress?: AddressDto
  defaultShippingAddress?: AddressDto
  status: CustomerStatus
  emailVerified: boolean
  phoneVerified: boolean
  marketingOptIn: boolean
  smsOptIn: boolean
  preferredLanguage: string
  customerGroup?: CustomerGroup
  tags: string[]
  notes: CustomerNote[]
  ordersSummary: CustomerOrdersSummary
  keycloakUserId?: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface CompanyCustomerDto extends CustomerDto {
  type: CustomerType.COMPANY
  companyName: string
  taxId: string
  vatNumber?: string
  website?: string
  industry?: string
  companySize?: CompanySize
  billingContact: ContactPerson
  shippingContact: ContactPerson
}

export interface CreateCustomerDto {
  type: CustomerType
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  gender?: Gender
  addresses?: CreateAddressDto[]
  marketingOptIn?: boolean
  smsOptIn?: boolean
  preferredLanguage?: string
  customerGroupId?: string
  tags?: string[]
  notes?: string
  
  // Company-specific fields
  companyName?: string
  taxId?: string
  vatNumber?: string
  website?: string
  industry?: string
  companySize?: CompanySize
}

export interface AddressDto {
  id: string
  customerId: string
  type: AddressType
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  instructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAddressDto {
  type: AddressType
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
  instructions?: string
}

export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
  GENERAL = 'general'
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export interface CustomerGroup {
  id: string
  name: string
  description?: string
  discountPercentage: number
  criteria: CustomerGroupCriteria
  customerCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ContactPerson {
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
}

export interface CustomerNote {
  id: string
  customerId: string
  authorId: string
  authorName: string
  content: string
  isInternal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CustomerOrdersSummary {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate?: Date
  lifetimeValue: number
}

export interface CustomerGroupCriteria {
  minOrders?: number
  minSpent?: number
  tags?: string[]
  location?: string[]
  registrationDateRange?: {
    start: Date
    end: Date
  }
}
```

### 5. Order Management Models

```typescript
// types/order.ts
export interface OrderDto {
  id: string
  orderNumber: string
  customerId: string
  customer: CustomerSummary
  statusId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  refundedAmount: number
  currencyCode: string
  locale: string
  shippingAddress: AddressDto
  billingAddress: AddressDto
  items: OrderItemDto[]
  payments: OrderPayment[]
  shipments: OrderShipment[]
  discounts: OrderDiscount[]
  taxes: OrderTax[]
  orderDate: Date
  confirmedAt?: Date
  shippedDate?: Date
  deliveredDate?: Date
  canceledAt?: Date
  notes?: string
  internalNotes?: string
  tags: string[]
  source: OrderSource
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface OrderItemDto {
  id: string
  orderId: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  productName: string
  productSku: string
  variantName?: string
  productImage?: string
  isGift: boolean
  giftMessage?: string
  taxRate: number
  taxAmount: number
  discountAmount: number
  fulfillmentQuantity: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderDto {
  customerId: string
  shippingAddress: CreateAddressDto
  billingAddress: CreateAddressDto
  items: CreateOrderItemDto[]
  notes?: string
  tags?: string[]
  source?: OrderSource
  paymentMethod?: string
}

export interface CreateOrderItemDto {
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  isGift?: boolean
  giftMessage?: string
}

export interface CreateOrderFromCartDto {
  cartId: string
  customerId: string
  shippingAddress: CreateAddressDto
  billingAddress: CreateAddressDto
  notes?: string
  clearCartAfterOrder?: boolean
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export enum OrderSource {
  WEB = 'web',
  MOBILE = 'mobile',
  POS = 'pos',
  API = 'api',
  ADMIN = 'admin'
}

export interface CustomerSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
}

export interface OrderPayment {
  id: string
  orderId: string
  amount: number
  currencyCode: string
  paymentMethod: string
  status: PaymentStatus
  gatewayTransactionId?: string
  gatewayResponse?: Record<string, any>
  processedAt?: Date
  createdAt: Date
}

export interface OrderShipment {
  id: string
  orderId: string
  trackingNumber?: string
  carrier?: string
  items: ShipmentItem[]
  shippedAt: Date
  estimatedDelivery?: Date
  deliveredAt?: Date
  createdAt: Date
}

export interface ShipmentItem {
  orderItemId: string
  quantity: number
}

export interface OrderDiscount {
  id: string
  orderId: string
  code?: string
  description: string
  amount: number
  type: 'fixed' | 'percentage'
  createdAt: Date
}

export interface OrderTax {
  id: string
  orderId: string
  description: string
  rate: number
  amount: number
  createdAt: Date
}
```

### 6. Analytics and Reporting Models

```typescript
// types/analytics.ts
export interface DashboardMetrics {
  platform?: PlatformMetrics
  store?: StoreMetrics
  timeRange: TimeRange
  lastUpdated: Date
}

export interface PlatformMetrics {
  totalStores: number
  activeStores: number
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  topStores: TopStoreMetric[]
  recentActivity: ActivityItem[]
  systemHealth: SystemHealth
}

export interface StoreMetrics {
  storeId: string
  storeName: string
  revenue: number
  orders: number
  customers: number
  products: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  conversionRate: number
  averageOrderValue: number
  topProducts: TopProductMetric[]
  recentOrders: OrderSummary[]
  inventoryAlerts: InventoryAlert[]
}

export interface TimeRange {
  start: Date
  end: Date
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  comparison: 'previous_period' | 'previous_year' | 'custom'
}

export interface TopStoreMetric {
  storeId: string
  storeName: string
  revenue: number
  orders: number
  growth: number
}

export interface TopProductMetric {
  productId: string
  productName: string
  sku: string
  revenue: number
  quantity: number
  views: number
}

export interface OrderSummary {
  id: string
  orderNumber: string
  customerName: string
  totalAmount: number
  status: OrderStatus
  createdAt: Date
}

export interface InventoryAlert {
  productId: string
  productName: string
  sku: string
  currentQuantity: number
  threshold: number
  severity: 'low' | 'out_of_stock'
}

export interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  entityId: string
  entityType: string
  userId: string
  userName: string
  timestamp: Date
}

export enum ActivityType {
  STORE_CREATED = 'store_created',
  USER_REGISTERED = 'user_registered',
  ORDER_PLACED = 'order_placed',
  PRODUCT_CREATED = 'product_created',
  SYSTEM_ALERT = 'system_alert'
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  apiResponseTime: number
  databaseResponseTime: number
  cacheHitRate: number
  errorRate: number
  lastCheck: Date
}
```

## API Integration Specifications

### 1. Authentication Endpoints

```typescript
// Authentication API endpoints
interface AuthAPI {
  // User authentication with Keycloak
  POST /api/v1/auth/login: {
    request: LoginCredentials
    response: TokenResponse
    errors: 401 | 400
  }
  
  // Token refresh
  POST /api/v1/auth/refresh: {
    request: { refreshToken: string }
    response: TokenResponse
    errors: 401 | 400
  }
  
  // User logout
  POST /api/v1/auth/logout: {
    request: { refreshToken: string }
    response: { success: boolean }
    errors: 400
  }
  
  // Get current user profile
  GET /api/v1/auth/profile: {
    request: void
    response: UserProfile
    errors: 401
    headers: { Authorization: `Bearer ${accessToken}` }
  }
  
  // Update user profile
  PUT /api/v1/auth/profile: {
    request: Partial<UserProfile>
    response: UserProfile
    errors: 401 | 400
    headers: { Authorization: `Bearer ${accessToken}` }
  }
}
```

### 2. Platform Administration Endpoints

```typescript
// Platform-level administration (platform-admin only)
interface PlatformAPI {
  // Store management
  GET /api/v1/platform/stores: {
    request: PaginationParams & {
      search?: string
      status?: StoreStatus
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
    response: PaginatedResponse<StoreDto>
    errors: 401 | 403
    roles: ['platform-admin']
  }
  
  POST /api/v1/platform/stores: {
    request: CreateStoreDto
    response: StoreDto
    errors: 401 | 403 | 400
    roles: ['platform-admin']
  }
  
  GET /api/v1/platform/stores/:id: {
    request: void
    response: StoreDto
    errors: 401 | 403 | 404
    roles: ['platform-admin']
  }
  
  PUT /api/v1/platform/stores/:id: {
    request: UpdateStoreDto
    response: StoreDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin']
  }
  
  DELETE /api/v1/platform/stores/:id: {
    request: void
    response: { success: boolean }
    errors: 401 | 403 | 404
    roles: ['platform-admin']
  }
  
  // User management
  GET /api/v1/platform/users: {
    request: PaginationParams & {
      search?: string
      role?: RoleName
      storeId?: string
    }
    response: PaginatedResponse<UserProfile>
    errors: 401 | 403
    roles: ['platform-admin']
  }
  
  POST /api/v1/platform/users: {
    request: CreateUserDto
    response: UserProfile
    errors: 401 | 403 | 400
    roles: ['platform-admin']
  }
  
  PUT /api/v1/platform/users/:id/roles: {
    request: { roles: Role[] }
    response: UserProfile
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin']
  }
  
  // Platform analytics
  GET /api/v1/platform/analytics/overview: {
    request: { timeRange: TimeRange }
    response: PlatformMetrics
    errors: 401 | 403
    roles: ['platform-admin']
  }
  
  GET /api/v1/platform/analytics/revenue: {
    request: { timeRange: TimeRange, groupBy: 'day' | 'week' | 'month' }
    response: TimeSeriesData[]
    errors: 401 | 403
    roles: ['platform-admin']
  }
}
```

### 3. Store Administration Endpoints

```typescript
// Store-level administration (store-scoped roles)
interface StoreAPI {
  // Store dashboard
  GET /api/v1/stores/:storeId/dashboard: {
    request: { timeRange?: TimeRange }
    response: StoreMetrics
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'product-manager', 'order-manager', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  // Store settings
  GET /api/v1/stores/:storeId/settings: {
    request: void
    response: StoreDto
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin']
    headers: { 'X-Store-Id': storeId }
  }
  
  PUT /api/v1/stores/:storeId/settings: {
    request: UpdateStoreDto
    response: StoreDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin']
    headers: { 'X-Store-Id': storeId }
  }
  
  // Product management
  GET /api/v1/stores/:storeId/products: {
    request: PaginationParams & {
      search?: string
      categoryId?: string
      isActive?: boolean
      lowStock?: boolean
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
    response: PaginatedResponse<ProductDto>
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/products: {
    request: CreateProductDto
    response: ProductDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  GET /api/v1/stores/:storeId/products/:productId: {
    request: void
    response: ProductDto
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  PUT /api/v1/stores/:storeId/products/:productId: {
    request: Partial<ProductDto>
    response: ProductDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  DELETE /api/v1/stores/:storeId/products/:productId: {
    request: void
    response: { success: boolean }
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  // Product categories
  GET /api/v1/stores/:storeId/categories: {
    request: { includeInactive?: boolean }
    response: CategoryDto[]
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/categories: {
    request: CreateCategoryDto
    response: CategoryDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'product-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  // Customer management
  GET /api/v1/stores/:storeId/customers: {
    request: PaginationParams & {
      search?: string
      status?: CustomerStatus
      type?: CustomerType
      groupId?: string
      tags?: string[]
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
    response: PaginatedResponse<CustomerDto>
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/customers: {
    request: CreateCustomerDto
    response: CustomerDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  GET /api/v1/stores/:storeId/customers/:customerId: {
    request: void
    response: CustomerDto & { orders: OrderSummary[] }
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  PUT /api/v1/stores/:storeId/customers/:customerId: {
    request: Partial<CustomerDto>
    response: CustomerDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  // Order management
  GET /api/v1/stores/:storeId/orders: {
    request: PaginationParams & {
      search?: string
      status?: OrderStatus
      paymentStatus?: PaymentStatus
      fulfillmentStatus?: FulfillmentStatus
      customerId?: string
      dateFrom?: string
      dateTo?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
    response: PaginatedResponse<OrderDto>
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'order-manager', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/orders: {
    request: CreateOrderDto
    response: OrderDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'order-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/orders/from-cart: {
    request: CreateOrderFromCartDto
    response: OrderDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'order-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  GET /api/v1/stores/:storeId/orders/:orderId: {
    request: void
    response: OrderDto
    errors: 401 | 403 | 404
    roles: ['platform-admin', 'store-admin', 'order-manager', 'customer-service']
    headers: { 'X-Store-Id': storeId }
  }
  
  PUT /api/v1/stores/:storeId/orders/:orderId/status: {
    request: { status: OrderStatus, notes?: string }
    response: OrderDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'order-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/orders/:orderId/fulfill: {
    request: {
      items: { orderItemId: string, quantity: number }[]
      trackingNumber?: string
      carrier?: string
      notifyCustomer?: boolean
    }
    response: OrderDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'order-manager']
    headers: { 'X-Store-Id': storeId }
  }
  
  POST /api/v1/stores/:storeId/orders/:orderId/refund: {
    request: {
      amount: number
      reason?: string
      items?: { orderItemId: string, quantity: number, amount: number }[]
      notifyCustomer?: boolean
    }
    response: OrderDto
    errors: 401 | 403 | 404 | 400
    roles: ['platform-admin', 'store-admin', 'order-manager']
    headers: { 'X-Store-Id': storeId }
  }
}
```

### 4. Shared Utility Types

```typescript
// types/api.ts
export interface PaginationParams {
  page: number
  size: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface TimeSeriesData {
  timestamp: Date
  value: number
  label: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: ApiError[]
}

// HTTP Client Configuration
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  withCredentials: boolean
  headers: Record<string, string>
}
```

## Service Layer Implementation Strategy

### 1. HTTP Client Setup

```typescript
// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/types/api'

class ApiClient {
  private client: AxiosInstance
  
  constructor(config: ApiClientConfig) {
    this.client = axios.create(config)
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          const authStore = useAuthStore()
          const refreshed = await authStore.refreshToken()
          
          if (refreshed) {
            return this.client(originalRequest)
          } else {
            authStore.logout()
            window.location.href = '/login'
          }
        }
        
        throw this.transformError(error)
      }
    )
  }
  
  private transformError(error: any): ApiError {
    return {
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.message || error.message,
      details: error.response?.data?.details,
      timestamp: new Date()
    }
  }
  
  // HTTP method wrappers
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config)
    return response.data
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config)
    return response.data
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 2. Service Classes Pattern

```typescript
// services/authService.ts
export class AuthService {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    return apiClient.post('/auth/login', credentials)
  }
  
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    return apiClient.post('/auth/logout', { refreshToken })
  }
  
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post('/auth/refresh', { refreshToken })
  }
  
  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/auth/profile')
  }
  
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put('/auth/profile', profile)
  }
}

// services/storeService.ts
export class StoreService {
  async getStores(params: PaginationParams): Promise<PaginatedResponse<StoreDto>> {
    return apiClient.get('/platform/stores', { params })
  }
  
  async createStore(store: CreateStoreDto): Promise<StoreDto> {
    return apiClient.post('/platform/stores', store)
  }
  
  async getStore(id: string): Promise<StoreDto> {
    return apiClient.get(`/platform/stores/${id}`)
  }
  
  async updateStore(id: string, store: UpdateStoreDto): Promise<StoreDto> {
    return apiClient.put(`/platform/stores/${id}`, store)
  }
  
  async deleteStore(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/platform/stores/${id}`)
  }
  
  async getStoreDashboard(storeId: string, timeRange?: TimeRange): Promise<StoreMetrics> {
    return apiClient.get(`/stores/${storeId}/dashboard`, { 
      params: timeRange,
      headers: { 'X-Store-Id': storeId }
    })
  }
}

// Export service instances
export const authService = new AuthService()
export const storeService = new StoreService()
```

## Authentication Integration with Keycloak

### 1. Keycloak Client Configuration

```typescript
// services/keycloakService.ts
import Keycloak from 'keycloak-js'

export interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}

class KeycloakService {
  private keycloak: Keycloak
  private initialized = false
  
  constructor(config: KeycloakConfig) {
    this.keycloak = new Keycloak(config)
  }
  
  async initialize(): Promise<boolean> {
    if (this.initialized) return this.keycloak.authenticated || false
    
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false
      })
      
      this.initialized = true
      this.setupTokenRefresh()
      
      return authenticated
    } catch (error) {
      console.error('Keycloak initialization failed:', error)
      return false
    }
  }
  
  async login(options?: any): Promise<void> {
    return this.keycloak.login(options)
  }
  
  async logout(options?: any): Promise<void> {
    return this.keycloak.logout(options)
  }
  
  get token(): string | undefined {
    return this.keycloak.token
  }
  
  get refreshToken(): string | undefined {
    return this.keycloak.refreshToken
  }
  
  get userInfo(): any {
    return this.keycloak.tokenParsed
  }
  
  get isAuthenticated(): boolean {
    return this.keycloak.authenticated || false
  }
  
  async updateToken(minValidity = 30): Promise<boolean> {
    try {
      return await this.keycloak.updateToken(minValidity)
    } catch (error) {
      console.error('Token update failed:', error)
      return false
    }
  }
  
  private setupTokenRefresh(): void {
    setInterval(async () => {
      if (this.isAuthenticated) {
        try {
          await this.updateToken(60)
        } catch (error) {
          console.error('Token refresh failed:', error)
          await this.logout()
        }
      }
    }, 30000) // Check every 30 seconds
  }
  
  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role, 'gocommerce-admin-console')
  }
  
  getUserRoles(): string[] {
    const realmRoles = this.keycloak.realmAccess?.roles || []
    const clientRoles = this.keycloak.resourceAccess?.['gocommerce-admin-console']?.roles || []
    return [...realmRoles, ...clientRoles]
  }
}

// Keycloak configuration from environment
const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:9000',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'gocommerce',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'gocommerce-admin-console'
}

export const keycloakService = new KeycloakService(keycloakConfig)
```

### 2. Authentication Store Integration

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { keycloakService } from '@/services/keycloakService'
import { authService } from '@/services/authService'
import type { UserProfile, TokenResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const isInitializing = ref(true)
  
  // Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const currentRoles = computed(() => user.value?.roles?.map(r => r.name) || [])
  const isPlatformAdmin = computed(() => currentRoles.value.includes('platform-admin'))
  
  // Actions
  async function initialize(): Promise<void> {
    try {
      isInitializing.value = true
      
      const authenticated = await keycloakService.initialize()
      
      if (authenticated) {
        accessToken.value = keycloakService.token!
        refreshTokenValue.value = keycloakService.refreshToken!
        
        // Fetch user profile from backend
        await fetchUserProfile()
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      isInitializing.value = false
    }
  }
  
  async function login(): Promise<void> {
    await keycloakService.login()
  }
  
  async function logout(): Promise<void> {
    try {
      if (refreshTokenValue.value) {
        await authService.logout(refreshTokenValue.value)
      }
    } catch (error) {
      console.error('Backend logout failed:', error)
    } finally {
      await keycloakService.logout()
      clearAuth()
    }
  }
  
  async function refreshToken(): Promise<boolean> {
    try {
      const refreshed = await keycloakService.updateToken(5)
      
      if (refreshed) {
        accessToken.value = keycloakService.token!
        refreshTokenValue.value = keycloakService.refreshToken!
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }
  
  async function fetchUserProfile(): Promise<void> {
    try {
      user.value = await authService.getProfile()
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }
  
  function clearAuth(): void {
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
  }
  
  function hasRole(role: string): boolean {
    return currentRoles.value.includes(role)
  }
  
  function canAccessStore(storeId: string): boolean {
    if (isPlatformAdmin.value) return true
    
    return user.value?.storeAccess?.some(access => 
      access.storeId === storeId
    ) || false
  }
  
  function getStoreRoles(storeId: string): string[] {
    if (isPlatformAdmin.value) return ['platform-admin']
    
    const storeAccess = user.value?.storeAccess?.find(access => 
      access.storeId === storeId
    )
    
    return storeAccess?.roles || []
  }
  
  return {
    // State
    user: readonly(user),
    accessToken: readonly(accessToken),
    isInitializing: readonly(isInitializing),
    
    // Getters
    isAuthenticated,
    currentRoles,
    isPlatformAdmin,
    
    // Actions
    initialize,
    login,
    logout,
    refreshToken,
    fetchUserProfile,
    hasRole,
    canAccessStore,
    getStoreRoles
  }
})
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
1. **Project Setup**
   - Initialize Vite + Vue 3 + TypeScript project
   - Configure Chakra UI Vue
   - Set up development tools (ESLint, Prettier, Husky)
   - Configure environment variables

2. **Authentication System**
   - Implement Keycloak integration
   - Create authentication store
   - Build login/logout components
   - Set up route guards

3. **Basic Layout**
   - Create main layout component
   - Implement responsive navigation
   - Build header with user menu
   - Create sidebar navigation

### Phase 2: Core Features (Weeks 3-6)
1. **Platform Dashboard** (Week 3)
   - Implement platform metrics display
   - Create store overview cards
   - Build activity feed component
   - Add system health indicators

2. **Store Management** (Week 4)
   - Create store listing page
   - Implement store creation form
   - Build store editing interface
   - Add store status management

3. **Product Catalog** (Week 5)
   - Create product listing with filters
   - Implement product creation form
   - Build product editing interface
   - Add category management

4. **User Management** (Week 6)
   - Create user listing page
   - Implement user creation form
   - Build role assignment interface
   - Add user permission management

### Phase 3: Advanced Features (Weeks 7-10)
1. **Customer Management** (Week 7)
   - Create customer listing with advanced filters
   - Implement customer profile pages
   - Build address management
   - Add customer segmentation

2. **Order Management** (Weeks 8-9)
   - Create order listing with filters
   - Implement order detail pages
   - Build order status management
   - Add fulfillment workflows
   - Implement refund processing

3. **Analytics & Reporting** (Week 10)
   - Create dashboard widgets
   - Implement time-range selectors
   - Build chart components
   - Add data export functionality

### Phase 4: Polish & Optimization (Weeks 11-12)
1. **Performance Optimization**
   - Implement code splitting
   - Add caching strategies
   - Optimize bundle sizes
   - Add loading states

2. **Testing & Documentation**
   - Write comprehensive unit tests
   - Add integration tests
   - Create user documentation
   - Finalize API documentation

3. **Production Preparation**
   - Configure CI/CD pipeline
   - Set up error monitoring
   - Optimize build process
   - Prepare deployment scripts

This technical implementation plan provides the detailed roadmap for building the GO Commerce Administration Console according to the specifications in `WARP.md`. Each phase builds upon the previous one, ensuring a systematic and maintainable development process.
