import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid movie ID" },
        { status: 400 },
      );
    }
    const moviesCollection = mongoose.connection.collection("movies");
    const targetMovie = await moviesCollection.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!targetMovie) {
      return NextResponse.json({ message: "Movie not found" }, { status: 404 });
    }
    // Get all movies to follow their prerequisites
    const allMovies = await moviesCollection.find({}).toArray();
    const movieMap = new Map(
      allMovies.map((movie) => [String(movie._id), movie]),
    );
    const visited = new Set<string>();
    const result: typeof allMovies = [];
    // Find prerequisites
    function findPrerequisites(movieId: string) {
      if (visited.has(movieId)) return;
      visited.add(movieId);
      const movie = movieMap.get(movieId);
      if (!movie) return;
      for (const prerequisiteId of movie.prerequisites ?? []) {
        findPrerequisites(String(prerequisiteId));
      }
      if (movieId !== id) {
        result.push(movie);
      }
    }
    findPrerequisites(id);
    // Calculate watched count and unwatched runtime
    const watchedCount = result.filter(
      (movie) => movie.watched === true,
    ).length;
    const unwatchedRuntime = result
      .filter((movie) => movie.watched !== true)
      .reduce((total, movie) => total + movie.runtime, 0);

    return NextResponse.json({
      target: targetMovie,
      rewatchOrder: result,
      watchedCount,
      totalMovies: result.length,
      unwatchedRuntime,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to generate rewatch order" },
      { status: 500 },
    );
  }
}
