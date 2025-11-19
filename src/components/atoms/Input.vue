<!-- 
  Input Atom Component
  
  A reusable input component with dark theme styling and glassmorphism effects
  for the GO Commerce Administration Console.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <NFormItem
    :label="label"
    :validation-status="error ? 'error' : undefined"
    :feedback="error || helper"
    :required="required"
  >
    <NInput
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :size="naiveSize"
      :disabled="disabled"
      :readonly="readonly"
      :class="['gocommerce-input', glassClass]"
      v-bind="$attrs"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
  </NFormItem>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NFormItem, NInput } from 'naive-ui'

/**
 * Input Component Props
 */
interface InputProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Input label */
  label?: string
  /** Input placeholder */
  placeholder?: string
  /** Input size */
  size?: 'sm' | 'md' | 'lg'
  /** Required field indicator */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Readonly state */
  readonly?: boolean
  /** Helper text */
  helper?: string
  /** Error message */
  error?: string
  /** v-model value */
  modelValue?: string | number
  /** Enable glassmorphism effect */
  glass?: boolean
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  required: false,
  disabled: false,
  readonly: false,
  glass: false,
})

/**
 * Input Component Events
 */
interface InputEmits {
  /** v-model update event */
  (event: 'update:modelValue', value: string | number): void
  /** Input event */
  (event: 'input', payload: Event): void
  /** Blur event */
  (event: 'blur', payload: Event): void
  /** Focus event */
  (event: 'focus', payload: Event): void
}

const emit = defineEmits<InputEmits>()

/**
 * Computed Properties
 */
const naiveSize = computed(() => {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  }
  return sizeMap[props.size] || 'medium'
})

const glassClass = computed(() => {
  return props.glass ? 'naive-glass' : ''
})

/**
 * Event Handlers
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleBlur = (event: Event) => {
  emit('blur', event)
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}
</script>

<style scoped>
.gocommerce-input {
  /* Custom input styles are handled by theme */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.gocommerce-input:focus {
  transform: translateY(-1px);
  box-shadow: 
    0 0 0 2px rgba(99, 102, 241, 0.6),
    0 0 20px rgba(99, 102, 241, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Glassmorphism enhancement */
.naive-glass.gocommerce-input {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.naive-glass.gocommerce-input:focus {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.6);
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->