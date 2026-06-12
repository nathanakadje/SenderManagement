import { useState } from "react";
import { Edit2, Trash2, History, AlertTriangle, X, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { SenderFormView } from "./SenderFormView";

/* ── sample data ── */
const sampleRejected = { id: 4, name: "AIRTEL_MKT",   country: "Nigeria", operator: "Airtel Nigeria", status: "Rejected",  comment: "Sender name does not comply with operator naming policy for marketing campaigns." };
const sampleValid    = { id: 1, name: "ORANGE_PROMO", country: "Côte d'Ivoire", operator: "Orange CI",      status: "Validated", comment: "" };
const samplePending  = { id: 2, name: "MTN_ALERT",    country: "Ghana",         operator: "MTN Ghana",      status: "Pending",   comment: "" };

const tableRows = [sampleRejected, sampleValid, samplePending];

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

/* ── Edit Modal ── */
function EditModal({ sender, onClose }: { sender: any; onClose: () => void }) {
  const history = [
    { action: "Statut modifié : Pending → Rejected", user: "admin@arolisender.io", date: "13 jan. 2025 – 14:32" },
    { action: "Sender créé",                          user: "admin@arolisender.io", date: "10 jan. 2025 – 09:15" },
  ];

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
        {/* Header */}
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
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--background)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <SenderFormView
            initialData={{
              senderName: sender.name,
              country:    sender.country === "Nigeria" ? "NG" : sender.country === "Côte d'Ivoire" ? "CI" : "GH",
              operator:   sender.operator,
              status:     sender.status,
              comment:    sender.comment,
            }}
            isModal
            onCancel={onClose}
            onSubmit={onClose}
            submitLabel="Enregistrer les modifications"
          />
        </div>

        {/* History log */}
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
            {history.map((log, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Modal ── */
function DeleteModal({ sender, onClose, onConfirm }: { sender: any; onClose: () => void; onConfirm: () => void }) {
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => { onConfirm(); }, 1200);
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
        {/* Top danger strip */}
        <div className="flex items-center gap-3 px-5 py-3" style={{ background: "var(--rose-muted)", borderBottom: "1px solid rgba(225,29,72,0.15)" }}>
          <ShieldAlert size={15} style={{ color: "var(--rose)" }} />
          <span style={{ color: "var(--rose)", fontWeight: 700, fontSize: "0.8125rem" }}>Action destructive — Confirmation requise</span>
        </div>

        {/* Body */}
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
                ? Cette action utilise la <strong style={{ color: "var(--foreground)" }}>Suppression Douce</strong> et peut être annulée.
              </p>
            </div>
          </div>

          {/* Soft delete callout */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-5"
            style={{ background: "var(--amber-muted)", border: "1px solid rgba(217,119,6,0.2)" }}
          >
            <AlertTriangle size={15} style={{ color: "var(--amber)", marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ color: "var(--amber)", fontWeight: 700, fontSize: "0.8125rem" }}>Suppression Douce activée</p>
              <p style={{ color: "var(--amber)", fontSize: "0.75rem", opacity: 0.85, lineHeight: 1.5 }}>
                L'enregistrement sera archivé pendant 30 jours. Vous pouvez le restaurer via <strong>Paramètres → Corbeille</strong>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border transition-all font-semibold text-sm"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#fff" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={done}
              className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: done ? "var(--emerald-muted)" : "var(--rose)",
                color: done ? "var(--emerald)" : "#fff",
                boxShadow: done ? "none" : "0 2px 12px rgba(225,29,72,0.3)",
              }}
            >
              {done ? <><CheckCircle2 size={14} /> Supprimé</> : <><Trash2 size={14} /> Confirmer la suppression</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main view ── */
export function ModalsView() {
  const [editTarget,   setEditTarget]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  return (
    <div className="p-6 h-full overflow-auto flex flex-col gap-5" style={{ background: "var(--background)" }}>

      {/* Intro card */}
      <div
        className="rounded-xl p-5 flex items-start gap-4"
        style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--blue-muted)" }}>
          <Layers size={18} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Démonstration des modales</p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            Cliquez sur <strong style={{ color: "var(--primary)" }}>Modifier</strong> ou{" "}
            <strong style={{ color: "var(--rose)" }}>Supprimer</strong> sur n'importe quelle ligne pour déclencher les modales correspondantes.
          </p>
        </div>
      </div>

      {/* Demo table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
          <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Senders — Actions par ligne</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--blue-muted)", color: "var(--primary)" }}>
            Cliquez sur les boutons pour ouvrir les modales
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Sender Name", "Pays", "Opérateur", "Statut", "Commentaire", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{ borderBottom: i < tableRows.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
              >
                <td className="px-5 py-4" style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem" }}>{row.name}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
                <td className="px-5 py-4" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
                <td className="px-5 py-4">{statusBadge(row.status)}</td>
                <td className="px-5 py-4" style={{ maxWidth: 200 }}>
                  {row.comment ? (
                    <span className="truncate block" style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>{row.comment}</span>
                  ) : (
                    <span style={{ color: "var(--border)" }}>—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditTarget(row)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
                      style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "var(--blue-muted)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#dbeafe")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--blue-muted)")}
                    >
                      <Edit2 size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => setDeleteTarget(row)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
                      style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "var(--rose-muted)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffe4e6")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rose-muted)")}
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
              <Edit2 size={14} style={{ color: "var(--primary)" }} />
            </div>
            <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Modale d'édition</span>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", lineHeight: 1.65 }}>
            Pré-remplit tous les champs du sender. Le commentaire de rejet s'active automatiquement si le statut est «Rejeté». L'historique des modifications est affiché en pied de modale.
          </p>
          <button
            onClick={() => setEditTarget(sampleRejected)}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--primary)", color: "#fff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
          >
            Ouvrir la démo →
          </button>
        </div>

        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: "#fff", border: "1px solid var(--rose)", boxShadow: "0 1px 4px rgba(225,29,72,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--rose-muted)" }}>
              <AlertTriangle size={14} style={{ color: "var(--rose)" }} />
            </div>
            <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.9375rem" }}>Modale de suppression</span>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem", lineHeight: 1.65 }}>
            Alerte haute visibilité avec bande de danger. Suppression douce avec notice ambre expliquant la récupération. CTA destructif rouge avec confirmation animée.
          </p>
          <button
            onClick={() => setDeleteTarget(sampleRejected)}
            className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--rose)", color: "#fff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#be123c")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--rose)")}
          >
            Ouvrir la démo →
          </button>
        </div>
      </div>

      {editTarget   && <EditModal   sender={editTarget}   onClose={() => setEditTarget(null)} />}
      {deleteTarget && <DeleteModal sender={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => setDeleteTarget(null)} />}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function Layers({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
