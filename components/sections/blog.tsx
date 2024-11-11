import BlogCard from "@/components/blog-card";
import Section from "@/components/section";
import { getBlogPosts, type BlogPost } from "@/lib/blog";

export default async function BlogSection() {
  const allPosts = await getBlogPosts();

  const articles = allPosts
    .sort((a, b) => {
      return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
    });

  return (
    <Section title="Blog" subtitle="Latest Articles">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((post, idx) => (
          <BlogCard 
            key={post.slug} 
            data={post} 
            priority={idx <= 1} 
          />
        ))}
      </div>
    </Section>
  );
}
