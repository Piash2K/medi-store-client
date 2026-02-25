"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";

const slides = [
	{
		image:
			"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
		title: "Your Trusted Online Medicine Shop",
		description:
			"Buy OTC medicines with confidence from verified products and secure checkout.",
	},
	{
		image:
			"https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=80",
		title: "Fast Delivery to Your Door",
		description:
			"Place your order in minutes and get essential medicines delivered quickly.",
	},
	{
		image:
			"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80",
		title: "Easy Reorder & Better Care",
		description:
			"Track previous purchases and reorder your everyday health essentials anytime.",
	},
] as const;

export default function Hero() {
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % slides.length);
		}, 4000);

		return () => clearInterval(interval);
	}, []);

	const nextSlide = () => {
		setActiveIndex((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
	};

	const activeSlide = slides[activeIndex];

	return (
		<section className="mx-auto flex  items-center px-4 py-10 sm:px-6 lg:px-8">
			<div className="relative w-full overflow-hidden rounded-2xl">
				<div className="relative h-130 w-full">
					<Image
						src={activeSlide.image}
						alt={activeSlide.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/50" />

					<div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
						<h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
							{activeSlide.title}
						</h1>
						<p className="mt-4 max-w-2xl text-white/90">{activeSlide.description}</p>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
							<Link href="/shop" className={buttonVariants({ size: "lg" })}>
								Shop Medicines
							</Link>
							<Link
								href="/register"
								className={buttonVariants({ variant: "outline", size: "lg" })}
							>
								Create Account
							</Link>
						</div>
					</div>

					<button
						type="button"
						onClick={prevSlide}
						className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-sm text-white"
						aria-label="Previous slide"
					>
						Prev
					</button>
					<button
						type="button"
						onClick={nextSlide}
						className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-sm text-white"
						aria-label="Next slide"
					>
						Next
					</button>
				</div>

				<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
					{slides.map((slide, index) => (
						<button
							key={slide.title}
							type="button"
							onClick={() => setActiveIndex(index)}
							className={`h-2.5 w-2.5 rounded-full transition ${
								activeIndex === index ? "bg-white" : "bg-white/50"
							}`}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
