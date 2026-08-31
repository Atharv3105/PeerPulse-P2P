import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck, ArrowRight, Clock, Users, CheckCircle2,
  Lock, TrendingUp, ArrowLeftRight, Landmark, Store, FileText,
  Activity, Sparkles, ChevronRight, Zap, Search, ArrowUpRight
} from "lucide-react";
import PublicNavbar from "../components/layout/PublicNavbar";
import { GradeBadge } from "../components/ui/Badge";

export default function LandingPage({
  dark,
  onToggleTheme,
  currentRole,
  activeId,
  onSelectPersona,
  authUser,
  onLogout,
}) {
  const navigate = useNavigate();

  // 4 Demo Personas for quick interactive test
  const demoPersonas = [
    {
      id: "BOR-PRIYA-001",
      businessName: "Sharma Electricals",
      proprietor: "Priya Sharma",
      type: "Proprietorship • Gurugram, Haryana",
      gstin: "07ABCDE1234F1Z5",
      capacity: "₹8.4L",
      confidence: "92%",
      confidenceLevel: "High confidence",
      grade: "A",
      score: 810,
      signals: [
        { name: "Bank transactions", status: "Verified", type: "bank" },
        { name: "GST filings", status: "Consistent", type: "gst" },
        { name: "UPI activity", status: "Verified", type: "upi" },
        { name: "Existing obligations", status: "Low", type: "shield" }
      ],
      route: "/borrower/dashboard"
    },
    {
      id: "BOR-RAVI-002",
      businessName: "Ravi General Stores",
      proprietor: "Ravi Kumar Verma",
      type: "Proprietorship • Pune, Maharashtra",
      gstin: "27AABCV5920K1Z8",
      capacity: "₹3.0L",
      confidence: "68%",
      confidenceLevel: "Moderate confidence",
      grade: "C",
      score: 590,
      signals: [
        { name: "Bank transactions", status: "2 Bounces", type: "bank" },
        { name: "GST filings", status: "47% Delta", type: "gst" },
        { name: "UPI activity", status: "Verified", type: "upi" },
        { name: "Existing obligations", status: "Medium", type: "shield" }
      ],
      route: "/borrower/dashboard"
    },
    {
      id: "BOR-KUMAR-003",
      businessName: "Kumar Logistics & Spares",
      proprietor: "Kumar Chandran",
      type: "Private Limited • Chennai, TN",
      gstin: "33AABCK3100M1Z2",
      capacity: "₹0.0L",
      confidence: "12%",
      confidenceLevel: "Blocked (Forged PDF)",
      grade: "DECLINED",
      score: 310,
      signals: [
        { name: "Bank transactions", status: "Forged PDF", type: "bank" },
        { name: "GST filings", status: "Mismatched", type: "gst" },
        { name: "UPI activity", status: "Cycle Ring", type: "upi" },
        { name: "Existing obligations", status: "High Risk", type: "shield" }
      ],
      route: "/admin"
    },
    {
      id: "BOR-AMIT-004",
      businessName: "Deshmukh Precision Engineering",
      proprietor: "Amit Deshmukh",
      type: "MSME Unit • Coimbatore, TN",
      gstin: "33AABCD7100J1Z4",
      capacity: "₹5.0L",
      confidence: "84%",
      confidenceLevel: "Active OTS Ballot",
      grade: "B",
      score: 710,
      signals: [
        { name: "Bank transactions", status: "Verified", type: "bank" },
        { name: "GST filings", status: "Consistent", type: "gst" },
        { name: "UPI activity", status: "Verified", type: "upi" },
        { name: "Existing obligations", status: "12 DPD", type: "shield" }
      ],
      route: "/lender"
    }
  ];

  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0);
  const activeAssessment = demoPersonas[selectedPersonaIndex];

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      style={{
        backgroundColor: dark ? "#0A0D10" : "#F5EFEA",
        color: dark ? "#F3F4F6" : "#181B18",
      }}
    >
      {/* Header */}
      <PublicNavbar
        dark={dark}
        onToggleTheme={onToggleTheme}
        currentRole={currentRole}
        activeId={activeId}
        onSelectPersona={onSelectPersona}
        authUser={authUser}
        onLogout={onLogout}
      />

      {/* ── 1. EXACT MASTER HERO SECTION (TARGET UI) ───────────────── */}
      <section
        className="pt-8 pb-12 sm:pt-12 sm:pb-16 border-b relative overflow-hidden"
        style={{
          borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Copy */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#C5A059]">
                CREDIT INTELLIGENCE PLATFORM
              </div>

              {/* Serif Title + Gold Accent Dash */}
              <div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight leading-[1.12]"
                  style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                >
                  Credit intelligence for India’s MSMEs.
                </h1>
                <div className="w-12 h-1 bg-[#C5A059] rounded-full mt-3.5" />
              </div>

              {/* Subtitle */}
              <p
                className="text-sm sm:text-base max-w-lg leading-relaxed"
                style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
              >
                Assess businesses using verified banking, GST and transaction signals — not just traditional credit history.
              </p>

              {/* Action Buttons (Exact Target Styling in Dark & Light) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/borrower/apply">
                  {dark ? (
                    <button className="px-5 py-3 rounded-xl text-xs font-bold text-[#FFF] bg-gradient-to-r from-[#94712F] via-[#A88237] to-[#8C6B2B] hover:brightness-110 border border-[#C5A059] flex items-center gap-2.5 shadow-lg transition-all cursor-pointer">
                      <span>Apply for credit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button className="px-5 py-3 rounded-xl text-xs font-bold bg-[#1C2C22] hover:bg-[#253A2D] text-white border border-[#324B3B] flex items-center gap-2.5 shadow-md transition-all cursor-pointer">
                      <Landmark className="w-4 h-4 text-[#8CE3A0]" />
                      <span>Apply for credit</span>
                    </button>
                  )}
                </Link>

                <Link to="/marketplace">
                  {dark ? (
                    <button className="px-5 py-3 rounded-xl text-xs font-bold bg-transparent hover:bg-white/5 text-[#E5E7EB] border border-white/20 flex items-center gap-2.5 shadow-sm transition-all cursor-pointer">
                      <span>Explore marketplace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button className="px-5 py-3 rounded-xl text-xs font-bold bg-[#D8CBB8] hover:bg-[#E2D6C5] text-[#181B18] flex items-center gap-2.5 shadow-md transition-all border border-[#C5B59E] cursor-pointer">
                      <Search className="w-4 h-4 text-[#554D42]" />
                      <span>Explore marketplace</span>
                    </button>
                  )}
                </Link>
              </div>

              {/* 3 Metric Pills */}
              <div
                className="grid grid-cols-3 gap-3 pt-6 border-t max-w-md"
                style={{
                  borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center border text-[#C5A059] shrink-0"
                    style={{
                      borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold font-mono leading-none"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      30 sec
                    </p>
                    <p
                      className="text-[11px] mt-1 leading-tight"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      Typical assessment time
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center border text-[#C5A059] shrink-0"
                    style={{
                      borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <span className="font-serif font-bold text-xs">₹</span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold font-mono leading-none"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      ₹50K+
                    </p>
                    <p
                      className="text-[11px] mt-1 leading-tight"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      Minimum ticket size
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center border text-[#C5A059] shrink-0"
                    style={{
                      borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold font-mono leading-none"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      4
                    </p>
                    <p
                      className="text-[11px] mt-1 leading-tight"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      Active lending partners
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Exact Leather Binder + Inner Assessment Dossier + Pen */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                
                {/* 3D Luxury Executive Pen in Pen Loop */}
                <div className="absolute right-[-18px] sm:right-[-22px] top-1/2 -translate-y-1/2 z-20 hidden sm:block">
                  <div className="executive-fountain-pen">
                    <div className="pen-clip" />
                    <div className="pen-gold-band top-[90px]" />
                    <div className="pen-gold-band top-[98px]" />
                    <div className="pen-gold-band bottom-[48px]" />
                    <div className="pen-nib" />
                  </div>
                </div>

                {/* Outer Leather Binder Folder */}
                <div
                  className="rounded-3xl p-5 sm:p-6 sm:pr-8 relative border"
                  style={{
                    backgroundColor: dark ? "#0E1116" : "#EAE0D3",
                    borderColor: dark ? "rgba(212, 175, 55, 0.3)" : "rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {/* Brass Rivet on Top-Right Corner */}
                  <div className="absolute top-4 right-4 sm:right-6">
                    <div className="brass-rivet-large" />
                  </div>

                  {/* Stitched Seam Inside Folder */}
                  <div
                    className="stitched-seam p-3 sm:p-4"
                    style={{
                      borderColor: dark ? "rgba(212, 175, 55, 0.4)" : "rgba(180, 155, 125, 0.6)",
                    }}
                  >
                    
                    {/* Inner Assessment Card */}
                    <div
                      className="rounded-2xl p-5 sm:p-6 space-y-4 border transition-colors shadow-lg"
                      style={{
                        backgroundColor: dark ? "#13171E" : "#F8F4EE",
                        borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                        color: dark ? "#F3F4F6" : "#1A1D1A",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center justify-between text-[11px] pb-2 border-b"
                        style={{
                          borderColor: dark ? "#202632" : "#E2D8C9",
                        }}
                      >
                        <span
                          className="font-bold tracking-[0.08em] uppercase"
                          style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                        >
                          SAMPLE ASSESSMENT
                        </span>
                        <div
                          className="flex items-center gap-1.5 font-mono text-[10px]"
                          style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                        >
                          <span>Updated 2 min ago</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>

                      {/* Shop / Business Profile */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center border shrink-0 shadow-sm"
                          style={{
                            background: dark ? "radial-gradient(circle at 35% 35%, #4A3D1E 0%, #251F10 100%)" : "#2B352E",
                            borderColor: "#A68038",
                            color: "#D4AF37",
                          }}
                        >
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-base font-bold font-serif leading-tight"
                            style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                          >
                            {activeAssessment.businessName}
                          </h3>
                          <p
                            className="text-xs mt-0.5 truncate"
                            style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                          >
                            {activeAssessment.type}
                          </p>
                          <p
                            className="text-[10px] font-mono"
                            style={{ color: dark ? "#6B7280" : "#787165" }}
                          >
                            GSTIN: {activeAssessment.gstin}
                          </p>
                        </div>
                      </div>

                      {/* 2-Column KPI Indicators */}
                      <div
                        className="grid grid-cols-2 gap-4 py-2 border-y"
                        style={{
                          borderColor: dark ? "#202632" : "#E2D8C9",
                        }}
                      >
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                          >
                            CREDIT CAPACITY
                          </p>
                          <p
                            className="text-2xl font-bold font-mono mt-0.5"
                            style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                          >
                            {activeAssessment.capacity}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                          >
                            Potential credit capacity
                          </p>
                        </div>

                        <div
                          className="border-l pl-4"
                          style={{
                            borderColor: dark ? "#202632" : "#E2D8C9",
                          }}
                        >
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                          >
                            CONFIDENCE
                          </p>
                          <p className="text-2xl font-bold font-mono text-emerald-500 mt-0.5">
                            {activeAssessment.confidence}
                          </p>
                          <p className="text-[10px] font-semibold text-emerald-500">
                            {activeAssessment.confidenceLevel}
                          </p>
                        </div>
                      </div>

                      {/* KEY SIGNALS Table */}
                      <div className="space-y-1.5">
                        <p
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: dark ? "#8E95A2" : "#736B5E" }}
                        >
                          KEY SIGNALS
                        </p>

                        <div
                          className="divide-y text-xs"
                          style={{
                            borderColor: dark ? "#1F2633" : "#EAE0D3",
                          }}
                        >
                          {activeAssessment.signals.map((signal, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1.5"
                              style={{
                                borderColor: dark ? "#1F2633" : "#EAE0D3",
                              }}
                            >
                              <div
                                className="flex items-center gap-2"
                                style={{ color: dark ? "#E5E7EB" : "#242A24" }}
                              >
                                {idx === 0 && <Landmark className="w-3.5 h-3.5 text-[#8E95A2]" />}
                                {idx === 1 && <FileText className="w-3.5 h-3.5 text-[#8E95A2]" />}
                                {idx === 2 && <ArrowUpRight className="w-3.5 h-3.5 text-[#8E95A2]" />}
                                {idx === 3 && <ShieldCheck className="w-3.5 h-3.5 text-[#8E95A2]" />}
                                <span className="text-[11px] font-medium">{signal.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="text-[11px] font-mono"
                                  style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                                >
                                  {signal.status}
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Button inside Card */}
                      <div
                        onClick={() => {
                          if (onSelectPersona) onSelectPersona(activeAssessment.id);
                          navigate(activeAssessment.route);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border"
                        style={{
                          backgroundColor: dark ? "#181E28" : "#EAE0D3",
                          borderColor: dark ? "#2B3545" : "#D5C9B8",
                          color: dark ? "#C5A059" : "#181B18",
                        }}
                      >
                        <span className="text-xs font-bold">
                          View full assessment
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8E95A2]" />
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. EXACT PINNED PARCHMENT/OBSIDIAN STRIP ─────────────── */}
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Panel pinned with 4 Brass Screws */}
          <div
            className="rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-colors"
            style={{
              backgroundColor: dark ? "#0E1217" : "#F4ECE1",
              borderColor: dark ? "#1E2530" : "#D8CCBD",
              color: dark ? "#F3F4F6" : "#181B18",
            }}
          >
            {/* 4 Corner Brass Screws */}
            <div className="absolute top-4 left-4"><div className="brass-rivet" /></div>
            <div className="absolute top-4 right-4"><div className="brass-rivet" /></div>
            <div className="absolute bottom-4 left-4"><div className="brass-rivet" /></div>
            <div className="absolute bottom-4 right-4"><div className="brass-rivet" /></div>

            <div className="space-y-6">
              {/* Centered Serif Section Title */}
              <h2
                className="text-center font-serif text-xl sm:text-2xl font-bold"
                style={{ color: dark ? "#FFFFFF" : "#181B18" }}
              >
                Why lenders choose PeerPulse
              </h2>

              {/* 4 Pillars with Embossed Coins */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x"
                style={{
                  borderColor: dark ? "#1E2530" : "#DDD0BF",
                }}
              >
                {/* Pillar 1 */}
                <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
                  <div className="embossed-circle-icon shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold font-serif"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      RBI-compliant
                    </h4>
                    <p
                      className="text-[11px] mt-0.5 leading-relaxed"
                      style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                    >
                      Built on transparent, auditable processes.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
                  <div className="embossed-circle-icon shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold font-serif"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      Bank-grade security
                    </h4>
                    <p
                      className="text-[11px] mt-0.5 leading-relaxed"
                      style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                    >
                      End-to-end encryption and data privacy.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
                  <div className="embossed-circle-icon shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold font-serif"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      Better risk insights
                    </h4>
                    <p
                      className="text-[11px] mt-0.5 leading-relaxed"
                      style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                    >
                      Multi-signal view of business health.
                    </p>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:px-4">
                  <div className="embossed-circle-icon shrink-0">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold font-serif"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      Lower credit costs
                    </h4>
                    <p
                      className="text-[11px] mt-0.5 leading-relaxed"
                      style={{ color: dark ? "#9CA3AF" : "#5C564C" }}
                    >
                      Accurate underwriting leads to lower NPAs.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. 5D ACIE ENGINE METHODOLOGY ──────────────────────────── */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 border-t"
        style={{
          borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C5A059]">
              UNDERWRITING METHODOLOGY
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold font-serif"
              style={{ color: dark ? "#FFFFFF" : "#181B18" }}
            >
              Alternate Credit Intelligence Engine (ACIE)
            </h2>
            <p
              className="text-sm"
              style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
            >
              Five independent telemetry signals producing an explainable 300–900 composite credit score in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                weight: "30%",
                title: "1. Cash Flow & PDF Forensics",
                desc: "PyMuPDF analyzes character placement, font family consistency, and PDF metadata to detect document forgery before evaluating cash-flow health.",
                badge: "Mistral-7B Reasoning"
              },
              {
                weight: "25%",
                title: "2. UPI Network Graph",
                desc: "Constructs directed graphs to flag artificial circular transactions, uniform repetitions, and sudden velocity spikes in a 72-hour window.",
                badge: "NetworkX Cycle Scan"
              },
              {
                weight: "20%",
                title: "3. GST Filing Reconciliation",
                desc: "Cross-validates declared GSTR-1 turnover against annualized bank credits. Flags discrepancies exceeding 40% threshold.",
                badge: "Tax vs Bank Delta"
              },
              {
                weight: "15%",
                title: "4. Operational Footprint",
                desc: "Analyzes Google Business reviews, customer sentiment, operational recency, and employee headcount declarations.",
                badge: "Grassroots Telemetry"
              },
              {
                weight: "10%",
                title: "5. Account Aggregator Data",
                desc: "ReBIT-compliant AA telemetry fetches verified bank statements directly from source institutions with zero manual tampering.",
                badge: "RBI Account Aggregator"
              },
              {
                weight: "100%",
                title: "Transparent Risk Bands",
                desc: "Categorizes MSMEs into Grade A (Prime), Grade B (Standard), Grade C (Subprime), or Blocked with actionable improvement guidance.",
                badge: "RBI-Compliant Output"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border space-y-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: dark ? "#13171E" : "#FFFFFF",
                  borderColor: dark ? "#1E2530" : "rgba(0, 0, 0, 0.09)",
                }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded border border-[#C5A059] text-[#C5A059]">
                      {item.weight}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3
                    className="text-base font-bold font-serif"
                    style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. EVALUATOR PERSONA LAUNCHPAD ─────────────────────────── */}
      <section
        className="py-16 sm:py-20 border-t"
        style={{
          borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C5A059]">
              BUILDATHON EVALUATOR LAUNCHPAD
            </span>
            <h2
              className="text-3xl font-bold font-serif"
              style={{ color: dark ? "#FFFFFF" : "#181B18" }}
            >
              1-Click Interactive Test Personas
            </h2>
            <p
              className="text-xs"
              style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
            >
              Select any persona to immediately load its forensic assessment, documents, and repayment scenario.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoPersonas.map((persona, idx) => (
              <div
                key={persona.id}
                onClick={() => {
                  setSelectedPersonaIndex(idx);
                  if (onSelectPersona) onSelectPersona(persona.id);
                  navigate(persona.route);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  selectedPersonaIndex === idx
                    ? "border-[#C5A059] shadow-md"
                    : ""
                }`}
                style={{
                  backgroundColor: dark ? "#13171E" : "#FFFFFF",
                  borderColor: selectedPersonaIndex === idx ? "#C5A059" : dark ? "#1E2530" : "rgba(0,0,0,0.09)",
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <GradeBadge grade={persona.grade} size="sm" />
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      {persona.id}
                    </span>
                  </div>
                  <div>
                    <h4
                      className="font-bold text-sm font-serif"
                      style={{ color: dark ? "#FFFFFF" : "#181B18" }}
                    >
                      {persona.proprietor}
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                    >
                      {persona.businessName}
                    </p>
                  </div>
                  <p
                    className="text-[11px] leading-relaxed pt-1"
                    style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
                  >
                    Capacity: <strong className="font-mono" style={{ color: dark ? "#FFFFFF" : "#181B18" }}>{persona.capacity}</strong> • {persona.confidenceLevel}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-[#C5A059]">
                  <span>Launch Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="py-12 border-t mt-auto"
        style={{
          backgroundColor: dark ? "#080A0D" : "#EAE2D7",
          borderColor: dark ? "#1A202A" : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-serif text-xs font-bold border border-[#C5A059] bg-[#1E242D] text-[#D4AF37]">
              P.
            </div>
            <span
              className="text-lg font-bold font-serif tracking-tight"
              style={{ color: dark ? "#FFFFFF" : "#181B18" }}
            >
              PeerPulse
            </span>
          </div>

          <p
            className="text-xs max-w-xl mx-auto"
            style={{ color: dark ? "#9CA3AF" : "#6B6760" }}
          >
            "Credit where credit is actually due." — Alternate Credit Intelligence Engine + Fractional Pooling Platform for Indian MSMEs.
          </p>

          <p
            className="text-[11px] font-mono"
            style={{ color: dark ? "#6B7280" : "#8C8578" }}
          >
            Razorpay AI Buildathon 2026 · RBI NBFC-P2P Master Directions (2017/2023)
          </p>
        </div>
      </footer>
    </div>
  );
}
