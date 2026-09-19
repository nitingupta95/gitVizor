
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { NextResponse , NextRequest} from 'next/server';
import { db } from '@/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';



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
        logger.info(`>>> Stripe Webhook: Verified Event Type: ${event.type}`);
    } catch (error: any) {
        logger.error({ err: error }, '❌ Stripe Webhook Signature Verification Failed');
        return NextResponse.json({ error: 'Invalid signature verification', details: error.message }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.client_reference_id;
        const creditsString = session.metadata?.credits;

        if (!userId || !creditsString) {
            logger.error({ userId, creditsString }, '❌ Missing userId or credits in session object');
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
                logger.warn({ userId, err: clerkErr }, `⚠️ Clerk lookup failed`);
                const existingUser = await db.user.findUnique({ where: { id: userId } });
                if (!existingUser) throw new Error(`User ${userId} not found in Clerk or DB`);
                userEmail = existingUser.emailAddress;
            }

            logger.info({ userEmail, credits }, `>>> Processing Credit Transaction`);

            let attempts = 0;
            const maxAttempts = 3;
            while (attempts < maxAttempts) {
                try {
                    await db.$transaction([
                        db.user.upsert({
                            where: { id: userId },
                            update: { 
                                emailAddress: userEmail,
                                credits: { increment: credits }
                            },
                            create: {
                                id: userId,
                                emailAddress: userEmail,
                                imageUrl: clerkUserRecord?.imageUrl ?? "",
                                firstName: clerkUserRecord?.firstName ?? "",
                                lastName: clerkUserRecord?.lastName ?? "",
                                credits: 150 + credits,
                            }
                        }),
                        db.stripeTransaction.create({
                            data: { userId, credits }
                        })
                    ]);
                    break;
                } catch (err: any) {
                    attempts++;
                    logger.warn({ attempts, err }, `⚠️ DB Attempt failed`);
                    if (attempts >= maxAttempts) throw err;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            logger.info({ userId, credits }, `✅ SUCCESS: Credits added`);
            return NextResponse.json({ message: 'Credits added successfully' }, { status: 200 });
        } catch (dbError: any) {
            logger.error({ err: dbError }, '❌ OPERATION FAILED');
            return NextResponse.json({ error: 'Operation failed', details: dbError.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
}
