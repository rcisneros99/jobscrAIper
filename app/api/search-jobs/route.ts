import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.openaiKey || !user?.googleApiKey || !user?.googleCseId) {
      return NextResponse.json({ error: 'Missing API keys' }, { status: 400 });
    }

    const data = await req.json();
    const { position, location, industry, numResults = 2 } = data;
    const searchStartTime = Date.now();

    const scriptPath = path.join(process.cwd(), 'scripts', 'job_scraper.py');
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--position', position,
      '--location', location,
      '--industry', industry,
      '--num_results', numResults.toString(),
      '--openai_api_key', user.openaiKey,
      '--google_api_key', user.googleApiKey,
      '--google_cse_id', user.googleCseId,
      '--text_only'
    ]);

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Create search history entry
    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId,
        searchQuery: { position, location, industry, numResults },
        timestamp: new Date(),
        searchTime: 0,
        resultsCount: 0
      }
    });

    pythonProcess.stdout.on('data', async (data) => {
      const output = data.toString();
      try {
        if (output.includes('"type":')) {
          const jsonData = JSON.parse(output);
          
          if (jsonData.type === 'companies_list') {
            // Forward companies list to frontend
            await writer.write(encoder.encode(`data: ${JSON.stringify(jsonData)}\n\n`));
          }
          else if (jsonData.type === 'progress_update') {
            const { company_id, status, jobs } = jsonData;
            
            if (jobs && Array.isArray(jobs)) {
              // Create search result entry
              const searchResult = await prisma.searchResult.create({
                data: {
                  searchHistoryId: searchHistory.id,
                  companyName: jobs[0]["Company Name"],
                  careerPageUrl: jobs[0]["Company Website"] || null,
                  jobs: {
                    create: jobs.map(job => ({
                      title: job["Job Title"],
                      location: job.Location,
                      description: job["Job Description"],
                      applicationUrl: job["Application Link"],
                      requirements: job["Required Certifications"],
                      additionalInfo: { details: job["Additional Details"] }
                    }))
                  }
                }
              });
            }

            // Forward progress update to frontend
            await writer.write(encoder.encode(`data: ${JSON.stringify(jsonData)}\n\n`));
          }
        }
      } catch (e) {
        console.error('Error processing output:', e);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });

    pythonProcess.on('close', async (code) => {
      // Update search history with final stats
      await prisma.searchHistory.update({
        where: { id: searchHistory.id },
        data: {
          searchTime: (Date.now() - searchStartTime) / 1000,
          resultsCount: (await prisma.job.count({
            where: { searchResult: { searchHistoryId: searchHistory.id } }
          }))
        }
      });

      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Search jobs error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute search',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';