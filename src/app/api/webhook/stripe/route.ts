
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { NextResponse , NextRequest} from 'next/server';
import { db } from '@/server/db';
import { clerkClient } from '@clerk/nextjs/server';

const stripe= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil'
});

export async function POST(req: Request) {
    const body= await req.text();
    const signature= req.headers.get('stripe-signature')!;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        return NextResponse.json({error: 'Invalid signature verification failed.'}, {status: 400});
    }
    const session= event.data.object as Stripe.Checkout.Session;
    console.log('Event type', event.type);
    if(event.type==='checkout.session.completed'){
        const userId= session.client_reference_id!;
        const credits= session.metadata?.credits!;
        if(!userId || !credits){
            return NextResponse.json({error: 'Missing user ID or credits in session.'}, {status: 400});
        }

        // Ensure user exists in the database
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);
            await db.user.create({
                data: {
                    id: userId,
                    emailAddress: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    imageUrl: clerkUser.imageUrl,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                }
            });
        }

        await db.stripeTransaction.create({
            data: {
                userId: userId,
                credits: parseInt(credits)
            }
        });
        await db.user.update({
            where: {id: userId},
            data: {
                credits: {
                    increment: Number(credits)
                }
            }
        });
        return NextResponse.json({message: 'Credits added Successfully'}, {status: 200});
         
    }
    return NextResponse.json({message: 'hello world'}, {status: 200});
}