import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Employees", to: "/employees" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: BarChart2, label: "Reports", to: "/reports" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(180deg, oklch(0.25 0.042 235) 0%, oklch(0.19 0.042 235) 100%)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <img
            src="/assets/logo.jpeg"
            alt="Infinexy Finance"
            className="h-12 w-auto object-contain"
          />
          <button
            type="button"
            className="ml-auto lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="nav.section">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.to ||
              (item.to !== "/" && currentPath.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-white hover:text-white hover:bg-white/10"
                }`}
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Brand footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/50 font-medium">Infinexy Doc v1.0</p>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-4 lg:px-6 flex-shrink-0 shadow-xs">
          <button
            type="button"
            className="lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9 w-56 h-9 bg-muted/50 border-transparent focus:border-border"
                data-ocid="header.search_input"
              />
            </div>
            <button
              type="button"
              className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              data-ocid="header.notification_button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
