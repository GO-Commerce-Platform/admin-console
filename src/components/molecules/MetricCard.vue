<!-- 
  MetricCard Molecule Component
  
  A reusable metric display card with glassmorphism styling, trend indicators,
  and animated counters for dashboard KPIs.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <CBox
    :class="['metric-card', glassClass]"
    p="6"
    borderRadius="12px"
    border="1px solid"
    borderColor="border.light"
    bg="background.card"
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    cursor="pointer"
    _hover="hover"
    @click="handleClick"
  >
    <!-- Header with icon and trend -->
    <CFlex justify="space-between" align="flex-start" mb="4">
      <CBox>
        <!-- Icon -->
        <CBox
          v-if="icon"
          :bg="iconBg"
          p="2"
          borderRadius="8px"
          mb="3"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          <CIcon :name="icon" color="white" boxSize="5" />
        </CBox>
        
        <!-- Title -->
        <CText fontSize="sm" color="text.secondary" fontWeight="500">
          {{ title }}
        </CText>
      </CBox>
      
      <!-- Trend indicator -->
      <CFlex
        v-if="trend !== undefined"
        align="center"
        :color="trendColor"
        fontSize="sm"
        fontWeight="600"
      >
        <CIcon
          :name="trendIcon"
          boxSize="4"
          mr="1"
        />
        {{ Math.abs(trend) }}%
      </CFlex>
    </CFlex>
    
    <!-- Main metric value -->
    <CText
      fontSize="3xl"
      fontWeight="700"
      color="text.primary"
      lineHeight="1.2"
      mb="1"
    >
      <AnimatedNumber
        v-if="typeof value === 'number'"
        :value="value"
        :format="format"
        :duration="animationDuration"
      />
      <template v-else>{{ value }}</template>
    </CText>
    
    <!-- Subtitle/description -->
    <CText v-if="subtitle" fontSize="xs" color="text.tertiary">
      {{ subtitle }}
    </CText>
    
    <!-- Progress bar (optional) -->
    <CBox v-if="progress !== undefined" mt="4">
      <CProgress
        :value="progress"
        :max="progressMax"
        size="sm"
        borderRadius="full"
        bg="rgba(71, 85, 105, 0.3)"
        :sx="{
          '& > div': {
            bg: progressGradient,
          }
        }"
      />
      <CFlex justify="space-between" mt="1">
        <CText fontSize="xs" color="text.tertiary">
          {{ progressLabel || '0' }}
        </CText>
        <CText fontSize="xs" color="text.tertiary">
          {{ progressMax }}
        </CText>
      </CFlex>
    </CBox>
  </CBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CBox,
  CFlex,
  CText,
  CIcon,
  CProgress,
} from '@chakra-ui/vue-next'
import AnimatedNumber from './AnimatedNumber.vue'

/**
 * MetricCard Component Props
 */
interface MetricCardProps {
  /** Card title/label */
  title: string
  /** Main metric value */
  value: string | number
  /** Optional subtitle */
  subtitle?: string
  /** Icon name */
  icon?: string
  /** Icon background gradient */
  iconBg?: string
  /** Trend percentage (positive or negative) */
  trend?: number
  /** Value format for numbers */
  format?: 'currency' | 'percentage' | 'decimal' | 'integer'
  /** Progress value (0-100) */
  progress?: number
  /** Progress maximum value */
  progressMax?: number
  /** Progress label */
  progressLabel?: string
  /** Animation duration in ms */
  animationDuration?: number
  /** Enable glassmorphism effect */
  glass?: boolean
}

const props = withDefaults(defineProps<MetricCardProps>(), {
  format: 'integer',
  progressMax: 100,
  animationDuration: 1000,
  glass: true,
  iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
})

/**
 * MetricCard Component Events
 */
interface MetricCardEmits {
  /** Click event handler */
  (event: 'click'): void
}

const emit = defineEmits<MetricCardEmits>()

/**
 * Computed Properties
 */
const glassClass = computed(() => {
  return props.glass ? 'chakra-glass' : ''
})

const trendColor = computed(() => {
  if (props.trend === undefined) return 'text.secondary'
  return props.trend >= 0 ? 'accent.green' : 'accent.red'
})

const trendIcon = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'trending-up' : 'trending-down'
})

const progressGradient = computed(() => {
  if (props.progress === undefined) return ''
  if (props.progress >= 80) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
  if (props.progress >= 60) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
  return 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
})

/**
 * Event Handlers
 */
const handleClick = () => {
  emit('click')
}

/**
 * Hover styles
 */
const hover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2)',
  borderColor: 'rgba(99, 102, 241, 0.4)',
}
</script>

<style scoped>
.metric-card {
  /* Enhanced glassmorphism effect */
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(30, 41, 59, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.5),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover::before {
  opacity: 1;
}

/* Subtle animation on load */
.metric-card {
  animation: metric-card-entrance 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes metric-card-entrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .metric-card {
    padding: 1rem;
  }
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->