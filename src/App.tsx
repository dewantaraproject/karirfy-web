import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { KarirfyDataProvider } from "./contexts/KarirfyDataContext";
import { LoginPage } from "./components/auth/LoginPage";
import { WebShell } from "./components/layout/WebShell";

const ProtectedWorkstation: React.FC = () => {
  const { authReady, user, isGuest } = useAuth();
  if (!authReady) {
    return (
      <div className="spatial-canvas h-screen w-full flex items-center justify-center">
        <div className="apple-card px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">
          Menyiapkan Karirfy Workstation...
        </div>
      </div>
    );
  }
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  return <WebShell />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <KarirfyDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/*" element={<ProtectedWorkstation />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </KarirfyDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
