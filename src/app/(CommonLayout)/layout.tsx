import { Navbar } from "@/components/shared/navbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div >{children}</div>
    </div>
  );
};
export default CommonLayout;
