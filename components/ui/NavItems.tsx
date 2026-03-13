import Link from "next/link";

import { navbarItems } from "@/lib/constants";

const NavItems = () => {
  return (
    <ul className="flex flex-row p-2 gap-4">
      {navbarItems.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="search-text">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;
