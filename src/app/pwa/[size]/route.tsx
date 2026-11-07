import { ImageResponse } from "next/og";
import { Mark } from "@/lib/mark";

// PNG app icons for the web manifest (maskable: the mark stays inside the safe zone)
export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const n = Math.min(1024, Math.max(48, Number((await params).size) || 192));
  return new ImageResponse(<Mark size={n} />, { width: n, height: n, headers: { "Cache-Control": "public, max-age=31536000, immutable" } });
}
