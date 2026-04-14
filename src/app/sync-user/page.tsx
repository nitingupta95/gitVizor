import React from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation';
import { db } from '@/server/db';  
const SyncUser = async() => {
    const {userId}= await auth();
    if(!userId){
        throw new Error('user not found');
    }
    const client= await clerkClient();
    const user= await client.users.getUser(userId);
    if(!user.emailAddresses[0]?.emailAddress){
        return notFound()
    } 
    try {
        console.log(`Syncing user: ${user.emailAddresses[0]?.emailAddress}`);
        await db.user.upsert({
            where: {
                id: userId
            },
            update:{
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName:user.lastName
            },
            create:{
                id:userId,
                emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName:user.lastName 
            }
        })
        console.log('User synced successfully');
    } catch (error: any) {
        console.error('Error syncing user:', error.message);
        // If it's a unique constraint error, it means the email already exists with a different ID
        if (error.code === 'P2002') {
            console.error('Unique constraint violation on emailAddress during sync-user.');
        }
        throw error;
    }
    return redirect('/dashboard')
}

export default SyncUser