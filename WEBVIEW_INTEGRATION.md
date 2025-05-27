# NovaBank WebView Integration Guide

This guide explains how to integrate the NovaBank web app into an Android WebView for a native-like mobile experience.

## Features Added

✅ **Web App Manifest** - PWA capabilities with fullscreen support  
✅ **Mobile Optimizations** - Touch-friendly interface and viewport settings  
✅ **Safe Area Support** - Handles device notches and status bars  
✅ **WebView Detection** - Automatically detects WebView environment  
✅ **Fullscreen Mode** - Optimized for immersive mobile experience  
✅ **Performance Optimizations** - Optimized CSS and image loading  

## Android WebView Implementation

### 1. Basic WebView Setup

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable fullscreen
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        )
        
        setContentView(R.layout.activity_main)
        
        webView = findViewById(R.id.webview)
        setupWebView()
        
        // Load your NovaBank app
        webView.loadUrl("https://your-novabank-domain.com")
    }
    
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }
        
        webView.webViewClient = NovaWebViewClient()
        webView.webChromeClient = NovaWebChromeClient()
        
        // Add JavaScript interface for native communication
        webView.addJavascriptInterface(WebAppInterface(this), "Android")
    }
}
```

### 2. WebView Client Configuration

```kotlin
// NovaWebViewClient.kt
class NovaWebViewClient : WebViewClient() {
    
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString()
        
        // Handle external links (optional)
        if (url != null && !url.contains("your-novabank-domain.com")) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            view?.context?.startActivity(intent)
            return true
        }
        
        return false
    }
    
    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        // Show loading indicator if needed
    }
    
    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Hide loading indicator
        
        // Inject CSS for additional mobile optimizations
        view?.evaluateJavascript("""
            document.body.style.overscrollBehavior = 'none';
            document.documentElement.style.overscrollBehavior = 'none';
        """.trimIndent(), null)
    }
}
```

### 3. Chrome Client for Fullscreen Support

```kotlin
// NovaWebChromeClient.kt
class NovaWebChromeClient : WebChromeClient() {
    
    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        // Update progress bar if you have one
    }
    
    override fun onPermissionRequest(request: PermissionRequest?) {
        // Handle permissions for camera, microphone, etc.
        request?.grant(request.resources)
    }
}
```

### 4. JavaScript Interface for Native Communication

```kotlin
// WebAppInterface.kt
class WebAppInterface(private val context: Context) {
    
    @JavascriptInterface
    fun exitApp() {
        (context as? Activity)?.finish()
    }
    
    @JavascriptInterface
    fun setStatusBarColor(color: String) {
        (context as? Activity)?.runOnUiThread {
            try {
                val window = (context as Activity).window
                window.statusBarColor = Color.parseColor(color)
            } catch (e: Exception) {
                // Handle color parsing error
            }
        }
    }
    
    @JavascriptInterface
    fun setFullscreen(fullscreen: Boolean) {
        (context as? Activity)?.runOnUiThread {
            val window = (context as Activity).window
            if (fullscreen) {
                window.setFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
                )
            } else {
                window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
            }
        }
    }
    
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
```

### 5. Layout Configuration

```xml
<!-- activity_main.xml -->
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_centerInParent="true" />

</RelativeLayout>
```

### 6. Manifest Permissions

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<application
    android:name=".NovaApplication"
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="true">
    
    <activity
        android:name=".MainActivity"
        android:configChanges="orientation|screenSize|keyboardHidden"
        android:exported="true"
        android:launchMode="singleTop"
        android:screenOrientation="portrait"
        android:theme="@style/AppTheme.NoActionBar">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

### 7. Handle Back Button

```kotlin
// In MainActivity.kt
override fun onBackPressed() {
    if (webView.canGoBack()) {
        webView.goBack()
    } else {
        super.onBackPressed()
    }
}

override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
        webView.goBack()
        return true
    }
    return super.onKeyDown(keyCode, event)
}
```

## Web App Features

The web app automatically detects when it's running in a WebView and provides:

- **Responsive Design**: Optimized for mobile screens
- **Touch Optimizations**: Proper touch targets and gestures
- **Safe Area Support**: Handles notches and status bars
- **Fullscreen Mode**: Immersive experience
- **Performance**: Optimized loading and rendering

## Testing

1. **Local Development**: Test with `npm run dev` and access via Android device browser
2. **WebView Testing**: Use Android Studio emulator or physical device
3. **Performance**: Test on various Android versions and screen sizes

## Deployment

1. Build the app: `npm run build`
2. Deploy to your hosting platform
3. Update the WebView URL in your Android app
4. Test thoroughly on target devices

## Troubleshooting

### Common Issues:

1. **White Screen**: Check JavaScript console for errors
2. **Touch Issues**: Verify touch-action CSS properties
3. **Viewport Problems**: Check viewport meta tags
4. **Performance**: Enable hardware acceleration in WebView

### Debug WebView:

```kotlin
// Enable debugging in development
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

Then use Chrome DevTools: `chrome://inspect/#devices`

## Security Considerations

- Use HTTPS for production
- Validate all JavaScript interface calls
- Implement proper authentication
- Consider certificate pinning for sensitive operations

## Performance Tips

- Enable hardware acceleration
- Use image optimization
- Implement proper caching strategies
- Minimize JavaScript bundle size
- Use lazy loading for images and components 