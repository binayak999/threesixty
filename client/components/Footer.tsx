"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: "fa-home" },
  { href: "/about", label: "About Us", icon: "fa-info-circle" },
  { href: "/listings", label: "Listings", icon: "fa-map-location-dot" },
  { href: "/blogs", label: "Blogs", icon: "fa-blog" },
  { href: "/contact", label: "Contact", icon: "fa-envelope" },
];

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

const DEFAULT_CATEGORY_ICON = "fa-folder";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", icon: "fab fa-facebook-f", className: "facebook" },
  { href: "https://twitter.com", label: "Twitter", icon: "fab fa-twitter", className: "twitter" },
  { href: "https://instagram.com", label: "Instagram", icon: "fab fa-instagram", className: "instagram" },
  { href: "https://youtube.com", label: "YouTube", icon: "fab fa-youtube", className: "youtube" },
  { href: "https://wa.me", label: "WhatsApp", icon: "fab fa-whatsapp", className: "whatsapp" },
];

const LEGAL_LINKS = [
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/faq", label: "FAQ" },
] as const;

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch("/api/categories?type=listing&parentOnly=1&publishedOnly=1")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const exploreLinks = [
    { href: "/listings", label: "All Listings", icon: "fa-list" },
    ...categories.map((cat) => ({
      href: `/category/${cat.slug}`,
      label: cat.name,
      icon: cat.icon || DEFAULT_CATEGORY_ICON,
    })),
  ];

  return (
    <>
      <footer className="modern-footer">
        <div className="container">
          <div className="footer-logo-section">
            <Link href="/" className="footer-logo-link">
              <img
                src="/assets/images/logo-white.png"
                alt="360 Nepal"
                className="footer-main-logo"
              />
            </Link>
            <p className="footer-tagline">
              Discover every angle, every story. Your guide to exploring, connecting, and
              thriving in Nepal&apos;s rich cultural landscape.
            </p>
          </div>

          <div className="footer-sections">
            <div className="row g-4 g-lg-5">
              <div className="col-lg-3 col-md-6">
                <div className="footer-section">
                  <h4>Quick Links</h4>
                  <ul className="footer-links">
                    {QUICK_LINKS.map(({ href, label, icon }) => (
                      <li key={href}>
                        <Link href={href}>
                          <i className={`fas ${icon}`} aria-hidden /> {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="footer-section">
                  <h4>Explore</h4>
                  <ul className="footer-links">
                    {exploreLinks.map(({ href, label, icon }) => (
                      <li key={href}>
                        <Link href={href}>
                          <i className={`fas ${icon}`} aria-hidden /> {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="footer-section">
                  <h4>Contact</h4>
                  <address className="footer-contact-info">
                    <div className="contact-item">
                      <span className="contact-icon" aria-hidden><i className="fas fa-map-marker-alt" /></span>
                      <div className="contact-details">
                        <span className="contact-label">Address</span>
                        <p>Kathmandu, Nepal<br />Thamel District</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon" aria-hidden><i className="fas fa-phone" /></span>
                      <div className="contact-details">
                        <span className="contact-label">Phone</span>
                        <p><a href="tel:+97712345678">+977-1-234-5678</a></p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon" aria-hidden><i className="fas fa-envelope" /></span>
                      <div className="contact-details">
                        <span className="contact-label">Email</span>
                        <p><a href="mailto:info@360nepal.com">info@360nepal.com</a></p>
                      </div>
                    </div>
                  </address>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="footer-section newsletter-section">
                  <h4>Stay Updated</h4>
                  <p>Subscribe for the latest updates and travel insights from Nepal.</p>
                  <form
                    className="newsletter-form"
                    onSubmit={(e) => e.preventDefault()}
                    aria-label="Newsletter signup"
                  >
                    <input
                      type="email"
                      className="newsletter-input"
                      placeholder="Your email"
                      aria-label="Email address"
                    />
                    <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                      <i className="fas fa-arrow-right" />
                    </button>
                  </form>
                  <div className="social-links">
                    {SOCIAL_LINKS.map(({ href, label, icon, className }) => (
                      <a
                        key={className}
                        href={href}
                        className={`social-link ${className}`}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className={icon} aria-hidden />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="footer-skyline">
              <img src="/assets/images/footer_back.png" alt="" className="skyline-image" />
            </div>
            <div className="footer-bottom-content">
              <p className="footer-copyright">
                © {currentYear} 360 Nepal. All rights reserved. Made with <span className="footer-heart" aria-hidden>♥</span> in Nepal.
              </p>
              <nav className="footer-nav-links" aria-label="Legal and help">
                {LEGAL_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href}>{label}</Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
