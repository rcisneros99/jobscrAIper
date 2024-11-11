import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type UserWebhookEvent = WebhookEvent & {
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
  };
};

type ValidationResult = {
  success: boolean;
  message?: string;
  status?: number;
  event?: UserWebhookEvent;
};

async function validateRequest(req: Request): Promise<ValidationResult> {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return { success: false, message: 'Missing svix headers', status: 400 };
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  try {
    const event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as UserWebhookEvent;

    return {
      success: true,
      event
    };
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return { success: false, message: 'Error verifying webhook', status: 400 };
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequest(req);
    
    if (!validation.success || !validation.event) {
      return new NextResponse(
        validation.message || 'Validation failed', 
        { status: validation.status || 400 }
      );
    }

    const evt = validation.event;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id } = evt.data;
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