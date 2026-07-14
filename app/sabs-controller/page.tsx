"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);
    setError("");
    if (val && idx < 3) refs[idx + 1].current?.focus();
    if (newPin.every((d) => d !== "")) {
      handleSubmit(newPin.join(""));
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
        setShake(true);
        setError("Invalid access token");
        setPin(["", "", "", ""]);
        setTimeout(() => {
          setShake(false);
          refs[0].current?.focus();
        }, 600);
      }
    } catch {
      setError("Connection error. Retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Fake terminal/system look to confuse bots */}
      <div className="w-full max-w-sm">
        {/* Terminal header */}
        <div className="bg-gray-900 rounded-t-xl px-4 py-2 flex items-center gap-2 border border-gray-700">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400 text-xs ml-3 font-mono">
            sys/net/access-token-validator
          </span>
        </div>

        {/* Terminal body */}
        <div className="bg-gray-900 border-x border-gray-700 px-6 py-4">
          <p className="text-green-400 font-mono text-xs mb-1">
            $ initializing secure channel...
          </p>
          <p className="text-green-400 font-mono text-xs mb-1">
            $ verifying network access permissions...
          </p>
          <p className="text-yellow-400 font-mono text-xs mb-3">
            $ awaiting neter-aces-token-code input ▌
          </p>
        </div>

        {/* Main card */}
        <div className="bg-gray-900 rounded-b-xl border border-t-0 border-gray-700 px-6 pb-8 pt-4">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🔐</span>
            </div>
            <h1 className="text-white font-mono text-sm font-bold tracking-widest uppercase">
              NETER-ACES TOKEN
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-mono">
              Enter 4-digit authorization code
            </p>
          </div>

          {/* PIN inputs */}
          <div
            className={`flex justify-center gap-3 mb-6 ${shake ? "animate-[shake_0.5s_ease]" : ""}`}
            style={shake ? {
              animation: "shake 0.5s ease",
            } : {}}
          >
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
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-gray-800 text-white outline-none transition-all font-mono
                  ${digit ? "border-green-500 text-green-400" : "border-gray-600"}
                  ${error ? "border-red-500" : ""}
                  focus:border-green-400 focus:shadow-[0_0_0_3px_rgba(74,222,128,0.15)]`}
                autoComplete="off"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs text-center font-mono mb-4 animate-fade-in">
              ✗ {error} — access denied
            </p>
          )}

          {/* Loading */}
          {loading && (
            <p className="text-green-400 text-xs text-center font-mono animate-pulse">
              $ validating token...
            </p>
          )}

          <p className="text-gray-700 text-[10px] text-center font-mono mt-6 select-none">
            unauthorized access is monitored and logged
          </p>
        </div>

        {/* Bottom fake info */}
        <p className="text-gray-700 text-[9px] text-center mt-3 font-mono select-none">
          sys.net/neter-v2.3.1 | TLS 1.3 | AES-256
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
