"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionCache, setSessionCache } from "@/lib/authSessionCache";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const c = getSessionCache();
    return c ? c.isLoggedIn : false;
  });
  const [userRole, setUserRole] = useState<string | null>(() => {
    const c = getSessionCache();
    return c ? c.userRole : null;
  });
  const isHome = pathname === "/";
  const showProfileIcon = isLoggedIn && userRole === "user";
  const showDashboardIcon = isLoggedIn && (userRole === "admin" || userRole === "superadmin");
  const showAddListingButton = !isLoggedIn || userRole === "user";

  // On home only: sync navbar appearance with scroll (transparent at top, solid when scrolled).
  // On other pages the header is relative with solid background.
  useEffect(() => {
    if (!isHome) return;
    const checkScroll = () => setIsScrolled(typeof window !== "undefined" && window.scrollY >= 1);
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [pathname, isHome]);

  // Session: fetch once on mount, persist in cache so header stays fixed until logout.
  useEffect(() => {
    const cached = getSessionCache();
    if (cached) {
      setIsLoggedIn(cached.isLoggedIn);
      setUserRole(cached.userRole);
    }
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user?: { role?: string } }) => {
        const loggedIn = Boolean(data?.user);
        const role = data?.user?.role ?? null;
        setIsLoggedIn(loggedIn);
        setUserRole(role);
        setSessionCache({ isLoggedIn: loggedIn, userRole: role });
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserRole(null);
        setSessionCache({ isLoggedIn: false, userRole: null });
      });
    const onSignOut = () => {
      const c = getSessionCache();
      if (c?.isLoggedIn) {
        setSessionCache({ isLoggedIn: false, userRole: null });
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    window.addEventListener("auth-sign-out", onSignOut);
    return () => window.removeEventListener("auth-sign-out", onSignOut);
  }, []);

  const navClasses = [
    "custom-navbar",
    "navbar",
    "navbar-expand-lg",
    isHome ? "navbar-fixed" : "navbar-relative",
    isHome ? (isScrolled ? "navbar-bg" : "navbar-transfarent") : "navbar-bg navbar-light",
  ].join(" ");

  return (
    <nav className={navClasses}>
      <div className="container">
        <Link className="navbar-brand m-0" href="/">
          <img className="logo-white" src="/assets/images/logo-white.png" alt="360Nepal" />
          <img className="logo-dark" src="/assets/images/logo.gif" alt="360Nepal" />
        </Link>
        <div className="d-flex order-lg-2 align-items-center gap-2">
          {isLoggedIn ? (
            <>
              {showProfileIcon && (
                <Link
                  href="/profile"
                  className="d-flex align-items-center justify-content-center p-0 btn-user"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  data-bs-custom-class="custom-tooltip"
                  data-bs-title="Profile"
                >
                  <i className="fa-solid fa-user" />
                </Link>
              )}
              {showDashboardIcon && (
                <Link
                  href="/dashboard"
                  className="d-flex align-items-center justify-content-center p-0 btn-user"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  data-bs-custom-class="custom-tooltip"
                  data-bs-title="Dashboard"
                >
                  <i className="fa-solid fa-gauge-high" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="d-flex align-items-center justify-content-center p-0 btn-user"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                data-bs-custom-class="custom-tooltip"
                data-bs-title="Sign In"
              >
                <i className="fa-solid fa-right-to-bracket" />
              </Link>
              <Link
                href="/sign-up"
                className="d-none d-md-flex align-items-center text-decoration-none small fw-medium"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            id="themeToggleBtn"
            className="align-items-center bg-transparent border-0 btn-user d-flex justify-content-center p-0"
          >
            <i className="fa-solid fa-moon" />
          </button>
          {showAddListingButton && (
            <Link
              href={isLoggedIn ? "/add-listing" : "/sign-in"}
              className="btn btn-primary d-none d-sm-flex fw-medium gap-2 hstack rounded-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-plus-circle"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              <div className="vr d-none d-sm-inline-block" />
              <span className="d-none d-sm-inline-block">Add Listing</span>
            </Link>
          )}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span id="nav-icon" className="">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link${pathname === "/" ? " active" : ""}`}
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link${pathname.startsWith("/listings") ? " active" : ""}`}
                href="/listings"
                aria-current={pathname.startsWith("/listings") ? "page" : undefined}
              >
                Listing
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link${pathname.startsWith("/blogs") ? " active" : ""}`}
                href="/blogs"
                aria-current={pathname.startsWith("/blogs") ? "page" : undefined}
              >
                Blogs
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link${pathname.startsWith("/videos") ? " active" : ""}`}
                href="/videos"
                aria-current={pathname.startsWith("/videos") ? "page" : undefined}
              >
                Videos
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link${pathname.startsWith("/about") ? " active" : ""}`}
                href="/about"
                aria-current={pathname.startsWith("/about") ? "page" : undefined}
              >
                About
              </Link>
            </li>
          </ul>
          <div className="d-lg-none d-flex flex-column gap-2 align-items-center">
            {isLoggedIn ? (
              <>
                {showProfileIcon && (
                  <Link href="/profile" className="btn btn-outline-primary rounded-3 text-center">
                    Profile
                  </Link>
                )}
                {showDashboardIcon && (
                  <Link
                    href="/dashboard"
                    className="d-flex align-items-center justify-content-center p-2 btn-user"
                    aria-label="Dashboard"
                  >
                    <i className="fa-solid fa-gauge-high" />
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="btn btn-outline-primary rounded-3 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn btn-primary rounded-3 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
            {showAddListingButton && (
              <Link
                href={isLoggedIn ? "/add-listing" : "/sign-in"}
                className="btn btn-outline-secondary rounded-3 text-center"
              >
                Add Listing
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
