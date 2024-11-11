import { getBlogPosts } from "@/lib/blog";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/sections/footer";

export default async function Blog() {
  const allPosts = await getBlogPosts();

  const articles = allPosts
    .sort((a, b) => {
      return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
    });

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="overflow-hidden group cursor-pointer">
                <div className="aspect-video relative">
                  <Image
                    src={post.metadata.image || '/blog-placeholder.jpg'}
                    alt={post.metadata.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {post.metadata.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {post.metadata.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{post.metadata.author}</span>
                    <span className="text-muted-foreground">
                      {new Date(post.metadata.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
