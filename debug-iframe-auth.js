// Debug script for iframe authentication
// Run this in the browser console on http://localhost:5173/login

console.log('🔧 Iframe Authentication Debug Script');

// Monitor all postMessage events
window.addEventListener('message', (event) => {
  console.log('📨 Received postMessage:', {
    origin: event.origin,
    data: event.data,
    source: event.source,
    timestamp: new Date().toISOString()
  });
  
  if (event.data?.type?.startsWith('KEYCLOAK_AUTH')) {
    console.log('🔐 Keycloak authentication message detected:', event.data);
  }
}, true);

// Monitor iframe load events
const iframe = document.querySelector('.login-iframe');
if (iframe) {
  iframe.addEventListener('load', () => {
    console.log('🌐 Iframe loaded:', {
      src: iframe.src,
      timestamp: new Date().toISOString()
    });
    
    // Try to access iframe URL (will fail due to CORS but we can try)
    try {
      console.log('🔗 Iframe current URL:', iframe.contentWindow.location.href);
    } catch (err) {
      console.log('❌ Cannot access iframe URL (expected due to CORS):', err.message);
    }
  });
  
  iframe.addEventListener('error', (err) => {
    console.log('💥 Iframe error:', err);
  });
  
  console.log('🎯 Iframe found and event listeners attached');
} else {
  console.log('⚠️ No iframe found on page');
}

// Check current authentication state
const keycloakUrl = 'http://localhost:9001'; // Using proxy URL
console.log('🔍 Monitoring authentication with Keycloak URL:', keycloakUrl);

// Monitor network requests (if DevTools Network tab is open)
console.log('💡 Tips:');
console.log('1. Keep browser DevTools Network tab open to monitor requests');
console.log('2. Look for requests to /auth/iframe-callback after login');
console.log('3. Check for postMessage events in this console');
console.log('4. Monitor iframe src changes');

// Function to manually test postMessage
window.testPostMessage = function() {
  const testMessage = {
    type: 'KEYCLOAK_AUTH_SUCCESS',
    code: 'test-code',
    state: btoa(JSON.stringify({ mode: 'iframe', timestamp: Date.now() })),
    success: true,
    timestamp: Date.now()
  };
  
  window.postMessage(testMessage, window.location.origin);
  console.log('📤 Sent test postMessage:', testMessage);
};

console.log('🧪 Run testPostMessage() to test message handling');
console.log('✅ Debug script setup complete!');
