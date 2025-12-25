import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-8 animate-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
