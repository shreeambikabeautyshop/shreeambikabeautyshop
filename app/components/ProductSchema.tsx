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
  productUrl?: string;
}

export default function ProductSchema({
  name, description, image, price, mrp, brand, sku, inStock = true, seoTitle, productUrl,
}: ProductSchemaProps) {
  const url = productUrl || "https://www.shreeambikabeautyshop.com";
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
      "url": url,
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "availability": inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 3,
        "returnMethod": "https://schema.org/ReturnByMail",
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR",
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN",
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY",
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 7,
            "unitCode": "DAY",
          },
        },
      },
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
