import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default async function SearchHistoryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const searchHistory = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });

  const downloadHistory = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Search History</h1>
        <Button onClick={() => downloadHistory(searchHistory)}>
          <Download className="mr-2 h-4 w-4" />
          Download History
        </Button>
      </div>

      <div className="space-y-6">
        {searchHistory.map((search) => (
          <Card key={search.id}>
            <CardHeader>
              <CardTitle>
                Search on {new Date(search.timestamp).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Search Parameters</h3>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                    {JSON.stringify(search.searchQuery, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Results</h3>
                  <p>Found {search.resultsCount} jobs in {search.searchTime?.toFixed(2)}s</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => downloadHistory(search)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download This Search
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 