// src/app/components/TopNavbar.tsx
import { useState } from "react";
import { Search, Bell, ChevronDown, User, LogOut, Settings, Sun } from "lucide-react";

const titles: Record<string, { title: string; crumb: string }> = {
  dashboard: { title: "Dashboard", crumb: "Overview" },
  create: { title: "Create Sender", crumb: "Senders / New" },
  management: { title: "Senders Management", crumb: "Senders / All" },
  modals: { title: "Actions Sender", crumb: "Components / Overlays" },
  settings: { title: "Paramètres", crumb: "System / Settings" },
};

interface TopNavbarProps {
  activeView: string;
  user?: { 
    email: string; 
    firstName?: string; 
    lastName?: string;
    role?: string;
  } | null;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToNotifications?: () => void;
}

export function TopNavbar({ activeView, user, onLogout, onNavigateToSettings }: TopNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  // const [notifOpen, setNotifOpen] = useState(false);
  const info = titles[activeView] ?? titles.dashboard;

  // Notifications dynamiques (peuvent être chargées depuis l'API)
  // const notifications = [
  //   { msg: "Sender 'ORANGE_CI' was validated", time: "2 min ago", dot: "var(--emerald)", read: false },
  //   { msg: "'MTN_GH' rejection requires your review", time: "1h ago", dot: "var(--rose)", read: false },
  //   { msg: "Bulk import: 14 senders processed", time: "3h ago", dot: "var(--amber)", read: true },
  // ];

  // const unreadCount = notifications.filter(n => !n.read).length;

  // Récupérer les infos utilisateur
  const getUserName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return "Admin User";
  };

  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "A";
  };

  const getUserEmail = () => {
    if (user?.email) return user.email;
    return "admin@arolisender.io";
  };

  const getUserRole = () => {
    if (user?.role) return user.role;
    return "Administrateur";
  };

  const btnBase: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.15s",
  };

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout?.();
  };

  const handleProfileClick = () => {
    setProfileOpen(false);
    onNavigateToSettings?.();
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: "#ffffff", borderBottom: "1px solid var(--border)" }}
    >
      {/* Breadcrumb + Title */}
      <div>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
          Arolisender / {info.crumb}
        </p>
        <h1 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }}>{info.title}</h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        {/* <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
          style={{ background: "var(--background)", border: "1px solid var(--border)", width: 230 }}
        >
          <Search size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <input
            placeholder="Rechercher un sender…"
            className="bg-transparent outline-none flex-1"
            style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}
          />
          <kbd
            className="px-1.5 py-0.5 rounded"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem", border: "1px solid var(--border)" }}
          >
            ⌘K
          </kbd>
        </div> */}

        {/* Notifications */}
        {/* <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ ...btnBase, color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--rose)", border: "1.5px solid #fff" }} />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ background: "#fff", border: "1px solid var(--border)" }}
            >
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--rose-muted)", color: "var(--rose)" }}>
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50"
                  style={{ 
                    borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                    background: n.read ? "transparent" : "var(--blue-muted)"
                  }}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                  <div className="flex-1">
                    <p style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}>{n.msg}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{n.time}</p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--primary)" }} />
                  )}
                </div>
              ))}
              <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                <button onClick={() => { setNotifOpen(false); onNavigateToNotifications?.(); }} style={{ color: "var(--primary)", fontSize: "0.8125rem", fontWeight: 600 }}>
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "var(--border)" }} />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg"
            style={{ ...btnBase }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffffff")}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}
            >
              {getUserInitial()}
            </div>
            <span style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 600 }}>
              {getUserName()}
            </span>
            <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-11 w-52 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ background: "#fff", border: "1px solid var(--border)" }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>{getUserName()}</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{getUserEmail()}</p>
                <span 
                  className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "var(--blue-muted)", color: "var(--primary)" }}
                >
                  {getUserRole()}
                </span>
              </div>
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
              >
                <User size={14} style={{ color: "var(--muted-foreground)" }} />
                Mon profil
              </button>
              {/* <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
              >
                <Settings size={14} style={{ color: "var(--muted-foreground)" }} />
                Préférences
              </button> */}
              <div style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50"
                  style={{ color: "var(--rose)", fontSize: "0.875rem" }}
                >
                  <LogOut size={14} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
// import { useState } from "react";
// import { Search, Bell, ChevronDown, User, LogOut, Settings, Sun } from "lucide-react";

// const titles: Record<string, { title: string; crumb: string }> = {
//   dashboard: { title: "Dashboard", crumb: "Overview" },
//   create: { title: "Create Sender", crumb: "Senders / New" },
//   management: { title: "Senders Management", crumb: "Senders / All" },
//   modals: { title: "Actions & Modals", crumb: "Components / Overlays" },
// };

// interface TopNavbarProps {
//   activeView: string;
//   user?: { 
//     email: string; 
//     firstName?: string; 
//     lastName?: string;
//     role?: string;
//   } | null;
//   onLogout?: () => void;
//   onNavigateToSettings?: () => void; 
// }

// export function TopNavbar({ activeView, user, onLogout }: TopNavbarProps) {
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const info = titles[activeView] ?? titles.dashboard;

//   // Notifications dynamiques (peuvent être chargées depuis l'API)
//   const notifications = [
//     { msg: "Sender 'ORANGE_CI' was validated", time: "2 min ago", dot: "var(--emerald)", read: false },
//     { msg: "'MTN_GH' rejection requires your review", time: "1h ago", dot: "var(--rose)", read: false },
//     { msg: "Bulk import: 14 senders processed", time: "3h ago", dot: "var(--amber)", read: true },
//   ];

//   const unreadCount = notifications.filter(n => !n.read).length;

//   // Récupérer les infos utilisateur
//   const getUserName = () => {
//     if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
//     if (user?.firstName) return user.firstName;
//     if (user?.email) return user.email.split('@')[0];
//     return "Admin User";
//   };

//   const getUserInitial = () => {
//     if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
//     if (user?.email) return user.email.charAt(0).toUpperCase();
//     return "A";
//   };

//   const getUserEmail = () => {
//     if (user?.email) return user.email;
//     return "admin@arolisender.io";
//   };

//   const getUserRole = () => {
//     if (user?.role) return user.role;
//     return "Administrateur";
//   };

//   const btnBase: React.CSSProperties = {
//     background: "#ffffff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     transition: "all 0.15s",
//   };

//   const handleLogout = () => {
//     setProfileOpen(false);
//     onLogout?.();
//   };

//   return (
//     <header
//       className="h-16 flex items-center justify-between px-6 flex-shrink-0"
//       style={{ background: "#ffffff", borderBottom: "1px solid var(--border)" }}
//     >
//       {/* Breadcrumb + Title */}
//       <div>
//         <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
//           Arolisender / {info.crumb}
//         </p>
//         <h1 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }}>{info.title}</h1>
//       </div>

//       {/* Controls */}
//       <div className="flex items-center gap-2.5">
//         {/* Search */}
//         <div
//           className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
//           style={{ background: "var(--background)", border: "1px solid var(--border)", width: 230 }}
//         >
//           <Search size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
//           <input
//             placeholder="Rechercher un sender…"
//             className="bg-transparent outline-none flex-1"
//             style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}
//           />
//           <kbd
//             className="px-1.5 py-0.5 rounded"
//             style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem", border: "1px solid var(--border)" }}
//           >
//             ⌘K
//           </kbd>
//         </div>

//         {/* Notifications */}
//         <div className="relative">
//           <button
//             onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
//             className="relative w-9 h-9 rounded-lg flex items-center justify-center"
//             style={{ ...btnBase, color: "var(--muted-foreground)" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
//           >
//             <Bell size={15} />
//             {unreadCount > 0 && (
//               <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--rose)", border: "1.5px solid #fff" }} />
//             )}
//           </button>

//           {notifOpen && (
//             <div
//               className="absolute right-0 top-11 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
//               style={{ background: "#fff", border: "1px solid var(--border)" }}
//             >
//               <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
//                 <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>Notifications</span>
//                 {unreadCount > 0 && (
//                   <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--rose-muted)", color: "var(--rose)" }}>
//                     {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
//                   </span>
//                 )}
//               </div>
//               {notifications.map((n, i) => (
//                 <div
//                   key={i}
//                   className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50"
//                   style={{ 
//                     borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
//                     background: n.read ? "transparent" : "var(--blue-muted)"
//                   }}
//                 >
//                   <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
//                   <div className="flex-1">
//                     <p style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}>{n.msg}</p>
//                     <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{n.time}</p>
//                   </div>
//                   {!n.read && (
//                     <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--primary)" }} />
//                   )}
//                 </div>
//               ))}
//               <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
//                 <button style={{ color: "var(--primary)", fontSize: "0.8125rem", fontWeight: 600 }}>
//                   Voir toutes les notifications
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Divider */}
//         <div className="w-px h-5" style={{ background: "var(--border)" }} />

//         {/* Profile */}
//         <div className="relative">
//           <button
//             onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
//             className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg"
//             style={{ ...btnBase }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffffff")}
//           >
//             <div
//               className="w-7 h-7 rounded-full flex items-center justify-center"
//               style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}
//             >
//               {getUserInitial()}
//             </div>
//             <span style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 600 }}>
//               {getUserName()}
//             </span>
//             <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
//           </button>

//           {profileOpen && (
//             <div
//               className="absolute right-0 top-11 w-52 rounded-xl shadow-xl z-50 overflow-hidden"
//               style={{ background: "#fff", border: "1px solid var(--border)" }}
//             >
//               <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
//                 <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>{getUserName()}</p>
//                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{getUserEmail()}</p>
//                 <span 
//                   className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
//                   style={{ background: "var(--blue-muted)", color: "var(--primary)" }}
//                 >
//                   {getUserRole()}
//                 </span>
//               </div>
//               {[
//                 { icon: User, label: "Mon profil", onClick: () => console.log("Profil") },
//                 { icon: Settings, label: "Préférences", onClick: () => console.log("Préférences") },
//                 { icon: Sun, label: "Thème", onClick: () => console.log("Thème") },
//               ].map(({ icon: Icon, label, onClick }) => (
//                 <button
//                   key={label}
//                   onClick={() => {
//                     setProfileOpen(false);
//                     onNavigateToSettings?: () => void; 
//                     // onClick();
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
//                   style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
//                 >
//                   <Icon size={14} style={{ color: "var(--muted-foreground)" }} />
//                   {label}
//                 </button>
//               ))}
//               <div style={{ borderTop: "1px solid var(--border)" }}>
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50"
//                   style={{ color: "var(--rose)", fontSize: "0.875rem" }}
//                 >
//                   <LogOut size={14} />
//                   Déconnexion
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }
// // import { useState } from "react";
// // import { Search, Bell, ChevronDown, User, LogOut, Settings, Sun } from "lucide-react";

// // const titles: Record<string, { title: string; crumb: string }> = {
// //   dashboard: { title: "Dashboard", crumb: "Overview" },
// //   create: { title: "Create Sender", crumb: "Senders / New" },
// //   management: { title: "Senders Management", crumb: "Senders / All" },
// //   modals: { title: "Actions & Modals", crumb: "Components / Overlays" },
// // };

// // export function TopNavbar({ activeView }: { activeView: string }) {
// //   const [profileOpen, setProfileOpen] = useState(false);
// //   const [notifOpen, setNotifOpen] = useState(false);
// //   const info = titles[activeView] ?? titles.dashboard;

// //   const notifications = [
// //     { msg: "Sender 'ORANGE_CI' was validated", time: "2 min ago", dot: "var(--emerald)" },
// //     { msg: "'MTN_GH' rejection requires your review", time: "1h ago", dot: "var(--rose)" },
// //     { msg: "Bulk import: 14 senders processed", time: "3h ago", dot: "var(--amber)" },
// //   ];

// //   const btnBase: React.CSSProperties = {
// //     background: "#ffffff",
// //     border: "1px solid var(--border)",
// //     borderRadius: 8,
// //     cursor: "pointer",
// //     display: "flex",
// //     alignItems: "center",
// //     transition: "all 0.15s",
// //   };

// //   return (
// //     <header
// //       className="h-16 flex items-center justify-between px-6 flex-shrink-0"
// //       style={{ background: "#ffffff", borderBottom: "1px solid var(--border)" }}
// //     >
// //       {/* Breadcrumb + Title */}
// //       <div>
// //         <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
// //           Arolisender / {info.crumb}
// //         </p>
// //         <h1 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }}>{info.title}</h1>
// //       </div>

// //       {/* Controls */}
// //       <div className="flex items-center gap-2.5">
// //         {/* Search */}
// //         <div
// //           className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
// //           style={{ background: "var(--background)", border: "1px solid var(--border)", width: 230 }}
// //         >
// //           <Search size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
// //           <input
// //             placeholder="Rechercher un sender…"
// //             className="bg-transparent outline-none flex-1"
// //             style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}
// //           />
// //           <kbd
// //             className="px-1.5 py-0.5 rounded"
// //             style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem", border: "1px solid var(--border)" }}
// //           >
// //             ⌘K
// //           </kbd>
// //         </div>

// //         {/* Notifications */}
// //         <div className="relative">
// //           <button
// //             onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
// //             className="relative w-9 h-9 rounded-lg flex items-center justify-center"
// //             style={{ ...btnBase, color: "var(--muted-foreground)" }}
// //             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)")}
// //             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
// //           >
// //             <Bell size={15} />
// //             <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--rose)", border: "1.5px solid #fff" }} />
// //           </button>

// //           {notifOpen && (
// //             <div
// //               className="absolute right-0 top-11 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
// //               style={{ background: "#fff", border: "1px solid var(--border)" }}
// //             >
// //               <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
// //                 <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>Notifications</span>
// //                 <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--rose-muted)", color: "var(--rose)" }}>3 nouvelles</span>
// //               </div>
// //               {notifications.map((n, i) => (
// //                 <div
// //                   key={i}
// //                   className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50"
// //                   style={{ borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none" }}
// //                 >
// //                   <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
// //                   <div>
// //                     <p style={{ color: "var(--foreground)", fontSize: "0.8125rem" }}>{n.msg}</p>
// //                     <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{n.time}</p>
// //                   </div>
// //                 </div>
// //               ))}
// //               <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
// //                 <button style={{ color: "var(--primary)", fontSize: "0.8125rem", fontWeight: 600 }}>Voir tout</button>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         {/* Divider */}
// //         <div className="w-px h-5" style={{ background: "var(--border)" }} />

// //         {/* Profile */}
// //         <div className="relative">
// //           <button
// //             onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
// //             className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg"
// //             style={{ ...btnBase }}
// //             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--accent)")}
// //             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffffff")}
// //           >
// //             <div
// //               className="w-7 h-7 rounded-full flex items-center justify-center"
// //               style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}
// //             >
// //               A
// //             </div>
// //             <span style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 600 }}>Admin</span>
// //             <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
// //           </button>

// //           {profileOpen && (
// //             <div
// //               className="absolute right-0 top-11 w-52 rounded-xl shadow-xl z-50 overflow-hidden"
// //               style={{ background: "#fff", border: "1px solid var(--border)" }}
// //             >
// //               <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
// //                 <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem" }}>Admin User</p>
// //                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>admin@arolisender.io</p>
// //               </div>
// //               {[
// //                 { icon: User, label: "Mon profil" },
// //                 { icon: Settings, label: "Préférences" },
// //                 { icon: Sun, label: "Thème" },
// //               ].map(({ icon: Icon, label }) => (
// //                 <button
// //                   key={label}
// //                   className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
// //                   style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
// //                 >
// //                   <Icon size={14} style={{ color: "var(--muted-foreground)" }} />
// //                   {label}
// //                 </button>
// //               ))}
// //               <div style={{ borderTop: "1px solid var(--border)" }}>
// //                 <button
// //                   className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50"
// //                   style={{ color: "var(--rose)", fontSize: "0.875rem" }}
// //                 >
// //                   <LogOut size={14} />
// //                   Déconnexion
// //                 </button>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }
