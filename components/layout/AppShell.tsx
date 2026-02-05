import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
  userEmail: string;
}

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
