import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "BudgetUK — Budget-Friendly London Guide";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        <h1
          style={{
            fontSize: "84px",
            fontWeight: 600,
            color: "#1c1c1c",
            letterSpacing: "-2.5px",
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cheap spots in London, by Locals.
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
