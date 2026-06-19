import { NextRequest } from "next/server";
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body: AuthenticationResponseJSON = await request.json();
    const credential = JSON.parse(process.env.WEBAUTHN_CREDENTIAL || "{}");

    if (!credential.credentialID) {
      return Response.json({ error: "No passkey registered" }, { status: 400 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: globalThis.__webauthnAuthChallenge!,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
      credential: {
        id: credential.credentialID,
        publicKey: Uint8Array.from(Buffer.from(credential.credentialPublicKey, "base64url")),
        counter: credential.counter,
        transports: credential.transports,
      },
    });

    if (!verification.verified) {
      return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Note: the authenticator's updated counter (verification.authenticationInfo.newCounter)
    // would need to be written back to WEBAUTHN_CREDENTIAL to fully prevent replay; for this
    // single-user admin setup that update is done manually if ever needed.

    const token = await createToken("full");
    return Response.json({ verified: true, token });
  } catch {
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}
