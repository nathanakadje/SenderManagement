// src/app/components/NotificationsView.tsx
import { useState, useEffect } from "react";
import { 
  Bell, CheckCircle2, XCircle, AlertCircle, Info, 
  Clock, Trash2, CheckCheck, Filter, ChevronDown,
  Search, ChevronLeft, ChevronRight, Eye, EyeOff
} from "lucide-react";
import { Notification as NotificationToast, NotificationType } from "./Notification";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: string;
  senderName?: string;
  senderId?: number;
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ type: NotificationType; message: string } | null>(null);

  // Types de notifications disponibles
  const notificationTypes = [
    { value: "success", label: "Succès", icon: CheckCircle2, color: "#10b981" },
    { value: "error", label: "Erreur", icon: XCircle, color: "#ef4444" },
    { value: "warning", label: "Avertissement", icon: AlertCircle, color: "#f59e0b" },
    { value: "info", label: "Information", icon: Info, color: "#3b82f6" },
  ];

  const showNotification = (type: NotificationType, message: string) => {
    setNotificationToast({ type, message });
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Charger les notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...notifications];
    
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    
    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [notifications, searchTerm, typeFilter]);

  const fetchNotifications = async () => {
    try {
      // Simuler le chargement depuis l'API
      // À remplacer par votre vrai endpoint
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Sender validé",
          message: "Le sender 'ORANGE_CI' a été validé avec succès",
          type: "success",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          senderName: "ORANGE_CI",
          senderId: 1
        },
        {
          id: 2,
          title: "Rejet nécessite une attention",
          message: "Le sender 'MTN_GH' a été rejeté. Veuillez vérifier les motifs.",
          type: "error",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          senderName: "MTN_GH",
          senderId: 2
        },
        {
          id: 3,
          title: "Import groupé terminé",
          message: "14 senders ont été importés avec succès",
          type: "info",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
          id: 4,
          title: "Mise à jour du système",
          message: "Nouvelle version disponible. Mettez à jour pour bénéficier des dernières fonctionnalités.",
          type: "warning",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ];
      
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
      showNotification('error', "Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: number) => {
    try {
      // Appel API pour marquer comme lue
      // await fetch(`http://localhost:3000/api/notifications/${id}/read`, { method: 'PUT' });
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      showNotification('success', "Notification marquée comme lue");
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      // Appel API pour tout marquer
      // await fetch('http://localhost:3000/api/notifications/read-all', { method: 'PUT' });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showNotification('success', "Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: number) => {
    try {
      // Appel API pour supprimer
      // await fetch(`http://localhost:3000/api/notifications/${id}`, { method: 'DELETE' });
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      showNotification('success', "Notification supprimée");
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  // Supprimer toutes les notifications
  const deleteAllNotifications = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les notifications ?")) {
      try {
        // Appel API pour tout supprimer
        // await fetch('http://localhost:3000/api/notifications', { method: 'DELETE' });
        
        setNotifications([]);
        showNotification('success', "Toutes les notifications ont été supprimées");
      } catch (err) {
        console.error("Erreur:", err);
      }
    }
  };

  // Obtenir l'icône du type de notification
  const getTypeIcon = (type: string) => {
    const found = notificationTypes.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon size={16} style={{ color: found.color }} />;
    }
    return <Bell size={16} />;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return "Hier";
    return date.toLocaleDateString('fr-FR');
  };

  // Pagination
  const unreadCount = notifications.filter(n => !n.read).length;
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const inputStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    outline: "none",
    transition: "all 0.15s",
    width: "100%",
  };

  const pillStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0.4rem 0.75rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--muted-foreground)",
    fontSize: "0.8125rem",
    cursor: "pointer",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--muted-foreground)" }}>Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
      {notificationToast && (
        <NotificationToast
          type={notificationToast.type}
          message={notificationToast.message}
          onClose={() => setNotificationToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Notifications
            </h1>
            <p style={{ color: "var(--muted-foreground)" }}>
              Gérez toutes vos notifications et alertes
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--rose)", color: "var(--rose)" }}
              >
                <Trash2 size={14} /> Tout supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl border mb-4" style={{ borderColor: "var(--border)" }}>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="text"
                  placeholder="Rechercher une notification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{ ...pillStyle, background: showFilters ? "var(--blue-muted)" : "#fff" }}
              >
                <Filter size={12} /> Filtres
              </button>
              {unreadCount > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--rose-muted)", color: "var(--rose)" }}>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <div className="relative">
                <button
                  onClick={() => setTypeOpen(!typeOpen)}
                  style={{ ...pillStyle, borderColor: typeFilter ? "var(--primary)" : "var(--border)" }}
                >
                  {typeFilter ? notificationTypes.find(t => t.value === typeFilter)?.label : "Type"}
                  <ChevronDown size={11} />
                </button>
                {typeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 rounded-lg shadow-lg z-50 overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                    <button
                      className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50"
                      onClick={() => { setTypeFilter(""); setTypeOpen(false); }}
                    >
                      Tous
                    </button>
                    {notificationTypes.map(type => (
                      <button
                        key={type.value}
                        className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => { setTypeFilter(type.value); setTypeOpen(false); }}
                      >
                        {getTypeIcon(type.value)}
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--foreground)", fontWeight: 500 }}>Aucune notification</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              Vous êtes à jour ! Aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-all hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {formatDate(notification.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
                          </button>
                        </div>
                      </div>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                        {notification.message}
                      </p>
                      {notification.senderName && (
                        <p className="text-xs mt-2" style={{ color: "var(--primary)" }}>
                          Sender: {notification.senderName}
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--primary)" }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {filteredNotifications.length} notification(s)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border disabled:opacity-40"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border disabled:opacity-40"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}