import React, { useState } from "react";
import {
  Award,
  Check,
  ExternalLink,
  Eye,
  LogOut,
  Moon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { KARIRFY_APP_STORE_URL } from "../../lib/supabase";
import { formatTierBadge } from "../../lib/tierAccess";
import { cn } from "../../lib/utils";

export const SettingsView: React.FC = () => {
  const { profile, user, isGuest, updateProfilePatch, signOut } = useAuth();
  const { theme, toggleTheme, isPrivacyMode, togglePrivacyMode } = useTheme();
  const { lastSyncedAt, refreshAllData } = useKarirfyData();

  const [name, setName] = useState(profile.name);
  const [institution, setInstitution] = useState(profile.institution || "");
  const [major, setMajor] = useState(profile.major || "");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const tierLabel = formatTierBadge(
    profile.tier,
    profile.is_premium,
    profile.premium_expiry_date,
    isGuest,
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfilePatch({ name, institution, major });
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Pengaturan Akun, Tampilan &amp; Continuity
        </h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Sinkronisasi iOS/iPadOS via QR Code, preferensi tema monochrome Liquid Glass, dan profil
        </p>
      </div>

      {/* Status Akun & Paket Pro Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="apple-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            <QrCode className="w-4 h-4" />
            <span>Status Sesi &amp; QR Continuity</span>
          </div>
          <div className="text-base font-bold text-[var(--text-primary)]">
            {user ? `Terhubung (${user.email || "Akun Apple/Google"})` : "Mode Tamu Lokal"}
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            {lastSyncedAt
              ? `Terakhir sinkron cloud: ${new Date(lastSyncedAt).toLocaleTimeString("id-ID")}`
              : "Data tersimpan lokal di peramban ini."}
          </p>
          <button
            type="button"
            onClick={() => void refreshAllData()}
            className="inner-pseudo-glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)]"
          >
            Sinkronkan Ulang Sekarang
          </button>
        </div>

        <div className="apple-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              <Award className="w-4 h-4" />
              <span>Status Langganan Karirfy</span>
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-1">{tierLabel}</div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Langganan Karirfy Pro pada aplikasi iOS otomatis berlaku penuh di Web Workstation ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProModal(true)}
            className="w-fit px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bandingkan Starter vs Pro</span>
          </button>
        </div>
      </div>

      {/* Profil Belajar Form */}
      <form onSubmit={handleSaveProfile} className="apple-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          <User className="w-4 h-4" />
          <span>Identitas &amp; Latar Pendidikan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
              Nama Tampilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
              Asal Universitas / Instansi
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Contoh: UI, ITB, UGM"
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
              Jurusan / Formasi Sasaran
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Contoh: Ilmu Ekonomi / Analis Kebijakan"
              className="w-full px-3.5 py-2 rounded-xl apple-sub-box text-xs text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-emerald-400 font-semibold">
            {savedNotice ? "Perubahan profil berhasil disimpan." : ""}
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold"
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>

      {/* Preferensi Workspace & Logout */}
      <div className="apple-card p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          Preferensi Workstation
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3 apple-sub-box p-3.5">
          <div className="flex items-center gap-2.5 text-xs">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>Tema Saat Ini: {theme === "dark" ? "Obsidian Gelap (#0e0e10)" : "Porcelain Terang (#e9ebf0)"}</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inner-pseudo-glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)]"
          >
            Ubah Tema
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 apple-sub-box p-3.5">
          <div className="flex items-center gap-2.5 text-xs">
            <Eye className="w-4 h-4" />
            <span>Mode Privasi Layar ({isPrivacyMode ? "Aktif: skor disamarkan" : "Nonaktif"})</span>
          </div>
          <button
            type="button"
            onClick={togglePrivacyMode}
            className="inner-pseudo-glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)]"
          >
            {isPrivacyMode ? "Tampilkan Skor" : "Sembunyikan Skor"}
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => void signOut()}
            className="px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Sesi Web</span>
          </button>
        </div>
      </div>

      {/* Liquid Glass Pro Comparison Card Modal */}
      {showProModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => setShowProModal(false)}
        >
          <div
            className="dynamic-island-shell relative w-full max-w-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dynamic-island-specular-rim" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--text-primary)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Perbandingan Karirfy Starter vs Pro
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="inner-pseudo-glass w-8 h-8 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="apple-sub-box overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-[var(--text-tertiary)]">
                    <th className="p-3">Fitur</th>
                    <th className="p-3">Starter</th>
                    <th className="p-3">Karirfy Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {[
                    ["Exercices Harian", "3 sesi / hari", "Tanpa Batas"],
                    ["Simulasi CAT CBT", "1 sesi / hari", "Tanpa Batas"],
                    ["CV Studio 16 Template ATS", "Gratis Penuh", "Gratis Penuh"],
                    ["Kalkulator CPNS 2026 (40/60)", "Tersedia", "Tersedia + Export"],
                    ["Bank Evaluasi SRS & Offline", "Standar", "Sinkronisasi Penuh"],
                  ].map(([feat, starter, pro]) => (
                    <tr key={feat}>
                      <td className="p-3 font-medium text-[var(--text-primary)]">{feat}</td>
                      <td className="p-3 text-[var(--text-tertiary)]">{starter}</td>
                      <td className={cn("p-3 font-bold text-[var(--text-primary)] inline-flex items-center gap-1")}>
                        <Check className="w-3 h-3" /> {pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Pembelian Pro dikelola aman melalui App Store iOS.
              </span>
              <a
                href={KARIRFY_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>Buka App Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
