import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadFile, deleteFile } from "@/lib/github";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;

    if (!file || !filename) {
      return Response.json({ error: "Missing file or filename" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9._-]+\.pdf$/.test(filename)) {
      return Response.json({ error: "Invalid filename. Use only letters, numbers, hyphens, underscores, and must end in .pdf" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    await uploadFile(`public/projects/${filename}`, base64, `Upload ${filename} via admin panel`);

    return Response.json({ success: true, path: `/projects/${filename}` });
  } catch {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { filename } = await request.json();

    if (!filename || typeof filename !== "string") {
      return Response.json({ error: "Missing filename" }, { status: 400 });
    }

    await deleteFile(`public/projects/${filename}`, `Delete ${filename} via admin panel`);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
