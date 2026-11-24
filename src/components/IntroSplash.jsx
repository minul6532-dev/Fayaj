import { useEffect, useState } from 'react'
import irhamIntroLogo from '../assets/irham-intro.svg'
import './intro-splash.css'

const INTRO_DURATION_MS = 2000
const FADE_DURATION_MS = 300

function IntroSplash() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), INTRO_DURATION_MS - FADE_DURATION_MS)
    const hideTimer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`intro-splash${fading ? ' intro-splash-fading' : ''}`} aria-hidden="true">
      <img src={irhamIntroLogo} alt="" loading="eager" onError={() => setVisible(false)} />
    </div>
  )
}

export default IntroSplash
