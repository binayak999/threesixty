import Link from "next/link";

export default function BlogSection() {
  return (
    <div className="py-5 position-relative overflow-hidden bg-light">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Explore Latest Insights</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Stay updated with the newest posts across all categories.</h2>
              <div className="sub-title fs-16">Explore the freshest content in Travel, Technology, Health, Food, and more. <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span></div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-5 col-12 mb-lg-0 mb-4">
            <article className="card h-100 border-0 shadow-sm">
              <div className="position-relative">
                <Link href="/blogs" className="position-absolute top-0 start-0 w-100 h-100" aria-label="Read more" />
                <div className="card-img-top overflow-hidden position-relative">
                  <img src="/assets/images/blog/02-lg.jpg" className="card-img-top image-zoom-hover" alt="" />
                </div>
              </div>
              <div className="card-body pb-4">
                <div className="hstack gap-3 mb-3">
                  <span className="fs-sm small text-muted">9 hours ago</span>
                  <span className="opacity-25">|</span>
                  <Link className="badge border fw-semibold text-primary bg-white" href="/blogs">Events</Link>
                </div>
                <h3 className="fs-4 fw-semibold mb-0 post-title">
                  <Link href="/blogs">Etiam Dapibus Metus Aliquam Orci Venenatis, Suscipit Efficitur.</Link>
                </h3>
              </div>
              <div className="card-footer py-4">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <img src="/assets/images/avatar/01.jpg" className="rounded-circle" width={48} height={48} alt="Avatar" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <span className="fst-italic text-muted">By</span> <span className="fw-medium">Ethan Blackwood</span>
                    <small className="text-muted d-block">Engineer</small>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div className="col">
            <article className="card overflow-hidden mb-4 border-0 shadow-sm">
              <div className="row g-0">
                <div className="col-sm-5 position-relative">
                  <div className="h-100 overflow-hidden position-relative start-0 top-0 w-100">
                    <img src="/assets/images/blog/01-sm.jpg" alt="" className="h-100 image-zoom-hover object-fit-cover w-100" />
                  </div>
                  <Link href="/blogs" className="position-absolute top-0 start-0 w-100 h-100" aria-label="Read more" />
                </div>
                <div className="col-sm-7">
                  <div className="card-body">
                    <div className="hstack gap-3 mb-3">
                      <span className="fs-sm small text-muted">9 hours ago</span>
                      <span className="opacity-25">|</span>
                      <Link className="badge border fw-semibold text-primary bg-white" href="/blogs">Events</Link>
                    </div>
                    <h3 className="h5 fw-semibold post-title">
                      <Link href="/blogs">Etiam in lorem malesuada, gravida felis in, pretium lacus.</Link>
                    </h3>
                    <hr className="my-4" />
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <img src="/assets/images/avatar/02.jpg" className="rounded-circle" width={48} height={48} alt="Avatar" />
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <span className="fst-italic text-muted">By</span> <span className="fw-medium">Alexander Kaminski</span>
                        <small className="text-muted d-block">Engineer</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            <article className="card overflow-hidden border-0 shadow-sm">
              <div className="row g-0">
                <div className="col-sm-5 position-relative">
                  <div className="h-100 overflow-hidden position-relative start-0 top-0 w-100">
                    <img src="/assets/images/blog/02-sm.jpg" alt="" className="h-100 image-zoom-hover object-fit-cover w-100" />
                  </div>
                  <Link href="/blogs" className="position-absolute top-0 start-0 w-100 h-100" aria-label="Read more" />
                </div>
                <div className="col-sm-7">
                  <div className="card-body">
                    <div className="hstack gap-3 mb-3">
                      <span className="fs-sm small text-muted">Oct 02, 2023</span>
                      <span className="opacity-25">|</span>
                      <Link className="badge border fw-semibold text-primary bg-white" href="/blogs">Events</Link>
                    </div>
                    <h3 className="h5 fw-semibold post-title">
                      <Link href="/blogs">Ut ut velit et eros gravida rutrum at sit amet ligula.</Link>
                    </h3>
                    <hr className="my-4" />
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <img src="/assets/images/avatar/04.jpg" className="rounded-circle" width={48} height={48} alt="Avatar" />
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <span className="fst-italic text-muted">By</span> <span className="fw-medium">Pranoti Deshpande</span>
                        <small className="text-muted d-block">Engineer</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div className="col-12 mt-4 pt-lg-4 pt-3 text-center">
          <Link href="/blogs" className="btn btn-lg btn-primary">More blog posts</Link>
        </div>
      </div>
    </div>
  );
}
