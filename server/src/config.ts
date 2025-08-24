import { IAppConfig } from "./types";

const config: IAppConfig = {
  firebaseConfig: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  },
};

export default config;
