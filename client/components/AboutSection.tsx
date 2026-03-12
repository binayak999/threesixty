import Link from "next/link";

export default function AboutSection() {
  return (
    <div className="bg-primary bg-size-contain home-about js-bg-image js-bg-image-lines bg-light mx-3 rounded-4 position-relative pt-5" data-image-src="/assets/images/lines.svg">
      <div className="container pt-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">About Us</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Discover Every Angle, Every Story — Explore, Connect, Thrive.</h2>
              <div className="sub-title fs-16">360 Nepal is your gateway to the heart of Nepal. From vibrant culture and delicious cuisine to trusted local businesses, immersive 360° visuals, and rich blogs, we bring Nepal&apos;s true spirit to your screen. <span className="text-primary fw-semibold">Explore more, connect deeper, and thrive with every click.</span></div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="column-text-box left">
              <p><span className="float-start important-text mb-2 me-2 position-relative text-primary fs-50"><strong>W</strong></span>elcome to 360 Nepal, your ultimate gateway to the heart of Nepal. We&apos;re passionate about showcasing the vibrant culture, delicious cuisine, and rich heritage of our beautiful country.</p>
              <p>Our platform connects you with trusted local businesses, from hidden restaurants to boutique hotels, ensuring you experience the authentic Nepal.</p>
              <blockquote className="about-blockquote display-6 font-caveat fst-italic my-3">Immersive 360° visuals and rich blogs bring Nepal&apos;s true spirit to your screen.</blockquote>
              <p>Whether you&apos;re planning a trip or exploring from afar, 360 Nepal offers an unparalleled digital experience. Explore more, connect deeper, and thrive with every click.</p>
            </div>
          </div>
          <div className="col-md-6 ps-xxl-5">
            <div className="ps-xl-4 position-relative">
              <div className="row g-3">
                <div className="col-6">
                  <div className="about-image-wrap mb-3 rounded-4">
                    <img src="/assets/images/about/01.jpg" alt="" className="h-100 w-100 object-fit-cover about-image-one rounded-3" />
                  </div>
                  <div className="about-image-wrap rounded-4">
                    <img src="/assets/images/about/02.jpg" alt="" className="h-100 w-100 object-fit-cover about-image-two rounded-3" />
                  </div>
                </div>
                <div className="col-6">
                  <div className="about-image-wrap mb-3 rounded-4">
                    <img src="/assets/images/about/03.jpg" alt="" className="h-100 w-100 object-fit-cover about-image-three rounded-3" />
                  </div>
                  <div className="about-image-wrap rounded-4">
                    <img src="/assets/images/about/04.jpg" alt="" className="h-100 w-100 object-fit-cover about-image-four rounded-3" />
                  </div>
                </div>
              </div>
              <img src="/assets/images/png-img/about-shape-1.png" alt="About Shape" className="banner-shape-one position-absolute" />
              <img src="/assets/images/png-img/about-shape-2.png" alt="About Shape" className="banner-shape-two position-absolute" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
