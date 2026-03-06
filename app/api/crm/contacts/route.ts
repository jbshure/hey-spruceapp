import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/lib/supabase'

export async function GET() {
  try {
    const contacts = await crmService.getContacts()
    return NextResponse.json(contacts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contact = await crmService.createContact(body)
    return NextResponse.json(contact, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
