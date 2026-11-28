import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Moon,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  KARIRFY_APP_STORE_URL,
  resendEmailSignupOtp,
  sendPasswordReset,
  signInWithAppleWeb,
  signInWithEmailPassword,
  signInWithGoogleWeb,
  supabase,
  verifyEmailSignupOtp,
  signUpWithEmailPassword,
} from "../../lib/supabase";
import {
  createWebLoginQrPayload,
  decryptSessionTokensFromQr,
  isWebDashboardQrExpired,
  QR_SESSION_TTL_SECONDS,
  type EncryptedQrSessionEnvelope,
  type KarirfyWebQrPayload,
} from "../../lib/webAuthSync";
import { cn } from "../../lib/utils";

type LoginTab = "qr" | "form";
type FormMode = "signin" | "signup" | "otp" | "reset";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest, applyQrSessionTokens, enterGuestMode } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<LoginTab>("qr");
  const [formMode, setFormMode] = useState<FormMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const [qrPayload, setQrPayload] = useState<KarirfyWebQrPayload>(() =>
    createWebLoginQrPayload(typeof window !== "undefined" ? window.location.origin : ""),
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(QR_SESSION_TTL_SECONDS);
  const [qrState, setQrState] = useState<"waiting" | "authorizing" | "connected" | "expired">("waiting");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (user || isGuest) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isGuest, navigate]);

  const regenerateQr = () => {
    const next = createWebLoginQrPayload(window.location.origin);
    setQrPayload(next);
    setSecondsLeft(QR_SESSION_TTL_SECONDS);
    setQrState("waiting");
    setFeedback(null);
  };

  useEffect(() => {
    if (tab !== "qr" || qrState === "connected") return;
    const interval = window.setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - qrPayload.createdAt) / 1000);
      const remaining = Math.max(0, QR_SESSION_TTL_SECONDS - elapsedSec);
      setSecondsLeft(remaining);
      if (remaining <= 0 || isWebDashboardQrExpired(qrPayload)) {
        setQrState("expired");
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [tab, qrPayload, qrState]);

  useEffect(() => {
    if (tab !== "qr") return;
    const activePayload = qrPayload;
    const channel = supabase.channel(activePayload.channel, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on("broadcast", { event: "session-granted" }, async ({ payload }) => {
      if (isWebDashboardQrExpired(activePayload)) {
        setQrState("expired");
        return;
      }
      const envelope = payload as Partial<EncryptedQrSessionEnvelope> | undefined;
      if (!envelope?.ciphertext || !envelope?.iv) {
        setFeedback({ kind: "error", text: "Paket otorisasi QR tidak valid." });
        return;
      }
      try {
        setQrState("authorizing");
        setFeedback(null);
        const tokens = await decryptSessionTokensFromQr(
          envelope.ciphertext,
          envelope.iv,
          activePayload.encKey,
        );
        await applyQrSessionTokens(tokens);
        await channel.send({
          type: "broadcast",
          event: "session-confirmed",
          payload: {
            sessionId: activePayload.sessionId,
            confirmedAt: Date.now(),
            userAgent: navigator.userAgent.slice(0, 80),
          },
        });
        setQrState("connected");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setQrState("waiting");
        setFeedback({
          kind: "error",
          text:
            err instanceof Error
              ? err.message
              : "Gagal menyambungkan sesi QR. Muat ulang kode QR dan coba lagi.",
        });
      }
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [tab, qrPayload, applyQrSessionTokens, navigate]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      if (formMode === "signin") {
        await signInWithEmailPassword(email, password);
        navigate("/dashboard", { replace: true });
      } else if (formMode === "signup") {
        const res = await signUpWithEmailPassword(email, password, fullName);
        if (res.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setFormMode("otp");
          setFeedback({
            kind: "info",
            text: "Kode verifikasi telah dikirim ke email Anda. Masukkan kode OTP di bawah ini.",
          });
        }
      } else if (formMode === "otp") {
        await verifyEmailSignupOtp(email, otpToken);
        navigate("/dashboard", { replace: true });
      } else {
        await sendPasswordReset(email);
        setFeedback({
          kind: "info",
          text: "Tautan atur ulang kata sandi telah dikirim ke email Anda.",
        });
      }
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Autentikasi gagal. Periksa kembali data Anda.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="spatial-canvas min-h-screen w-full flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[1260px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT HERO SHOWCASE (Accrual 7/12 Monochrome Liquid Glass) */}
        <section className="lg:col-span-7 floating-slab p-7 lg:p-10 flex flex-col justify-between min-h-[540px]">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/assets/karirfy-logo.png"
                alt="Karirfy"
                className="w-9 h-9 rounded-2xl object-cover border border-[var(--glass-border)]"
              />
              <div>
                <div className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  Karirfy Workstation
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  Dewantara Project · Web &amp; iOS Continuity
                </div>
              </div>
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              className="inner-pseudo-glass px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
              aria-label="Ubah tema"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>
            </button>
          </div>

          <div className="my-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full apple-sub-box text-[11px] font-semibold text-[var(--text-secondary)]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tautan Langsung iPhone &amp; iPad via QR Terenkripsi</span>
            </div>

            <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight leading-[1.08] text-[var(--text-primary)]">
              Satu ruang kerja desktop untuk seluruh latihan dan target{" "}
              <span className="font-serif italic font-normal text-[var(--text-secondary)]">
                seleksi karier Anda.
              </span>
            </h1>

            <p className="text-sm lg:text-base text-[var(--text-tertiary)] max-w-xl leading-relaxed">
              Pindai kode QR dari aplikasi Karirfy di iPhone atau iPad untuk masuk tanpa mengetik kata
              sandi. Riwayat simulasi CAT, Bank Evaluasi SRS, Rencana CPNS 2026, dan draf CV Studio
              langsung tersinkron real-time.
            </p>

            {/* Monochrome feature bento tiles matching Accrual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="apple-card p-4">
                <ShieldCheck className="w-4 h-4 text-[var(--text-secondary)] mb-2" />
                <div className="text-xs font-bold text-[var(--text-primary)]">AES-GCM 256-bit</div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Kunci sesi epemeral 120 detik hanya hidup di peramban ini.
                </p>
              </div>
              <div className="apple-card p-4">
                <Sparkles className="w-4 h-4 text-[var(--text-secondary)] mb-2" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Kalkulator CPNS 2026</div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Simulasi skoring 40% SKD + 60% SKB dan 8 domain lengkap.
                </p>
              </div>
              <div className="apple-card p-4">
                <CheckCircle2 className="w-4 h-4 text-[var(--text-secondary)] mb-2" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Split-View Desktop</div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  CV Studio ATS, Lab Kraepelin keyboard numpad, &amp; Bank Evaluasi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--glass-border)] text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-4">
              <a href="/" className="hover:text-[var(--text-primary)] transition-colors">
                Beranda Karirfy
              </a>
              <a href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                Privasi
              </a>
              <a href="/support" className="hover:text-[var(--text-primary)] transition-colors">
                Dukungan
              </a>
            </div>
            <a
              href={KARIRFY_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Unduh Karirfy iOS / iPadOS ↗
            </a>
          </div>
        </section>

        {/* RIGHT AUTH PANEL (Accrual 5/12 Glass Card) */}
        <section className="lg:col-span-5 floating-slab p-6 lg:p-8 flex flex-col justify-between">
          <div>
            {/* Segmented Mode Switcher (Monochrome Accrual Pill) */}
            <div className="apple-segmented-track w-full grid grid-cols-2 mb-6">
              <button
                type="button"
                onClick={() => setTab("qr")}
                className={cn(
                  "apple-segmented-btn py-2 flex items-center justify-center gap-2 text-xs",
                  tab === "qr" && "apple-segmented-btn-active",
                )}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pindai via Aplikasi</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("form")}
                className={cn(
                  "apple-segmented-btn py-2 flex items-center justify-center gap-2 text-xs",
                  tab === "form" && "apple-segmented-btn-active",
                )}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Email &amp; Akun</span>
              </button>
            </div>

            {feedback && (
              <div
                role="alert"
                className={cn(
                  "mb-4 rounded-2xl px-4 py-3 text-xs border",
                  feedback.kind === "error"
                    ? "bg-red-500/10 border-red-500/25 text-red-400"
                    : "apple-sub-box text-[var(--text-secondary)]",
                )}
              >
                {feedback.text}
              </div>
            )}

            {tab === "qr" ? (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Tautkan Perangkat iOS / iPadOS
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs">
                  Buka aplikasi Karirfy → tab <strong>Profil</strong> → ketuk{" "}
                  <strong>Tautkan Web Dashboard</strong> dan arahkan kamera ke kode ini.
                </p>

                <div className="relative my-6 p-4 rounded-[26px] bg-white shadow-xl border border-black/10">
                  <QRCodeSVG
                    value={JSON.stringify(qrPayload)}
                    size={212}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#09090b"
                  />
                  {(qrState === "expired" || qrState === "authorizing") && (
                    <div className="absolute inset-0 rounded-[26px] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white">
                      {qrState === "expired" ? (
                        <>
                          <p className="text-xs font-semibold mb-2">Kode QR kedaluwarsa</p>
                          <button
                            type="button"
                            onClick={regenerateQr}
                            className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Buat Kode Baru
                          </button>
                        </>
                      ) : (
                        <p className="text-xs font-semibold animate-pulse">
                          Menyinkronkan sesi akun...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full apple-sub-box px-4 py-3 flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {qrState === "waiting"
                        ? `Berlaku ${secondsLeft} detik`
                        : qrState === "authorizing"
                          ? "Mengotorisasi..."
                          : "Sesi selesai"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={regenerateQr}
                    className="font-semibold text-[var(--text-primary)] hover:opacity-80 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Muat Ulang
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {formMode === "signin"
                      ? "Masuk ke Workstation"
                      : formMode === "signup"
                        ? "Daftar Akun Karirfy"
                        : formMode === "otp"
                          ? "Verifikasi Kode OTP"
                          : "Atur Ulang Kata Sandi"}
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setFormMode(formMode === "signin" ? "signup" : "signin")
                    }
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {formMode === "signin" ? "Buat Akun" : "Sudah punya akun?"}
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {formMode === "signup" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama panggilan Anda"
                        className="w-full px-3.5 py-2.5 rounded-xl apple-sub-box text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--text-tertiary)]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl apple-sub-box text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--text-tertiary)]"
                      />
                    </div>
                  </div>

                  {(formMode === "signin" || formMode === "signup") && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-[var(--text-tertiary)]">
                          Kata Sandi
                        </label>
                        {formMode === "signin" && (
                          <button
                            type="button"
                            onClick={() => setFormMode("reset")}
                            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          >
                            Lupa sandi?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3.5 py-2.5 rounded-xl apple-sub-box text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--text-tertiary)]"
                      />
                    </div>
                  )}

                  {formMode === "otp" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                        Kode OTP Email (6 digit)
                      </label>
                      <input
                        type="text"
                        required
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        placeholder="123456"
                        className="w-full px-3.5 py-2.5 rounded-xl apple-sub-box text-sm tracking-widest font-mono text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => void resendEmailSignupOtp(email)}
                        className="mt-1.5 text-[11px] font-semibold text-[var(--text-secondary)] hover:underline"
                      >
                        Kirim ulang kode OTP
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span>
                      {busy
                        ? "Memproses..."
                        : formMode === "signin"
                          ? "Masuk Sekarang"
                          : formMode === "signup"
                            ? "Daftar Akun"
                            : formMode === "otp"
                              ? "Verifikasi OTP"
                              : "Kirim Tautan Reset"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                  <div className="h-px flex-1 bg-[var(--glass-border)]" />
                  <span>atau lanjutkan dengan</span>
                  <div className="h-px flex-1 bg-[var(--glass-border)]" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => void signInWithGoogleWeb()}
                    className="inner-pseudo-glass py-2.5 px-3 rounded-xl text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2"
                  >
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void signInWithAppleWeb()}
                    className="inner-pseudo-glass py-2.5 px-3 rounded-xl text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2"
                  >
                    <span>Apple</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Guest Preview Option */}
          <div className="pt-4 mt-4 border-t border-[var(--glass-border)]">
            <button
              type="button"
              onClick={() => {
                enterGuestMode("CPNS");
                navigate("/dashboard", { replace: true });
              }}
              className="w-full inner-pseudo-glass py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5" />
                Pratinjau Workstation (Mode Tamu)
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
