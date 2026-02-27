import { Suspense } from "react";

import LoginForm from "@/components/modules/auth/login/LoginForm";

export const dynamic = "force-static";

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading login...</div>}>
			<LoginForm />
		</Suspense>
	);
}
