"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
		<section className="w-full">
			<div className="relative w-full overflow-hidden">
				<div className="relative h-[calc(100vh-4rem)] min-h-[560px] w-full">
					<Image
						src={activeSlide.image}
						alt={activeSlide.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />

					<div className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-16">
						<div className="max-w-2xl text-left text-white">
							<p className="mb-3 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide uppercase">
								Trusted Care Platform
							</p>
							<h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
							{activeSlide.title}
							</h1>
							<p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
								{activeSlide.description}
							</p>
							<div className="mt-7 flex flex-wrap items-center gap-3">
								<Link href="/shop" className={buttonVariants({ size: "lg" })}>
									Shop Medicines
								</Link>
								<Link
									href="/register"
									className={`${buttonVariants({ variant: "outline", size: "lg" })} border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white`}
								>
									Create Account
								</Link>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={prevSlide}
						className="absolute left-5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
						aria-label="Previous slide"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={nextSlide}
						className="absolute right-5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
						aria-label="Next slide"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>

				<div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
					{slides.map((slide, index) => (
						<button
							key={slide.title}
							type="button"
							onClick={() => setActiveIndex(index)}
							className={`h-2.5 rounded-full transition-all ${
								activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/55"
							}`}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
