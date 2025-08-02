import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromHeader } from '@/lib/auth';
import bcrypt from 'bcryptjs';

type UpdateUserData = {
  name?: string;
  password?: string;
};


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = Number(params.id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            comments: {
              include: {
                user: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest,{ params }: { params: { id: string}}){
   const authHeader = req.headers.get('authorization') ?? undefined;
  const userIdToken = getUserIdFromHeader(authHeader);

  if(!userIdToken){
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userIdParams = parseInt(params.id);
   if (isNaN(userIdParams)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

    if (userIdToken !== userIdParams) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, password } = body;
    const dataUpdate: UpdateUserData = {};

    
    if (name !== undefined) dataUpdate.name = name;

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataUpdate.password = hashedPassword;
    }

    const updateUser = await prisma.user.update({
      where: { id: userIdParams },
      data: dataUpdate,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updateUser);

  } catch (error) {
    console.error('Error updating user', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}