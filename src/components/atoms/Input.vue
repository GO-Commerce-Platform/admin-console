<!-- 
  Input Atom Component
  
  A reusable input component with dark theme styling and glassmorphism effects
  for the GO Commerce Administration Console.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <CFormControl :isInvalid="!!error" :isRequired="required">
    <CFormLabel v-if="label" :htmlFor="inputId">
      {{ label }}
    </CFormLabel>
    <CInput
      :id="inputId"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :size="size"
      :isDisabled="disabled"
      :isReadOnly="readonly"
      :class="['gocommerce-input', glassClass]"
      v-bind="$attrs"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <CFormHelperText v-if="helper && !error">
      {{ helper }}
    </CFormHelperText>
    <CFormErrorMessage v-if="error">
      {{ error }}
    </CFormErrorMessage>
  </CFormControl>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import {
    CFormControl,
    CFormLabel,
    CInput,
    CFormHelperText,
    CFormErrorMessage,
  } from '@chakra-ui/vue-next'

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

  const emit = defineEmits<InputEmits>()

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

  /**
   * Computed Properties
   */
  const inputId = computed(() => {
    return `gocommerce-input-${Math.random().toString(36).substr(2, 9)}`
  })

  const glassClass = computed(() => {
    return props.glass ? 'chakra-glass' : ''
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
  .chakra-glass.gocommerce-input {
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
  }

  .chakra-glass.gocommerce-input:focus {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(99, 102, 241, 0.6);
  }
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->
