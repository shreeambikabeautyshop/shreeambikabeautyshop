// JSON-LD Product Schema for SEO, GEO, AEO, LLM optimization
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  mrp: number;
  brand: string;
  sku?: string;
  inStock?: boolean;
  seoTitle?: string;
}

export default function ProductSchema({
  name, description, image, price, mrp, brand, sku, inStock = true, seoTitle,
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "sku": sku || name.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
    "brand": {
      "@type": "Brand",
      "name": brand,
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.shreeambikabeauty.com",
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "availability": inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Shree Ambika Beauty Shop",
        "telephone": "+918291455297",
        "url": "https://www.shreeambikabeauty.com",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "28",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
