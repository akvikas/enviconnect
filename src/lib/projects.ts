export type Category = "cleanup" | "growing" | "education";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: Category;
  hours: number;
  participants: number;
  location?: string;
  createdAt: number;
};

export type StoredProjects = { projects: Project[]; joinedIds: string[] };

const storageKey = "enviconnect-v1";

const rows: [string, string, Category, number, number, string][] = [
  ["Riverside Park Clean-up", "Help restore the riverbank and keep shared green space welcoming.", "cleanup", 3, 28, "Riverside Park"],
  ["Community Vegetable Garden", "Grow seasonal food, share knowledge, and make room for neighbours.", "growing", 4, 19, "Maple Street Lot"],
  ["Zero-Waste Workshop", "Learn practical ways to reduce household waste with local makers.", "education", 2, 34, "Civic Library"],
  ["Beach Plastic Sweep", "Collect and sort shoreline plastic before it reaches the ocean.", "cleanup", 4, 41, "South Bay Beach"],
  ["Urban Tree Planting Day", "Plant shade trees and help care for our streets in every season.", "growing", 5, 23, "Eastside Avenue"],
  ["Climate Literacy for Teens", "A hands-on climate session for young people ready to lead change.", "education", 3, 16, "North Community Hub"],
];

export const seedProjects: Project[] = rows.map(([title, description, category, hours, participants, location], index) => ({
  id: `seed-${index + 1}`,
  title, description, category, hours, participants, location,
  createdAt: Date.now() - (index + 1) * 60_000,
}));

export function loadProjects(): StoredProjects {
  if (typeof window === "undefined") return { projects: seedProjects, joinedIds: [] };
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredProjects;
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.joinedIds)) return parsed;
    }
  } catch { /* fall through to seeds */ }
  const initial = { projects: seedProjects, joinedIds: [] };
  saveProjects(initial);
  return initial;
}

export function saveProjects(value: StoredProjects) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
