import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Page Not Found</h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground sm:text-lg">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={`${buttonVariants({ size: "lg" })} mt-6`}>
          Go to Home
        </Link>
      </div>
    </section>
  );
}
