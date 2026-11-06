import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/bebas-neue'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/space-mono/400'
import '@fontsource/space-mono/700'
import '@fontsource/caveat/700'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)