<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-title">404</h1>
      <h2 class="not-found-subtitle">Page Not Found</h2>
      <p class="not-found-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <router-link to="/"
class="not-found-button"> ← Go Home </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 404 Not Found page component
</script>

<style scoped>
  .not-found-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .not-found-content {
    text-align: center;
    color: white;
    max-width: 500px;
  }

  .not-found-title {
    font-size: 6rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    line-height: 1;
  }

  .not-found-subtitle {
    font-size: 2rem;
    font-weight: 600;
    margin: 1rem 0;
    opacity: 0.9;
  }

  .not-found-description {
    font-size: 1.125rem;
    margin: 1.5rem 0 2rem 0;
    opacity: 0.8;
    line-height: 1.6;
  }

  .not-found-button {
    display: inline-block;
    background: white;
    color: #667eea;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .not-found-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    background: #f8f9fa;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .not-found-container {
      padding: 1rem;
    }

    .not-found-title {
      font-size: 4rem;
    }

    .not-found-subtitle {
      font-size: 1.5rem;
    }

    .not-found-description {
      font-size: 1rem;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
