import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    await prisma.$connect();

    // Get unique search histories with their results
    const searchHistory = await prisma.$transaction(async (tx) => {
      return await tx.searchHistory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        include: {
          searchResults: {
            distinct: ['companyName'], // Add distinct constraint
            include: {
              jobs: true
            }
          }
        }
      });
    });

    await prisma.$disconnect();

    // Clean up any duplicate results
    const cleanedHistory = searchHistory.map(history => ({
      ...history,
      searchResults: Array.from(
        new Map(
          history.searchResults.map(result => [result.companyName, result])
        ).values()
      )
    }));

    return NextResponse.json({ 
      success: true, 
      data: cleanedHistory 
    });

  } catch (error) {
    console.error('Search history error:', error instanceof Error ? error.message : 'Unknown error');
    await prisma.$disconnect();
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const data = await req.json();
    const { searchQuery, searchTime, resultsCount } = data;

    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId,
        searchQuery,
        searchTime,
        resultsCount,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: searchHistory 
    });
  } catch (error) {
    console.error('Search history error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
} 