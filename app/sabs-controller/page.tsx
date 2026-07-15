"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  useEffect(() => {
    ref0.current?.focus();
  }, []);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);
    setError("");
    if (val && idx < 5) refs[idx + 1].current?.focus();
    if (newPin.every((d) => d !== "")) {
      handleSubmit(newPin[0] + newPin[1] + newPin[2] + newPin[3]);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/sabs-controller/dashboard");
      } else {
        setAttempts((a) => a + 1);
        setShake(true);
        setError(
          attempts >= 2
            ? "Access restricted. Multiple failed attempts detected."
            : "Authorization failed. Token rejected."
        );
        setPin(["", "", "", "", "", ""]);
        setTimeout(() => {
          setShake(false);
          ref0.current?.focus();
        }, 700);
      }
    } catch {
      setError("Network error. Retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── BACKGROUND: slider image blurred ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png"
          alt=""
          fill
          className="object-cover object-center"
          quality={60}
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(20,0,8,0.72)" }} />
        {/* Blur layer */}
        <div className="absolute inset-0" style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }} />
      </div>

      {/* ── FLOATING DECORATIVE ORBS ── */}
      <div className="absolute top-[-100px] left-[-80px] w-80 h-80 rounded-full opacity-30 z-0"
        style={{ background: "radial-gradient(circle, #C41E3A 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-[-80px] right-[-60px] w-72 h-72 rounded-full opacity-25 z-0"
        style={{ background: "radial-gradient(circle, #8B0000 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-20 z-0"
        style={{ background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)", filter: "blur(30px)" }} />

      {/* ── GLASSMORPHISM CARD ── */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.07)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,30,58,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          animation: shake ? "shake 0.6s ease" : "none",
        }}
      >
        {/* Top shimmer line */}
        <div className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, #C41E3A 30%, #FFB6C1 50%, #C41E3A 70%, transparent 100%)" }} />

        <div className="px-10 pt-10 pb-8">

          {/* ── LOGO ── */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 mb-4">
              {/* Glow ring behind logo */}
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(196,30,58,0.5) 0%, transparent 70%)",
                  filter: "blur(12px)",
                  transform: "scale(1.3)",
                }} />
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784124668/ChatGPT_Image_Jul_12_2026_03_34_27_PM_lmn4xh.png"
                alt="Shree Ambika Beauty Shop"
                fill
                className="object-contain relative z-10 drop-shadow-lg"
              />
            </div>

            <h1 className="text-white font-bold text-xl tracking-wide font-serif">
              श्री अम्बिका
            </h1>
            <p className="text-xs tracking-[0.5em] uppercase mt-0.5"
              style={{ color: "rgba(255,182,193,0.65)" }}>
              Beauty Shop
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-5 w-full">
              <div className="flex-1 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15))" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-medium"
                style={{ color: "rgba(255,182,193,0.4)" }}>
                Secure Access
              </span>
              <div className="flex-1 h-px"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
            </div>
          </div>

          {/* ── PIN INPUTS ── */}
          <div className="flex justify-center gap-2.5 mb-2">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={refs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoComplete="off"
                aria-label="Access code"
                className="w-11 h-13 text-center text-lg font-bold rounded-xl outline-none transition-all duration-200"
                style={{
                  height: "52px",
                  background: digit
                    ? "rgba(139,0,0,0.5)"
                    : "rgba(255,255,255,0.08)",
                  border: error
                    ? "1.5px solid rgba(239,68,68,0.7)"
                    : digit
                    ? "1.5px solid rgba(196,30,58,0.9)"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                  boxShadow: digit
                    ? "0 0 16px rgba(139,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>

          {/* Error / Loading message */}
          <div className="h-7 flex items-center justify-center mb-5">
            {error && (
              <p className="text-xs text-center animate-fade-in"
                style={{ color: "rgba(255,120,120,0.95)" }}>
                ✗ {error}
              </p>
            )}
            {loading && !error && (
              <p className="text-xs text-center animate-pulse"
                style={{ color: "rgba(255,182,193,0.7)" }}>
                Verifying access...
              </p>
            )}
          </div>

          {/* ── AUTHORIZE BUTTON ── */}
          <button
            onClick={() => {
              if (pin.filter((d) => d !== "").length >= 4) {
                handleSubmit(pin[0] + pin[1] + pin[2] + pin[3]);
              }
            }}
            disabled={loading || pin.filter((d) => d !== "").length < 4}
            className="w-full py-3.5 rounded-xl font-semibold text-sm uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #8B0000 100%)",
              backgroundSize: "200% 100%",
              color: "#fff",
              border: "1px solid rgba(196,30,58,0.5)",
              boxShadow: "0 4px 20px rgba(139,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {loading ? "Verifying..." : "Authorize →"}
          </button>

          <p className="text-center text-[10px] mt-5"
            style={{ color: "rgba(255,255,255,0.13)" }}>
            Unauthorized access is monitored and logged
          </p>
        </div>

        {/* Bottom shimmer line */}
        <div className="h-[1px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(196,30,58,0.4), transparent)" }} />
      </div>

      {/* Bottom fake system text */}
      <p className="absolute bottom-5 text-center w-full text-[10px] z-10"
        style={{ color: "rgba(255,255,255,0.08)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
        sabs-net/v3.1.2 · TLS 1.3 · AES-256-GCM
      </p>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-8px); }
          60% { transform: translateX(8px); }
          75% { transform: translateX(-5px); }
          90% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
