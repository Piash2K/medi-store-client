import { Navbar } from "@/components/shared/navbar";
import { CartProvider } from "@/providers/cart-provider";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <div>
        <Navbar />
        <div>{children}</div>
      </div>
    </CartProvider>
  );
};
export default CommonLayout;
