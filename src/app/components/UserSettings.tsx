// src/app/components/UserSettings.tsx
import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Building, Save, Camera, X, 
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Edit2, Trash2, Power, Shield, UserPlus, CheckCircle2,
  AlertCircle, Lock, Eye, EyeOff, Users, ShieldAlert
} from "lucide-react";
import { Notification, NotificationType } from "./Notification";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  address?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserSettingsProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

type Tab = "profile" | "create" | "list";

export function UserSettings({ currentUser, onUpdateUser }: UserSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  
  // États pour Mon Profil
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    department: currentUser.department || "Customer",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // États pour Création d'utilisateur
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as User['role'],
    phone: "",
    department: "Customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  
  // États pour Liste des utilisateurs
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // États pour le modal de suppression
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Vérifier l'onglet à ouvrir depuis localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('settingsTab');
    if (savedTab === 'profile') {
      setActiveTab('profile');
      localStorage.removeItem('settingsTab');
    }
  }, []);

  // Charger la liste des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      showNotification('error', "Impossible de charger la liste des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        onUpdateUser(updatedUser);
        setIsEditing(false);
        showNotification('success', "Profil mis à jour avec succès");
      } else {
        const error = await response.json();
        showNotification('error', error.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      showNotification('error', "Erreur lors de la mise à jour du profil");
    } finally {
      setSavingProfile(false);
    }
  };

  // Créer un nouvel utilisateur
  const handleCreateUser = async () => {
    // Validation
    const errors: Record<string, string> = {};
    if (!newUser.firstName) errors.firstName = "Le prénom est requis";
    if (!newUser.lastName) errors.lastName = "Le nom est requis";
    if (!newUser.email) errors.email = "L'email est requis";
    if (!newUser.password) errors.password = "Le mot de passe est requis";
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (newUser.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    if (newUser.phone && newUser.phone.length > 15) {
      errors.phone = "Le numéro de téléphone ne peut pas dépasser 15 caractères";
    }
    
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    
    setCreating(true);
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          status: 'active',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', "Utilisateur créé avec succès");
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          phone: "",
          department: "Customer",
        });
        setCreateErrors({});
        fetchUsers();
        setActiveTab("list");
      } else {
        showNotification('error', data.error || "Erreur lors de la création");
      }
    } catch (err) {
      showNotification('error', "Erreur lors de la création de l'utilisateur");
    } finally {
      setCreating(false);
    }
  };

  // Modifier un utilisateur
  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          phone: editingUser.phone,
          department: editingUser.department,
          role: editingUser.role,
        }),
      });
      
      if (response.ok) {
        showNotification('success', "Utilisateur modifié avec succès");
        fetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        showNotification('error', error.error || "Erreur lors de la modification");
      }
    } catch (err) {
      showNotification('error', "Erreur lors de la modification");
    }
  };

  // Changer le statut d'un utilisateur
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        showNotification('success', `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
        fetchUsers();
      } else {
        showNotification('error', "Erreur lors du changement de statut");
      }
    } catch (err) {
      showNotification('error', "Erreur lors du changement de statut");
    }
  };

  // Supprimer un utilisateur (avec modal)
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDone(true);
        setTimeout(async () => {
          showNotification('success', `Utilisateur "${deleteTarget.firstName} ${deleteTarget.lastName}" supprimé avec succès`);
          await fetchUsers();
          setDeleteTarget(null);
          setDone(false);
          setDeleting(false);
        }, 1200);
      } else {
        showNotification('error', "Erreur lors de la suppression");
        setDeleting(false);
      }
    } catch (err) {
      showNotification('error', "Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: { bg: "var(--primary)", color: "#fff" },
      user: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
      viewer: { bg: "var(--amber-muted)", color: "var(--amber)" },
    };
    const s = styles[role as keyof typeof styles] || styles.user;
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
        {role === 'admin' ? 'Admin' : role === 'user' ? 'Utilisateur' : 'Lecteur'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
      inactive: { bg: "var(--rose-muted)", color: "var(--rose)" },
      suspended: { bg: "var(--amber-muted)", color: "var(--amber)" },
    };
    const s = styles[status as keyof typeof styles];
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
        {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
      </span>
    );
  };

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

  const labelStyle: React.CSSProperties = {
    color: "var(--foreground)",
    fontWeight: 600,
    fontSize: "0.8125rem",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && !deleting && setDeleteTarget(null)}
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
                    Supprimer cet utilisateur ?
                  </h2>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                    Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                    <code className="px-1.5 py-0.5 rounded mx-0.5" style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                      {deleteTarget.firstName} {deleteTarget.lastName}
                    </code>
                    ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border transition-all font-semibold text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fff")}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={done || deleting}
                  className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: done ? "var(--emerald-muted)" : "var(--rose)",
                    color: done ? "var(--emerald)" : "#fff",
                    boxShadow: done ? "none" : "0 2px 12px rgba(225,29,72,0.3)",
                  }}
                >
                  {done ? <><CheckCircle2 size={14} /> Supprimé</> : deleting ? "Suppression..." : <><Trash2 size={14} /> Confirmer la suppression</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: "#fff" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Modifier l'utilisateur</h2>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} className="p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Prénom</label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  maxLength={15}
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Département</label>
                <input
                  type="text"
                  value={editingUser.department || "Customer"}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                  style={inputStyle}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="viewer">Lecteur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                className="flex-1 py-2 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 py-2 rounded-lg"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Paramètres
        </h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          Gérez votre profil et les utilisateurs de la plateforme
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { id: "profile", label: "Mon profil", icon: User },
          { id: "create", label: "Créer un utilisateur", icon: UserPlus },
          { id: "list", label: "Liste des utilisateurs", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all"
              style={{
                background: activeTab === tab.id ? "#fff" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "none",
              }}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
        {/* Onglet Mon Profil */}
        {activeTab === "profile" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                  Informations personnelles
                </h2>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                  Modifiez vos informations de profil
                </p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  <Edit2 size={14} /> Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: "var(--primary)", color: "#fff" }}
                  >
                    <Save size={14} /> {savingProfile ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>Prénom</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  maxLength={15}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                />
              </div>
              <div className="col-span-2">
                <label style={labelStyle}>Adresse</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Département</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  disabled={!isEditing}
                  style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
                  placeholder="Customer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Onglet Créer un utilisateur */}
        {activeTab === "create" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              Nouvel utilisateur
            </h2>
            <p className="mb-6" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              Créez un compte pour un nouvel utilisateur de la plateforme
            </p>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>Prénom *</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  style={{ ...inputStyle, borderColor: createErrors.firstName ? "var(--rose)" : "var(--border)" }}
                />
                {createErrors.firstName && (
                  <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.firstName}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  style={{ ...inputStyle, borderColor: createErrors.lastName ? "var(--rose)" : "var(--border)" }}
                />
                {createErrors.lastName && (
                  <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.lastName}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ ...inputStyle, borderColor: createErrors.email ? "var(--rose)" : "var(--border)" }}
                />
                {createErrors.email && (
                  <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.email}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                  style={inputStyle}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="viewer">Lecteur</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    style={{ ...inputStyle, borderColor: createErrors.password ? "var(--rose)" : "var(--border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {createErrors.password && (
                  <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.password}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  style={{ ...inputStyle, borderColor: createErrors.confirmPassword ? "var(--rose)" : "var(--border)" }}
                />
                {createErrors.confirmPassword && (
                  <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.confirmPassword}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  maxLength={15}
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value.slice(0, 15) })}
                  style={inputStyle}
                />
                <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Maximum 15 caractères</p>
              </div>
              <div>
                <label style={labelStyle}>Département</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  style={inputStyle}
                  placeholder="Customer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setNewUser({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "user",
                    phone: "",
                    department: "Customer",
                  });
                  setCreateErrors({});
                }}
                className="px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                Réinitialiser
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                <UserPlus size={14} /> {creating ? "Création..." : "Créer l'utilisateur"}
              </button>
            </div>
          </div>
        )}

        {/* Onglet Liste des utilisateurs */}
        {activeTab === "list" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={inputStyle}
                  className="w-32"
                >
                  <option value="">Tous les rôles</option>
                  <option value="admin">Admin</option>
                  <option value="user">Utilisateur</option>
                  <option value="viewer">Lecteur</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={inputStyle}
                  className="w-32"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Département</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, idx) => (
                    <tr key={user.id} style={{ borderBottom: idx < paginatedUsers.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)", color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                        </div>
                       </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{user.department || "Customer"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors" 
                            title="Modifier"
                          >
                            <Edit2 size={14} style={{ color: "var(--primary)" }} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors" 
                            title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            <Power size={14} style={{ color: user.status === 'active' ? "var(--emerald)" : "var(--amber)" }} />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors" 
                            title="Supprimer"
                          >
                            <Trash2 size={14} style={{ color: "var(--rose)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {filteredUsers.length} utilisateur(s)
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
          </div>
        )}
      </div>
    </div>
  );
}
// // src/app/components/UserSettings.tsx
// import { useState, useEffect } from "react";
// import { 
//   User, Mail, Phone, MapPin, Building, Save, Camera, X, 
//   Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
//   Edit2, Trash2, Power, Shield, UserPlus, CheckCircle2,
//   AlertCircle, Lock, Eye, EyeOff, Users
// } from "lucide-react";
// import { Notification, NotificationType } from "./Notification";

// interface User {
//   id: number;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: 'admin' | 'user' | 'viewer';
//   status: 'active' | 'inactive' | 'suspended';
//   phone?: string;
//   address?: string;
//   department?: string;
//   createdAt: string;
//   lastLogin?: string;
// }

// interface UserSettingsProps {
//   currentUser: User;
//   onUpdateUser: (user: User) => void;
// }

// type Tab = "profile" | "create" | "list";

// export function UserSettings({ currentUser, onUpdateUser }: UserSettingsProps) {
//   const [activeTab, setActiveTab] = useState<Tab>("profile");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  
//   // États pour Mon Profil
//   const [profileForm, setProfileForm] = useState({
//     firstName: currentUser.firstName || "",
//     lastName: currentUser.lastName || "",
//     email: currentUser.email || "",
//     phone: currentUser.phone || "",
//     address: currentUser.address || "",
//     department: currentUser.department || "Customer",
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [savingProfile, setSavingProfile] = useState(false);
  
//   // États pour Création d'utilisateur
//   const [newUser, setNewUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "user" as User['role'],
//     phone: "",
//     department: "Customer", // Valeur par défaut "Customer"
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  
//   // États pour Liste des utilisateurs
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);

//   const showNotification = (type: NotificationType, message: string) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 5000);
//   };

//   // Vérifier l'onglet à ouvrir depuis localStorage
//   useEffect(() => {
//     const savedTab = localStorage.getItem('settingsTab');
//     if (savedTab === 'profile') {
//       setActiveTab('profile');
//       localStorage.removeItem('settingsTab');
//     }
//   }, []);

//   // Charger la liste des utilisateurs
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/api/users');
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data);
//       }
//     } catch (err) {
//       console.error("Erreur lors du chargement des utilisateurs:", err);
//       showNotification('error', "Impossible de charger la liste des utilisateurs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mettre à jour le profil
//   const handleUpdateProfile = async () => {
//     setSavingProfile(true);
//     try {
//       const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(profileForm),
//       });
      
//       if (response.ok) {
//         const updatedUser = await response.json();
//         onUpdateUser(updatedUser);
//         setIsEditing(false);
//         showNotification('success', "Profil mis à jour avec succès");
//       } else {
//         const error = await response.json();
//         showNotification('error', error.error || "Erreur lors de la mise à jour");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors de la mise à jour du profil");
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   // Créer un nouvel utilisateur
//   const handleCreateUser = async () => {
//     // Validation
//     const errors: Record<string, string> = {};
//     if (!newUser.firstName) errors.firstName = "Le prénom est requis";
//     if (!newUser.lastName) errors.lastName = "Le nom est requis";
//     if (!newUser.email) errors.email = "L'email est requis";
//     if (!newUser.password) errors.password = "Le mot de passe est requis";
//     if (newUser.password !== newUser.confirmPassword) {
//       errors.confirmPassword = "Les mots de passe ne correspondent pas";
//     }
//     if (newUser.password.length < 6) {
//       errors.password = "Le mot de passe doit contenir au moins 6 caractères";
//     }
//     if (newUser.phone && newUser.phone.length > 15) {
//       errors.phone = "Le numéro de téléphone ne peut pas dépasser 15 caractères";
//     }
    
//     if (Object.keys(errors).length > 0) {
//       setCreateErrors(errors);
//       return;
//     }
    
//     setCreating(true);
//     try {
//       const response = await fetch('http://localhost:3000/api/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...newUser,
//           status: 'active',
//         }),
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         showNotification('success', "Utilisateur créé avec succès");
//         setNewUser({
//           firstName: "",
//           lastName: "",
//           email: "",
//           password: "",
//           confirmPassword: "",
//           role: "user",
//           phone: "",
//           department: "Customer",
//         });
//         setCreateErrors({});
//         fetchUsers();
//         setActiveTab("list");
//       } else {
//         showNotification('error', data.error || "Erreur lors de la création");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors de la création de l'utilisateur");
//     } finally {
//       setCreating(false);
//     }
//   };

//   // Modifier un utilisateur
//   const handleEditUser = async () => {
//     if (!editingUser) return;
    
//     try {
//       const response = await fetch(`http://localhost:3000/api/users/${editingUser.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           firstName: editingUser.firstName,
//           lastName: editingUser.lastName,
//           email: editingUser.email,
//           phone: editingUser.phone,
//           department: editingUser.department,
//           role: editingUser.role,
//         }),
//       });
      
//       if (response.ok) {
//         showNotification('success', "Utilisateur modifié avec succès");
//         fetchUsers();
//         setShowEditModal(false);
//         setEditingUser(null);
//       } else {
//         const error = await response.json();
//         showNotification('error', error.error || "Erreur lors de la modification");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors de la modification");
//     }
//   };

//   // Changer le statut d'un utilisateur
//   const handleToggleStatus = async (user: User) => {
//     const newStatus = user.status === 'active' ? 'inactive' : 'active';
//     try {
//       const response = await fetch(`http://localhost:3000/api/users/${user.id}/status`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus }),
//       });
      
//       if (response.ok) {
//         showNotification('success', `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
//         fetchUsers();
//       } else {
//         showNotification('error', "Erreur lors du changement de statut");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors du changement de statut");
//     }
//   };

//   // Supprimer un utilisateur
//   const handleDeleteUser = async (user: User) => {
//     if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
//       try {
//         const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
//           method: 'DELETE',
//         });
        
//         if (response.ok) {
//           showNotification('success', "Utilisateur supprimé avec succès");
//           fetchUsers();
//         } else {
//           showNotification('error', "Erreur lors de la suppression");
//         }
//       } catch (err) {
//         showNotification('error', "Erreur lors de la suppression");
//       }
//     }
//   };

//   // Filtrer les utilisateurs
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = 
//       user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = !roleFilter || user.role === roleFilter;
//     const matchesStatus = !statusFilter || user.status === statusFilter;
//     return matchesSearch && matchesRole && matchesStatus;
//   });

//   const paginatedUsers = filteredUsers.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   const getRoleBadge = (role: string) => {
//     const styles = {
//       admin: { bg: "var(--primary)", color: "#fff" },
//       user: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//       viewer: { bg: "var(--amber-muted)", color: "var(--amber)" },
//     };
//     const s = styles[role as keyof typeof styles] || styles.user;
//     return (
//       <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
//         {role === 'admin' ? 'Admin' : role === 'user' ? 'Utilisateur' : 'Lecteur'}
//       </span>
//     );
//   };

//   const getStatusBadge = (status: string) => {
//     const styles = {
//       active: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//       inactive: { bg: "var(--rose-muted)", color: "var(--rose)" },
//       suspended: { bg: "var(--amber-muted)", color: "var(--amber)" },
//     };
//     const s = styles[status as keyof typeof styles];
//     return (
//       <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
//         {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
//       </span>
//     );
//   };

//   const inputStyle: React.CSSProperties = {
//     background: "#ffffff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     padding: "0.625rem 0.875rem",
//     fontSize: "0.875rem",
//     outline: "none",
//     transition: "all 0.15s",
//     width: "100%",
//   };

//   const labelStyle: React.CSSProperties = {
//     color: "var(--foreground)",
//     fontWeight: 600,
//     fontSize: "0.8125rem",
//     marginBottom: 6,
//     display: "block",
//   };

//   return (
//     <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
//       {notification && (
//         <Notification
//           type={notification.type}
//           message={notification.message}
//           onClose={() => setNotification(null)}
//         />
//       )}

//       {/* Modal d'édition */}
//       {showEditModal && editingUser && (
//         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="rounded-xl p-6 w-full max-w-md" style={{ background: "#fff" }}>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Modifier l'utilisateur</h2>
//               <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} className="p-1">
//                 <X size={18} />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label style={labelStyle}>Prénom</label>
//                 <input
//                   type="text"
//                   value={editingUser.firstName}
//                   onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Nom</label>
//                 <input
//                   type="text"
//                   value={editingUser.lastName}
//                   onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Email</label>
//                 <input
//                   type="email"
//                   value={editingUser.email}
//                   onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Téléphone</label>
//                 <input
//                   type="tel"
//                   maxLength={15}
//                   value={editingUser.phone || ""}
//                   onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Département</label>
//                 <input
//                   type="text"
//                   value={editingUser.department || "Customer"}
//                   onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Rôle</label>
//                 <select
//                   value={editingUser.role}
//                   onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
//                   style={inputStyle}
//                 >
//                   <option value="user">Utilisateur</option>
//                   <option value="admin">Administrateur</option>
//                   <option value="viewer">Lecteur</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => { setShowEditModal(false); setEditingUser(null); }}
//                 className="flex-1 py-2 rounded-lg border"
//                 style={{ borderColor: "var(--border)" }}
//               >
//                 Annuler
//               </button>
//               <button
//                 onClick={handleEditUser}
//                 className="flex-1 py-2 rounded-lg"
//                 style={{ background: "var(--primary)", color: "#fff" }}
//               >
//                 Enregistrer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
//           Paramètres
//         </h1>
//         <p style={{ color: "var(--muted-foreground)" }}>
//           Gérez votre profil et les utilisateurs de la plateforme
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
//         {[
//           { id: "profile", label: "Mon profil", icon: User },
//           { id: "create", label: "Créer un utilisateur", icon: UserPlus },
//           { id: "list", label: "Liste des utilisateurs", icon: Users },
//         ].map((tab) => {
//           const Icon = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id as Tab)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all"
//               style={{
//                 background: activeTab === tab.id ? "#fff" : "transparent",
//                 color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
//                 borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "none",
//               }}
//             >
//               <Icon size={16} />
//               <span className="text-sm font-medium">{tab.label}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Contenu des onglets */}
//       <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
//         {/* Onglet Mon Profil */}
//         {activeTab === "profile" && (
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
//                   Informations personnelles
//                 </h2>
//                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//                   Modifiez vos informations de profil
//                 </p>
//               </div>
//               {!isEditing ? (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                   style={{ background: "var(--primary)", color: "#fff" }}
//                 >
//                   <Edit2 size={14} /> Modifier
//                 </button>
//               ) : (
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 rounded-lg border text-sm"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     Annuler
//                   </button>
//                   <button
//                     onClick={handleUpdateProfile}
//                     disabled={savingProfile}
//                     className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                     style={{ background: "var(--primary)", color: "#fff" }}
//                   >
//                     <Save size={14} /> {savingProfile ? "Enregistrement..." : "Enregistrer"}
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-5">
//               <div>
//                 <label style={labelStyle}>Prénom</label>
//                 <input
//                   type="text"
//                   value={profileForm.firstName}
//                   onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Nom</label>
//                 <input
//                   type="text"
//                   value={profileForm.lastName}
//                   onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Email</label>
//                 <input
//                   type="email"
//                   value={profileForm.email}
//                   onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Téléphone</label>
//                 <input
//                   type="tel"
//                   maxLength={15}
//                   value={profileForm.phone}
//                   onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label style={labelStyle}>Adresse</label>
//                 <input
//                   type="text"
//                   value={profileForm.address}
//                   onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Département</label>
//                 <input
//                   type="text"
//                   value={profileForm.department}
//                   onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                   placeholder="Customer"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Onglet Créer un utilisateur */}
//         {activeTab === "create" && (
//           <div className="p-6">
//             <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
//               Nouvel utilisateur
//             </h2>
//             <p className="mb-6" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//               Créez un compte pour un nouvel utilisateur de la plateforme
//             </p>

//             <div className="grid grid-cols-2 gap-5">
//               <div>
//                 <label style={labelStyle}>Prénom *</label>
//                 <input
//                   type="text"
//                   value={newUser.firstName}
//                   onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.firstName ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.firstName && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.firstName}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Nom *</label>
//                 <input
//                   type="text"
//                   value={newUser.lastName}
//                   onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.lastName ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.lastName && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.lastName}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Email *</label>
//                 <input
//                   type="email"
//                   value={newUser.email}
//                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.email ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.email && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Rôle</label>
//                 <select
//                   value={newUser.role}
//                   onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
//                   style={inputStyle}
//                 >
//                   <option value="user">Utilisateur</option>
//                   <option value="admin">Administrateur</option>
//                   <option value="viewer">Lecteur</option>
//                 </select>
//               </div>
//               <div>
//                 <label style={labelStyle}>Mot de passe *</label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={newUser.password}
//                     onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                     style={{ ...inputStyle, borderColor: createErrors.password ? "var(--rose)" : "var(--border)" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                     style={{ color: "var(--muted-foreground)" }}
//                   >
//                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 </div>
//                 {createErrors.password && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.password}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Confirmer le mot de passe *</label>
//                 <input
//                   type="password"
//                   value={newUser.confirmPassword}
//                   onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.confirmPassword ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.confirmPassword && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.confirmPassword}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Téléphone</label>
//                 <input
//                   type="tel"
//                   maxLength={15}
//                   value={newUser.phone}
//                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value.slice(0, 15) })}
//                   style={inputStyle}
//                 />
//                 <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Maximum 15 caractères</p>
//               </div>
//               <div>
//                 <label style={labelStyle}>Département</label>
//                 <input
//                   type="text"
//                   value={newUser.department}
//                   onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
//                   style={inputStyle}
//                   placeholder="Customer"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
//               <button
//                 onClick={() => {
//                   setNewUser({
//                     firstName: "",
//                     lastName: "",
//                     email: "",
//                     password: "",
//                     confirmPassword: "",
//                     role: "user",
//                     phone: "",
//                     department: "Customer",
//                   });
//                   setCreateErrors({});
//                 }}
//                 className="px-4 py-2 rounded-lg border text-sm"
//                 style={{ borderColor: "var(--border)" }}
//               >
//                 Réinitialiser
//               </button>
//               <button
//                 onClick={handleCreateUser}
//                 disabled={creating}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                 style={{ background: "var(--primary)", color: "#fff" }}
//               >
//                 <UserPlus size={14} /> {creating ? "Création..." : "Créer l'utilisateur"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Onglet Liste des utilisateurs */}
//         {activeTab === "list" && (
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
//               <div className="flex gap-2 flex-1 max-w-md">
//                 <div className="relative flex-1">
//                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
//                   <input
//                     type="text"
//                     placeholder="Rechercher un utilisateur..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-9"
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <select
//                   value={roleFilter}
//                   onChange={(e) => setRoleFilter(e.target.value)}
//                   style={inputStyle}
//                   className="w-32"
//                 >
//                   <option value="">Tous les rôles</option>
//                   <option value="admin">Admin</option>
//                   <option value="user">Utilisateur</option>
//                   <option value="viewer">Lecteur</option>
//                 </select>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   style={inputStyle}
//                   className="w-32"
//                 >
//                   <option value="">Tous les statuts</option>
//                   <option value="active">Actif</option>
//                   <option value="inactive">Inactif</option>
//                   <option value="suspended">Suspendu</option>
//                 </select>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Utilisateur</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Email</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Rôle</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Statut</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Département</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedUsers.map((user, idx) => (
//                     <tr key={user.id} style={{ borderBottom: idx < paginatedUsers.length - 1 ? "1px solid var(--border)" : "none" }}>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)", color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>
//                             {user.firstName.charAt(0)}{user.lastName.charAt(0)}
//                           </div>
//                           <span className="font-medium">{user.firstName} {user.lastName}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{user.email}</td>
//                       <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
//                       <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
//                       <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{user.department || "Customer"}</td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button 
//                             onClick={() => {
//                               setEditingUser(user);
//                               setShowEditModal(true);
//                             }}
//                             className="p-1.5 rounded hover:bg-gray-100 transition-colors" 
//                             title="Modifier"
//                           >
//                             <Edit2 size={14} style={{ color: "var(--primary)" }} />
//                           </button>
//                           <button 
//                             onClick={() => handleToggleStatus(user)}
//                             className="p-1.5 rounded hover:bg-gray-100 transition-colors" 
//                             title={user.status === 'active' ? 'Désactiver' : 'Activer'}
//                           >
//                             <Power size={14} style={{ color: user.status === 'active' ? "var(--emerald)" : "var(--amber)" }} />
//                           </button>
//                           <button 
//                             onClick={() => handleDeleteUser(user)}
//                             className="p-1.5 rounded hover:bg-red-50 transition-colors" 
//                             title="Supprimer"
//                           >
//                             <Trash2 size={14} style={{ color: "var(--rose)" }} />
//                           </button>
//                         </div>
//                       </td>
//                      </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-between items-center mt-4 pt-4 border-t">
//                 <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
//                   {filteredUsers.length} utilisateur(s)
//                 </p>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="p-2 rounded border disabled:opacity-40"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     <ChevronLeft size={14} />
//                   </button>
//                   <span className="px-3 py-1 text-sm">
//                     Page {currentPage} / {totalPages}
//                   </span>
//                   <button
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages}
//                     className="p-2 rounded border disabled:opacity-40"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     <ChevronRight size={14} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );}
// // src/app/components/UserSettings.tsx
// import { useState, useEffect } from "react";
// import { 
//   User, Mail, Phone, MapPin, Building, Save, Camera, X, 
//   Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
//   Edit2, Trash2, Power, Shield, UserPlus, CheckCircle2,
//   AlertCircle, Lock, Eye, EyeOff, Users
// } from "lucide-react";
// import { Notification, NotificationType } from "./Notification";

// interface User {
//   id: number;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: 'admin' | 'user' | 'viewer';
//   status: 'active' | 'inactive' | 'suspended';
//   phone?: string;
//   address?: string;
//   department?: string;
//   createdAt: string;
//   lastLogin?: string;
// }

// interface UserSettingsProps {
//   currentUser: User;
//   onUpdateUser: (user: User) => void;
// }

// type Tab = "profile" | "create" | "list";

// export function UserSettings({ currentUser, onUpdateUser }: UserSettingsProps) {
//   const [activeTab, setActiveTab] = useState<Tab>("profile");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  
//   // États pour Mon Profil
//   const [profileForm, setProfileForm] = useState({
//     firstName: currentUser.firstName || "",
//     lastName: currentUser.lastName || "",
//     email: currentUser.email || "",
//     phone: currentUser.phone || "",
//     address: currentUser.address || "",
//     department: currentUser.department || "",
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [savingProfile, setSavingProfile] = useState(false);
  
//   // États pour Création d'utilisateur
//   const [newUser, setNewUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "user" as User['role'],
//     phone: "",
//     department: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  
//   // États pour Liste des utilisateurs
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

//   const showNotification = (type: NotificationType, message: string) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 5000);
//   };

//   // Vérifier l'onglet à ouvrir depuis localStorage
//   useEffect(() => {
//     const savedTab = localStorage.getItem('settingsTab');
//     if (savedTab === 'profile') {
//       setActiveTab('profile');
//       localStorage.removeItem('settingsTab');
//     }
//   }, []);

//   // Charger la liste des utilisateurs
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/api/users');
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data);
//       }
//     } catch (err) {
//       console.error("Erreur lors du chargement des utilisateurs:", err);
//       showNotification('error', "Impossible de charger la liste des utilisateurs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mettre à jour le profil
//   const handleUpdateProfile = async () => {
//     setSavingProfile(true);
//     try {
//       const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(profileForm),
//       });
      
//       if (response.ok) {
//         const updatedUser = await response.json();
//         onUpdateUser(updatedUser);
//         setIsEditing(false);
//         showNotification('success', "Profil mis à jour avec succès");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors de la mise à jour du profil");
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   // Créer un nouvel utilisateur
//   const handleCreateUser = async () => {
//     // Validation
//     const errors: Record<string, string> = {};
//     if (!newUser.firstName) errors.firstName = "Le prénom est requis";
//     if (!newUser.lastName) errors.lastName = "Le nom est requis";
//     if (!newUser.email) errors.email = "L'email est requis";
//     if (!newUser.password) errors.password = "Le mot de passe est requis";
//     if (newUser.password !== newUser.confirmPassword) {
//       errors.confirmPassword = "Les mots de passe ne correspondent pas";
//     }
//     if (newUser.password.length < 6) {
//       errors.password = "Le mot de passe doit contenir au moins 6 caractères";
//     }
    
//     if (Object.keys(errors).length > 0) {
//       setCreateErrors(errors);
//       return;
//     }
    
//     setCreating(true);
//     try {
//       const response = await fetch('http://localhost:3000/api/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...newUser,
//           status: 'active',
//         }),
//       });
      
//       if (response.ok) {
//         showNotification('success', "Utilisateur créé avec succès");
//         setNewUser({
//           firstName: "",
//           lastName: "",
//           email: "",
//           password: "",
//           confirmPassword: "",
//           role: "user",
//           phone: "",
//           department: "",
//         });
//         setCreateErrors({});
//         fetchUsers();
//         setActiveTab("list");
//       }
//     } catch (err) {
//       showNotification('error', "Erreur lors de la création de l'utilisateur");
//     } finally {
//       setCreating(false);
//     }
//   };

//   // Filtrer les utilisateurs
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = 
//       user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = !roleFilter || user.role === roleFilter;
//     const matchesStatus = !statusFilter || user.status === statusFilter;
//     return matchesSearch && matchesRole && matchesStatus;
//   });

//   const paginatedUsers = filteredUsers.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   const getRoleBadge = (role: string) => {
//     const styles = {
//       admin: { bg: "var(--primary)", color: "#fff" },
//       user: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//       viewer: { bg: "var(--amber-muted)", color: "var(--amber)" },
//     };
//     const s = styles[role as keyof typeof styles] || styles.user;
//     return (
//       <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
//         {role === 'admin' ? 'Admin' : role === 'user' ? 'Utilisateur' : 'Lecteur'}
//       </span>
//     );
//   };

//   const getStatusBadge = (status: string) => {
//     const styles = {
//       active: { bg: "var(--emerald-muted)", color: "var(--emerald)" },
//       inactive: { bg: "var(--rose-muted)", color: "var(--rose)" },
//       suspended: { bg: "var(--amber-muted)", color: "var(--amber)" },
//     };
//     const s = styles[status as keyof typeof styles];
//     return (
//       <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
//         {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
//       </span>
//     );
//   };

//   const inputStyle: React.CSSProperties = {
//     background: "#ffffff",
//     border: "1px solid var(--border)",
//     borderRadius: 8,
//     padding: "0.625rem 0.875rem",
//     fontSize: "0.875rem",
//     outline: "none",
//     transition: "all 0.15s",
//     width: "100%",
//   };

//   const labelStyle: React.CSSProperties = {
//     color: "var(--foreground)",
//     fontWeight: 600,
//     fontSize: "0.8125rem",
//     marginBottom: 6,
//     display: "block",
//   };

//   return (
//     <div className="h-full overflow-auto p-6" style={{ background: "var(--background)" }}>
//       {notification && (
//         <Notification
//           type={notification.type}
//           message={notification.message}
//           onClose={() => setNotification(null)}
//         />
//       )}

//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
//           Paramètres
//         </h1>
//         <p style={{ color: "var(--muted-foreground)" }}>
//           Gérez votre profil et les utilisateurs de la plateforme
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
//         {[
//           { id: "profile", label: "Mon profil", icon: User },
//           { id: "create", label: "Créer un utilisateur", icon: UserPlus },
//           { id: "list", label: "Liste des utilisateurs", icon: Users },
//         ].map((tab) => {
//           const Icon = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id as Tab)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all"
//               style={{
//                 background: activeTab === tab.id ? "#fff" : "transparent",
//                 color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)",
//                 borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "none",
//               }}
//             >
//               <Icon size={16} />
//               <span className="text-sm font-medium">{tab.label}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Contenu des onglets */}
//       <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
//         {/* Onglet Mon Profil */}
//         {activeTab === "profile" && (
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
//                   Informations personnelles
//                 </h2>
//                 <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//                   Modifiez vos informations de profil
//                 </p>
//               </div>
//               {!isEditing ? (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                   style={{ background: "var(--primary)", color: "#fff" }}
//                 >
//                   <Edit2 size={14} /> Modifier
//                 </button>
//               ) : (
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 rounded-lg border text-sm"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     Annuler
//                   </button>
//                   <button
//                     onClick={handleUpdateProfile}
//                     disabled={savingProfile}
//                     className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                     style={{ background: "var(--primary)", color: "#fff" }}
//                   >
//                     <Save size={14} /> {savingProfile ? "Enregistrement..." : "Enregistrer"}
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-5">
//               <div>
//                 <label style={labelStyle}>Prénom</label>
//                 <input
//                   type="text"
//                   value={profileForm.firstName}
//                   onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Nom</label>
//                 <input
//                   type="text"
//                   value={profileForm.lastName}
//                   onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Email</label>
//                 <input
//                   type="email"
//                   value={profileForm.email}
//                   onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Téléphone</label>
//                 <input
//                   type="tel"
//                   value={profileForm.phone}
//                   onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label style={labelStyle}>Adresse</label>
//                 <input
//                   type="text"
//                   value={profileForm.address}
//                   onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Département</label>
//                 <input
//                   type="text"
//                   value={profileForm.department}
//                   onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
//                   disabled={!isEditing}
//                   style={{ ...inputStyle, background: !isEditing ? "var(--secondary)" : "#fff" }}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Onglet Créer un utilisateur */}
//         {activeTab === "create" && (
//           <div className="p-6">
//             <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
//               Nouvel utilisateur
//             </h2>
//             <p className="mb-6" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
//               Créez un compte pour un nouvel utilisateur de la plateforme
//             </p>

//             <div className="grid grid-cols-2 gap-5">
//               <div>
//                 <label style={labelStyle}>Prénom *</label>
//                 <input
//                   type="text"
//                   value={newUser.firstName}
//                   onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.firstName ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.firstName && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.firstName}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Nom *</label>
//                 <input
//                   type="text"
//                   value={newUser.lastName}
//                   onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.lastName ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.lastName && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.lastName}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Email *</label>
//                 <input
//                   type="email"
//                   value={newUser.email}
//                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.email ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.email && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Rôle</label>
//                 <select
//                   value={newUser.role}
//                   onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
//                   style={inputStyle}
//                 >
//                   <option value="user">Utilisateur</option>
//                   <option value="admin">Administrateur</option>
//                   <option value="viewer">Lecteur</option>
//                 </select>
//               </div>
//               <div>
//                 <label style={labelStyle}>Mot de passe *</label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={newUser.password}
//                     onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                     style={{ ...inputStyle, borderColor: createErrors.password ? "var(--rose)" : "var(--border)" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                     style={{ color: "var(--muted-foreground)" }}
//                   >
//                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 </div>
//                 {createErrors.password && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.password}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Confirmer le mot de passe *</label>
//                 <input
//                   type="password"
//                   value={newUser.confirmPassword}
//                   onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
//                   style={{ ...inputStyle, borderColor: createErrors.confirmPassword ? "var(--rose)" : "var(--border)" }}
//                 />
//                 {createErrors.confirmPassword && (
//                   <p className="mt-1 text-xs" style={{ color: "var(--rose)" }}>{createErrors.confirmPassword}</p>
//                 )}
//               </div>
//               <div>
//                 <label style={labelStyle}>Téléphone</label>
//                 <input
//                   type="tel"
//                   value={newUser.phone}
//                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//               <div>
//                 <label style={labelStyle}>Département</label>
//                 <input
//                   type="text"
//                   value={newUser.department}
//                   onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
//                   style={inputStyle}
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
//               <button
//                 onClick={() => {
//                   setNewUser({
//                     firstName: "",
//                     lastName: "",
//                     email: "",
//                     password: "",
//                     confirmPassword: "",
//                     role: "user",
//                     phone: "",
//                     department: "",
//                   });
//                   setCreateErrors({});
//                 }}
//                 className="px-4 py-2 rounded-lg border text-sm"
//                 style={{ borderColor: "var(--border)" }}
//               >
//                 Réinitialiser
//               </button>
//               <button
//                 onClick={handleCreateUser}
//                 disabled={creating}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
//                 style={{ background: "var(--primary)", color: "#fff" }}
//               >
//                 <UserPlus size={14} /> {creating ? "Création..." : "Créer l'utilisateur"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Onglet Liste des utilisateurs */}
//         {activeTab === "list" && (
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
//               <div className="flex gap-2 flex-1 max-w-md">
//                 <div className="relative flex-1">
//                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
//                   <input
//                     type="text"
//                     placeholder="Rechercher un utilisateur..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-9"
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <select
//                   value={roleFilter}
//                   onChange={(e) => setRoleFilter(e.target.value)}
//                   style={inputStyle}
//                   className="w-32"
//                 >
//                   <option value="">Tous les rôles</option>
//                   <option value="admin">Admin</option>
//                   <option value="user">Utilisateur</option>
//                   <option value="viewer">Lecteur</option>
//                 </select>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   style={inputStyle}
//                   className="w-32"
//                 >
//                   <option value="">Tous les statuts</option>
//                   <option value="active">Actif</option>
//                   <option value="inactive">Inactif</option>
//                   <option value="suspended">Suspendu</option>
//                 </select>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--secondary)" }}>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Utilisateur</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Email</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Rôle</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Statut</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Dernière connexion</th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedUsers.map((user, idx) => (
//                     <tr key={user.id} style={{ borderBottom: idx < paginatedUsers.length - 1 ? "1px solid var(--border)" : "none" }}>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--primary)", color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>
//                             {user.firstName.charAt(0)}{user.lastName.charAt(0)}
//                           </div>
//                           <span className="font-medium">{user.firstName} {user.lastName}</span>
//                         </div>
//                        </td>
//                       <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{user.email}</td>
//                       <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
//                       <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
//                       <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
//                         {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button className="p-1.5 rounded hover:bg-gray-100" title="Modifier">
//                             <Edit2 size={14} style={{ color: "var(--primary)" }} />
//                           </button>
//                           <button className="p-1.5 rounded hover:bg-gray-100" title="Activer/Désactiver">
//                             <Power size={14} style={{ color: user.status === 'active' ? "var(--emerald)" : "var(--amber)" }} />
//                           </button>
//                           <button className="p-1.5 rounded hover:bg-red-50" title="Supprimer">
//                             <Trash2 size={14} style={{ color: "var(--rose)" }} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-between items-center mt-4 pt-4 border-t">
//                 <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
//                   {filteredUsers.length} utilisateur(s)
//                 </p>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="p-2 rounded border disabled:opacity-40"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     <ChevronLeft size={14} />
//                   </button>
//                   <span className="px-3 py-1 text-sm">
//                     Page {currentPage} / {totalPages}
//                   </span>
//                   <button
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages}
//                     className="p-2 rounded border disabled:opacity-40"
//                     style={{ borderColor: "var(--border)" }}
//                   >
//                     <ChevronRight size={14} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }