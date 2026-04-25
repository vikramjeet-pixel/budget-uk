import { ImageResponse } from "next/og";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { city: string; neighbourhood: string; slug: string } }) {
  const { slug } = params;

  // Fetch spot data from Firestore
  const spotSnap = await adminDb
    .collection("spots")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  const spot = spotSnap.empty ? null : spotSnap.docs[0].data();
  const name = spot?.name || "Best Cheap Spots";
  const neighbourhood = spot?.neighbourhood || "London";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f4ed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <span style={{ fontSize: "24px", fontWeight: 600, color: "#1c1c1c", opacity: 0.5, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "2px" }}>
          BudgetUK / {neighbourhood}
        </span>
        <h1
          style={{
            fontSize: "100px",
            fontWeight: 600,
            color: "#1c1c1c",
            letterSpacing: "-3px",
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {name}
        </h1>
        <div 
          style={{ 
            marginTop: "40px", 
            fontSize: "32px", 
            color: "#1c1c1c", 
            opacity: 0.6,
            fontWeight: 500,
          }}
        >
          budgetuk.io
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
