import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getDb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const getAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getDb();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count async
  getAdmin()
    .from("blog_posts")
    .update({ views: (data.views || 0) + 1 })
    .eq("slug", params.slug)
    .then(() => {});

  return NextResponse.json({ data });
}
