import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PersonaSwitcher from "../PersonaSwitcher";
import ThemeToggle from "../ui/ThemeToggle";
import UserMenu from "./UserMenu";
import { 
  Sun, Moon, ChevronDown, Menu, X, 
  Sparkles, TrendingUp, Landmark, ShieldAlert, FileText, Database, ShieldCheck, ArrowRight 
} from "lucide-react";

export default function PublicNavbar({
  dark,
  onToggleTheme,
  currentRole,
  activeId,
  onSelectPersona,
  authUser,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: dark ? "rgba(11, 14, 17, 0.95)" : "rgba(245, 239, 234, 0.95)",
        borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold border"
            style={{
              backgroundColor: dark ? "#1E242D" : "#EAE2D7",
              borderColor: dark ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.12)",
              color: "#D4AF37",
            }}
          >
            P.
          </div>
          <span
            className="text-xl font-bold font-serif tracking-tight"
            style={{ color: dark ? "#FFFFFF" : "#181B18" }}
          >
            PeerPulse
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold">
          {/* Product Mega Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProductDropdownOpen(!productDropdownOpen);
                setResourcesDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer transition-colors focus:outline-none"
            >
              <span className={productDropdownOpen ? "text-[var(--gold-dark)] font-bold" : ""}>Product</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${productDropdownOpen ? "rotate-180 text-[var(--gold-dark)]" : ""}`} />
            </button>

            {productDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProductDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-3 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted-fg)] px-3 py-1.5 border-b border-[var(--border)] mb-1">
                    PeerPulse Platform Pillars
                  </div>

                  <Link
                    to="/admin"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-dark)] border border-[var(--gold)]/20 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-[var(--gold-dark)] transition-colors">
                        ACIE Underwriting & Scoring
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        AI forensics, PDF tamper overlays & multi-signal scoring (Bank, GST, UPI).
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/marketplace"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-emerald-500 transition-colors">
                        Fractional P2P Marketplace
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        Diversified ₹25K–₹50K fractional tranches with ₹50K hard caps.
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/institutional"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0 mt-0.5">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-indigo-500 transition-colors">
                        NBFC 80:20 Co-Lending Desk
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        Priority sector co-lending with programmatic anchor facility allocations.
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-amber-500 transition-colors">
                        Recovery & OTS Restructuring
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        Early warning radar, NACH auto-sweeps, and 60% voting threshold OTS.
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>

          <a
            href="#how-it-works"
            className="text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            How it works
          </a>
          <Link
            to="/lender"
            className="text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            For Lenders
          </Link>
          <Link
            to="/borrower/apply"
            className="text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            For Borrowers
          </Link>
          <Link
            to="/marketplace"
            className="text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            Marketplace
          </Link>

          {/* Resources Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setResourcesDropdownOpen(!resourcesDropdownOpen);
                setProductDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer transition-colors focus:outline-none"
            >
              <span className={resourcesDropdownOpen ? "text-[var(--gold-dark)] font-bold" : ""}>Resources</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${resourcesDropdownOpen ? "rotate-180 text-[var(--gold-dark)]" : ""}`} />
            </button>

            {resourcesDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setResourcesDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 lg:left-0 mt-3 w-76 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted-fg)] px-3 py-1.5 border-b border-[var(--border)] mb-1">
                    Regulatory & Compliance
                  </div>

                  <Link
                    to="/metrics"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-dark)] border border-[var(--gold)]/20 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-[var(--gold-dark)] transition-colors">
                        Statutory Public Metrics
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        Mandatory RBI Master Directions quarterly default and recovery disclosures.
                      </div>
                    </div>
                  </Link>

                  <a
                    href="#how-it-works"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-emerald-500 transition-colors">
                        How Escrow Lending Works
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        Segregated IDFC trustee escrow architecture with 0% platform DLG.
                      </div>
                    </div>
                  </a>

                  <Link
                    to="/metrics"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted-bg)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0 mt-0.5">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--fg)] group-hover:text-blue-500 transition-colors">
                        ReBIT Data Telemetry
                      </div>
                      <div className="text-[11px] text-[var(--muted-fg)] leading-snug">
                        28,683 verified bank transactions, OD/CC limits & UPI graph telemetry.
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Demo Persona Switcher */}
          {onSelectPersona && (
            <PersonaSwitcher
              currentRole={currentRole}
              activeId={activeId}
              onSelectPersona={onSelectPersona}
            />
          )}

          {/* Dual Pill Theme Switcher [ ☾ Dark | ☼ Light ] */}
          <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} />

          {/* Sign In / User Profile Controls */}
          {authUser ? (
            <UserMenu authUser={authUser} onLogout={onLogout} dark={dark} />
          ) : (
            <>
              <Link to="/login">
                <button
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-[var(--muted-bg)] cursor-pointer"
                  style={{
                    borderColor: dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
                    color: dark ? "#F3F4F6" : "#181B18",
                  }}
                >
                  Sign in
                </button>
              </Link>

              <Link to="/register">
                <button
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: dark ? "#C5A059" : "#1A211D",
                    color: dark ? "#0C0E11" : "#FFFFFF",
                  }}
                >
                  <span>Get started</span>
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg border text-xs"
              style={{
                backgroundColor: "var(--muted-bg)",
                borderColor: "var(--border)",
              }}
            >
              {dark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border text-[var(--muted-fg)]"
            style={{
              backgroundColor: "var(--muted-bg)",
              borderColor: "var(--border)",
            }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden border-b p-4 space-y-3"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border)",
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/borrower/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-center text-xs font-bold text-white bg-[#1A211D]"
            >
              For Borrowers
            </Link>
            <Link
              to="/lender"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-center text-xs font-bold text-[var(--gold)] border border-[var(--gold)]"
            >
              For Lenders
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-center text-xs font-bold border border-[var(--border)]"
            >
              Marketplace
            </Link>
            {authUser ? (
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-center text-xs font-bold border border-rose-500/30 text-rose-400"
              >
                Sign Out ({authUser.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg text-center text-xs font-bold border border-[var(--border)] text-[var(--fg)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg text-center text-xs font-bold bg-[var(--gold)] text-black"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {onSelectPersona && (
            <div className="pt-2 border-t border-[var(--border)]">
              <PersonaSwitcher
                currentRole={currentRole}
                activeId={activeId}
                onSelectPersona={(p) => {
                  onSelectPersona(p);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
