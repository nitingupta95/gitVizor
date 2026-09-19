import { type NextRequest, NextResponse } from "next/server";
import multer from "multer";
import cloudinary from "~/lib/third-party/cloudinary";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import { uploadRateLimit } from "@/lib/ratelimit";

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 60; // Increase timeout to 60 seconds

const storage = multer.memoryStorage();
const upload = multer({ storage });

function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

async function bufferToStream(buffer: Buffer) {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (uploadRateLimit) {
    const { success } = await uploadRateLimit.limit(userId);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded: You can only upload 5 files per day." }, { status: 429 });
    }
  }

  const res = new NextResponse();
  try {
    await runMiddleware(req, res, upload.single("file"));

    // @ts-expect-error file is there
    const file = req.file as Express.Multer.File;
    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const stream = await bufferToStream(file.buffer);

    const cloudinaryUploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            if (error instanceof Error) {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              reject(error);
            } else {
              reject(new Error(typeof error === "string" ? error : JSON.stringify(error) || "Upload error"));
            }
          } else {
            resolve(result);
          }
        }
      );
      stream.pipe(uploadStream);
    });

    const result = (await cloudinaryUploadPromise) as {
      secure_url: string;
      public_id: string;
    };

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json(
      { error: "Error uploading file." },
      { status: 500 }
    );
  }
}
