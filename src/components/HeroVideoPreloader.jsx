function HeroVideoPreloader({ visible = true }) {
  return (
    <div
      className={`hero-video-preloader ${visible ? 'is-visible' : 'is-hidden'}`}
      role={visible ? 'status' : undefined}
      aria-label={visible ? 'Loading IRHAM ENTERPRISE video' : undefined}
      aria-hidden={!visible}
    >
      <div className="hero-video-preloader-shell">
        <span>IRHAM</span>
        <small>ENTERPRISE</small>
      </div>
    </div>
  )
}

export default HeroVideoPreloader
