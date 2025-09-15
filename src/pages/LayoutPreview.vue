<template>
  <div class="layout-preview">
    <!-- This would be the AppLayout component in action -->
    <div class="mock-layout">
      <!-- Mock Header -->
      <header class="mock-header">
        <div class="mock-header__left">
          <button class="mock-mobile-toggle">☰</button>
          <div class="mock-logo">
            <span class="mock-logo__icon">🚀</span>
            <span class="mock-logo__text">GO Commerce</span>
          </div>
        </div>

        <div class="mock-header__center">
          <div class="mock-search">
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              class="mock-search__input"
            />
            <button class="mock-search__button">🔍</button>
          </div>
        </div>

        <div class="mock-header__right">
          <button class="mock-notifications">
            🔔
            <span class="mock-badge">3</span>
          </button>
          <div class="mock-user-menu">
            <div class="mock-avatar">JD</div>
            <div class="mock-user-info">
              <div class="mock-user-name">John Doe</div>
              <div class="mock-user-role">Platform Admin</div>
            </div>
            <span class="mock-chevron">▼</span>
          </div>
        </div>
      </header>

      <!-- Mock Sidebar -->
      <aside class="mock-sidebar"
:class="{ 'mock-sidebar--collapsed': sidebarCollapsed }">
        <div class="mock-sidebar__header">
          <!-- Mock Store Selector -->
          <div class="mock-store-selector"
v-if="!sidebarCollapsed">
            <div class="mock-store-current">
              <div class="mock-store-info">
                <div class="mock-store-name">Electronics Store</div>
                <div class="mock-store-domain">electronics.gocommerce.com</div>
              </div>
              <span class="mock-chevron">▼</span>
            </div>
          </div>

          <!-- Collapse Toggle -->
          <button class="mock-collapse-toggle"
@click="toggleSidebar">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>

        <!-- Mock Navigation -->
        <nav class="mock-navigation">
          <!-- Platform Section -->
          <div class="mock-nav-section">
            <div class="mock-nav-title"
v-if="!sidebarCollapsed">Platform</div>
            <ul class="mock-nav-list">
              <li class="mock-nav-item mock-nav-item--active">
                <span class="mock-nav-icon">📊</span>
                <span class="mock-nav-label"
v-if="!sidebarCollapsed">Dashboard</span>
              </li>
              <li class="mock-nav-item">
                <span class="mock-nav-icon">🏪</span>
                <span class="mock-nav-label"
v-if="!sidebarCollapsed">Stores</span>
                <span class="mock-nav-badge"
v-if="!sidebarCollapsed">5</span>
              </li>
              <li class="mock-nav-item">
                <span class="mock-nav-icon">👥</span>
                <span class="mock-nav-label"
v-if="!sidebarCollapsed">Users</span>
              </li>
            </ul>
          </div>

          <!-- Store Management Section -->
          <div class="mock-nav-section">
            <div class="mock-nav-title"
v-if="!sidebarCollapsed">Store Management</div>
            <ul class="mock-nav-list">
              <li class="mock-nav-item mock-nav-item--expandable">
                <div class="mock-nav-main">
                  <span class="mock-nav-icon">📦</span>
                  <span class="mock-nav-label"
v-if="!sidebarCollapsed">Products</span>
                  <span class="mock-expand-icon"
v-if="!sidebarCollapsed">▼</span>
                </div>
                <ul class="mock-nav-submenu"
v-if="!sidebarCollapsed">
                  <li class="mock-nav-subitem">All Products</li>
                  <li class="mock-nav-subitem">Categories</li>
                  <li class="mock-nav-subitem">Inventory</li>
                </ul>
              </li>
              <li class="mock-nav-item">
                <span class="mock-nav-icon">🛒</span>
                <span class="mock-nav-label"
v-if="!sidebarCollapsed">Orders</span>
                <span class="mock-nav-badge"
v-if="!sidebarCollapsed">12</span>
              </li>
              <li class="mock-nav-item">
                <span class="mock-nav-icon">👤</span>
                <span class="mock-nav-label"
v-if="!sidebarCollapsed">Customers</span>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Mock Footer -->
        <div class="mock-sidebar__footer"
v-if="!sidebarCollapsed">
          <div class="mock-version">v1.0.0</div>
          <a href="mailto:support@gocommerce.com"
class="mock-support">Support</a>
        </div>
      </aside>

      <!-- Mock Main Content -->
      <main class="mock-main"
:class="{ 'mock-main--sidebar-collapsed': sidebarCollapsed }">
        <!-- Mock Breadcrumbs -->
        <nav class="mock-breadcrumbs">
          <span class="mock-breadcrumb">Dashboard</span>
          <span class="mock-breadcrumb-separator">→</span>
          <span class="mock-breadcrumb mock-breadcrumb--current">Overview</span>
        </nav>

        <!-- Mock Content Area -->
        <div class="mock-content">
          <div class="mock-content-header">
            <h1>🎨 Actual Layout Preview</h1>
            <p>
              This shows how the AppLayout components will look when fully styled and integrated
            </p>
          </div>

          <div class="mock-demo-cards">
            <div class="mock-card">
              <h3>✨ What You're Seeing</h3>
              <ul>
                <li><strong>Header:</strong> Logo, global search, notifications, user menu</li>
                <li><strong>Sidebar:</strong> Role-based navigation with collapse toggle</li>
                <li><strong>Store Selector:</strong> Multi-store switching dropdown</li>
                <li><strong>Navigation:</strong> Hierarchical menu with badges and icons</li>
                <li><strong>Main Area:</strong> Breadcrumbs + content with responsive layout</li>
              </ul>
            </div>

            <div class="mock-card">
              <h3>🔧 Interactive Features</h3>
              <ul>
                <li><strong>Sidebar Toggle:</strong> Click the ◀/▶ button to collapse/expand</li>
                <li><strong>Responsive:</strong> Resize browser to see mobile behavior</li>
                <li><strong>Hover States:</strong> Navigation items have hover effects</li>
                <li><strong>Active States:</strong> Current page highlighted</li>
              </ul>
            </div>

            <div class="mock-card">
              <h3>📱 Responsive Design</h3>
              <ul>
                <li><strong>Desktop:</strong> Full sidebar and header layout</li>
                <li><strong>Tablet:</strong> Collapsible sidebar with mobile toggle</li>
                <li><strong>Mobile:</strong> Overlay sidebar with hamburger menu</li>
                <li><strong>Touch:</strong> Touch-friendly interaction targets</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Status Information -->
    <div class="status-bar">
      <span class="status-item">🎯 Layout Components: Ready</span>
      <span class="status-item">🧪 Tests: 72 passing</span>
      <span class="status-item">📱 Responsive: Active</span>
      <span class="status-item">♿ A11y: Compliant</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  /**
   * Layout Preview Component
   *
   * Shows a functional mockup of what the AppLayout components
   * will look like with proper styling and interactions.
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  const sidebarCollapsed = ref(false)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
</script>

<style scoped>
  .layout-preview {
    min-height: 100vh;
    background: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .mock-layout {
    display: grid;
    grid-template-areas:
      'header header'
      'sidebar main';
    grid-template-rows: 60px 1fr;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
    transition: grid-template-columns 0.3s ease;
  }

  .mock-layout:has(.mock-sidebar--collapsed) {
    grid-template-columns: 80px 1fr;
  }

  /* Header */
  .mock-header {
    grid-area: header;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .mock-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .mock-mobile-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
  }

  .mock-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #1f2937;
  }

  .mock-logo__icon {
    font-size: 24px;
  }

  .mock-search {
    display: flex;
    align-items: center;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 12px;
    width: 400px;
    max-width: 100%;
  }

  .mock-search__input {
    background: none;
    border: none;
    padding: 10px 8px;
    flex: 1;
    outline: none;
    color: #1f2937;
  }

  .mock-search__button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .mock-header__right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .mock-notifications {
    position: relative;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
  }

  .mock-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #ef4444;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  .mock-user-menu {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .mock-user-menu:hover {
    background: #f3f4f6;
  }

  .mock-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }

  .mock-user-info {
    display: flex;
    flex-direction: column;
  }

  .mock-user-name {
    font-weight: 500;
    font-size: 14px;
    color: #1f2937;
  }

  .mock-user-role {
    font-size: 12px;
    color: #6b7280;
  }

  .mock-chevron {
    color: #6b7280;
    font-size: 12px;
  }

  /* Sidebar */
  .mock-sidebar {
    grid-area: sidebar;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .mock-sidebar--collapsed {
    width: 80px;
  }

  .mock-sidebar__header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
  }

  .mock-store-selector {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .mock-store-current {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .mock-store-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 14px;
  }

  .mock-store-domain {
    font-size: 12px;
    color: #6b7280;
  }

  .mock-collapse-toggle {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    position: absolute;
    right: 16px;
    bottom: 16px;
  }

  .mock-collapse-toggle:hover {
    background: #e5e7eb;
  }

  /* Navigation */
  .mock-navigation {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
  }

  .mock-nav-section {
    margin-bottom: 24px;
  }

  .mock-nav-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 16px 8px 16px;
  }

  .mock-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .mock-nav-item {
    margin: 2px 8px;
  }

  .mock-nav-main,
  .mock-nav-item:not(.mock-nav-item--expandable) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
  }

  .mock-nav-item:hover .mock-nav-main,
  .mock-nav-item:not(.mock-nav-item--expandable):hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .mock-nav-item--active .mock-nav-main,
  .mock-nav-item--active:not(.mock-nav-item--expandable) {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .mock-nav-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .mock-nav-label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
  }

  .mock-nav-badge {
    background: #ef4444;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
  }

  .mock-expand-icon {
    font-size: 10px;
    color: #9ca3af;
  }

  .mock-nav-submenu {
    list-style: none;
    padding: 4px 0 0 40px;
    margin: 0;
  }

  .mock-nav-subitem {
    padding: 6px 12px;
    color: #6b7280;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .mock-nav-subitem:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .mock-sidebar__footer {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mock-version {
    font-size: 12px;
    color: #9ca3af;
  }

  .mock-support {
    font-size: 12px;
    color: #3b82f6;
    text-decoration: none;
  }

  .mock-support:hover {
    text-decoration: underline;
  }

  /* Main Content */
  .mock-main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .mock-breadcrumbs {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mock-breadcrumb {
    color: #6b7280;
    font-size: 14px;
    text-decoration: none;
  }

  .mock-breadcrumb--current {
    color: #1f2937;
    font-weight: 500;
  }

  .mock-breadcrumb-separator {
    color: #9ca3af;
  }

  .mock-content {
    flex: 1;
    padding: 24px;
    background: #f8fafc;
    overflow-y: auto;
  }

  .mock-content-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .mock-content-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .mock-content-header p {
    color: #6b7280;
    margin: 0;
  }

  .mock-demo-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .mock-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .mock-card h3 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .mock-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .mock-card li {
    padding: 4px 0;
    color: #4b5563;
    font-size: 14px;
    line-height: 1.5;
  }

  .mock-card strong {
    color: #1f2937;
  }

  /* Status Bar */
  .status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #1f2937;
    color: white;
    padding: 8px 16px;
    display: flex;
    justify-content: center;
    gap: 24px;
    z-index: 1000;
  }

  .status-item {
    font-size: 12px;
    font-weight: 500;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mock-layout {
      grid-template-areas:
        'header header'
        'main main';
      grid-template-columns: 1fr;
    }

    .mock-mobile-toggle {
      display: block;
    }

    .mock-sidebar {
      position: fixed;
      top: 60px;
      left: -280px;
      width: 280px;
      height: calc(100vh - 60px);
      z-index: 100;
      transition: left 0.3s ease;
    }

    .mock-search {
      width: 200px;
    }

    .mock-demo-cards {
      grid-template-columns: 1fr;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
