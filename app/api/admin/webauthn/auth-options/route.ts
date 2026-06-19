import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST() {
  try {
    const credential = JSON.parse(process.env.WEBAUTHN_CREDENTIAL || "{}");

    if (!credential.credentialID) {
      return Response.json({ error: "No passkey registered" }, { status: 400 });
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.WEBAUTHN_RP_ID!,
      allowCredentials: [
        {
          id: credential.credentialID,
          transports: credential.transports,
        },
      ],
      userVerification: "required",
    });

    globalThis.__webauthnAuthChallenge = options.challenge;

    return Response.json(options);
  } catch {
    return Response.json({ error: "Failed to generate options" }, { status: 500 });
  }
}
