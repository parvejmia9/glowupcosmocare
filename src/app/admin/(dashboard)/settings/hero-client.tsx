"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface HeroImages {
  hero_image_1: string;
  hero_image_2: string;
  hero_image_3: string;
}

export default function HeroImageManager({ heroImages }: { heroImages: HeroImages }) {
  const router = useRouter();
  const [images, setImages] = useState(heroImages);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRefs = {
    "1": useRef<HTMLInputElement>(null),
    "2": useRef<HTMLInputElement>(null),
    "3": useRef<HTMLInputElement>(null),
  };

  const handleUpload = async (slot: "1" | "2" | "3", file: File) => {
    setLoading(slot);
    setError("");

    try {
      const formData = new FormData();
      formData.set("hero", file);
      formData.set("slot", slot);

      const res = await fetch("/api/admin/hero", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setImages((prev) => ({ ...prev, [`hero_image_${slot}`]: data.url }));
        router.refresh();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(null);
  };

  return (
    <div className="bg-white border rounded-xl p-6 max-w-lg mb-6">
      <h2 className="text-lg font-bold mb-4">Hero Images (Carousel)</h2>
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-4">
        {(["1", "2", "3"] as const).map((slot) => {
          const key = `hero_image_${slot}` as keyof HeroImages;
          const src = images[key];
          return (
            <div key={slot} className="border rounded-lg p-3">
              <p className="text-sm font-semibold mb-2">Slide {slot}</p>
              {src ? (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Hero ${slot}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-[16/9] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm mb-2">
                  No image
                </div>
              )}
              <button
                type="button"
                disabled={loading === slot}
                onClick={() => fileRefs[slot].current?.click()}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
              >
                {loading === slot ? "Uploading..." : src ? "Change Image" : "Upload Image"}
              </button>
              <input
                ref={fileRefs[slot]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(slot, f);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
