import { createClient } from '@supabase/supabase-js'

// Supabase client for shared CRM (ee-mercantile project)
// Firebase remains the primary auth/data layer for GroundOps operations.
// Supabase is used only for the shared CRM (contacts, companies, deals).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Ground Ops org ID in the shared CRM
export const GROUND_OPS_ORG_ID = '00000000-0000-0000-0000-000000000002'

// Shared CRM types
export interface CrmCompany {
  id: string
  name: string
  domain?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  industry?: string
  owner_id?: string
  org_id?: string
  lifecycle_stage?: string
  account_tier?: string
  props?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CrmContact {
  id: string
  email: string
  first_name?: string
  last_name?: string
  job_title?: string
  phone?: string
  mobile_phone?: string
  company_id?: string
  owner_id?: string
  org_id?: string
  lifecycle_stage?: string
  lead_status?: string
  tags?: string[]
  props?: any
  created_at: string
  updated_at: string
  deleted_at?: string
  company?: CrmCompany
}

export interface CrmDeal {
  id: string
  title: string
  value?: number
  stage: string
  probability?: number
  owner_id?: string
  org_id?: string
  expected_close_date?: string
  description?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// CRM service — all operations scoped to Ground Ops org
export const crmService = {
  // Companies
  async getCompanies(): Promise<CrmCompany[]> {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getCompany(id: string): Promise<CrmCompany | null> {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createCompany(company: Partial<CrmCompany>): Promise<CrmCompany> {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert([{ ...company, org_id: GROUND_OPS_ORG_ID }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateCompany(id: string, updates: Partial<CrmCompany>): Promise<CrmCompany> {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Contacts
  async getContacts(): Promise<CrmContact[]> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*, company:companies(id, name, domain, industry)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getContact(id: string): Promise<CrmContact | null> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*, company:companies(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createContact(contact: Partial<CrmContact>): Promise<CrmContact> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert([{ ...contact, org_id: GROUND_OPS_ORG_ID }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateContact(id: string, updates: Partial<CrmContact>): Promise<CrmContact> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Deals
  async getDeals(): Promise<CrmDeal[]> {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('org_id', GROUND_OPS_ORG_ID)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createDeal(deal: Partial<CrmDeal>): Promise<CrmDeal> {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .insert([{ ...deal, org_id: GROUND_OPS_ORG_ID }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateDeal(id: string, updates: Partial<CrmDeal>): Promise<CrmDeal> {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
