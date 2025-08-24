// app/api/video-upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
// 1. Import the shared Prisma instance instead of the whole client
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number; // The size in bytes from Cloudinary's response
  duration?: number;
  [key: string]: any;
}

// 2. The function name MUST be uppercase 'POST'
export async function POST(request: NextRequest) {
  // 3. Authenticate the user - This completes your 'todo'
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video-uploads",
            transformation: [{ quality: "auto", fetch_format: "mp4" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(buffer);
      }
    );

    // 4. Create the video record in the database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        // 5. Convert originalSize string to a number. Use 0 as a fallback.
        originalSize: parseInt(originalSize, 10) || 0,
        // 6. Get the compressed size correctly from the Cloudinary result
        compressedSize: result.bytes,
        duration: result.duration || 0,
        // 7. Associate the video with the logged-in user
        userId: userId,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Video upload failed", error);
    return NextResponse.json(
      { error: "Video upload failed" },
      { status: 500 }
    );
  }
  // 8. No 'finally' block needed when using the singleton
}