"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  UserPlus,
  Mail,
  Tag,
  StickyNote,
  ExternalLink,
  Rocket,
  Filter,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

/* ─── Types ─── */
interface ContactItem {
  id: string;
  contactUser: {
    id: string;
    name: string;
    email: string;
    image: string;
    roles: string[];
  } | null;
  startup: {
    id: string;
    name: string;
    logo: string;
  } | null;
  note: string;
  category: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "investor", label: "Investor" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "partner", label: "Partner" },
  { value: "advisor", label: "Advisor" },
  { value: "other", label: "Other" },
];

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Edit modal
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editCategory, setEditCategory] = useState("other");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin");
  }, [status, router]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      showToast("Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchContacts();
  }, [status, fetchContacts]);

  /* ── Filtered contacts ── */
  const filtered = contacts.filter((c) => {
    const matchesSearch =
      !search ||
      c.contactUser?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactUser?.email.toLowerCase().includes(search.toLowerCase()) ||
      c.note.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setContacts((prev) => prev.filter((c) => c.id !== id));
      showToast("Contact removed");
    } catch {
      showToast("Failed to delete contact", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!editingContact) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingContact.id,
          note: editNote,
          category: editCategory,
        }),
      });
      if (!res.ok) throw new Error();
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContact.id ? { ...c, note: editNote, category: editCategory } : c
        )
      );
      setEditingContact(null);
      showToast("Contact updated");
    } catch {
      showToast("Failed to update contact", "error");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (contact: ContactItem) => {
    setEditingContact(contact);
    setEditNote(contact.note);
    setEditCategory(contact.category);
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Contacts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field pl-10 pr-8 py-2.5 text-sm appearance-none min-w-[160px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {contacts.length === 0 ? "No contacts yet" : "No matching contacts"}
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
              {contacts.length === 0
                ? "Visit a startup page and click 'Save Contact' to add founders and investors to your network."
                : "Try adjusting your search or filter."}
            </p>
            {contacts.length === 0 && (
              <Link
                href="/startups"
                className="btn-primary py-2.5 px-6 text-sm mt-6 inline-flex"
              >
                <Rocket className="w-4 h-4" />
                Browse Startups
              </Link>
            )}
          </div>
        )}

        {/* Contact Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="glass-card p-5 group hover:shadow-md transition-all rounded-2xl"
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                    {contact.contactUser?.image ? (
                      <img
                        src={contact.contactUser.image}
                        alt={contact.contactUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      contact.contactUser?.name?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {contact.contactUser?.name || "Unknown User"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      {contact.contactUser?.email || "—"}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {contact.contactUser?.roles?.map((role) => (
                        <span
                          key={role}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            role === "investor"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              : role === "entrepreneur"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                    {contact.category}
                  </span>
                  {contact.startup && (
                    <Link
                      href={`/startups/${contact.startup.id}`}
                      className="text-[10px] text-indigo-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 ml-auto"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {contact.startup.name}
                    </Link>
                  )}
                </div>

                {/* Note */}
                {contact.note && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 flex items-start gap-1.5">
                      <StickyNote className="w-3 h-3 shrink-0 mt-0.5" />
                      {contact.note}
                    </p>
                  </div>
                )}

                {/* Date + Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">
                    Added {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(contact)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {deletingId === contact.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-[10px] font-bold text-red-600 px-2 py-1 bg-red-50 dark:bg-red-950/30 rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-[10px] font-medium text-slate-500 px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(contact.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md shadow-2xl rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Contact
              </h2>
              <button
                onClick={() => setEditingContact(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold uppercase">
                {editingContact.contactUser?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {editingContact.contactUser?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {editingContact.contactUser?.email}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="input-field py-2.5 text-sm"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Note
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Add a personal note about this contact..."
                className="input-field py-2.5 text-sm resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {editNote.length}/500
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingContact(null)}
                className="btn-ghost py-2.5 text-sm flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="btn-primary py-2.5 text-sm flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-600"
              : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
