/**
 * Minimal test to identify the rendering issue
 */

import { createApp } from 'vue'

// Create the most basic Vue app possible
const app = createApp({
  template: `
    <div>
      <h1>Test App Working!</h1>
      <p>If you see this, Vue is rendering correctly.</p>
    </div>
  `,
})

// Mount it
app.mount('#app')

console.log('Basic Vue app mounted')
