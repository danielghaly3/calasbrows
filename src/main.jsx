import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Cursor, Intro, Marquee, SplitText,
  fine, reduced, useIntro, useMagnetic, useParallax, useReveal, useScroll,
} from './motion.jsx';
import './styles.css';

const BOOKING = 'https://calasbrowss.as.me/schedule/857d6b96';
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSdg8VHl0xiU8zkQaGTlsOruhsDvOLyGhaMvWek2GTbiH_Ho6w/viewform?pli=1';
const INSTAGRAM = 'https://www.instagram.com/calasbrowss/';

const IMG = {
  hero: '/images/hero-portrait.webp',
  brow: '/images/brow-closeup.webp',
  lash: '/images/lash-profile.webp',
};

function Arrow({ diagonal = false }) {
  return <span className="arrow" aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function Button({ href, children, light = false, outline = false, className = '', cursor = 'Book' }) {
  const ref = useMagnetic(0.2);
  const external = href.startsWith('http');
  return (
    <a
      ref={ref}
      className={`button ${light ? 'button--light' : ''} ${outline ? 'button--outline' : ''} ${className}`}
      href={href}
      target={external ? '_blank' : undefined}
      rel="noreferrer"
      data-cursor={cursor}
    >
      <span className="button-label">{children}</span>
      <Arrow diagonal={external} />
      <i className="button-fill" aria-hidden="true" />
    </a>
  );
}

/* ----------------------------------------------------------------- Nav */

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#home');
  const barRef = useRef(null);
  const links = [['Home', '#home'], ['Services', '#services'], ['Results', '#results'], ['About', '#about'], ['FAQ', '#faq']];

  useScroll(y => {
    setScrolled(y > 40);
    const doc = document.documentElement.scrollHeight - window.innerHeight;
    if (barRef.current) barRef.current.style.transform = `scaleX(${doc > 0 ? y / doc : 0})`;
  });

  useEffect(() => {
    const ids = links.map(([, h]) => h);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const el = document.querySelector(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`nav-wrap${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="wordmark" href="#home" onClick={() => setOpen(false)} data-cursor="Top">
          CALAS <i>BROWS</i>
        </a>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map(([name, href], i) => (
            <a
              key={name}
              href={href}
              className={active === href ? 'is-active' : ''}
              style={{ '--i': i }}
              onClick={() => setOpen(false)}
            >
              <span>{name}</span>
            </a>
          ))}
          <Button href={BOOKING} className="mobile-book">Book now</Button>
        </div>
        <Button href={BOOKING} className="desktop-book">Book now</Button>
        <button
          className={`menu-toggle ${open ? 'is-open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span /><span />
        </button>
      </nav>
      <div className="nav-progress"><i ref={barRef} /></div>
    </header>
  );
}

/* ---------------------------------------------------------------- Hero */

function Hero({ ready }) {
  const img = useParallax(0.06, 1.12);
  const copyRef = useRef(null);

  useScroll(() => {
    const node = copyRef.current;
    if (!node || reduced()) return;
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    node.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
    node.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.72)));
  });

  return (
    <section className={`hero${ready ? ' is-ready' : ''}`} id="home">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-image">
        <div className="hero-image-inner" ref={img}>
          <img src={IMG.hero} alt="Editorial portrait showcasing naturally styled brows" fetchpriority="high" />
        </div>
      </div>
      <div className="hero-copy shell" ref={copyRef}>
        <p className="eyebrow"><i /> Mississauga &middot; Derry &amp; Ninth Line</p>
        <h1>
          <span className="hero-line"><span>BROWS,</span></span>
          <em className="hero-line"><span>BUT BETTER.</span></em>
        </h1>
        <div className="hero-bottom">
          <p>Personalized brow and lash artistry that refines what&rsquo;s already yours.</p>
          <div className="hero-actions">
            <Button href={BOOKING}>Book appointment</Button>
            <a className="text-link" href="#results" data-cursor="See">View results <Arrow /></a>
          </div>
        </div>
      </div>
      <p className="vertical-note">BROW &amp; LASH ARTISTRY &middot; 2026</p>
      <div className="scroll-cue"><span /><i>SCROLL TO DISCOVER</i></div>
    </section>
  );
}

/* ----------------------------------------------------------- Statement */

function Statement() {
  return (
    <section className="statement">
      <span className="orb orb--a" aria-hidden="true" />
      <span className="orb orb--b" aria-hidden="true" />
      <div className="shell statement-grid">
        <p className="kicker reveal">THE CALAS APPROACH</p>
        <SplitText lines={['Brows designed for', { t: 'your face,', em: true }, 'your features, and your style.']} />
        <p className="statement-body reveal">
          No copy-and-paste shapes. Every detail is considered to enhance your natural
          brows and keep the result feeling like you&mdash;only more polished.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Services */

const services = [
  { name: 'Brow Lamination', tag: 'Shape · Set · Lift', img: IMG.brow, copy: 'A fuller, lifted look with each hair styled into place for a soft, polished finish.' },
  { name: 'Hybrid Tint', tag: 'Definition · Depth', img: IMG.hero, copy: 'Skin and hair tinting for richer colour, cleaner edges, and effortless everyday definition.' },
  { name: 'Brow Waxing', tag: 'Clean · Refine', img: IMG.brow, copy: 'Precise shaping designed around your natural growth, features, and preferred finish.' },
  { name: 'Korean Lash Lift', tag: 'Lift · Lengthen', img: IMG.lash, copy: 'A modern lash lift technique for a soft, eye-opening curl that lets your natural lashes lead.' },
];

function Services() {
  const [hover, setHover] = useState(-1);
  const peek = useRef(null);

  useEffect(() => {
    if (!fine() || reduced()) return;
    const move = e => {
      if (peek.current) peek.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <section className="services section" id="services">
      <div className="shell">
        <div className="section-head">
          <p className="kicker reveal">THE MENU</p>
          <SplitText lines={['Small details.', { t: 'Major energy.', em: true }]} />
          <p className="reveal">Thoughtful services for naturally refined brows and lashes.</p>
        </div>
        <div className="service-list" onMouseLeave={() => setHover(-1)}>
          {services.map((s, i) => (
            <article
              className={`service-row reveal${hover === i ? ' is-hot' : ''}${hover > -1 && hover !== i ? ' is-dim' : ''}`}
              key={s.name}
              style={{ '--i': i }}
              onMouseEnter={() => setHover(i)}
            >
              <span className="service-num">0{i + 1}</span>
              <div className="service-name">
                <p className="service-tag">{s.tag}</p>
                <h3>{s.name}</h3>
              </div>
              <p className="service-copy">{s.copy}</p>
              <Button href={BOOKING} outline className="service-cta">Book this service</Button>
              <i className="service-sweep" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
      <div className={`service-peek${hover > -1 ? ' is-live' : ''}`} ref={peek} aria-hidden="true">
        <div className="service-peek-inner">
          {services.map((s, i) => (
            <img key={s.name} src={s.img} alt="" className={hover === i ? 'is-live' : ''} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Results */

const effects = [
  { src: IMG.brow, alt: 'Close-up of a groomed, laminated brow', label: 'Brow detail', note: 'Lamination + hybrid tint' },
  { src: IMG.hero, alt: 'Portrait showcasing personalized brow styling', label: 'Natural definition', note: 'Shape mapped to the face' },
  { src: IMG.lash, alt: 'Profile showcasing lifted lashes and natural brows', label: 'Lifted + refined', note: 'Korean lash lift' },
];

/** One gallery frame: the image drifts inside a mask that wipes open on entry. */
function Frame({ item, index, place, strength }) {
  const img = useParallax(strength, 1.2);
  return (
    <figure className={`frame frame--${place} reveal`} data-cursor="Look">
      <div className="frame-wrap">
        <div className="frame-inner" ref={img}>
          <img src={item.src} alt={item.alt} loading="lazy" />
        </div>
        <span className="frame-veil" aria-hidden="true" />
        <span className="frame-index">0{index + 1}</span>
      </div>
      <figcaption>
        <span className="frame-label">{item.label}</span>
        <span className="frame-note">{item.note}</span>
      </figcaption>
    </figure>
  );
}

function Results() {
  return (
    <section className="results section" id="results">
      <div className="shell">
        <div className="results-head">
          <p className="kicker reveal">THE CALAS EFFECT</p>
          <SplitText lines={['Results worth a', { t: 'closer look.', em: true }]} />
          <p className="reveal">Real texture. Refined shape. A finish that still feels unmistakably yours.</p>
        </div>

        <div className="effect-grid">
          <Frame item={effects[0]} index={0} place="a" strength={0.045} />
          <Frame item={effects[1]} index={1} place="b" strength={0.075} />

          <div className="effect-note reveal">
            <p>Every result starts the same way &mdash; a close read of your features, then a shape built to suit them.</p>
            <a className="text-link" href={BOOKING} target="_blank" rel="noreferrer" data-cursor="Book">
              Book your look <Arrow diagonal />
            </a>
          </div>

          <p className="effect-meta reveal">
            <span>Demo imagery shown</span>
            Easily replace with Calas Brows client results.
          </p>

          <Frame item={effects[2]} index={2} place="c" strength={0.06} />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Before/After */

function BeforeAfter() {
  const [pos, setPos] = useState(54);
  const frame = useRef(null);
  const [hinted, setHinted] = useState(false);

  useEffect(() => {
    if (!frame.current || reduced()) { setHinted(true); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || hinted) return;
        setHinted(true);
        const start = performance.now();
        const run = now => {
          const t = Math.min(1, (now - start) / 1400);
          const ease = 1 - Math.pow(1 - t, 3);
          setPos(54 + Math.sin(ease * Math.PI) * 26);
          if (t < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      });
    }, { threshold: 0.45 });
    io.observe(frame.current);
    return () => io.disconnect();
  }, [hinted]);

  const drag = e => {
    const r = frame.current.getBoundingClientRect();
    const next = ((e.clientX - r.left) / r.width) * 100;
    setPos(Math.min(95, Math.max(5, next)));
  };

  return (
    <section className="transformation section">
      <div className="shell transformation-grid">
        <div
          className="compare reveal"
          ref={frame}
          style={{ '--position': `${pos}%` }}
          data-cursor="Drag"
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag(e); }}
          onPointerMove={e => { if (e.buttons === 1) drag(e); }}
        >
          <div className="compare-base"><img src={IMG.brow} alt="Natural eyebrow before styling" loading="lazy" /></div>
          <div className="compare-after"><img src={IMG.brow} alt="Defined eyebrow after styling" loading="lazy" /></div>
          <span className="compare-label before-label">Before</span>
          <span className="compare-label after-label">After</span>
          <input
            type="range" min="5" max="95" value={pos}
            onChange={e => setPos(Number(e.target.value))}
            aria-label="Drag to compare before and after"
          />
          <div className="compare-line"><span>{'↔'}</span></div>
        </div>
        <div className="transformation-copy">
          <p className="kicker reveal">THE TRANSFORMATION</p>
          <SplitText lines={['Small details.', { t: 'Big difference.', em: true }]} />
          <p className="reveal">Drag to reveal how thoughtful shaping and definition can bring balance to the whole face.</p>
          <div className="reveal"><Button href={BOOKING} outline>Start your transformation</Button></div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Why */

function Why() {
  const points = [
    ['Made for your face', 'Shape, tone, and finish are considered for your features—not a trend.'],
    ['Detail is the service', 'Careful mapping and clean finishing make the subtle difference.'],
    ['Naturally polished', 'Defined enough to notice. Soft enough to still feel like you.'],
    ['One-on-one care', 'A focused, comfortable appointment with your result at the centre.'],
  ];
  return (
    <section className="why section">
      <div className="shell why-grid">
        <div className="why-title">
          <p className="kicker reveal">WHY CALAS</p>
          <SplitText lines={['Beauty that', { t: 'reads natural.', em: true }]} />
          <svg className="arch reveal" viewBox="0 0 280 150" fill="none" aria-hidden="true">
            <path d="M1 150 V90 A139 89 0 0 1 279 90 V150" stroke="currentColor" strokeWidth="1" pathLength="1" />
          </svg>
        </div>
        <div className="why-list">
          {points.map(([title, copy], i) => (
            <div className="why-item reveal" key={title} style={{ '--i': i }}>
              <span>0{i + 1}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Process */

function Process() {
  const steps = [
    ['Choose', 'Find the service that fits your brow or lash goals.'],
    ['Book', 'Select an available appointment through the booking page.'],
    ['Complete', 'Fill out the client form before your appointment.'],
    ['Arrive', 'Come in, get comfortable, and let Calas take care of the details.'],
  ];
  return (
    <section className="process section">
      <div className="shell">
        <div className="process-head">
          <p className="kicker reveal">YOUR APPOINTMENT</p>
          <SplitText lines={['Easy from', { t: 'click to chair.', em: true }]} />
          <div className="deposit reveal">
            <strong>$15</strong>
            <span>Deposit required<br />to secure your appointment</span>
          </div>
        </div>
        <div className="process-steps">
          {steps.map(([title, copy], i) => (
            <article className="process-step reveal" key={title} style={{ '--i': i }}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FormCTA */

function FormCTA() {
  return (
    <section className="form-cta">
      <div className="shell form-grid">
        <p className="kicker reveal">ALREADY BOOKED?</p>
        <SplitText lines={['One last detail', { t: 'before your visit.', em: true }]} />
        <p className="reveal">Complete your client form ahead of your appointment so your time in the chair stays focused on you.</p>
        <div className="reveal"><Button href={FORM} light cursor="Open">Complete client form</Button></div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- About */

function About() {
  const img = useParallax(0.05, 1.14);
  return (
    <section className="about section" id="about">
      <div className="shell about-grid">
        <div className="about-image reveal">
          <div className="about-image-inner" ref={img}>
            <img src={IMG.lash} alt="Beauty portrait representing Calas Brows artistry" loading="lazy" />
          </div>
          <span>THE ARTIST&rsquo;S EYE</span>
        </div>
        <div className="about-copy">
          <p className="kicker reveal">MEET CALAS</p>
          <SplitText lines={['The artist behind', { t: 'the brows.', em: true }]} />
          <p className="reveal">Calas is a Mississauga brow artist with an eye for detail and a love for enhancing natural features. This is where careful technique meets a comfortable, personal experience.</p>
          <p className="about-note reveal">More of Calas&rsquo;s story can be added here as the brand grows.</p>
          <div className="reveal"><Button href={INSTAGRAM} outline cursor="Follow">Follow the work</Button></div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- Location + Instagram */

function LocationInstagram() {
  return (
    <>
      <section className="location">
        <div className="shell location-grid">
          <p className="kicker reveal">FIND THE STUDIO</p>
          <SplitText lines={['MISSISSAUGA']} className="location-title" />
          <div className="reveal">
            <strong>Derry &amp; Ninth Line</strong>
            <p>Exact appointment details are provided after booking.</p>
            <Button href={BOOKING} light>Plan your visit</Button>
          </div>
        </div>
      </section>

      <section className="instagram section">
        <div className="shell insta-head">
          <div>
            <p className="kicker reveal">FOLLOW ALONG</p>
            <SplitText lines={['@CALASBROWSS']} className="insta-title" />
          </div>
          <div className="reveal"><Button href={INSTAGRAM} outline cursor="Follow">Follow on Instagram</Button></div>
        </div>
        <div className="insta-strip">
          {effects.map((item, i) => (
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" key={i} className="reveal" style={{ '--i': i }} data-cursor="Open">
              <img src={item.src} alt={item.alt} loading="lazy" />
              <span>{'↗'}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------- FAQ */

const faqs = [
  ['Where are you located?', 'Calas Brows is in Mississauga, near Derry & Ninth Line. Exact appointment details are provided after booking.'],
  ['How do I book?', 'Use any “Book now” button on this page to open the official booking calendar and choose your service and available time.'],
  ['Is a deposit required?', 'Yes. A $15 deposit is required to secure your appointment.'],
  ['Where can I see available appointments?', 'Current availability is always shown on the official online booking page.'],
  ['Do I need to complete a form?', 'If requested for your service, complete the linked client form before your appointment. Additional service-specific instructions can be added as they become available.'],
];

function FAQ() {
  const [active, setActive] = useState(0);
  return (
    <section className="faq section" id="faq">
      <div className="shell faq-grid">
        <div className="faq-title">
          <p className="kicker reveal">GOOD TO KNOW</p>
          <SplitText lines={['Questions,', { t: 'answered.', em: true }]} />
          <p className="reveal">Still wondering about something? Reach out to Calas on Instagram.</p>
        </div>
        <div className="accordion">
          {faqs.map(([q, a], i) => (
            <div className={`faq-item reveal${active === i ? ' active' : ''}`} key={q} style={{ '--i': i }}>
              <button onClick={() => setActive(active === i ? -1 : i)} aria-expanded={active === i}>
                <em>0{i + 1}</em>
                <span>{q}</span>
                <i aria-hidden="true"><b /><b /></i>
              </button>
              <div className="faq-answer"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ FinalCTA */

function FinalCTA() {
  const img = useParallax(0.07, 1.18);
  return (
    <section className="final-cta">
      <div className="cta-image"><div className="cta-image-inner" ref={img}><img src={IMG.hero} alt="" /></div></div>
      <div className="shell cta-copy">
        <p className="kicker reveal">YOUR NEXT LOOK</p>
        <SplitText lines={['READY FOR YOUR', { t: 'NEXT BROW ERA?', em: true }]} className="cta-title" />
        <div className="reveal"><Button href={BOOKING} light>Book your appointment</Button></div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <a className="footer-logo" href="#home" data-cursor="Top">CALAS <i>BROWS</i></a>
        <div>
          <p className="footer-label">LOCATION</p>
          <p>Mississauga<br />Derry &amp; Ninth Line</p>
        </div>
        <div>
          <p className="footer-label">EXPLORE</p>
          <a href="#services">Services</a><a href="#results">Results</a><a href="#faq">FAQ</a>
        </div>
        <div>
          <p className="footer-label">CONNECT</p>
          <a href={BOOKING} target="_blank" rel="noreferrer">Booking {'↗'}</a>
          <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram {'↗'}</a>
          <a href={FORM} target="_blank" rel="noreferrer">Client form {'↗'}</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>&copy; {new Date().getFullYear()} Calas Brows</p>
        <p>Beauty, considered.</p>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------- App */

function StickyBook() {
  const [show, setShow] = useState(false);
  useScroll(y => setShow(y > window.innerHeight * 0.8));
  return (
    <a
      className={`mobile-sticky${show ? ' is-visible' : ''}`}
      href={BOOKING} target="_blank" rel="noreferrer"
    >
      Book now <Arrow diagonal />
    </a>
  );
}

function App() {
  const stage = useIntro();
  const ready = stage !== 'in';
  useReveal();

  return (
    <>
      <Intro stage={stage} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Statement />
        <Marquee items={['BROW LAMINATION', 'HYBRID TINT', 'BROW WAXING', 'KOREAN LASH LIFT']} />
        <Services />
        <Results />
        <BeforeAfter />
        <Why />
        <Process />
        <FormCTA />
        <About />
        <LocationInstagram />
        <FAQ />
        <Marquee items={['BOOK YOUR APPOINTMENT', 'MISSISSAUGA', 'BROWS, BUT BETTER']} speed={34} reverse />
        <FinalCTA />
      </main>
      <Footer />
      <StickyBook />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
