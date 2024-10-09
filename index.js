const functions = require("firebase-functions");
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "YOUR_DATABASE_URL"
});

const autoCancelRide = require('./autoCancelRide');

exports.autoCancelRide = autoCancelRide.autoCancelRide;

exports.deleteUser = functions.https.onCall(async (data, context) => {
    try {
        await admin.auth().deleteUser(data.uid);
        return { result: 'user successfully deleted'};
    } catch (error) {
        throw new functions.https.HttpsError('failed-precondition','The function must be called while authenticated.'); 
    }

});