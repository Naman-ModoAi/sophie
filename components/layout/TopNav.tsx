export function TopNav({ userEmail }: { userEmail: string }) {
  return (
    <header className="h-12 bg-surface border-b border-text-primary/10 flex items-center justify-between px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">{userEmail}</span>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-text-secondary hover:text-text-primary transition-all duration-300 px-3 py-1.5 rounded-md hover:bg-text-primary/5"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
