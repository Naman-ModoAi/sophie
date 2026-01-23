export function TopNav({ userEmail }: { userEmail: string }) {
  return (
    <header className="h-16 bg-surface border-b border-text/10 flex items-center justify-between px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-text/70">{userEmail}</span>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-text/70 hover:text-text transition-colors px-3 py-1.5 rounded-md hover:bg-text/5"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
