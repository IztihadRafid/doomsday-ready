import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
export async function GET() {
  try {
    await connectDB();
    const movies = await mongoose.connection
      .collection("movies")
      .find({})
      .sort({ releaseYear: 1 })
      .toArray();
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { title, releaseYear, runtime, prerequisites } = await request.json();
    if (
      !title?.trim() ||
      !Number.isInteger(releaseYear) ||
      releaseYear < 1 ||
      !Number.isInteger(runtime) ||
      runtime < 1 ||
      runtime > 300
    ) {
      return NextResponse.json(
        { message: "Invalid movie information" },
        { status: 400 },
      );
    }
    const prerequisiteIds = prerequisites ?? [];

    if (
      !Array.isArray(prerequisiteIds) ||
      !prerequisiteIds.every(
        (id: string) => typeof id === "string" && mongoose.isValidObjectId(id),
      )
    ) {
      return NextResponse.json(
        { message: "Invalid prerequisites" },
        { status: 400 },
      );
    }

    const moviesCollection = mongoose.connection.collection("movies");
    await moviesCollection.createIndex({ title: 1 }, { unique: true });
    const existingMovies = await moviesCollection
      .find({
        _id: {
          $in: prerequisiteIds.map(
            (id: string) => new mongoose.Types.ObjectId(id),
          ),
        },
      })
      .toArray();

    if (existingMovies.length !== new Set(prerequisiteIds).size) {
      return NextResponse.json(
        { message: "One or more prerequisite movies do not exist" },
        { status: 400 },
      );
    }

    const movie = {
      title: title.trim(),
      releaseYear,
      runtime,
      prerequisites: prerequisiteIds.map(
        (id: string) => new mongoose.Types.ObjectId(id),
      ),
      watched: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await moviesCollection.insertOne(movie);

    return NextResponse.json(
      {
        message: "Movie created successfully",
        movie: { ...movie, _id: result.insertedId },
      },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "Movie title already exists" },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create movie" },
      { status: 500 },
    );
  }
}
