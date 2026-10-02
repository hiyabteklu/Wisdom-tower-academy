package com.example

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging

/**
 * Drop-in helper functions for MainActivity.kt in the companion repo:
 * `hiyabteklu/Wisdom-tower-academy-app`
 *
 * Implements:
 * 1. Android 13+ POST_NOTIFICATIONS permission request (gentle, unforced)
 * 2. On app start / login: get FCM token and send to POST /api/fcm-token
 * 3. Handle notification click: route WebView to the target URL (e.g. /notifications or custom material path)
 */
object MainActivityNotificationHelper {

    private const val TAG = "WTA_NotificationHelper"

    /**
     * 1. Register notification permission launcher. Call in Activity onCreate().
     */
    fun setupNotificationPermission(
        activity: ComponentActivity,
        onPermissionResult: ((Boolean) -> Unit)? = null
    ): () -> Unit {
        val requestPermissionLauncher = activity.registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted: Boolean ->
            Log.d(TAG, "POST_NOTIFICATIONS permission result: $isGranted")
            onPermissionResult?.invoke(isGranted)
        }

        return {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(
                        activity,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
        }
    }

    /**
     * 2. Retrieve FCM token and send to backend quietly on app start.
     * Call this inside MainActivity onCreate().
     */
    fun registerFcmTokenOnStart(context: android.content.Context, userId: String? = null) {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            val token = task.result
            Log.d(TAG, "Current FCM token: $token")
            WisdomFirebaseMessagingService.sendRegistrationToServer(context, token, userId)
        }
    }

    /**
     * 3. Handle notification tap intent.
     * Call in MainActivity onCreate() and onNewIntent(intent).
     *
     * If the payload contains a URL or path, loads that page in the WebView.
     * Otherwise navigates to /notifications.
     */
    fun handleNotificationIntent(intent: Intent?, webView: WebView?, baseUrl: String = "https://wisdom-tower-academy.live") {
        if (intent == null || webView == null) return

        val navUrl = intent.getStringExtra("NAVIGATE_URL")
            ?: intent.getStringExtra("url")
            ?: intent.dataString

        if (!navUrl.isNullOrBlank()) {
            val destination = if (navUrl.startsWith("http://") || navUrl.startsWith("https://")) {
                navUrl
            } else {
                val cleanPath = if (navUrl.startsWith("/")) navUrl else "/$navUrl"
                "$baseUrl$cleanPath"
            }

            Log.d(TAG, "Navigating WebView from notification tap to: $destination")
            webView.loadUrl(destination)
        }
    }
}
