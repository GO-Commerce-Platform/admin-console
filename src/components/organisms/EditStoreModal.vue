<!--
  Edit Store Modal Component
  Tabbed interface for editing existing stores with comprehensive settings
  
  Related GitHub Issue: #5 - Store Management System
  Based on specifications in WARP.md and PLAN.md
-->
<template>
  <CModal
    :is-open="true"
    size="5xl"
    :close-on-overlay-click="false"
    @close="handleClose"
  >
    <CModalOverlay />
    <CModalContent>
      <CModalHeader>
        <CStack
          direction="row"
          spacing="4"
          :align="'center'"
        >
          <CIcon
            name="cog"
            size="lg"
            color="blue.500"
          />
          <div>
            <CHeading size="lg">
              Edit Store Settings
            </CHeading>
            <CText
              font-size="sm"
              color="gray.600"
            >
              {{ store.name }}
            </CText>
          </div>
        </CStack>
        <CModalCloseButton @click="handleClose" />
      </CModalHeader>

      <CModalBody pb="6">
        <!-- Unsaved Changes Warning -->
        <CAlert
          v-if="hasUnsavedChanges"
          status="warning"
          variant="left-accent"
          mb="6"
        >
          <CAlertIcon />
          <CAlertTitle>Unsaved Changes</CAlertTitle>
          <CAlertDescription>
            You have unsaved changes. Don't forget to save your changes before closing.
          </CAlertDescription>
        </CAlert>

        <!-- Tabs Navigation -->
        <CTabs
          v-model="activeTab"
          variant="enclosed"
        >
          <CTabList>
            <CTab>
              <CIcon
                name="information-circle"
                mr="2"
                size="sm"
              />
              General Settings
            </CTab>
            <CTab>
              <CIcon
                name="office-building"
                mr="2"
                size="sm"
              />
              Business Info
            </CTab>
            <CTab>
              <CIcon
                name="adjustments"
                mr="2"
                size="sm"
              />
              Configuration
            </CTab>
            <CTab>
              <CIcon
                name="palette"
                mr="2"
                size="sm"
              />
              Theme & Design
            </CTab>
            <CTab>
              <CIcon
                name="credit-card"
                mr="2"
                size="sm"
              />
              Subscription
            </CTab>
          </CTabList>

          <CTabPanels mt="4">
            <!-- General Settings Tab -->
            <CTabPanel>
              <CStack spacing="6">
                <CSimpleGrid
                  columns="2"
                  spacing="6"
                >
                  <CFormControl
                    :is-invalid="!!errors.name"
                    :is-required="true"
                  >
                    <CFormLabel>Store Name</CFormLabel>
                    <CInput
                      v-model="formData.name"
                      placeholder="Enter store name"
                      @blur="validateField('name')"
                    />
                    <CFormErrorMessage>{{ errors.name }}</CFormErrorMessage>
                    <CFormHelperText>
                      This will be displayed as your store's brand name
                    </CFormHelperText>
                  </CFormControl>

                  <CFormControl>
                    <CFormLabel>Store Status</CFormLabel>
                    <CSelect v-model="formData.status">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </CSelect>
                    <CFormHelperText>
                      Control whether your store is accessible to customers
                    </CFormHelperText>
                  </CFormControl>
                </CSimpleGrid>

                <CFormControl
                  :is-invalid="!!errors.description"
                >
                  <CFormLabel>Description</CFormLabel>
                  <CTextarea
                    v-model="formData.description"
                    placeholder="Describe what your store sells..."
                    rows="4"
                    resize="vertical"
                  />
                  <CFormErrorMessage>{{ errors.description }}</CFormErrorMessage>
                  <CFormHelperText>
                    Help customers understand what your store is about
                  </CFormHelperText>
                </CFormControl>

                <CBox>
                  <CFormLabel mb="4">Store Domain</CFormLabel>
                  <CStack
                    direction="row"
                    spacing="4"
                    :align="'center'"
                  >
                    <CText
                      font-size="lg"
                      color="blue.600"
                      font-weight="medium"
                    >
                      {{ store.subdomain }}.gocommerce.io
                    </CText>
                    <CButton
                      size="sm"
                      variant="outline"
                      left-icon="external-link"
                      @click="openStoreInNewTab"
                    >
                      Visit Store
                    </CButton>
                  </CStack>
                  <CText
                    font-size="sm"
                    color="gray.600"
                    mt="2"
                  >
                    Store subdomain cannot be changed after creation
                  </CText>
                </CBox>
              </CStack>
            </CTabPanel>

            <!-- Business Info Tab -->
            <CTabPanel>
              <CStack spacing="6">
                <CSimpleGrid
                  columns="2"
                  spacing="6"
                >
                  <CFormControl
                    :is-invalid="!!errors.email"
                    :is-required="true"
                  >
                    <CFormLabel>Business Email</CFormLabel>
                    <CInput
                      v-model="formData.email"
                      type="email"
                      placeholder="business@example.com"
                      @blur="validateField('email')"
                    />
                    <CFormErrorMessage>{{ errors.email }}</CFormErrorMessage>
                    <CFormHelperText>
                      This will be used for important store notifications
                    </CFormHelperText>
                  </CFormControl>

                  <CFormControl
                    :is-invalid="!!errors.phone"
                  >
                    <CFormLabel>Phone Number</CFormLabel>
                    <CInput
                      v-model="formData.phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                    <CFormErrorMessage>{{ errors.phone }}</CFormErrorMessage>
                  </CFormControl>
                </CSimpleGrid>

                <CSimpleGrid
                  columns="3"
                  spacing="6"
                >
                  <CFormControl
                    :is-invalid="!!errors.currencyCode"
                    :is-required="true"
                  >
                    <CFormLabel>Currency</CFormLabel>
                    <CSelect
                      v-model="formData.currencyCode"
                      @blur="validateField('currencyCode')"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                    </CSelect>
                    <CFormErrorMessage>{{ errors.currencyCode }}</CFormErrorMessage>
                  </CFormControl>

                  <CFormControl
                    :is-invalid="!!errors.defaultLocale"
                    :is-required="true"
                  >
                    <CFormLabel>Language</CFormLabel>
                    <CSelect
                      v-model="formData.defaultLocale"
                      @blur="validateField('defaultLocale')"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Español (Spain)</option>
                      <option value="es-MX">Español (Mexico)</option>
                      <option value="fr-FR">Français</option>
                      <option value="de-DE">Deutsch</option>
                      <option value="it-IT">Italiano</option>
                      <option value="pt-BR">Português (Brazil)</option>
                      <option value="ja-JP">日本語</option>
                    </CSelect>
                    <CFormErrorMessage>{{ errors.defaultLocale }}</CFormErrorMessage>
                  </CFormControl>

                  <CFormControl
                    :is-invalid="!!errors.timezone"
                    :is-required="true"
                  >
                    <CFormLabel>Timezone</CFormLabel>
                    <CSelect
                      v-model="formData.timezone"
                      @blur="validateField('timezone')"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Sao_Paulo">São Paulo</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Europe/Berlin">Berlin</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Asia/Shanghai">Shanghai</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </CSelect>
                    <CFormErrorMessage>{{ errors.timezone }}</CFormErrorMessage>
                  </CFormControl>
                </CSimpleGrid>
              </CStack>
            </CTabPanel>

            <!-- Configuration Tab -->
            <CTabPanel>
              <CStack spacing="8">
                <!-- Tax Settings -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Tax Settings
                  </CHeading>
                  <CStack spacing="4">
                    <CCheckbox
                      v-model="formData.settings.taxEnabled"
                    >
                      Enable tax calculation
                    </CCheckbox>
                    
                    <CFormControl
                      v-if="formData.settings.taxEnabled"
                      :is-invalid="!!errors.taxRate"
                    >
                      <CFormLabel>Default Tax Rate (%)</CFormLabel>
                      <CNumberInput
                        v-model="formData.settings.taxRate"
                        :min="0"
                        :max="100"
                        :step="0.01"
                        precision="2"
                      >
                        <CNumberInputField />
                        <CNumberInputStepper>
                          <CNumberIncrementStepper />
                          <CNumberDecrementStepper />
                        </CNumberInputStepper>
                      </CNumberInput>
                      <CFormErrorMessage>{{ errors.taxRate }}</CFormErrorMessage>
                    </CFormControl>
                  </CStack>
                </CBox>

                <!-- Inventory Settings -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Inventory Settings
                  </CHeading>
                  <CStack spacing="4">
                    <CCheckbox
                      v-model="formData.settings.inventoryTracking"
                    >
                      Enable inventory tracking
                    </CCheckbox>
                    
                    <CFormControl
                      v-if="formData.settings.inventoryTracking"
                      :is-invalid="!!errors.lowStockThreshold"
                    >
                      <CFormLabel>Low Stock Threshold</CFormLabel>
                      <CNumberInput
                        v-model="formData.settings.lowStockThreshold"
                        :min="0"
                      >
                        <CNumberInputField />
                        <CNumberInputStepper>
                          <CNumberIncrementStepper />
                          <CNumberDecrementStepper />
                        </CNumberInputStepper>
                      </CNumberInput>
                      <CFormHelperText>
                        Alert when product inventory falls below this number
                      </CFormHelperText>
                      <CFormErrorMessage>{{ errors.lowStockThreshold }}</CFormErrorMessage>
                    </CFormControl>
                  </CStack>
                </CBox>

                <!-- Shipping Settings -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Shipping Settings
                  </CHeading>
                  <CCheckbox
                    v-model="formData.settings.shippingEnabled"
                  >
                    Enable shipping for physical products
                  </CCheckbox>
                </CBox>

                <!-- Notifications -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Notifications
                  </CHeading>
                  <CCheckbox
                    v-model="formData.settings.orderNotifications"
                  >
                    Send email notifications for new orders
                  </CCheckbox>
                </CBox>
              </CStack>
            </CTabPanel>

            <!-- Theme & Design Tab -->
            <CTabPanel>
              <CStack spacing="8">
                <!-- Brand Colors -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Brand Colors
                  </CHeading>
                  <CSimpleGrid
                    columns="3"
                    spacing="6"
                  >
                    <CFormControl>
                      <CFormLabel>Primary Color</CFormLabel>
                      <CInput
                        v-model="formData.theme.primaryColor"
                        type="color"
                        height="12"
                      />
                      <CFormHelperText>Main brand color</CFormHelperText>
                    </CFormControl>

                    <CFormControl>
                      <CFormLabel>Secondary Color</CFormLabel>
                      <CInput
                        v-model="formData.theme.secondaryColor"
                        type="color"
                        height="12"
                      />
                      <CFormHelperText>Accent color</CFormHelperText>
                    </CFormControl>

                    <CFormControl>
                      <CFormLabel>Background Color</CFormLabel>
                      <CInput
                        v-model="formData.theme.backgroundColor"
                        type="color"
                        height="12"
                      />
                      <CFormHelperText>Page background</CFormHelperText>
                    </CFormControl>
                  </CSimpleGrid>
                </CBox>

                <!-- Logo & Branding -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Logo & Branding
                  </CHeading>
                  <CStack spacing="4">
                    <CFormControl>
                      <CFormLabel>Logo URL</CFormLabel>
                      <CInput
                        v-model="formData.theme.logo"
                        placeholder="https://example.com/logo.png"
                      />
                      <CFormHelperText>
                        URL to your store logo image
                      </CFormHelperText>
                    </CFormControl>

                    <CFormControl>
                      <CFormLabel>Favicon URL</CFormLabel>
                      <CInput
                        v-model="formData.theme.favicon"
                        placeholder="https://example.com/favicon.ico"
                      />
                      <CFormHelperText>
                        URL to your store favicon
                      </CFormHelperText>
                    </CFormControl>
                  </CStack>
                </CBox>

                <!-- Custom CSS -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Custom Styling
                  </CHeading>
                  <CFormControl>
                    <CFormLabel>Custom CSS</CFormLabel>
                    <CTextarea
                      v-model="formData.theme.customCss"
                      placeholder="/* Add your custom CSS here */"
                      rows="8"
                      font-family="mono"
                      font-size="sm"
                    />
                    <CFormHelperText>
                      Add custom CSS to customize your store's appearance
                    </CFormHelperText>
                  </CFormControl>
                </CBox>
              </CStack>
            </CTabPanel>

            <!-- Subscription Tab -->
            <CTabPanel>
              <CStack spacing="6">
                <!-- Current Subscription -->
                <CBox
                  p="4"
                  border="1px"
                  border-color="gray.200"
                  border-radius="lg"
                >
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Current Subscription
                  </CHeading>
                  
                  <CSimpleGrid
                    columns="2"
                    spacing="4"
                  >
                    <CBox>
                      <CText
                        font-size="sm"
                        color="gray.600"
                        mb="1"
                      >
                        Plan
                      </CText>
                      <CBadge
                        :color-scheme="getPlanColor(store.subscription.plan)"
                        size="lg"
                      >
                        {{ store.subscription.plan.toUpperCase() }}
                      </CBadge>
                    </CBox>

                    <CBox>
                      <CText
                        font-size="sm"
                        color="gray.600"
                        mb="1"
                      >
                        Status
                      </CText>
                      <CBadge
                        :color-scheme="getSubscriptionStatusColor(store.subscription.status)"
                        size="lg"
                      >
                        {{ store.subscription.status.replace('_', ' ').toUpperCase() }}
                      </CBadge>
                    </CBox>

                    <CBox>
                      <CText
                        font-size="sm"
                        color="gray.600"
                        mb="1"
                      >
                        Current Period
                      </CText>
                      <CText font-size="sm">
                        {{ formatDate(store.subscription.currentPeriodStart) }} - 
                        {{ formatDate(store.subscription.currentPeriodEnd) }}
                      </CText>
                    </CBox>

                    <CBox
                      v-if="store.subscription.trialEnd"
                    >
                      <CText
                        font-size="sm"
                        color="gray.600"
                        mb="1"
                      >
                        Trial Ends
                      </CText>
                      <CText
                        font-size="sm"
                        :color="isTrialEnding ? 'red.500' : 'gray.900'"
                      >
                        {{ formatDate(store.subscription.trialEnd) }}
                      </CText>
                    </CBox>
                  </CSimpleGrid>
                </CBox>

                <!-- Subscription Features -->
                <CBox>
                  <CHeading
                    size="md"
                    mb="4"
                  >
                    Plan Features & Limits
                  </CHeading>
                  
                  <CSimpleGrid
                    columns="2"
                    spacing="4"
                  >
                    <CBox>
                      <CText
                        font-weight="medium"
                        mb="2"
                      >
                        Usage Limits
                      </CText>
                      <CStack
                        spacing="2"
                        font-size="sm"
                      >
                        <CStack
                          direction="row"
                          :justify="'space-between'"
                        >
                          <CText color="gray.600">Max Products:</CText>
                          <CText>{{ store.subscription.limits.maxProducts }}</CText>
                        </CStack>
                        <CStack
                          direction="row"
                          :justify="'space-between'"
                        >
                          <CText color="gray.600">Max Orders:</CText>
                          <CText>{{ store.subscription.limits.maxOrders }}</CText>
                        </CStack>
                        <CStack
                          direction="row"
                          :justify="'space-between'"
                        >
                          <CText color="gray.600">Max Customers:</CText>
                          <CText>{{ store.subscription.limits.maxCustomers }}</CText>
                        </CStack>
                        <CStack
                          direction="row"
                          :justify="'space-between'"
                        >
                          <CText color="gray.600">Storage:</CText>
                          <CText>{{ store.subscription.limits.maxStorageGB }}GB</CText>
                        </CStack>
                      </CStack>
                    </CBox>

                    <CBox>
                      <CText
                        font-weight="medium"
                        mb="2"
                      >
                        Available Features
                      </CText>
                      <CStack
                        spacing="1"
                        font-size="sm"
                      >
                        <CStack
                          v-for="feature in store.subscription.features"
                          :key="feature.name"
                          direction="row"
                          :align="'center'"
                          spacing="2"
                        >
                          <CIcon
                            :name="feature.enabled ? 'check' : 'x'"
                            size="xs"
                            :color="feature.enabled ? 'green.500' : 'red.500'"
                          />
                          <CText :color="feature.enabled ? 'gray.900' : 'gray.500'">
                            {{ feature.name }}
                          </CText>
                        </CStack>
                      </CStack>
                    </CBox>
                  </CSimpleGrid>
                </CBox>
              </CStack>
            </CTabPanel>
          </CTabPanels>
        </CTabs>
      </CModalBody>

      <CModalFooter>
        <!-- Audit Trail -->
        <CStack
          direction="column"
          spacing="2"
          :align="'start'"
          flex="1"
        >
          <CText
            font-size="xs"
            color="gray.500"
          >
            Created: {{ formatDateTime(store.createdAt) }}
          </CText>
          <CText
            font-size="xs"
            color="gray.500"
          >
            Last updated: {{ formatDateTime(store.updatedAt) }}
          </CText>
        </CStack>

        <CStack
          direction="row"
          spacing="3"
        >
          <CButton
            variant="ghost"
            @click="handleClose"
            :disabled="loading"
          >
            Cancel
          </CButton>
          <CButton
            variant="outline"
            @click="resetChanges"
            :disabled="!hasUnsavedChanges || loading"
          >
            Reset
          </CButton>
          <CButton
            variant="solid"
            color-scheme="blue"
            :is-loading="loading"
            @click="saveChanges"
            :disabled="!hasUnsavedChanges || hasErrors"
          >
            Save Changes
          </CButton>
        </CStack>
      </CModalFooter>
    </CModalContent>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStoresStore } from '@/stores/stores'
import type { StoreDto, UpdateStoreDto, StoreStatus } from '@/types/store'

// Props & Emits
interface Props {
  store: StoreDto
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', store: StoreDto): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const storesStore = useStoresStore()

// Local state
const activeTab = ref(0)
const loading = ref(false)
const originalData = ref<StoreDto | null>(null)

// Form data
const formData = ref<UpdateStoreDto & { status: StoreStatus }>({
  name: props.store.name,
  email: props.store.email,
  phone: props.store.phone,
  description: props.store.description,
  status: props.store.status,
  currencyCode: props.store.currencyCode,
  defaultLocale: props.store.defaultLocale,
  timezone: props.store.timezone,
  settings: {
    taxEnabled: props.store.settings?.taxEnabled ?? false,
    taxRate: props.store.settings?.taxRate ?? 0,
    shippingEnabled: props.store.settings?.shippingEnabled ?? true,
    inventoryTracking: props.store.settings?.inventoryTracking ?? true,
    lowStockThreshold: props.store.settings?.lowStockThreshold ?? 10,
    orderNotifications: props.store.settings?.orderNotifications ?? true,
    emailTemplates: props.store.settings?.emailTemplates ?? {},
    paymentGateways: props.store.settings?.paymentGateways ?? [],
  },
  theme: {
    primaryColor: props.store.theme?.primaryColor ?? '#3B82F6',
    secondaryColor: props.store.theme?.secondaryColor ?? '#64748B',
    accentColor: props.store.theme?.accentColor ?? '#F59E0B',
    backgroundColor: props.store.theme?.backgroundColor ?? '#FFFFFF',
    textColor: props.store.theme?.textColor ?? '#1F2937',
    logo: props.store.theme?.logo ?? '',
    favicon: props.store.theme?.favicon ?? '',
    customCss: props.store.theme?.customCss ?? '',
  },
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Computed
const hasUnsavedChanges = computed(() => {
  if (!originalData.value) return false
  
  return JSON.stringify(formData.value) !== JSON.stringify({
    name: originalData.value.name,
    email: originalData.value.email,
    phone: originalData.value.phone,
    description: originalData.value.description,
    status: originalData.value.status,
    currencyCode: originalData.value.currencyCode,
    defaultLocale: originalData.value.defaultLocale,
    timezone: originalData.value.timezone,
    settings: originalData.value.settings,
    theme: originalData.value.theme,
  })
})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const isTrialEnding = computed(() => {
  if (!props.store.subscription.trialEnd) return false
  const trialEnd = new Date(props.store.subscription.trialEnd)
  const now = new Date()
  const daysUntilTrial = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilTrial <= 7
})

// Methods
const validateField = (field: string) => {
  delete errors.value[field]
  
  switch (field) {
    case 'name':
      if (!formData.value.name) {
        errors.value.name = 'Store name is required'
      } else if (formData.value.name.length < 2) {
        errors.value.name = 'Store name must be at least 2 characters'
      }
      break
    case 'email':
      if (!formData.value.email) {
        errors.value.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Please enter a valid email address'
      }
      break
    case 'currencyCode':
      if (!formData.value.currencyCode) {
        errors.value.currencyCode = 'Currency is required'
      }
      break
    case 'defaultLocale':
      if (!formData.value.defaultLocale) {
        errors.value.defaultLocale = 'Language is required'
      }
      break
    case 'timezone':
      if (!formData.value.timezone) {
        errors.value.timezone = 'Timezone is required'
      }
      break
  }
}

const validateAllFields = () => {
  errors.value = {}
  
  const fieldsToValidate = ['name', 'email', 'currencyCode', 'defaultLocale', 'timezone']
  fieldsToValidate.forEach(field => validateField(field))
  
  return Object.keys(errors.value).length === 0
}

const resetChanges = () => {
  if (!originalData.value) return
  
  formData.value = {
    name: originalData.value.name,
    email: originalData.value.email,
    phone: originalData.value.phone,
    description: originalData.value.description,
    status: originalData.value.status,
    currencyCode: originalData.value.currencyCode,
    defaultLocale: originalData.value.defaultLocale,
    timezone: originalData.value.timezone,
    settings: { ...originalData.value.settings },
    theme: { ...originalData.value.theme },
  }
  
  errors.value = {}
}

const saveChanges = async () => {
  if (!validateAllFields()) {
    return
  }

  loading.value = true
  try {
    const success = await storesStore.updateStore(props.store.id, formData.value)
    if (success) {
      // Update original data to reflect saved state
      originalData.value = {
        ...props.store,
        ...formData.value,
      }
      
      emit('updated', originalData.value as StoreDto)
    }
  } catch (error) {
    console.error('Failed to update store:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  if (loading.value) return
  
  if (hasUnsavedChanges.value) {
    // TODO: Show confirmation dialog
    if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
      return
    }
  }
  
  emit('close')
}

const openStoreInNewTab = () => {
  window.open(props.store.fullDomain, '_blank')
}

const getPlanColor = (plan: string): string => {
  switch (plan) {
    case 'free':
      return 'gray'
    case 'starter':
      return 'blue'
    case 'professional':
      return 'green'
    case 'enterprise':
      return 'purple'
    default:
      return 'gray'
  }
}

const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'green'
    case 'past_due':
    case 'unpaid':
      return 'red'
    case 'canceled':
      return 'gray'
    case 'paused':
      return 'yellow'
    default:
      return 'gray'
  }
}

const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Watchers
watch(() => formData.value.name, () => {
  if (errors.value.name) {
    validateField('name')
  }
})

watch(() => formData.value.email, () => {
  if (errors.value.email) {
    validateField('email')
  }
})

// Lifecycle
onMounted(() => {
  // Store original data for comparison
  originalData.value = { ...props.store }
})
</script>

<style scoped>
/* Tab content spacing */
.chakra-tabs__tab-panel {
  @apply pt-6;
}

/* Form layout improvements */
.chakra-form__label {
  @apply font-medium;
}

/* Color input styling */
input[type="color"] {
  @apply cursor-pointer;
}

/* Number input adjustments */
.chakra-numberinput {
  @apply max-w-32;
}

/* Textarea font adjustment for CSS */
textarea[font-family="mono"] {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Badge size adjustments */
.chakra-badge[data-size="lg"] {
  @apply px-3 py-1 font-medium;
}

/* Modal size adjustment */
.chakra-modal__content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->