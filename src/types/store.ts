/**
 * Store Management Type Definitions
 * Based on the technical specifications in PLAN.md and WARP.md
 */

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
  checkoutSettings: CheckoutSettings
  seoSettings: SeoSettings
  socialMediaLinks: SocialMediaLinks
}

export interface PaymentGateway {
  id: string
  name: string
  type: PaymentGatewayType
  enabled: boolean
  configuration: Record<string, unknown>
  supportedCurrencies: string[]
  testMode: boolean
}

export enum PaymentGatewayType {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  BRAINTREE = 'braintree',
  AUTHORIZE_NET = 'authorize_net'
}

export interface CheckoutSettings {
  guestCheckoutEnabled: boolean
  requireAccountCreation: boolean
  showCompanyField: boolean
  showPhoneField: boolean
  showBirthdateField: boolean
  termsAndConditionsUrl?: string
  privacyPolicyUrl?: string
  minimumOrderAmount?: number
  maxQuantityPerItem: number
}

export interface SeoSettings {
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard: 'summary' | 'summary_large_image'
  googleAnalyticsId?: string
  facebookPixelId?: string
}

export interface SocialMediaLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export interface StoreTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  logo?: string
  favicon?: string
  customCss?: string
  fontFamily: string
  headerStyle: 'minimal' | 'classic' | 'modern'
  footerStyle: 'minimal' | 'extended'
  productCardStyle: 'card' | 'minimal' | 'detailed'
}

export interface StoreSubscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd?: Date
  cancelAt?: Date
  canceledAt?: Date
  pausedAt?: Date
  features: SubscriptionFeature[]
  limits: SubscriptionLimits
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  PAUSED = 'paused'
}

export interface SubscriptionFeature {
  name: string
  enabled: boolean
  limit?: number
  description: string
}

export interface SubscriptionLimits {
  maxProducts: number
  maxOrders: number
  maxCustomers: number
  maxUsers: number
  maxStorageGB: number
  maxBandwidthGB: number
  apiCallsPerMonth: number
}

// Store analytics and metrics
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
  status: string
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

// Store creation and validation
export interface StoreValidationResult {
  isValid: boolean
  errors: StoreValidationError[]
  warnings: StoreValidationWarning[]
}

export interface StoreValidationError {
  field: keyof CreateStoreDto
  code: string
  message: string
}

export interface StoreValidationWarning {
  field: keyof CreateStoreDto
  code: string
  message: string
}

export interface SubdomainAvailabilityCheck {
  subdomain: string
  isAvailable: boolean
  suggestions?: string[]
}

// Store templates
export interface StoreTemplate {
  id: string
  name: string
  description: string
  category: StoreTemplateCategory
  previewImages: string[]
  theme: Partial<StoreTheme>
  settings: Partial<StoreSettings>
  sampleData: boolean
  isPremium: boolean
}

export enum StoreTemplateCategory {
  FASHION = 'fashion',
  ELECTRONICS = 'electronics',
  FOOD_BEVERAGE = 'food_beverage',
  BEAUTY = 'beauty',
  HOME_GARDEN = 'home_garden',
  SPORTS = 'sports',
  BOOKS = 'books',
  GENERIC = 'generic'
}

// Store backup and export
export interface StoreBackup {
  id: string
  storeId: string
  filename: string
  size: number
  createdAt: Date
  expiresAt: Date
  includesProducts: boolean
  includesCustomers: boolean
  includesOrders: boolean
  includesSettings: boolean
}

export interface StoreExportRequest {
  storeId: string
  dataTypes: StoreDataType[]
  format: 'json' | 'csv' | 'xml'
  dateRange?: {
    start: Date
    end: Date
  }
}

export enum StoreDataType {
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  ORDERS = 'orders',
  CATEGORIES = 'categories',
  INVENTORY = 'inventory',
  SETTINGS = 'settings'
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
