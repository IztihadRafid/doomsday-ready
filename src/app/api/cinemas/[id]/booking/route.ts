import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid cinema ID." },
        { status: 400 },
      );
    }

    // Getthe group size from the URL
    const { searchParams } = new URL(request.url);
    const groupSize = Number(searchParams.get("groupSize"));
    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
      return NextResponse.json(
        { message: "Group size must be between 1 to 10,000." },
        { status: 400 },
      );
    }
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection Error.");
    }
    const cinema = await db.collection("cinemas").findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!cinema) {
      return NextResponse.json(
        { message: "Cinema not found." },
        { status: 404 },
      );
    }

    const bundles: number[] = cinema.bundles;
    const dp = Array(groupSize + 1).fill(Infinity);
    const previous = Array(groupSize + 1).fill(0);
    dp[0] = 0;
    // Calculate the minimum bundles needed
    for (let seats = 1; seats <= groupSize; seats++) {
      for (const bundle of bundles) {
        if (seats >= bundle && dp[seats - bundle] + 1 < dp[seats]) {
          dp[seats] = dp[seats - bundle] + 1;
          previous[seats] = bundle;
        }
      }
    }

    if (dp[groupSize] === Infinity) {
      return NextResponse.json({
        possible: false,
        message: "No exact bundle combination is possible.",
      });
    }

    // Rebuild the bundle combination
    const combination: { size: number; count: number }[] = [];
    let remainingSeats = groupSize;
    while (remainingSeats > 0) {
      const bundle = previous[remainingSeats];
      const existingBundle = combination.find((item) => item.size === bundle);
      if (existingBundle) {
        existingBundle.count++;
      } else {
        combination.push({
          size: bundle,
          count: 1,
        });
      }
      remainingSeats -= bundle;
    }
    combination.sort((a, b) => b.size - a.size);
    return NextResponse.json({
      possible: true,
      cinema: cinema.name,
      groupSize,
      totalBundles: dp[groupSize],
      combination,
    });
  } catch (error) {
    console.error("Booking calculation error:", error);
    return NextResponse.json(
      { message: "Failed to calculate booking." },
      { status: 500 },
    );
  }
}
