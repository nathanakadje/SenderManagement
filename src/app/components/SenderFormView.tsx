import { useState } from "react";
import { ChevronDown, CheckCircle2, Search, X, AlertTriangle, Lock } from "lucide-react";

const countries = [
  { code: "CI", name: "Côte d'Ivoire",  flag: "🇨🇮", operators: ["Orange CI", "MTN CI", "Moov Africa CI"] },
  { code: "GH", name: "Ghana",           flag: "🇬🇭", operators: ["MTN Ghana", "Telecel", "AirtelTigo"] },
  { code: "SN", name: "Sénégal",         flag: "🇸🇳", operators: ["Orange Sénégal", "Free Sénégal", "Expresso"] },
  { code: "NG", name: "Nigeria",          flag: "🇳🇬", operators: ["MTN Nigeria", "Airtel Nigeria", "Glo", "9mobile"] },
  { code: "ML", name: "Mali",             flag: "🇲🇱", operators: ["Orange Mali", "Telecel Mali"] },
  { code: "BF", name: "Burkina Faso",    flag: "🇧🇫", operators: ["Orange Burkina", "Telecel Burkina", "Moov Africa BF"] },
  { code: "TG", name: "Togo",            flag: "🇹🇬", operators: ["Togocel", "Moov Africa Togo"] },
  { code: "BJ", name: "Bénin",           flag: "🇧🇯", operators: ["MTN Bénin", "Moov Africa Bénin"] },
];

const statusOptions = [
  { value: "Validated", label: "Validé",     color: "#059669", bg: "var(--emerald-muted)" },
  { value: "Pending",   label: "En attente", color: "#d97706", bg: "var(--amber-muted)"   },
  { value: "Rejected",  label: "Rejeté",     color: "#e11d48", bg: "var(--rose-muted)"    },
];

export interface FormState {
  senderName: string;
  country: string;
  operator: string;
  status: string;
  comment: string;
}

interface Props {
  initialData?: Partial<FormState>;
  isModal?: boolean;
  onCancel?: () => void;
  onSubmit?: (data: FormState) => void;
  submitLabel?: string;
}

export function SenderFormView({ initialData, isModal, onCancel, onSubmit, submitLabel = "Créer le sender" }: Props) {
  const [form, setForm] = useState<FormState>({
    senderName: initialData?.senderName ?? "",
    country:    initialData?.country    ?? "",
    operator:   initialData?.operator   ?? "",
    status:     initialData?.status     ?? "",
    comment:    initialData?.comment    ?? "",
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen,   setCountryOpen]   = useState(false);
  const [operatorOpen,  setOperatorOpen]  = useState(false);
  const [statusOpen,    setStatusOpen]    = useState(false);

  const filtered = countries.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const selectedCountry = countries.find((c) => c.code === form.country);
  const operators = selectedCountry?.operators ?? [];
  const selectedStatus = statusOptions.find((s) => s.value === form.status);
  const isRejected = form.status === "Rejected";

  const closeAll = () => { setCountryOpen(false); setOperatorOpen(false); setStatusOpen(false); };

  const inputStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    width: "100%",
    padding: "0.625rem 0.875rem",
  };

  const focusStyle: React.CSSProperties = { borderColor: "var(--primary)", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.8125rem", marginBottom: 6, display: "block" }}>
      {children} {required && <span style={{ color: "var(--rose)" }}>*</span>}
    </label>
  );

  const dropdownPanel: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
    background: "#fff", border: "1px solid var(--primary)", borderRadius: 8,
    boxShadow: "0 8px 32px rgba(37,99,235,0.12)", zIndex: 60, overflow: "hidden",
  };

  const formBody = (
    <div className="flex flex-col gap-4">
      {/* Sender Name */}
      <div>
        <Label required>Sender Name</Label>
        <input
          style={inputStyle}
          placeholder="ex. ORANGE_PROMO"
          value={form.senderName}
          onChange={(e) => setForm({ ...form, senderName: e.target.value })}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, { borderColor: "var(--border)", boxShadow: "none" })}
        />
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
          Max 11 caractères · Alphanumérique + underscore uniquement
        </p>
      </div>

      {/* Country */}
      <div className="relative">
        <Label required>Pays</Label>
        <button
          className="w-full flex items-center justify-between"
          style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
          onClick={() => { closeAll(); setCountryOpen(!countryOpen); }}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span style={{ color: "var(--foreground)" }}>{selectedCountry.name}</span>
            </span>
          ) : (
            <span style={{ color: "var(--muted-foreground)" }}>Rechercher un pays…</span>
          )}
          <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        {countryOpen && (
          <div style={dropdownPanel}>
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <Search size={13} style={{ color: "var(--muted-foreground)" }} />
              <input
                autoFocus
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
                placeholder="Taper pour filtrer…"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
              {countrySearch && (
                <button onClick={() => setCountrySearch("")}>
                  <X size={12} style={{ color: "var(--muted-foreground)" }} />
                </button>
              )}
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filtered.map((c) => (
                <button
                  key={c.code}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
                  style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  onClick={() => { setForm({ ...form, country: c.code, operator: "" }); setCountryOpen(false); setCountrySearch(""); }}
                >
                  <span className="flex items-center gap-2.5">{c.flag} {c.name}</span>
                  {form.country === c.code && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3.5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Aucun résultat</p>}
            </div>
          </div>
        )}
      </div>

      {/* Operator */}
      <div className="relative">
        <Label required>Opérateur</Label>
        <button
          disabled={!selectedCountry}
          className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ ...inputStyle, cursor: selectedCountry ? "pointer" : "not-allowed", textAlign: "left" }}
          onClick={() => { closeAll(); setOperatorOpen(!operatorOpen); }}
        >
          <span style={{ color: form.operator ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {form.operator || (selectedCountry ? "Sélectionner un opérateur" : "Sélectionner un pays d'abord")}
          </span>
          <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: operatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        {operatorOpen && operators.length > 0 && (
          <div style={dropdownPanel}>
            {operators.map((op) => (
              <button
                key={op}
                className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
                style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                onClick={() => { setForm({ ...form, operator: op }); setOperatorOpen(false); }}
              >
                {op}
                {form.operator === op && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="relative">
        <Label required>Statut</Label>
        <button
          className="w-full flex items-center justify-between"
          style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
          onClick={() => { closeAll(); setStatusOpen(!statusOpen); }}
        >
          {selectedStatus ? (
            <span className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: selectedStatus.color }} />
              <span style={{ color: selectedStatus.color, fontWeight: 600 }}>{selectedStatus.label}</span>
            </span>
          ) : (
            <span style={{ color: "var(--muted-foreground)" }}>Choisir un statut…</span>
          )}
          <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: statusOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        {statusOpen && (
          <div style={dropdownPanel}>
            {statusOptions.map((s) => (
              <button
                key={s.value}
                className="w-full px-3.5 py-3 text-left flex items-center justify-between transition-colors"
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                onClick={() => { setForm({ ...form, status: s.value, comment: s.value !== "Rejected" ? "" : form.comment }); setStatusOpen(false); }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span style={{ color: s.color, fontWeight: 600, fontSize: "0.875rem" }}>{s.label}</span>
                </span>
                {form.status === s.value && <CheckCircle2 size={14} style={{ color: s.color }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment — conditional */}
      <div
        className="rounded-lg overflow-hidden transition-all duration-300"
        style={{
          border: `1px solid ${isRejected ? "var(--rose)" : "var(--border)"}`,
          background: isRejected ? "var(--rose-muted)" : "#fafafa",
          opacity: isRejected ? 1 : 0.55,
        }}
      >
        <div className="px-4 pt-3 flex items-center justify-between">
          <label style={{ color: isRejected ? "var(--rose)" : "var(--muted-foreground)", fontWeight: 600, fontSize: "0.8125rem" }}>
            Motif de rejet {isRejected && <span style={{ color: "var(--rose)" }}>*</span>}
          </label>
          {!isRejected ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem" }}>
              <Lock size={9} /> Activé uniquement si Rejeté
            </span>
          ) : (
            <span className="flex items-center gap-1.5" style={{ color: "var(--rose)", fontSize: "0.75rem", fontWeight: 600 }}>
              <AlertTriangle size={11} /> Champ obligatoire
            </span>
          )}
        </div>
        <textarea
          disabled={!isRejected}
          className="w-full px-4 py-3 bg-transparent outline-none resize-none disabled:cursor-not-allowed"
          style={{ color: "var(--foreground)", fontSize: "0.875rem", minHeight: 80 }}
          placeholder={isRejected ? "Expliquer le motif du rejet…" : "Ce champ sera activé lorsque le statut est «Rejeté»"}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        {formBody}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onSubmit?.(form)}
            className="flex-1 py-2.5 rounded-lg transition-all"
            style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
          >
            {submitLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.875rem" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            Annuler
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
    >
      {formBody}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => onSubmit?.(form)}
          className="flex-1 py-2.5 rounded-lg transition-all"
          style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
        >
          {submitLabel}
        </button>
        <button
          className="px-6 py-2.5 rounded-lg border transition-all"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
