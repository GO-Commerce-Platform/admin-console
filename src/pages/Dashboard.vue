<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome to the GO Commerce administration console</p>
    </div>

    <div class="dashboard-content">
      <!-- Status Card -->
      <div class="status-card success">
        <h3>✅ System Status</h3>
        <p>All systems operational - Simple frontend version running!</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Orders</h4>
          <div class="stat-number">1,234</div>
        </div>
        <div class="stat-card">
          <h4>Active Users</h4>
          <div class="stat-number">567</div>
        </div>
        <div class="stat-card">
          <h4>Revenue</h4>
          <div class="stat-number">$12,345</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn primary">View Orders</button>
          <button class="action-btn secondary">Manage Products</button>
          <button class="action-btn secondary">View Reports</button>
          <button class="action-btn secondary">Settings</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'

  /**
   * Dashboard Page Component - Simplified Version
   * Related GitHub Issue: #2 - Authentication System & Security
   */

  onMounted(() => {
    console.log('Dashboard loaded')
  })
</script>

<style scoped>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    margin-bottom: 32px;
  }

  .dashboard-header h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    color: #2c3e50;
    font-weight: 600;
  }

  .dashboard-header p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }

  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .status-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status-card.success {
    border-left: 4px solid #4caf50;
    background: #f9fbe7;
  }

  .status-card h3 {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 18px;
  }

  .status-card p {
    margin: 0;
    color: #666;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stat-card h4 {
    margin: 0 0 12px 0;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
  }

  .actions-section h3 {
    margin: 0 0 16px 0;
    color: #2c3e50;
    font-size: 20px;
    font-weight: 600;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .action-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: #1976d2;
    color: white;
  }

  .action-btn.primary:hover {
    background: #1565c0;
    transform: translateY(-1px);
  }

  .action-btn.secondary {
    background: #f5f5f5;
    color: #666;
    border: 1px solid #e0e0e0;
  }

  .action-btn.secondary:hover {
    background: #eeeeee;
    color: #1976d2;
    border-color: #1976d2;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
