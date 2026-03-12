import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Link from "next/link";

export const metadata = {
  title: "Forgot Password - 360Nepal",
  description: "Reset your 360Nepal account password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <h1 className="h3 fw-semibold mb-2">Forgot password?</h1>
                  <p className="text-body-secondary small mb-4">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                  <ForgotPasswordForm />
                  <p className="mt-4 mb-0 text-center small text-body-secondary">
                    Remember your password?{" "}
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
