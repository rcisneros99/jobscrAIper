export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} JobScrAIper. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 