import { Suspense } from "react";

import ShopPageContent from "@/components/modules/shop/ShopPageContent";

export const dynamic = "force-static";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading shop...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
