import Link from "next/link";

const CATEGORIES = [
  { title: "Travel", icon: "fa-plane", img: "/assets/images/locations/01.jpg", count: "42 Articles", read: "~5 min read", category: "travel" },
  { title: "Food & Dining", icon: "fa-utensils", img: "/assets/images/place/17.jpg", count: "28 Articles", read: "~4 min read", category: "food" },
  { title: "Technology", icon: "fa-laptop-code", img: "/assets/images/place/20.jpg", count: "35 Articles", read: "~6 min read", category: "technology" },
  { title: "Lifestyle", icon: "fa-heart", img: "/assets/images/about/01.jpg", count: "31 Articles", read: "~4 min read", category: "lifestyle" },
  { title: "Business", icon: "fa-briefcase", img: "/assets/images/place/22.jpg", count: "19 Articles", read: "~7 min read", category: "business" },
  { title: "Health & Wellness", icon: "fa-heartbeat", img: "/assets/images/place/19.jpg", count: "24 Articles", read: "~5 min read", category: "health" },
];

export default function BlogCategoriesSection() {
  return (
    <div className="py-5 bg-light">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="section-header text-center mb-5">
              <div className="d-inline-block font-caveat fs-1 fw-medium section-header__subtitle text-capitalize text-primary">Explore by Category</div>
              <h2 className="display-5 fw-semibold mb-3 section-header__title text-capitalize">Discover Your Next Read</h2>
              <div className="sub-title fs-16">Dive into our popular categories and find the stories that matter to you.</div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="col-md-6 col-lg-4">
              <div className="blog-category-card" data-category={cat.category} style={{ backgroundImage: `url('${cat.img}')` }}>
                <Link href="/blogs" className="category-link">
                  <div className="category-content">
                    <div className="category-icon">
                      <i className={`fas ${cat.icon} text-white fs-2 mb-3`} />
                    </div>
                    <div className="category-title">{cat.title}</div>
                    <div className="category-stats">
                      <span className="article-count">{cat.count}</span>
                      <span className="read-time">{cat.read}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
