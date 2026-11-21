import Link from "next/link";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const navLinks = [
    { href: "/movies", label: "Movies" },
    { href: "/rewatch", label: "Rewatch" },
    { href: "/booking", label: "Booking" },
  ];
  const pathname = usePathname();
  return (
    <nav className="flex gap-6 text-white">
      {navLinks.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={
              isActive ? "font-medium text-red-500" : "hover:text-white"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
