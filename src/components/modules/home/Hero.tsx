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
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const nextSlide = () => {
		setActiveIndex((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
	};

	return (
		<section className="w-full pt-4 sm:pt-6 pb-2 sm:pb-4">
			<div className="home-shell">
				<div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 shadow-lg bg-card">
					<div className="relative h-[420px] sm:h-[500px] lg:h-[560px] xl:h-[600px] w-full">
						{slides.map((slide, index) => (
							<div
								key={slide.title}
								className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
									activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
								}`}
							>
								<Image
									src={slide.image}
									alt={slide.title}
									fill
									priority={index === 0}
									className="object-cover object-center"
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

								<div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
									<div className="max-w-2xl text-left text-white">
										<span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/60 backdrop-blur-md px-4 py-1 text-xs font-semibold tracking-wide text-emerald-300 uppercase">
											<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
											Verified Care Platform
										</span>
										<h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-sm">
											{slide.title}
										</h1>
										<p className="mt-3.5 max-w-xl text-base text-white/90 sm:mt-4 sm:text-lg lg:text-xl leading-relaxed">
											{slide.description}
										</p>
										<div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
											<Link
												href="/shop"
												className={`${buttonVariants({ size: "lg" })} w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md font-semibold px-7 h-12 sm:h-13 text-base`}
											>
												Shop Medicines
											</Link>
											<Link
												href="#why-choose-medistore"
												className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full sm:w-auto border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-xs h-12 sm:h-13 px-7 text-base`}
											>
												Learn More
											</Link>
										</div>
									</div>
								</div>
							</div>
						))}

						{/* Slide Control Buttons */}
						<button
							type="button"
							onClick={prevSlide}
							className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65 sm:inline-flex lg:left-5"
							aria-label="Previous slide"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={nextSlide}
							className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65 sm:inline-flex lg:right-5"
							aria-label="Next slide"
						>
							<ChevronRight className="h-5 w-5" />
						</button>

						{/* Indicators */}
						<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
							{slides.map((slide, index) => (
								<button
									key={slide.title}
									type="button"
									onClick={() => setActiveIndex(index)}
									className={`h-2 rounded-full transition-all duration-300 ${
										activeIndex === index ? "w-7 bg-emerald-400" : "w-2 bg-white/50 hover:bg-white/80"
									}`}
									aria-label={`Go to slide ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
