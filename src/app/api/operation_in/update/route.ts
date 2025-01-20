// app/api/operation_in/update/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { updateInboundAggregates } from './utils';

export async function PUT() {
  const result = await updateInboundAggregates();
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}

