"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { FiSearch, FiMic, FiMicOff, FiUpload, FiX, FiFilter, FiChevronDown, FiGrid, FiList, FiShuffle } from "react-icons/fi";
import { useWhatsAppOrder } from "@/app/hooks/useWhatsAppOrder";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
  featured: boolean; trending: boolean; tags?: string[]; description?: string;
}

const CONCERN_KEYWORDS: Record<string, string[]> = {
  "hair-fall":   ["hair fall","hair loss","hairfall","anti hair","onion","bhringraj","minoxidil"],
  "dry-skin":    ["dry skin","moisture","hydrat","dry","nourish","repair"],
  "dark-spots":  ["dark spot","pigment","brightening","vitamin c","niacinamide","kojic"],
  "oily-skin":   ["oily","mattif","pore","sebum","oil control","clay"],
  "anti-ageing": ["anti-ageing","anti aging","wrinkle","retinol","collagen","firming"],
  "frizzy-hair": ["frizz","smooth","keratin","argan","straighten","anti frizz"],
};

const CATEGORIES = ["All","Makeup","Skin Care","Hair Care","Cosmetics","Body Care","Perfumes","Electronics","Purses & Bags","Wax & Accessories"];
const SORT_OPTIONS = [
  { value:"newest",    label:"Newest First" },
  { value:"price_asc", label:"Price: Low to High" },
  { value:"price_desc",label:"Price: High to Low" },
  { value:"discount",  label:"Best Discount" },
  { value:"trending",  label:"Trending First" },
];

function ProductCard({ p, view, onOrder }: { p: Product; view: "grid"|"list"; onOrder: (p: Product) => void }) {
  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 p-3">
        <Link href={`/products/${p.slug || p.id}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-light">
            {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-brand-primary uppercase">{p.brand}</p>
          <Link href={`/products/${p.slug || p.id}`}><h3 className="text-sm font-semibold text-gray-800 line-clamp-1 hover:text-brand-primary">{p.name}</h3></Link>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="font-bold text-gray-900">₹{p.price}</span>
            {p.mrp > p.price && <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>}
            {p.discount > 0 && <span className="text-xs text-green-600 font-bold">{p.discount}% OFF</span>}
          </div>
        </div>
        <button onClick={() => onOrder(p)} className="flex-shrink-0 self-center bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1">
          <FaWhatsapp size={12} /> Order
        </button>
      </div>
    );
  }
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      <Link href={`/products/${p.slug || p.id}`} className="relative aspect-square bg-brand-light overflow-hidden block">
        {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>}
        {p.trending && <span className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 Trending</span>}
        {p.featured && <span className="absolute top-2 right-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>}
        {p.discount > 0 && <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.discount}% OFF</span>}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mb-0.5">{p.brand}</p>
        <Link href={`/products/${p.slug || p.id}`}><h3 className="text-xs font-semibold text-gray-800 leading-tight mb-1.5 line-clamp-2 hover:text-brand-primary">{p.name}</h3></Link>
        <div className="flex items-center gap-1 mb-1.5"><FaStar size={10} className="text-yellow-400" /><span className="text-[10px] text-gray-400">{p.rating || "4.2"}</span></div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="font-bold text-gray-900 text-sm">₹{p.price}</span>
          {p.mrp > p.price && <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>}
        </div>
        <button onClick={() => onOrder(p)} className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold py-2 rounded-xl transition-colors">
          <FaWhatsapp size={11} /> Order on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openWhatsApp } = useWhatsAppOrder();

  const [query, setQuery]             = useState(searchParams.get("search") || "");
  const [category, setCategory]       = useState(searchParams.get("category") || "All");
  const [concern, setConcern]         = useState(searchParams.get("concern") || "");
  const [sort, setSort]               = useState("newest");
  const [filter, setFilter]           = useState(searchParams.get("filter") || "");
  const [priceMax, setPriceMax]       = useState(5000);
  const [view, setView]               = useState<"grid"|"list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [listening, setListening]     = useState(false);
  const [voiceSupport, setVoiceSupport] = useState(false);
  const [imgSearching, setImgSearching] = useState(false);
  const [imgResult, setImgResult]     = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const imgInputRef    = useRef<HTMLInputElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const handleOrder = useCallback((p: Product) => {
    openWhatsApp({ productId: p.id, productName: p.name, productBrand: p.brand, productPrice: p.price, source: "search_page" });
  }, [openWhatsApp]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) setVoiceSupport(true);
  }, []);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "trending") setFilter("trending");
    if (f === "featured") setFilter("featured");
    const c = searchParams.get("concern"); if (c) setConcern(c);
    const s = searchParams.get("search");  if (s) setQuery(s);
    const cat = searchParams.get("category"); if (cat) setCategory(cat);
  }, [searchParams]);

  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = "en-IN"; rec.continuous = false; rec.interimResults = true;
    rec.onstart = () => setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(""); setQuery(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopVoice = useCallback(() => { recognitionRef.current?.stop(); setListening(false); }, []);

  const handleImageSearch = async (file: File) => {
    setImgSearching(true); setImgResult("Analyzing image...");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/search-by-image", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }) });
        const json = await res.json();
        if (json.query) { setQuery(json.query); setImgResult(`Found: "${json.query}"`); inputRef.current?.focus(); }
        else setImgResult("Could not identify. Try another image.");
        setImgSearching(false);
      };
      reader.readAsDataURL(file);
    } catch { setImgResult("Image search failed."); setImgSearching(false); }
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (filter === "trending") list = list.filter(p => p.trending);
    if (filter === "featured") list = list.filter(p => p.featured);
    if (concern && CONCERN_KEYWORDS[concern]) {
      const kw = CONCERN_KEYWORDS[concern];
      list = list.filter(p => { const h = `${p.name} ${p.brand} ${p.category} ${(p.tags||[]).join(" ")} ${p.description||""}`.toLowerCase(); return kw.some(k => h.includes(k)); });
    }
    if (category !== "All") list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    list = list.filter(p => p.price <= priceMax);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => { const h = `${p.name} ${p.brand} ${p.category} ${(p.tags||[]).join(" ")} ${p.description||""}`.toLowerCase(); return q.split(/\s+/).every(w => h.includes(w)); });
    }
    if (sort === "price_asc")  list.sort((a,b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a,b) => b.price - a.price);
    if (sort === "discount")   list.sort((a,b) => (b.discount||0) - (a.discount||0));
    if (sort === "trending")   list.sort((a,b) => (b.trending?1:0) - (a.trending?1:0));
    return list;
  }, [products, query, category, concern, filter, sort, priceMax]);

  const clearAll = () => { setQuery(""); setConcern(""); setCategory("All"); setFilter(""); setPriceMax(5000); setImgResult(""); router.push("/products"); };
  const hasActiveFilter = query || concern || category !== "All" || filter || priceMax < 5000;
  const maxPrice = Math.max(...products.map(p => p.price), 5000);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-primary px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-white text-2xl font-bold font-serif text-center mb-1">Find Your Perfect Beauty Product</h1>
          <p className="text-white/70 text-xs text-center mb-5">Type, speak or upload a photo to search {products.length}+ products</p>
          {/* Search bar */}
          <div className="bg-white rounded-2xl flex items-center gap-2 px-4 py-3 shadow-lg">
            <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands, concerns..."
              className="flex-1 outline-none text-gray-800 text-sm placeholder-gray-400 bg-transparent" />
            {query && <button onClick={() => setQuery("")} className="text-gray-400"><FiX size={16} /></button>}
            {voiceSupport && (
              <button onClick={listening ? stopVoice : startVoice}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-brand-light hover:text-brand-primary"}`}
                title={listening ? "Stop" : "Voice search"}>
                {listening ? <FiMicOff size={15} /> : <FiMic size={15} />}
              </button>
            )}
            <button onClick={() => imgInputRef.current?.click()} disabled={imgSearching}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${imgSearching ? "bg-brand-primary text-white animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-brand-light hover:text-brand-primary"}`}
              title="Search by photo"><FiUpload size={15} /></button>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleImageSearch(e.target.files[0]); }} />
          </div>
          {imgResult && <p className={`text-center text-xs mt-2 font-medium ${imgResult.startsWith("Found") ? "text-green-300" : "text-white/70"}`}>{imgSearching ? "🔍 Analyzing..." : `📸 ${imgResult}`}</p>}
          {listening && <p className="text-center text-xs mt-2 text-white/80 animate-pulse">🎤 Listening... speak now</p>}
          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[
              { label:"🔥 Trending",     action:() => { setFilter("trending"); setConcern(""); } },
              { label:"⭐ Bestsellers",   action:() => { setFilter("featured"); setConcern(""); } },
              { label:"💧 Hair Fall",     action:() => { setConcern("hair-fall");   setFilter(""); } },
              { label:"🌿 Dry Skin",      action:() => { setConcern("dry-skin");    setFilter(""); } },
              { label:"✨ Dark Spots",    action:() => { setConcern("dark-spots");  setFilter(""); } },
              { label:"🌸 Oily Skin",     action:() => { setConcern("oily-skin");   setFilter(""); } },
              { label:"⏳ Anti-Ageing",   action:() => { setConcern("anti-ageing"); setFilter(""); } },
            ].map(chip => (
              <button key={chip.label} onClick={chip.action}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <p className="text-sm text-gray-600 font-medium flex-1">
            {filtered.length === products.length ? <span><strong>{products.length}</strong> products</span> : <span><strong>{filtered.length}</strong> of {products.length}</span>}
            {hasActiveFilter && <button onClick={clearAll} className="ml-2 text-brand-primary text-xs hover:underline">Clear all</button>}
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${category === cat ? "bg-brand-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-brand-primary"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-gray-700 px-3 py-2 pr-7 rounded-xl outline-none cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showFilters || priceMax < maxPrice ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-600 border-gray-200"}`}>
            <FiFilter size={12} /> Filters
          </button>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg ${view==="grid"?"bg-brand-primary text-white":"text-gray-400"}`}><FiGrid size={13} /></button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg ${view==="list"?"bg-brand-primary text-white":"text-gray-400"}`}><FiList size={13} /></button>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Max Price: ₹{priceMax.toLocaleString("en-IN")}</p>
              <input type="range" min={99} max={maxPrice} step={50} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-full accent-brand-primary" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>₹99</span><span>₹{maxPrice.toLocaleString("en-IN")}</span></div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Shop by Concern</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CONCERN_KEYWORDS).map(c => (
                  <button key={c} onClick={() => setConcern(concern===c?"":c)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${concern===c?"bg-brand-primary text-white border-brand-primary":"bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {c.replace(/-/g," ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active tags */}
        {hasActiveFilter && (
          <div className="flex flex-wrap gap-2 mb-4">
            {query && <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">🔍 &quot;{query}&quot;<button onClick={() => setQuery("")}><FiX size={10}/></button></span>}
            {category !== "All" && <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">📂 {category}<button onClick={() => setCategory("All")}><FiX size={10}/></button></span>}
            {concern && <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">🎯 {concern.replace(/-/g," ")}<button onClick={() => setConcern("")}><FiX size={10}/></button></span>}
            {filter && <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">{filter==="trending"?"🔥 Trending":"⭐ Bestsellers"}<button onClick={() => setFilter("")}><FiX size={10}/></button></span>}
            {priceMax < maxPrice && <span className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">💰 Under ₹{priceMax}<button onClick={() => setPriceMax(maxPrice)}><FiX size={10}/></button></span>}
          </div>
        )}

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No products found</h2>
            <p className="text-gray-400 text-sm mb-6">Try a different search or ask Vinod directly</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={clearAll} className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold px-6 py-3 rounded-xl"><FiShuffle size={14}/> Clear Filters</button>
              <button onClick={() => openWhatsApp({ source:"search_no_results", customMessage:`Hi Vinod! I am looking for "${query || concern || category}" products.\n\nShree Ambika Beauty Shop` })}
                className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl">
                <FaWhatsapp size={14}/> Ask on WhatsApp
              </button>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(p => <ProductCard key={p.id} p={p} view="grid" onOrder={handleOrder} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => <ProductCard key={p.id} p={p} view="list" onOrder={handleOrder} />)}
          </div>
        )}
      </div>
    </main>
  );
}
