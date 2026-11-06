"use client";
import Link from "next/link";
import { PersonalLogo } from "@/components/personal-logo";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { navigation } from "@/config/site";
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) =>
    path === href || (href !== "/" && path.startsWith(href + "/"));
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link
          prefetch={false}
          href="/"
          className="wordmark"
          onClick={() => setOpen(false)}
          aria-label="SHAUN DENVER MATHIASZ. — home"
        >
          <PersonalLogo priority />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((n) => (
            <Link
              prefetch={false}
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
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
        <Link prefetch={false} href="/contact" className="nav-contact">
          Let’s connect <ArrowUpRight size={15} />
        </Link>
        <button
          ref={toggle}
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
            if (e.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          {[...navigation, { href: "/contact", label: "Contact" }].map((n) => (
            <Link
              prefetch={false}
              href={n.href}
              key={n.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(n.href) ? "page" : undefined}
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
