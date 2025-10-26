import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [logoSrc, setLogoSrc] = useState(`${process.env.PUBLIC_URL}/abstract-logo.png`);
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('industrial');
  const [activeNav, setActiveNav] = useState('home');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const phrases = React.useMemo(() => ['Full Stack .NET Developer', 'Web Developer', 'Tech Explorer & Continuous Learner'], []);
  const mouseRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const hideTimerRef = React.useRef(null);
  const lastPosRef = React.useRef({ x: 0, y: 0 });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90; // match CSS scroll-margin-top-ish
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    // remove hash from URL
    const url = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', url);
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setActiveNav(id);
    scrollToSection(id);
    if (mobileOpen) {
      setMenuClosing(true);
      setTimeout(() => { setMobileOpen(false); setMenuClosing(false); }, 180);
    }
  };

  useEffect(() => {
    const shouldPauseTracking = (target) => {
      if (!target) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return true;
      // Also pause when CSS cursor is text
      try {
        const c = window.getComputedStyle(target).cursor;
        if (c === 'text') return true;
      } catch {}
      return false;
    };

    const handleMouseMove = (e) => {
      if (shouldPauseTracking(e.target)) {
        setIsMouseMoving(false);
        return;
      }
      const { clientX, clientY } = e;
      lastPosRef.current = { x: clientX, y: clientY };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (mouseRef.current) {
          mouseRef.current.style.transform = `translate3d(${clientX - 6}px, ${clientY - 6}px, 0)`;
        }
      });
      if (!isMouseMoving) setIsMouseMoving(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setIsMouseMoving(false), 800);
    };

    const handleMouseLeave = () => {
      setIsMouseMoving(false);
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const ids = ['home', 'about', 'experience', 'education', 'skills', 'projects', 'contact'];
      let current = 'home';
      const offset = 120; // account for fixed navbar height
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - offset <= 0) current = id;
      }
      setActiveNav(current);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // If page loaded with a hash, scroll to it and clean URL
    if (window.location.hash) {
      const id = window.location.hash.replace('#','');
      setTimeout(() => scrollToSection(id), 50);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isMouseMoving]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // typing effect loop (StrictMode-safe using refs)
  useEffect(() => {
    const idxRef = { i: 0 };
    const phraseRef = { p: 0 };
    const delRef = { d: false };
    let timeoutId;

    const tick = () => {
      const current = phrases[phraseRef.p % phrases.length] || '';
      let i = idxRef.i;
      let d = delRef.d;
      let delay = d ? 35 : 55; // faster delete/type

      if (!d) {
        i = Math.min(i + 1, current.length);
        if (i === current.length) {
          d = true;
          delay = 600; // shorter pause at end
        }
      } else {
        i = Math.max(i - 1, 0);
        if (i === 0) {
          d = false;
          delay = 200; // shorter pause between phrases
          phraseRef.p = (phraseRef.p + 1) % phrases.length;
        }
      }

      idxRef.i = i;
      delRef.d = d;
      setTypedText(current.substring(0, i));
      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, 300);
    return () => clearTimeout(timeoutId);
  }, [phrases]);

  // Email handled by FormSubmit: no JS needed
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
      _subject: 'New message from Portfolio Contact Form',
      _captcha: 'false',
      _template: 'table',
    };
    try {
      setSending(true);
      const res = await fetch('https://formsubmit.co/ajax/siddharthsenapati09318@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to send');
      await res.json();
      setSendResult({ ok: true, msg: 'Message sent successfully!' });
      form.reset();
    } catch (err) {
      setSendResult({ ok: false, msg: 'Failed to send. Please try again later.' });
    } finally {
      setSending(false);
    }
  };
  useEffect(() => {
    if (sendResult && sendResult.ok) {
      const t = setTimeout(() => setSendResult(null), 2000);
      return () => clearTimeout(t);
    }
  }, [sendResult]);
  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      {/* Mouse Tracker */}
      <div 
        ref={mouseRef}
        className={`mouse-tracker ${isMouseMoving ? 'active' : ''}`}
      ></div>
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <img
              src={logoSrc}
              onError={() => setLogoSrc(`${process.env.PUBLIC_URL}/abstract-logo.png`)}
              alt="Siddharth Senapati Logo"
              title="Siddharth Senapati"
              className="nav-logo-img"
            />
          </div>
          <button
            className={`nav-toggle ${mobileOpen ? 'open' : ''}`}
            onClick={() => {
              if (mobileOpen) {
                setMenuClosing(true);
                setTimeout(() => { setMobileOpen(false); setMenuClosing(false); }, 180);
              } else {
                setMobileOpen(true);
              }
            }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            type="button"
          >
            {!(mobileOpen || menuClosing) ? (
              <svg className="nav-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="5" r="2"></circle>
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="19" cy="5" r="2"></circle>
                <circle cx="5" cy="12" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="19" cy="12" r="2"></circle>
                <circle cx="5" cy="19" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
                <circle cx="19" cy="19" r="2"></circle>
              </svg>
            ) : (
              <svg className="nav-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </svg>
            )}
          </button>
          <div id="primary-navigation" className={`nav-menu ${mobileOpen ? 'open' : ''} ${menuClosing ? 'closing' : ''}`}>
            <a href="#home" className={`nav-link ${activeNav==='home' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'home')}>Home</a>
            <a href="#about" className={`nav-link ${activeNav==='about' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'about')}>About</a>
            <a href="#experience" className={`nav-link ${activeNav==='experience' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'experience')}>Experience</a>
            <a href="#education" className={`nav-link ${activeNav==='education' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'education')}>Education</a>
            <a href="#skills" className={`nav-link ${activeNav==='skills' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'skills')}>Skills</a>
            <a href="#projects" className={`nav-link ${activeNav==='projects' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'projects')}>Projects</a>
            <a href="#contact" className={`nav-link ${activeNav==='contact' ? 'active' : ''}`} onClick={(e) => handleNavClick(e,'contact')}>Contact</a>
            <button
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'Light mode' : 'Dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {darkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-image">
              <div className="profile-image">
                <div className="image-placeholder">
                  <img 
                    src={`${process.env.PUBLIC_URL}/profile.jpg`} 
                    alt="Siddharth Senapati" 
                    className="profile-img"
                  />
                </div>
              </div>
            </div>
            <div className="hero-text">
              <h1 className="hero-title">Hi, I'm Siddharth Senapati</h1>
              <h2 className="hero-subtitle">I am a {typedText}<span className="typing-caret" aria-hidden>▍</span></h2>
              <p className="hero-description">
                Hard-working and enthusiastic Junior Software Developer with hands-on experience in designing and developing web applications using ASP.NET. Skilled in database management, client communication, and team collaboration. Eager to learn and contribute to high-quality software solutions.
              </p>
              <div className="hero-buttons">
                <a href="#projects" className="btn btn-primary">View My Work</a>
                <a href="#contact" className="btn btn-secondary">Get In Touch</a>
                <a href={`${process.env.PUBLIC_URL}/resume.pdf`} download="Siddharth_Senapati_Resume.pdf" className="btn btn-secondary">Download Resume</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a dedicated .NET Developer with expertise in ASP.NET Core Web API, MVC, Web Forms, and C#.
                I collaborate effectively within teams, troubleshoot issues, and deliver high-quality solutions within tight timelines.
                I focus on building clean, scalable APIs, optimizing SQL queries, and writing maintainable code that follows SOLID principles.
                I enjoy polishing user experiences with JavaScript/jQuery and CSS, and I’m continuously learning new tools and best practices to improve delivery speed and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="experience">
        <div className="container">
          <h2 className="section-title">Professional Experience</h2>
          <div className="experience-timeline">
            <div className="experience-item">
              <div className="experience-date">Jan 2024 - Present</div>
              <div className="experience-content">
                <h3>.NET Developer</h3>
                <h4>Concept Infoway Pvt. Ltd., Ahmedabad</h4>
                <p>Flourishing at Concept Infoway, bringing web applications to life with ASP.NET, C#, and SQL Server. Efficiently solving approximately 15 Jira issues per month and achieving +20% coding optimization. An energetic team player who works across functions to create, test and release quality web solutions.</p>
                <div className="experience-tech">
                  <span>ASP.NET Core</span>
                  <span>C#</span>
                  <span>JavaScript</span>
                  <span>SQL Server</span>
                </div>
              </div>
            </div>
            <div className="experience-item">
              <div className="experience-date">June 2023 - Dec 2023</div>
              <div className="experience-content">
                <h3>.NET Developer</h3>
                <h4>Kyte Technology, Bhubaneswar</h4>
                <p>Joined as a Trainee and upgraded to Full-Time Junior Developer within 3 months. Assisted actively in web development projects, debugged, added new features and acquired hands-on experience in technologies such as ASP.NET, SQL and JavaScript.</p>
                <div className="experience-tech">
                  <span>ASP.NET</span>
                  <span>MS SQL Server</span>
                  <span>JavaScript</span>
                  <span>Web Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="education">
        <div className="container">
          <h2 className="section-title">Education</h2>
          <div className="education-grid">
            <div className="education-item">
              <div className="education-content">
                <h3>Masters in Computer Application</h3>
                <h4>BPUT, Odisha</h4>
                <p>2022-24</p>
                <p>Activities and societies: Inter college Cricket player. Lead in different progressive works in college for students.</p>
                <div className="education-grade">CGPA: 8.45</div>
              </div>
            </div>
            <div className="education-item">
              <div className="education-content">
                <h3>BSC in Physics</h3>
                <h4>Utkal University, Odisha</h4>
                <p>2019-22</p>
                <p>Activities and societies: Hosted at different events and competitions. Took part in different competitions
                </p>
                <div className="education-grade">CGPA: 8.88</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills">
        <div className="container">
          <h2 className="section-title">Technical Skills</h2>
          <div className="skills-content">
            <div className="skills-category">
              <h3>Backend Development</h3>
              <div className="skills-grid">
                <div className="skill-card" title="ASP.NET">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/aspnet-webforms.png`} alt="ASP.NET Web Forms"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>ASP.NET Web Forms</div>
                </div>
                <div className="skill-card" title="ASP.NET MVC">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/aspnet-mvc.png`} alt="ASP.NET MVC"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>ASP.NET MVC</div>
                </div>
                <div className="skill-card" title="ASP.NET Core Web API">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/Dotnet-core-log.png`} alt="ASP.NET Core Web API"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>ASP.NET Core Web API</div>
                </div>
                <div className="skill-card" title="LINQ">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/linq-dotnet-logo.png`} alt="ASP.NET Core Web API"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>ASP.NET Core Web API</div>
                </div>
                <div className="skill-card" title="C#">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/csharp.png`} alt="C#"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>C#</div>
                </div>
                <div className="skill-card" title="SQL Server">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/MSSQL-logo.png`} alt="SQL Server"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>SQL Server</div>
                </div>
              </div>
            </div>
            <div className="skills-category">
              <h3>Frontend Development</h3>
              <div className="skills-grid">
                <div className="skill-card" title="JQuery">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/JQuery-logo.png`} alt="JQuery"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>JQuery</div>
                </div>
                <div className="skill-card" title="JavaScript">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/javascript.png`} alt="JavaScript"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>JavaScript</div>
                </div>
                <div className="skill-card" title="HTML">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/HTML-logo.png`} alt="HTML/CSS"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>HTML/CSS</div>
                </div>
                <div className="skill-card" title="CSS">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/CSS-logo.png`} alt="CSS"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>CSS</div>
                </div>
                <div className="skill-card" title="AJAX">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/AJAX-logo.png`} alt="AJAX"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>AJAX</div>
                </div>
              </div>
            </div>
            <div className="skills-category">
              <h3>Programming & Tools</h3>
              <div className="skills-grid">
                <div className="skill-card" title="Java">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/JAVA-logo.png`} alt="Java"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>Java</div>
                </div>
                <div className="skill-card" title="OOPS">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/OOPS-logo.png`} alt="OOPS"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>OOPS</div>
                </div>
                <div className="skill-card" title="Visual Studio">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/VS-logo.png`} alt="Visual Studio"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>Visual Studio</div>
                </div>
                <div className="skill-card" title="Kendo-UI">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/KENDO-logo.png`} alt="Kendo-UI"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>Kendo-UI</div>
                </div>
                <div className="skill-card" title="Telerik">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/Telerik-logo.png`} alt="Telerik"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>Telerik</div>
                </div>
                <div className="skill-card" title="JIRA">
                  <img className="skill-card-img" src={`${process.env.PUBLIC_URL}/techs/JIRA-logo.png`} alt="JIRA"
                       onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='block';}} />
                  <div className="skill-card-label" style={{display:'none'}}>JIRA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'industrial' ? 'active' : ''}`}
              onClick={() => setActiveTab('industrial')}
              type="button"
            >
              <img className="tab-icon" src={`${process.env.PUBLIC_URL}/icons/industry.svg`} alt="" aria-hidden="true" />
              Industrial Projects
            </button>
            <button
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
              type="button"
            >
              <img className="tab-icon" src={`${process.env.PUBLIC_URL}/icons/user.svg`} alt="" aria-hidden="true" />
              Personal Projects
            </button>
          </div>
          <div className="tab-panels">
            <div className={`tab-panel ${activeTab === 'industrial' ? '' : 'hidden'}`}>
              <div className="projects-grid">
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/hospital-management-system.png`}
                      alt="Hospital Management System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Hospital Management System</div>
                  </div>
                  <div className="project-content">
                    <h3>Hospital Management System</h3>
                    <div className="project-tech">
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/aspnet-mvc.svg`} alt="ASP.NET MVC" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>ASP.NET Web Forms</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/csharp.svg`} alt="C#" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>C#</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/sql-server.svg`} alt="SQL Server" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>SQL Server</span></span>
                    </div>
                    <ul className="project-points">
                      <li>Designed and delivered an end-to-end HMS covering patients, doctors, appointments, billing, pharmacy, labs, and reports with robust role-based access.</li>
                      <li>Performance-focused: optimized critical SQL stored procedures by ~30%, removed code redundancies via shared services, added pagination/caching to keep dashboards loading in under 5 seconds.</li>
                      <li>Better UX and security: strong client/server validations, AJAX-based CRUD to avoid full page reloads, and token-based authentication with safe session handling.</li>
                    </ul>
                  </div>
                </div>
                
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/patient-Management-system.png`}
                      alt="Patient Administration System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Patient Administration System</div>
                  </div>
                  <div className="project-content">
                    <h3>Patient Administration System</h3>
                    <div className="project-tech">
                      <span>ASP.NET Core Web API</span><span>C#</span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/jquery.svg`} alt="jQuery" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>jQuery</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/sql-server.svg`} alt="SQL Server" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>SQL Server</span></span>
                    </div>
                    <ul className="project-points">
                      <li>Administrative workflows for admissions, discharge, transfers, and medical records with role-based controls.</li>
                      <li>Performance and integrity: transaction-safe updates, indexed queries, pagination for large lists, and data validation rules.</li>
                      <li>Created automated email notification system to send patient booking confirmations and sending invoices, billings to Patients.</li>
                      <li>Data quality: strict validations to ensure consistent patient records; fields hardened against manipulated or invalid entries.</li>
                    </ul>
                  </div>
                </div>
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/stock-clearance-system.png`}
                      alt="Stock Clearance System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Stock Clearance System</div>
                  </div>
                  <div className="project-content">
                    <h3>Stock Clearance System</h3>
                    <div className="project-tech"><span>ASP.NET MVC</span><span>C#</span><span>SQL Server</span></div>
                    <ul className="project-points">
                      <li>Inventory tracking across warehouses with clearance workflows, approval steps, and audit logs.</li>
                      <li>Operational speed: batch updates, cached lookups, and server-side pagination for fast grid loads.</li>
                      <li>Proactive UX: alerts for low stock/expiries, AJAX-based CRUD for seamless updates, and robust validations.</li>
                      <li>Security and roles: magic-link one-time login (time-limited via email) with enhanced token-based security; role enums for Customer, Company, and Admin to govern stock rate adjustments.</li>
                      <li>Implemented CAPTCHA on critical forms (login, stock adjustments) to prevent automated abuse and enhance security.</li>
                    </ul>
                  </div>
                </div>
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/student-management-system.png`}
                      alt="Student Management System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Student Management System</div>
                  </div>
                  <div className="project-content">
                    <h3>Student Management System</h3>
                    <div className="project-tech"><span>ASP.NET</span><span>MVC</span><span>SQL Server</span></div>
                    <ul className="project-points">
                      <li>Learning modules with progression tracking, quizzes, assignments, and results management.</li>
                      <li>Better performance and reliability via optimized queries, pagination, and consistent validation rules.</li>
                      <li>AJAX-first interactions for submissions and grading to avoid full page reloads; role-based views for admin/teacher/student.</li>
                      <li>Student success: weekly tests and assessments with automated progress emails; algorithms generate dynamic tests per chapter coverage and difficulty.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className={`tab-panel ${activeTab === 'personal' ? '' : 'hidden'}`}>
              <div className="projects-grid">
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/techs/Emp-project-logo.png`}
                      alt="Employee Management System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Employee Management System</div>
                  </div>
                  <div className="project-content">
                    <h3>Employee Management System</h3>
                    <div className="project-tech">
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/aspnet-mvc.svg`} alt="ASP.NET MVC" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>ASP.NET MVC</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/csharp.svg`} alt="C#" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>C#</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/sql-server.svg`} alt="SQL Server" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>SQL Server</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/jquery.svg`} alt="jQuery" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>jQuery</span></span>
                    </div>
                    <ul className="project-points">
                      <li>Employee profile CRUD, departments, and roles with role-based access.</li>
                      <li>Task assignment and tracking with statuses, priorities, and due dates.</li>
                      <li>Productivity features: search, filters, and server-side pagination for large lists.</li>
                      <li>Smooth UX: AJAX-based CRUD and strong client/server validations.</li>
                    </ul>
                  </div>
                </div>

                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/techs/Task-project-logo.png`}
                      alt="Task Management System"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Task Management System</div>
                  </div>
                  <div className="project-content">
                    <h3>Task Management System</h3>
                    <div className="project-tech">
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/aspnet-mvc.svg`} alt="ASP.NET MVC" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>ASP.NET Core Web API</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/csharp.svg`} alt="C#" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>C#</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/sql-server.svg`} alt="SQL Server" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>SQL Server</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/jquery.svg`} alt="jQuery" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>jQuery</span></span>
                    </div>
                    <ul className="project-points">
                      <li>Create, assign, and track tasks with status, priority, deadline, and owners.</li>
                      <li>Visibility: list and board views with filtering, search, and activity logs; implemented REST APIs for CRUD operations and secured via JWT-based authorization.</li>
                      <li>Reliability and speed via indexed queries, pagination, and input validations.</li>
                      <li>Automated reminders: email notifications and due-date alerts to keep work on track.</li>
                    </ul>
                  </div>
                </div>
                <div className="project-card">
                  <div className="project-image">
                    <img
                      className="project-img"
                      src={`${process.env.PUBLIC_URL}/techs/Reg-project-logo.png`}
                      alt="Full Fledged Registration Page"
                      loading="lazy"
                      onLoad={(e) => { const ph = e.currentTarget.nextElementSibling; if (ph) ph.style.display = 'none'; }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="project-placeholder">Registration System</div>
                  </div>
                  <div className="project-content">
                    <h3>Full Fledged Registration Page</h3>
                    <div className="project-tech">
                      <span>ASP.NET Web Forms</span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/layers.svg`} alt="3-Tier" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>3-Tier</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/jquery.svg`} alt="jQuery" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>jQuery</span></span>
                      <span className="tech-badge logo"><img className="tech-logo" src={`${process.env.PUBLIC_URL}/techs/sql-server.svg`} alt="SQL Server" onError={(e)=>{e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='inline';}} /><span className="tech-fallback" style={{display:'none'}}>SQL Server</span></span>
                    </div>
                    <ul className="project-points">
                      <li>Three-tier architecture: UI, Business Logic, and Data Access layers for maintainability.</li>
                      <li>Robust validations: client-side and server-side checks to ensure data integrity.</li>
                      <li>Reusable components/services to streamline CRUD operations and error handling.</li>
                      <li>Backed by SQL Server with parameterized queries for safe data operations.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Let's work together!</h3>
              <p>I'm always interested in new opportunities and exciting projects.</p>
              <div className="contact-details">
                <div className="contact-item">
                  <strong>Email:</strong> siddharthsenapati09318@gmail.com
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong> (+91) 8093268659
                </div>
                <div className="contact-item">
                  <strong>Location:</strong> Puri, Odisha 752107
                </div>
              </div>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/siddharth-senapati-b35896256/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8 8h3.8v2.2h.1c.5-1 1.8-2.2 3.7-2.2 4 0 4.7 2.6 4.7 6V24h-4v-7.2c0-1.7 0-3.8-2.3-3.8s-2.6 1.8-2.6 3.7V24H8V8z"/></svg>
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/SiddharthSenapati" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.35-3.37-1.35-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 7.26c.85 0 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.56 1.41.21 2.45.11 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.36-.01 2.45-.01 2.78 0 .27.18.6.69.5A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className="contact-form">
              {/* Inline status message above the form */}
              {sendResult && (
                <div className={`form-status ${sendResult.ok ? 'success' : 'error'}`} role="status" aria-live="polite">
                  {sendResult.msg}
                </div>
              )}
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <input name="name" type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input name="email" type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Siddharth Senapati. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
