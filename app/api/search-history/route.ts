import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const searchHistory = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        searchResults: {
          include: {
            jobs: true
          }
        }
      }
    });

    if (!searchHistory) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: searchHistory.map(search => ({
        id: search.id,
        searchQuery: search.searchQuery,
        timestamp: search.timestamp,
        searchTime: search.searchTime,
        resultsCount: search.resultsCount,
        searchResults: search.searchResults?.map(result => ({
          id: result.id,
          companyName: result.companyName,
          jobs: result.jobs
        })) || []
      }))
    });

  } catch (error) {
    console.error('Search history error:', error);
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