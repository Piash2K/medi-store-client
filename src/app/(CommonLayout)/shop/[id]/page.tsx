import MedicineDetailsContent from "@/components/modules/shop/MedicineDetailsContent";

export const dynamic = "force-dynamic";

type MedicineDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MedicineDetailsPage({ params }: MedicineDetailsPageProps) {
  const { id } = await params;

  return <MedicineDetailsContent medicineId={id} />;
}
