import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, MapPin, ShieldCheck, Users, BellRing } from 'lucide-react'
import { getSeverityTheme, getStatusTheme } from '../utils/trackerUtils.js'

const initialStaff = [
  {
    id: 1,
    name: 'Maya Chen',
    role: 'Field Supervisor',
    location: 'North Hub',
    status: 'active',
    lastUpdate: '2 min ago',
    sharing: true,
  },
  {
    id: 2,
    name: 'Darius Brooks',
    role: 'Support Lead',
    location: 'West Wing',
    status: 'away',
    lastUpdate: '10 min ago',
    sharing: true,
  },
  {
    id: 3,
    name: 'Noah Patel',
    role: 'Operations',
    location: 'Offline',
    status: 'offline',
    lastUpdate: '15 min ago',
    sharing: false,
  },
]

const initialAlerts = [
  {
    id: 1,
    title: 'Door access anomaly',
    severity: 'urgent',
    detail: 'Security team requested a manual check at Building B',
    time: '4m ago',
  },
  {
    id: 2,
    title: 'Shift handoff pending',
    severity: 'high',
    detail: 'Two staff members are due for the next check-in window',
    time: '18m ago',
  },
]

const StaffTrackerPage = () => {
  const [staff] = useState(initialStaff)
  const [alerts] = useState(initialAlerts)

  const summary = useMemo(() => {
    const active = staff.filter((person) => person.status === 'active').length
    const sharing = staff.filter((person) => person.sharing).length
    const urgent = alerts.filter((alert) => alert.severity === 'urgent').length

    return { active, sharing, urgent }
  }, [staff, alerts])

  return (
    <div className="min-h-screen bg-primary-dark px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-primary-light/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> Manager visibility layer
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">Staff tracker dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                View staff presence, location sharing consent, and urgent operational alerts in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-accent-blue" />
                <span>2 active alerts awaiting review</span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-primary-light/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Active staff</p>
              <Activity className="h-5 w-5 text-sky-300" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{summary.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-primary-light/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Location sharing on</p>
              <MapPin className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{summary.sharing}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-primary-light/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Urgent incidents</p>
              <AlertTriangle className="h-5 w-5 text-rose-300" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{summary.urgent}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-primary-light/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Staff roster</h2>
                <p className="text-sm text-slate-400">Visible to managers and admins only.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-sm text-slate-300">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" /> Opt-in sharing
              </div>
            </div>

            <div className="space-y-3">
              {staff.map((person) => {
                const statusTheme = getStatusTheme(person.status)
                return (
                  <div key={person.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/15 text-sm font-semibold text-accent-blue">
                            {person.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-medium">{person.name}</h3>
                            <p className="text-sm text-slate-400">{person.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 text-sm ${statusTheme.badge} ${statusTheme.text}`}>
                          {person.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                          {person.location}
                        </span>
                        <span className="text-sm text-slate-400">{person.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-primary-light/80 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-blue" />
                <h2 className="text-xl font-semibold">Incident feed</h2>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const severityTheme = getSeverityTheme(alert.severity)
                  return (
                    <div key={alert.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{alert.title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${severityTheme.badge} ${severityTheme.text}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{alert.detail}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">{alert.time}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StaffTrackerPage
