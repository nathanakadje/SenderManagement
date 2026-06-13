import { useState, useEffect } from "react";
import { 
  Edit2, Trash2, History, AlertTriangle, X, Clock, CheckCircle2, ShieldAlert,
  Search, ChevronDown, Filter, ChevronLeft, ChevronRight, Square, CheckSquare,
  Trash, RefreshCw, FileSpreadsheet, FileText
} from "lucide-react";
import { SenderFormView } from "./SenderFormView";
import { Notification, NotificationType } from "./Notification";

/* ── status badge ── */
const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Validated: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
    Pending:   { bg: "var(--amber-muted)",   color: "var(--amber)"   },
    Rejected:  { bg: "var(--rose-muted)",    color: "var(--rose)"    },
  };
  const s = map[status] ?? { bg: "var(--secondary)", color: "var(--muted-foreground)" };
  return (
    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color, fontSize: "0.75rem" }}>
      {status}
    </span>
  );
};

interface Sender {
  id: number;
  name: string;
  country: string;
  operator: string;
  status: string;
  comment: string | null;
  date_created: string;
  is_custom_country?: boolean;
}

interface Filters {
  name: string;
  status: string;
  country: string;
  operator: string;
}

interface EditModalProps {
  sender: Sender;
  onClose: () => void;
  onUpdate: () => void;
  showNotification: (type: NotificationType, message: string) => void;
}

/* ── Edit Modal ── */
function EditModal({ sender, onClose, onUpdate, showNotification }: EditModalProps) {
  const [history, setHistory] = useState<Array<{ action: string; user: string; date: string }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/senders/${sender.id}/history`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Erreur chargement historique:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [sender.id]);

  const handleSubmit = async (formData: any) => {
    try {
      const updateData = {
        senderName: formData.senderName,
        country: formData.country,
        operator: formData.operator,
        status: formData.status,
        comment: formData.comment || null,
      };
      
      const response = await fetch(`http://localhost:3000/api/senders/${sender.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      showNotification('success', `Sender "${formData.senderName}" modifié avec succès`);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      showNotification('error', "Erreur lors de la modification du sender");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
              <Edit2 size={16} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1rem" }}>Modifier le sender</span>
                <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                  #{sender.id}
                </code>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>Toutes les modifications sont tracées automatiquement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          <SenderFormView
            initialData={{
              senderName: sender.name,
              country: sender.country,
              operator: sender.operator,
              status: sender.status,
              comment: sender.comment || "",
            }}
            isModal
            onCancel={onClose}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
          />
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}
            >
              <History size={13} style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--muted-foreground)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Historique des modifications
              </span>
            </div>
            {loadingHistory ? (
              <div className="px-4 py-3 text-center">
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>Chargement...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="px-4 py-3 text-center">
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>Aucun historique disponible</p>
              </div>
            ) : (
              history.map((log, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-start gap-3"
                  style={{ borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--blue-muted)" }}>
                    <Clock size={11} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 500 }}>{log.action}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{log.user} · {log.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  sender: Sender;
  onClose: () => void;
  onConfirm: () => void;
  showNotification: (type: NotificationType, message: string) => void;
}

/* ── Delete Modal ── */
function DeleteModal({ sender, onClose, onConfirm, showNotification }: DeleteModalProps) {
  const [done, setDone] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/senders/${sender.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDone(true);
        showNotification('success', `Sender "${sender.name}" supprimé avec succès`);
        setTimeout(() => { 
          onConfirm(); 
          onClose();
        }, 1200);
      } else {
        showNotification('error', `Erreur lors de la suppression de "${sender.name}"`);
        setDeleting(false);
      }
    } catch (err) {
      console.error("Erreur:", err);
      showNotification('error', "Erreur de connexion lors de la suppression");
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
      >
        <div className="flex items-center gap-3 px-5 py-3" style={{ background: "var(--rose-muted)", borderBottom: "1px solid rgba(225,29,72,0.15)" }}>
          <ShieldAlert size={15} style={{ color: "var(--rose)" }} />
          <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: "0.8125rem" }}>Action destructive — Confirmation requise</span>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--rose-muted)" }}>
              <Trash2 size={22} style={{ color: "var(--rose)" }} />
            </div>
            <div>
              <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                Supprimer ce sender ?
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                Êtes-vous sûr de vouloir supprimer le sender{" "}
                <code className="px-1.5 py-0.5 rounded mx-0.5" style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                  {sender.name}
                </code>
                ?
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border transition-all font-semibold text-sm"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#fff" }}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={done || deleting}
              className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: done ? "var(--emerald-muted)" : "var(--rose)",
                color: done ? "var(--emerald)" : "#fff",
              }}
            >
              {done ? <><CheckCircle2 size={14} /> Supprimé</> : deleting ? "Suppression..." : <><Trash2 size={14} /> Confirmer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main view ── */
export function ModalsView() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [filteredSenders, setFilteredSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Sender | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sender | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filtres
  const [filters, setFilters] = useState<Filters>({
    name: "",
    status: "",
    country: "",
    operator: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(false);
  
  // Sélection groupée
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];
  
  // Notification
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Charger les senders
  useEffect(() => {
    const fetchSenders = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/senders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSenders(data);
      } catch (err) {
        console.error("Erreur lors du chargement des senders:", err);
        showNotification('error', "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    fetchSenders();
  }, [refreshTrigger]);

  // Application des filtres
  useEffect(() => {
    let filtered = [...senders];
    
    if (filters.name) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    
    if (filters.country) {
      filtered = filtered.filter(s => s.country === filters.country);
    }
    
    if (filters.operator) {
      filtered = filtered.filter(s => 
        s.operator.toLowerCase().includes(filters.operator.toLowerCase())
      );
    }
    
    setFilteredSenders(filtered);
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [senders, filters]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      status: "",
      country: "",
      operator: "",
    });
    showNotification('info', 'Filtres réinitialisés');
  };

  // Gestion de la sélection
  const paginatedSenders = filteredSenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSenders.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = paginatedSenders.map(s => s.id);
      setSelectedIds(new Set(allIds));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === paginatedSenders.length && paginatedSenders.length > 0);
  };

  // Suppression en masse
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    
    try {
      const deletePromises = idsToDelete.map(id =>
        fetch(`http://localhost:3000/api/senders/${id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length === 0) {
        showNotification('success', `${idsToDelete.length} sender(s) supprimé(s) avec succès`);
        setSelectedIds(new Set());
        setSelectAll(false);
        refreshData();
      } else {
        showNotification('error', `Erreur lors de la suppression de ${failed.length} élément(s)`);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression en masse:", err);
      showNotification('error', "Erreur lors de la suppression en masse");
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["ID", "Name", "Country", "Operator", "Status", "Comment", "Date"];
    const rows = filteredSenders.map(s => [
      s.id, s.name, s.country, s.operator, s.status, 
      s.comment || "", new Date(s.date_created).toLocaleDateString('fr-FR')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `senders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('success', `Export CSV effectué (${filteredSenders.length} enregistrements)`);
  };

  // Export Excel
  const exportToExcel = () => {
    const headers = ["ID", "Name", "Country", "Operator", "Status", "Comment", "Date"];
    const rows = filteredSenders.map(s => [
      s.id, s.name, s.country, s.operator, s.status,
      s.comment || "", new Date(s.date_created).toLocaleDateString('fr-FR')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join("\t")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `senders_export_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('success', `Export Excel effectué (${filteredSenders.length} enregistrements)`);
  };

  // Extraction des valeurs uniques pour les filtres
  const uniqueStatuses = [...new Set(senders.map(s => s.status))];
  const uniqueCountries = [...new Set(senders.map(s => s.country))];
  const uniqueOperators = [...new Set(senders.map(s => s.operator))];

  const pillStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "0.4rem 0.75rem",
    borderRadius: 8, border: "1px solid var(--border)", background: "#fff",
    color: "var(--muted-foreground)", fontSize: "0.8125rem", cursor: "pointer",
  };

  const FilterSelect = ({ open, setOpen, value, setValue, options, placeholder }: any) => (
    <div className="relative">
      <button
        style={{ ...pillStyle, borderColor: value ? "var(--primary)" : "var(--border)" }}
        onClick={() => setOpen(!open)}
      >
        {value || placeholder}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50 overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {options.map((opt: string) => (
            <button
              key={opt}
              className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50"
              onClick={() => { setValue(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 h-full">
        <p style={{ color: "var(--muted-foreground)" }}>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto" style={{ background: "var(--background)" }}>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl p-6 w-96" style={{ background: "#fff" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--rose-muted)" }}>
                <Trash2 size={18} style={{ color: "var(--rose)" }} />
              </div>
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
              Êtes-vous sûr de vouloir supprimer <strong>{selectedIds.size}</strong> sender(s) ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg"
                style={{ background: "var(--rose)", color: "#fff" }}
              >
                {isDeleting ? "Suppression..." : `Supprimer (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions */}
      <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            {/* Recherche */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                className="bg-transparent outline-none text-sm flex-1"
                placeholder="Rechercher par nom..."
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={pillStyle}
            >
              <Filter size={12} /> Filtres
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--rose-muted)", color: "var(--rose)" }}
              >
                <Trash size={14} /> Supprimer ({selectedIds.size})
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" style={{  background: "#22c55e", fontWeight: 700, color: "#ffffff", border: "none"}}>
              <FileSpreadsheet size={14}  strokeWidth={2.5} /> Export.xlx
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" style={{  background: "#8b5cf6", fontWeight: 700, color: "#ffffff", border: "none"}}>
              <FileText size={14}  strokeWidth={2.5} /> Export.csv
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <FilterSelect open={statusOpen} setOpen={setStatusOpen} value={filters.status} setValue={(v: string) => setFilters({ ...filters, status: v })} options={uniqueStatuses} placeholder="Statut" />
            <FilterSelect open={countryOpen} setOpen={setCountryOpen} value={filters.country} setValue={(v: string) => setFilters({ ...filters, country: v })} options={uniqueCountries} placeholder="Pays" />
            <FilterSelect open={operatorOpen} setOpen={setOperatorOpen} value={filters.operator} setValue={(v: string) => setFilters({ ...filters, operator: v })} options={uniqueOperators} placeholder="Opérateur" />
            {(filters.name || filters.status || filters.country || filters.operator) && (
              <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--secondary)" }}>
                <X size={11} /> Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#d9e9fd", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 w-10">
                  <button onClick={handleSelectAll}>
                    {selectAll && paginatedSenders.length > 0 ? (
                      <CheckSquare size={16} style={{ color: "var(--primary)" }} />
                    ) : (
                      <Square size={16} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Sender Name</th>
                <th className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Pays</th>
                <th className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Opérateur</th>
                <th className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Statut</th>
                <th className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSenders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <p style={{ color: "var(--muted-foreground)" }}>Aucun résultat trouvé</p>
                  </td>
                </tr>
              ) : (
                paginatedSenders.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => handleSelectOne(row.id)}>
                        {selectedIds.has(row.id) ? (
                          <CheckSquare size={16} style={{ color: "var(--primary)" }} />
                        ) : (
                          <Square size={16} style={{ color: "var(--muted-foreground)" }} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{statusBadge(row.status)}</td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                      <div className="flex gap-2">
                        <button
  onClick={() => setEditTarget(row)}
  className="p-2 rounded-lg transition-all"
  style={{
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #dbeafe"
  }}
  onMouseEnter={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#dbeafe";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#eff6ff";
  }}
>
  <Edit2 size={14} />
</button>
                        {/* <button onClick={() => setEditTarget(row)} className="p-1.5 rounded border hover:bg-blue-200">
                          <Edit2 size={14} />
                        </button> */}
                        {/* <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded border hover:bg-rose-200">
                          <Trash2 size={14} />
                        </button> */}
                        <button
  onClick={() => setDeleteTarget(row)}
  className="p-2 rounded-lg transition-all"
  style={{
    backgroundColor: "#fff1f2",
    color: "#e11d48",
    border: "1px solid #ffe4e6"
  }}
  onMouseEnter={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#ffe4e6";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#fff1f2";
  }}
>
  <Trash2 size={14} />
</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredSenders.length} résultat(s)
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 rounded border text-sm"
            >
              {itemsPerPageOptions.map(opt => (
                <option key={opt} value={opt}>{opt} / page</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-8 h-8 rounded flex items-center justify-center border disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-8 h-8 rounded flex items-center justify-center border disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      {editTarget && (
        <EditModal 
          sender={editTarget} 
          onClose={() => setEditTarget(null)} 
          onUpdate={refreshData}
          showNotification={showNotification}
        />
      )}
      {deleteTarget && (
        <DeleteModal 
          sender={deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          onConfirm={refreshData}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { Edit2, Trash2, History, AlertTriangle, X, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
// import { SenderFormView } from "./SenderFormView";

// /* ── status badge ── */
// const statusBadge = (status: string) => {
//   const map: Record<string, { bg: string; color: string }> = {
//     Validated: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//     Pending:   { bg: "var(--amber-muted)",   color: "var(--amber)"   },
//     Rejected:  { bg: "var(--rose-muted)",    color: "var(--rose)"    },
//   };
//   const s = map[status] ?? { bg: "var(--secondary)", color: "var(--muted-foreground)" };
//   return (
//     <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color, fontSize: "0.75rem" }}>
//       {status}
//     </span>
//   );
// };

// interface Sender {
//   id: number;
//   name: string;
//   country: string;
//   operator: string;
//   status: string;
//   comment: string | null;
//   date_created: string;
//   is_custom_country?: boolean;
// }

// interface EditModalProps {
//   sender: Sender;
//   onClose: () => void;
//   onUpdate: () => void;
// }

// /* ── Edit Modal ── */
// function EditModal({ sender, onClose, onUpdate }: EditModalProps) {
//   const [history, setHistory] = useState<Array<{ action: string; user: string; date: string }>>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);

//   // Charger l'historique du sender
//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const response = await fetch(`http://localhost:3000/api/senders/${sender.id}/history`);
//         if (response.ok) {
//           const data = await response.json();
//           setHistory(data);
//         }
//       } catch (err) {
//         console.error("Erreur chargement historique:", err);
//       } finally {
//         setLoadingHistory(false);
//       }
//     };
//     fetchHistory();
//   }, [sender.id]);

//   // Dans EditModal, modifiez handleSubmit
// const handleSubmit = async (formData: any) => {
//   try {
//     // Transformation des données pour l'API
//     const updateData = {
//       senderName: formData.senderName,
//       country: formData.country,
//       operator: formData.operator,
//       status: formData.status,
//       comment: formData.comment || null,
//     };
    
//     console.log('Envoi des données de mise à jour:', updateData);
    
//     const response = await fetch(`http://localhost:3000/api/senders/${sender.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updateData),
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//     }
    
//     const result = await response.json();
//     console.log('Mise à jour réussie:', result);
    
//     onUpdate(); // Rafraîchir la liste
//     onClose(); // Fermer le modal
//   } catch (err) {
//     console.error("Erreur lors de la mise à jour:", err);
//     alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
//   }
// };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div
//         className="w-full max-w-xl rounded-2xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
//       >
//         {/* Header */}
//         <div
//           className="px-6 py-4 flex items-center justify-between"
//           style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
//               <Edit2 size={16} style={{ color: "var(--primary)" }} />
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1rem" }}>Modifier le sender</span>
//                 <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
//                   #{sender.id}
//                 </code>
//               </div>
//               <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>Toutes les modifications sont tracées automatiquement</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//             style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--background)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* Form */}
//         <div className="px-6 py-5">
//           <SenderFormView
//             initialData={{
//               senderName: sender.name,
//               country: sender.country,
//               operator: sender.operator,
//               status: sender.status,
//               comment: sender.comment || "",
//             }}
//             isModal
//             onCancel={onClose}
//             onSubmit={handleSubmit}
//             submitLabel="Enregistrer les modifications"
//           />
//         </div>

//         {/* History log */}
//         <div className="px-6 pb-6">
//           <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
//             <div
//               className="px-4 py-2.5 flex items-center gap-2"
//               style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}
//             >
//               <History size={13} style={{ color: "var(--primary)" }} />
//               <span style={{ color: "var(--muted-foreground)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
//                 Historique des modifications
//               </span>
//             </div>
//             {loadingHistory ? (
//               <div className="px-4 py-3 text-center">
//                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>Chargement...</p>
//               </div>
//             ) : history.length === 0 ? (
//               <div className="px-4 py-3 text-center">
//                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>Aucun historique disponible</p>
//               </div>
//             ) : (
//               history.map((log, i) => (
//                 <div
//                   key={i}
//                   className="px-4 py-3 flex items-start gap-3"
//                   style={{ borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none" }}
//                 >
//                   <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--blue-muted)" }}>
//                     <Clock size={11} style={{ color: "var(--primary)" }} />
//                   </div>
//                   <div>
//                     <p style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 500 }}>{log.action}</p>
//                     <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{log.user} · {log.date}</p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface DeleteModalProps {
//   sender: Sender;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// /* ── Delete Modal ── */
// function DeleteModal({ sender, onClose, onConfirm }: DeleteModalProps) {
//   const [done, setDone] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const handleConfirm = async () => {
//     setDeleting(true);
//     try {
//       const response = await fetch(`http://localhost:3000/api/senders/${sender.id}`, {
//         method: 'DELETE',
//       });
      
//       if (response.ok) {
//         setDone(true);
//         setTimeout(() => { 
//           onConfirm(); 
//           onClose();
//         }, 1200);
//       } else {
//         console.error("Erreur lors de la suppression");
//         setDeleting(false);
//       }
//     } catch (err) {
//       console.error("Erreur:", err);
//       setDeleting(false);
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div
//         className="w-full max-w-md rounded-2xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
//       >
//         {/* Top danger strip */}
//         <div className="flex items-center gap-3 px-5 py-3" style={{ background: "var(--rose-muted)", borderBottom: "1px solid rgba(225,29,72,0.15)" }}>
//           <ShieldAlert size={15} style={{ color: "var(--rose)" }} />
//           <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: "0.8125rem" }}>Action destructive — Confirmation requise</span>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-6">
//           <div className="flex items-start gap-4 mb-5">
//             <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--rose-muted)" }}>
//               <Trash2 size={22} style={{ color: "var(--rose)" }} />
//             </div>
//             <div>
//               <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
//                 Supprimer ce sender ?
//               </h2>
//               <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.65 }}>
//                 Êtes-vous sûr de vouloir supprimer le sender{" "}
//                 <code className="px-1.5 py-0.5 rounded mx-0.5" style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
//                   {sender.name}
//                 </code>
//                 ? Cette action utilise la <strong style={{ color: "var(--foreground)" }}>Suppression Douce</strong> et peut être annulée.
//               </p>
//             </div>
//           </div>

//           {/* Soft delete callout */}
//           <div
//             className="flex items-start gap-3 p-4 rounded-xl mb-5"
//             style={{ background: "var(--amber-muted)", border: "1px solid rgba(217,119,6,0.2)" }}
//           >
//             <AlertTriangle size={15} style={{ color: "var(--amber)", marginTop: 1, flexShrink: 0 }} />
//             <div>
//               <p style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.8125rem" }}>Suppression Douce activée</p>
//               <p style={{ color: "var(--amber)", fontSize: "0.75rem", opacity: 0.85, lineHeight: 1.5 }}>
//                 L'enregistrement sera archivé pendant 30 jours. Vous pouvez le restaurer via <strong>Paramètres → Corbeille</strong>.
//               </p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={deleting}
//               className="flex-1 py-2.5 rounded-xl border transition-all font-semibold text-sm"
//               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#fff" }}
//               onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//               onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
//             >
//               Annuler
//             </button>
//             <button
//               onClick={handleConfirm}
//               disabled={done || deleting}
//               className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
//               style={{
//                 background: done ? "var(--emerald-muted)" : "var(--rose)",
//                 color: done ? "var(--emerald)" : "#fff",
//                 boxShadow: done ? "none" : "0 2px 12px rgba(225,29,72,0.3)",
//               }}
//             >
//               {done ? <><CheckCircle2 size={14} /> Supprimé</> : deleting ? "Suppression..." : <><Trash2 size={14} /> Confirmer la suppression</>}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Main view ── */
// export function ModalsView() {
//   const [senders, setSenders] = useState<Sender[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editTarget, setEditTarget] = useState<Sender | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<Sender | null>(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Charger les senders depuis l'API
//   useEffect(() => {
//     const fetchSenders = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch('http://localhost:3000/api/senders');
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setSenders(data);
//       } catch (err) {
//         console.error("Erreur lors du chargement des senders:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSenders();
//   }, [refreshTrigger]);

//   const refreshData = () => {
//     setRefreshTrigger(prev => prev + 1);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-6 h-full">
//         <p style={{ color: "var(--muted-foreground)" }}>Chargement des données...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 h-full overflow-auto" style={{ background: "var(--background)" }}>
//       {/* Table principale */}
//       <div
//         className="rounded-xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//       >
//         <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
//           <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Senders — Actions par ligne</span>
//           <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>
//             {senders.length} senders au total
//           </span>
//         </div>
        
//         {senders.length === 0 ? (
//           <div className="px-5 py-8 text-center">
//             <p style={{ color: "var(--muted-foreground)" }}>Aucun sender trouvé</p>
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr style={{ borderBottom: "1px solid var(--border)" }}>
//                 {["Sender Name", "Pays", "Opérateur", "Statut", "Commentaire", "Actions"].map((h) => (
//                   <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {senders.map((row, i) => (
//                 <tr
//                   key={row.id}
//                   className="transition-colors"
//                   style={{ borderBottom: i < senders.length - 1 ? "1px solid var(--border)" : "none" }}
//                   onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
//                   onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
//                 >
//                   <td className="px-5 py-4" style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem" }}>{row.name}</td>
//                   <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//                     {row.country}
//                     {row.is_custom_country && (
//                       <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}>
//                         Personnalisé
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
//                   <td className="px-5 py-4">{statusBadge(row.status)}</td>
//                   <td className="px-5 py-4" style={{ maxWidth: 200 }}>
//                     {row.comment ? (
//                       <span className="truncate block" style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>{row.comment}</span>
//                     ) : (
//                       <span style={{ color: "var(--border)" }}>—</span>
//                     )}
//                   </td>
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => setEditTarget(row)}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
//                         style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "var(--blue-muted)" }}
//                         onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#dbeafe")}
//                         onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--blue-muted)")}
//                       >
//                         <Edit2 size={12} /> Modifier
//                       </button>
//                       <button
//                         onClick={() => setDeleteTarget(row)}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
//                         style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "var(--rose-muted)" }}
//                         onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffe4e6")}
//                         onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rose-muted)")}
//                       >
//                         <Trash2 size={12} /> Supprimer
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Modales */}
//       {editTarget && (
//         <EditModal 
//           sender={editTarget} 
//           onClose={() => setEditTarget(null)} 
//           onUpdate={refreshData}
//         />
//       )}
//       {deleteTarget && (
//         <DeleteModal 
//           sender={deleteTarget} 
//           onClose={() => setDeleteTarget(null)} 
//           onConfirm={refreshData}
//         />
//       )}
//     </div>
//   );
// }
// import { useState } from "react";
// import { Edit2, Trash2, History, AlertTriangle, X, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
// import { SenderFormView } from "./SenderFormView";

// /* ── sample data ── */
// const sampleRejected = { id: 4, name: "AIRTEL_MKT",   country: "Nigeria", operator: "Airtel Nigeria", status: "Rejected",  comment: "Sender name does not comply with operator naming policy for marketing campaigns." };
// const sampleValid    = { id: 1, name: "ORANGE_PROMO", country: "Côte d'Ivoire", operator: "Orange CI",      status: "Validated", comment: "" };
// const samplePending  = { id: 2, name: "MTN_ALERT",    country: "Ghana",         operator: "MTN Ghana",      status: "Pending",   comment: "" };

// const tableRows = [sampleRejected, sampleValid, samplePending];

// /* ── status badge ── */
// const statusBadge = (status: string) => {
//   const map: Record<string, { bg: string; color: string }> = {
//     Validated: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//     Pending:   { bg: "var(--amber-muted)",   color: "var(--amber)"   },
//     Rejected:  { bg: "var(--rose-muted)",    color: "var(--rose)"    },
//   };
//   const s = map[status] ?? { bg: "var(--secondary)", color: "var(--muted-foreground)" };
//   return (
//     <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color, fontSize: "0.75rem" }}>
//       {status}
//     </span>
//   );
// };

// /* ── Edit Modal ── */
// function EditModal({ sender, onClose }: { sender: any; onClose: () => void }) {
//   const history = [
//     { action: "Statut modifié : Pending → Rejected", user: "admin@arolisender.io", date: "13 jan. 2025 – 14:32" },
//     { action: "Sender créé",                          user: "admin@arolisender.io", date: "10 jan. 2025 – 09:15" },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div
//         className="w-full max-w-xl rounded-2xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
//       >
//         {/* Header */}
//         <div
//           className="px-6 py-4 flex items-center justify-between"
//           style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
//               <Edit2 size={16} style={{ color: "var(--primary)" }} />
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1rem" }}>Modifier le sender</span>
//                 <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
//                   #{sender.id}
//                 </code>
//               </div>
//               <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>Toutes les modifications sont tracées automatiquement</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
//             style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--background)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//           >
//             <X size={15} />
//           </button>
//         </div>

//         {/* Form */}
//         <div className="px-6 py-5">
//           <SenderFormView
//             initialData={{
//               senderName: sender.name,
//               country:    sender.country === "Nigeria" ? "NG" : sender.country === "Côte d'Ivoire" ? "CI" : "GH",
//               operator:   sender.operator,
//               status:     sender.status,
//               comment:    sender.comment,
//             }}
//             isModal
//             onCancel={onClose}
//             onSubmit={onClose}
//             submitLabel="Enregistrer les modifications"
//           />
//         </div>

//         {/* History log */}
//         <div className="px-6 pb-6">
//           <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
//             <div
//               className="px-4 py-2.5 flex items-center gap-2"
//               style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}
//             >
//               <History size={13} style={{ color: "var(--primary)" }} />
//               <span style={{ color: "var(--muted-foreground)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
//                 Historique des modifications
//               </span>
//             </div>
//             {history.map((log, i) => (
//               <div
//                 key={i}
//                 className="px-4 py-3 flex items-start gap-3"
//                 style={{ borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none" }}
//               >
//                 <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--blue-muted)" }}>
//                   <Clock size={11} style={{ color: "var(--primary)" }} />
//                 </div>
//                 <div>
//                   <p style={{ color: "var(--foreground)", fontSize: "0.8125rem", fontWeight: 500 }}>{log.action}</p>
//                   <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{log.user} · {log.date}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Delete Modal ── */
// function DeleteModal({ sender, onClose, onConfirm }: { sender: any; onClose: () => void; onConfirm: () => void }) {
//   const [done, setDone] = useState(false);

//   const handleConfirm = () => {
//     setDone(true);
//     setTimeout(() => { onConfirm(); }, 1200);
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div
//         className="w-full max-w-md rounded-2xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}
//       >
//         {/* Top danger strip */}
//         <div className="flex items-center gap-3 px-5 py-3" style={{ background: "var(--rose-muted)", borderBottom: "1px solid rgba(225,29,72,0.15)" }}>
//           <ShieldAlert size={15} style={{ color: "var(--rose)" }} />
//           <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: "0.8125rem" }}>Action destructive — Confirmation requise</span>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-6">
//           <div className="flex items-start gap-4 mb-5">
//             <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--rose-muted)" }}>
//               <Trash2 size={22} style={{ color: "var(--rose)" }} />
//             </div>
//             <div>
//               <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
//                 Supprimer ce sender ?
//               </h2>
//               <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.65 }}>
//                 Êtes-vous sûr de vouloir supprimer le sender{" "}
//                 <code className="px-1.5 py-0.5 rounded mx-0.5" style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
//                   {sender.name}
//                 </code>
//                 ? Cette action utilise la <strong style={{ color: "var(--foreground)" }}>Suppression Douce</strong> et peut être annulée.
//               </p>
//             </div>
//           </div>

//           {/* Soft delete callout */}
//           <div
//             className="flex items-start gap-3 p-4 rounded-xl mb-5"
//             style={{ background: "var(--amber-muted)", border: "1px solid rgba(217,119,6,0.2)" }}
//           >
//             <AlertTriangle size={15} style={{ color: "var(--amber)", marginTop: 1, flexShrink: 0 }} />
//             <div>
//               <p style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.8125rem" }}>Suppression Douce activée</p>
//               <p style={{ color: "var(--amber)", fontSize: "0.75rem", opacity: 0.85, lineHeight: 1.5 }}>
//                 L'enregistrement sera archivé pendant 30 jours. Vous pouvez le restaurer via <strong>Paramètres → Corbeille</strong>.
//               </p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               className="flex-1 py-2.5 rounded-xl border transition-all font-semibold text-sm"
//               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#fff" }}
//               onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//               onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
//             >
//               Annuler
//             </button>
//             <button
//               onClick={handleConfirm}
//               disabled={done}
//               className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
//               style={{
//                 background: done ? "var(--emerald-muted)" : "var(--rose)",
//                 color: done ? "var(--emerald)" : "#fff",
//                 boxShadow: done ? "none" : "0 2px 12px rgba(225,29,72,0.3)",
//               }}
//             >
//               {done ? <><CheckCircle2 size={14} /> Supprimé</> : <><Trash2 size={14} /> Confirmer la suppression</>}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Main view ── */
// export function ModalsView() {
//   const [editTarget,   setEditTarget]   = useState<any>(null);
//   const [deleteTarget, setDeleteTarget] = useState<any>(null);

//   return (
//     <div className="p-6 h-full overflow-auto flex flex-col gap-5" style={{ background: "var(--background)" }}>

//       {/* Intro card */}
//       <div
//         className="rounded-xl p-5 flex items-start gap-4"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//       >
//         <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--blue-muted)" }}>
//           <Layers size={18} style={{ color: "var(--primary)" }} />
//         </div>
//         <div>
//           <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Démonstration des modales</p>
//           <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//             Cliquez sur <strong style={{ color: "var(--primary)" }}>Modifier</strong> ou{" "}
//             <strong style={{ color: "var(--rose)" }}>Supprimer</strong> sur n'importe quelle ligne pour déclencher les modales correspondantes.
//           </p>
//         </div>
//       </div>

//       {/* Demo table */}
//       <div
//         className="rounded-xl overflow-hidden"
//         style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//       >
//         <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
//           <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Senders — Actions par ligne</span>
//           <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>
//             Cliquez sur les boutons pour ouvrir les modales
//           </span>
//         </div>
//         <table className="w-full">
//           <thead>
//             <tr style={{ borderBottom: "1px solid var(--border)" }}>
//               {["Sender Name", "Pays", "Opérateur", "Statut", "Commentaire", "Actions"].map((h) => (
//                 <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {tableRows.map((row, i) => (
//               <tr
//                 key={row.id}
//                 className="transition-colors"
//                 style={{ borderBottom: i < tableRows.length - 1 ? "1px solid var(--border)" : "none" }}
//                 onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
//                 onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
//               >
//                 <td className="px-5 py-4" style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem" }}>{row.name}</td>
//                 <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
//                 <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
//                 <td className="px-5 py-4">{statusBadge(row.status)}</td>
//                 <td className="px-5 py-4" style={{ maxWidth: 200 }}>
//                   {row.comment ? (
//                     <span className="truncate block" style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>{row.comment}</span>
//                   ) : (
//                     <span style={{ color: "var(--border)" }}>—</span>
//                   )}
//                 </td>
//                 <td className="px-5 py-4">
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setEditTarget(row)}
//                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
//                       style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "var(--blue-muted)" }}
//                       onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#dbeafe")}
//                       onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--blue-muted)")}
//                     >
//                       <Edit2 size={12} /> Modifier
//                     </button>
//                     <button
//                       onClick={() => setDeleteTarget(row)}
//                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
//                       style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "var(--rose-muted)" }}
//                       onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffe4e6")}
//                       onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rose-muted)")}
//                     >
//                       <Trash2 size={12} /> Supprimer
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Preview cards */}
//       <div className="grid grid-cols-2 gap-4">
//         <div
//           className="rounded-xl p-5 flex flex-col gap-3"
//           style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//         >
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
//               <Edit2 size={14} style={{ color: "var(--primary)" }} />
//             </div>
//             <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Modale d'édition</span>
//           </div>
//           <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", lineHeight: 1.65 }}>
//             Pré-remplit tous les champs du sender. Le commentaire de rejet s'active automatiquement si le statut est «Rejeté». L'historique des modifications est affiché en pied de modale.
//           </p>
//           <button
//             onClick={() => setEditTarget(sampleRejected)}
//             className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
//             style={{ background: "var(--primary)", color: "#fff" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
//           >
//             Ouvrir la démo →
//           </button>
//         </div>

//         <div
//           className="rounded-xl p-5 flex flex-col gap-3"
//           style={{ background: "#fff", border: "1px solid var(--rose)", boxShadow: "0 1px 4px rgba(225,29,72,0.08)" }}
//         >
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--rose-muted)" }}>
//               <AlertTriangle size={14} style={{ color: "var(--rose)" }} />
//             </div>
//             <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Modale de suppression</span>
//           </div>
//           <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", lineHeight: 1.65 }}>
//             Alerte haute visibilité avec bande de danger. Suppression douce avec notice ambre expliquant la récupération. CTA destructif rouge avec confirmation animée.
//           </p>
//           <button
//             onClick={() => setDeleteTarget(sampleRejected)}
//             className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
//             style={{ background: "var(--rose)", color: "#fff" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#be123c")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rose)")}
//           >
//             Ouvrir la démo →
//           </button>
//         </div>
//       </div>

//       {editTarget   && <EditModal   sender={editTarget}   onClose={() => setEditTarget(null)} />}
//       {deleteTarget && <DeleteModal sender={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => setDeleteTarget(null)} />}
//     </div>
//   );
// }

// /* eslint-disable @typescript-eslint/no-unused-vars */
// function Layers({ size, style }: { size: number; style?: React.CSSProperties }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
//       <polygon points="12 2 2 7 12 12 22 7 12 2" />
//       <polyline points="2 17 12 22 22 17" />
//       <polyline points="2 12 12 17 22 12" />
//     </svg>
//   );
// }
