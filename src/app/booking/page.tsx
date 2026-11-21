"use client";
import Header from "@/components/Header";
import SubContentHeader from "@/components/SubContentHeader";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
type Cinema = {
  id: string;
  name: string;
  bundles: number[];
};

type BookingResult = {
  totalBundles: number;
  combination: { size: number; count: number }[];
} | null;

export default function BookingPage() {
  const [selectedCinema, setSelectedCinema] = useState("");
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaName, setCinemaName] = useState("");
  const [bundleSizes, setBundleSizes] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [result, setResult] = useState<BookingResult>(null);
  const cinema = cinemas.find((item) => item.id === selectedCinema) ?? {
    id: "",
    name: "",
    bundles: [],
  };
  useEffect(() => {
    async function getCinemas() {
      const response = await fetch("/api/cinemas");
      const data = await response.json();
      setCinemas(data);
      if (data.length > 0) {
        setSelectedCinema(data[0].id);
      }
    }
    getCinemas();
  }, []);
  const handleAddCinema = async (e: React.FormEvent<HTMLFormElement>) => {
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
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
        background: "#1e1e2f",
        text: "Enter a cinema name and 1-10 unique bundle sizes (1-500).",
      });
      return;
    }

    try {
      const response = await fetch("/api/cinemas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cinemaName.trim(),
          bundles,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Failed to add cinema",
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
          background: "#1e1e2f",
          text: "An error occurred while adding the cinema.",
        });
        return;
      }
      setCinemas((current) => [...current, data]);
      setSelectedCinema(data.id);
      setCinemaName("");
      setBundleSizes("");
      setResult(null);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Could not connect to the server.",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
        background: "#1e1e2f",
      });
    }
  };
  const calculateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const target = Number(groupSize);
    if (
      !selectedCinema ||
      !Number.isInteger(target) ||
      target < 1 ||
      target > 10000
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
        background: "#1e1e2f",
        text: "Select a cinema and enter a group size between 1 and 10,000.",
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/cinemas/${selectedCinema}/booking?groupSize=${target}`,
      );
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Failed to calculate booking",
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
          background: "#1e1e2f",
          text: "An error occurred while calculating the booking.",
        });
        return;
      }

      if (!data.possible) {
        Swal.fire({
          icon: "error",
          title: "No exact bundle combination is possible",
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
          background: "#1e1e2f",
          text: "No exact bundle combination is possible for this group size.",
        });
        return;
      }
      setResult({
        totalBundles: data.totalBundles,
        combination: data.combination,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Could not connect to the server.",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
        background: "#1e1e2f",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navigation */}
      <Header></Header>
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Heading */}
        <SubContentHeader
          title={"Watch Party Booking"}
          subTitle={"Assemble your team"}
          description={
            "Find the best exact seat-bundle combination for your group."
          }
        ></SubContentHeader>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Add Form */}
          <section className="mt-10 lg:w-1/2 rounded-xl border border-white/10 bg-white/3 p-6">
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
          <section className="mt-10 lg:w-2/3 rounded-xl border border-white/10 bg-white/3 p-6">
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
                  }}
                  className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500"
                >
                  <option value="" disabled>
                    Select a cinema
                  </option>
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
        </div>

        {/* Result for group Size*/}
        {result && (
          <section className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
            <p className="font-semibold text-purple-400">Combination</p>

            <h2 className="mt-2 text-2xl font-bold">
              {result.totalBundles} bundles required
            </h2>

            <div className="mt-5 space-y-3">
              {result.combination.map((item) => (
                <div
                  key={item.size}
                  className="flex items-center justify-between rounded-lg bg-white/5 p-4"
                >
                  <span className="text-xl">{item.size}-seat bundle</span>
                  <span className="font-semibold text-xl">× {item.count}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-white text-lg">
              Total seats: {Number(groupSize)}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
