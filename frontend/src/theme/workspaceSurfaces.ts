/** Shared workspace surfaces — aligned with landing page tokens (piq-card-surface, soft borders, card-lift). */

/** Default elevated card: portfolio cards, detail sections — visible separation from page gradient */
export const workspaceNavyCardClass =
  "relative isolate overflow-hidden rounded-2xl border border-white/15 bg-card-dashboard bg-cover shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-inset ring-white/[0.07] backdrop-blur-[2px] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_42%)]";

/** Page hero on portfolio detail — same surface language as landing / portfolio cards */
export const workspacePageHeroClass = `${workspaceNavyCardClass} p-6 sm:p-8`;
