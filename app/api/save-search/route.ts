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
        resultsCount: data.resultsCount,
        searchTime: data.searchTime,
        searchResults: {
          create: data.results.map((result: any) => ({
            companyName: result.companyName,
            careerPageUrl: result.careerPageUrl || null,
            jobs: {
              create: (result.jobs || []).map((job: any) => ({
                userId,
                title: job.title,
                location: job.location,
                description: job.description,
                applicationUrl: job.applicationUrl,
                requirements: job.requirements || null,
                additionalInfo: job.additionalInfo || null
              }))
            }
          }))
        }
      },
      include: {
        searchResults: {
          include: {
            jobs: true
          }
        }
      }
    });

    return NextResponse.json(searchHistory);
  } catch (error) {
    console.error('Failed to save search:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 