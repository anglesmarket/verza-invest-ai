"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, LogIn, User, LogOut, Briefcase, TrendingUp, UserPlus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Startups", href: "/startups" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const user = session?.user as any;
  const isEntrepreneur = user?.roles?.includes('entrepreneur');
  const isInvestor = user?.roles?.includes('investor');
  const isAdmin = user?.roles?.includes('admin');

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Verza InvestArt
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-pink-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pe-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full mt-2 w-56 glass-card p-2 shadow-xl animate-fade-in right-0">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 mb-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {isInvestor && <span className="badge-primary text-[10px]">Investor</span>}
                        {isEntrepreneur && <span className="badge-success text-[10px]">Entrepreneur</span>}
                        {isAdmin && <span className="badge-warning text-[10px]">Admin</span>}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Dashboard
                    </Link>

                    {isEntrepreneur && (
                      <Link
                        href="/my-startups"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        Manage Startups
                      </Link>
                    )}

                    {isAdmin && !isEntrepreneur && (
                      <Link
                        href="/my-startups"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        Manage All Startups
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors border-t border-gray-200 dark:border-gray-800 mt-1 pt-2"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-500" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="btn-ghost py-2 px-4 text-sm hidden sm:flex"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden"><UserPlus className="w-4 h-4" /></span>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${
          mobileOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block w-full text-start px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-pink-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
            >
              {link.label}
            </Link>
          ))}

          {!session && (
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <Link
                href="/auth/signin"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 text-sm font-bold text-white gradient-primary rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
