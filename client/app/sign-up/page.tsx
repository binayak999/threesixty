import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignUpForm from "./SignUpForm";
import Link from "next/link";

export const metadata = {
  title: "Sign Up - 360Nepal",
  description: "Create your 360Nepal account.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <main className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <h1 className="h3 fw-semibold mb-2">Create Account</h1>
                  <p className="text-body-secondary small mb-4">
                    Join 360Nepal to save listings, write reviews, and more.
                  </p>
                  <SignUpForm />
                  <p className="mt-4 mb-0 text-center small text-body-secondary">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="fw-medium text-decoration-none">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
