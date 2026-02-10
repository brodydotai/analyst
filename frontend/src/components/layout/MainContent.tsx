"use client";

import type { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

export default function MainContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`min-h-screen transition-all duration-200 ${
        collapsed ? "ml-14" : "ml-[220px]"
      }`}
    >
      <div className="px-6 py-5">{children}</div>
    </main>
  );
}
