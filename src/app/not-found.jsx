import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center text-white">
      <p className="font-semibold text-red-500 text-6xl">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-5xl">
        Looks like you wandered into the wrong page.
      </h1>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-red-600 px-7 py-3 font-semibold hover:bg-red-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
