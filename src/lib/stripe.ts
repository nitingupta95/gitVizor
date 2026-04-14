'use server'

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil'
});

export async function createCheckoutSession(credits: number) {
    const {userId}= await auth()
    if(!userId) throw new Error('Not authenticated')
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${credits} AI Credits`,
                    },
                    unit_amount: Math.round((credits/50) * 100), // Amount in cents
                },
                quantity: 1,
            },
        ],
        customer_creation:'always',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        client_reference_id: userId.toString(),
        metadata: { 
            credits: credits.toString() 
        },
    })
    return redirect(session.url!)
}
