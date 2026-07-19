import { MdVerified, MdLocalShipping } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { FiShield, FiStar, FiUsers } from "react-icons/fi";
import Image from "next/image";

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

const comparison = {
  others: [
    "Duplicate or Fake Products",
    "Same Container, Different / Low Quality Inside",
    "No Guarantee of Authenticity",
    "May Cause Skin Problems, Allergies & Reactions",
    "Big Hospital Bills",
    "Total Loss of Money & Beauty",
  ],
  ours: [
    "100% Original Products",
    "Direct From Company",
    "Same Product, Same Quality",
    "Safe for Your Skin",
    "Visible Results You Can Trust",
    "Save Money, Save Health • Beauty That Lasts Long",
  ],
};

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

        {/* Features Grid + Women Image */}
        <div className="flex gap-6 mb-14 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
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

          {/* Women image on right */}
          <div className="relative hidden lg:block w-72 h-[420px] flex-shrink-0 rounded-3xl overflow-hidden">
            <Image
              src="https://res.cloudinary.com/zjlchjal/image/upload/v1784471137/today-beauty-tips_tkzbog.png"
              alt="Why choose Shree Ambika Beauty Shop"
              fill
              className="object-cover object-top"
              sizes="288px"
            />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className="text-center py-5 bg-brand-primary text-white">
            <h3 className="font-bold text-xl">
              ⚠️ Cheap Today, Expensive Tomorrow!
            </h3>
            <p className="text-sm text-white/80 mt-1">Don&apos;t be fooled by low prices and duplicate products.</p>
          </div>

          <div className="grid grid-cols-2">
            {/* Others */}
            <div className="p-6 border-r border-gray-100">
              <h4 className="font-bold text-gray-600 mb-4 text-center text-sm uppercase tracking-wide">
                What You Get Elsewhere
              </h4>
              <ul className="space-y-3">
                {comparison.others.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ours */}
            <div className="p-6 bg-brand-light">
              <h4 className="font-bold text-brand-primary mb-4 text-center text-sm uppercase tracking-wide">
                What You Get at Shree Ambika Beauty Shop
              </h4>
              <ul className="space-y-3">
                {comparison.ours.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* VS Divider visual */}
          <div className="flex justify-center -mt-6 mb-6">
            <div className="bg-brand-primary text-white font-black text-lg px-4 py-2 rounded-full shadow-md">
              VS
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 text-center bg-gradient-to-r from-brand-primary to-brand-secondary">
            <p className="text-white font-bold text-lg mb-1">GIVE US ONCE A CHANCE TO SERVE YOU</p>
            <p className="text-white/80 text-sm italic mb-4">Hame Ek Baar Seva Ka Mauka Do ♡</p>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-brand-primary font-bold px-6 py-3 rounded-full hover:bg-brand-light transition-colors"
            >
              <FaWhatsapp size={20} className="text-green-500" />
              SHOP ON WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
