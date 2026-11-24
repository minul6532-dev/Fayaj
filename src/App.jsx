import { useEffect, useRef, useState } from 'react'
import './App.css'
import heroVideoSource from './assets/video/video1.mp4'
import heroVideoOptimizedSource from './assets/video/video1-optimized.mp4'
import heroVideoPoster from './assets/video/video1-poster.webp'
import Chatbot from './chatbot/Chatbot'
import HeroVideoPreloader from './components/HeroVideoPreloader'
import IntroSplash from './components/IntroSplash'
import { businessConfig, getOfficeDayHoursLabel, getOfficeHoursSummary } from './config/business'
import computerEquipmentImage from '../picture/img6.png'
import tradeActivitiesImage from '../picture/img7.webp'
import aboutTradeImage from '../picture/img8.webp'

const navItems = [['Home','#home'],['About','#about'],['Products','#products'],['Services','#services'],['Business Activities','#activities'],['Contact','#contact']]
const products = businessConfig.products.map((product) => ({
  ...product,
  image: product.image === 'picture/img6.png' ? computerEquipmentImage : product.image,
}))
const activities = [['01','Export','International product export and trade connections.'],['02','Import','Import coordination and product sourcing.'],['03','Auction Bidding','Auction bidding and related business activities.'],['04','Supplier','Product supply and supplier connections.']]
const processSteps = [
  { number: '01', title: 'Global Sourcing', description: 'Identify relevant products and connect with sourcing opportunities across markets.', label: 'Product Discovery', icon: 'globe' },
  { number: '02', title: 'Import / Export', description: 'Support international trade requirements and import-export coordination.', label: 'Global Trade', icon: 'ship' },
  { number: '03', title: 'Product Supply', description: 'Coordinate product requirements and supply opportunities for business needs.', label: 'Supply Solutions', icon: 'package' },
  { number: '04', title: 'Business Connections', description: 'Build business relationships through supplier and commercial connections.', label: 'Partnerships', icon: 'handshake' },
]

function ProcessIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === 'globe' && <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18M5.6 6.7a14 14 0 0 0 12.8 0M5.6 17.3a14 14 0 0 1 12.8 0" />
      </>}
      {name === 'ship' && <>
        <path d="M4 13h16l-2 5H6l-2-5Z" />
        <path d="M7 13V6h7v7M14 9h3l2 4M9 9h3M3 21c1.2-1 2.3-1 3.5 0 1.2-1 2.3-1 3.5 0 1.2-1 2.3-1 3.5 0 1.2-1 2.3-1 3.5 0 1.2-1 2.3-1 3.5 0" />
      </>}
      {name === 'package' && <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.3 7.7 7.7 4.4 7.7-4.4M12 12.1V21M8 5.2l8 4.6" />
      </>}
      {name === 'handshake' && <>
        <path d="m3 8 4-3 4 2 3-1 7 4-2 4-3-1-3 3-2-1-2 1-4-3-3-5Z" />
        <path d="m8 7 4 2 3-1M7 13l3 2m1-1 2 1m1-2 2 1M3 8l-1 2 3 5 2-1M21 10l2 2-3 4-3-1" />
      </>}
    </svg>
  )
}

function App() {
  const [menuOpen,setMenuOpen]=useState(false)
  const [scrolled,setScrolled]=useState(false)
  const [isVideoLoading,setIsVideoLoading]=useState(true)
  const [isVideoPlaying,setIsVideoPlaying]=useState(false)
  const [hasVideoError,setHasVideoError]=useState(false)
  const [playbackBlocked,setPlaybackBlocked]=useState(false)
  const [inquirySent,setInquirySent]=useState(false)
  const [isSubmitting,setIsSubmitting]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',category:products[0].name,quantity:'',country:'',message:''})
  const [errors,setErrors]=useState({})
  const submitLock=useRef(false)
  const heroVideoRef=useRef(null)
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>24);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[])
  useEffect(()=>{document.body.style.overflow=menuOpen?'hidden':'';return()=>{document.body.style.overflow=''}},[menuOpen])
  useEffect(()=>{
    const video=heroVideoRef.current
    if(!video)return
    const onLoadedMetadata=()=>setIsVideoLoading(true)
    const onLoadedData=()=>setIsVideoLoading(false)
    const onCanPlay=()=>setIsVideoLoading(false)
    const onPlaying=()=>{setIsVideoPlaying(true);setPlaybackBlocked(false)}
    const onPause=()=>{setIsVideoPlaying(false);if(!video.ended)setPlaybackBlocked(true)}
    const onError=()=>{setIsVideoLoading(false);setIsVideoPlaying(false);setHasVideoError(true)}
    const onStalled=()=>setIsVideoLoading(true)
    const source=video.querySelector('source')
    video.addEventListener('loadedmetadata',onLoadedMetadata)
    video.addEventListener('loadeddata',onLoadedData)
    video.addEventListener('canplay',onCanPlay)
    video.addEventListener('playing',onPlaying)
    video.addEventListener('pause',onPause)
    video.addEventListener('error',onError)
    video.addEventListener('stalled',onStalled)
    source?.addEventListener('error',onError)
    return()=>{
      video.removeEventListener('loadedmetadata',onLoadedMetadata)
      video.removeEventListener('loadeddata',onLoadedData)
      video.removeEventListener('canplay',onCanPlay)
      video.removeEventListener('playing',onPlaying)
      video.removeEventListener('pause',onPause)
      video.removeEventListener('error',onError)
      video.removeEventListener('stalled',onStalled)
      source?.removeEventListener('error',onError)
    }
  },[])
  useEffect(()=>{
    const video=heroVideoRef.current
    if(!video)return
    let cancelled=false
    video.play().catch(()=>{
      if(cancelled)return
      setIsVideoLoading(false)
      if(video.error||video.networkState===HTMLMediaElement.NETWORK_NO_SOURCE){setIsVideoPlaying(false);setHasVideoError(true)}
      else setPlaybackBlocked(true)
    })
    return()=>{cancelled=true}
  },[])
  const playHeroVideo=()=>{
    const video=heroVideoRef.current
    if(!video||hasVideoError)return
    video.play().catch(()=>{
      setIsVideoLoading(false)
      if(video.error||video.networkState===HTMLMediaElement.NETWORK_NO_SOURCE){setIsVideoPlaying(false);setHasVideoError(true)}
      else setPlaybackBlocked(true)
    })
  }
  const update=(event)=>{const {name,value}=event.target;setForm(current=>({...current,[name]:value}));setErrors(current=>({...current,[name]:''}))}
  const submitInquiry=(event)=>{
    event.preventDefault(); if(submitLock.current)return
    const nextErrors={}
    if(!form.name.trim())nextErrors.name='Please enter your full name.'
    if(!form.phone.trim())nextErrors.phone='Please enter your phone or WhatsApp number.'
    if(!form.category.trim())nextErrors.category='Please select a product category.'
    if(!form.message.trim())nextErrors.message='Please describe your requirement.'
    setErrors(nextErrors);if(Object.keys(nextErrors).length)return
    submitLock.current=true
    setIsSubmitting(true)
    setInquirySent(false)
    const text=[
      `Hello ${businessConfig.companyName},`,
      '',
      'I would like to make a business inquiry.',
      '',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Category: ${form.category}`,
      `Quantity: ${form.quantity.trim() || 'Not specified'}`,
      `Country: ${form.country.trim() || 'Not specified'}`,
      '',
      'Requirements:',
      form.message.trim(),
      '',
      'Please contact me regarding this inquiry.',
    ].join('\n')
    window.open(`https://wa.me/${businessConfig.whatsapp}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')
    setInquirySent(true)
    setIsSubmitting(false)
    setForm({name:'',phone:'',category:products[0].name,quantity:'',country:'',message:''})
    window.setTimeout(()=>{submitLock.current=false},1200)
  }
  return (
    <div className="site">
      <IntroSplash />
      <header className={`header ${scrolled?'header-scrolled':''}`}>
        <a className="brand" href="#home" onClick={()=>setMenuOpen(false)} aria-label="IRHAM ENTERPRISE home"><span><strong>IRHAM</strong><small>ENTERPRISE</small></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={()=>setMenuOpen(open=>!open)}><span/><span/><span/></button>
        <nav className={menuOpen?'nav open':'nav'} aria-label="Main navigation">{navItems.map(([label,href])=><a key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}<a className="quote-link" href="#contact" onClick={()=>setMenuOpen(false)}>Request a Quote</a></nav>
      </header>
      <main>
        <section className="hero" id="home">
          <div className="hero-media" aria-hidden="true">
            <img className="hero-poster" src={heroVideoPoster} alt="" />
            <video ref={heroVideoRef} className={`hero-video${isVideoPlaying ? ' is-playing' : ''}`} autoPlay muted loop playsInline preload="metadata" poster={heroVideoPoster}>
              <source src={heroVideoOptimizedSource} type="video/mp4" />
              <source src={heroVideoSource} type="video/mp4" />
            </video>
          </div>
          <HeroVideoPreloader visible={isVideoLoading&&!hasVideoError} />
          <div className="hero-content">
            <p className="eyebrow">IRHAM ENTERPRISE</p>
            <h1><span className="hero-heading-line">IMPORT <span className="hero-heading-separator" aria-hidden="true">•</span> EXPORT</span>{' '}<span className="hero-heading-line">SOURCE <span className="hero-heading-separator" aria-hidden="true">•</span> SUPPLY</span></h1>
            <p className="hero-lead">Connecting global markets through trusted business relationships.</p>
            <div className="hero-actions"><a className="button button-primary" href="#products">Explore Our Products <span aria-hidden="true">→</span></a><a className="button button-secondary" href="#contact">Contact Us</a></div>
          </div>
          {isVideoPlaying&&<span className="hero-video-status" role="status"><span aria-hidden="true" />NOW PLAYING</span>}
          {!isVideoPlaying&&playbackBlocked&&!hasVideoError&&<button className="hero-video-play" type="button" onClick={playHeroVideo}><span className="hero-video-play-label">Play intro</span><span className="hero-video-play-icon" aria-hidden="true">▶</span></button>}
          {hasVideoError&&<p className="hero-video-error" role="status">Video preview unavailable. You can still explore our products below.</p>}
        </section>
        <section className="section about" id="about">
          <div className="about-intro">
            <div className="about-copy">
              <div className="section-heading">
                <p className="eyebrow dark">ABOUT IRHAM ENTERPRISE</p>
                <h2>Connecting International Trade With Business Opportunities.</h2>
              </div>
              <p className="about-description">IRHAM ENTERPRISE connects businesses to global markets through reliable import, export, auction bidding and trusted supplier partnerships. We focus on quality sourcing and dependable business relationships.</p>
            </div>
            <div className="about-illustration">
              <img src={aboutTradeImage} width="1488" height="880" alt="International trade and global logistics illustration for IRHAM ENTERPRISE." loading="lazy" decoding="async" />
            </div>
          </div>
          <ul className="activities-mini" aria-label="Business activities">
            {activities.map(([number,title])=><li key={title}><span>{number}</span><strong>{title}</strong></li>)}
          </ul>
        </section>
        <section className="section products" id="products"><div className="section-heading"><p className="eyebrow dark">OUR PRODUCT CATEGORIES</p><h2>Products That Connect Markets.</h2></div><div className="product-grid">{products.map((product,index)=><article className="product-card" id={`product-category-${index+1}`} key={product.name}><div className="product-image"><img src={product.image} alt={product.name} loading="lazy"/></div><div className="product-copy"><p className="product-tag">{product.category}</p><h3>{product.name}</h3><p>{product.description}</p><ul>{product.items.map(item=><li key={item}>{item}</li>)}</ul><a href="#contact">Enquire <span aria-hidden="true">→</span></a></div></article>)}</div></section>
        <section className="section services" id="services" aria-labelledby="process-title">
          <div className="section-heading">
            <p className="eyebrow dark">How We Work</p>
            <h2 id="process-title">From global sourcing to reliable supply.</h2>
            <p className="process-intro">A structured approach to sourcing, international trade and business supply.</p>
          </div>
          <div className="process">
            {processSteps.map((step) => (
              <article className="process-step" key={step.number}>
                <div className="process-step-top">
                  <span className="process-icon"><ProcessIcon name={step.icon} /></span>
                  <span className="process-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p className="process-description">{step.description}</p>
                <div className="process-step-footer">
                  <span>{step.label}</span>
                  <span className="process-arrow" aria-hidden="true">→</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section activities" id="activities">
          <div className="activities-intro">
            <div className="section-heading">
              <p className="eyebrow">Business activities</p>
              <h2>Focused capabilities for international trade.</h2>
            </div>
            <div className="activities-illustration">
              <img src={tradeActivitiesImage} width="2172" height="724" alt="International trade and global logistics illustration" loading="lazy" decoding="async" />
            </div>
          </div>
          <div className="activity-grid">{activities.map(([number,title,description])=><article key={title}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
          <div className="why"><p className="eyebrow dark">Why IRHAM ENTERPRISE</p><h3>Clear communication. Relevant sourcing. Practical trade connections.</h3></div>
        </section>
        <section className="section founder" id="founder"><div className="founder-portrait" aria-label="Initial monogram for Omar Fayaj Chy"><span>OFC</span></div><div className="founder-copy"><p className="eyebrow">Founder profile</p><h2>Omar Fayaj Chy</h2><p className="designation">Founder, IRHAM ENTERPRISE</p><p className="qualifications">BSS (Hon&apos;s) • MSS (CU) • LLB (NU)</p></div></section>
        <section className="section quote-section" id="contact">
          <div className="quote-panel">
            <p className="eyebrow">IMPORT • SOURCING • SUPPLY • BUSINESS INQUIRIES</p>
            <h2>Request a Product or Supply Quote</h2>
            <p className="quote-subtitle">Tell us what you are looking for. Share your product requirements and contact details, and our team will get back to you.</p>
            <form className="inquiry-form" onSubmit={submitInquiry} noValidate>
              <div className="field"><label htmlFor="name">Full Name *</label><input id="name" name="name" value={form.name} onChange={update} autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} />{errors.name&&<small>{errors.name}</small>}</div>
              <div className="field"><label htmlFor="phone">Phone / WhatsApp Number *</label><input id="phone" name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" placeholder="+880..." aria-invalid={Boolean(errors.phone)} />{errors.phone&&<small>{errors.phone}</small>}</div>
              <div className="field"><label htmlFor="category">Product / Category *</label><select id="category" name="category" value={form.category} onChange={update} aria-invalid={Boolean(errors.category)}><option value="">Select a product category</option>{businessConfig.categories.map(category=><option key={category}>{category}</option>)}</select>{errors.category&&<small>{errors.category}</small>}</div>
              <div className="field"><label htmlFor="quantity">Quantity / Requirement (Optional)</label><input id="quantity" name="quantity" value={form.quantity} onChange={update} placeholder="e.g. quantity, model, specification, packaging" /></div>
              <div className="field"><label htmlFor="country">Country (Optional)</label><input id="country" name="country" value={form.country} onChange={update} placeholder="e.g. Bangladesh" /></div>
              <div className="field field-wide"><label htmlFor="message">Your Message / Requirement *</label><textarea id="message" name="message" value={form.message} onChange={update} placeholder="Tell us about the product, quantity, specification or destination..." aria-invalid={Boolean(errors.message)} />{errors.message&&<small>{errors.message}</small>}</div>
              {inquirySent&&<p className="form-success field-wide">WhatsApp was opened with your inquiry prepared. Please send the message in WhatsApp to submit it.</p>}
              <button className="quote-submit field-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Preparing your inquiry...' : 'Send Inquiry Via WhatsApp'} <span aria-hidden="true">→</span></button>
            </form>
          </div>
        </section>
        <section className="section location-section" id="location">
          <article className="location-panel">
            <div className="location-panel-copy">
              <p className="eyebrow">OUR OFFICE LOCATION</p>
              <div className="location-panel-main">
                <div className="location-icon" aria-hidden="true">⌖</div>
                <div>
                  <h2>Visit {businessConfig.companyName}</h2>
                  <address>{businessConfig.addressLines.map((line)=><span key={line}>{line}</span>)}</address>
                </div>
              </div>
            </div>
            <div className="location-description">
              <p>Visit Irham Enterprise for business discussions, product inquiries and import, export or supply-related consultations.</p>
              <a className="maps-button" href={businessConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">→</span></a>
            </div>
          </article>
          <section className="hours-panel" id="office-hours" aria-labelledby="office-hours-title">
            <div className="office-hours-header">
              <div className="office-hours-heading-copy">
                <span className="hours-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8.75" />
                    <path d="M12 7v5l3.25 2" />
                  </svg>
                </span>
                <div>
                  <p className="office-hours-eyebrow">OFFICE HOURS</p>
                  <h2 id="office-hours-title">Office Visiting Hours</h2>
                  <p className="office-hours-intro">You can visit our office during the following hours.</p>
                </div>
              </div>
              <div className="office-hours-summary" aria-live="polite">
                <span>WEEKLY HOURS</span>
                <strong>{getOfficeHoursSummary()}</strong>
              </div>
            </div>
            <div className="office-hours-divider" aria-hidden="true" />
            <div className="office-hours-grid" role="list" aria-label="Weekly office visiting hours">
              {businessConfig.officeSchedule.map((day) => {
                const isClosed = day.closed === true
                return (
                  <article className={`office-day-card${isClosed ? ' is-closed' : ''}`} key={day.day} role="listitem">
                    <h3>{day.day}</h3>
                    <p>{getOfficeDayHoursLabel(day)}</p>
                  </article>
                )
              })}
            </div>
            <div className="office-hours-actions">
              <a className="office-hours-contact office-hours-call" href={`tel:${businessConfig.phoneRaw}`}>
                Call Us <span>{businessConfig.phone}</span>
              </a>
              <a className="office-hours-contact office-hours-whatsapp" href={`https://wa.me/${businessConfig.whatsapp}`} target="_blank" rel="noopener noreferrer">
                Contact Us <span>WhatsApp</span>
              </a>
            </div>
          </section>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-grid">
            <section className="footer-column footer-company" aria-labelledby="footer-company-heading">
              <a className="footer-wordmark" href="#home" aria-label={`${businessConfig.companyName} home`}>
                <span className="footer-monogram" aria-hidden="true">IE</span>
                <span className="footer-wordmark-copy" id="footer-company-heading"><strong>IRHAM</strong><small>ENTERPRISE</small></span>
              </a>
              <p className="footer-tagline">Global Connections</p>
              <span className="footer-accent-rule" aria-hidden="true" />
              <p className="footer-description">Import, sourcing and supply across selected product categories for local and international business requirements.</p>
            </section>

            <section className="footer-column footer-contact" aria-labelledby="footer-contact-heading">
              <h2 className="footer-heading" id="footer-contact-heading">VISIT / CONTACT</h2>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <a className="footer-address" href={businessConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open IRHAM ENTERPRISE address in Google Maps">
                    <span>7th Floor, Orient Tower,</span>
                    <span>North Laldigi,</span>
                    <span>Kotowali, Chattogram,</span>
                    <span>Bangladesh.</span>
                  </a>
                </div>
                <a className="footer-contact-item" href={`tel:${businessConfig.phoneRaw}`}>
                  <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 2a16 16 0 0 0 5.5 5.5l2-2.5 5 2v4c0 1.1-.9 2-2 2C10 21 3 14 3 5c0-1.1.9-2 2-2Z" /></svg>
                  <span>{businessConfig.phone}</span>
                </a>
                <a className="footer-contact-item footer-email" href={`mailto:${businessConfig.email}`}>
                  <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
                  <span>{businessConfig.email}</span>
                </a>
              </div>
              <a className="footer-map-link" href={businessConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span>OPEN IN GOOGLE MAPS</span>
                <span aria-hidden="true">→</span>
              </a>
            </section>

            <nav className="footer-column footer-explore" aria-labelledby="footer-explore-heading">
              <h2 className="footer-heading" id="footer-explore-heading">EXPLORE</h2>
              <ul className="footer-list">
                {navItems.map(([label,href])=><li key={href}><a href={href}>{label}</a></li>)}
              </ul>
            </nav>

            <nav className="footer-column footer-products" aria-labelledby="footer-products-heading">
              <h2 className="footer-heading" id="footer-products-heading">OUR PRODUCTS</h2>
              <ul className="footer-list">
                {products.map((product,index)=><li key={product.name}><a href={`#product-category-${index+1}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg><span>{product.name}</span></a></li>)}
              </ul>
            </nav>
          </div>

          <div className="footer-bottom">
            <p>© 2026 {businessConfig.companyName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Chatbot/>
    </div>
  )
}
export default App
