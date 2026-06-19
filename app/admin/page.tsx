"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  BilingualText,
  HomeBlock,
  HomeData,
  ProjectItem,
  ProjectsData,
  TimelineData,
  TimelineItem,
} from "@/lib/types";

type Screen = "login" | "register" | "dashboard";
type Lang = "nl" | "en";
type Tab = "timeline" | "projects" | "home";
type Toast = { type: "success" | "error"; message: string };

type Resource<T> = { data: T; sha: string };

function emptyBilingual(): BilingualText {
  return { nl: "", en: "" };
}

export default function AdminPage() {
  const tokenRef = useRef<string | null>(null);

  const [screen, setScreen] = useState<Screen>("login");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [registeredCredential, setRegisteredCredential] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [timeline, setTimeline] = useState<Resource<TimelineData> | null>(null);
  const [projects, setProjects] = useState<Resource<ProjectsData> | null>(null);
  const [home, setHome] = useState<Resource<HomeData> | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const logout = useCallback(() => {
    tokenRef.current = null;
    setScreen("login");
    setPassword("");
    setRegisteredCredential(null);
    setTimeline(null);
    setProjects(null);
    setHome(null);
  }, []);

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      if (tokenRef.current) headers.set("Authorization", `Bearer ${tokenRef.current}`);
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        logout();
        throw new Error("Session expired. Please log in again.");
      }
      return res;
    },
    [logout]
  );

  const loadAllData = useCallback(async () => {
    try {
      const [tRes, pRes, hRes] = await Promise.all([
        apiFetch("/api/admin/data/timeline"),
        apiFetch("/api/admin/data/projects"),
        apiFetch("/api/admin/data/home"),
      ]);
      const [t, p, h] = await Promise.all([tRes.json(), pRes.json(), hRes.json()]);
      setTimeline({ data: t.data, sha: t.sha });
      setProjects({ data: p.data, sha: p.sha });
      setHome({ data: h.data, sha: h.sha });
    } catch {
      setToast({ type: "error", message: "Failed to load content." });
    }
  }, [apiFetch]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      tokenRef.current = data.token;
      await tryPasskeyLogin();
    } catch {
      setError("Server error");
    } finally {
      setBusy(false);
    }
  }

  async function tryPasskeyLogin() {
    const optionsRes = await fetch("/api/admin/webauthn/auth-options", { method: "POST" });
    if (!optionsRes.ok) {
      setScreen("register");
      return;
    }
    const options = await optionsRes.json();

    let assertion;
    try {
      assertion = await startAuthentication({ optionsJSON: options });
    } catch {
      setError("Passkey verification was cancelled or failed.");
      return;
    }

    const verifyRes = await fetch("/api/admin/webauthn/auth-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assertion),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.verified) {
      setError(verifyData.error || "Passkey verification failed.");
      return;
    }

    tokenRef.current = verifyData.token;
    setScreen("dashboard");
    await loadAllData();
  }

  async function handleRegisterPasskey() {
    setBusy(true);
    setError(null);
    try {
      const optionsRes = await apiFetch("/api/admin/webauthn/register-options", { method: "POST" });
      const options = await optionsRes.json();
      if (!optionsRes.ok) {
        setError(options.error || "Failed to start passkey registration.");
        return;
      }

      let attestation;
      try {
        attestation = await startRegistration({ optionsJSON: options });
      } catch {
        setError("Passkey registration was cancelled or failed.");
        return;
      }

      const verifyRes = await apiFetch("/api/admin/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attestation),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        setError(verifyData.error || "Passkey registration failed.");
        return;
      }

      setRegisteredCredential(JSON.stringify(verifyData.credential, null, 2));
    } catch {
      setError("Server error during passkey registration.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    setBusy(true);
    try {
      const res = await apiFetch("/api/admin/publish", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "Publish failed" });
        return;
      }
      setToast({ type: "success", message: "Deploy triggered." });
    } catch {
      setToast({ type: "error", message: "Publish failed" });
    } finally {
      setBusy(false);
    }
  }

  async function saveResource(type: Tab) {
    const resource = type === "timeline" ? timeline : type === "projects" ? projects : home;
    if (!resource) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/api/admin/data/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: resource.data, sha: resource.sha }),
      });
      const result = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: result.error || "Save failed" });
        return;
      }
      if (type === "timeline") setTimeline((prev) => (prev ? { ...prev, sha: result.sha } : prev));
      if (type === "projects") setProjects((prev) => (prev ? { ...prev, sha: result.sha } : prev));
      if (type === "home") setHome((prev) => (prev ? { ...prev, sha: result.sha } : prev));
      setToast({ type: "success", message: "Saved." });
    } catch {
      setToast({ type: "error", message: "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  if (screen === "login") {
    return (
      <LoginScreen
        password={password}
        setPassword={setPassword}
        onSubmit={handlePasswordSubmit}
        busy={busy}
        error={error}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterScreen
        busy={busy}
        error={error}
        registeredCredential={registeredCredential}
        onRegister={handleRegisterPasskey}
        onDone={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold">CV Admin</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePublish}
            disabled={busy}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            Publish
          </button>
          <button
            onClick={logout}
            className="rounded border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="flex gap-2 border-b border-slate-800 px-6 pt-4">
        {(["timeline", "projects", "home"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-t px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="px-6 py-6">
        {activeTab === "timeline" && timeline && (
          <TimelineEditor
            resource={timeline}
            setResource={setTimeline}
            onSave={() => saveResource("timeline")}
            busy={busy}
          />
        )}
        {activeTab === "projects" && projects && (
          <ProjectsEditor
            resource={projects}
            setResource={setProjects}
            onSave={() => saveResource("projects")}
            apiFetch={apiFetch}
            busy={busy}
            setToast={setToast}
          />
        )}
        {activeTab === "home" && home && (
          <HomeEditor resource={home} setResource={setHome} onSave={() => saveResource("home")} busy={busy} />
        )}
        {!timeline && !projects && !home && <p className="text-slate-400">Loading content…</p>}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 rounded px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function LoginScreen({
  password,
  setPassword,
  onSubmit,
  busy,
  error,
}: {
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={onSubmit} className="w-80 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-4 text-lg font-semibold">CV Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mb-3 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded bg-sky-600 px-3 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

function RegisterScreen({
  busy,
  error,
  registeredCredential,
  onRegister,
  onDone,
}: {
  busy: boolean;
  error: string | null;
  registeredCredential: string | null;
  onRegister: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-[28rem] rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-4 text-lg font-semibold">Register a passkey</h1>
        <p className="mb-4 text-sm text-slate-400">
          No passkey is registered yet. Register one now to complete two-factor setup.
        </p>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        {!registeredCredential ? (
          <button
            onClick={onRegister}
            disabled={busy}
            className="w-full rounded bg-sky-600 px-3 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
          >
            {busy ? "Registering…" : "Register Passkey"}
          </button>
        ) : (
          <>
            <p className="mb-2 text-sm text-slate-300">
              Store this JSON as the <code>WEBAUTHN_CREDENTIAL</code> environment variable in Vercel, redeploy, then
              log in again with your password and this passkey to reach the dashboard.
            </p>
            <textarea
              readOnly
              value={registeredCredential}
              rows={8}
              className="mb-4 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 font-mono text-xs"
            />
            <button
              onClick={onDone}
              className="w-full rounded bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handleProps: { listeners: ReturnType<typeof useSortable>["listeners"]; attributes: ReturnType<typeof useSortable>["attributes"] }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      {children({ listeners, attributes })}
    </div>
  );
}

function DragHandle({
  listeners,
  attributes,
}: {
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
}) {
  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="cursor-grab select-none rounded border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
      title="Drag to reorder"
    >
      ⠿
    </button>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex gap-1">
      {(["nl", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded px-2 py-1 text-xs font-medium uppercase ${
            lang === l ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function reorder<T extends { order: number }>(items: T[], oldIndex: number, newIndex: number): T[] {
  return arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }));
}

function TimelineEditor({
  resource,
  setResource,
  onSave,
  busy,
}: {
  resource: Resource<TimelineData>;
  setResource: (updater: (prev: Resource<TimelineData> | null) => Resource<TimelineData> | null) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const [langs, setLangs] = useState<Record<string, Lang>>({});
  const sensors = useSensors(useSensor(PointerSensor));
  const items = [...resource.data.items].sort((a, b) => a.order - b.order);

  function update(id: string, patch: Partial<TimelineItem>) {
    setResource((prev) =>
      prev
        ? { ...prev, data: { items: prev.data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) } }
        : prev
    );
  }

  function updateField(id: string, field: "year" | "title" | "desc", lang: Lang, value: string) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    update(id, { [field]: { ...item[field], [lang]: value } } as Partial<TimelineItem>);
  }

  function addItem() {
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order), -1);
    setResource((prev) =>
      prev
        ? {
            ...prev,
            data: {
              items: [
                ...prev.data.items,
                { id: uuidv4(), order: maxOrder + 1, year: emptyBilingual(), title: emptyBilingual(), desc: emptyBilingual() },
              ],
            },
          }
        : prev
    );
  }

  function removeItem(id: string) {
    if (!confirm("Delete this timeline item?")) return;
    setResource((prev) => (prev ? { ...prev, data: { items: prev.data.items.filter((it) => it.id !== id) } } : prev));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    setResource((prev) => (prev ? { ...prev, data: { items: reorder(items, oldIndex, newIndex) } } : prev));
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <button onClick={addItem} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
          + Add item
        </button>
        <button
          onClick={onSave}
          disabled={busy}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const lang = langs[item.id] || "nl";
              return (
                <SortableRow key={item.id} id={item.id}>
                  {({ listeners, attributes }) => (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <DragHandle listeners={listeners} attributes={attributes} />
                        <LangToggle lang={lang} setLang={(l) => setLangs((p) => ({ ...p, [item.id]: l }))} />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                      <input
                        value={item.year[lang]}
                        onChange={(e) => updateField(item.id, "year", lang, e.target.value)}
                        placeholder="Year"
                        className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                      <input
                        value={item.title[lang]}
                        onChange={(e) => updateField(item.id, "title", lang, e.target.value)}
                        placeholder="Title"
                        className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={item.desc[lang]}
                        onChange={(e) => updateField(item.id, "desc", lang, e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </SortableRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function ProjectsEditor({
  resource,
  setResource,
  onSave,
  apiFetch,
  busy,
  setToast,
}: {
  resource: Resource<ProjectsData>;
  setResource: (updater: (prev: Resource<ProjectsData> | null) => Resource<ProjectsData> | null) => void;
  onSave: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  busy: boolean;
  setToast: (t: Toast | null) => void;
}) {
  const [langs, setLangs] = useState<Record<string, Lang>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const items = [...resource.data.items].sort((a, b) => a.order - b.order);

  function update(id: string, patch: Partial<ProjectItem>) {
    setResource((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, items: prev.data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) } }
        : prev
    );
  }

  function updateField(id: string, field: "title" | "desc", lang: Lang, value: string) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    update(id, { [field]: { ...item[field], [lang]: value } } as Partial<ProjectItem>);
  }

  function addItem() {
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order), -1);
    setResource((prev) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              items: [
                ...prev.data.items,
                { id: uuidv4(), order: maxOrder + 1, title: emptyBilingual(), desc: emptyBilingual(), file: "" },
              ],
            },
          }
        : prev
    );
  }

  function removeItem(id: string) {
    if (!confirm("Delete this project?")) return;
    setResource((prev) =>
      prev ? { ...prev, data: { ...prev.data, items: prev.data.items.filter((it) => it.id !== id) } } : prev
    );
  }

  function updateGithubUrl(url: string) {
    setResource((prev) => (prev ? { ...prev, data: { ...prev.data, githubUrl: url } } : prev));
  }

  async function handleUpload(id: string, file: File) {
    setUploading(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);
      const res = await apiFetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "Upload failed" });
        return;
      }
      update(id, { file: file.name });
      setToast({ type: "success", message: "PDF uploaded." });
    } catch {
      setToast({ type: "error", message: "Upload failed" });
    } finally {
      setUploading(null);
    }
  }

  async function handleDeletePdf(id: string, filename: string) {
    if (!filename || !confirm(`Delete ${filename}?`)) return;
    try {
      const res = await apiFetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error || "Delete failed" });
        return;
      }
      update(id, { file: "" });
      setToast({ type: "success", message: "PDF deleted." });
    } catch {
      setToast({ type: "error", message: "Delete failed" });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    setResource((prev) => (prev ? { ...prev, data: { ...prev.data, items: reorder(items, oldIndex, newIndex) } } : prev));
  }

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400">GitHub profile URL</label>
        <input
          value={resource.data.githubUrl}
          onChange={(e) => updateGithubUrl(e.target.value)}
          className="w-full max-w-md rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        />
      </div>

      <div className="mb-4 flex justify-between">
        <button onClick={addItem} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
          + Add project
        </button>
        <button
          onClick={onSave}
          disabled={busy}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const lang = langs[item.id] || "nl";
              return (
                <SortableRow key={item.id} id={item.id}>
                  {({ listeners, attributes }) => (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <DragHandle listeners={listeners} attributes={attributes} />
                        <LangToggle lang={lang} setLang={(l) => setLangs((p) => ({ ...p, [item.id]: l }))} />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                      <input
                        value={item.title[lang]}
                        onChange={(e) => updateField(item.id, "title", lang, e.target.value)}
                        placeholder="Title"
                        className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={item.desc[lang]}
                        onChange={(e) => updateField(item.id, "desc", lang, e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{item.file || "No PDF"}</span>
                        <label className="cursor-pointer rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800">
                          {uploading === item.id ? "Uploading…" : "Upload PDF"}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            disabled={uploading === item.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(item.id, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {item.file && (
                          <button
                            onClick={() => handleDeletePdf(item.id, item.file)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Delete PDF
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </SortableRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function HomeEditor({
  resource,
  setResource,
  onSave,
  busy,
}: {
  resource: Resource<HomeData>;
  setResource: (updater: (prev: Resource<HomeData> | null) => Resource<HomeData> | null) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const [langs, setLangs] = useState<Record<string, Lang>>({});
  const sensors = useSensors(useSensor(PointerSensor));
  const blocks = [...resource.data.blocks].sort((a, b) => a.order - b.order);

  function updateHeroTitle(value: string) {
    setResource((prev) => (prev ? { ...prev, data: { ...prev.data, heroTitle: value } } : prev));
  }

  function update(id: string, patch: Partial<HomeBlock>) {
    setResource((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, blocks: prev.data.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) } }
        : prev
    );
  }

  function updateField(id: string, field: "title" | "text", lang: Lang, value: string) {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    update(id, { [field]: { ...block[field], [lang]: value } } as Partial<HomeBlock>);
  }

  function addBlock() {
    const maxOrder = blocks.reduce((m, b) => Math.max(m, b.order), -1);
    setResource((prev) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              blocks: [
                ...prev.data.blocks,
                { id: uuidv4(), order: maxOrder + 1, title: emptyBilingual(), text: emptyBilingual() },
              ],
            },
          }
        : prev
    );
  }

  function removeBlock(id: string) {
    if (!confirm("Delete this block?")) return;
    setResource((prev) =>
      prev ? { ...prev, data: { ...prev.data, blocks: prev.data.blocks.filter((b) => b.id !== id) } } : prev
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    setResource((prev) => (prev ? { ...prev, data: { ...prev.data, blocks: reorder(blocks, oldIndex, newIndex) } } : prev));
  }

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400">Hero title</label>
        <input
          value={resource.data.heroTitle}
          onChange={(e) => updateHeroTitle(e.target.value)}
          className="w-full max-w-md rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        />
      </div>

      <div className="mb-4 flex justify-between">
        <button onClick={addBlock} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
          + Add block
        </button>
        <button
          onClick={onSave}
          disabled={busy}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {blocks.map((block) => {
              const lang = langs[block.id] || "nl";
              return (
                <SortableRow key={block.id} id={block.id}>
                  {({ listeners, attributes }) => (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <DragHandle listeners={listeners} attributes={attributes} />
                        <LangToggle lang={lang} setLang={(l) => setLangs((p) => ({ ...p, [block.id]: l }))} />
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                      <input
                        value={block.title[lang]}
                        onChange={(e) => updateField(block.id, "title", lang, e.target.value)}
                        placeholder="Title"
                        className="mb-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={block.text[lang]}
                        onChange={(e) => updateField(block.id, "text", lang, e.target.value)}
                        placeholder="Text"
                        rows={3}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </SortableRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
