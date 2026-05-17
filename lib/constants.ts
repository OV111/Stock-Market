export type NavbarItem = {
  label: string;
  href: string;
};

export const navbarItems: NavbarItem[] = [
  { label: "Dashboard", href: "/root" },
  { label: "Search", href: "/root/search" },
  { label: "Watchlist", href: "/root/watchlist" },
  { label: "Crypto", href: "/root/crypto" },
];
