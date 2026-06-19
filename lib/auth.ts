import { SignJWT, jwtVerify } from "jose";

export type AuthStep = "password-only" | "full";

const STEP_RANK: Record<AuthStep, number> = {
  "password-only": 1,
  full: 2,
};

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(step: AuthStep): Promise<string> {
  return new SignJWT({ role: "admin", step })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthStep | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.step === "password-only" || payload.step === "full") {
      return payload.step;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function requireAuth(request: Request, minStep: AuthStep = "full"): Promise<Response | null> {
  const token = await getTokenFromRequest(request);
  const step = token ? await verifyToken(token) : null;

  if (!step || STEP_RANK[step] < STEP_RANK[minStep]) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
