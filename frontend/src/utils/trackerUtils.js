export const getStatusTheme = (status) => {
  switch (status) {
    case 'active':
      return { badge: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-300' }
    case 'away':
      return { badge: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-300' }
    case 'offline':
      return { badge: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-300' }
    default:
      return { badge: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-300' }
  }
}

export const getSeverityTheme = (severity) => {
  switch (severity) {
    case 'urgent':
      return { badge: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-300' }
    case 'high':
      return { badge: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-300' }
    case 'medium':
      return { badge: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-300' }
    default:
      return { badge: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-300' }
  }
}
