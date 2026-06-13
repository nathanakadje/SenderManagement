import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle2, Search, X, AlertTriangle, Lock, Plus } from "lucide-react";
import { Notification, NotificationType } from "./Notification";

interface Country {
  code: string;
  name: string;
  flag: string;
  operators: string[];
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
  bg: string;
}

const statusOptions: StatusOption[] = [
  { value: "Validated", label: "Validé", color: "#059669", bg: "var(--emerald-muted)" },
  { value: "Pending", label: "En attente", color: "#d97706", bg: "var(--amber-muted)" },
  { value: "Rejected", label: "Rejeté", color: "#e11d48", bg: "var(--rose-muted)" },
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
  refreshCountries?: boolean;
  onSuccess?: () => void;
}

export function SenderFormView({
  initialData,
  isModal,
  onCancel,
  onSubmit,
  submitLabel = "Créer le sender",
  refreshCountries = false,
  onSuccess
}: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [errorCountries, setErrorCountries] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    senderName: initialData?.senderName ?? "",
    country: initialData?.country ?? "",
    operator: initialData?.operator ?? "",
    status: initialData?.status ?? "",
    comment: initialData?.comment ?? "",
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const [manualOperatorMode, setManualOperatorMode] = useState(false);
  const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState("");

  useEffect(() => {
    fetchCountries();
  }, [refreshCountries]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    setErrorCountries(null);
    try {
      const response = await fetch('http://localhost:3000/api/countries');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      console.error("Erreur lors du chargement des pays:", err);
      setErrorCountries("Impossible de charger la liste des pays.");
    } finally {
      setLoadingCountries(false);
    }
  };

  // Filtrer les pays avec une clé unique (code)
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountry = countries.find((c) => c.code === form.country);
  const operators = selectedCountry?.operators ?? [];
  const hasOperators = operators.length > 0;
  const selectedStatus = statusOptions.find((s) => s.value === form.status);
  const isRejected = form.status === "Rejected";

  const closeAll = () => {
    setCountryOpen(false);
    setOperatorOpen(false);
    setStatusOpen(false);
  };

  const addNewOperator = async () => {
    if (!newOperatorName.trim() || !form.country) return;

    try {
      const response = await fetch(`http://localhost:3000/api/countries/${form.country}/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: newOperatorName.trim() })
      });

      if (response.ok) {
        await fetchCountries();
        setForm({ ...form, operator: newOperatorName.trim() });
        setShowAddOperatorModal(false);
        setNewOperatorName("");
        setManualOperatorMode(false);
        if (errors.operator) setErrors({ ...errors, operator: undefined });
        
        setNotification({
          type: 'success',
          message: `Opérateur "${newOperatorName}" ajouté avec succès`
        });
      } else {
        setNotification({
          type: 'error',
          message: "Erreur lors de l'ajout de l'opérateur"
        });
      }
    } catch (err) {
      console.error("Erreur:", err);
      setNotification({
        type: 'error',
        message: "Erreur de connexion lors de l'ajout de l'opérateur"
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.senderName.trim()) {
      newErrors.senderName = "Le nom du sender est requis";
    } else if (!/^[A-Za-z0-9_\s]+$/.test(form.senderName)) {
      // Modification: autoriser les espaces
      newErrors.senderName = "Seuls les caractères alphanumériques, underscores et espaces sont autorisés";
    } else if (form.senderName.length > 11) {
      newErrors.senderName = "Maximum 11 caractères";
    }

    if (!form.country) {
      newErrors.country = "Le pays est requis";
    }

    if (!form.operator && !manualOperatorMode) {
      newErrors.operator = "L'opérateur est requis";
    } else if (manualOperatorMode && !form.operator) {
      newErrors.operator = "Veuillez saisir un opérateur";
    }

    if (!form.status) {
      newErrors.status = "Le statut est requis";
    }

    if (form.status === "Rejected" && !form.comment.trim()) {
      newErrors.comment = "Le motif de rejet est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Trouver le nom complet directement à l'envoi pour aider le Front/Back
    const finalCountryName = selectedCountry ? selectedCountry.name : form.country;

    const preparedForm = {
      ...form,
      senderName: form.senderName.trim(),
      country: finalCountryName, // Envoie directement "Albania" au lieu de "AL"
    };

    if (onSubmit) {
      onSubmit(preparedForm); // Renvoie l'objet corrigé au parent
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.senderName.trim(), // Garder les espaces
          country: form.country,
          operator: form.operator,
          status: form.status,
          comment: form.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setNotification({
        type: 'success',
        message: `Sender "${form.senderName}" créé avec succès !`
      });

      setForm({
        senderName: "",
        country: "",
        operator: "",
        status: "",
        comment: "",
      });
      setErrors({});
      setManualOperatorMode(false);
      setNewOperatorName("");

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onCancel?.();
      }, 1000);

    } catch (err) {
      console.error("Erreur lors de la création du sender:", err);
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : "Erreur lors de la création. Vérifiez votre connexion."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      senderName: initialData?.senderName ?? "",
      country: initialData?.country ?? "",
      operator: initialData?.operator ?? "",
      status: initialData?.status ?? "",
      comment: initialData?.comment ?? "",
    });
    setErrors({});
    setManualOperatorMode(false);
    setNewOperatorName("");
  };

  const handleCountryChange = (countryCode: string) => {
    const newCountry = countries.find(c => c.code === countryCode);
    if (newCountry && newCountry.operators.length === 0) {
      setManualOperatorMode(true);
      setForm({ ...form, country: countryCode, operator: "" });
    } else {
      setManualOperatorMode(false);
      setForm({ ...form, country: countryCode, operator: "" });
    }
    setCountryOpen(false);
    setCountrySearch("");
    if (errors.country) setErrors({ ...errors, country: undefined });
  };

  // Styles corrigés - sans conflit entre border et borderColor
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    width: "100%",
    padding: "0.625rem 0.875rem",
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: "var(--rose)",
    boxShadow: "0 0 0 3px rgba(225,29,72,0.1)",
  };

  const focusStyle: React.CSSProperties = {
    borderColor: "var(--primary)",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.1)"
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    outline: "none",
    padding: "0.625rem 0.875rem",
    cursor: "pointer",
    textAlign: "left",
  };

  const errorButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    borderColor: "var(--rose)",
    boxShadow: "0 0 0 3px rgba(225,29,72,0.1)",
  };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.8125rem", marginBottom: "6px", display: "block" }}>
      {children} {required && <span style={{ color: "var(--rose)" }}>*</span>}
    </label>
  );

  const dropdownPanel: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "8px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    zIndex: 60,
    overflow: "hidden",
  };

  if (loadingCountries) {
    return (
      <div className="flex items-center justify-center p-8">
        <p style={{ color: "var(--muted-foreground)" }}>Chargement des pays...</p>
      </div>
    );
  }

  if (errorCountries) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p style={{ color: "var(--rose)" }}>{errorCountries}</p>
        <button
          onClick={fetchCountries}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: "var(--primary)", color: "#fff", border: "none" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const formBody = (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Sender Name */}
        <div>
          <Label required>Sender Name</Label>
          <input
            style={errors.senderName ? errorInputStyle : inputStyle}
            placeholder="ex. ORANGE_PROMO ou BAMO SN"
            value={form.senderName}
            onChange={(e) => {
              setForm({ ...form, senderName: e.target.value });
              if (errors.senderName) setErrors({ ...errors, senderName: undefined });
            }}
            onFocus={(e) => {
              if (!errors.senderName) {
                const el = e.currentTarget;
                el.style.borderColor = focusStyle.borderColor as string;
                el.style.boxShadow = focusStyle.boxShadow as string;
              }
            }}
            onBlur={(e) => {
              if (!errors.senderName) {
                const el = e.currentTarget;
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "none";
              }
            }}
          />
          {errors.senderName && (
            <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
              {errors.senderName}
            </p>
          )}
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
            Max 11 caractères · Alphanumérique + underscore + espace autorisés
          </p>
        </div>

        {/* Country */}
        <div className="relative">
          <Label required>Pays</Label>
          <button
            style={errors.country ? errorButtonStyle : buttonStyle}
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
          {errors.country && (
            <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
              {errors.country}
            </p>
          )}
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
                    key={c.code} // Utilisation du code comme clé unique
                    className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
                    style={{ fontSize: "0.875rem", color: "var(--foreground)", background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                    onClick={() => handleCountryChange(c.code)}
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
          <div className="flex items-center justify-between mb-1">
            <Label required>Opérateur</Label>
            {selectedCountry && hasOperators && (
              <button
                type="button"
                onClick={() => setShowAddOperatorModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ color: "var(--primary)", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <Plus size={12} /> Ajouter un opérateur
              </button>
            )}
          </div>

          {manualOperatorMode || !hasOperators ? (
            <div>
              <input
                style={errors.operator ? errorInputStyle : inputStyle}
                placeholder="Saisir le nom de l'opérateur"
                value={form.operator}
                onChange={(e) => {
                  setForm({ ...form, operator: e.target.value });
                  if (errors.operator) setErrors({ ...errors, operator: undefined });
                }}
              />
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
                ⚡ Aucun opérateur prédéfini pour ce pays. Saisie libre autorisée.
              </p>
            </div>
          ) : (
            <>
              <button
                style={errors.operator ? errorButtonStyle : buttonStyle}
                onClick={() => { closeAll(); setOperatorOpen(!operatorOpen); }}
              >
                <span style={{ color: form.operator ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {form.operator || "Sélectionner un opérateur"}
                </span>
                <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: operatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {operatorOpen && operators.length > 0 && (
                <div style={dropdownPanel}>
                  {operators.map((op, index) => (
                    <button
                      key={`${op}-${index}`} // Clé unique avec index
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
                      style={{ fontSize: "0.875rem", color: "var(--foreground)", background: "transparent", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                      onClick={() => {
                        setForm({ ...form, operator: op });
                        setOperatorOpen(false);
                        if (errors.operator) setErrors({ ...errors, operator: undefined });
                      }}
                    >
                      {op}
                      {form.operator === op && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {errors.operator && (
            <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
              {errors.operator}
            </p>
          )}
        </div>

        {/* Modal d'ajout d'opérateur */}
        {showAddOperatorModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="rounded-xl p-6 w-96" style={{ backgroundColor: "#fff" }}>
              <h3 className="text-lg font-semibold mb-4">Ajouter un opérateur</h3>
              <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
                Pour le pays : <strong>{selectedCountry?.name}</strong>
              </p>
              <input
                className="w-full px-3 py-2 rounded-lg mb-4"
                style={inputStyle}
                placeholder="Nom de l'opérateur"
                value={newOperatorName}
                onChange={(e) => setNewOperatorName(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={addNewOperator}
                  className="flex-1 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowAddOperatorModal(false);
                    setNewOperatorName("");
                  }}
                  className="flex-1 py-2 rounded-lg border"
                  style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", backgroundColor: "#fff", cursor: "pointer" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="relative">
          <Label required>Statut</Label>
          <button
            style={errors.status ? errorButtonStyle : buttonStyle}
            onClick={() => { closeAll(); setStatusOpen(!statusOpen); }}
          >
            {selectedStatus ? (
              <span className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedStatus.color }} />
                <span style={{ color: selectedStatus.color, fontWeight: 600 }}>{selectedStatus.label}</span>
              </span>
            ) : (
              <span style={{ color: "var(--muted-foreground)" }}>Choisir un statut…</span>
            )}
            <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: statusOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {errors.status && (
            <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
              {errors.status}
            </p>
          )}
          {statusOpen && (
            <div style={dropdownPanel}>
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  className="w-full px-3.5 py-3 text-left flex items-center justify-between transition-colors"
                  style={{ fontSize: "0.875rem", color: "var(--foreground)", background: "transparent", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                  onClick={() => {
                    setForm({ ...form, status: s.value, comment: s.value !== "Rejected" ? "" : form.comment });
                    setStatusOpen(false);
                    if (errors.status) setErrors({ ...errors, status: undefined });
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span style={{ color: s.color, fontWeight: 600, fontSize: "0.875rem" }}>{s.label}</span>
                  </span>
                  {form.status === s.value && <CheckCircle2 size={14} style={{ color: s.color }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <div
          className="rounded-lg overflow-hidden transition-all duration-300"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: isRejected && errors.comment ? "var(--rose)" : isRejected ? "var(--rose)" : "var(--border)",
            backgroundColor: isRejected ? "var(--rose-muted)" : "#fafafa",
            opacity: isRejected ? 1 : 0.55,
          }}
        >
          <div className="px-4 pt-3 flex items-center justify-between">
            <label style={{ color: isRejected ? "var(--rose)" : "var(--muted-foreground)", fontWeight: 600, fontSize: "0.8125rem" }}>
              Motif de rejet {isRejected && <span style={{ color: "var(--rose)" }}>*</span>}
            </label>
            {!isRejected ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem" }}>
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
            style={{
              color: "var(--foreground)",
              fontSize: "0.875rem",
              minHeight: 80,
            }}
            placeholder={isRejected ? "Expliquer le motif du rejet…" : "Ce champ sera activé lorsque le statut est «Rejeté»"}
            value={form.comment}
            onChange={(e) => {
              setForm({ ...form, comment: e.target.value });
              if (errors.comment) setErrors({ ...errors, comment: undefined });
            }}
          />
          {errors.comment && isRejected && (
            <p className="px-4 pb-3" style={{ color: "var(--rose)", fontSize: "0.7rem" }}>
              {errors.comment}
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--rose-muted)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--rose)" }}>
            <p style={{ color: "var(--rose)", fontSize: "0.8125rem" }}>{errors.submit}</p>
          </div>
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <>
        {formBody}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => {
              if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--primary)";
            }}
          >
            {submitting ? "Création en cours..." : submitLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border transition-all"
            style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.875rem", backgroundColor: "#fff", cursor: "pointer" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
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
      style={{ backgroundColor: "#ffffff", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
    >
      {formBody}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => {
            if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--primary)";
          }}
        >
          {submitting ? "Création en cours..." : submitLabel}
        </button>
        <button
  onClick={handleReset}
  className="px-6 py-2.5 rounded-lg transition-all"
  style={{
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    cursor: "pointer"
  }}
  onMouseEnter={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#e5e7eb";
  }}
  onMouseLeave={(e) => {
    const el = e.currentTarget;
    el.style.backgroundColor = "#f3f4f6";
  }}
>
  Réinitialiser
</button>
        {/* <button
          onClick={handleReset}
          className="px-6 py-2.5 rounded-lg border transition-all"
          style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", color: "var(--muted-foreground)", backgroundColor: "#fff", cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--secondary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
        >
          Réinitialiser
        </button> */}
      </div>
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { ChevronDown, CheckCircle2, Search, X, AlertTriangle, Lock, Plus } from "lucide-react";
// import { Notification, NotificationType } from "./Notification";

// interface Country {
//   code: string;
//   name: string;
//   flag: string;
//   operators: string[];
// }

// interface StatusOption {
//   value: string;
//   label: string;
//   color: string;
//   bg: string;
// }

// const statusOptions: StatusOption[] = [
//   { value: "Validated", label: "Validé", color: "#059669", bg: "var(--emerald-muted)" },
//   { value: "Pending", label: "En attente", color: "#d97706", bg: "var(--amber-muted)" },
//   { value: "Rejected", label: "Rejeté", color: "#e11d48", bg: "var(--rose-muted)" },
// ];

// export interface FormState {
//   senderName: string;
//   country: string;
//   operator: string;
//   status: string;
//   comment: string;
// }

// interface Props {
//   initialData?: Partial<FormState>;
//   isModal?: boolean;
//   onCancel?: () => void;
//   onSubmit?: (data: FormState) => void;
//   submitLabel?: string;
//   refreshCountries?: boolean;
//   onSuccess?: () => void; // Callback après création réussie
// }

// export function SenderFormView({
//   initialData,
//   isModal,
//   onCancel,
//   onSubmit,
//   submitLabel = "Créer le sender",
//   refreshCountries = false,
//   onSuccess
// }: Props) {
//   const [countries, setCountries] = useState<Country[]>([]);
//   const [loadingCountries, setLoadingCountries] = useState(true);
//   const [errorCountries, setErrorCountries] = useState<string | null>(null);

//   const [form, setForm] = useState<FormState>({
//     senderName: initialData?.senderName ?? "",
//     country: initialData?.country ?? "",
//     operator: initialData?.operator ?? "",
//     status: initialData?.status ?? "",
//     comment: initialData?.comment ?? "",
//   });

//   const [countrySearch, setCountrySearch] = useState("");
//   const [countryOpen, setCountryOpen] = useState(false);
//   const [operatorOpen, setOperatorOpen] = useState(false);
//   const [statusOpen, setStatusOpen] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  
//   // État pour les notifications
//   const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  
//   // Mode saisie manuelle
//   const [manualOperatorMode, setManualOperatorMode] = useState(false);
//   const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
//   const [newOperatorName, setNewOperatorName] = useState("");

//   useEffect(() => {
//     fetchCountries();
//   }, [refreshCountries]);

//   const fetchCountries = async () => {
//     setLoadingCountries(true);
//     setErrorCountries(null);
//     try {
//       const response = await fetch('http://localhost:3000/api/countries');
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setCountries(data);
//     } catch (err) {
//       console.error("Erreur lors du chargement des pays:", err);
//       setErrorCountries("Impossible de charger la liste des pays.");
//     } finally {
//       setLoadingCountries(false);
//     }
//   };

//   const filtered = countries.filter((c) =>
//     c.name.toLowerCase().includes(countrySearch.toLowerCase())
//   );

//   const selectedCountry = countries.find((c) => c.code === form.country);
//   const operators = selectedCountry?.operators ?? [];
//   const hasOperators = operators.length > 0;
//   const selectedStatus = statusOptions.find((s) => s.value === form.status);
//   const isRejected = form.status === "Rejected";

//   const closeAll = () => {
//     setCountryOpen(false);
//     setOperatorOpen(false);
//     setStatusOpen(false);
//   };

//   const addNewOperator = async () => {
//     if (!newOperatorName.trim() || !form.country) return;

//     try {
//       const response = await fetch(`http://localhost:3000/api/countries/${form.country}/operators`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ operator: newOperatorName.trim() })
//       });

//       if (response.ok) {
//         await fetchCountries();
//         setForm({ ...form, operator: newOperatorName.trim() });
//         setShowAddOperatorModal(false);
//         setNewOperatorName("");
//         setManualOperatorMode(false);
//         if (errors.operator) setErrors({ ...errors, operator: undefined });
        
//         // Notification de succès pour l'ajout d'opérateur
//         setNotification({
//           type: 'success',
//           message: `Opérateur "${newOperatorName}" ajouté avec succès`
//         });
//       } else {
//         setNotification({
//           type: 'error',
//           message: "Erreur lors de l'ajout de l'opérateur"
//         });
//       }
//     } catch (err) {
//       console.error("Erreur:", err);
//       setNotification({
//         type: 'error',
//         message: "Erreur de connexion lors de l'ajout de l'opérateur"
//       });
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<Record<keyof FormState, string>> = {};

//     if (!form.senderName.trim()) {
//       newErrors.senderName = "Le nom du sender est requis";
//     } else if (!/^[A-Za-z0-9_]+$/.test(form.senderName)) {
//       newErrors.senderName = "Seuls les caractères alphanumériques et underscore sont autorisés";
//     } else if (form.senderName.length > 11) {
//       newErrors.senderName = "Maximum 11 caractères";
//     }

//     if (!form.country) {
//       newErrors.country = "Le pays est requis";
//     }

//     if (!form.operator && !manualOperatorMode) {
//       newErrors.operator = "L'opérateur est requis";
//     } else if (manualOperatorMode && !form.operator) {
//       newErrors.operator = "Veuillez saisir un opérateur";
//     }

//     if (!form.status) {
//       newErrors.status = "Le statut est requis";
//     }

//     if (form.status === "Rejected" && !form.comment.trim()) {
//       newErrors.comment = "Le motif de rejet est requis";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     if (onSubmit) {
//       onSubmit(form);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const response = await fetch('http://localhost:3000/api/senders', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: form.senderName,
//           country: form.country, // Envoie le code ou le nom du pays
//           operator: form.operator,
//           status: form.status,
//           comment: form.comment,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `HTTP error! status: ${response.status}`);
//       }

//       // Notification de succès
//       setNotification({
//         type: 'success',
//         message: `Sender "${form.senderName}" créé avec succès !`
//       });

//       // Réinitialiser le formulaire
//       setForm({
//         senderName: "",
//         country: "",
//         operator: "",
//         status: "",
//         comment: "",
//       });
//       setErrors({});
//       setManualOperatorMode(false);
//       setCustomOperator("");

//       // Appeler le callback de succès
//       if (onSuccess) {
//         onSuccess();
//       }

//       // Fermer le modal après 1 seconde
//       setTimeout(() => {
//         onCancel?.();
//       }, 1000);

//     } catch (err) {
//       console.error("Erreur lors de la création du sender:", err);
//       setNotification({
//         type: 'error',
//         message: err instanceof Error ? err.message : "Erreur lors de la création. Vérifiez votre connexion."
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setForm({
//       senderName: initialData?.senderName ?? "",
//       country: initialData?.country ?? "",
//       operator: initialData?.operator ?? "",
//       status: initialData?.status ?? "",
//       comment: initialData?.comment ?? "",
//     });
//     setErrors({});
//     setManualOperatorMode(false);
//     setCustomOperator("");
//   };

//   const handleCountryChange = (countryCode: string) => {
//     const newCountry = countries.find(c => c.code === countryCode);
//     if (newCountry && newCountry.operators.length === 0) {
//       setManualOperatorMode(true);
//       setForm({ ...form, country: countryCode, operator: "" });
//     } else {
//       setManualOperatorMode(false);
//       setForm({ ...form, country: countryCode, operator: "" });
//     }
//     setCountryOpen(false);
//     setCountrySearch("");
//     if (errors.country) setErrors({ ...errors, country: undefined });
//   };

//   const inputStyle: React.CSSProperties = {
//     background: "#ffffff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     color: "var(--foreground)",
//     fontSize: "0.875rem",
//     outline: "none",
//     transition: "border-color 0.15s, box-shadow 0.15s",
//     width: "100%",
//     padding: "0.625rem 0.875rem",
//   };

//   const errorInputStyle: React.CSSProperties = {
//     ...inputStyle,
//     borderColor: "var(--rose)",
//     boxShadow: "0 0 0 3px rgba(225,29,72,0.1)",
//   };

//   const focusStyle: React.CSSProperties = {
//     borderColor: "var(--primary)",
//     boxShadow: "0 0 0 3px rgba(37,99,235,0.1)"
//   };

//   const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
//     <label style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.8125rem", marginBottom: 6, display: "block" }}>
//       {children} {required && <span style={{ color: "var(--rose)" }}>*</span>}
//     </label>
//   );

//   const dropdownPanel: React.CSSProperties = {
//     position: "absolute",
//     top: "calc(100% + 4px)",
//     left: 0,
//     right: 0,
//     background: "#fff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
//     zIndex: 60,
//     overflow: "hidden",
//   };

//   if (loadingCountries) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <p style={{ color: "var(--muted-foreground)" }}>Chargement des pays...</p>
//       </div>
//     );
//   }

//   if (errorCountries) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 gap-4">
//         <p style={{ color: "var(--rose)" }}>{errorCountries}</p>
//         <button
//           onClick={fetchCountries}
//           className="px-4 py-2 rounded-lg text-sm"
//           style={{ background: "var(--primary)", color: "#fff" }}
//         >
//           Réessayer
//         </button>
//       </div>
//     );
//   }

//   const formBody = (
//     <>
//       {/* Notification */}
//       {notification && (
//         <Notification
//           type={notification.type}
//           message={notification.message}
//           onClose={() => setNotification(null)}
//         />
//       )}

//       <div className="flex flex-col gap-4">
//         {/* Sender Name */}
//         <div>
//           <Label required>Sender Name</Label>
//           <input
//             style={errors.senderName ? errorInputStyle : inputStyle}
//             placeholder="ex. ORANGE_PROMO"
//             value={form.senderName}
//             onChange={(e) => {
//               setForm({ ...form, senderName: e.target.value });
//               if (errors.senderName) setErrors({ ...errors, senderName: undefined });
//             }}
//             onFocus={(e) => {
//               if (!errors.senderName) {
//                 Object.assign(e.currentTarget.style, focusStyle);
//               }
//             }}
//             onBlur={(e) => {
//               if (!errors.senderName) {
//                 Object.assign(e.currentTarget.style, { borderColor: "var(--border)", boxShadow: "none" });
//               }
//             }}
//           />
//           {errors.senderName && (
//             <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
//               {errors.senderName}
//             </p>
//           )}
//           <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
//             Max 11 caractères · Alphanumérique + underscore uniquement
//           </p>
//         </div>

//         {/* Country */}
//         <div className="relative">
//           <Label required>Pays</Label>
//           <button
//             className="w-full flex items-center justify-between"
//             style={{ ...(errors.country ? errorInputStyle : inputStyle), cursor: "pointer", textAlign: "left" }}
//             onClick={() => { closeAll(); setCountryOpen(!countryOpen); }}
//           >
//             {selectedCountry ? (
//               <span className="flex items-center gap-2">
//                 <span>{selectedCountry.flag}</span>
//                 <span style={{ color: "var(--foreground)" }}>{selectedCountry.name}</span>
//               </span>
//             ) : (
//               <span style={{ color: "var(--muted-foreground)" }}>Rechercher un pays…</span>
//             )}
//             <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//           </button>
//           {errors.country && (
//             <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
//               {errors.country}
//             </p>
//           )}
//           {countryOpen && (
//             <div style={dropdownPanel}>
//               <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
//                 <Search size={13} style={{ color: "var(--muted-foreground)" }} />
//                 <input
//                   autoFocus
//                   className="flex-1 bg-transparent outline-none"
//                   style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
//                   placeholder="Taper pour filtrer…"
//                   value={countrySearch}
//                   onChange={(e) => setCountrySearch(e.target.value)}
//                 />
//                 {countrySearch && (
//                   <button onClick={() => setCountrySearch("")}>
//                     <X size={12} style={{ color: "var(--muted-foreground)" }} />
//                   </button>
//                 )}
//               </div>
//               <div style={{ maxHeight: 220, overflowY: "auto" }}>
//                 {filtered.map((c) => (
//                   <button
//                     key={c.code}
//                     className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
//                     style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
//                     onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                     onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                     onClick={() => handleCountryChange(c.code)}
//                   >
//                     <span className="flex items-center gap-2.5">{c.flag} {c.name}</span>
//                     {form.country === c.code && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
//                   </button>
//                 ))}
//                 {filtered.length === 0 && <p className="px-3.5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Aucun résultat</p>}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Operator */}
//         <div className="relative">
//           <div className="flex items-center justify-between mb-1">
//             <Label required>Opérateur</Label>
//             {selectedCountry && hasOperators && (
//               <button
//                 type="button"
//                 onClick={() => setShowAddOperatorModal(true)}
//                 className="flex items-center gap-1 px-2 py-1 rounded text-xs"
//                 style={{ color: "var(--primary)" }}
//               >
//                 <Plus size={12} /> Ajouter un opérateur
//               </button>
//             )}
//           </div>

//           {manualOperatorMode || !hasOperators ? (
//             <div>
//               <input
//                 style={errors.operator ? errorInputStyle : inputStyle}
//                 placeholder="Saisir le nom de l'opérateur"
//                 value={form.operator}
//                 onChange={(e) => {
//                   setForm({ ...form, operator: e.target.value });
//                   if (errors.operator) setErrors({ ...errors, operator: undefined });
//                 }}
//               />
//               <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
//                 ⚡ Aucun opérateur prédéfini pour ce pays. Saisie libre autorisée.
//               </p>
//             </div>
//           ) : (
//             <>
//               <button
//                 className="w-full flex items-center justify-between"
//                 style={{ ...(errors.operator ? errorInputStyle : inputStyle), cursor: "pointer", textAlign: "left" }}
//                 onClick={() => { closeAll(); setOperatorOpen(!operatorOpen); }}
//               >
//                 <span style={{ color: form.operator ? "var(--foreground)" : "var(--muted-foreground)" }}>
//                   {form.operator || "Sélectionner un opérateur"}
//                 </span>
//                 <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: operatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//               </button>
//               {operatorOpen && operators.length > 0 && (
//                 <div style={dropdownPanel}>
//                   {operators.map((op) => (
//                     <button
//                       key={op}
//                       className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
//                       style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
//                       onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                       onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                       onClick={() => {
//                         setForm({ ...form, operator: op });
//                         setOperatorOpen(false);
//                         if (errors.operator) setErrors({ ...errors, operator: undefined });
//                       }}
//                     >
//                       {op}
//                       {form.operator === op && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
//           {errors.operator && (
//             <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
//               {errors.operator}
//             </p>
//           )}
//         </div>

//         {/* Modal d'ajout d'opérateur */}
//         {showAddOperatorModal && (
//           <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
//             <div className="rounded-xl p-6 w-96" style={{ background: "#fff" }}>
//               <h3 className="text-lg font-semibold mb-4">Ajouter un opérateur</h3>
//               <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
//                 Pour le pays : <strong>{selectedCountry?.name}</strong>
//               </p>
//               <input
//                 className="w-full px-3 py-2 rounded-lg mb-4"
//                 style={inputStyle}
//                 placeholder="Nom de l'opérateur"
//                 value={newOperatorName}
//                 onChange={(e) => setNewOperatorName(e.target.value)}
//               />
//               <div className="flex gap-3">
//                 <button
//                   onClick={addNewOperator}
//                   className="flex-1 py-2 rounded-lg"
//                   style={{ background: "var(--primary)", color: "#fff" }}
//                 >
//                   Ajouter
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAddOperatorModal(false);
//                     setNewOperatorName("");
//                   }}
//                   className="flex-1 py-2 rounded-lg border"
//                   style={{ borderColor: "var(--border)" }}
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Status */}
//         <div className="relative">
//           <Label required>Statut</Label>
//           <button
//             className="w-full flex items-center justify-between"
//             style={{ ...(errors.status ? errorInputStyle : inputStyle), cursor: "pointer", textAlign: "left" }}
//             onClick={() => { closeAll(); setStatusOpen(!statusOpen); }}
//           >
//             {selectedStatus ? (
//               <span className="flex items-center gap-2.5">
//                 <span className="w-2.5 h-2.5 rounded-full" style={{ background: selectedStatus.color }} />
//                 <span style={{ color: selectedStatus.color, fontWeight: 600 }}>{selectedStatus.label}</span>
//               </span>
//             ) : (
//               <span style={{ color: "var(--muted-foreground)" }}>Choisir un statut…</span>
//             )}
//             <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: statusOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//           </button>
//           {errors.status && (
//             <p style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: 4 }}>
//               {errors.status}
//             </p>
//           )}
//           {statusOpen && (
//             <div style={dropdownPanel}>
//               {statusOptions.map((s) => (
//                 <button
//                   key={s.value}
//                   className="w-full px-3.5 py-3 text-left flex items-center justify-between transition-colors"
//                   onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                   onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                   onClick={() => {
//                     setForm({ ...form, status: s.value, comment: s.value !== "Rejected" ? "" : form.comment });
//                     setStatusOpen(false);
//                     if (errors.status) setErrors({ ...errors, status: undefined });
//                   }}
//                 >
//                   <span className="flex items-center gap-3">
//                     <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
//                     <span style={{ color: s.color, fontWeight: 600, fontSize: "0.875rem" }}>{s.label}</span>
//                   </span>
//                   {form.status === s.value && <CheckCircle2 size={14} style={{ color: s.color }} />}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Comment */}
//         <div
//           className="rounded-lg overflow-hidden transition-all duration-300"
//           style={{
//             border: `1px solid ${isRejected && errors.comment ? "var(--rose)" : isRejected ? "var(--rose)" : "var(--border)"}`,
//             background: isRejected ? "var(--rose-muted)" : "#fafafa",
//             opacity: isRejected ? 1 : 0.55,
//           }}
//         >
//           <div className="px-4 pt-3 flex items-center justify-between">
//             <label style={{ color: isRejected ? "var(--rose)" : "var(--muted-foreground)", fontWeight: 600, fontSize: "0.8125rem" }}>
//               Motif de rejet {isRejected && <span style={{ color: "var(--rose)" }}>*</span>}
//             </label>
//             {!isRejected ? (
//               <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem" }}>
//                 <Lock size={9} /> Activé uniquement si Rejeté
//               </span>
//             ) : (
//               <span className="flex items-center gap-1.5" style={{ color: "var(--rose)", fontSize: "0.75rem", fontWeight: 600 }}>
//                 <AlertTriangle size={11} /> Champ obligatoire
//               </span>
//             )}
//           </div>
//           <textarea
//             disabled={!isRejected}
//             className="w-full px-4 py-3 bg-transparent outline-none resize-none disabled:cursor-not-allowed"
//             style={{
//               color: "var(--foreground)",
//               fontSize: "0.875rem",
//               minHeight: 80,
//             }}
//             placeholder={isRejected ? "Expliquer le motif du rejet…" : "Ce champ sera activé lorsque le statut est «Rejeté»"}
//             value={form.comment}
//             onChange={(e) => {
//               setForm({ ...form, comment: e.target.value });
//               if (errors.comment) setErrors({ ...errors, comment: undefined });
//             }}
//           />
//           {errors.comment && isRejected && (
//             <p className="px-4 pb-3" style={{ color: "var(--rose)", fontSize: "0.7rem" }}>
//               {errors.comment}
//             </p>
//           )}
//         </div>

//         {errors.submit && (
//           <div className="rounded-lg p-3" style={{ background: "var(--rose-muted)", border: "1px solid var(--rose)" }}>
//             <p style={{ color: "var(--rose)", fontSize: "0.8125rem" }}>{errors.submit}</p>
//           </div>
//         )}
//       </div>
//     </>
//   );

//   if (isModal) {
//     return (
//       <>
//         {formBody}
//         <div className="flex gap-3 mt-5">
//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="flex-1 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}
//             onMouseEnter={(e) => {
//               if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8";
//             }}
//             onMouseLeave={(e) => {
//               if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)";
//             }}
//           >
//             {submitting ? "Création en cours..." : submitLabel}
//           </button>
//           <button
//             onClick={onCancel}
//             className="px-5 py-2.5 rounded-lg border transition-all"
//             style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.875rem" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//           >
//             Annuler
//           </button>
//         </div>
//       </>
//     );
//   }

//   return (
//     <div
//       className="rounded-xl p-6"
//       style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//     >
//       {formBody}
//       <div className="flex gap-3 mt-6">
//         <button
//           onClick={handleSubmit}
//           disabled={submitting}
//           className="flex-1 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem" }}
//           onMouseEnter={(e) => {
//             if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8";
//           }}
//           onMouseLeave={(e) => {
//             if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)";
//           }}
//         >
//           {submitting ? "Création en cours..." : submitLabel}
//         </button>
//         <button
//           onClick={handleReset}
//           className="px-6 py-2.5 rounded-lg border transition-all"
//           style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
//           onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//           onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//         >
//           Réinitialiser
//         </button>
//       </div>
//     </div>
//   );
// }
// import { useState } from "react";
// import { ChevronDown, CheckCircle2, Search, X, AlertTriangle, Lock } from "lucide-react";

// const countries = [
//   { code: "CI", name: "Côte d'Ivoire",  flag: "🇨🇮", operators: ["Orange CI", "MTN CI", "Moov Africa CI"] },
//   { code: "GH", name: "Ghana",           flag: "🇬🇭", operators: ["MTN Ghana", "Telecel", "AirtelTigo"] },
//   { code: "SN", name: "Sénégal",         flag: "🇸🇳", operators: ["Orange Sénégal", "Free Sénégal", "Expresso"] },
//   { code: "NG", name: "Nigeria",          flag: "🇳🇬", operators: ["MTN Nigeria", "Airtel Nigeria", "Glo", "9mobile"] },
//   { code: "ML", name: "Mali",             flag: "🇲🇱", operators: ["Orange Mali", "Telecel Mali"] },
//   { code: "BF", name: "Burkina Faso",    flag: "🇧🇫", operators: ["Orange Burkina", "Telecel Burkina", "Moov Africa BF"] },
//   { code: "TG", name: "Togo",            flag: "🇹🇬", operators: ["Togocel", "Moov Africa Togo"] },
//   { code: "BJ", name: "Bénin",           flag: "🇧🇯", operators: ["MTN Bénin", "Moov Africa Bénin"] },
// ];

// const statusOptions = [
//   { value: "Validated", label: "Validé",     color: "#059669", bg: "var(--emerald-muted)" },
//   { value: "Pending",   label: "En attente", color: "#d97706", bg: "var(--amber-muted)"   },
//   { value: "Rejected",  label: "Rejeté",     color: "#e11d48", bg: "var(--rose-muted)"    },
// ];

// export interface FormState {
//   senderName: string;
//   country: string;
//   operator: string;
//   status: string;
//   comment: string;
// }

// interface Props {
//   initialData?: Partial<FormState>;
//   isModal?: boolean;
//   onCancel?: () => void;
//   onSubmit?: (data: FormState) => void;
//   submitLabel?: string;
// }

// export function SenderFormView({ initialData, isModal, onCancel, onSubmit, submitLabel = "Créer le sender" }: Props) {
//   const [form, setForm] = useState<FormState>({
//     senderName: initialData?.senderName ?? "",
//     country:    initialData?.country    ?? "",
//     operator:   initialData?.operator   ?? "",
//     status:     initialData?.status     ?? "",
//     comment:    initialData?.comment    ?? "",
//   });
//   const [countrySearch, setCountrySearch] = useState("");
//   const [countryOpen,   setCountryOpen]   = useState(false);
//   const [operatorOpen,  setOperatorOpen]  = useState(false);
//   const [statusOpen,    setStatusOpen]    = useState(false);

//   const filtered = countries.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
//   const selectedCountry = countries.find((c) => c.code === form.country);
//   const operators = selectedCountry?.operators ?? [];
//   const selectedStatus = statusOptions.find((s) => s.value === form.status);
//   const isRejected = form.status === "Rejected";

//   const closeAll = () => { setCountryOpen(false); setOperatorOpen(false); setStatusOpen(false); };

//   const inputStyle: React.CSSProperties = {
//     background: "#ffffff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     color: "var(--foreground)",
//     fontSize: "0.875rem",
//     outline: "none",
//     transition: "border-color 0.15s, box-shadow 0.15s",
//     width: "100%",
//     padding: "0.625rem 0.875rem",
//   };

//   const focusStyle: React.CSSProperties = { borderColor: "var(--primary)", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" };

//   const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
//     <label style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.8125rem", marginBottom: 6, display: "block" }}>
//       {children} {required && <span style={{ color: "var(--rose)" }}>*</span>}
//     </label>
//   );

//   const dropdownPanel: React.CSSProperties = {
//     position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
//     background: "#fff", border: "1px solid var(--primary)", borderRadius: 8,
//     boxShadow: "0 8px 32px rgba(37,99,235,0.12)", zIndex: 60, overflow: "hidden",
//   };

//   const formBody = (
//     <div className="flex flex-col gap-4">
//       {/* Sender Name */}
//       <div>
//         <Label required>Sender Name</Label>
//         <input
//           style={inputStyle}
//           placeholder="ex. ORANGE_PROMO"
//           value={form.senderName}
//           onChange={(e) => setForm({ ...form, senderName: e.target.value })}
//           onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
//           onBlur={(e) => Object.assign(e.currentTarget.style, { borderColor: "var(--border)", boxShadow: "none" })}
//         />
//         <p style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", marginTop: 4 }}>
//           Max 11 caractères · Alphanumérique + underscore uniquement
//         </p>
//       </div>

//       {/* Country */}
//       <div className="relative">
//         <Label required>Pays</Label>
//         <button
//           className="w-full flex items-center justify-between"
//           style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
//           onClick={() => { closeAll(); setCountryOpen(!countryOpen); }}
//         >
//           {selectedCountry ? (
//             <span className="flex items-center gap-2">
//               <span>{selectedCountry.flag}</span>
//               <span style={{ color: "var(--foreground)" }}>{selectedCountry.name}</span>
//             </span>
//           ) : (
//             <span style={{ color: "var(--muted-foreground)" }}>Rechercher un pays…</span>
//           )}
//           <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: countryOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//         </button>
//         {countryOpen && (
//           <div style={dropdownPanel}>
//             <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
//               <Search size={13} style={{ color: "var(--muted-foreground)" }} />
//               <input
//                 autoFocus
//                 className="flex-1 bg-transparent outline-none"
//                 style={{ color: "var(--foreground)", fontSize: "0.875rem" }}
//                 placeholder="Taper pour filtrer…"
//                 value={countrySearch}
//                 onChange={(e) => setCountrySearch(e.target.value)}
//               />
//               {countrySearch && (
//                 <button onClick={() => setCountrySearch("")}>
//                   <X size={12} style={{ color: "var(--muted-foreground)" }} />
//                 </button>
//               )}
//             </div>
//             <div style={{ maxHeight: 220, overflowY: "auto" }}>
//               {filtered.map((c) => (
//                 <button
//                   key={c.code}
//                   className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
//                   style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
//                   onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                   onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                   onClick={() => { setForm({ ...form, country: c.code, operator: "" }); setCountryOpen(false); setCountrySearch(""); }}
//                 >
//                   <span className="flex items-center gap-2.5">{c.flag} {c.name}</span>
//                   {form.country === c.code && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
//                 </button>
//               ))}
//               {filtered.length === 0 && <p className="px-3.5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Aucun résultat</p>}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Operator */}
//       <div className="relative">
//         <Label required>Opérateur</Label>
//         <button
//           disabled={!selectedCountry}
//           className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
//           style={{ ...inputStyle, cursor: selectedCountry ? "pointer" : "not-allowed", textAlign: "left" }}
//           onClick={() => { closeAll(); setOperatorOpen(!operatorOpen); }}
//         >
//           <span style={{ color: form.operator ? "var(--foreground)" : "var(--muted-foreground)" }}>
//             {form.operator || (selectedCountry ? "Sélectionner un opérateur" : "Sélectionner un pays d'abord")}
//           </span>
//           <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: operatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//         </button>
//         {operatorOpen && operators.length > 0 && (
//           <div style={dropdownPanel}>
//             {operators.map((op) => (
//               <button
//                 key={op}
//                 className="w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors"
//                 style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
//                 onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                 onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                 onClick={() => { setForm({ ...form, operator: op }); setOperatorOpen(false); }}
//               >
//                 {op}
//                 {form.operator === op && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Status */}
//       <div className="relative">
//         <Label required>Statut</Label>
//         <button
//           className="w-full flex items-center justify-between"
//           style={{ ...inputStyle, cursor: "pointer", textAlign: "left" }}
//           onClick={() => { closeAll(); setStatusOpen(!statusOpen); }}
//         >
//           {selectedStatus ? (
//             <span className="flex items-center gap-2.5">
//               <span className="w-2.5 h-2.5 rounded-full" style={{ background: selectedStatus.color }} />
//               <span style={{ color: selectedStatus.color, fontWeight: 600 }}>{selectedStatus.label}</span>
//             </span>
//           ) : (
//             <span style={{ color: "var(--muted-foreground)" }}>Choisir un statut…</span>
//           )}
//           <ChevronDown size={14} style={{ color: "var(--muted-foreground)", transform: statusOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
//         </button>
//         {statusOpen && (
//           <div style={dropdownPanel}>
//             {statusOptions.map((s) => (
//               <button
//                 key={s.value}
//                 className="w-full px-3.5 py-3 text-left flex items-center justify-between transition-colors"
//                 onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")}
//                 onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//                 onClick={() => { setForm({ ...form, status: s.value, comment: s.value !== "Rejected" ? "" : form.comment }); setStatusOpen(false); }}
//               >
//                 <span className="flex items-center gap-3">
//                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
//                   <span style={{ color: s.color, fontWeight: 600, fontSize: "0.875rem" }}>{s.label}</span>
//                 </span>
//                 {form.status === s.value && <CheckCircle2 size={14} style={{ color: s.color }} />}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Comment — conditional */}
//       <div
//         className="rounded-lg overflow-hidden transition-all duration-300"
//         style={{
//           border: `1px solid ${isRejected ? "var(--rose)" : "var(--border)"}`,
//           background: isRejected ? "var(--rose-muted)" : "#fafafa",
//           opacity: isRejected ? 1 : 0.55,
//         }}
//       >
//         <div className="px-4 pt-3 flex items-center justify-between">
//           <label style={{ color: isRejected ? "var(--rose)" : "var(--muted-foreground)", fontWeight: 600, fontSize: "0.8125rem" }}>
//             Motif de rejet {isRejected && <span style={{ color: "var(--rose)" }}>*</span>}
//           </label>
//           {!isRejected ? (
//             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontSize: "0.65rem" }}>
//               <Lock size={9} /> Activé uniquement si Rejeté
//             </span>
//           ) : (
//             <span className="flex items-center gap-1.5" style={{ color: "var(--rose)", fontSize: "0.75rem", fontWeight: 600 }}>
//               <AlertTriangle size={11} /> Champ obligatoire
//             </span>
//           )}
//         </div>
//         <textarea
//           disabled={!isRejected}
//           className="w-full px-4 py-3 bg-transparent outline-none resize-none disabled:cursor-not-allowed"
//           style={{ color: "var(--foreground)", fontSize: "0.875rem", minHeight: 80 }}
//           placeholder={isRejected ? "Expliquer le motif du rejet…" : "Ce champ sera activé lorsque le statut est «Rejeté»"}
//           value={form.comment}
//           onChange={(e) => setForm({ ...form, comment: e.target.value })}
//         />
//       </div>
//     </div>
//   );

//   if (isModal) {
//     return (
//       <>
//         {formBody}
//         <div className="flex gap-3 mt-5">
//           <button
//             onClick={() => onSubmit?.(form)}
//             className="flex-1 py-2.5 rounded-lg transition-all"
//             style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
//           >
//             {submitLabel}
//           </button>
//           <button
//             onClick={onCancel}
//             className="px-5 py-2.5 rounded-lg border transition-all"
//             style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.875rem" }}
//             onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//             onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//           >
//             Annuler
//           </button>
//         </div>
//       </>
//     );
//   }

//   return (
//     <div
//       className="rounded-xl p-6"
//       style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
//     >
//       {formBody}
//       <div className="flex gap-3 mt-6">
//         <button
//           onClick={() => onSubmit?.(form)}
//           className="flex-1 py-2.5 rounded-lg transition-all"
//           style={{ background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem" }}
//           onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
//           onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
//         >
//           {submitLabel}
//         </button>
//         <button
//           className="px-6 py-2.5 rounded-lg border transition-all"
//           style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
//           onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
//           onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
//         >
//           Réinitialiser
//         </button>
//       </div>
//     </div>
//   );
// }
