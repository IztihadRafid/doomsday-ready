"use client";
import Header from "@/components/Header";
import SubContentHeader from "@/components/SubContentHeader";
import { useState } from "react";
type Cinema = {
  id: number;
  name: string;
  bundles: number[];
};

const sampleCinemas: Cinema[] = [
  {
    id: 1,
    name: "Starlight Cinemas",
    bundles: [2, 5],
  },
  {
    id: 2,
    name: "Galaxy Multiplex",
    bundles: [1, 3, 4],
  },
  {
    id: 3,
    name: "Cosmic Screens",
    bundles: [6, 9, 20],
  },
];

type BookingResult = {
  totalBundles: number;
  combination: { size: number; count: number }[];
} | null;

export default function BookingPage() {
  const [selectedCinema, setSelectedCinema] = useState("1");
  const [cinemas, setCinemas] = useState<Cinema[]>(sampleCinemas);
  const [cinemaName, setCinemaName] = useState("");
  const [bundleSizes, setBundleSizes] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [result, setResult] = useState<BookingResult>(null);
  const [message, setMessage] = useState("");
  const cinema = cinemas.find((item) => item.id === Number(selectedCinema))!;
  function handleAddCinema(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bundles = bundleSizes.split(",").map(Number);
    if (
      !cinemaName.trim() ||
      bundles.length < 1 ||
      bundles.length > 10 ||
      bundles.some(
        (size) => !Number.isInteger(size) || size < 1 || size > 500,
      ) ||
      new Set(bundles).size !== bundles.length
    ) {
      setMessage("Enter a cinema name and 1–10 unique bundle sizes (1–500).");
      return;
    }

    if (
      cinemas.some(
        (item) => item.name.toLowerCase() === cinemaName.trim().toLowerCase(),
      )
    ) {
      setMessage("A cinema with this name already exists.");
      return;
    }

    const newCinema: Cinema = {
      id: Date.now(),
      name: cinemaName.trim(),
      bundles,
    };

    setCinemas((current) => [...current, newCinema]);
    setSelectedCinema(String(newCinema.id));
    setCinemaName("");
    setBundleSizes("");
    setMessage("");
    setResult(null);
  }
  function calculateBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    setMessage("");
    const target = Number(groupSize);

    if (!Number.isInteger(target) || target < 1 || target > 10000) {
      setMessage("Group size must be between 1 and 10,000.");
      return;
    }
    const dp = Array(target + 1).fill(Infinity);
    const previous = Array(target + 1).fill(0);

    dp[0] = 0;

    for (let seats = 1; seats <= target; seats++) {
      for (const bundle of cinema.bundles) {
        if (seats >= bundle && dp[seats - bundle] + 1 < dp[seats]) {
          dp[seats] = dp[seats - bundle] + 1;
          previous[seats] = bundle;
        }
      }
    }

    if (dp[target] === Infinity) {
      setMessage(
        "No exact bundle combination is possible for this group size.",
      );
      return;
    }
    const combination: { size: number; count: number }[] = [];
    let remaining = target;
    while (remaining > 0) {
      const bundle = previous[remaining];
      const existing = combination.find((item) => item.size === bundle);
      if (existing) {
        existing.count++;
      } else {
        combination.push({ size: bundle, count: 1 });
      }
      remaining -= bundle;
    }

    setResult({
      totalBundles: dp[target],
      combination: combination.sort((a, b) => b.size - a.size),
    });
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navigation */}
      <Header></Header>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Heading */}
        <SubContentHeader
          title={"Watch Party Booking"}
          subTitle={"Assemble your team"}
          description={
            "Find the best exact seat-bundle combination for your group."
          }
        ></SubContentHeader>

        {/* Add Form */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/3 p-6">
          <h2 className="text-xl font-bold">Add a Cinema</h2>

          <form onSubmit={handleAddCinema} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Cinema Name
              </label>

              <input
                required
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                placeholder="e.g. Star Cineplex"
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Bundle Sizes
              </label>

              <input
                required
                value={bundleSizes}
                onChange={(e) => setBundleSizes(e.target.value)}
                placeholder="e.g. 2, 5, 10"
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter 1-10 unique bundle sizes, separated by commas. Each size
                must be 1-500.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-lg border border-red-500 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white"
            >
              Add Cinema
            </button>
          </form>
        </section>
        {/* Booking Form */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/3 p-6">
          <h2 className="text-xl font-bold">Get a booking quote</h2>

          <form onSubmit={calculateBooking} className="mt-6 space-y-6">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Select Cinema
              </label>

              <select
                value={selectedCinema}
                onChange={(e) => {
                  setSelectedCinema(e.target.value);
                  setResult(null);
                  setMessage("");
                }}
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500"
              >
                {cinemas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Group Size
              </label>

              <input
                required
                type="number"
                min="1"
                max="10000"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                placeholder="Enter number of people (1-10,000)"
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            {/* Available Bundles */}
            <div>
              <p className="mb-3 text-sm text-gray-300">
                Available seat bundles
              </p>

              <div className="flex flex-wrap gap-3">
                {cinema.bundles.map((bundle) => (
                  <span
                    key={bundle}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold"
                  >
                    {bundle} seats
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
            >
              Calculate Booking
            </button>
          </form>
        </section>

        {/* Result for group Size*/}
        {result && (
          <section className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <p className="text-sm font-semibold text-green-400">
              Exact combination found
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {result.totalBundles} bundles required
            </h2>

            <div className="mt-5 space-y-3">
              {result.combination.map((item) => (
                <div
                  key={item.size}
                  className="flex items-center justify-between rounded-lg bg-white/5 p-4"
                >
                  <span>{item.size}-seat bundle</span>
                  <span className="font-semibold">× {item.count}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-gray-400">
              Total seats: {Number(groupSize)}
            </p>
          </section>
        )}
        {message && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
