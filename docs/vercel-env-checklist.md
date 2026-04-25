# Vercel Environment Variables Checklist

This document lists every variable required in the Vercel dashboard for **Production** and **Preview** environments. Most variables should be set to "All Environments" unless otherwise specified.

## Shared (Common to all Environments)

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client-side Firebase key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g., `{project}.firebaseapp.com`. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g., `{project}.firebasestorage.app`. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID. |
| `GOOGLE_PLACES_API_KEY` | Google Maps Platform (Places API). |
| `GOOGLE_MAPS_API_KEY` | Google Maps Platform (Maps JS API). |
| `TFL_APP_KEY` | Transport for London API Key. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 Site Key. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (G-XXXXXX). |

## Environment Specific

### Production Only
| Variable | Value |
| :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Base64 of Production Service Account JSON. |
| `NEXT_PUBLIC_SITE_URL` | e.g., `https://budgetuk.io` |

### Preview / Development Only
| Variable | Value |
| :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Base64 of Dev/Staging Service Account JSON. |
| `NEXT_PUBLIC_SITE_URL` | e.g., `https://preview.budgetuk.io` or `http://localhost:3000` |

---

### Critical Reminders
1. **Redeploy**: Vercel requires a clean redeploy (without cache) for environment variables to take effect.
2. **Authorized Domains**: Ensure your Vercel URLs (including preview domains) are added to the **Authorized Domains** list in the Firebase Console (Authentication > Settings).
3. **App Check**: Ensure that both your Production and Preview domains are registered in the **reCAPTCHA** console and the **Firebase App Check** settings.
