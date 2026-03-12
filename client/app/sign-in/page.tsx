import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignInForm from "./SignInForm";
import Link from "next/link";

export const metadata = {
  title: "Sign In - 360Nepal",
  description: "Sign in to your 360Nepal account.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <h1 className="h3 fw-semibold mb-2">Sign In</h1>
                  <p className="text-body-secondary small mb-4">
                    Welcome back. Sign in to access your account.
                  </p>
                  <SignInForm />
                  <p className="mt-4 mb-0 text-center small text-body-secondary">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="fw-medium text-decoration-none">
                      Sign up
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
