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

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        openaiKey: true,
        googleApiKey: true,
        googleCseId: true
      }
    });

    if (!userData) {
      return NextResponse.json({ 
        success: true, 
        data: {
          openaiKey: null,
          googleApiKey: null,
          googleCseId: null
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: userData 
    });

  } catch (error) {
    console.error('API Keys Error:', error);
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
    const { openaiKey, googleApiKey, googleCseId } = data;

    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        openaiKey: openaiKey || null,
        googleApiKey: googleApiKey || null,
        googleCseId: googleCseId || null,
      },
      create: {
        id: userId,
        email: '',
        openaiKey: openaiKey || null,
        googleApiKey: googleApiKey || null,
        googleCseId: googleCseId || null,
      },
      select: {
        openaiKey: true,
        googleApiKey: true,
        googleCseId: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
} 