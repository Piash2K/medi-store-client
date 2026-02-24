import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
	return (
		<section className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
			<div className="rounded-lg border bg-card p-6 shadow-sm">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create your account
					</h1>
					<p className="text-sm text-muted-foreground">
						Join MediStore to buy or sell OTC medicines.
					</p>
				</div>

				<form className="mt-6 space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							Full name
						</label>
						<Input
							id="name"
							name="name"
							type="text"
							autoComplete="name"
							placeholder="Enter your full name"
							required
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Create a secure password"
							required
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="confirmPassword" className="text-sm font-medium">
							Confirm password
						</label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autoComplete="new-password"
							placeholder="Re-enter your password"
							required
						/>
					</div>

					<Button type="submit" className="w-full">
						Create account
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="font-medium text-foreground">
						Sign in
					</Link>
				</p>
			</div>
		</section>
	);
}
