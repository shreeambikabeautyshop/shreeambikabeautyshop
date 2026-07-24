"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

/* ── FAQ Data ────────────────────────────────────────── */
type FAQItem = {
  q: string;
  a: string;
};

type FAQCategory = {
  id: string;
  label: string;
  emoji: string;
  items: FAQItem[];
};

const FAQ_DATA: FAQCategory[] = [
  {
    id: "ordering",
    label: "Ordering",
    emoji: "🛒",
    items: [
      {
        q: "How do I place an order?",
        a: "The easiest way is to WhatsApp Vinod directly at +91 82914 55297. Browse products on our website, then send the product name and quantity via WhatsApp. Vinod will confirm availability, share the price, and arrange delivery. No app download needed — just WhatsApp.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major payment methods: UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and cash on delivery (COD) for eligible orders. For WhatsApp orders, you can also pay cash when the product is delivered in Mumbai.",
      },
      {
        q: "Can I order multiple products at once?",
        a: "Absolutely! Bulk orders are very welcome. Whether you need 2 products or 20, just share the list on WhatsApp and Vinod will arrange everything together. We offer great rates for bulk purchases.",
      },
      {
        q: "Is there a minimum order amount?",
        a: "No minimum order amount at all. You can order even a single lipstick or a small serum. For delivery charges, orders above ₹999 qualify for free shipping. Below ₹999, a flat ₹79 shipping fee applies.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    emoji: "🚚",
    items: [
      {
        q: "How long does delivery take?",
        a: "For Mumbai customers: same-day delivery if you order before 2 PM. For the rest of India: standard delivery takes 4–7 working days via courier. International orders depend on the destination — WhatsApp Vinod for a quote.",
      },
      {
        q: "Is delivery free?",
        a: "Yes! Delivery is free for all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹79 applies. Same-day Mumbai delivery charges may vary — check with Vinod on WhatsApp.",
      },
      {
        q: "Do you deliver outside Mumbai?",
        a: "Yes, we deliver Pan India to every city, town, and village via courier partners. We also ship internationally — just WhatsApp Vinod with your address and products, and he will share the shipping cost and estimated delivery time.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is shipped, Vinod will share your courier tracking ID directly on WhatsApp. You can use that tracking number on the courier website to check live delivery status. For any concerns, just WhatsApp Vinod.",
      },
    ],
  },
  {
    id: "products",
    label: "Products",
    emoji: "💄",
    items: [
      {
        q: "Are all products 100% original?",
        a: "Yes, 100%. Every single product we stock is sourced directly from authorized distributors, official brand channels, and verified wholesalers. We have been in business since 2001 and our reputation is built entirely on authenticity. We do not and will never sell duplicate or counterfeit products.",
      },
      {
        q: "What brands do you stock?",
        a: "We carry 500+ brands including Lakme, Maybelline, L'Oréal, SUGAR Cosmetics, Pilgrim, Wella, Garnier, Biotique, Mamaearth, Nykaa, Huda Beauty, MAC, Colorbar, Revlon, Neutrogena, Cetaphil, Himalaya, and many more. WhatsApp Vinod if you're looking for a specific brand.",
      },
      {
        q: "Do you have products for all skin types?",
        a: "Yes! We stock products suitable for all skin types — oily, dry, combination, sensitive, and normal skin. We also carry products for different skin concerns like dark spots, acne, anti-ageing, hyperpigmentation, and more. Ask Vinod on WhatsApp for personalized recommendations.",
      },
      {
        q: "Can I get product recommendations?",
        a: "Absolutely! WhatsApp Vinod at +91 82914 55297 with your skin type, hair type, budget, and what you're trying to achieve. Vinod has 24+ years of experience and will suggest the best products tailored to your specific needs — completely free of charge.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns",
    emoji: "↩️",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 3 days of delivery for defective products or items delivered incorrectly (wrong product/size/colour). Products must be unused, in original packaging with seal intact. We do not accept returns for change of mind or if the product has been opened or used.",
      },
      {
        q: "How do I return a product?",
        a: "To initiate a return, WhatsApp Vinod at +91 82914 55297 within 3 days of receiving your order. Share a clear photo or video of the defect or wrong item. Once approved, you courier the product back to our Dahisar store address. Refund or replacement is processed after we receive and inspect the returned item.",
      },
      {
        q: "Who pays for return shipping?",
        a: "For returns due to a defective or wrong product, the customer ships the product back at their cost. Once verified, we refund the return shipping cost along with the product value. For change-of-mind returns (not accepted), return shipping is not covered.",
      },
    ],
  },
  {
    id: "store",
    label: "Our Store",
    emoji: "🏪",
    items: [
      {
        q: "Where is Shree Ambika Beauty Shop located?",
        a: "We are located at Anand Nagar Metro Station, Dahisar East, Mumbai — 400068. The store is easy to find right at the metro station exit. It is accessible from all of Mumbai via the Western line metro.",
      },
      {
        q: "What are your store hours?",
        a: "We are open Monday to Sunday, 9:00 AM to 9:00 PM — 365 days a year. You can also WhatsApp Vinod for orders and queries during store hours.",
      },
      {
        q: "Can I pick up my online order from the store?",
        a: "Yes! If you're in Mumbai, you can place your order on WhatsApp and pick it up directly from the store at Dahisar East. It is a great option if you need the product urgently and want to avoid delivery time.",
      },
    ],
  },
];

/* ── Accordion Item ──────────────────────────────────── */
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const id = `faq-answer-${index}`;
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-brand-light transition-colors group"
      >
        <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${isOpen ? "text-brand-primary" : "text-gray-900 group-hover:text-brand-primary"}`}>
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            isOpen ? "bg-brand-primary border-brand-primary text-white rotate-45" : "border-gray-300 text-gray-400"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        id={id}
        role="region"
        aria-labelledby={`faq-btn-${index}`}
        className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="px-6 pb-5 pt-2 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-brand-light">
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ Category Section ────────────────────────────── */
function FAQSection({
  category,
  openIndex,
  setOpenIndex,
  globalOffset,
}: {
  category: FAQCategory;
  openIndex: number | null;
  setOpenIndex: (i: number | null) => void;
  globalOffset: number;
}) {
  return (
    <div id={`faq-${category.id}`} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl" aria-hidden="true">{category.emoji}</span>
        <h2 className="text-xl sm:text-2xl font-heading italic text-gray-900">{category.label}</h2>
        <span className="ml-auto bg-brand-light text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-brand-accent/40">
          {category.items.length} questions
        </span>
      </div>
      <div className="space-y-3">
        {category.items.map((item, i) => {
          const globalIdx = globalOffset + i;
          return (
            <AccordionItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === globalIdx}
              onToggle={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
              index={globalIdx}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */
export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ordering");

  // Calculate global offsets for accordion indices
  const offsets: number[] = [];
  let running = 0;
  FAQ_DATA.forEach((cat) => {
    offsets.push(running);
    running += cat.items.length;
  });

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(`faq-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="bg-brand-primary text-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-white/60 mb-5 flex items-center gap-1">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white/90">FAQ</span>
            </nav>
            <p className="text-brand-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Got Questions?
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading italic text-white mb-5 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">
              Everything you need to know about ordering, delivery, and our products — answered clearly.
            </p>
          </div>
        </section>

        <div className="max-w-[1000px] mx-auto px-4 py-12">

          {/* ── Category Tabs ─────────────────────────────── */}
          <div aria-label="FAQ categories" className="flex flex-wrap gap-2 mb-10 justify-center">
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-brand-primary text-white border-brand-primary shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── All FAQ Sections ──────────────────────────── */}
          <div className="space-y-12">
            {FAQ_DATA.map((cat, i) => (
              <FAQSection
                key={cat.id}
                category={cat}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
                globalOffset={offsets[i]}
              />
            ))}
          </div>

          {/* ── Still Have Questions CTA ──────────────────── */}
          <div className="mt-16 bg-brand-light rounded-3xl p-8 border border-brand-accent/30 text-center">
            <span className="text-5xl block mb-4" aria-hidden="true">💬</span>
            <h2 className="text-2xl font-heading italic text-gray-900 mb-2">Still Have Questions?</h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed max-w-md mx-auto">
              Can&apos;t find the answer you&apos;re looking for? WhatsApp Vinod directly — he&apos;ll be happy to help you within minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I have a question about your products."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-sm transition-all"
              >
                💬 WhatsApp Vinod
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-full text-sm transition-all"
              >
                📞 All Contact Options
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
