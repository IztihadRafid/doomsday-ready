import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection Error.");
    }
    const cinemas = await db
      .collection("cinemas")
      .find()
      .sort({ name: 1 })
      .toArray();

    const cinemaList = cinemas.map((cinema) => ({
      id: cinema._id.toString(),
      name: cinema.name,
      bundles: cinema.bundles,
    }));

    return NextResponse.json(cinemaList);
  } catch (error) {
    console.error("Get cinemas error:", error);
    return NextResponse.json(
      { message: "Failed to get cinemas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection Error.");
    }
    const { name, bundles } = await request.json();
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Array.isArray(bundles) ||
      bundles.length < 1 ||
      bundles.length > 10 ||
      bundles.some(
        (size: unknown) =>
          !Number.isInteger(size) ||
          (size as number) < 1 ||
          (size as number) > 500,
      ) ||
      new Set(bundles).size !== bundles.length
    ) {
      return NextResponse.json(
        { message: "Enter a name and 1-10 unique bundle sizes." },
        { status: 400 },
      );
    }

    const cinemaName = name.trim();
    const nameLowerCase = cinemaName.toLowerCase();
    const cinemas = db.collection("cinemas");
    await cinemas.createIndex({ nameLowerCase: 1 }, { unique: true });
    const existingCinema = await cinemas.findOne({ nameLowerCase });

    if (existingCinema) {
      return NextResponse.json(
        { message: "This named Cinema already exists." },
        { status: 409 },
      );
    }

    const newCinema = {
      name: cinemaName,
      nameLowerCase,
      bundles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await cinemas.insertOne(newCinema);
    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        name: cinemaName,
        bundles,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create cinema error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "This named Cinema already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Failed to create cinema." },
      { status: 500 },
    );
  }
}
