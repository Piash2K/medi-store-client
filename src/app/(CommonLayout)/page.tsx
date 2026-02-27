import Hero from "@/components/modules/home/Hero";
import FeaturedMedicines from "@/components/modules/home/FeaturedMedicines";
import ShopByCategory from "@/components/modules/home/ShopByCategory";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <FeaturedMedicines />
    </>
  );
}
