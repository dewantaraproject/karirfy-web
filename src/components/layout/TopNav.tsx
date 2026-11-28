import React from "react";
import {
  Eye,
  EyeOff,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { cn } from "../../lib/utils";
import type { NavTabId } from "./Sidebar";

interface TopNavProps {
  activeTab: NavTabId;
  onOpenCommandPalette: () => void;
  onOpenTrackSwitcher: () => void;
  onQuickStartPractice: () => void;
  onSelectTab: (tab: NavTabId) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCommandPalette,
  onOpenTrackSwitcher,
  onQuickStartPractice,
}) => {
  const { profile } = useAuth();
  const { theme, toggleTheme, isPrivacyMode, togglePrivacyMode } = useTheme();
  const { syncing, refreshAllData } = useKarirfyData();

  const firstName = profile.name.split(" ")[0] || "Pembelajar";

  return (
    <header className="floating-dock h-16 px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Dynamic Greeting & Active Target Track */}
      <div className="min-w-0 flex items-center gap-3">
        <div className="lg:hidden">
          <img
            src="/assets/karirfy-logo.png"
            alt="Karirfy"
            className="w-8 h-8 rounded-xl object-cover border border-[var(--glass-border)]"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {getGreeting()}, {isPrivacyMode ? "••••••" : firstName}
          </div>
          <button
            type="button"
            onClick={onOpenTrackSwitcher}
            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 truncate"
          >
            <span>Jalur {profile.careerGoal}</span>
            <span>·</span>
            <span>Target {profile.target_accuracy}%</span>
          </button>
        </div>
      </div>

      {/* Center: Spotlight Search Capsule (Cmd+K) - Strictly Monochrome */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center justify-between gap-3 w-full max-w-[380px] h-10 px-3.5 rounded-full apple-sub-box hover:opacity-95 transition-all text-xs text-[var(--text-tertiary)]"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Cari 38 topik, 47 simulasi CAT, atau Artifact...</span>
        </span>
        <kbd className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--glass-fill-strong)] text-[var(--text-secondary)] border border-[var(--glass-border)] shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Right: Monochrome Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => void refreshAllData()}
          title="Sinkronkan Cloud"
          aria-label="Sinkronkan Cloud"
          className="inner-pseudo-glass w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)]"
        >
          <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
        </button>

        <button
          type="button"
          onClick={togglePrivacyMode}
          title={isPrivacyMode ? "Tampilkan Skor" : "Sembunyikan Skor"}
          aria-label={isPrivacyMode ? "Tampilkan Skor" : "Sembunyikan Skor"}
          className="inner-pseudo-glass w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)]"
        >
          {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          aria-label="Ganti Tema"
          className="inner-pseudo-glass w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)]"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onQuickStartPractice}
          className="h-9 px-3.5 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mulai Sesi</span>
          <Sparkles className="w-3 h-3 sm:hidden" />
        </button>
      </div>
    </header>
  );
};
