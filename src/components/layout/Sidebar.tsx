import React from "react";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Home,
  Layers,
  Mic,
  Settings,
  ShieldCheck,
  Target,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { formatTierBadge } from "../../lib/tierAccess";

export type NavTabId =
  | "dashboard"
  | "roadmap"
  | "exercises"
  | "assessment"
  | "statistics"
  | "mistakes"
  | "cv-studio"
  | "star-studio"
  | "kraepelin"
  | "artifacts"
  | "settings";

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onOpenTrackSwitcher: () => void;
}

interface NavGroup {
  label: string;
  items: {
    id: NavTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenTrackSwitcher,
}) => {
  const { profile, isGuest } = useAuth();
  const { dueMistakeCount } = useKarirfyData();

  const groups: NavGroup[] = [
    {
      label: "Workstation",
      items: [
        { id: "dashboard", label: "Ringkasan", icon: Home },
        { id: "roadmap", label: "Rencana & Agenda", icon: CalendarClock },
        { id: "statistics", label: "Analitik Kesiapan", icon: BarChart3 },
      ],
    },
    {
      label: "Latihan & Ujian",
      items: [
        { id: "exercises", label: "Exercices (39 Topik)", icon: BookOpen },
        { id: "assessment", label: "Simulasi CAT CBT", icon: Clock },
        {
          id: "mistakes",
          label: "Bank Evaluasi SRS",
          icon: Target,
          badge: dueMistakeCount > 0 ? String(dueMistakeCount) : undefined,
        },
      ],
    },
    {
      label: "Karier & Lab",
      items: [
        { id: "cv-studio", label: "Studio CV ATS", icon: FileText },
        { id: "star-studio", label: "Interview STAR", icon: Mic },
        { id: "kraepelin", label: "Lab Kraepelin", icon: Activity },
      ],
    },
    {
      label: "Pustaka",
      items: [{ id: "artifacts", label: "Pustaka Artifact", icon: Layers }],
    },
  ];

  const tierLabel = formatTierBadge(
    profile.tier,
    profile.is_premium,
    profile.premium_expiry_date,
    isGuest,
  );

  return (
    <aside className="hidden lg:flex flex-col w-[264px] shrink-0 floating-slab p-4 justify-between h-full overflow-hidden">
      {/* Brand Header */}
      <div className="space-y-4 overflow-y-auto no-scrollbar pr-0.5">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/karirfy-logo.png"
              alt="Karirfy"
              className="w-8 h-8 rounded-xl object-cover border border-[var(--glass-border)]"
            />
            <div>
              <div className="text-sm font-bold tracking-tight text-[var(--text-primary)] leading-none">
                Karirfy
              </div>
              <div className="text-[10px] font-medium text-[var(--text-tertiary)] mt-1">
                Web Workstation
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full apple-sub-box text-[10px] font-semibold text-[var(--text-tertiary)]">
            OS 2.0
          </span>
        </div>

        {/* Grouped Navigation (Strictly Monochrome Liquid Glass Hover & Active Pill) */}
        <nav className="space-y-4 pt-1" aria-label="Menu Workstation">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={active ? "true" : "false"}
                      onClick={() => onSelectTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-2xl text-[13px] transition-all border border-transparent",
                        active
                          ? "nav-active-item bg-white/15 border-white/20 text-[var(--text-primary)] font-bold shadow-sm"
                          : "font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)] text-[var(--accent-ink)]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Settings + Account & Career Track Control Capsule (Accrual 1:1) */}
      <div className="pt-3 mt-2 border-t border-[var(--glass-border)] space-y-2">
        <button
          type="button"
          data-active={activeTab === "settings" ? "true" : "false"}
          onClick={() => onSelectTab("settings")}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[13px] transition-all border border-transparent",
            activeTab === "settings"
              ? "nav-active-item bg-white/15 border-white/20 text-[var(--text-primary)] font-bold"
              : "font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06]",
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan &amp; QR Sync</span>
        </button>

        <button
          type="button"
          onClick={onOpenTrackSwitcher}
          className="w-full apple-card p-3 flex items-center justify-between gap-2.5 text-left group hover:opacity-95"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full apple-sub-box flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shrink-0 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                {profile.name}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate flex items-center gap-1">
                <FolderKanban className="w-2.5 h-2.5 shrink-0" />
                <span>Jalur {profile.careerGoal}</span>
              </div>
              <div className="text-[9px] text-[var(--text-tertiary)] truncate mt-0.5 flex items-center gap-1">
                {profile.is_premium ? (
                  <Award className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>{tierLabel}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
    </aside>
  );
};
