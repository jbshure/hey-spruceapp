'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, X } from 'lucide-react'

export default function CrmCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', domain: '', phone: '', industry: '',
    address: '', city: '', state: '', zip: '',
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    try {
      const res = await fetch('/api/crm/companies')
      const data = await res.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load companies:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ name: '', domain: '', phone: '', industry: '', address: '', city: '', state: '', zip: '' })
        loadCompanies()
      }
    } catch (err) {
      console.error('Failed to create company:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name?.toLowerCase().includes(q) || c.domain?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Companies</h1>
            <p className="text-muted-foreground text-sm">Shared CRM companies across all orgs</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Company
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>New Company</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Domain</Label>
                  <Input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Restaurant, Bar, Hotel..." />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Company'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search ? 'No companies match your search.' : 'No companies yet. Add your first company to get started.'}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-3">Name</th>
                    <th className="p-3 hidden md:table-cell">Industry</th>
                    <th className="p-3 hidden lg:table-cell">Location</th>
                    <th className="p-3 hidden md:table-cell">Phone</th>
                    <th className="p-3 hidden lg:table-cell">Owner Org</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{c.name}</p>
                        {c.domain && <p className="text-sm text-muted-foreground">{c.domain}</p>}
                      </td>
                      <td className="p-3 hidden md:table-cell text-sm">{c.industry || '—'}</td>
                      <td className="p-3 hidden lg:table-cell text-sm">
                        {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="p-3 hidden md:table-cell text-sm">{c.phone || '—'}</td>
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
