import {
  FiShield,
  FiTruck,
  FiStar,
  FiMessageCircle,
  FiPackage,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

const stats = [
  { icon: <FiPackage size={22} />, value: "10,000+", label: "Products", sublabel: "Wide Range of Beauty Essentials" },
  { icon: <FiStar size={22} />, value: "500+", label: "Top Brands", sublabel: "Trusted & Premium Quality" },
  { icon: <FiShield size={22} />, value: "Every Category", label: "", sublabel: "Everything Under One Place" },
  { icon: <MdVerified size={22} />, value: "Affordable", label: "Prices", sublabel: "Best Deals for You" },
  { icon: <FiMessageCircle size={22} />, value: "Expert", label: "Guidance", sublabel: "We're Here to Help You" },
  { icon: <FiTruck size={22} />, value: "Safe &", label: "Secure", sublabel: "Trusted Shopping Experience" },
];

export default function TrustBadges() {
  return (
    <section className="bg-brand-primary text-white py-4" aria-label="Trust Indicators">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center py-2 px-1 border-r border-white/20 last:border-r-0"
            >
              <span className="text-brand-gold mb-1">{item.icon}</span>
              <p className="font-bold text-sm leading-tight">
                {item.value} {item.label}
              </p>
              <p className="text-xs text-white/70 mt-0.5 leading-tight">{item.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
