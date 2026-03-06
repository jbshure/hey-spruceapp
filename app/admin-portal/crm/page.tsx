'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Building2, TrendingUp, UserPlus } from 'lucide-react'

export default function CrmDashboard() {
  const [stats, setStats] = useState({ contacts: 0, companies: 0, deals: 0, totalValue: 0 })
  const [recentContacts, setRecentContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [contactsRes, companiesRes, dealsRes] = await Promise.all([
          fetch('/api/crm/contacts'),
          fetch('/api/crm/companies'),
          fetch('/api/crm/deals'),
        ])
        const contacts = await contactsRes.json()
        const companies = await companiesRes.json()
        const deals = await dealsRes.json()

        setStats({
          contacts: Array.isArray(contacts) ? contacts.length : 0,
          companies: Array.isArray(companies) ? companies.length : 0,
          deals: Array.isArray(deals) ? deals.length : 0,
          totalValue: Array.isArray(deals) ? deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0) : 0,
        })
        setRecentContacts(Array.isArray(contacts) ? contacts.slice(0, 5) : [])
      } catch (err) {
        console.error('Failed to load CRM data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM</h1>
          <p className="text-muted-foreground">Shared contacts, companies & pipeline</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin-portal/crm/contacts">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Contacts</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.contacts}</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-portal/crm/companies">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.companies}</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-portal/crm/deals">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Deals</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.deals}</div>
                  </CardContent>
                </Card>
              </Link>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Contacts</CardTitle>
                <Link href="/admin-portal/crm/contacts" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {recentContacts.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No contacts yet. Add your first contact to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {recentContacts.map((contact: any) => (
                      <div key={contact.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.company?.name || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
