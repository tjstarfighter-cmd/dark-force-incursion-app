type AppView = 'game' | 'archive' | 'settings' | 'gameDetail'

let currentView = $state<AppView>('game')

export function getCurrentView(): AppView {
  return currentView
}

export function navigate(view: AppView): void {
  currentView = view
  history.pushState({ view }, '', `#${view}`)
}

export function back(): void {
  history.back()
}

// Listen for browser back button
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e: PopStateEvent) => {
    currentView = (e.state?.view as AppView) ?? 'game'
  })
}
