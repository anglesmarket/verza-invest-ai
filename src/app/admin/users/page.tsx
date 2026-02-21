"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Shield, UserPlus, Trash2, AlertCircle, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  image?: string;
  createdAt: string;
}

export default function UsersManagement() {
  const { data: session, status } = useSession();
  const { toast, confirm, alert } = useNotification();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      setError("An unexpected error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if ((session.user as any).roles?.includes("admin")) {
        fetchUsers();
      } else {
        setLoading(false);
      }
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, roles: [newRole] }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, roles: [newRole] } : u));
        toast(`User role updated to ${newRole}`, "success");
      } else {
        const errData = await res.json();
        alert("Update Failed", errData.error || "The server rejected the role change.");
      }
    } catch (error) {
      toast("Connection error", "error");
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    const isConfirmed = await confirm({
       title: "Confirm Deletion",
       message: `Are you sure you want to delete user "${userName}"? This action is permanent and cannot be undone.`,
       confirmLabel: "Delete permanently",
       type: "danger"
    });

    if (!isConfirmed) return;
    
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        toast("User deleted", "warning");
      } else {
        const errData = await res.json();
        alert("Deletion Error", errData.error || "Failed to delete user record.");
      }
    } catch (error) {
      toast("Something went wrong", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !(session.user as any).roles?.includes("admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="glass-card p-10 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">Administrator privileges are required to view this page.</p>
          <Link href="/" className="btn-primary inline-flex">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage accounts, roles, and system moderators.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/admin/dashboard" className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
                Topic Dashboard
             </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 mb-8 flex items-center gap-3">
             <AlertCircle className="w-5 h-5 shrink-0" />
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-visible">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-3xl">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((profile) => (
                  <tr key={profile._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {profile.image ? (
                             <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase">
                                {profile.name[0]}
                             </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white leading-none mb-1">{profile.name}</p>
                          <p className="text-sm text-slate-500">{profile.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="relative inline-block text-left group">
                          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold transition-all ${
                            profile.roles.includes('admin') ? "bg-red-50 text-red-600 border-red-100" :
                            profile.roles.includes('moderator') ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                             {(profile.roles[0] || 'investor').toUpperCase()}
                             <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl invisible group-hover:visible z-10 transition-all opacity-0 group-hover:opacity-100">
                             <div className="p-2 space-y-1">
                                {['investor', 'moderator', 'admin'].map((roleOption) => (
                                   <button 
                                      key={roleOption}
                                      onClick={() => updateUserRole(profile._id, roleOption)}
                                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                                        profile.roles.includes(roleOption) 
                                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                      }`}
                                   >
                                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                      {profile.roles.includes(roleOption) && <Check className="w-4 h-4 text-blue-500" />}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button 
                          onClick={() => deleteUser(profile._id, profile.name)}
                          disabled={profile.email === (session.user as any).email}
                          className={`p-2.5 rounded-xl transition-all ${
                            profile.email === (session.user as any).email
                              ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white"
                          }`}
                          title={profile.email === (session.user as any).email ? "You cannot delete yourself" : "Delete User"}
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          
          {users.length === 0 && !loading && (
             <div className="py-20 text-center">
                <p className="text-slate-500">No users found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
