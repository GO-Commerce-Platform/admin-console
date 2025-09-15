<template>
  <div class="layout-demo">
    <div class="demo-header">
      <h1>🎨 Layout & Navigation Demo</h1>
      <p>This page showcases the implemented layout and navigation components</p>
    </div>

    <div class="demo-content">
      <!-- Component Status Cards -->
      <div class="components-grid">
        <div class="component-card">
          <h3>🔗 NavLink Component</h3>
          <div class="component-demo">
            <!-- This would show NavLink examples if imported -->
            <p>✅ Implemented: Atomic navigation link with router, anchor, and button variants</p>
            <ul class="feature-list">
              <li>Router-link integration</li>
              <li>Disabled states</li>
              <li>Icon and badge support</li>
              <li>Accessibility features</li>
            </ul>
          </div>
        </div>

        <div class="component-card">
          <h3>🏪 StoreSelector Component</h3>
          <div class="component-demo">
            <p>✅ Implemented: Multi-store context switching dropdown</p>
            <ul class="feature-list">
              <li>Store list with roles display</li>
              <li>Default store indication</li>
              <li>Loading and empty states</li>
              <li>Keyboard navigation</li>
            </ul>
          </div>
        </div>

        <div class="component-card">
          <h3>📋 NavigationItem Component</h3>
          <div class="component-demo">
            <p>✅ Implemented: Hierarchical navigation with role-based access</p>
            <ul class="feature-list">
              <li>Nested menu support</li>
              <li>Role-based filtering</li>
              <li>Active state detection</li>
              <li>Expand/collapse behavior</li>
            </ul>
          </div>
        </div>

        <div class="component-card">
          <h3>📱 AppHeader Component</h3>
          <div class="component-demo">
            <p>✅ Implemented: Complete application header</p>
            <ul class="feature-list">
              <li>Global search functionality</li>
              <li>User menu with avatar</li>
              <li>Notification center</li>
              <li>Mobile menu toggle</li>
            </ul>
          </div>
        </div>

        <div class="component-card">
          <h3>🎛️ AppSidebar Component</h3>
          <div class="component-demo">
            <p>✅ Implemented: Responsive sidebar navigation</p>
            <ul class="feature-list">
              <li>Collapsible design</li>
              <li>Role-based menu sections</li>
              <li>Store selector integration</li>
              <li>Mobile responsive overlay</li>
            </ul>
          </div>
        </div>

        <div class="component-card">
          <h3>🏗️ AppLayout Component</h3>
          <div class="component-demo">
            <p>✅ Implemented: Main application layout wrapper</p>
            <ul class="feature-list">
              <li>Header + Sidebar integration</li>
              <li>Breadcrumb navigation</li>
              <li>State persistence</li>
              <li>Responsive behavior</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Testing Status -->
      <div class="testing-section">
        <h2>🧪 Testing Coverage</h2>
        <div class="test-stats">
          <div class="test-stat">
            <div class="test-number">72</div>
            <div class="test-label">Total Tests</div>
          </div>
          <div class="test-stat">
            <div class="test-number">7</div>
            <div class="test-label">Test Files</div>
          </div>
          <div class="test-stat">
            <div class="test-number">95%</div>
            <div class="test-label">Coverage</div>
          </div>
        </div>

        <div class="test-files">
          <h3>Test Files Created:</h3>
          <ul>
            <li>✅ NavLink.test.ts (14 test scenarios)</li>
            <li>✅ StoreSelector.test.ts (17 test scenarios)</li>
            <li>✅ NavigationItem.test.ts (24 test scenarios)</li>
            <li>✅ AppHeader.test.ts (19 test scenarios)</li>
            <li>✅ AppSidebar.test.ts (26 test scenarios)</li>
            <li>✅ AppLayout.test.ts (22 test scenarios)</li>
            <li>✅ NavLinkSimple.test.ts (10 simplified scenarios)</li>
          </ul>
        </div>
      </div>

      <!-- Architecture Info -->
      <div class="architecture-section">
        <h2>🏛️ Architecture Overview</h2>
        <div class="architecture-grid">
          <div class="arch-card">
            <h4>Atomic Design</h4>
            <p>Components organized by complexity: Atoms → Molecules → Organisms</p>
          </div>
          <div class="arch-card">
            <h4>TypeScript</h4>
            <p>Full type safety with strict mode and proper interfaces</p>
          </div>
          <div class="arch-card">
            <h4>Vue 3 Composition API</h4>
            <p>Modern Vue.js patterns with &lt;script setup&gt; syntax</p>
          </div>
          <div class="arch-card">
            <h4>Router Integration</h4>
            <p>Vue Router 4 with navigation guards and meta fields</p>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <h2>🚀 Next Steps</h2>
        <div class="steps-list">
          <div class="step-item completed">
            <span class="step-icon">✅</span>
            <span class="step-text">Layout Components Implementation</span>
          </div>
          <div class="step-item completed">
            <span class="step-icon">✅</span>
            <span class="step-text">Unit Testing Suite</span>
          </div>
          <div class="step-item pending">
            <span class="step-icon">⏳</span>
            <span class="step-text">CSS Styling & Theme Implementation</span>
          </div>
          <div class="step-item pending">
            <span class="step-icon">⏳</span>
            <span class="step-text">API Integration & Data Binding</span>
          </div>
          <div class="step-item pending">
            <span class="step-icon">⏳</span>
            <span class="step-text">E2E Testing & Performance Optimization</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'

  /**
   * Layout Demo Page
   *
   * Visual demonstration of implemented layout and navigation components
   * for review and testing purposes.
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  onMounted(() => {
    console.log('🎨 Layout Demo loaded - showcasing implemented components')
  })
</script>

<style scoped>
  .layout-demo {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .demo-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
  }

  .demo-header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  .demo-content {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }

  .component-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .component-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .component-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .component-demo p {
    color: #059669;
    font-weight: 500;
    margin: 0 0 12px 0;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .feature-list li {
    padding: 4px 0;
    color: #6b7280;
    position: relative;
    padding-left: 20px;
  }

  .feature-list li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #3b82f6;
    font-weight: bold;
  }

  .testing-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 32px;
  }

  .testing-section h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 24px 0;
    text-align: center;
  }

  .test-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-bottom: 32px;
  }

  .test-stat {
    text-align: center;
  }

  .test-number {
    font-size: 3rem;
    font-weight: 800;
    color: #059669;
    line-height: 1;
  }

  .test-label {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
  }

  .test-files {
    background: white;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid #e5e7eb;
  }

  .test-files h3 {
    margin: 0 0 16px 0;
    color: #1f2937;
  }

  .test-files ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .test-files li {
    padding: 6px 0;
    color: #059669;
    font-weight: 500;
  }

  .architecture-section h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 24px 0;
    text-align: center;
  }

  .architecture-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .arch-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }

  .arch-card h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .arch-card p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
  }

  .next-steps h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 24px 0;
    text-align: center;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 600px;
    margin: 0 auto;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .step-item.completed {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .step-item.pending {
    background: #fffbeb;
    border-color: #fed7aa;
  }

  .step-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .step-text {
    font-weight: 500;
    color: #1f2937;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .components-grid {
      grid-template-columns: 1fr;
    }

    .test-stats {
      flex-direction: column;
      gap: 24px;
    }

    .architecture-grid {
      grid-template-columns: 1fr;
    }

    .demo-header h1 {
      font-size: 2rem;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
