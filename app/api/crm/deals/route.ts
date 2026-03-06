import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/lib/supabase'

export async function GET() {
  try {
    const deals = await crmService.getDeals()
    return NextResponse.json(deals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deal = await crmService.createDeal(body)
    return NextResponse.json(deal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
