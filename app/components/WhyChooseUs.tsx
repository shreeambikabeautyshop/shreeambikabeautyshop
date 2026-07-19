import { MdVerified, MdLocalShipping } from "react-icons/md";
import { FiShield, FiStar, FiUsers } from "react-icons/fi";

const features = [
  {
    icon: <MdVerified size={28} />,
    title: "100% Original Products",
    desc: "Direct from Company. No middlemen, no third party.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: <FiShield size={28} />,
    title: "100% Authentic Products",
    desc: "Original seal, original quality, original results. No compromises.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <span className="text-2xl font-bold leading-none">₹</span>,
    title: "Best Possible Discount",
    desc: "We give you the maximum possible discount on every product.",
    color: "text-brand-primary",
    bg: "bg-rose-50",
  },
  {
    icon: <FiStar size={28} />,
    title: "Same Product, Same Quality",
    desc: "Same container, same quality, same trusted product.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: <FiUsers size={28} />,
    title: "Your Trust, Our Priority",
    desc: "Your trust is our identity. We value long term relationships.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: <MdLocalShipping size={28} />,
    title: "Fast & Safe Delivery",
    desc: "Priority delivery to your doorstep, safe and secure packaging.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-14 bg-gradient-to-b from-brand-light to-white" aria-labelledby="why-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-2">
            ♛ We Don&apos;t Just Sell, We Serve With Trust ♛
          </p>
          <h2 id="why-heading" className="text-3xl md:text-4xl font-bold text-brand-primary font-serif">
            Why Every Woman Chooses<br />
            <span className="text-brand-secondary">Shree Ambika Beauty Store</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-50"
            >
              <div className={`${f.bg} ${f.color} rounded-xl p-3 flex-shrink-0 h-fit`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
