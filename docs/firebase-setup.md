# Firebase Setup Guide

This document outlines the step-by-step process required to configure the Firebase project for BudgetUK. Follow these instructions carefully to ensure the local development environment and cloud infrastructure are properly linked.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `budgetuk`).
4. Choose whether to enable Google Analytics (optional, depending on your tracking needs).
5. Click **Create project**.

## 2. Enable Firebase Services

### Cloud Firestore
1. Navigate to **Build > Firestore Database** in the left sidebar.
2. Click **Create database**.
3. **Important**: Select the region **`europe-west2`** (London) for data localization and latency optimization.
4. Choose **Start in production mode** (or test mode, depending on your current needs) and click **Create**.
   *(Note: Ensure it is set up broadly in Native mode rather than Datastore mode, which is the default for new Firebase projects).*

### Authentication
1. Navigate to **Build > Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, enable the following providers:
   - **Email/Password**: Click to enable, then save.
   - **Google**: Click to enable, provide a project support email, then save.

### Cloud Storage
1. Navigate to **Build > Storage**.
2. Click **Get started** and follow the prompt.
3. Select the default bucket region corresponding to your Firestore region and click **Done**.

## 3. Generate Service Account Key (For Admin SDK)

1. Click the **gear icon** next to **Project Overview** in the left sidebar and select **Project settings**.
2. Go to the **Service accounts** tab.
3. Click **Generate new private key** and securely save the downloaded `.json` file to your machine.
4. Convert this file to a Base64 encoded string so you can safely inject it as an environment variable. Run this from your terminal:
   ```bash
   base64 -i path/to/serviceAccountKey.json | tr -d '\n'
   ```
5. You will map this Base64 string to the `FIREBASE_SERVICE_ACCOUNT_B64` local environment variable shortly.

## 4. Create Web App & Copy Config Keys

1. Navigate back to the **General** tab in **Project settings**.
2. Scroll to the **Your apps** section and click the **Web icon** (`</>`) to add an app.
3. Name the app (e.g., `budgetuk-web`) and click **Register app**.
4. Firebase will display your SDK configuration keys in a JavaScript snippet.
5. In your project's root directory, create a `.env.local` file (you can reference `.env.local.example`) and map the values to these exact keys:

```properties
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain_here"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id_here"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_storage_bucket_here"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id_here"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id_here"

# Secure Service Account (from Step 3)
FIREBASE_SERVICE_ACCOUNT_B64="your_base64_encoded_string_here"
```

## 5. Install & Configure Firebase CLI

To manage your Firestore security rules, Firebase Hosting, and Cloud Functions directly from this codebase, you need the Firebase CLI.

1. Install the tools globally via npm:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in securely to your Google Account:
   ```bash
   firebase login
   ```
3. Initialize the Firebase project structure inside your repository root:
   ```bash
   firebase init firestore hosting functions
   ```
   *Follow the CLI prompts, bind it to your newly created `budgetuk` project, and accept the default values to generate your `firestore.rules`, `firestore.indexes.json`, and `firebase.json` files.*
