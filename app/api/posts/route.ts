
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostFilters } from './utils';
import { getUserIdFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const filters = PostFilters(params);

  try {
    const posts = await prisma.post.findMany({
      where: filters,
      include: {
        user: { select: { id: true, name: true } },
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? undefined;
  const userId = getUserIdFromHeader(authHeader);
  if(!userId){
    return NextResponse.json({ error: 'Unauthorized'}, {status: 401});
  }

  try {
    const body = await req.json();
    const { title, content, category } = body;

    if(!title || !content || !category){
      return NextResponse.json({ error: 'Missing fields'}, {status: 400});
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        category,
        userId
      },
    });

    return NextResponse.json({ newPost }, { status: 201 });
  } catch (error) {
    console.error( error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}