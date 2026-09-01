type EmptyStateProps = {
  message: string;
  className?: string;
};

export default function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <p
      className={`rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted ${className}`}
    >
      {message}
    </p>
  );
}
