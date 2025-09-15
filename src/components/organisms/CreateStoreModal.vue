<!--
  Create Store Modal Component
  Multi-step wizard for creating new stores with validation and templates
  
  Related GitHub Issue: #5 - Store Management System
  Based on specifications in WARP.md and PLAN.md
-->
<template>
  <CModal
    :is-open="true"
    size="4xl"
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
            name="building-storefront"
            size="lg"
            color="blue.500"
          />
          <CHeading size="lg">
            Create New Store
          </CHeading>
        </CStack>
        <CModalCloseButton @click="handleClose" />
      </CModalHeader>

      <CModalBody pb="6">
        <!-- Progress Indicator -->
        <div class="progress-section">
          <CProgress
            :value="progressPercentage"
            color-scheme="blue"
            size="sm"
            mb="4"
          />
          <CStack
            direction="row"
            spacing="6"
            :justify="'space-between'"
          >
            <CBox
              v-for="(step, index) in steps"
              :key="step.id"
              class="progress-step"
              :class="{
                'active': currentStep === index + 1,
                'completed': currentStep > index + 1,
                'disabled': currentStep < index + 1
              }"
            >
              <CCircle
                size="8"
                :bg="getStepColor(index + 1)"
                color="white"
                mb="2"
              >
                <CIcon
                  v-if="currentStep > index + 1"
                  name="check"
                  size="sm"
                />
                <CText
                  v-else
                  font-size="sm"
                  font-weight="bold"
                >
                  {{ index + 1 }}
                </CText>
              </CCircle>
              <CText
                font-size="sm"
                :color="getStepTextColor(index + 1)"
                text-align="center"
              >
                {{ step.title }}
              </CText>
            </CBox>
          </CStack>
        </div>

        <!-- Step Content -->
        <CBox
          mt="8"
          min-height="400px"
        >
          <!-- Step 1: Basic Information -->
          <div
            v-if="currentStep === 1"
            class="step-content"
          >
            <CHeading
              size="md"
              mb="4"
            >
              Basic Store Information
            </CHeading>
            <CText
              color="gray.600"
              mb="6"
            >
              Let's start with the essential details for your store.
            </CText>

            <CStack
              spacing="6"
            >
              <CFormControl
                :is-invalid="!!errors.name"
                :is-required="true"
              >
                <CFormLabel>Store Name</CFormLabel>
                <CInput
                  v-model="formData.name"
                  placeholder="Enter your store name"
                  @blur="validateField('name')"
                />
                <CFormErrorMessage>{{ errors.name }}</CFormErrorMessage>
                <CFormHelperText>
                  This will be displayed as your store's brand name
                </CFormHelperText>
              </CFormControl>

              <CFormControl
                :is-invalid="!!errors.subdomain"
                :is-required="true"
              >
                <CFormLabel>Subdomain</CFormLabel>
                <CInputGroup>
                  <CInput
                    v-model="formData.subdomain"
                    placeholder="mystore"
                    @input="handleSubdomainInput"
                    @blur="validateField('subdomain')"
                  />
                  <CInputRightAddon>.gocommerce.io</CInputRightAddon>
                </CInputGroup>
                <CFormErrorMessage>{{ errors.subdomain }}</CFormErrorMessage>
                <CStack
                  direction="row"
                  spacing="2"
                  :align="'center'"
                  mt="2"
                >
                  <CIcon
                    v-if="subdomainCheck.checking"
                    name="spinner"
                    size="sm"
                    color="blue.500"
                    class="animate-spin"
                  />
                  <CIcon
                    v-else-if="subdomainCheck.available === true"
                    name="check-circle"
                    size="sm"
                    color="green.500"
                  />
                  <CIcon
                    v-else-if="subdomainCheck.available === false"
                    name="x-circle"
                    size="sm"
                    color="red.500"
                  />
                  <CText
                    font-size="sm"
                    :color="getAvailabilityColor()"
                  >
                    {{ getAvailabilityText() }}
                  </CText>
                </CStack>
                <div
                  v-if="subdomainCheck.suggestions && subdomainCheck.suggestions.length > 0"
                  class="mt-2"
                >
                  <CText
                    font-size="sm"
                    color="gray.600"
                    mb="2"
                  >
                    Suggestions:
                  </CText>
                  <CStack
                    direction="row"
                    spacing="2"
                    :wrap="'wrap'"
                  >
                    <CButton
                      v-for="suggestion in subdomainCheck.suggestions"
                      :key="suggestion"
                      size="sm"
                      variant="outline"
                      @click="selectSuggestion(suggestion)"
                    >
                      {{ suggestion }}
                    </CButton>
                  </CStack>
                </div>
              </CFormControl>

              <CFormControl
                :is-invalid="!!errors.description"
              >
                <CFormLabel>Description (Optional)</CFormLabel>
                <CTextarea
                  v-model="formData.description"
                  placeholder="Describe what your store sells..."
                  rows="3"
                  resize="vertical"
                />
                <CFormErrorMessage>{{ errors.description }}</CFormErrorMessage>
                <CFormHelperText>
                  Help customers understand what your store is about
                </CFormHelperText>
              </CFormControl>
            </CStack>
          </div>

          <!-- Step 2: Business Details -->
          <div
            v-if="currentStep === 2"
            class="step-content"
          >
            <CHeading
              size="md"
              mb="4"
            >
              Business Details
            </CHeading>
            <CText
              color="gray.600"
              mb="6"
            >
              Tell us about your business and contact information.
            </CText>

            <CStack
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
                <CFormLabel>Phone Number (Optional)</CFormLabel>
                <CInput
                  v-model="formData.phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
                <CFormErrorMessage>{{ errors.phone }}</CFormErrorMessage>
              </CFormControl>

              <CSimpleGrid
                columns="2"
                spacing="4"
              >
                <CFormControl
                  :is-invalid="!!errors.currencyCode"
                  :is-required="true"
                >
                  <CFormLabel>Currency</CFormLabel>
                  <CSelect
                    v-model="formData.currencyCode"
                    placeholder="Select currency"
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
                    placeholder="Select language"
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
              </CSimpleGrid>
            </CStack>
          </div>

          <!-- Step 3: Configuration -->
          <div
            v-if="currentStep === 3"
            class="step-content"
          >
            <CHeading
              size="md"
              mb="4"
            >
              Store Configuration
            </CHeading>
            <CText
              color="gray.600"
              mb="6"
            >
              Configure your store's timezone and choose a template to get started.
            </CText>

            <CStack
              spacing="6"
            >
              <CFormControl
                :is-invalid="!!errors.timezone"
                :is-required="true"
              >
                <CFormLabel>Timezone</CFormLabel>
                <CSelect
                  v-model="formData.timezone"
                  placeholder="Select timezone"
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

              <CFormControl>
                <CFormLabel>Store Template (Optional)</CFormLabel>
                <CText
                  font-size="sm"
                  color="gray.600"
                  mb="4"
                >
                  Choose a template to start with pre-configured settings and sample data
                </CText>
                
                <div
                  v-if="templates.length === 0"
                  class="template-loading"
                >
                  <CSpinner size="sm" />
                  <CText
                    ml="2"
                    font-size="sm"
                    color="gray.600"
                  >
                    Loading templates...
                  </CText>
                </div>
                
                <CSimpleGrid
                  v-else
                  columns="2"
                  spacing="4"
                >
                  <CBox
                    v-for="template in templates"
                    :key="template.id"
                    class="template-card"
                    :class="{ 'selected': formData.templateId === template.id }"
                    @click="selectTemplate(template.id)"
                  >
                    <CStack
                      spacing="3"
                    >
                      <CImage
                        v-if="template.previewImages[0]"
                        :src="template.previewImages[0]"
                        :alt="template.name"
                        height="120px"
                        object-fit="cover"
                        border-radius="md"
                      />
                      <CBox
                        v-else
                        height="120px"
                        bg="gray.100"
                        border-radius="md"
                        display="flex"
                        :align-items="'center'"
                        :justify-content="'center'"
                      >
                        <CIcon
                          name="image"
                          size="2xl"
                          color="gray.400"
                        />
                      </CBox>
                      
                      <CBox>
                        <CStack
                          direction="row"
                          spacing="2"
                          :align="'center'"
                          mb="1"
                        >
                          <CText
                            font-weight="medium"
                            font-size="sm"
                          >
                            {{ template.name }}
                          </CText>
                          <CBadge
                            v-if="template.isPremium"
                            color-scheme="purple"
                            size="sm"
                          >
                            Premium
                          </CBadge>
                        </CStack>
                        <CText
                          font-size="xs"
                          color="gray.600"
                          line-height="shorter"
                        >
                          {{ template.description }}
                        </CText>
                      </CBox>
                    </CStack>
                  </CBox>
                </CSimpleGrid>
              </CFormControl>
            </CStack>
          </div>

          <!-- Step 4: Review -->
          <div
            v-if="currentStep === 4"
            class="step-content"
          >
            <CHeading
              size="md"
              mb="4"
            >
              Review & Confirm
            </CHeading>
            <CText
              color="gray.600"
              mb="6"
            >
              Please review your store details before creating.
            </CText>

            <CStack
              spacing="6"
            >
              <!-- Store Summary -->
              <CBox
                p="4"
                border="1px"
                border-color="gray.200"
                border-radius="lg"
                bg="gray.50"
              >
                <CStack
                  direction="row"
                  spacing="4"
                  :align="'start'"
                >
                  <CBox
                    flex="1"
                  >
                    <CStack
                      spacing="4"
                    >
                      <CBox>
                        <CText
                          font-weight="medium"
                          mb="2"
                        >
                          Basic Information
                        </CText>
                        <CStack
                          spacing="2"
                          font-size="sm"
                        >
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Store Name:</CText>
                            <CText>{{ formData.name }}</CText>
                          </CStack>
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Subdomain:</CText>
                            <CText>{{ formData.subdomain }}.gocommerce.io</CText>
                          </CStack>
                          <CStack
                            v-if="formData.description"
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Description:</CText>
                            <CText max-width="200px">
                              {{ formData.description }}
                            </CText>
                          </CStack>
                        </CStack>
                      </CBox>

                      <CBox>
                        <CText
                          font-weight="medium"
                          mb="2"
                        >
                          Business Details
                        </CText>
                        <CStack
                          spacing="2"
                          font-size="sm"
                        >
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Email:</CText>
                            <CText>{{ formData.email }}</CText>
                          </CStack>
                          <CStack
                            v-if="formData.phone"
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Phone:</CText>
                            <CText>{{ formData.phone }}</CText>
                          </CStack>
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Currency:</CText>
                            <CText>{{ formData.currencyCode }}</CText>
                          </CStack>
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Language:</CText>
                            <CText>{{ formData.defaultLocale }}</CText>
                          </CStack>
                        </CStack>
                      </CBox>

                      <CBox>
                        <CText
                          font-weight="medium"
                          mb="2"
                        >
                          Configuration
                        </CText>
                        <CStack
                          spacing="2"
                          font-size="sm"
                        >
                          <CStack
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Timezone:</CText>
                            <CText>{{ formData.timezone }}</CText>
                          </CStack>
                          <CStack
                            v-if="selectedTemplate"
                            direction="row"
                            :justify="'space-between'"
                          >
                            <CText color="gray.600">Template:</CText>
                            <CText>{{ selectedTemplate.name }}</CText>
                          </CStack>
                        </CStack>
                      </CBox>
                    </CStack>
                  </CBox>
                </CStack>
              </CBox>

              <!-- Terms and Conditions -->
              <CBox>
                <CCheckbox
                  v-model="agreeToTerms"
                  :is-invalid="showTermsError"
                >
                  <CText font-size="sm">
                    I agree to the 
                    <CLink
                      color="blue.500"
                      href="/terms"
                      is-external
                    >
                      Terms of Service
                    </CLink>
                    and 
                    <CLink
                      color="blue.500"
                      href="/privacy"
                      is-external
                    >
                      Privacy Policy
                    </CLink>
                  </CText>
                </CCheckbox>
                <CText
                  v-if="showTermsError"
                  color="red.500"
                  font-size="sm"
                  mt="1"
                >
                  Please agree to the terms and conditions to continue
                </CText>
              </CBox>
            </CStack>
          </div>
        </CBox>
      </CModalBody>

      <CModalFooter>
        <CStack
          direction="row"
          spacing="3"
          :justify="'space-between'"
          width="full"
        >
          <CButton
            v-if="currentStep > 1"
            variant="outline"
            @click="previousStep"
            :disabled="loading"
          >
            Previous
          </CButton>
          <CDiv v-else />

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
              v-if="currentStep < steps.length"
              variant="solid"
              color-scheme="blue"
              @click="nextStep"
              :disabled="!canProceedToNext"
            >
              Next
            </CButton>
            <CButton
              v-else
              variant="solid"
              color-scheme="blue"
              :is-loading="loading"
              @click="createStore"
              :disabled="!canCreateStore"
            >
              Create Store
            </CButton>
          </CStack>
        </CStack>
      </CModalFooter>
    </CModalContent>
  </CModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStoresStore } from '@/stores/stores'
import { useAuth } from '@/composables/useAuth'
import { useDebounce } from '@/composables/useDebounce'
import type { CreateStoreDto, StoreTemplate } from '@/types/store'

// Props & Emits
interface Emits {
  (e: 'close'): void
  (e: 'created', store: any): void
}

const emit = defineEmits<Emits>()

// Composables
const storesStore = useStoresStore()
const { user } = useAuth()

// Form data
const formData = ref<CreateStoreDto>({
  name: '',
  subdomain: '',
  email: '',
  phone: '',
  currencyCode: 'USD',
  defaultLocale: 'en-US',
  timezone: 'America/New_York',
  description: '',
  ownerId: user.value?.id || '',
  templateId: '',
})

// Wizard state
const currentStep = ref(1)
const loading = ref(false)
const agreeToTerms = ref(false)
const showTermsError = ref(false)

// Steps configuration
const steps = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Business Details' },
  { id: 3, title: 'Configuration' },
  { id: 4, title: 'Review' },
]

// Validation errors
const errors = ref<Record<string, string>>({})

// Subdomain availability
const subdomainCheck = ref({
  checking: false,
  available: null as boolean | null,
  suggestions: [] as string[],
})

// Templates
const templates = ref<StoreTemplate[]>([])

// Computed
const progressPercentage = computed(() => (currentStep.value / steps.length) * 100)

const selectedTemplate = computed(() => 
  templates.value.find(t => t.id === formData.value.templateId)
)

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.name && 
             formData.value.subdomain && 
             subdomainCheck.value.available === true &&
             !errors.value.name && 
             !errors.value.subdomain
    case 2:
      return formData.value.email && 
             formData.value.currencyCode && 
             formData.value.defaultLocale &&
             !errors.value.email &&
             !errors.value.currencyCode &&
             !errors.value.defaultLocale
    case 3:
      return formData.value.timezone && !errors.value.timezone
    default:
      return true
  }
})

const canCreateStore = computed(() => 
  canProceedToNext.value && agreeToTerms.value && !loading.value
)

// Debounced subdomain check
const debouncedSubdomainCheck = useDebounce(async (subdomain: string) => {
  if (!subdomain || subdomain.length < 3) return
  
  subdomainCheck.value.checking = true
  try {
    const result = await storesStore.checkSubdomainAvailability(subdomain)
    subdomainCheck.value.available = result.isAvailable
    subdomainCheck.value.suggestions = result.suggestions || []
    
    if (!result.isAvailable) {
      errors.value.subdomain = 'This subdomain is not available'
    } else {
      delete errors.value.subdomain
    }
  } catch (error) {
    subdomainCheck.value.available = null
  } finally {
    subdomainCheck.value.checking = false
  }
}, 500)

// Methods
const getStepColor = (step: number): string => {
  if (currentStep.value > step) return 'green.500'
  if (currentStep.value === step) return 'blue.500'
  return 'gray.300'
}

const getStepTextColor = (step: number): string => {
  if (currentStep.value >= step) return 'gray.900'
  return 'gray.500'
}

const getAvailabilityColor = (): string => {
  if (subdomainCheck.value.checking) return 'blue.500'
  if (subdomainCheck.value.available === true) return 'green.500'
  if (subdomainCheck.value.available === false) return 'red.500'
  return 'gray.500'
}

const getAvailabilityText = (): string => {
  if (subdomainCheck.value.checking) return 'Checking availability...'
  if (subdomainCheck.value.available === true) return 'Available'
  if (subdomainCheck.value.available === false) return 'Not available'
  return 'Enter a subdomain to check availability'
}

const handleSubdomainInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  formData.value.subdomain = sanitized
  
  if (sanitized !== value) {
    // Update the input value
    ;(event.target as HTMLInputElement).value = sanitized
  }
  
  // Reset availability check
  subdomainCheck.value.available = null
  subdomainCheck.value.suggestions = []
  delete errors.value.subdomain
  
  // Check availability
  if (sanitized.length >= 3) {
    debouncedSubdomainCheck(sanitized)
  }
}

const selectSuggestion = (suggestion: string) => {
  formData.value.subdomain = suggestion
  debouncedSubdomainCheck(suggestion)
}

const selectTemplate = (templateId: string) => {
  formData.value.templateId = formData.value.templateId === templateId ? '' : templateId
}

const validateField = (field: keyof CreateStoreDto) => {
  delete errors.value[field]
  
  switch (field) {
    case 'name':
      if (!formData.value.name) {
        errors.value.name = 'Store name is required'
      } else if (formData.value.name.length < 2) {
        errors.value.name = 'Store name must be at least 2 characters'
      }
      break
    case 'subdomain':
      if (!formData.value.subdomain) {
        errors.value.subdomain = 'Subdomain is required'
      } else if (formData.value.subdomain.length < 3) {
        errors.value.subdomain = 'Subdomain must be at least 3 characters'
      } else if (!/^[a-z0-9-]+$/.test(formData.value.subdomain)) {
        errors.value.subdomain = 'Subdomain can only contain letters, numbers, and hyphens'
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

const nextStep = () => {
  if (canProceedToNext.value && currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createStore = async () => {
  if (!agreeToTerms.value) {
    showTermsError.value = true
    return
  }

  loading.value = true
  try {
    const store = await storesStore.createStore(formData.value)
    if (store) {
      emit('created', store)
    }
  } catch (error) {
    console.error('Failed to create store:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  if (loading.value) return
  emit('close')
}

// Watchers
watch(() => formData.value.name, (newName) => {
  if (newName && !formData.value.subdomain) {
    // Auto-suggest subdomain based on store name
    const suggested = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20)
    formData.value.subdomain = suggested
    if (suggested.length >= 3) {
      debouncedSubdomainCheck(suggested)
    }
  }
})

watch(() => agreeToTerms.value, () => {
  showTermsError.value = false
})

// Lifecycle
onMounted(async () => {
  // Load templates
  await storesStore.fetchTemplates()
  templates.value = storesStore.state.value.templates
  
  // Set owner ID from current user
  if (user.value) {
    formData.value.ownerId = user.value.id
  }
})
</script>

<style scoped>
.progress-section {
  @apply pb-6 border-b border-gray-200;
}

.progress-step {
  @apply flex flex-col items-center transition-all duration-200;
}

.progress-step.completed .circle {
  @apply bg-green-500;
}

.progress-step.active .circle {
  @apply bg-blue-500;
}

.progress-step.disabled .circle {
  @apply bg-gray-300;
}

.step-content {
  @apply animate-in fade-in duration-300;
}

.template-card {
  @apply p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200;
  @apply hover:border-blue-300 hover:shadow-sm;
}

.template-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.template-loading {
  @apply flex items-center justify-center py-8;
}

/* Animation for step transitions */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fade-in 0.3s ease-out;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->