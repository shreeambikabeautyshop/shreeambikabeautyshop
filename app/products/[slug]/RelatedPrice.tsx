"use client";
import { useSettings } from "@/app/context/SettingsContext";

export default function RelatedPrice({ price }: { price: number }) {
  const { show_price } = useSettings();
  if (!show_price) {
    return (
      <span className="text-xs text-brand-primary font-semibold italic">Contact for Price</span>
    );
  }
  return <p className="text-sm font-bold text-gray-900">₹{price}</p>;
}
