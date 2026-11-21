"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SubContentHeader from "@/components/SubContentHeader";
type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: string[];
};

export default function RewatchPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [targetId, setTargetId] = useState("");
  const [moviesToWatch, setMoviesToWatch] = useState<Movie[]>([]);
  const [watchedCount, setWatchedCount] = useState(0);
  const [totalRuntime, setTotalRuntime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const progress =
    moviesToWatch.length === 0
      ? 0
      : Math.round((watchedCount / moviesToWatch.length) * 100);
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");
        if (!response.ok) {
          throw new Error("Failed to load movies");
        }
        const data = await response.json();
        const formattedMovies: Movie[] = data.map((movie: any) => ({
          id: String(movie._id),
          title: movie.title,
          releaseYear: movie.releaseYear,
          runtime: movie.runtime,
          watched: movie.watched,
          prerequisites: (movie.prerequisites ?? []).map(String),
        }));

        setMovies(formattedMovies);
        if (formattedMovies.length > 0) {
          setTargetId(formattedMovies[0].id);
        }
      } catch (error) {
        setError("Could not load movies.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);
  useEffect(() => {
    if (!targetId) return;

    async function fetchRewatchOrder() {
      try {
        setError("");
        const response = await fetch(`/api/movies/${targetId}/rewatch-order`);
        if (!response.ok) {
          throw new Error("Failed to load rewatch order");
        }
        const data = await response.json();
        const formattedOrder: Movie[] = data.rewatchOrder.map((movie: any) => ({
          id: String(movie._id),
          title: movie.title,
          releaseYear: movie.releaseYear,
          runtime: movie.runtime,
          watched: movie.watched,
          prerequisites: (movie.prerequisites ?? []).map(String),
        }));

        setMoviesToWatch(formattedOrder);
        setWatchedCount(data.watchedCount);
        setTotalRuntime(data.unwatchedRuntime);
      } catch (error) {
        setError("Could not load the rewatch plan.");
        console.error(error);
      }
    }
    fetchRewatchOrder();
  }, [targetId, refreshKey]);

  async function toggleWatched(movieId: string) {
    const movie = moviesToWatch.find((item) => item.id === movieId);
    if (!movie) return;
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          watched: !movie.watched,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watched status");
      }
      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error(error);
      alert("Could not update watched status.");
    }
  }
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navigation */}
      <Header></Header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Heading contents */}
        <div>
          <SubContentHeader
            title={"Rewatch Plan"}
            subTitle={"Your mission timeline"}
            description={
              "Follow the right order and get ready for your next MCU adventure."
            }
          />
        </div>
        {loading && (
          <p className="mt-8 text-center text-gray-400">Loading movies...</p>
        )}
        {error && <p className="mt-8 text-center text-red-500">{error}</p>}
        {!loading && movies.length === 0 && (
          <p className="mt-8 text-center text-gray-400">
            No movies found. Add movies from the Movies page first.
          </p>
        )}
        {/* Target Selection */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/3 p-6">
          <label className="block text-sm font-medium text-gray-300">
            Select your target movie
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={loading || movies.length === 0}
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-red-500 disabled:opacity-50"
          >
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </section>

        {/* Progress */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Your rewatch progress</p>
              <h2 className="mt-1 text-2xl font-bold">
                {watchedCount} of {moviesToWatch.length} watched
              </h2>
            </div>
            <p className="text-3xl font-bold text-red-500">{progress}%</p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-8">
            <div>
              <p className="text-sm text-gray-400">Total movies</p>
              <p className="mt-1 text-xl font-semibold">
                {moviesToWatch.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Remaining runtime</p>
              <p className="mt-1 text-xl font-semibold">
                {Math.floor(totalRuntime / 60)}h {totalRuntime % 60}m
              </p>
            </div>
          </div>
        </section>

        {/* Movie List */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Watch these first</h2>
          <p className="mt-2 text-sm text-gray-400">
            Complete these movies in the listed order.
          </p>

          {moviesToWatch.length === 0 ? (
            <div className="mt-6 rounded-xl border border-gray-800 py-16 text-center">
              <h3 className="mt-3 font-semibold text-3xl">
                No prerequisites needed
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                You can watch this movie directly.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {moviesToWatch.map((movie, index) => {
                const isWatched = movie.watched;

                return (
                  <div
                    key={movie.id}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/3 p-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-gray-300">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-semibold ${isWatched ? "text-gray-500 line-through" : "text-white"}`}
                      >
                        {movie.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {movie.releaseYear} · {movie.runtime} min
                      </p>
                    </div>

                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={isWatched}
                        onChange={() => toggleWatched(movie.id)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="hidden sm:inline">Watched</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
