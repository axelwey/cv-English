import { NextRequest } from "next/server";
import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, "password-only");
  if (authError) return authError;

  try {
    const body: RegistrationResponseJSON = await request.json();

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: globalThis.__webauthnChallenge!,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: "Verification failed" }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;

    // Return the credential to be stored as WEBAUTHN_CREDENTIAL env var
    const credentialOut = {
      credentialID: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: body.response.transports || [],
    };

    return Response.json({
      verified: true,
      credential: credentialOut,
      instruction: "Store this JSON as the WEBAUTHN_CREDENTIAL environment variable in Vercel, then redeploy.",
    });
  } catch {
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
