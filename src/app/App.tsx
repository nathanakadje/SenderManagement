import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
import { DashboardView } from "./components/DashboardView";
import { SenderFormView } from "./components/SenderFormView";
import { SendersManagementView } from "./components/SendersManagementView";
import { ModalsView } from "./components/ModalsView";

/* MARKER-MAKE-KIT-INVOKED */

type View = "dashboard" | "create" | "management" | "modals";

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Blue sidebar */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar activeView={activeView} />

        <main className="flex-1 overflow-hidden">
          {activeView === "dashboard" && <DashboardView />}

          {activeView === "create" && (
            <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
                    Nouveau sender
                  </h2>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginTop: 4 }}>
                    Remplissez les informations ci-dessous. Le champ commentaire n'est activé que si le statut est «Rejeté».
                  </p>
                </div>
                <SenderFormView submitLabel="Créer le sender" />
              </div>
            </div>
          )}

          {activeView === "management" && (
            <SendersManagementView
              onEdit={() => setActiveView("modals")}
              onDelete={() => setActiveView("modals")}
              onCreateNew={() => setActiveView("create")}
            />
          )}

          {activeView === "modals" && <ModalsView />}
        </main>
      </div>
    </div>
  );
}
