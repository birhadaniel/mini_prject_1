
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    const comments = await prisma.comment.findMany({
        where: postId ? { postId: parseInt(postId) } : {},
        include: {
            user: { select: { id: true, name: true} },
            post: { select: { id: true, title: true}},
        },
        orderBy: { createdAt: 'desc'},
    });
    return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const body = await req.json();
    const {  content, postId } = body;

    if (!content || !postId) {
      return NextResponse.json({ error: 'Content and postId required' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        userId: decoded.userId,
        postId: parseInt(postId),
      },
    });

    return NextResponse.json({ message: 'Comment created', comment: newComment }, { status: 201 });
  } catch (error) {
    console.error( error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }
}