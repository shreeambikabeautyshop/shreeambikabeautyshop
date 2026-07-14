// Cloudinary upload helper (client-side via unsigned preset OR server-side)
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "shreeambika_products"); // create this in Cloudinary dashboard
  formData.append("folder", "shreeambika-products");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Call our API route for deletion (needs API secret, server-side only)
  await fetch("/api/admin/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });
}
