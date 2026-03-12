"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/app/api/auth/session/route";
import { clearSessionCache } from "@/lib/authSessionCache";

type NavItem =
  | { href: string; label: string; icon: string; children?: never }
  | {
      key: string;
      label: string;
      icon: string;
      href?: never;
      children: Array<{ href: string; label: string }>;
    };

const navMain: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "fa-gauge-high" },
  {
    key: "listings",
    label: "Listings",
    icon: "fa-file-plus",
    children: [
      { href: "/dashboard/listings", label: "Listings" },
      { href: "/dashboard/categories/listing", label: "Categories" },
      { href: "/dashboard/amenities", label: "Amenities" },
      { href: "/dashboard/locations", label: "Locations" },
      { href: "/dashboard/menu-items", label: "Menu Items" },
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: "fa-journal-text",
    children: [
      { href: "/dashboard/blogs", label: "Blogs" },
      { href: "/dashboard/blog-comments", label: "Blog Comments" },
      { href: "/dashboard/categories/blog", label: "Categories" },
      { href: "/dashboard/videos", label: "Videos" },
      { href: "/dashboard/banners", label: "Banners" },
      { href: "/dashboard/pages", label: "Pages" },
    ],
  },
  { href: "/dashboard/media", label: "Media Gallery", icon: "fa-images" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "fa-star" },
];

const navAccount: NavItem[] = [
  { href: "/dashboard/settings", label: "Setting", icon: "fa-gear" },
];

function isDropdownItem(item: NavItem): item is NavItem & { key: string; children: Array<{ href: string; label: string }> } {
  return "children" in item && Array.isArray(item.children);
}

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarCollapseId = "sidebarCollapse";

  const initialOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const item of [...navMain, ...navAccount]) {
      if (isDropdownItem(item)) {
        const hasActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
        if (hasActive) open[item.key] = true;
      }
    }
    return open;
  }, [pathname]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(initialOpen);

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      for (const item of [...navMain, ...navAccount]) {
        if (isDropdownItem(item)) {
          const hasActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
          if (hasActive) next[item.key] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await fetch("/api/auth/sign-out", { method: "POST" });
    clearSessionCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-sign-out"));
    }
    router.push("/sign-in");
    router.refresh();
  }

  function renderNavItems(items: NavItem[]) {
    return items.map((item) => {
      if (isDropdownItem(item)) {
        const isOpen = !!openMenus[item.key];
        const hasActiveChild = item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        );
        return (
          <li
            key={item.key}
            className={isOpen || hasActiveChild ? "mm-active" : ""}
          >
            <a
              href="#"
              className="has-arrow sidebar-dropdown-link material-ripple"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu(item.key);
              }}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <i className={`fa-solid ${item.icon}`} style={{ width: "1rem", textAlign: "center", marginRight: "0.75rem" }} />
              <span>{item.label}</span>
              <i
                className={`fa-solid fa-chevron-down sidebar-dropdown-arrow ${isOpen || hasActiveChild ? "sidebar-dropdown-arrow-open" : ""}`}
                aria-hidden
              />
            </a>
            <ul
              className={`nav-second-level mm-collapse${isOpen || hasActiveChild ? " mm-show" : ""}`}
            >
              {item.children.map((c) => {
                const active = pathname === c.href || pathname.startsWith(c.href + "/");
                return (
                  <li key={c.href} className={active ? "mm-active" : ""}>
                    <Link href={c.href}>{c.label}</Link>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      }
      const active = pathname === item.href;
      return (
        <li key={item.href} className={active ? "mm-active" : ""}>
          <Link href={item.href}>
            <i className={`fa-solid ${item.icon}`} style={{ width: "1rem", textAlign: "center", marginRight: "0.75rem" }} />
            <span>{item.label}</span>
          </Link>
        </li>
      );
    });
  }

  return (
    <div className="wrapper fixed sidebar-mini">
      <style dangerouslySetInnerHTML={{
        __html: `
          .sidebar .metismenu li a.sidebar-dropdown-link.has-arrow::after { display: none; }
          .sidebar .metismenu li a.sidebar-dropdown-link {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
          }
          .sidebar .metismenu li a.sidebar-dropdown-link .sidebar-dropdown-arrow {
            margin-left: auto;
            font-size: 0.7rem;
            opacity: 0.8;
            transition: transform 0.2s ease;
          }
          .sidebar .metismenu li a.sidebar-dropdown-link .sidebar-dropdown-arrow-open {
            transform: rotate(180deg);
          }
        `,
      }} />
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">
            <span className="sidebar-brand_text">360<span>Nepal</span></span>
          </Link>
        </div>
        <div className="sidebar-body">
          <nav className="sidebar-nav">
            <ul className="metismenu">
              <li className="nav-label">
                <span className="nav-label_text">Main Menu</span>
              </li>
              {renderNavItems(navMain)}
              <li className="nav-label">
                <span className="nav-label_text">Account</span>
              </li>
              {renderNavItems(navAccount)}
              <li>
                <Link href="/">
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: "1rem", textAlign: "center", marginRight: "0.75rem" }} />
                  <span>Back to site</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </nav>

      {/* Page Content */}
      <div className="content-wrapper">
        <div className="main-content">
          {/* Top navbar */}
          <nav className="navbar-custom-menu navbar navbar-expand-xl m-0 navbar-transfarent">
            <div className="sidebar-toggle">
              <button
                type="button"
                className="sidebar-toggle-icon"
                id={sidebarCollapseId}
                aria-label="Toggle sidebar"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item dropdown user-menu user-menu-custom">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="profile-element d-flex align-items-center flex-shrink-0 p-0 text-start">
                      <div className="avatar online">
                        <span className="img-fluid rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                          {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="profile-text ms-2">
                        <h6 className="m-0 fw-medium fs-14">{user?.name || "User"}</h6>
                        <span className="small text-muted">{user?.email}</span>
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <div className="user-header p-3">
                      <h6>{user?.name || "User"}</h6>
                      <span className="small text-muted">{user?.email}</span>
                    </div>
                    <Link href="/dashboard/profile" className="dropdown-item">
                      <i className="bi bi-person me-2" />
                      My Profile
                    </Link>
                    <a href="#" className="dropdown-item" onClick={handleSignOut}>
                      <i className="fa-solid fa-right-from-bracket me-2" />
                      Sign Out
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </nav>

          <div className="body-content">
            <div className="container-xxl">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
