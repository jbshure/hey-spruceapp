'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const

export default function CrmDealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', value: '', stage: 'lead', probability: '20',
    description: '', expected_close_date: '',
  })

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    try {
      const res = await fetch('/api/crm/deals')
      const data = await res.json()
      setDeals(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load deals:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value) || 0,
          probability: parseInt(form.probability) || 0,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', value: '', stage: 'lead', probability: '20', description: '', expected_close_date: '' })
        loadDeals()
      }
    } catch (err) {
      console.error('Failed to create deal:', err)
    } finally {
      setSaving(false)
    }
  }

  const stageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      qualified: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      negotiation: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      closed_won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[stage] || colors.lead
  }

  const totalValue = deals.filter(d => d.stage !== 'closed_lost').reduce((s, d) => s + (d.value || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deals</h1>
            <p className="text-muted-foreground text-sm">Ground Ops pipeline — ${totalValue.toLocaleString()} total</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Deal
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>New Deal</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Deal Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Delilah cleaning contract" required />
                </div>
                <div>
                  <Label>Value ($)</Label>
                  <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="5000" />
                </div>
                <div>
                  <Label>Stage</Label>
                  <select className="w-full h-10 px-3 rounded-md border bg-background" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Probability (%)</Label>
                  <Input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} />
                </div>
                <div>
                  <Label>Expected Close</Label>
                  <Input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Deal'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : deals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No deals yet. Add your first deal to start tracking your pipeline.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-3">Deal</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 hidden md:table-cell">Probability</th>
                    <th className="p-3 hidden lg:table-cell">Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(d => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{d.title}</p>
                        {d.description && <p className="text-sm text-muted-foreground truncate max-w-xs">{d.description}</p>}
                      </td>
                      <td className="p-3 font-medium">${(d.value || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${stageColor(d.stage)}`}>
                          {d.stage?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 hidden md:table-cell text-sm">{d.probability || 0}%</td>
                      <td className="p-3 hidden lg:table-cell text-sm">{d.expected_close_date || '—'}</td>
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
