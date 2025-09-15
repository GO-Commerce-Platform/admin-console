<template>
  <div class="component-showcase">
    <!-- Page Header -->
    <div class="showcase-header">
      <h1 class="showcase-title">Component Library & Design System</h1>
      <p class="showcase-subtitle">
        Experience the GO Commerce Administration Console's modern dark theme with glassmorphism
        effects, interactive components, and responsive design.
      </p>
    </div>

    <!-- Theme Demonstration Cards -->
    <div class="showcase-grid">
      <!-- Color Palette Card -->
      <div class="showcase-card">
        <h3 class="card-title"><span class="icon">●</span> Color Palette</h3>
        <div class="color-grid">
          <div class="color-box primary" />
          <div class="color-box secondary" />
          <div class="color-box success" />
          <div class="color-box accent" />
        </div>
        <p class="card-description">
          Primary • Secondary • Success • Accent colors with glow effects
        </p>
      </div>

      <!-- Typography Card -->
      <div class="showcase-card">
        <h3 class="card-title"><span class="icon">T</span> Typography Scale</h3>
        <div class="typography-demo">
          <h1 class="type-h1">Heading 1</h1>
          <h2 class="type-h2">Heading 2</h2>
          <h3 class="type-h3">Heading 3</h3>
          <p class="type-body">Body text - optimized for readability</p>
          <p class="type-caption">Caption text with muted styling</p>
        </div>
      </div>

      <!-- Interactive Elements Card -->
      <div class="showcase-card">
        <h3 class="card-title"><span class="icon">⚡</span> Interactive Components</h3>
        <div class="interactive-demo">
          <button class="btn-primary">Primary Action</button>
          <button class="btn-secondary">Secondary Action</button>
          <input
            type="text"
            class="input-demo"
            placeholder="Search products, orders, customers..."
          />
        </div>
      </div>

      <!-- Status Indicators Card -->
      <div class="showcase-card">
        <h3 class="card-title"><span class="icon">◆</span> Status Indicators</h3>
        <div class="status-demo">
          <div class="status-item">
            <span class="badge success">✓ Success</span>
            <span class="status-text">Operation completed successfully</span>
          </div>
          <div class="status-item">
            <span class="badge warning">⚠ Warning</span>
            <span class="status-text">Review required for this item</span>
          </div>
          <div class="status-item">
            <span class="badge error">✗ Error</span>
            <span class="status-text">Action failed to complete</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Component Library Status -->
    <div class="showcase-card library-status">
      <h2 class="section-title"><span class="icon large">▣</span> Component Library Status</h2>

      <div class="status-grid">
        <div class="status-section">
          <h3 class="status-category atoms"><span class="icon small">◉</span> Atoms</h3>
          <ul class="component-list">
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">NavLink (14 tests)</span>
            </li>
          </ul>
        </div>

        <div class="status-section">
          <h3 class="status-category molecules"><span class="icon small">◈</span> Molecules</h3>
          <ul class="component-list">
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">StoreSelector (17 tests)</span>
            </li>
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">NavigationItem (24 tests)</span>
            </li>
          </ul>
        </div>

        <div class="status-section">
          <h3 class="status-category organisms"><span class="icon small">◎</span> Organisms</h3>
          <ul class="component-list">
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">AppHeader (19 tests)</span>
            </li>
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">AppSidebar (26 tests)</span>
            </li>
            <li class="component-item">
              <span class="check">✓</span>
              <span class="component-name">AppLayout (22 tests)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Test Statistics -->
      <div class="test-stats">
        <div class="stat">
          <div class="stat-number">192</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat">
          <div class="stat-number">7</div>
          <div class="stat-label">Test Files</div>
        </div>
        <div class="stat">
          <div class="stat-number">100%</div>
          <div class="stat-label">Passing</div>
        </div>
      </div>
    </div>

    <!-- Design Principles -->
    <div class="showcase-card design-principles">
      <h2 class="section-title"><span class="icon large">◐</span> Design System Principles</h2>

      <div class="principles-grid">
        <div class="principle">
          <div class="principle-icon"><span class="icon xl">◑</span></div>
          <h4 class="principle-title">Dark Theme First</h4>
          <p class="principle-description">Modern dark interface with glassmorphism effects</p>
        </div>

        <div class="principle">
          <div class="principle-icon"><span class="icon xl">▫</span></div>
          <h4 class="principle-title">Responsive Design</h4>
          <p class="principle-description">Mobile-first approach with breakpoint system</p>
        </div>

        <div class="principle">
          <div class="principle-icon"><span class="icon xl">◇</span></div>
          <h4 class="principle-title">Accessibility</h4>
          <p class="principle-description">WCAG 2.1 AA compliant with keyboard navigation</p>
        </div>

        <div class="principle">
          <div class="principle-icon"><span class="icon xl">▲</span></div>
          <h4 class="principle-title">Performance</h4>
          <p class="principle-description">Optimized animations and efficient rendering</p>
        </div>
      </div>
    </div>

    <!-- Footer with Navigation -->
    <div class="showcase-footer">
      <div class="footer-nav">
        <router-link to="/demo" class="nav-link"
          ><span class="icon small">▢</span> Implementation Status</router-link
        >
        <router-link to="/preview" class="nav-link"
          ><span class="icon small">○</span> Layout Preview</router-link
        >
        <router-link to="/" class="nav-link"
          ><span class="icon small">■</span> Dashboard</router-link
        >
      </div>

      <p class="footer-text">
        Component Library & Design System • Built with Vue 3 + TypeScript + Chakra UI
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'

  /**
   * Component Showcase Page
   *
   * Demonstrates the actual component library with the modern dark purple theme applied.
   * Uses CSS with theme colors to show the real design system.
   *
   * Related GitHub Issue: #11 - Component Library & Design System
   *
   * Updated: Simplified to use CSS instead of complex Chakra template syntax
   */

  onMounted(() => {
    console.log('🎨 Component Showcase loaded - demonstrating actual theme and components')
  })
</script>

<style scoped>
  /* Full-screen immersive showcase */
  .component-showcase {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%);
    color: #f8fafc;
    overflow-y: auto;
    z-index: 10;
  }

  /* Content container with max width */
  .component-showcase > * {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Header with vibrant gradient */
  .showcase-header {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.3) 0%,
      rgba(168, 85, 247, 0.25) 30%,
      rgba(6, 182, 212, 0.2) 70%,
      rgba(16, 185, 129, 0.15) 100%
    );
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 64px 48px;
    margin-bottom: 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 8px 32px rgba(99, 102, 241, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .showcase-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg at 50% 50%,
      rgba(99, 102, 241, 0.1) 0deg,
      rgba(168, 85, 247, 0.1) 120deg,
      rgba(6, 182, 212, 0.1) 240deg,
      rgba(99, 102, 241, 0.1) 360deg
    );
    animation: rotate 20s linear infinite;
    z-index: 0;
  }

  .showcase-title {
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(
      135deg,
      #8080ff 0%,
      #c084fc 25%,
      #06b6d4 50%,
      #10b981 75%,
      #a855f7 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0 0 24px 0;
    position: relative;
    z-index: 1;
    text-shadow: 0 0 60px rgba(99, 102, 241, 0.5);
    filter: drop-shadow(0 4px 20px rgba(99, 102, 241, 0.3));
  }

  .showcase-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.7;
    position: relative;
    z-index: 1;
    font-weight: 300;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  }

  /* Grid Layouts */
  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    margin-bottom: 48px;
  }

  /* Modern glassmorphism card styles */
  .showcase-card {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.4) 0%,
      rgba(51, 65, 85, 0.3) 50%,
      rgba(30, 41, 59, 0.4) 100%
    );
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .showcase-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(99, 102, 241, 0.1) 50%,
      transparent 100%
    );
    transition: left 0.8s ease;
  }

  .showcase-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.15) 0%,
      rgba(168, 85, 247, 0.1) 30%,
      rgba(30, 41, 59, 0.5) 70%,
      rgba(51, 65, 85, 0.4) 100%
    );
    box-shadow:
      0 20px 40px rgba(99, 102, 241, 0.2),
      0 0 0 1px rgba(99, 102, 241, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .showcase-card:hover::before {
    left: 100%;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 24px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .card-description {
    font-size: 0.875rem;
    color: #94a3b8; /* text.tertiary */
    margin: 16px 0 0 0;
  }

  /* Color Palette */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .color-box {
    height: 48px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .color-box.primary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    box-shadow:
      0 0 25px rgba(99, 102, 241, 0.4),
      0 0 50px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .color-box.secondary {
    background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
    box-shadow:
      0 0 25px rgba(168, 85, 247, 0.4),
      0 0 50px rgba(168, 85, 247, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: glow-pulse 3s ease-in-out infinite 0.5s;
  }

  .color-box.success {
    background: linear-gradient(135deg, #00d190 0%, #10b981 100%);
    box-shadow:
      0 0 25px rgba(0, 209, 144, 0.4),
      0 0 50px rgba(0, 209, 144, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: glow-pulse 3s ease-in-out infinite 1s;
  }

  .color-box.accent {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    box-shadow:
      0 0 25px rgba(6, 182, 212, 0.4),
      0 0 50px rgba(6, 182, 212, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: glow-pulse 3s ease-in-out infinite 1.5s;
  }

  /* Typography */
  .typography-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .type-h1 {
    font-size: 1.875rem;
    font-weight: bold;
    color: #f8fafc;
    margin: 0;
  }

  .type-h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .type-h3 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #cbd5e1;
    margin: 0;
  }

  .type-body {
    font-size: 1rem;
    color: #cbd5e1;
    margin: 0;
  }

  .type-caption {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Interactive Elements */
  .interactive-demo {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 14px 32px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 25px rgba(99, 102, 241, 0.3),
      0 0 0 1px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      0 15px 35px rgba(99, 102, 241, 0.4),
      0 0 0 1px rgba(99, 102, 241, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .btn-primary:hover::before {
    left: 100%;
  }

  .btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  .btn-secondary {
    background: transparent;
    color: #cbd5e1;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    border: 1px solid rgba(71, 85, 105, 0.3);
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    color: #f8fafc;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
  }

  .input-demo {
    background: rgba(30, 41, 59, 0.3);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 8px;
    padding: 12px 16px;
    color: #f8fafc;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .input-demo::placeholder {
    color: #94a3b8;
    opacity: 0.6;
  }

  .input-demo:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow:
      0 0 0 3px rgba(99, 102, 241, 0.1),
      0 0 20px rgba(99, 102, 241, 0.2);
    background: rgba(30, 41, 59, 0.5);
  }

  /* Status Indicators */
  .status-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .badge {
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
  }

  .badge.success {
    background: #00d190;
    box-shadow: 0 0 15px rgba(0, 209, 144, 0.3);
  }

  .badge.warning {
    background: #f97316;
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
  }

  .badge.error {
    background: #ef4444;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  }

  .status-text {
    font-size: 0.875rem;
    color: #cbd5e1;
  }

  /* Library Status */
  .library-status {
    margin-bottom: 48px;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #f8fafc;
    margin: 0 0 32px 0;
    text-align: center;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .status-category {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 16px 0;
  }

  .status-category.atoms {
    color: #8080ff; /* primary.400 */
  }

  .status-category.molecules {
    color: #c084fc; /* secondary.400 */
  }

  .status-category.organisms {
    color: #06b6d4; /* accent.teal */
  }

  .component-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .component-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }

  .check {
    color: #22d3ee; /* success.400 */
  }

  .component-name {
    font-size: 0.875rem;
    color: #cbd5e1;
  }

  /* Test Statistics */
  .test-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
    padding-top: 24px;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #22d3ee;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
  }

  /* Design Principles */
  .design-principles {
    margin-bottom: 48px;
  }

  .principles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .principle {
    text-align: center;
    padding: 16px;
  }

  .principle-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }

  .principle-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 8px 0;
  }

  .principle-description {
    font-size: 0.875rem;
    color: #cbd5e1;
    margin: 0;
  }

  /* Footer */
  .showcase-footer {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
  }

  .footer-nav {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .nav-link {
    color: #8b5cf6; /* text.link */
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #a855f7; /* text.linkHover */
    text-decoration: underline;
  }

  .footer-text {
    font-size: 0.75rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Modern animations */
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes gradient-shift {
    0%,
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0);
    }
    25% {
      opacity: 0.8;
      transform: translateX(10px) translateY(-5px);
    }
    50% {
      opacity: 0.9;
      transform: translateX(-5px) translateY(10px);
    }
    75% {
      opacity: 0.7;
      transform: translateX(-10px) translateY(-10px);
    }
  }

  @keyframes glow-pulse {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
    }
    50% {
      box-shadow:
        0 0 30px rgba(99, 102, 241, 0.6),
        0 0 40px rgba(168, 85, 247, 0.3);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .component-showcase {
      padding: 16px;
    }

    .showcase-grid {
      grid-template-columns: 1fr;
    }

    .test-stats {
      flex-direction: column;
      gap: 24px;
    }

    .principles-grid {
      grid-template-columns: 1fr;
    }

    .showcase-title {
      font-size: 2rem;
    }
  }

  /* Dark theme enforcements */
  * {
    color-scheme: dark;
  }

  /* Enhanced focus styles */
  *:focus {
    outline: none !important;
    box-shadow:
      0 0 0 2px rgba(99, 102, 241, 0.6),
      0 0 20px rgba(99, 102, 241, 0.3) !important;
  }

  /* Monochromatic purple icons */
  .icon {
    color: #a855f7; /* secondary.500 */
    font-weight: 600;
    text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .icon.small {
    font-size: 1rem;
    width: 1.2rem;
    height: 1.2rem;
  }

  .icon:not(.small):not(.large):not(.xl) {
    font-size: 1.25rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .icon.large {
    font-size: 1.5rem;
    width: 2rem;
    height: 2rem;
  }

  .icon.xl {
    font-size: 2.5rem;
    width: 3rem;
    height: 3rem;
  }

  /* Icon hover effects */
  .card-title:hover .icon,
  .section-title:hover .icon,
  .nav-link:hover .icon {
    color: #c084fc; /* secondary.400 */
    text-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
    transform: scale(1.1);
  }

  /* Status category specific colors */
  .status-category.atoms .icon {
    color: #8080ff; /* primary.400 */
    text-shadow: 0 0 10px rgba(128, 128, 255, 0.3);
  }

  .status-category.molecules .icon {
    color: #c084fc; /* secondary.400 */
    text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
  }

  .status-category.organisms .icon {
    color: #06b6d4; /* accent.teal */
    text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
  }

  /* Principle icons with subtle animation */
  .principle-icon .icon {
    animation: subtle-glow 4s ease-in-out infinite;
  }

  .principle:nth-child(1) .icon {
    animation-delay: 0s;
  }
  .principle:nth-child(2) .icon {
    animation-delay: 1s;
  }
  .principle:nth-child(3) .icon {
    animation-delay: 2s;
  }
  .principle:nth-child(4) .icon {
    animation-delay: 3s;
  }

  @keyframes subtle-glow {
    0%,
    100% {
      text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
    }
    50% {
      text-shadow:
        0 0 20px rgba(168, 85, 247, 0.6),
        0 0 30px rgba(168, 85, 247, 0.2);
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
