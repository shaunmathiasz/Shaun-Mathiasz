"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { navigation } from "@/config/site";
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link
          href="/"
          className="wordmark"
          onClick={() => setOpen(false)}
          aria-label="SHAUN DENVER MATHIASZ. — home"
        >
          SHAUN DENVER
          <span>
            MATHIASZ<span className="gold">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={path === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        {site.cvUrl && (
          <a className="nav-cv" href={site.cvUrl} download>
            CV ↓
          </a>
        )}
        <Link href="/contact" className="nav-contact">
          Let’s connect <ArrowUpRight size={15} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="mobile-nav"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {[...navigation, { href: "/contact", label: "Contact" }].map((n) => (
            <Link
              href={n.href}
              key={n.href}
              onClick={() => setOpen(false)}
              aria-current={path === n.href ? "page" : undefined}
            >
              {n.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
