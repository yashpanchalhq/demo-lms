import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Type definition for user data
type UserData = {
  clerkId: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  createdAt?: string;
  updatedAt?: string;
};

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, public_metadata } = evt.data;

    let role: 'ADMIN' | 'TEACHER' = 'TEACHER'; // Default role
    const incomingRole = public_metadata?.role;

    if (incomingRole === 'ADMIN' || incomingRole === 'TEACHER') {
      role = incomingRole;
    }

    // Fix 1: Add timestamps and ensure proper typing
    const userData: UserData = {
      clerkId: clerkId,
      email: email_addresses[0]?.email_address || '',
      role: role,
      ...(eventType === 'user.created' && { createdAt: new Date().toISOString() }),
      updatedAt: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();

    // Fix 2: Add null check for supabase client
    if (!supabase) {
      console.error('Supabase client is not available');
      return new NextResponse('Database connection error', { status: 500 });
    }

    try {
      // Fix 3: Use type assertion and better error handling
      const { data, error } = await supabase
        .from('User')
        .upsert(userData as any, { onConflict: 'clerkId' });

      if (error) {
        console.error('Error upserting user from webhook:', error);
        return new NextResponse('Error upserting user', { status: 500 });
      }

      console.log(`Successfully ${eventType === 'user.created' ? 'created' : 'updated'} user:`, clerkId);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return new NextResponse('Database operation failed', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}