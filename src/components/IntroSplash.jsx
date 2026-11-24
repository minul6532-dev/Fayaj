import { useEffect, useState } from 'react'
import irhamIntroLogo from '../assets/irham-intro.svg'
import './intro-splash.css'

const STORAGE_KEY = 'irham-intro-seen'
const INTRO_DURATION_MS = 2500
const FADE_DURATION_MS = 300

function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch (error) {
    console.warn('Unable to read intro splash session state.', error)
    return true
  }
}

function markIntroAsSeen() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1')
  } catch (error) {
    console.warn('Unable to save intro splash session state.', error)
  }
}

function IntroSplash() {
  const [visible, setVisible] = useState(shouldShowIntro)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    markIntroAsSeen()
    if (!visible) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false)
      return undefined
    }

    const fadeTimer = window.setTimeout(() => setFading(true), INTRO_DURATION_MS - FADE_DURATION_MS)
    const hideTimer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`intro-splash${fading ? ' intro-splash-fading' : ''}`} aria-hidden="true">
      <img src={irhamIntroLogo} alt="" loading="eager" onError={() => setVisible(false)} />
    </div>
  )
}

export default IntroSplash
