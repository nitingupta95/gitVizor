
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { NextResponse , NextRequest} from 'next/server';
import { db } from '@/server/db';
import { clerkClient } from '@clerk/nextjs/server';

console.log('>>> [Route Handler] Stripe Webhook Route File Loaded');

const stripe= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil'
});

export async function POST(req: Request) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;
    let event: Stripe.Event;

    try {
        if (!endpointSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.');
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            endpointSecret
        );
        console.log(`>>> Stripe Webhook: Verified Event Type: ${event.type}`);
    } catch (error: any) {
        console.error('❌ Stripe Webhook Signature Verification Failed:', error.message);
        return NextResponse.json({ error: 'Invalid signature verification', details: error.message }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.client_reference_id;
        const creditsString = session.metadata?.credits;

        if (!userId || !creditsString) {
            console.error('❌ Missing userId or credits in session object');
            return NextResponse.json({ error: 'Missing session data' }, { status: 400 });
        }

        const credits = Math.floor(Number(creditsString));
        
        try {
            await db.$connect();
            let userEmail = "";
            let clerkUserRecord;

            try {
                const client = await clerkClient();
                clerkUserRecord = await client.users.getUser(userId);
                userEmail = clerkUserRecord.emailAddresses[0]?.emailAddress ?? "";
            } catch (clerkErr: any) {
                console.warn(`⚠️ Clerk lookup failed for ${userId}: ${clerkErr.message}`);
                const existingUser = await db.user.findUnique({ where: { id: userId } });
                if (!existingUser) throw new Error(`User ${userId} not found in Clerk or DB`);
                userEmail = existingUser.emailAddress;
            }

            console.log(`>>> Processing Credit Transaction: ${userEmail} (+${credits} credits)`);

            let attempts = 0;
            const maxAttempts = 3;
            while (attempts < maxAttempts) {
                try {
                    await db.$transaction([
                        db.user.upsert({
                            where: { id: userId },
                            update: { emailAddress: userEmail },
                            create: {
                                id: userId,
                                emailAddress: userEmail,
                                imageUrl: clerkUserRecord?.imageUrl ?? "",
                                firstName: clerkUserRecord?.firstName ?? "",
                                lastName: clerkUserRecord?.lastName ?? "",
                            }
                        }),
                        db.stripeTransaction.create({
                            data: { userId, credits }
                        }),
                        db.user.update({
                            where: { id: userId },
                            data: { credits: { increment: credits } }
                        })
                    ]);
                    break;
                } catch (err: any) {
                    attempts++;
                    console.warn(`⚠️ DB Attempt ${attempts} failed: ${err.message}`);
                    if (attempts >= maxAttempts) throw err;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`✅ SUCCESS: ${credits} Credits added to user ${userId}`);
            return NextResponse.json({ message: 'Credits added successfully' }, { status: 200 });
        } catch (dbError: any) {
            console.error('❌ OPERATION FAILED:', dbError.message);
            return NextResponse.json({ error: 'Operation failed', details: dbError.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
}
