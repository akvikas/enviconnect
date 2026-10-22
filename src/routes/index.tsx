import { FormEvent, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Leaf, MapPin, Plus, Sprout, Users, X } from "lucide-react";
import { Category, Project, loadProjects, newId, saveProjects } from "../lib/projects";

export const Route = createFileRoute("/")({ component: EnviConnect });

type Filter = "all" | Category;
type Draft = { title: string; description: string; category: "" | Category; hours: string; location: string };
const emptyDraft: Draft = { title: "", description: "", category: "", hours: "", location: "" };
const labels: Record<Category, string> = { cleanup: "Clean-up", growing: "Growing", education: "Education" };

function EnviConnect() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  useEffect(() => {
    const stored = loadProjects();
    setProjects(stored.projects);
    setJoinedIds(stored.joinedIds);
  }, []);

  const visibleProjects = useMemo(() => projects
    .filter((project) => filter === "all" || project.category === filter)
    .sort((a, b) => b.createdAt - a.createdAt), [projects, filter]);
  const totalParticipants = projects.reduce((sum, project) => sum + project.participants, 0);
  const totalHours = projects.reduce((sum, project) => sum + project.participants * project.hours, 0);

  function persist(nextProjects: Project[], nextJoinedIds: string[]) {
    setProjects(nextProjects); setJoinedIds(nextJoinedIds); saveProjects({ projects: nextProjects, joinedIds: nextJoinedIds });
  }

  function toggleJoin(id: string) {
    const joined = joinedIds.includes(id);
    const nextProjects = projects.map((project) => project.id === id
      ? { ...project, participants: Math.max(0, project.participants + (joined ? -1 : 1)) } : project);
    const nextJoinedIds = joined ? joinedIds.filter((joinedId) => joinedId !== id) : [...joinedIds, id];
    persist(nextProjects, nextJoinedIds);
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof Draft, string>> = {};
    const hours = Number(draft.hours);
    if (draft.title.trim().length < 3) nextErrors.title = "Use at least 3 characters.";
    if (draft.description.trim().length < 10) nextErrors.description = "Use at least 10 characters.";
    if (!draft.category) nextErrors.category = "Choose a category.";
    if (!Number.isInteger(hours) || hours < 1 || hours > 40) nextErrors.hours = "Enter a whole number from 1 to 40.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const project: Project = { id: newId(), title: draft.title.trim(), description: draft.description.trim(), category: draft.category as Category, hours, participants: 1, location: draft.location.trim() || undefined, createdAt: Date.now() };
    persist([project, ...projects], [...joinedIds, project.id]);
    setDraft(emptyDraft); setErrors({}); setModalOpen(false); setFilter("all");
  }

  return <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#projects" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-soft)]"><Leaf size={19} /></span>EnviConnect</a>
        <button onClick={() => setModalOpen(true)} className="button button-primary"><Plus size={18} />Start a project</button>
      </div>
    </header>

    <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
      <p className="eyebrow">Small actions, lasting change</p>
      <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-3xl"><h1 className="font-heading text-5xl font-bold leading-[.96] tracking-tight sm:text-7xl">Make your corner of the world <em>greener.</em></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">Find people-powered projects near you. Lend a hand for an afternoon, or create the change you want to see.</p></div>
        <button onClick={() => setModalOpen(true)} className="button button-secondary shrink-0"><Sprout size={18} />Create project</button>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={<Leaf size={19} />} value={projects.length} label="active projects" />
        <Stat icon={<Users size={19} />} value={totalParticipants} label="participants" />
        <Stat icon={<CalendarDays size={19} />} value={totalHours} label="hours pledged" />
      </div>
    </section>

    <section id="projects" className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="eyebrow">Get involved</p><h2 className="mt-2 font-heading text-3xl font-bold">Local projects, shared momentum</h2></div><div className="flex flex-wrap gap-2" aria-label="Filter projects">{(["all", "cleanup", "growing", "education"] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`filter ${filter === item ? "filter-active" : ""}`}>{item === "all" ? "All" : labels[item]}</button>)}</div></div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} joined={joinedIds.includes(project.id)} onToggle={() => toggleJoin(project.id)} />)}</div>
        {!visibleProjects.length && <p className="py-14 text-center text-[var(--color-muted)]">No projects match this filter yet.</p>}
      </div>
    </section>
    <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-[var(--color-muted)] sm:px-8">Built for community action — no accounts required.</footer>
    {isModalOpen && <ProjectModal draft={draft} errors={errors} onChange={(key, value) => setDraft({ ...draft, [key]: value })} onClose={() => { setModalOpen(false); setErrors({}); }} onSubmit={submitProject} />}
  </main>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) { return <div className="stat"><span>{icon}</span><strong>{value.toLocaleString()}</strong><small>{label}</small></div>; }
function ProjectCard({ project, joined, onToggle }: { project: Project; joined: boolean; onToggle: () => void }) { return <article className="card"><div className="flex items-start justify-between gap-3"><span className={`tag tag-${project.category}`}>{labels[project.category]}</span><span className="flex items-center gap-1 text-sm text-[var(--color-muted)]"><Users size={15} />{project.participants}</span></div><h3 className="mt-5 font-heading text-2xl font-bold leading-tight">{project.title}</h3><p className="mt-3 min-h-12 leading-6 text-[var(--color-muted)]">{project.description}</p><div className="mt-6 space-y-2 text-sm text-[var(--color-muted)]"><p className="flex items-center gap-2"><CalendarDays size={16} />{project.hours} estimated {project.hours === 1 ? "hour" : "hours"}</p>{project.location && <p className="flex items-center gap-2"><MapPin size={16} />{project.location}</p>}</div><button onClick={onToggle} className={`mt-7 w-full button ${joined ? "button-joined" : "button-primary"}`}>{joined ? <><Check size={17} />Joined · Leave</> : <><Plus size={17} />Join project</>}</button></article>; }
function ProjectModal({ draft, errors, onChange, onClose, onSubmit }: { draft: Draft; errors: Partial<Record<keyof Draft, string>>; onChange: (key: keyof Draft, value: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c2b22]/45 p-4" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><p className="eyebrow">Share an idea</p><h2 id="new-project-title" className="mt-1 font-heading text-3xl font-bold">Start a project</h2></div><button className="icon-button" onClick={onClose} aria-label="Close create project form"><X /></button></div><form onSubmit={onSubmit} className="mt-7 space-y-4"><Field label="Project title" error={errors.title}><input value={draft.title} onChange={(e) => onChange("title", e.target.value)} placeholder="What are you organising?" /></Field><Field label="Description" error={errors.description}><textarea value={draft.description} onChange={(e) => onChange("description", e.target.value)} placeholder="Tell neighbours what they can help with." rows={3} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Category" error={errors.category}><select value={draft.category} onChange={(e) => onChange("category", e.target.value)}><option value="">Choose one</option><option value="cleanup">Clean-up</option><option value="growing">Growing</option><option value="education">Education</option></select></Field><Field label="Estimated hours" error={errors.hours}><input type="number" min="1" max="40" value={draft.hours} onChange={(e) => onChange("hours", e.target.value)} placeholder="1–40" /></Field></div><Field label="Location (optional)"><input value={draft.location} onChange={(e) => onChange("location", e.target.value)} placeholder="Neighbourhood or venue" /></Field><p className="text-sm text-[var(--color-muted)]">You’ll be joined automatically when this project is created.</p><div className="flex justify-end gap-3 pt-2"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Plus size={17} />Create project</button></div></form></section></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold">{label}{children}<span className="mt-1 block min-h-5 text-xs font-normal text-[var(--color-education)]">{error}</span></label>; }
