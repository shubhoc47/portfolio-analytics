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
    <div className={`rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
