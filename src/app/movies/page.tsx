"use client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import SubContentHeader from "@/components/SubContentHeader";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: string[];
};
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>(
    [],
  );
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [editPrerequisites, setEditPrerequisites] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [runtime, setRuntime] = useState("");
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        const data = await response.json();
        setMovies(
          data.map((movie: any) => ({
            id: movie._id,
            title: movie.title,
            releaseYear: movie.releaseYear,
            runtime: movie.runtime,
            watched: movie.watched,
            prerequisites: movie.prerequisites.map((id: string) => String(id)),
          })),
        );
      } catch (error) {
        console.error(error);
      }
    }
    fetchMovies();
  }, []);

  const toggleWatched = async (id: string) => {
    const movie = movies.find((item) => item.id === id);
    if (!movie) return;
    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          watched: !movie.watched,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: `${data.message || "Failed to update movie"}`,
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
        });
        return;
      }
      setMovies((currentMovies) =>
        currentMovies.map((item) =>
          item.id === id ? { ...item, watched: !movie.watched } : item,
        ),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Something went wrong",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
      });
    }
  };

  const startEditing = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setEditPrerequisites(movie.prerequisites);
  };

  const savePrerequisites = async () => {
    if (!editingMovieId) return;

    try {
      const response = await fetch(`/api/movies/${editingMovieId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prerequisites: editPrerequisites,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: `${data.message || "Failed to update prerequisites"}`,
          background: "#1e1e2f",
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
        });
        return;
      }

      setMovies((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === editingMovieId
            ? { ...movie, prerequisites: editPrerequisites }
            : movie,
        ),
      );

      setEditingMovieId(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Something went wrong",
        background: "#1e1e2f",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
      });
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          releaseYear: Number(releaseYear),
          runtime: Number(runtime),
          prerequisites: selectedPrerequisites,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: `${data.message || "Failed to create movie"}`,
          background: "#1e1e2f",
          color: "#ffffff",
          confirmButtonColor: "#e11d48",
        });
        return;
      }

      const movie = data.movie;

      setMovies((currentMovies) => [
        ...currentMovies,
        {
          id: String(movie._id),
          title: movie.title,
          releaseYear: movie.releaseYear,
          runtime: movie.runtime,
          watched: movie.watched,
          prerequisites: movie.prerequisites.map((id: string) => String(id)),
        },
      ]);

      setTitle("");
      setReleaseYear("");
      setRuntime("");
      setSelectedPrerequisites([]);
      setShowForm(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Something went wrong",
        background: "#1e1e2f",
        color: "#ffffff",
        confirmButtonColor: "#e11d48",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navigation and header */}
      <Header></Header>
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <SubContentHeader
            title={"Movies"}
            subTitle={"Your MCU collection"}
            description={"Manage your movies and track your watching progress."}
          />

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
          >
            {showForm ? "Close Form" : "+ Add Movie"}
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <p className="text-lg text-gray-400">Total Movies</p>
            <p className="mt-2 text-3xl font-bold">{movies.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <p className="text-lg text-gray-400">Watched</p>
            <p className="mt-2 text-3xl font-bold">
              {movies.filter((movie) => movie.watched).length}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-white/10 bg-white/3 p-5 md:col-span-1">
            <p className="text-lg text-gray-400">Not Watched</p>
            <p className="mt-2 text-3xl font-bold">
              {movies.filter((movie) => !movie.watched).length}
            </p>
          </div>
        </div>

        {/*Movie Form */}
        {showForm && (
          <section className="mt-8 rounded-xl border border-white/10 bg-white/3 p-6">
            <h2 className="text-xl font-bold">Add a new movie</h2>
            <p className="mt-1 text-sm text-gray-400">
              Enter the movie information below.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 md:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Movie title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Iron Man"
                  className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Release year
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="e.g. 2008"
                  className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Runtime (minutes)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="300"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  placeholder="e.g. 126"
                  className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-2 block text-sm text-gray-300">
                  Prerequisite Movies (Optional)
                </label>

                <div className="space-y-2">
                  {movies.map((movie) => {
                    const selected = selectedPrerequisites.includes(movie.id);

                    return (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() =>
                          setSelectedPrerequisites((current) =>
                            selected
                              ? current.filter((id) => id !== movie.id)
                              : [...current, movie.id],
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                          selected
                            ? "border-red-500 bg-red-500/10"
                            : "border-white/10 bg-[#09090f] hover:border-white/30"
                        }`}
                      >
                        <span className="flex items-center gap-3 text-white">
                          {movie.title}
                        </span>

                        <span
                          className={
                            selected
                              ? "text-red-400 text-xs"
                              : "text-gray-500 text-xs"
                          }
                        >
                          {selected && <Check color="#ffb3b3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 md:col-span-3">
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
                >
                  Save Movie
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Movie Collection */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Movie Collection</h2>
            <span className=" text-gray-400">{movies.length} movies</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="rounded-xl border border-white/10 bg-white/3 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold">{movie.title}</h3>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                    {movie.watched ? (
                      <>
                        <Eye className="h-4 w-4 text-green-400" />
                        <span className=" text-green-400">Watched</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">Unwatched</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  {movie.releaseYear} · {movie.runtime} min
                </p>

                <label className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={movie.watched}
                    onChange={() => toggleWatched(movie.id)}
                    className="h-4 w-4 accent-red-500"
                  />
                  Mark as watched
                </label>

                {editingMovieId === movie.id ? (
                  <div className="mt-5">
                    <label className="mb-2 block text-sm text-gray-300">
                      Select Prerequisites
                    </label>

                    <div className="space-y-2">
                      {movies
                        .filter((item) => item.id !== movie.id)
                        .map((item) => {
                          const selected = editPrerequisites.includes(item.id);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setEditPrerequisites((current) =>
                                  selected
                                    ? current.filter((id) => id !== item.id)
                                    : [...current, item.id],
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                                selected
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-white/10 bg-[#09090f] hover:border-white/30"
                              }`}
                            >
                              <span className="flex items-center gap-3 text-white">
                                {item.title}
                              </span>

                              <span
                                className={
                                  selected
                                    ? "text-green-400 text-xs"
                                    : "text-gray-500 text-xs"
                                }
                              >
                                {selected && <Check color="#ffb3b3" />}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={savePrerequisites}
                      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(movie)}
                    className="mt-5 text-sm font-semibold text-red-400 hover:text-red-300"
                  >
                    Edit prerequisites
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
