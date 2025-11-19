<!-- 
  MetricCard Molecule Component
  
  A reusable metric display card with glassmorphism styling, trend indicators,
  and animated counters for dashboard KPIs.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <NCard
    :class="['metric-card', glassClass]"
    size="medium"
    :bordered="true"
    @click="handleClick"
  >
    <!-- Header with icon and trend -->
    <NFlex justify="space-between" align="flex-start" :wrap="false" :size="16">
      <div>
        <!-- Icon -->
        <div
          v-if="icon"
          class="metric-card__icon"
          :style="{ background: iconBg }"
        >
          <NIcon size="20" color="#ffffff">
            <component :is="icon" />
          </NIcon>
        </div>

        <!-- Title -->
        <NText depth="3" strong>
          {{ title }}
        </NText>
      </div>

      <!-- Trend indicator -->
      <NFlex
        v-if="trend !== undefined"
        align="center"
        :wrap="false"
        :style="{ color: trendColor }"
      >
        <NIcon size="16">
          <component :is="trendIcon" />
        </NIcon>
        <NText strong style="margin-left: 4px;">{{ Math.abs(trend) }}%</NText>
      </NFlex>
    </NFlex>

    <!-- Main metric value -->
    <div class="metric-card__value">
      <AnimatedNumber
        v-if="typeof value === 'number'"
        :value="value"
        :format="format"
        :duration="animationDuration"
      />
      <template v-else>{{ value }}</template>
    </div>

    <!-- Subtitle/description -->
    <NText v-if="subtitle" depth="3">
      {{ subtitle }}
    </NText>

    <!-- Progress bar (optional) - custom implementation using divs to keep glassmorphism -->
    <div v-if="progress !== undefined" class="metric-card__progress">
      <div class="metric-card__progress-track">
        <div
          class="metric-card__progress-fill"
          :style="{ width: `${(progress / progressMax) * 100}%`, background: progressGradient }"
        />
      </div>
      <div class="metric-card__progress-labels">
        <NText depth="3" style="font-size: 12px;">{{ progressLabel || '0' }}</NText>
        <NText depth="3" style="font-size: 12px;">{{ progressMax }}</NText>
      </div>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NText, NIcon } from 'naive-ui'
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
  return props.glass ? 'naive-glass' : ''
})

const trendColor = computed(() => {
  if (props.trend === undefined) return '#94a3b8' // slate-400
  return props.trend >= 0 ? '#10b981' : '#ef4444' // emerald-500 : red-500
})

const trendIcon = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'TrendingUp' : 'TrendingDown'
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
.metric-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.metric-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.2;
  margin-bottom: 4px;
}

.metric-card__progress {
  margin-top: 16px;
}

.metric-card__progress-track {
  position: relative;
  height: 8px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 9999px;
  overflow: hidden;
}

.metric-card__progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.metric-card__progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->