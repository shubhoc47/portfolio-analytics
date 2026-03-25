interface NotesBlockProps {
  notes: string[];
  title?: string;
  className?: string;
}

export function NotesBlock({
  notes,
  title = "Notes",
  className = "",
}: NotesBlockProps) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-piq-canvas/80 ${className}`}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
        {title}
      </h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
