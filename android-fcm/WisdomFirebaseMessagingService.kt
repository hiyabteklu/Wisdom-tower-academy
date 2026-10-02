package com.example

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * Wisdom Tower Academy — Native Firebase Messaging Service
 *
 * Requirements satisfied:
 * 1. Receives push notifications from FCM (data payload or notification payload)
 * 2. Displays a clean system notification with title + body + custom icon
 * 3. Handles notification tap: opens MainActivity and passes deep-link URL (defaults to /notifications)
 * 4. On token refresh (onNewToken), quietly sends the token to POST /api/fcm-token in the background
 */
class WisdomFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "WisdomFCM"
        const val CHANNEL_ID = "wta_notifications"
        const val CHANNEL_NAME = "Wisdom Tower Academy Notifications"
        const val BACKEND_URL = "https://wisdom-tower-academy.live/api/fcm-token"

        /**
         * Helper to quietly send FCM token to backend in a background thread.
         * Safe to call from MainActivity on app start or login.
         */
        fun sendRegistrationToServer(context: Context, token: String, userId: String? = null) {
            if (token.isBlank()) return

            thread(name = "wta-fcm-register") {
                try {
                    val url = URL(BACKEND_URL)
                    val conn = (url.openConnection() as HttpURLConnection).apply {
                        requestMethod = "POST"
                        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                        doOutput = true
                        connectTimeout = 10000
                        readTimeout = 10000
                    }

                    val json = JSONObject().apply {
                        put("token", token)
                        put("platform", "android")
                        put("deviceName", "${Build.MANUFACTURER} ${Build.MODEL}")
                        if (!userId.isNullOrBlank()) {
                            put("userId", userId)
                        }
                    }

                    conn.outputStream.use { os ->
                        os.write(json.toString().toByteArray(Charsets.UTF_8))
                        os.flush()
                    }

                    val responseCode = conn.responseCode
                    Log.d(TAG, "FCM token sent to backend, response code: $responseCode")
                    conn.disconnect()
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to send FCM token to backend: ${e.message}")
                }
            }
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM Token received: $token")
        // Quietly send token to backend in background
        sendRegistrationToServer(applicationContext, token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "FCM message received from: ${remoteMessage.from}")

        // 1. Extract title and body from notification payload or data payload
        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "Wisdom Tower Academy"

        val body = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: "You have a new academic update"

        // 2. Extract target destination URL (defaults to /notifications)
        val targetUrl = remoteMessage.data["url"]
            ?: remoteMessage.data["click_action_url"]
            ?: "/notifications"

        // 3. Show native system notification
        showNotification(title, body, targetUrl)
    }

    private fun showNotification(title: String, body: String, targetUrl: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create Android O+ Notification Channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Announcements, new learning materials, and course updates"
                enableLights(true)
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Tap action: open MainActivity with target URL in intent extras
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("NAVIGATE_URL", targetUrl)
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            pendingIntentFlags
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        // Try getting app icon or fallback to default
        val iconRes = applicationInfo.icon.takeIf { it != 0 } ?: android.R.drawable.ic_dialog_info

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(iconRes)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationId = (System.currentTimeMillis() % 100000).toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
