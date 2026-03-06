import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/lib/supabase'

export async function GET() {
  try {
    const companies = await crmService.getCompanies()
    return NextResponse.json(companies)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const company = await crmService.createCompany(body)
    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
