import { BlogPost } from "@/lib/blog";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  data: BlogPost;
  priority?: boolean;
}

export default function BlogCard({ data, priority = false }: BlogCardProps) {
  const { metadata, slug } = data;
  
  return (
    <Link href={`/blog/${slug}`}>
      <Card className="overflow-hidden group cursor-pointer">
        <div className="aspect-video relative">
          <Image
            src={metadata.image || '/blog-placeholder.jpg'}
            alt={metadata.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
            {metadata.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {metadata.summary}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{metadata.author}</span>
            <span className="text-muted-foreground">
              {new Date(metadata.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
