"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarState>({
  collapsed: false,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
