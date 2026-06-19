import { NextRequest } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, "password-only");
  if (authError) return authError;

  try {
    const options = await generateRegistrationOptions({
      rpName: process.env.WEBAUTHN_RP_NAME!,
      rpID: process.env.WEBAUTHN_RP_ID!,
      userName: "admin",
      userDisplayName: "Admin",
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
      },
    });

    // Single-user admin: store the challenge in a module-level global for the
    // short verification round-trip that follows immediately after this call.
    globalThis.__webauthnChallenge = options.challenge;

    return Response.json(options);
  } catch {
    return Response.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
