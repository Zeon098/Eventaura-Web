/**
 * Firebase Cloud Functions for EventAura
 * 
 * Deploy with: firebase deploy --only functions
 * 
 * Make sure to:
 * 1. Run: npm install firebase-functions firebase-admin
 * 2. Initialize Firebase Functions: firebase init functions
 * 3. Add this code to functions/index.js
 * 4. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Process notification queue for push notifications
 * Triggered whenever a new document is added to notification_queue collection
 */
exports.processNotificationQueue = functions.firestore
  .document('notification_queue/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data();
    
    // Skip if already processed
    if (notification.processed) {
      console.log('Notification already processed:', context.params.notificationId);
      return null;
    }
    
    try {
      console.log('Processing notification:', {
        id: context.params.notificationId,
        type: notification.data?.type,
        targetToken: notification.targetToken?.substring(0, 20) + '...',
      });
      
      // Send FCM message
      await admin.messaging().send({
        token: notification.targetToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        // For web notifications
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/logo192.png', // Update with your app icon
            badge: '/logo192.png',
          },
          fcmOptions: {
            link: getDeepLink(notification.data),
          },
        },
        // For mobile apps (if you have them)
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: 'default',
            },
          },
        },
        android: {
          notification: {
            title: notification.title,
            body: notification.body,
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      });
      
      console.log('Notification sent successfully:', context.params.notificationId);
      
      // Mark as processed
      await snapshot.ref.update({ 
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Mark as processed even if failed to avoid retry loops
      await snapshot.ref.update({ 
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: error.message,
        errorCode: error.code,
      });
    }
    
    return null;
  });

/**
 * Get deep link based on notification type
 */
function getDeepLink(data) {
  if (!data || !data.type) {
    return '/';
  }
  
  switch (data.type) {
    case 'booking_new':
    case 'booking_status':
      return data.bookingId ? `/bookings/${data.bookingId}` : '/bookings';
    
    case 'chat_message':
      return data.roomId ? `/chat/${data.roomId}` : '/chat';
    
    case 'provider_approval':
      return '/profile';
    
    default:
      return '/';
  }
}

/**
 * Optional: Cleanup old processed notifications (runs daily)
 * Uncomment if you want to automatically delete old notifications
 */
/*
exports.cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const oldNotifications = await db
      .collection('notification_queue')
      .where('processed', '==', true)
      .where('createdAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Cleaned up ${oldNotifications.size} old notifications`);
    return null;
  });
*/

/**
 * Optional: Index services in Algolia automatically on create/update
 * Requires: npm install algoliasearch
 * Add your Algolia Admin API key to Firebase Functions config:
 * firebase functions:config:set algolia.app_id="YOUR_APP_ID" algolia.admin_key="YOUR_ADMIN_KEY"
 */
/*
const algoliasearch = require('algoliasearch');

exports.indexServiceInAlgolia = functions.firestore
  .document('services/{serviceId}')
  .onWrite(async (change, context) => {
    const config = functions.config().algolia;
    const client = algoliasearch(config.app_id, config.admin_key);
    const index = client.initIndex('services');
    
    // Delete if service was removed
    if (!change.after.exists) {
      await index.deleteObject(context.params.serviceId);
      console.log('Deleted service from Algolia:', context.params.serviceId);
      return null;
    }
    
    const service = change.after.data();
    
    // Index service in Algolia
    const record = {
      objectID: context.params.serviceId,
      providerId: service.providerId,
      title: service.title,
      description: service.description,
      categories: service.categories,
      category: service.categories[0]?.id || '',
      categoryPrices: service.categories.reduce((acc, cat) => {
        acc[cat.id] = cat.price;
        return acc;
      }, {}),
      categoryTokens: [
        ...service.categories.map(c => c.id),
        ...service.categories.map(c => c.name)
      ],
      price: service.categories[0]?.price || 0,
      rating: service.rating,
      location: service.location,
      cover_image: service.coverImage,
      gallery_images: service.galleryImages,
      venueSubtypes: service.venueSubtypes || [],
      _geoloc: service.latitude && service.longitude ? {
        lat: service.latitude,
        lng: service.longitude
      } : undefined
    };
    
    await index.saveObject(record);
    console.log('Indexed service in Algolia:', context.params.serviceId);
    
    return null;
  });
*/
