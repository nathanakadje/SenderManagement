import { LayoutDashboard, Users, PlusCircle, Layers, Settings, Radio, HelpCircle, ChevronRight } from "lucide-react";

type View = "dashboard" | "create" | "management" | "modals";

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "management" as View, label: "Senders", icon: Users },
  { id: "create" as View, label: "Create Sender", icon: PlusCircle },
  { id: "modals" as View, label: "Actions & Modals", icon: Layers },
];

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ background: "var(--sidebar-bg, #1e3a8a)" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Radio size={15} color="#93c5fd" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>
              Aroli<span style={{ color: "#93c5fd" }}>sender</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
        <p
          className="px-3 mb-3"
          style={{ color: "rgba(147,197,253,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Navigation
        </p>

        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 relative"
              style={{
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: isActive ? "#ffffff" : "#93c5fd",
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "#93c5fd" }}
                />
              )}
              <Icon size={15} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-3" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

        <p
          className="px-3 mb-3"
          style={{ color: "rgba(147,197,253,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          System
        </p>

        {[{ icon: Settings, label: "Settings" }, { icon: HelpCircle, label: "Help & Docs" }].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{ color: "#93c5fd" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <Icon size={15} strokeWidth={2} />
            <span style={{ fontSize: "0.875rem" }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
          style={{ background: "rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.13)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.08)")}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#60a5fa", color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.8125rem", lineHeight: 1.2 }}>Admin User</p>
            <p style={{ color: "#93c5fd", fontSize: "0.7rem" }} className="truncate">admin@arolisender.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
