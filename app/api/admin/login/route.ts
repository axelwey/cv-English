import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimit(ip)) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
    if (!valid) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Password OK — this token only grants access to the webauthn/* routes.
    // Full access to data-mutating routes requires passkey verification next.
    const token = await createToken("password-only");
    return Response.json({ token, requiresPasskey: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
