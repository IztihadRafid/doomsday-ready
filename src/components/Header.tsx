import Link from "next/link";
import Navbar from "./Navbar";
const Header = () => {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold tracking-wide">
          DOOMSDAY<span className="text-red-500"> READY</span>
        </Link>
        <Navbar></Navbar>
      </div>
    </header>
  );
};

export default Header;
