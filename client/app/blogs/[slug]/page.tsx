import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { fetchBlogBySlug } from "@/lib/fetchBlogBySlug";
import { getMediaUrl } from "@/lib/mediaUrl";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { buildBlogPosting } from "@/lib/schema";
import BlogPostContent from "./BlogPostContent";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);
  if (blog && blog.slug && blog.slug !== slug) {
    redirect(`/blogs/${blog.slug}`);
  }
  const baseUrl = getSiteBaseUrl();
  let blogSchema: object | null = null;
  if (blog) {
    const featureMedia = blog.medias?.find((m) => m.role === "feature")?.media;
    const imageUrl = featureMedia?.url ? getMediaUrl(featureMedia.url) : undefined;
    const absImage = imageUrl?.startsWith("http") ? imageUrl : baseUrl && imageUrl ? `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}` : imageUrl;
    blogSchema = buildBlogPosting(baseUrl, {
      headline: blog.title,
      description: blog.excerpt,
      slug: blog.slug,
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt || blog.publishedAt,
      image: absImage,
      author: blog.user?.name || blog.user?.email,
    });
  }
  return (
    <>
      {blogSchema && <JsonLd data={blogSchema} />}
      <Navbar />
      <main>
        <BlogPostContent slug={slug} />
      </main>
      <Footer />
    </>
  );
}
