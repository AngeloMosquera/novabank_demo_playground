# WebView Debugging Guide

This guide shows you how to enable browser inspection tools when your app is running in a WebView.

## Method 1: Enable WebView Debugging in Android App

If you have access to the Android app code, add this to enable debugging:

```kotlin
// In your MainActivity.kt or Application class
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

Then you can inspect the WebView using Chrome DevTools:

1. Open Chrome on your computer
2. Go to `chrome://inspect/#devices`
3. Your WebView will appear in the list of inspectable pages
4. Click "Inspect" to open DevTools

## Method 2: Add Debug Mode Detection to Web App

Add this code to your web app to detect debug mode and show debugging tools:

```javascript
// Add to your main layout or app component
useEffect(() => {
  // Detect if we're in development or debug mode
  const isDebug = process.env.NODE_ENV === 'development' || 
                  window.location.search.includes('debug=true') ||
                  localStorage.getItem('debug') === 'true';
  
  if (isDebug) {
    // Enable debugging features
    console.log('Debug mode enabled');
    
    // Add debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
    `;
    debugPanel.innerHTML = `
      <div>Debug Mode Active</div>
      <div>User Agent: ${navigator.userAgent}</div>
      <div>Screen: ${screen.width}x${screen.height}</div>
      <div>Viewport: ${window.innerWidth}x${window.innerHeight}</div>
      <button onclick="this.parentElement.remove()">Close</button>
    `;
    document.body.appendChild(debugPanel);
  }
}, []);
```

## Method 3: Add Debug URL Parameter

You can access your app with debug parameters:

```
http://localhost:3000?debug=true
```

Or add this to your app to enable debug mode:

```javascript
// Check for debug parameter
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.get('debug') === 'true';

if (isDebugMode) {
  // Enable console logging
  window.DEBUG = true;
  console.log('Debug mode enabled via URL parameter');
}
```

## Method 4: Use Eruda for Mobile Debugging

Install Eruda - a mobile debugging tool:

```bash
npm install eruda
```

Then add it conditionally:

```javascript
// In your main app file
if (process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')) {
  import('eruda').then(eruda => eruda.default.init());
}
```

This will add a floating debug console to your app that works in WebView.

## Method 5: Remote Debugging with Weinre

For older WebViews that don't support Chrome DevTools:

1. Install weinre globally:
```bash
npm install -g weinre
```

2. Start weinre server:
```bash
weinre --boundHost 0.0.0.0 --httpPort 8080
```

3. Add this script to your HTML:
```html
<script src="http://YOUR_IP:8080/target/target-script-min.js#anonymous"></script>
```

4. Open `http://YOUR_IP:8080/client/` in your browser to debug

## Method 6: Enable Development Server Access

Make sure your development server is accessible from your device:

```bash
# Start Next.js dev server accessible from network
npm run dev -- --hostname 0.0.0.0

# Or use your local IP
npm run dev -- --hostname 192.168.1.XXX
```

Then access your app directly in a mobile browser instead of WebView:
```
http://YOUR_IP:3000
```

## Quick Debug Setup for Your App

Add this to your main layout component:

```typescript
// Add to your layout or main component
useEffect(() => {
  // Enable debug mode with URL parameter or localStorage
  const enableDebug = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true' || 
           localStorage.getItem('debug') === 'true' ||
           process.env.NODE_ENV === 'development';
  };

  if (enableDebug()) {
    // Load Eruda for mobile debugging
    import('eruda').then(eruda => {
      eruda.default.init();
      console.log('🔍 Debug tools loaded');
    }).catch(() => {
      // Fallback: create simple debug info
      const debugInfo = document.createElement('div');
      debugInfo.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        background: #000; color: #0f0; padding: 5px;
        font-family: monospace; font-size: 10px;
        z-index: 10000; text-align: center;
      `;
      debugInfo.textContent = `DEBUG MODE | ${navigator.userAgent.includes('wv') ? 'WebView' : 'Browser'}`;
      document.body.appendChild(debugInfo);
    });
  }
}, []);
```

## Testing Different Scenarios

1. **Local Development**: `http://localhost:3000?debug=true`
2. **Network Access**: `http://YOUR_IP:3000?debug=true`
3. **WebView with Debug**: Enable WebView debugging in Android app
4. **Mobile Browser**: Access directly in Chrome/Safari mobile

## Recommended Approach

1. First, try enabling WebView debugging in the Android app (Method 1)
2. If that's not possible, add Eruda to your web app (Method 4)
3. For quick testing, use the debug URL parameter (Method 3)
4. For production debugging, consider remote debugging tools

Choose the method that works best for your development setup! 