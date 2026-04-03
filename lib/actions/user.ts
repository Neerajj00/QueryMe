"use server";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "../prisma";

export async function syncUser(){
    try {
        const user = await currentUser();
        if(!user) return;

        const existingUser = await prisma.user.findUnique({
            where:{
                clerkId: user.id
            }
        })
        if(existingUser) return;
        
        const dbUser = await prisma.user.create({
            data:{
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || "",
                name:user.firstName || "User",
                role: process.env.ADMIN_EMAIL === user.emailAddresses[0]?.emailAddress ? "admin" : "user",
            }
        })
        
        return dbUser;


    } catch (error) {
        console.log("Error syncing user:", error);
    }

}