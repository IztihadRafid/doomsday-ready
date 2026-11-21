import Link from "next/link";
import banner from "../../public/assets/banner.webp";
import moviesIcon from "../../public/assets/movies.png";
import bookingIcon from "../../public/assets/booking.png";
import rewatchIcon from "../../public/assets/rewatch.png";
import Image from "next/image";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
const features = [
  {
    id: "1",
    title: "Movies",
    description:
      "Manage your MCU movie collection, set prerequisites, and track what you have watched.",
    icon: moviesIcon,
    href: "/movies",
  },
  {
    id: "2",
    title: "Rewatch Plan",
    description:
      "Discover which movies to watch before Avengers: Doomsday and track your progress.",
    icon: rewatchIcon,
    href: "/rewatch",
  },
  {
    id: "3",
    title: "Watch Party",
    description:
      "Find the right cinema bundle combination for your opening-night group.",
    icon: bookingIcon,
    href: "/booking",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navbar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-wide">
            DOOMSDAY<span className="text-red-500"> READY</span>
          </Link>
          <nav className="hidden items-center gap-8 text-gray-100 md:flex">
            <Link href="/movies" className="hover:text-red-500">
              Movies
            </Link>
            <Link href="/rewatch" className="hover:text-red-500">
              Rewatch Plan
            </Link>
            <Link href="/booking" className="hover:text-red-500">
              Booking
            </Link>
          </nav>
          <Link
            href="/movies"
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section*/}
      <section className="relative overflow-hidden">
        <Image
          src={banner}
          alt="Doomsday Ready Banner"
          priority
          className="absolute inset-0 w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#09090f] via-[#09090f]/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              The ultimate MCU rewatch companion
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              BEFORE THE
              <br />
              <span className="text-red-500">DOOMSDAY</span>
              <br />
              BE READY<span className="text-red-500">!</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-300">
              The multiverse is approaching its biggest threat. Get your MCU
              movie timeline ready, follow your rewatch plan, and prepare for
              opening night.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/movies"
                className="rounded-lg bg-red-600 px-7 py-3 font-semibold hover:bg-red-700"
              >
                Manage Movies
              </Link>
              <Link
                href="/rewatch"
                className="rounded-lg border border-white/20 px-7 py-3 font-semibold hover:bg-white/10"
              >
                View Rewatch Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800 bg-[#0e0e16]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
              Your mission
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything you need to get ready
            </h2>
            <p className="mt-3 text-gray-400">
              Three simple tools. One mission: be ready for Doomsday.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group rounded-xl border border-white/10 bg-white/3 p-7 transition hover:-translate-y-1 hover:border-red-500/50 hover:bg-white/6"
              >
                <div className="flex items-center justify-between">
                  <Image
                    src={feature.icon}
                    alt={`${feature.title} icon`}
                    className="w-10 h-10 "
                  />
                </div>
                <h3 className="mt-8 text-xl font-bold group-hover:text-red-500">
                  {feature.title}
                </h3>
                <p className="mt-3 min-h-20 leading-7 text-gray-400">
                  {feature.description}
                </p>
                <p className="mt-6 font-semibold text-red-500">
                  <span className="flex items-center gap-1">
                    Explore feature <ArrowRight />
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer></Footer>
    </main>
  );
}
