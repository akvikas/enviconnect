import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EnviConnect" }, { name: "description", content: "Local action, shared impact." },
      { name: "theme-color", content: "#1b4332" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }, { rel: "stylesheet", href: styles },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: () => <html lang="en"><head><HeadContent /></head><body><Outlet /><Scripts /></body></html>,
});
