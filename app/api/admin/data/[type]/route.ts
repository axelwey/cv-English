import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getFile, putFile } from "@/lib/github";
import { timelineDataSchema, projectsDataSchema, homeDataSchema } from "@/lib/validation";

const FILE_MAP: Record<string, { path: string; schema: typeof timelineDataSchema | typeof projectsDataSchema | typeof homeDataSchema }> = {
  timeline: { path: "data/timeline.json", schema: timelineDataSchema },
  projects: { path: "data/projects.json", schema: projectsDataSchema },
  home: { path: "data/home.json", schema: homeDataSchema },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { type } = await params;
  const config = FILE_MAP[type];
  if (!config) return Response.json({ error: "Invalid type" }, { status: 400 });

  try {
    const { content, sha } = await getFile(config.path);
    return Response.json({ data: JSON.parse(content), sha });
  } catch {
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { type } = await params;
  const config = FILE_MAP[type];
  if (!config) return Response.json({ error: "Invalid type" }, { status: 400 });

  try {
    const body = await request.json();
    const { data, sha } = body;

    const result = config.schema.safeParse(data);
    if (!result.success) {
      return Response.json({ error: "Validation failed", details: result.error.issues }, { status: 400 });
    }

    const content = JSON.stringify(result.data, null, 2);
    const { sha: newSha } = await putFile(config.path, content, sha, `Update ${type} via admin panel`);

    return Response.json({ success: true, sha: newSha });
  } catch {
    return Response.json({ error: "Failed to save data" }, { status: 500 });
  }
}
