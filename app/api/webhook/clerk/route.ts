import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type UserWebhookEvent = {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
      verification: {
        status: string;
        strategy: string;
      };
    }>;
    primary_email_address_id: string;
    [key: string]: any;
  };
  object: string;
  type: string;
};

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Webhook instance with your webhook secret
    const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

    let evt: UserWebhookEvent;

    try {
      // Verify the webhook payload
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as UserWebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error verifying webhook', { status: 400 });
    }

    // Handle the webhook
    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      // Check if email_addresses array exists and has at least one email
      const primaryEmail = evt.data.email_addresses?.[0]?.email_address;
      
      if (!primaryEmail) {
        console.error('No email address found in webhook data');
        return new NextResponse('No email address found', { status: 400 });
      }

      await prisma.user.create({
        data: {
          id: id,
          email: primaryEmail
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
} 