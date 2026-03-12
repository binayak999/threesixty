"use client";

import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import { useAboutPageData } from "./AboutPageDataContext";

export default function AboutContent() {
  const { bannerUrl, heroTitle, heroSubtitle } = useAboutPageData();
  return (
    <>
      <Navbar />
      {/* Page header */}
      <section className="dark-overlay hero mx-3 overflow-hidden position-relative py-4 py-lg-5 rounded-4 text-white">
        <img className="bg-image" src={bannerUrl} alt="" />
        <div className="container overlay-content py-5">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-10 col-lg-10">
              <div className="section-header text-center" data-aos="fade-down">
                <div className="bg-primary d-inline-block fs-14 mb-3 px-4 py-2 rounded-5 sub-title">
                  {heroSubtitle}
                </div>
                <h2 className="display-4 fw-semibold mb-3 section-header__title text-capitalize">
                  {heroTitle}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <div className="container">
        <div className="achievements-wrapper ms-auto me-auto">
          <div
            className="bg-center js-bg-image bg-cover bg-light counter-content_about position-relative rounded-4"
            data-image-src="/assets/images/pattern.svg"
          >
            <div className="g-4 justify-content-center row">
              <div className="col-sm-6 col-xl-3 text-center">
                <div className="display-5 fw-semibold numscroller text-primary">
                  <span className="counter">3,000 </span>+
                </div>
                <h5 className="fs-18 mb-0 mt-3">Listings posted</h5>
              </div>
              <div className="col-sm-6 col-xl-3 text-center">
                <div className="display-5 fw-semibold numscroller text-primary">
                  <span className="counter">2,500 </span>+
                </div>
                <h5 className="fs-18 mb-0 mt-3">Happy visitors</h5>
              </div>
              <div className="col-sm-6 col-xl-3 text-center">
                <div className="display-5 fw-semibold numscroller text-primary">
                  <span className="counter">10</span>M +
                </div>
                <h5 className="fs-18 mb-0 mt-3">Monthly visits</h5>
              </div>
              <div className="col-sm-6 col-xl-3 text-center">
                <div className="display-5 fw-semibold numscroller text-primary">
                  <span className="counter">593 </span>+
                </div>
                <h5 className="fs-18 mb-0 mt-3">Verified places</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About section – same content as home */}
      <AboutSection />
    </>
  );
}
