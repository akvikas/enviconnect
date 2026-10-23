import { FormEvent, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Database,
  Filter as FilterIcon,
  Leaf,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Sprout,
  Users,
  X,
} from "lucide-react";
import {
  Category,
  Project,
  loadProjects,
  newId,
  saveProjects,
  seedProjects,
} from "../lib/projects";

export const Route = createFileRoute("/")({ component: EnviConnect });

export type Filter = "all" | Category;
export type Draft = {
  title: string;
  description: string;
  category: "" | Category;
  hours: string;
  location: string;
};

export const emptyDraft: Draft = {
  title: "",
  description: "",
  category: "",
  hours: "",
  location: "",
};

export const labels: Record<Category, string> = {
  cleanup: "Clean-up",
  growing: "Growing",
  education: "Education",
};

export function EnviConnect() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = loadProjects();
      setProjects(stored.projects);
      setJoinedIds(stored.joinedIds);
    } catch {
      setProjects(seedProjects);
      setJoinedIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visibleProjects = useMemo(
    () =>
      projects
        .filter((project) => filter === "all" || project.category === filter)
        .sort((a, b) => b.createdAt - a.createdAt),
    [projects, filter]
  );

  const totalParticipants = projects.reduce(
    (sum, project) => sum + project.participants,
    0
  );
  const totalHours = projects.reduce(
    (sum, project) => sum + project.participants * project.hours,
    0
  );

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4000);
  }

  function persist(nextProjects: Project[], nextJoinedIds: string[]) {
    setProjects(nextProjects);
    setJoinedIds(nextJoinedIds);
    saveProjects({ projects: nextProjects, joinedIds: nextJoinedIds });
  }

  function toggleJoin(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const joined = joinedIds.includes(id);
    const nextProjects = projects.map((p) =>
      p.id === id
        ? {
            ...p,
            participants: Math.max(0, p.participants + (joined ? -1 : 1)),
          }
        : p
    );
    const nextJoinedIds = joined
      ? joinedIds.filter((joinedId) => joinedId !== id)
      : [...joinedIds, id];

    persist(nextProjects, nextJoinedIds);
    showToast(
      joined
        ? `Left "${project.title}". Pledged hours updated.`
        : `Joined "${project.title}"! You are now pledged.`
    );
  }

  function resetToSeeds() {
    persist(seedProjects, []);
    setFilter("all");
    showToast("Restored demo community projects.");
  }

  function validateDraft(currentDraft: Draft): Partial<Record<keyof Draft, string>> {
    const nextErrors: Partial<Record<keyof Draft, string>> = {};
    const titleTrimmed = currentDraft.title.trim();
    const descTrimmed = currentDraft.description.trim();
    const hoursNum = Number(currentDraft.hours);

    if (titleTrimmed.length < 3) {
      nextErrors.title = "Project title must be at least 3 characters.";
    } else if (titleTrimmed.length > 80) {
      nextErrors.title = "Project title cannot exceed 80 characters.";
    }

    if (descTrimmed.length < 10) {
      nextErrors.description = "Description must be at least 10 characters.";
    } else if (descTrimmed.length > 500) {
      nextErrors.description = "Description cannot exceed 500 characters.";
    }

    if (!currentDraft.category) {
      nextErrors.category = "Please select a category.";
    }

    if (
      !currentDraft.hours ||
      !Number.isInteger(hoursNum) ||
      hoursNum < 1 ||
      hoursNum > 40
    ) {
      nextErrors.hours = "Enter a whole number between 1 and 40 hours.";
    }

    if (currentDraft.location.trim().length > 100) {
      nextErrors.location = "Location cannot exceed 100 characters.";
    }

    return nextErrors;
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const project: Project = {
      id: newId(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category as Category,
      hours: Number(draft.hours),
      participants: 1,
      location: draft.location.trim() || undefined,
      createdAt: Date.now(),
    };

    persist([project, ...projects], [...joinedIds, project.id]);
    setDraft(emptyDraft);
    setErrors({});
    setModalOpen(false);
    setFilter("all");
    showToast(`Project "${project.title}" created! You are joined as organizer.`);
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[var(--color-primary)] bg-[var(--color-surface)] px-4 py-3 shadow-lg transition-all animate-in fade-in"
        >
          <CheckCircle2 size={18} className="text-[var(--color-growing)]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a
            href="#projects"
            className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-soft)]">
              <Leaf size={19} />
            </span>
            EnviConnect
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="button button-primary"
            data-testid="start-project-btn"
          >
            <Plus size={18} />
            Start a project
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
        <p className="eyebrow">Small actions, lasting change</p>
        <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl font-bold leading-[.96] tracking-tight sm:text-7xl">
              Make your corner of the world <em>greener.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
              Find people-powered sustainability initiatives near you. Lend a
              hand for an afternoon, or mobilize neighbours around an idea.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="button button-secondary"
            >
              <Sprout size={18} />
              Create project
            </button>
            <button
              onClick={resetToSeeds}
              title="Reset stored projects back to initial seeds"
              className="button button-ghost text-xs text-[var(--color-muted)]"
            >
              <RotateCcw size={15} />
              Reset demo
            </button>
          </div>
        </div>

        {/* Local Storage Notice */}
        <aside className="mt-8 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-2.5 text-xs text-[var(--color-muted)]">
          <Database size={15} className="shrink-0 text-[var(--color-growing)]" />
          <span>
            <strong>Browser-Local Storage:</strong> Projects and pledges are stored in your device&apos;s <code>localStorage</code> (<code>enviconnect-v1</code>) for private testing without an external database.
          </span>
        </aside>

        {/* Impact Counters */}
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat
            icon={<Leaf size={19} />}
            value={projects.length}
            label="active projects"
          />
          <Stat
            icon={<Users size={19} />}
            value={totalParticipants}
            label="participants"
          />
          <Stat
            icon={<CalendarDays size={19} />}
            value={totalHours}
            label="hours pledged"
          />
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-12 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Get involved</p>
              <h2 className="mt-2 font-heading text-3xl font-bold">
                Local projects, shared momentum
              </h2>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter projects by category"
            >
              {(["all", "cleanup", "growing", "education"] as Filter[]).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`filter ${filter === item ? "filter-active" : ""}`}
                    data-testid={`filter-${item}`}
                    aria-pressed={filter === item}
                  >
                    {item === "all" ? "All" : labels[item]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-20 text-center" role="status" aria-label="Loading projects">
              <Loader2 className="mx-auto size-8 animate-spin text-[var(--color-primary)]" />
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Loading community initiatives...
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && visibleProjects.length > 0 && (
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  joined={joinedIds.includes(project.id)}
                  onToggle={() => toggleJoin(project.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State: Filter mismatch */}
          {!isLoading && projects.length > 0 && visibleProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <FilterIcon className="mx-auto size-10 text-[var(--color-muted)] opacity-60" />
              <h3 className="mt-4 font-heading text-xl font-bold">
                No initiatives found under &quot;{labels[filter as Category]}&quot;
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Try switching back to all categories or create the first project in this category.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="button button-secondary mt-6 text-sm"
              >
                Show all initiatives
              </button>
            </div>
          )}

          {/* Empty State: Zero projects in storage */}
          {!isLoading && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <Sprout className="mx-auto size-10 text-[var(--color-growing)]" />
              <h3 className="mt-4 font-heading text-xl font-bold">
                No active projects in your community
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Get the momentum started by organizing a clean-up, community garden, or workshop.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setModalOpen(true)}
                  className="button button-primary"
                >
                  <Plus size={17} />
                  Start the first project
                </button>
                <button
                  onClick={resetToSeeds}
                  className="button button-secondary"
                >
                  <RefreshCw size={17} />
                  Load sample projects
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-[var(--color-muted)] sm:px-8">
        Built for community climate action. Open source &amp; privacy-focused — no tracking or accounts required.
      </footer>

      {/* Create Project Modal */}
      {isModalOpen && (
        <ProjectModal
          draft={draft}
          errors={errors}
          onChange={(key, value) => {
            setDraft({ ...draft, [key]: value });
            if (errors[key]) {
              setErrors({ ...errors, [key]: undefined });
            }
          }}
          onClose={() => {
            setModalOpen(false);
            setErrors({});
          }}
          onSubmit={submitProject}
        />
      )}
    </main>
  );
}

export function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <strong>{value.toLocaleString()}</strong>
      <small>{label}</small>
    </div>
  );
}

export function ProjectCard({
  project,
  joined,
  onToggle,
}: {
  project: Project;
  joined: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="card" data-testid={`project-card-${project.id}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`tag tag-${project.category}`}>
          {labels[project.category]}
        </span>
        <span
          className="flex items-center gap-1 text-sm text-[var(--color-muted)]"
          aria-label={`${project.participants} participants`}
        >
          <Users size={15} />
          {project.participants}
        </span>
      </div>
      <h3 className="mt-5 font-heading text-2xl font-bold leading-tight">
        {project.title}
      </h3>
      <p className="mt-3 min-h-12 leading-6 text-[var(--color-muted)]">
        {project.description}
      </p>
      <div className="mt-6 space-y-2 text-sm text-[var(--color-muted)]">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} />
          {project.hours} estimated {project.hours === 1 ? "hour" : "hours"}
        </p>
        {project.location && (
          <p className="flex items-center gap-2">
            <MapPin size={16} />
            {project.location}
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`mt-7 w-full button ${joined ? "button-joined" : "button-primary"}`}
        data-testid={`toggle-join-${project.id}`}
        aria-pressed={joined}
      >
        {joined ? (
          <>
            <Check size={17} />
            Joined · Leave
          </>
        ) : (
          <>
            <Plus size={17} />
            Join project
          </>
        )}
      </button>
    </article>
  );
}

export function ProjectModal({
  draft,
  errors,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: Draft;
  errors: Partial<Record<keyof Draft, string>>;
  onChange: (key: keyof Draft, value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#1c2b22]/45 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Share an idea</p>
            <h2 id="new-project-title" className="mt-1 font-heading text-3xl font-bold">
              Start a project
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close create project form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          <Field
            label="Project title"
            error={errors.title}
            hint={`${draft.title.length}/80 characters`}
          >
            <input
              id="field-title"
              value={draft.title}
              maxLength={80}
              aria-invalid={!!errors.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="e.g. Community Herb Garden"
            />
          </Field>

          <Field
            label="Description"
            error={errors.description}
            hint={`${draft.description.length}/500 characters`}
          >
            <textarea
              id="field-description"
              value={draft.description}
              maxLength={500}
              aria-invalid={!!errors.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Tell neighbours what to bring and how they can help."
              rows={3}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <select
                id="field-category"
                value={draft.category}
                aria-invalid={!!errors.category}
                onChange={(e) => onChange("category", e.target.value)}
              >
                <option value="">Select category...</option>
                <option value="cleanup">Clean-up</option>
                <option value="growing">Growing</option>
                <option value="education">Education</option>
              </select>
            </Field>

            <Field label="Estimated hours" error={errors.hours}>
              <input
                id="field-hours"
                type="number"
                min="1"
                max="40"
                value={draft.hours}
                aria-invalid={!!errors.hours}
                onChange={(e) => onChange("hours", e.target.value)}
                placeholder="1–40"
              />
            </Field>
          </div>

          <Field
            label="Location (optional)"
            error={errors.location}
            hint={`${draft.location.length}/100 characters`}
          >
            <input
              id="field-location"
              value={draft.location}
              maxLength={100}
              aria-invalid={!!errors.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="Neighbourhood, park, or venue"
            />
          </Field>

          <p className="text-sm text-[var(--color-muted)]">
            You will be automatically pledged as the first participant when created.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              type="submit"
              data-testid="submit-project-btn"
            >
              <Plus size={17} />
              Create project
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      <div className="flex justify-between items-center">
        <span>{label}</span>
        {hint && (
          <span className="text-[11px] font-normal text-[var(--color-muted)]">
            {hint}
          </span>
        )}
      </div>
      {children}
      <span
        className="mt-1 block min-h-5 text-xs font-normal text-[var(--color-education)]"
        role={error ? "alert" : undefined}
      >
        {error}
      </span>
    </label>
  );
}
