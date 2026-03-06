'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, X } from 'lucide-react'

export default function CrmContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    job_title: '', lifecycle_stage: 'lead', lead_status: 'new',
  })

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const res = await fetch('/api/crm/contacts')
      const data = await res.json()
      setContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ first_name: '', last_name: '', email: '', phone: '', job_title: '', lifecycle_stage: 'lead', lead_status: 'new' })
        loadContacts()
      }
    } catch (err) {
      console.error('Failed to create contact:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return !q
      || `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
      || c.email?.toLowerCase().includes(q)
      || c.company?.name?.toLowerCase().includes(q)
  })

  const stageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      customer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      opportunity: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground text-sm">Shared CRM contacts across all orgs</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>New Contact</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} />
                </div>
                <div>
                  <Label>Stage</Label>
                  <select className="w-full h-10 px-3 rounded-md border bg-background" value={form.lifecycle_stage} onChange={e => setForm(f => ({ ...f, lifecycle_stage: e.target.value }))}>
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Contact'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search ? 'No contacts match your search.' : 'No contacts yet. Add your first contact to get started.'}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-3">Name</th>
                    <th className="p-3 hidden md:table-cell">Email</th>
                    <th className="p-3 hidden lg:table-cell">Company</th>
                    <th className="p-3 hidden md:table-cell">Stage</th>
                    <th className="p-3 hidden lg:table-cell">Owner Org</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{c.first_name} {c.last_name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{c.email}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell text-sm">{c.email}</td>
                      <td className="p-3 hidden lg:table-cell text-sm">{c.company?.name || '—'}</td>
                      <td className="p-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-1 rounded-full ${stageBadge(c.lifecycle_stage)}`}>
                          {c.lifecycle_stage || 'lead'}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                        {c.org_id === '00000000-0000-0000-0000-000000000002' ? 'Ground Ops' : c.org_id === '00000000-0000-0000-0000-000000000001' ? 'E&E' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
