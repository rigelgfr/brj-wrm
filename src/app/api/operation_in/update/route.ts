// app/api/operation_in/update/route.ts
import { NextResponse } from 'next/server';
import { updateInboundAggregates } from './utils';

export async function PUT() {
  const result = await updateInboundAggregates();
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

export const dynamic = 'force-dynamic';