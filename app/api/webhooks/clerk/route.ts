import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const webhookSecret = process.env.WEBHOOK_SECRET || '';

async function validateRequest(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return null;
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);
  return wh.verify(body, {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  }) as WebhookEvent;
}

export async function POST(req: Request) {
  try {
    const evt = await validateRequest(req);
    if (!evt) {
      return new Response('Invalid signature', { status: 400 });
    }

    if (evt.type === 'user.created') {
      const { id, email_addresses } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';

      await prisma.user.create({
        data: {
          id: id as string,
          email: email,
          openaiKey: null,
          googleApiKey: null,
          googleCseId: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User created successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
} 