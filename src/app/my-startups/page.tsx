"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Rocket,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  X,
  Loader2,
  AlertCircle,
  Globe,
  MapPin,
  Users,
  ExternalLink,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

/* ─── Types ─── */
interface StartupItem {
  id: string;
  _id: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  logo: string;
  website: string;
  status: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
  stage: string;
  teamSize: number;
  description: string;
  owner?: { _id: string; name: string; image?: string };
  createdAt: string;
}

interface FormData {
  name: string;
  tagline: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  problem: string;
  solution: string;
  valueProposition: string;
  businessModel: string;
  teamSize: number;
  fundingGoal: number;
  stage: string;
  minimumInvestment: number;
}

const EMPTY_FORM: FormData = {
  name: "",
  tagline: "",
  logo: "",
  industry: "SaaS",
  location: "",
  website: "",
  problem: "",
  solution: "",
  valueProposition: "",
  businessModel: "",
  teamSize: 1,
  fundingGoal: 100000,
  stage: "seed",
  minimumInvestment: 1000,
};

const INDUSTRIES = [
  "SaaS",
  "FinTech",
  "HealthTech",
  "EdTech",
  "AI/ML",
  "E-commerce",
  "CleanTech",
  "Marketplace",
  "Social",
  "Gaming",
  "DevTools",
  "Other",
];

const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B+" },
  { value: "growth", label: "Growth" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Published" },
  pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Pending Review" },
  draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", label: "Draft" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Rejected" },
};

/* ─── Helpers ─── */
function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function isValidUrl(s: string) {
  if (!s) return true; // optional
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

/* ─── Main Page ─── */
export default function ManageStartupsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { toast, confirm } = useNotification();

  // State
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewAll, setViewAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<StartupItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);

  const user = session?.user as any;
  const isAdmin = user?.roles?.includes("admin");
  const isEntrepreneur = user?.roles?.includes("entrepreneur");
  const hasAccess = isAdmin || isEntrepreneur;

  /* ─── Redirect ─── */
  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/auth/signin");
  }, [authStatus, router]);

  /* ─── Fetch ─── */
  const fetchStartups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (viewAll && isAdmin) {
        params.set("viewAll", "true");
      } else {
        params.set("owner", "me");
      }

      if (searchQuery) params.set("search", searchQuery);
      if (filterIndustry !== "All") params.set("industry", filterIndustry);

      const res = await fetch(`/api/startups?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStartups(data.startups || []);
      if (data.industries) setIndustries(data.industries);
    } catch {
      toast("Failed to load startups", "error");
    } finally {
      setLoading(false);
    }
  }, [viewAll, isAdmin, searchQuery, filterIndustry, toast]);

  useEffect(() => {
    if (authStatus === "authenticated" && hasAccess) {
      fetchStartups();
    }
  }, [authStatus, hasAccess, fetchStartups]);

  /* ─── Filter on client side for status ─── */
  const displayedStartups = filterStatus === "All"
    ? startups
    : startups.filter((s) => s.status === filterStatus);

  /* ─── Form Validation ─── */
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!form.name.trim()) errors.name = "Name is required";
    else if (form.name.length < 2) errors.name = "Name must be at least 2 characters";

    if (!form.tagline.trim()) errors.tagline = "Tagline is required";
    else if (form.tagline.length > 120) errors.tagline = "Tagline must be under 120 characters";

    if (form.logo && !isValidUrl(form.logo)) errors.logo = "Must be a valid URL";
    if (form.website && !isValidUrl(form.website)) errors.website = "Must be a valid URL";

    if (form.fundingGoal < 1000) errors.fundingGoal = "Minimum funding goal is $1,000";
    if (form.minimumInvestment < 100) errors.minimumInvestment = "Minimum investment is $100";
    if (form.teamSize < 1) errors.teamSize = "At least 1 team member";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ─── Create / Edit ─── */
  const openCreateModal = () => {
    setEditingStartup(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (startup: StartupItem) => {
    setEditingStartup(startup);
    setForm({
      name: startup.name,
      tagline: startup.tagline,
      logo: startup.logo || "",
      industry: startup.industry || "SaaS",
      location: startup.location || "",
      website: startup.website || "",
      problem: startup.description || "",
      solution: "",
      valueProposition: "",
      businessModel: "",
      teamSize: startup.teamSize || 1,
      fundingGoal: startup.fundingGoal || 100000,
      stage: startup.stage || "seed",
      minimumInvestment: 1000,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const url = editingStartup
        ? `/api/startups/${editingStartup.id}`
        : "/api/startups";
      const method = editingStartup ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      toast(
        editingStartup
          ? "Startup updated successfully! It will be reviewed shortly."
          : "Startup created! It will be reviewed before publishing.",
        "success"
      );
      setModalOpen(false);
      fetchStartups();
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (startup: StartupItem) => {
    const confirmed = await confirm({
      title: "Delete Startup",
      message: `Are you sure you want to permanently delete "${startup.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;

    setDeletingId(startup.id);
    try {
      const res = await fetch(`/api/startups/${startup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast("Startup deleted", "success");
      setStartups((prev) => prev.filter((s) => s.id !== startup.id));
    } catch (err: any) {
      toast(err.message || "Failed to delete startup", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Admin Status Change ─── */
  const handleStatusChange = async (startup: StartupItem, newStatus: string) => {
    try {
      const res = await fetch(`/api/startups/${startup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast(`Status changed to ${STATUS_STYLES[newStatus]?.label || newStatus}`, "success");
      fetchStartups();
    } catch {
      toast("Failed to update status", "error");
    }
  };

  /* ─── Auth Guard ─── */
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }
  if (!session) return null;
  if (!hasAccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-24 p-4">
        <div className="glass-card p-10 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Required
          </h1>
          <p className="text-slate-500 mb-6">
            You need entrepreneur or admin privileges to manage startups.
          </p>
          <Link href="/dashboard" className="btn-primary inline-flex">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {viewAll && isAdmin ? "All Startups" : "My Startups"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {viewAll && isAdmin
                ? `Manage all startup listings across the platform (${startups.length} total)`
                : "Create and manage your startup profiles."}
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary py-2.5 px-5 text-sm w-fit">
            <Plus className="w-4 h-4" />
            Add New Startup
          </button>
        </div>

        {/* ═══ Toolbar ═══ */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search startups by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Industry Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="input-field pl-10 pr-8 py-2.5 text-sm appearance-none bg-slate-50 dark:bg-slate-800/50 min-w-[140px]"
              >
                <option value="All">All Industries</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field py-2.5 pr-8 text-sm appearance-none bg-slate-50 dark:bg-slate-800/50 min-w-[140px]"
              >
                <option value="All">All Statuses</option>
                <option value="approved">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Admin View All Toggle */}
            {isAdmin && (
              <button
                onClick={() => setViewAll(!viewAll)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  viewAll
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {viewAll ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                <span className="whitespace-nowrap">View All</span>
              </button>
            )}
          </div>
        </div>

        {/* ═══ Content ═══ */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : displayedStartups.length > 0 ? (
          <div className="space-y-4">
            {displayedStartups.map((startup) => {
              const pct =
                startup.fundingGoal > 0
                  ? Math.min(
                      (startup.fundingRaised / startup.fundingGoal) * 100,
                      100
                    )
                  : 0;
              const st = STATUS_STYLES[startup.status] || STATUS_STYLES.draft;
              const isDeleting = deletingId === startup.id;

              return (
                <div
                  key={startup.id}
                  className={`glass-card p-6 transition-all duration-300 ${
                    isDeleting ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Logo/Avatar */}
                      {startup.logo ? (
                        <img
                          src={startup.logo}
                          alt={startup.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {startup.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {startup.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${st.bg} ${st.text}`}
                          >
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {startup.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="badge-primary text-xs">
                            {startup.industry}
                          </span>
                          {startup.stage && (
                            <span className="badge-warning text-xs capitalize">
                              {startup.stage}
                            </span>
                          )}
                          {startup.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {startup.location}
                            </span>
                          )}
                          {startup.teamSize > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Users className="w-3 h-3" />
                              {startup.teamSize}
                            </span>
                          )}
                          {viewAll && startup.owner && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              by {(startup.owner as any).name || "Unknown"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Admin status dropdown */}
                      {isAdmin && viewAll && (
                        <select
                          value={startup.status}
                          onChange={(e) =>
                            handleStatusChange(startup, e.target.value)
                          }
                          className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="draft">Draft</option>
                        </select>
                      )}

                      <button
                        onClick={() => openEditModal(startup)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/startups/${startup.id}`}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(startup)}
                        disabled={isDeleting}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(startup.fundingRaised)} raised
                      </span>
                      <span className="text-xs text-slate-500">
                        {pct.toFixed(0)}% of {formatCurrency(startup.fundingGoal)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500">
                        {startup.investorCount} investor
                        {startup.investorCount !== 1 ? "s" : ""}
                      </p>
                      {startup.website && (
                        <a
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-pink-400 hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <Rocket className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {searchQuery || filterIndustry !== "All" || filterStatus !== "All"
                ? "No Matching Startups"
                : "No Startups Yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterIndustry !== "All" || filterStatus !== "All"
                ? "Try adjusting your search or filters."
                : "Create your first startup listing to begin attracting investors."}
            </p>
            {!searchQuery && filterIndustry === "All" && filterStatus === "All" && (
              <button onClick={openCreateModal} className="btn-primary inline-flex">
                <Plus className="w-4 h-4" />
                Create Your First Startup
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══ Add/Edit Modal ═══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center p-4 pt-20 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl shadow-2xl animate-scale-up border border-slate-200 dark:border-slate-800 my-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingStartup ? "Edit Startup" : "Create New Startup"}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingStartup
                    ? "Update your startup details. Changes require re-approval."
                    : "Fill out the details below. Your listing will be reviewed before publishing."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* ── Basic Info ── */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Basic Information
                </h3>
                <div className="h-px bg-gradient-to-r from-indigo-500 to-pink-500 opacity-30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Startup Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Acme AI"
                    className={`input-field py-2.5 text-sm ${formErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Industry
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="input-field py-2.5 text-sm"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tagline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="A short, catchy description of what you do"
                  className={`input-field py-2.5 text-sm ${formErrors.tagline ? "border-red-500 focus:ring-red-500" : ""}`}
                  maxLength={120}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.tagline && (
                    <p className="text-red-500 text-xs">{formErrors.tagline}</p>
                  )}
                  <p className="text-xs text-slate-400 ml-auto">{form.tagline.length}/120</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="input-field py-2.5 text-sm"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className={`input-field py-2.5 text-sm ${formErrors.logo ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {formErrors.logo && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.logo}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                  className={`input-field py-2.5 text-sm ${formErrors.website ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {formErrors.website && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.website}</p>
                )}
              </div>

              {/* ── Pitch ── */}
              <div className="space-y-1 pt-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Your Pitch
                </h3>
                <div className="h-px bg-gradient-to-r from-indigo-500 to-pink-500 opacity-30" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Problem You Solve
                </label>
                <textarea
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  placeholder="What problem does your startup address?"
                  className="input-field py-2.5 text-sm min-h-[80px] resize-y"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Solution
                </label>
                <textarea
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  placeholder="How does your product/service solve it?"
                  className="input-field py-2.5 text-sm min-h-[80px] resize-y"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Value Proposition
                  </label>
                  <textarea
                    value={form.valueProposition}
                    onChange={(e) =>
                      setForm({ ...form, valueProposition: e.target.value })
                    }
                    placeholder="What makes you unique?"
                    className="input-field py-2.5 text-sm min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Business Model
                  </label>
                  <textarea
                    value={form.businessModel}
                    onChange={(e) =>
                      setForm({ ...form, businessModel: e.target.value })
                    }
                    placeholder="How do you make money?"
                    className="input-field py-2.5 text-sm min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>
              </div>

              {/* ── Funding ── */}
              <div className="space-y-1 pt-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Team & Funding
                </h3>
                <div className="h-px bg-gradient-to-r from-indigo-500 to-pink-500 opacity-30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.teamSize}
                    onChange={(e) =>
                      setForm({ ...form, teamSize: parseInt(e.target.value) || 1 })
                    }
                    className={`input-field py-2.5 text-sm ${formErrors.teamSize ? "border-red-500" : ""}`}
                  />
                  {formErrors.teamSize && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.teamSize}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Stage
                  </label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    className="input-field py-2.5 text-sm"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Funding Goal ($)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={form.fundingGoal}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fundingGoal: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`input-field py-2.5 text-sm ${formErrors.fundingGoal ? "border-red-500" : ""}`}
                  />
                  {formErrors.fundingGoal && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.fundingGoal}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Minimum Investment ($)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={form.minimumInvestment}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minimumInvestment: parseInt(e.target.value) || 100,
                    })
                  }
                  className={`input-field py-2.5 text-sm max-w-[200px] ${formErrors.minimumInvestment ? "border-red-500" : ""}`}
                />
                {formErrors.minimumInvestment && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.minimumInvestment}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="btn-ghost py-2.5 px-5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary py-2.5 px-6 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : editingStartup ? (
                  "Save Changes"
                ) : (
                  "Create Startup"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
