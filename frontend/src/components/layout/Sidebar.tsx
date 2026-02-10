"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  PenLine,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Watchlist",
    icon: <BarChart3 size={18} />,
    match: (pathname) => pathname === "/",
  },
  {
    href: "/reports",
    label: "Research",
    icon: <BookOpen size={18} />,
    match: (pathname) => pathname.startsWith("/reports"),
  },
  {
    href: "/journal",
    label: "Journal",
    icon: <PenLine size={18} />,
    match: (pathname) => pathname.startsWith("/journal"),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-brodus-border bg-brodus-panel transition-all duration-200 ${
        collapsed ? "w-14" : "w-[220px]"
      }`}
    >
      <div className="flex h-12 items-center border-b border-brodus-border px-4">
        {collapsed ? (
          <span className="text-sm font-bold text-brodus-accent">B</span>
        ) : (
          <span className="text-sm font-bold tracking-wider text-brodus-text">
            BRODUS
          </span>
        )}
      </div>

      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-brodus-surface text-brodus-text"
                      : "text-brodus-muted hover:bg-brodus-hover hover:text-brodus-text"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {collapsed ? null : <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-brodus-border px-2 py-3">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded px-2.5 py-2 text-sm text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
          type="button"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <>
              <PanelLeftClose size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
