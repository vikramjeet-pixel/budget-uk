// Must be set before any firebase-admin module is imported.
// Jest setupFiles run before test module imports, so this is safe.
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
// Suppress firebase-admin warnings about missing credentials in test
process.env.GOOGLE_CLOUD_PROJECT = "demo-budgetuk-test";
