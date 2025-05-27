'use client'

import { useWebView as useWebViewContext } from '@/components/webview/webview-provider'

/**
 * Custom hook to access WebView functionality
 * 
 * @returns WebView context with detection and control methods
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isWebView, isAndroid, setFullscreen } = useWebView()
 *   
 *   useEffect(() => {
 *     if (isWebView && isAndroid) {
 *       setFullscreen(true)
 *     }
 *   }, [isWebView, isAndroid, setFullscreen])
 *   
 *   return (
 *     <div>
 *       {isWebView ? 'Running in WebView' : 'Running in browser'}
 *     </div>
 *   )
 * }
 * ```
 */
export const useWebView = useWebViewContext 