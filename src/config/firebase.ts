import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.join(process.cwd(), "prj300-emergencyapp-firebase-adminsdk-fbsvc-c2dfa9f70b.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;