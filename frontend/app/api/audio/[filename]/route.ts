import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    let filePath = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "frontend", "public", filename);
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse(`Audio file not found: ${filename}`, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error reading audio file: ${err.message}`, { status: 500 });
  }
}
