import { prisma } from "@/lib/db";
import ChangePasswordForm from "./client";
import HeroImageManager from "./hero-client";
import FeaturedProductsManager from "./featured-client";
import AboutForm, { DeliveryChargeForm } from "./settings-form";
import SettingsTabs from "./tabs-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await prisma.admin.findFirst({ select: { username: true } });

  const allSettings = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of allSettings) settingsMap[s.key] = s.value;

  const heroImages = {
    hero_image_1: settingsMap["hero_image_1"] || "",
    hero_image_2: settingsMap["hero_image_2"] || "",
    hero_image_3: settingsMap["hero_image_3"] || "",
  };

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const featuredIds = settingsMap["featured_product_ids"] || "";
  const aboutText = settingsMap["about_text"] || "";
  const deliveryInside = settingsMap["delivery_charge_inside"] || "70";
  const deliveryOutside = settingsMap["delivery_charge_outside"] || "120";

  const personalSection = (
    <>
      <div className="bg-white border rounded-xl p-6 max-w-lg mb-6">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            value={admin?.username || ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
      <ChangePasswordForm />
    </>
  );

  const storefrontSection = (
    <>
      <HeroImageManager heroImages={heroImages} />
      <AboutForm aboutText={aboutText} />
    </>
  );

  const productsSection = (
    <>
      <FeaturedProductsManager products={products} currentIds={featuredIds} />
    </>
  );

  const othersSection = (
    <>
      <DeliveryChargeForm deliveryInside={deliveryInside} deliveryOutside={deliveryOutside} />
    </>
  );

  // const testimonialSection = (
  //   <div className="bg-white border rounded-xl p-6 max-w-lg">
  //     <h2 className="text-lg font-bold mb-2">Testimonials</h2>
  //     <p className="text-sm text-gray-500">Manage customer testimonials displayed on the homepage.</p>
  //     <p className="text-sm text-gray-400 mt-4 italic">Coming soon — testimonial management will be available here.</p>
  //   </div>
  // );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsTabs
        personalSection={personalSection}
        storefrontSection={storefrontSection}
        productsSection={productsSection}
        othersSection={othersSection}
      />
    </div>
  );
}
