import React, { Suspense, useEffect, useState } from "react";
import { BookOpen, CalendarClock, Clock, FileText, Home } from "lucide-react";
import { Sidebar, type NavTabId } from "./Sidebar";
import { TopNav } from "./TopNav";
import { CommandPaletteModal } from "./CommandPaletteModal";
import { TrackSwitcherModal } from "./TrackSwitcherModal";
import { useKarirfyData } from "../../contexts/KarirfyDataContext";
import { ASSESSMENT_CATEGORIES, EXERCISE_DOMAINS } from "../../data/curriculum";
import type { QuizSessionConfig } from "../../types";

const DashboardView = React.lazy(() =>
  import("../dashboard/DashboardView").then((m) => ({ default: m.DashboardView })),
);
const PreparationWorkstationView = React.lazy(() =>
  import("../roadmap/PreparationWorkstationView").then((m) => ({
    default: m.PreparationWorkstationView,
  })),
);
const ExercisesView = React.lazy(() =>
  import("../exercises/ExercisesView").then((m) => ({ default: m.ExercisesView })),
);
const AssessmentView = React.lazy(() =>
  import("../assessment/AssessmentView").then((m) => ({ default: m.AssessmentView })),
);
const StatisticsWorkstationView = React.lazy(() =>
  import("../statistics/StatisticsWorkstationView").then((m) => ({
    default: m.StatisticsWorkstationView,
  })),
);
const MistakeBankView = React.lazy(() =>
  import("../mistakes/MistakeBankView").then((m) => ({ default: m.MistakeBankView })),
);
const CvStudioWorkstationView = React.lazy(() =>
  import("../career/CvStudioWorkstationView").then((m) => ({
    default: m.CvStudioWorkstationView,
  })),
);
const StarStudioView = React.lazy(() =>
  import("../career/StarStudioView").then((m) => ({ default: m.StarStudioView })),
);
const KraepelinLabView = React.lazy(() =>
  import("../career/KraepelinLabView").then((m) => ({ default: m.KraepelinLabView })),
);
const ArtifactsLibraryView = React.lazy(() =>
  import("../artifacts/ArtifactsLibraryView").then((m) => ({
    default: m.ArtifactsLibraryView,
  })),
);
const SettingsView = React.lazy(() =>
  import("../settings/SettingsView").then((m) => ({ default: m.SettingsView })),
);
const WebQuizRunner = React.lazy(() =>
  import("../quiz/WebQuizRunner").then((m) => ({ default: m.WebQuizRunner })),
);
const WebQuizResults = React.lazy(() =>
  import("../quiz/WebQuizResults").then((m) => ({ default: m.WebQuizResults })),
);

const LazyFallback = (
  <div className="floating-slab flex-1 flex items-center justify-center p-10">
    <p className="text-xs font-semibold text-[var(--text-tertiary)] animate-pulse">
      Memuat modul workstation...
    </p>
  </div>
);

export const WebShell: React.FC = () => {
  const { activeQuiz, lastQuizResult, startQuizSession } = useKarirfyData();
  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setActiveTab("dashboard");
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setActiveTab("exercises");
      } else if (e.key === "Escape") {
        setCommandOpen(false);
        setTrackModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const launchExerciseByType = (topicType: string) => {
    for (const dom of EXERCISE_DOMAINS) {
      const topic = dom.topics.find((t) => t.type.toLowerCase() === topicType.toLowerCase());
      if (topic) {
        const cfg: QuizSessionConfig = {
          category: topic.type,
          title: topic.title,
          totalQuestions: topic.defaultQuestions,
          timeLimit: topic.defaultMinutes,
          source: "exercise",
        };
        startQuizSession(cfg);
        return;
      }
    }
    setActiveTab("exercises");
  };

  const launchAssessmentByType = (batteryType: string) => {
    for (const cat of ASSESSMENT_CATEGORIES) {
      const battery = cat.batteries.find((b) => b.type.toLowerCase() === batteryType.toLowerCase());
      if (battery) {
        const cfg: QuizSessionConfig = {
          category: battery.type,
          title: battery.title,
          totalQuestions: battery.defaultQuestions,
          timeLimit: battery.defaultMinutes,
          source: "assessment",
          assessmentCategories: battery.exerciseCategories,
          categoryQuotas: battery.categoryQuotas,
        };
        startQuizSession(cfg);
        return;
      }
    }
    setActiveTab("assessment");
  };

  return (
    <div className="spatial-canvas h-screen w-full p-3 lg:p-4 flex gap-3.5 overflow-hidden">
      {/* Left Floating Monochrome Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTrackSwitcher={() => setTrackModalOpen(true)}
      />

      {/* Right Workspace Column */}
      <div className="flex-1 flex flex-col gap-3.5 min-w-0 h-full overflow-hidden">
        <TopNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenTrackSwitcher={() => setTrackModalOpen(true)}
          onQuickStartPractice={() => setActiveTab("exercises")}
        />

        <main className="flex-1 min-h-0 flex gap-3.5 overflow-hidden pb-14 lg:pb-0">
          <Suspense fallback={LazyFallback}>
            {activeQuiz ? (
              <WebQuizRunner />
            ) : lastQuizResult ? (
              <WebQuizResults />
            ) : activeTab === "dashboard" ? (
              <DashboardView
                onNavigateTab={setActiveTab}
                onLaunchExercise={launchExerciseByType}
                onLaunchAssessment={launchAssessmentByType}
              />
            ) : (
              <div className="floating-slab flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0 slab-scroll scroll-gpu-layer p-5 lg:p-6">
                  {activeTab === "roadmap" && (
                    <PreparationWorkstationView
                      onLaunchExercise={launchExerciseByType}
                      onLaunchAssessment={launchAssessmentByType}
                    />
                  )}
                  {activeTab === "exercises" && <ExercisesView />}
                  {activeTab === "assessment" && <AssessmentView />}
                  {activeTab === "statistics" && <StatisticsWorkstationView />}
                  {activeTab === "mistakes" && <MistakeBankView />}
                  {activeTab === "cv-studio" && <CvStudioWorkstationView />}
                  {activeTab === "star-studio" && <StarStudioView />}
                  {activeTab === "kraepelin" && <KraepelinLabView />}
                  {activeTab === "artifacts" && <ArtifactsLibraryView />}
                  {activeTab === "settings" && <SettingsView />}
                </div>
              </div>
            )}
          </Suspense>
        </main>
      </div>

      {/* Mobile Floating Dock Navigation (Accrual style) */}
      <nav
        aria-label="Navigasi Mobile"
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 floating-dock px-3 py-2 flex items-center justify-around"
      >
        {[
          { id: "dashboard" as const, label: "Beranda", icon: Home },
          { id: "roadmap" as const, label: "Rencana", icon: CalendarClock },
          { id: "exercises" as const, label: "Exercices", icon: BookOpen },
          { id: "assessment" as const, label: "CAT CBT", icon: Clock },
          { id: "cv-studio" as const, label: "CV ATS", icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-all ${
                isActive ? "dynamic-island-tab-active" : "text-[var(--text-tertiary)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {isActive && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <CommandPaletteModal
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigateTab={setActiveTab}
        onLaunchExercise={launchExerciseByType}
        onLaunchAssessment={launchAssessmentByType}
      />

      <TrackSwitcherModal
        open={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
    </div>
  );
};
