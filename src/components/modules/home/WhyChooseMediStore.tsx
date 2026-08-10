import { Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";



export default function WhyChooseMediStore() {
  const reasons = [
    {
      title: "Verified Medicines",
      description: "100% authentic medications sourced from certified manufacturers only.",
      icon: ShieldCheck,
    },
    {
      title: "Fast Delivery",
      description: "Get your health needs delivered within 2-4 hours in major urban zones.",
      icon: Truck,
    },
    {
      title: "Easy Tracking",
      description: "Real-time status updates from the warehouse to your front door.",
      icon: PackageCheck,
    },
    {
      title: "Support",
      description: "Dedicated pharmacists available 24/7 for all your health inquiries.",
      icon: Clock3,
    },
  ];

  return (
    <section id="why-choose-medistore" className="bg-[#f3f8f6] dark:bg-[#101c1a] home-section">
      <div className="home-shell">
        <div className="text-center mb-10">
          <h2 className="home-heading text-[#1a2c23] dark:text-white">Why Choose MediStore</h2>
          <p className="home-lead max-w-2xl mx-auto text-[#4b6358] dark:text-[#b5cfc2]">
            Your health and safety are our top priority with verified care and fast fulfillment.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div key={reason.title} className="flex flex-col items-center text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#16a085] dark:bg-[#168172]">
                  <Icon className="h-7 w-7 text-white" />
                </span>
                <h3 className="text-base font-semibold text-[#1a2c23] dark:text-white mb-2">{reason.title}</h3>
                <p className="text-sm text-[#4b6358] dark:text-[#b5cfc2]">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
