import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white"
            >
              Doomsday Ready
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Built for Marvel fans trying to make sense of the multiverse
              before opening night. Track what you&apos;ve seen, skip the
              filler, and plan your theater run with friends.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-12 text-sm">
            <div>
              <h3 className="font-semibold text-white">Explore</h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/movies" className="transition hover:text-white">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/rewatch" className="transition hover:text-white">
                    Rewatch Plan
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="transition hover:text-white">
                    Watch Party
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white">Project</h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/about" className="transition hover:text-white">
                    How It Works
                  </Link>
                </li>

                <li>
                  <Link
                    href="mailto:iztihadrafid10@gmail.com"
                    className="transition hover:text-white"
                  >
                    Send Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800/80 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>
            Made by a Iztihad, for fans. Not affiliated with Marvel Studios or
            Disney.
          </p>
          <p>© {new Date().getFullYear()} Doomsday Ready</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
