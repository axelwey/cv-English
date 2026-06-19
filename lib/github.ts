const GITHUB_API = "https://api.github.com";

interface GitHubFileResponse {
  content: string;
  sha: string;
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const repo = process.env.GITHUB_REPO!;
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data: GitHubFileResponse = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function putFile(path: string, content: string, sha: string, message: string): Promise<{ sha: string }> {
  const repo = process.env.GITHUB_REPO!;
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    }),
  });

  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
  const data: { content: GitHubFileResponse } = await res.json();
  return { sha: data.content.sha };
}

export async function uploadFile(path: string, base64Content: string, message: string): Promise<void> {
  const repo = process.env.GITHUB_REPO!;

  let sha: string | undefined;
  try {
    const existing = await getFile(path);
    sha = existing.sha;
  } catch {
    // File doesn't exist yet, that's fine
  }

  const body: Record<string, string> = {
    message,
    content: base64Content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`GitHub upload failed: ${res.status}`);
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const repo = process.env.GITHUB_REPO!;
  const { sha } = await getFile(path);

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sha }),
  });

  if (!res.ok) throw new Error(`GitHub DELETE failed: ${res.status}`);
}
