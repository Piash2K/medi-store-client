import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CartProvider } from "@/providers/cart-provider";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <div>
        <Navbar />
        <div>{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
};
export default CommonLayout;
