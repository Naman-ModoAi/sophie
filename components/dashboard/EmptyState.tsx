export function EmptyState() {
  return (
    <div className="bg-surface rounded-md shadow-soft p-12 text-center">
      <svg
        className="w-16 h-16 mx-auto mb-4 text-text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-lg font-semibold font-serif text-text-primary mb-2">
        No upcoming meetings
      </h3>
      <p className="text-text-secondary max-w-sm mx-auto">
        Your Google Calendar is synced. Meetings for the next 7 days will appear here automatically.
      </p>
    </div>
  );
}
