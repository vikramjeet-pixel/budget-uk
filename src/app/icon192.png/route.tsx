import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f4ed",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 128,
            width: "80%", // 10% safe zone on each side (total 20% smaller)
            height: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1c1c1c",
            fontWeight: 600,
            letterSpacing: "-0.5px",
          }}
        >
          B
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
