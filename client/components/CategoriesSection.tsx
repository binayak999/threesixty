"use client";

import Link from "next/link";
import type { CategoryItem } from "@/server";

const FALLBACK_ICON = "fa-circle";

interface CategoriesSectionProps {
  categories: CategoryItem[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <div className="py-5 bg-light rounded-4 mx-3 mt-3">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-10 col-lg-8 col-xl-7">
            <div className="section-header text-center mb-5" data-aos="fade-down">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">
                Categories
              </div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">
                Global Categories
              </h2>
              <div className="sub-title fs-16">
                Discover exciting categories.{" "}
                <span className="text-primary fw-semibold">Find what you&apos;re looking for.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3 g-lg-4">
            {categories.map((cat) => (
              <div key={cat._id} className="col-sm-6 col-md-4 col-lg-3 col-xl-2 d-flex">
                <div className="border-0 card card-hover company-card flex-fill rounded-3 w-100">
                  <Link href={`/category/${encodeURIComponent(cat.slug)}`} className="stretched-link" />
                  <div className="card-body d-flex flex-column">
                    <div className="text-end mb-4 text-primary">
                      <i className={`fa-solid ${cat.icon || FALLBACK_ICON} fs-2`} />
                    </div>
                    <div className="mt-auto">
                      <h5 className="mb-2">{cat.name}</h5>
                      <div className="small mt-2 d-flex align-items-center gap-2 fw-medium text-primary">
                        <span>Explore Now</span>
                        <i className="fa-solid fa-arrow-up-right-from-square fs-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
