import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="py-5">
        <div className="container">
          <h1 className="display-5 fw-semibold mb-4">Contact Us</h1>
          <p className="lead">Get in touch with the 360Nepal team.</p>
          <p>Kathmandu, Nepal — Thamel District</p>
          <p>Email: info@360nepal.com | Phone: +977-1-234-5678</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
