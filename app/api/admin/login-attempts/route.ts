import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdmin();

  // Last 100 attempts, most recent first
  const { data, error } = await supabase
    .from("admin_login_attempts")
    .select("*")
    .order("attempted_at", { ascending: false })
    .limit(100);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const attempts = data || [];

  // Stats
  const totalAttempts  = attempts.length;
  const successCount   = attempts.filter((a) => a.success).length;
  const failCount      = attempts.filter((a) => !a.success).length;

  // Unique IPs that had failures
  const suspiciousIPs: Record<string, { count: number; lastSeen: string; userAgent: string }> = {};
  attempts
    .filter((a) => !a.success)
    .forEach((a) => {
      if (!suspiciousIPs[a.ip_address]) {
        suspiciousIPs[a.ip_address] = { count: 0, lastSeen: a.attempted_at, userAgent: a.user_agent };
      }
      suspiciousIPs[a.ip_address].count++;
    });

  const suspiciousList = Object.entries(suspiciousIPs)
    .map(([ip, d]) => ({ ip, ...d }))
    .sort((a, b) => b.count - a.count);

  // Your own IPs (successful logins) — unique IPs
  const myIPs: Record<string, { count: number; lastSeen: string }> = {};
  attempts
    .filter((a) => a.success)
    .forEach((a) => {
      if (!myIPs[a.ip_address]) {
        myIPs[a.ip_address] = { count: 0, lastSeen: a.attempted_at };
      }
      myIPs[a.ip_address].count++;
      // Keep the most recent
      if (a.attempted_at > myIPs[a.ip_address].lastSeen) {
        myIPs[a.ip_address].lastSeen = a.attempted_at;
      }
    });

  const myIPList = Object.entries(myIPs)
    .map(([ip, d]) => ({ ip, ...d }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    attempts,
    stats: { totalAttempts, successCount, failCount },
    suspiciousList,
    myIPList,
  });
}
