import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId,
        searchQuery: data.searchQuery,
        results: data.results,
        resultsCount: data.resultsCount,
        searchTime: data.searchTime,
      },
    });

    return NextResponse.json(searchHistory);
  } catch (error) {
    console.error('Failed to save search:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 