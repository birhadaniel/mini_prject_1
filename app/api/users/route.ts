import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 


export async function GET(){
  try {
    const users = await prisma.user.findMany({
        include: {
            posts: true,
        },
    });
    return NextResponse.json(users, {status: 201});
  } catch (error) {
    console.error(" error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
