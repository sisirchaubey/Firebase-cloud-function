const functions = require('firebase-functions');
const admin = require ("firebase-admin");
const firestore = admin.firestore();

/*
** Auto cancel ride after 24 hours
*/
exports.autoCancelRide = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {

    const dateToMilliSec = admin.firestore.Timestamp.now().toMillis();
    const yesterdayDate = new Date(dateToMilliSec - (24 * 60 * 60 * 1000));

    // Ride cancel for orders
    const ordersSnapshot = await firestore.collection('orders').where('status', '==', 'Ride Placed').where('createdDate', '<', yesterdayDate).get();
    if(ordersSnapshot.size > 0) {
        ordersSnapshot.forEach(function(doc) {
            const orderData = doc.data();
            if (!orderData) {
                console.log("No order data");
                return;
            }
            console.log('orders : orderId: '+orderData.id);
            firestore.collection('orders').doc(orderData.id).update({
                status: "Ride Canceled",
                acceptedDriverId: []
            });
        });
    }else{
        console.log("No results found for orders");
    }

    // Ride cancel for intercity orders
    const ordersIntercitySnapshot = await firestore.collection('orders_intercity').where('status', '==', 'Ride Placed').get();
    if(ordersIntercitySnapshot.size > 0) {
        ordersIntercitySnapshot.forEach(function(doc) {
            const orderData = doc.data();
            if (!orderData) {
                console.log("No order data");
                return;
            }
            const whenDateTime = new Date(orderData.whenDates+' '+orderData.whenTime);
            console.log('orders_intercity : orderId: '+orderData.id+' : whenDateTime: '+whenDateTime);
            if(whenDateTime < yesterdayDate){
                firestore.collection('orders_intercity').doc(orderData.id).update({
                    status: "Ride Canceled",
                    acceptedDriverId: []
                });
            }
        });
    }else{
        console.log("No results found for intercity orders");
    }
});
