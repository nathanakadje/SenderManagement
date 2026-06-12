import { useState } from "react";
import {
  Search, ChevronDown, FileSpreadsheet, FileText, Plus, Edit2, Trash2,
  ChevronLeft, ChevronRight, ArrowUpDown, X, SlidersHorizontal,
} from "lucide-react";

/* ── helpers ── */
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

/* ── data ── */
const allSenders = [
  { id: 1,  name: "ORANGE_PROMO",  country: "Côte d'Ivoire",  operator: "Orange CI",       status: "Validated", date: "14 jan. 2025" },
  { id: 2,  name: "MTN_ALERT",     country: "Ghana",           operator: "MTN Ghana",       status: "Pending",   date: "14 jan. 2025" },
  { id: 3,  name: "FREE_INFO",     country: "Sénégal",         operator: "Free Sénégal",    status: "Validated", date: "13 jan. 2025" },
  { id: 4,  name: "AIRTEL_MKT",   country: "Nigeria",          operator: "Airtel Nigeria",  status: "Rejected",  date: "13 jan. 2025" },
  { id: 5,  name: "MOOV_SVC",     country: "Burkina Faso",     operator: "Moov Africa BF",  status: "Pending",   date: "12 jan. 2025" },
  { id: 6,  name: "TELECEL_OTP",  country: "Ghana",             operator: "Telecel",         status: "Validated", date: "12 jan. 2025" },
  { id: 7,  name: "WAVE_PAY",     country: "Sénégal",           operator: "Orange Sénégal",  status: "Validated", date: "11 jan. 2025" },
  { id: 8,  name: "MTN_BF",       country: "Burkina Faso",     operator: "Telecel Burkina",  status: "Rejected",  date: "11 jan. 2025" },
  { id: 9,  name: "ORANGE_ML",    country: "Mali",              operator: "Orange Mali",     status: "Validated", date: "10 jan. 2025" },
  { id: 10, name: "AIRTEL_OTP",   country: "Nigeria",           operator: "Airtel Nigeria",  status: "Pending",   date: "10 jan. 2025" },
  { id: 11, name: "GLO_MKT",      country: "Nigeria",           operator: "Glo",             status: "Validated", date: "9 jan. 2025"  },
  { id: 12, name: "EXPRESSO_SN",  country: "Sénégal",           operator: "Expresso",        status: "Pending",   date: "9 jan. 2025"  },
];

interface Props {
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onCreateNew: () => void;
}

export function SendersManagementView({ onEdit, onDelete, onCreateNew }: Props) {
  const [nameSearch,    setNameSearch]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [operatorQ,     setOperatorQ]     = useState("");
  const [page, setPage] = useState(1);
  const [statusOpen,  setStatusOpen]  = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const perPage = 8;
  const filtered = allSenders.filter((s) =>
    s.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
    (!statusFilter  || s.status  === statusFilter) &&
    (!countryFilter || s.country === countryFilter) &&
    (!operatorQ     || s.operator.toLowerCase().includes(operatorQ.toLowerCase()))
  );
  const totalShown = 1248;
  const pageCount = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const uniqueStatuses = ["Validated", "Pending", "Rejected"];
  const uniqueCountries = [...new Set(allSenders.map((s) => s.country))];
  const hasFilters = nameSearch || statusFilter || countryFilter || operatorQ;

  const toggleRow = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const pill = (label: string): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6, padding: "0.4rem 0.75rem",
    borderRadius: 8, border: "1px solid var(--border)", background: "#fff",
    color: "var(--muted-foreground)", fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.15s",
  });

  const FilterSelect = ({ open, setOpen, value, setValue, options, placeholder }: any) => (
    <div className="relative">
      <button
        style={{ ...pill(placeholder), borderColor: value ? "var(--primary)" : "var(--border)", color: value ? "var(--primary)" : "var(--muted-foreground)" }}
        onClick={() => { setOpen(!open); }}
      >
        {value || placeholder}
        {value
          ? <button onClick={(e) => { e.stopPropagation(); setValue(""); setOpen(false); }}><X size={11} /></button>
          : <ChevronDown size={11} />
        }
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid var(--primary)" }}
        >
          {options.map((opt: string) => (
            <button
              key={opt}
              className="w-full px-3.5 py-2.5 text-left text-sm transition-colors"
              style={{ color: "var(--foreground)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              onClick={() => { setValue(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-auto" style={{ background: "var(--background)" }}>

      {/* Top action bar */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl"
        style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Name search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)", width: 200 }}>
            <Search size={13} style={{ color: "var(--muted-foreground)" }} />
            <input
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: "var(--foreground)" }}
              placeholder="Rechercher par nom…"
              value={nameSearch}
              onChange={(e) => { setNameSearch(e.target.value); setPage(1); }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ ...pill("Filtres"), borderColor: showFilters ? "var(--primary)" : "var(--border)", color: showFilters ? "var(--primary)" : "var(--muted-foreground)", background: showFilters ? "var(--blue-muted)" : "#fff" }}
          >
            <SlidersHorizontal size={12} /> Filtres {showFilters ? "▲" : "▼"}
          </button>

          {showFilters && (
            <>
              <FilterSelect open={statusOpen} setOpen={setStatusOpen} value={statusFilter} setValue={setStatusFilter} options={uniqueStatuses} placeholder="Statut" />
              <FilterSelect open={countryOpen} setOpen={setCountryOpen} value={countryFilter} setValue={setCountryFilter} options={uniqueCountries} placeholder="Pays" />

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <input
                  className="bg-transparent outline-none text-sm"
                  style={{ color: "var(--foreground)", width: 130 }}
                  placeholder="Opérateur…"
                  value={operatorQ}
                  onChange={(e) => { setOperatorQ(e.target.value); setPage(1); }}
                />
              </div>

              {/* Date range */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <input type="date" className="bg-transparent outline-none" style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }} defaultValue="2025-01-01" />
                <span style={{ color: "var(--muted-foreground)" }}>→</span>
                <input type="date" className="bg-transparent outline-none" style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }} defaultValue="2025-01-14" />
              </div>

              {hasFilters && (
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--rose-muted)", color: "var(--rose)", fontWeight: 600 }}
                  onClick={() => { setNameSearch(""); setStatusFilter(""); setCountryFilter(""); setOperatorQ(""); setPage(1); }}
                >
                  <X size={11} /> Effacer
                </button>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all"
            style={{ background: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            title="Export Excel"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--emerald)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--emerald)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}
          >
            <FileSpreadsheet size={14} /> Export .xlsx
          </button>
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all"
            style={{ background: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            title="Export CSV"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--amber)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--amber)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}
          >
            <FileText size={14} /> Export .csv
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.25)"; }}
          >
            <Plus size={15} strokeWidth={2.5} /> Créer un sender
          </button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="rounded-xl overflow-hidden flex-1"
        style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" style={{ accentColor: "var(--primary)" }} />
              </th>
              {[["Sender Name", true], ["Pays", true], ["Opérateur", true], ["Statut", true], ["Date", true], ["Actions", false]].map(([h, sort]) => (
                <th key={h as string} className="px-4 py-3 text-left" style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  <span className="flex items-center gap-1.5">
                    {h} {sort && <ArrowUpDown size={10} style={{ opacity: 0.4 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={row.id}
                className="transition-colors cursor-pointer"
                style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none", background: selected.has(row.id) ? "var(--blue-muted)" : "transparent" }}
                onMouseEnter={(e) => { if (!selected.has(row.id)) (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { if (!selected.has(row.id)) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
              >
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} style={{ accentColor: "var(--primary)" }} />
                </td>
                <td className="px-4 py-3.5">
                  <span style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "0.875rem", fontFamily: "monospace" }}>{row.name}</span>
                </td>
                <td className="px-4 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.country}</td>
                <td className="px-4 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.operator}</td>
                <td className="px-4 py-3.5">{statusBadge(row.status)}</td>
                <td className="px-4 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{row.date}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEdit(row)}
                      className="w-7 h-7 rounded-md flex items-center justify-center border transition-all"
                      style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                      title="Modifier"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--blue-muted)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="w-7 h-7 rounded-md flex items-center justify-center border transition-all"
                      style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                      title="Supprimer"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-muted)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--rose)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rose)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: "1px solid var(--border)", background: "var(--secondary)" }}
        >
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>
            Affichage <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span> sur{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{totalShown.toLocaleString("fr-FR")}</span> résultats
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
              style={{ background: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                style={{
                  background: page === p ? "var(--primary)" : "#fff",
                  borderColor: page === p ? "var(--primary)" : "var(--border)",
                  color: page === p ? "#fff" : "var(--muted-foreground)",
                  fontWeight: page === p ? 700 : 400,
                  fontSize: "0.875rem",
                  boxShadow: page === p ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                }}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
              style={{ background: "#fff", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
