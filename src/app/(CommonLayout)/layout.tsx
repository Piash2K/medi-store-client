import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CartProvider } from "@/providers/cart-provider";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
};
export default CommonLayout;
