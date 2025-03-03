// app/api/operation_in/update/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { updateOutboundAggregates } from './utils';

export async function PUT() {
  const result = await updateOutboundAggregates();
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
