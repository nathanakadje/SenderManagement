import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
import { DashboardView } from "./components/DashboardView";
import { SenderFormView } from "./components/SenderFormView";
import { SendersManagementView } from "./components/SendersManagementView";
import { ModalsView } from "./components/ModalsView";
import { LoginView } from "./components/LoginView";

/* MARKER-MAKE-KIT-INVOKED */

type View = "dashboard" | "create" | "management" | "modals";

// Types pour l'authentification
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Gestionnaire de connexion
  const handleLoginSuccess = (userData: User, token: string) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveView("dashboard");
  };

  // Gestionnaire de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Afficher l'écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--muted-foreground)" }}>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Si authentifié, afficher l'application principale
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Blue sidebar */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar 
          activeView={activeView} 
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-hidden">
          {activeView === "dashboard" && <DashboardView />}

          {activeView === "create" && (
            <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
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
// import { useState } from "react";
// import { Sidebar } from "./components/Sidebar";
// import { TopNavbar } from "./components/TopNavbar";
// import { DashboardView } from "./components/DashboardView";
// import { SenderFormView } from "./components/SenderFormView";
// import { SendersManagementView } from "./components/SendersManagementView";
// import { ModalsView } from "./components/ModalsView";


// /* MARKER-MAKE-KIT-INVOKED */

// type View = "dashboard" | "create" | "management" | "modals";

// export default function App() {
//   const [activeView, setActiveView] = useState<View>("dashboard");

//   return (
//     <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--background)" }}>
//       {/* Blue sidebar */}
//       <Sidebar activeView={activeView} onNavigate={setActiveView} />

//       {/* Main area */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <TopNavbar activeView={activeView} />

//         <main className="flex-1 overflow-hidden">
//           {activeView === "dashboard" && <DashboardView />}

//           {activeView === "create" && (
//             <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
//               <div className="max-w-2xl mx-auto">
//                 <div className="mb-6">
//                   {/* <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
//                     Nouveau sender
//                   </h2> */}
//                   <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", marginTop: 4 }}>
//                     Remplissez les informations ci-dessous. Le champ commentaire n'est activé que si le statut est «Rejeté».
//                   </p>
//                 </div>
//                 <SenderFormView submitLabel="Créer le sender" />
//               </div>
//             </div>
//           )}

//           {activeView === "management" && (
//             <SendersManagementView
//               onEdit={() => setActiveView("modals")}
//               onDelete={() => setActiveView("modals")}
//               onCreateNew={() => setActiveView("create")}
//             />
//           )}

//           {activeView === "modals" && <ModalsView />}
//         </main>
//       </div>
//     </div>
//   );
// }
