import { mount } from 'svelte'

// Self-hosted fonts via fontsource (bundled woff2, no CDN dependency)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/crimson-text/400.css'
import '@fontsource/crimson-text/400-italic.css'

import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
