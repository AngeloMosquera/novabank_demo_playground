'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface WebViewContextType {
  isWebView: boolean
  isAndroid: boolean
  isIOS: boolean
  canGoBack: boolean
  goBack: () => void
  exitApp: () => void
  setStatusBarColor: (color: string) => void
  setFullscreen: (fullscreen: boolean) => void
}

const WebViewContext = createContext<WebViewContextType | undefined>(undefined)

export function useWebView() {
  const context = useContext(WebViewContext)
  if (context === undefined) {
    throw new Error('useWebView must be used within a WebViewProvider')
  }
  return context
}

interface WebViewProviderProps {
  children: React.ReactNode
}

export function WebViewProvider({ children }: WebViewProviderProps) {
  const [isWebView, setIsWebView] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // Detect WebView environment
    const userAgent = navigator.userAgent.toLowerCase()
    const isWebViewDetected = 
      userAgent.includes('wv') || // Android WebView
      userAgent.includes('webview') ||
      (window as any).ReactNativeWebView !== undefined || // React Native WebView
      (window as any).webkit?.messageHandlers !== undefined || // iOS WebView
      userAgent.includes('mobile') && !userAgent.includes('safari')

    const isAndroidDetected = userAgent.includes('android')
    const isIOSDetected = /ipad|iphone|ipod/.test(userAgent)

    setIsWebView(isWebViewDetected)
    setIsAndroid(isAndroidDetected)
    setIsIOS(isIOSDetected)

    // Check if we can go back
    setCanGoBack(window.history.length > 1)

    // Listen for Android back button
    if (isAndroidDetected && isWebViewDetected) {
      const handleBackButton = (event: PopStateEvent) => {
        // Prevent default back behavior
        event.preventDefault()
        
        // Check if we can go back in history
        if (window.history.length > 1) {
          window.history.back()
        } else {
          // Exit app if no history
          exitApp()
        }
      }

      window.addEventListener('popstate', handleBackButton)
      return () => window.removeEventListener('popstate', handleBackButton)
    }
  }, [])

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      exitApp()
    }
  }

  const exitApp = () => {
    // Try different methods to exit the app
    if ((window as any).Android?.exitApp) {
      (window as any).Android.exitApp()
    } else if ((window as any).webkit?.messageHandlers?.exitApp) {
      (window as any).webkit.messageHandlers.exitApp.postMessage({})
    } else if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ action: 'exitApp' }))
    } else {
      // Fallback: try to close the window
      window.close()
    }
  }

  const setStatusBarColor = (color: string) => {
    // Update theme color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color)
    }

    // Try to communicate with native app
    if ((window as any).Android?.setStatusBarColor) {
      (window as any).Android.setStatusBarColor(color)
    } else if ((window as any).webkit?.messageHandlers?.setStatusBarColor) {
      (window as any).webkit.messageHandlers.setStatusBarColor.postMessage({ color })
    } else if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ 
        action: 'setStatusBarColor', 
        color 
      }))
    }
  }

  const setFullscreen = (fullscreen: boolean) => {
    if ((window as any).Android?.setFullscreen) {
      (window as any).Android.setFullscreen(fullscreen)
    } else if ((window as any).webkit?.messageHandlers?.setFullscreen) {
      (window as any).webkit.messageHandlers.setFullscreen.postMessage({ fullscreen })
    } else if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ 
        action: 'setFullscreen', 
        fullscreen 
      }))
    }

    // For web browsers, try to use fullscreen API
    if (!isWebView) {
      if (fullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  const value: WebViewContextType = {
    isWebView,
    isAndroid,
    isIOS,
    canGoBack,
    goBack,
    exitApp,
    setStatusBarColor,
    setFullscreen,
  }

  return (
    <WebViewContext.Provider value={value}>
      {children}
    </WebViewContext.Provider>
  )
} 