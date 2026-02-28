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
				<div className="relative h-[calc(100vh-4rem)] min-h-115 w-full sm:min-h-130 lg:min-h-140">
					<Image
						src={activeSlide.image}
						alt={activeSlide.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/20" />

					<div className="absolute inset-0 flex items-center px-4 sm:px-8 lg:px-16">
						<div className="max-w-2xl text-left text-white">
							<p className="mb-3 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide uppercase sm:text-xs">
								Trusted Care Platform
							</p>
							<h1 className="text-2xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-6xl">
							{activeSlide.title}
							</h1>
							<p className="mt-3 max-w-xl text-sm text-white/90 sm:mt-4 sm:text-lg">
								{activeSlide.description}
							</p>
							<div className="mt-6 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
								<Link href="/shop" className={`${buttonVariants({ size: "lg" })} w-full sm:w-auto`}>
									Shop Medicines
								</Link>
								<Link
									href="/register"
									className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto`}
								>
									Create Account
								</Link>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={prevSlide}
						className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55 sm:inline-flex sm:h-10 sm:w-10 lg:left-5"
						aria-label="Previous slide"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={nextSlide}
						className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55 sm:inline-flex sm:h-10 sm:w-10 lg:right-5"
						aria-label="Next slide"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>

				<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
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
