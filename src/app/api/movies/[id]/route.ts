import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
export async function PATCH(
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
    const movieId = new mongoose.Types.ObjectId(id);
    const moviesCollection = mongoose.connection.collection("movies");

    // Checking existed movie
    const existingMovie = await moviesCollection.findOne({
      _id: movieId,
    });
    if (!existingMovie) {
      return NextResponse.json({ message: "Movie not found" }, { status: 404 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }
    const { watched, prerequisites } = body;
    if (watched === undefined && prerequisites === undefined) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }
    // Validate watched status
    if (watched !== undefined && typeof watched !== "boolean") {
      return NextResponse.json(
        { message: "Watched must be true or false" },
        { status: 400 },
      );
    }
    const updates: {
      watched?: boolean;
      prerequisites?: mongoose.Types.ObjectId[];
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (watched !== undefined) {
      updates.watched = watched;
    }
    if (prerequisites !== undefined) {
      if (
        !Array.isArray(prerequisites) ||
        !prerequisites.every(
          (id: string) =>
            typeof id === "string" && mongoose.isValidObjectId(id),
        )
      ) {
        return NextResponse.json(
          { message: "Invalid prerequisites" },
          { status: 400 },
        );
      }
      if (new Set(prerequisites).size !== prerequisites.length) {
        return NextResponse.json(
          { message: "Duplicate prerequisites are not allowed" },
          { status: 400 },
        );
      }

      const prerequisiteIds = prerequisites.map(
        (id: string) => new mongoose.Types.ObjectId(id),
      );
      const existingPrerequisites = await moviesCollection
        .find({
          _id: { $in: prerequisiteIds },
        })
        .toArray();

      if (existingPrerequisites.length !== prerequisiteIds.length) {
        return NextResponse.json(
          { message: "One or more prerequisite movies do not exist" },
          { status: 400 },
        );
      }
      const allMovies = await moviesCollection
        .find({}, { projection: { _id: 1, prerequisites: 1 } })
        .toArray();

      const graph = new Map<string, string[]>();

      for (const movie of allMovies) {
        graph.set(
          String(movie._id),
          (movie.prerequisites ?? []).map((item: { toString(): string }) =>
            item.toString(),
          ),
        );
      }
      function reachesTarget(
        startId: string,
        targetId: string,
        visited = new Set<string>(),
      ): boolean {
        if (startId === targetId) return true;
        if (visited.has(startId)) return false;
        visited.add(startId);
        const dependencies = graph.get(startId) ?? [];
        return dependencies.some((dependencyId) =>
          reachesTarget(dependencyId, targetId, visited),
        );
      }

      const hasCircularDependency = prerequisiteIds.some((prerequisiteId) =>
        reachesTarget(prerequisiteId.toString(), id),
      );

      if (hasCircularDependency) {
        return NextResponse.json(
          { code: "CIRCULAR_DEPENDENCY" },
          { status: 409 },
        );
      }

      updates.prerequisites = prerequisiteIds;
    }
    await moviesCollection.updateOne({ _id: movieId }, { $set: updates });
    const updatedMovie = await moviesCollection.findOne({
      _id: movieId,
    });
    return NextResponse.json({
      message: "Movie updated successfully",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update movie" },
      { status: 500 },
    );
  }
}
