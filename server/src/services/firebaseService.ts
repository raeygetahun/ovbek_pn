import admin from "firebase-admin";
import config from "../config";

admin.initializeApp({
  credential: admin.credential.cert(
    config.firebaseConfig.privateKey as admin.ServiceAccount,
  ),
  databaseURL: `https://${config.firebaseConfig.projectId}.firebaseio.com`,
});

export default admin;
