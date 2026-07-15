"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  // All 6 refs declared at top level — no loops
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
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0008 0%, #2d0015 40%, #1a0008 100%)",
      }}
    >
      {/* Decorative blurred circles */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "#8B0000" }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "#C41E3A" }} />
      <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: "#FFB6C1" }} />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          animation: shake ? "shake 0.6s ease" : "none",
        }}
      >
        {/* Top brand strip */}
        <div className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #8B0000, #C41E3A, #FFB6C1, #C41E3A, #8B0000)" }} />

        <div className="px-10 py-12">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #8B0000, #C41E3A)" }}
            >
              <span className="text-white font-bold text-2xl font-serif">SA</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-widest uppercase font-serif">
              श्री अम्बिका
            </h1>
            <p className="text-xs tracking-[0.4em] uppercase mt-1"
              style={{ color: "rgba(255,182,193,0.6)" }}>
              Beauty Shop
            </p>
            <div className="flex items-center gap-3 mt-6 w-full">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs tracking-widest uppercase"
                style={{ color: "rgba(255,182,193,0.4)" }}>
                Secure Access
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
          </div>

          {/* PIN inputs — 6 boxes, no digit hint */}
          <div className="flex justify-center gap-3 mb-3">
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
                className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200"
                style={{
                  background: digit ? "rgba(139,0,0,0.4)" : "rgba(255,255,255,0.06)",
                  border: error
                    ? "1.5px solid rgba(239,68,68,0.6)"
                    : digit
                    ? "1.5px solid rgba(196,30,58,0.8)"
                    : "1.5px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  boxShadow: digit ? "0 0 12px rgba(139,0,0,0.3)" : "none",
                }}
              />
            ))}
          </div>

          {/* Error / Loading */}
          <div className="h-8 flex items-center justify-center mb-4">
            {error && (
              <p className="text-xs text-center" style={{ color: "rgba(255,100,100,0.9)" }}>
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

          {/* Submit */}
          <button
            onClick={() => {
              const filled = pin.filter((d) => d !== "").length;
              if (filled >= 4) handleSubmit(pin[0] + pin[1] + pin[2] + pin[3]);
            }}
            disabled={loading || pin.filter((d) => d !== "").length < 4}
            className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #8B0000, #C41E3A)",
              color: "#fff",
              letterSpacing: "0.15em",
            }}
          >
            {loading ? "Verifying..." : "Authorize →"}
          </button>

          <p className="text-center text-xs mt-6"
            style={{ color: "rgba(255,255,255,0.12)" }}>
            Unauthorized access is monitored and logged
          </p>
        </div>

        {/* Bottom strip */}
        <div className="h-0.5 w-full"
          style={{ background: "linear-gradient(90deg, transparent, #C41E3A, transparent)" }} />
      </div>

      <p className="absolute bottom-4 text-center w-full text-xs"
        style={{ color: "rgba(255,255,255,0.07)", fontFamily: "monospace" }}>
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
