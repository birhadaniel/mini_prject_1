import { Prisma } from '@/lib/generated/prisma';

export function PostFilters(params: URLSearchParams): Prisma.PostWhereInput {
    const filters: Prisma.PostWhereInput = {};

    const search = params.get('search');
    const category = params.get('category');

    if(search){
        filters.OR = [
            { title: { contains: search, mode: 'insensitive'}},
            { content: { contains: search, mode: 'insensitive'}},
        ];
    }

    if(category){
        filters.category = { equals: category, mode: 'insensitive'};
    }

    return filters;
}