# Cloud Functions Plan

This document outlines the architecture for the serverless background logic needed effectively within the BudgetUK repository utilizing Firebase Cloud Functions (v2).

## Targeted Function: **Auto-Promote Approved Spots**

**Objective**: Safely move a local community submission into the global `spots` collection the instant it amasses sufficient community traction and peer grading.

**Trigger Type**: Firestore `onDocumentUpdated`
**Collection Binding**: `submissions/{submissionId}`

### Execution Logic & Transformation

1. **Gatekeeping the Threshold**  
   Whenever a vote evaluates incrementally, the Cloud Function spins up natively responding to the update.
   The function compares `change.before.data().voteCount` heavily against `change.after.data().voteCount`.

2. **Validation Block**  
   It drops execution passively **unless**:
   - The new incremented `voteCount` equates to or breaks `>= 25`.
   - The previously written object hasn't already broken the limits.
   - The status is specifically structurally aligned to `"pending"`.

3. **Data Replication Vector**  
   Constructs a Batch operation pulling from standard admin dependencies:
   - Extrapolates the data block.
   - Creates/Sets a new persistent `Document` safely under the global `/spots` root. Overrides its localized `status` boundary directly out to `"live"`.
   - Safely stamps the original submission log inside `/submissions` flagging its intrinsic value out to `"live"` (blocking redundant loops).

### Blueprint Snippet

```typescript
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

export const handleSubmissionPromotion = onDocumentUpdated("submissions/{submissionId}", async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  // Guard Clauses enforcing single run
  if (!beforeData || !afterData) return;
  if (beforeData.voteCount >= 25) return;
  if (afterData.voteCount < 25) return;
  if (afterData.status !== "pending") return;

  const db = admin.firestore();
  const batch = db.batch();
  
  // 1. Stage in explicitly secure 'Spots' collection (Bypassing rules natively relying on Admin SDK)
  const spotRef = db.collection("spots").doc(event.params.submissionId);
  batch.set(spotRef, {
    ...afterData,
    status: "live",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 2. Mark submission source map cleanly as resolved securely
  const submissionRef = db.collection("submissions").doc(event.params.submissionId);
  batch.update(submissionRef, { status: "live", updatedAt: admin.firestore.FieldValue.serverTimestamp() });

  await batch.commit();
});
```

---

## Targeted Function: **Auto-Provision User Document**

**Objective**: Safely initialize a `users/{uid}` document securely mapping baseline default roles globally eliminating client-side spoofing vectors native to Firebase.

**Trigger Type**: Authentication `beforeCreate` or `onCreate` via `firebase-functions/v2/auth`. *(Relying on standard generic `onCreate` bound logic.)*

### Blueprint Snippet

```typescript
import { user } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";

export const handleUserCreation = user.beforeCreate(async (userRecord) => {
  const db = admin.firestore();
  
  const userDoc = {
    displayName: userRecord.displayName || "New User",
    photoUrl: userRecord.photoURL || null,
    role: "user",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    reputation: 0,
    homeBorough: null,
  };

  const userRef = db.collection("users").doc(userRecord.uid);
  
  await userRef.set(userDoc);
  
  // Return securely preserving identity creation
  return {}; 
});
```

