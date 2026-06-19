import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
    if (!hookUrl) {
      return Response.json({ error: "Deploy hook not configured" }, { status: 500 });
    }

    const res = await fetch(hookUrl, { method: "POST" });

    if (!res.ok) {
      return Response.json({ error: "Deploy trigger failed" }, { status: 500 });
    }

    return Response.json({ success: true, message: "Deploy triggered" });
  } catch {
    return Response.json({ error: "Deploy trigger failed" }, { status: 500 });
  }
}
