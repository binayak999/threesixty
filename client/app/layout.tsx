import type { Metadata } from "next";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { buildOrganization, buildWebSite } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  title: "360Nepal - Discover Every Angle, Every Story : Explore, Connect, Thrive",
  description:
    "Your ultimate guide to exploring, connecting, and thriving in Nepal's rich cultural landscape.",
  icons: {
    icon: "/assets/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getSiteBaseUrl();
  const organization = buildOrganization(baseUrl);
  const webSite = buildWebSite(baseUrl);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={[organization, webSite]} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = typeof document !== 'undefined' && localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-bs-theme', t);
              })();
            `,
          }}
        />
        <link href="/assets/plugins/aos/aos.min.css" rel="stylesheet" />
        <link href="/assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/assets/plugins/fontawesome/css/all.min.css" rel="stylesheet" />
        <link href="/assets/plugins/OwlCarousel2/css/owl.carousel.min.css" rel="stylesheet" />
        <link href="/assets/plugins/OwlCarousel2/css/owl.theme.default.min.css" rel="stylesheet" />
        <link href="/assets/plugins/jquery-fancyfileuploader/fancy-file-uploader/fancy_fileupload.css" rel="stylesheet" />
        <link href="/assets/plugins/ion.rangeSlider/ion.rangeSlider.min.css" rel="stylesheet" />
        <link href="/assets/plugins/magnific-popup/magnific-popup.css" rel="stylesheet" />
        <link href="/assets/plugins/select2/select2.min.css" rel="stylesheet" />
        <link href="/assets/plugins/select2-bootstrap-5/select2-bootstrap-5-theme.min.css" rel="stylesheet" />
        <link href="/assets/css/style.css" rel="stylesheet" />
        <link href="/assets/css/custom.css" rel="stylesheet" />
        <link href="/assets/css/footer.css" rel="stylesheet" />
        <link href="/assets/css/pannellum.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script src="/assets/plugins/jQuery/jquery.min.js" strategy="beforeInteractive" />
        <Script src="/assets/plugins/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/assets/plugins/aos/aos.min.js" strategy="afterInteractive" />
        <Script src="/assets/plugins/macy/macy.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/simple-parallax/simpleParallax.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/OwlCarousel2/owl.carousel.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/theia-sticky-sidebar/ResizeSensor.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/theia-sticky-sidebar/theia-sticky-sidebar.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/waypoints/jquery.waypoints.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/counter-up/jquery.counterup.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/ion.rangeSlider/ion.rangeSlider.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/magnific-popup/jquery.magnific-popup.min.js" strategy="lazyOnload" />
        <Script src="/assets/plugins/select2/select2.min.js" strategy="lazyOnload" />
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB4iuUg1YDRIBRZ5e-jdssfqDuT9VLiOnY"
          strategy="afterInteractive"
        />
        <Script src="/assets/js/script.js" strategy="lazyOnload" />
        <Script src="/assets/js/listing-map.js" strategy="lazyOnload" />
        {/* pannellum.js is loaded only by HeroSection when a 360° banner is shown — avoids blocking initial load */}
        <div
          id="toTopMount"
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 99999,
            pointerEvents: "none",
          }}
        />
      </body>
    </html>
  );
}
