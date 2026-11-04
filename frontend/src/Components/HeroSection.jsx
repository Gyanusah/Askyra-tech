// import { useEffect, useState } from "react";

// import {
//   Menu,
//   X,
//   Search,
//   Shield,
//   ShieldCheck,
//   Code2,
//   GraduationCap,
//   ArrowUpRight,
//   ChevronRight,
//   LockKeyhole,
// } from "lucide-react";

// const navItems = ["Home", "Courses", "Services", "Register", "Contact"];

// function Brand() {
//   return (
//     <a href="#home" className="brand" aria-label="AskYRA Tech home">
//       <span className="brand-mark">
//         <ShieldCheck size={30} strokeWidth={1.7} />
//       </span>
//       <span className="brand-copy">
//         <strong>ASKYRA TECH</strong>
//         <small>Cybersecurity | Development | Training</small>
//       </span>
//     </a>
//   );
// }

// function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [activeItem, setActiveItem] = useState(() =>
//     navItems.find((item) => `#${item.toLowerCase()}` === window.location.hash) ??
//     "Home",
//   );

//   useEffect(() => {
//     const updateActiveItem = () => {
//       setActiveItem(
//         navItems.find((item) => `#${item.toLowerCase()}` === window.location.hash) ??
//           "Home",
//       );
//     };

//     window.addEventListener("hashchange", updateActiveItem);
//     return () => window.removeEventListener("hashchange", updateActiveItem);
//   }, []);

//   return (
//     <header className="site-header">
//       <Brand />
//       <nav
//         className={`nav-links ${menuOpen ? "nav-open" : ""}`}
//         aria-label="Main navigation"
//       >
//         {navItems.map((item) => (
//           <a
//             key={item}
//             className={`nav-link ${activeItem === item ? "active" : ""}`}
//             href={`#${item.toLowerCase()}`}
//             aria-current={activeItem === item ? "page" : undefined}
//             onClick={() => {
//               setActiveItem(item);
//               setMenuOpen(false);
//             }}
//           >
//             {item}
//           </a>
//         ))}
//         <a className="mobile-login" href="#login">
//           Login / Signup
//         </a>
//       </nav>
//       <div className="header-actions">
//         {searchOpen && (
//           <input
//             autoFocus
//             className="search-input"
//             placeholder="Search..."
//             aria-label="Search"
//           />
//         )}
//         <button
//           className="icon-button search-button"
//           aria-label="Toggle search"
//           onClick={() => setSearchOpen(!searchOpen)}
//         >
//           <Search size={19} />
//         </button>
//         <a className="login-button" href="#login">
//           Login / Signup <ArrowUpRight size={15} />
//         </a>
//         <button
//           className="icon-button menu-button"
//           aria-label="Toggle menu"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? <X size={23} /> : <Menu size={23} />}
//         </button>
//       </div>
//     </header>
//   );
// }

// function HeroArtwork() {
//   return (
//     <div className="hero-art" aria-label="Cybersecurity illustration">
//       <div className="art-grid" />
//       <div className="orbit orbit-one" />
//       <div className="orbit orbit-two" />
//       <div className="globe">
//         <div className="globe-line vertical" />
//         <div className="globe-line horizontal" />
//         <div className="continent continent-one" />
//         <div className="continent continent-two" />
//         <div className="continent continent-three" />
//       </div>
//       <div className="shield-float">
//         <Shield size={58} strokeWidth={1.2} />
//         <LockKeyhole size={22} />
//       </div>
//       <div className="hoodie">
//         <div className="hood" />
//         <div className="face">
//           <span />
//         </div>
//         <div className="body" />
//         <div className="laptop">
//           <div className="laptop-logo">
//             <ShieldCheck size={27} />
//           </div>
//         </div>
//       </div>
//       <div className="mini-shield">
//         <ShieldCheck size={25} />
//       </div>
//       <div className="art-caption">
//         Learn <b>•</b> Build <b>•</b> Secure <b>•</b> Grow
//       </div>
//     </div>
//   );
// }

// function HeroSection() {
//   return (
//     <main className="page-shell" id="home">
//       <div className="ambient ambient-a" />
//       <div className="ambient ambient-b" />
//       <Header />
//       <section className="hero">
//         <div className="hero-copy">
//           <div className="eyebrow">
//             <span>CYBERSECURITY</span>
//             <i>•</i>
//             <span>DEVELOPMENT</span>
//             <i>•</i>
//             <span>TRAINING</span>
//           </div>
//           <h1>
//             Empowering Companies &amp; Students{" "}
//             <span>with Security &amp; Development Expertise</span>
//           </h1>
//           <p className="hero-description">
//             Training, services, and solutions tailored for your growth.
//           </p>
//           <div className="hero-actions">
//             <a href="#courses" className="button button-primary">
//               Explore Courses <ChevronRight size={17} />
//             </a>
//             <a href="#services" className="button button-outline">
//               Request Services
//             </a>
//           </div>
//           <div className="trust-row">
//             <span>
//               <ShieldCheck size={15} /> Security-first
//             </span>
//             <span>
//               <Code2 size={15} /> Practical learning
//             </span>
//             <span>
//               <GraduationCap size={16} /> Career-focused
//             </span>
//           </div>
//         </div>
//         <HeroArtwork />
//       </section>
//       <section className="feature-strip" aria-label="What we offer">
//         <article>
//           <span className="feature-icon">
//             <ShieldCheck size={21} />
//           </span>
//           <div>
//             <h2>Cybersecurity</h2>
//             <p>Build safer digital experiences.</p>
//           </div>
//         </article>
//         <article>
//           <span className="feature-icon">
//             <Code2 size={21} />
//           </span>
//           <div>
//             <h2>Development</h2>
//             <p>Turn ideas into useful products.</p>
//           </div>
//         </article>
//         <article>
//           <span className="feature-icon">
//             <GraduationCap size={22} />
//           </span>
//           <div>
//             <h2>Training</h2>
//             <p>Learn by building real skills.</p>
//           </div>
//         </article>
//       </section>
//       <section className="below-section" id="courses">
//         <p className="section-kicker">YOUR NEXT STEP STARTS HERE</p>
//         <h2>
//           Learn. Build. Secure. <span>Grow.</span>
//         </h2>
//         <p>
//           Explore hands-on courses and technology services designed to help you
//           move forward.
//         </p>
//         <div className="below-cards" id="services">
//           <div>
//             <ShieldCheck />
//             <h3>Security solutions</h3>
//             <p>Practical guidance for a more secure digital world.</p>
//           </div>
//           <div>
//             <Code2 />
//             <h3>Web development</h3>
//             <p>Modern, responsive websites and applications.</p>
//           </div>
//           <div>
//             <GraduationCap />
//             <h3>Career training</h3>
//             <p>Skill-focused learning for students and teams.</p>
//           </div>
//         </div>
//       </section>
//       <footer id="contact">
//         <Brand />
//         <span>
//           © {new Date().getFullYear()} AskYRA Tech. Learn • Build • Secure •
//           Grow
//         </span>
//       </footer>
//     </main>
//   );
// }

// export default HeroSection;

import {
  Shield,
  ShieldCheck,
  Code2,
  GraduationCap,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";
import { Link } from "react-router-dom";

function HeroArtwork() {
  return (
    <div className="hero-art" aria-label="Cybersecurity illustration">
      <div className="art-grid" />

      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />

      <div className="globe">
        <div className="globe-line vertical" />
        <div className="globe-line horizontal" />
        <div className="continent continent-one" />
        <div className="continent continent-two" />
        <div className="continent continent-three" />
      </div>

      <div className="shield-float">
        <Shield size={58} strokeWidth={1.2} />
        <LockKeyhole size={22} />
      </div>

      <div className="hoodie">
        <div className="hood" />
        <div className="face">
          <span />
        </div>
        <div className="body" />
        <div className="laptop">
          <div className="laptop-logo">
            <ShieldCheck size={27} />
          </div>
        </div>
      </div>

      <div className="mini-shield">
        <ShieldCheck size={25} />
      </div>

      <div className="art-caption">
        Learn <b>•</b> Build <b>•</b> Secure <b>•</b> Grow
      </div>
    </div>
  );
}

function HeroContent() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span>CYBERSECURITY</span>
          <i>•</i>
          <span>DEVELOPMENT</span>
          <i>•</i>
          <span>TRAINING</span>
        </div>

        <h1>
          Empowering Companies &amp; Students{" "}
          <span>with Security &amp; Development Expertise</span>
        </h1>

        <p className="hero-description">
          Training, services, and solutions tailored for your growth.
        </p>

        <div className="hero-actions">
          <Link to="/courses" className="button button-primary">
            Explore Courses <ChevronRight size={17} />
          </Link>

          <Link to="/services" className="button button-outline">
            Request Services
          </Link>
        </div>

        <div className="trust-row">
          <span>
            <ShieldCheck size={15} /> Security-first
          </span>

          <span>
            <Code2 size={15} /> Practical learning
          </span>

          <span>
            <GraduationCap size={16} /> Career-focused
          </span>
        </div>
      </div>

      <HeroArtwork />
    </section>
  );
}

function FeatureStrip() {
  return (
    <section className="feature-strip" aria-label="What we offer">
      <article>
        <span className="feature-icon">
          <ShieldCheck size={21} />
        </span>
        <div>
          <h2>Cybersecurity</h2>
          <p>Build safer digital experiences.</p>
        </div>
      </article>

      <article>
        <span className="feature-icon">
          <Code2 size={21} />
        </span>
        <div>
          <h2>Development</h2>
          <p>Turn ideas into useful products.</p>
        </div>
      </article>

      <article>
        <span className="feature-icon">
          <GraduationCap size={22} />
        </span>
        <div>
          <h2>Training</h2>
          <p>Learn by building real skills.</p>
        </div>
      </article>
    </section>
  );
}

function BelowSection() {
  return (
    <section className="below-section">
      <p className="section-kicker">YOUR NEXT STEP STARTS HERE</p>

      <h2>
        Learn. Build. Secure. <span>Grow.</span>
      </h2>

      <p>
        Explore hands-on courses and technology services designed to help you
        move forward.
      </p>

      <div className="below-cards">
        <div id="services">
          <ShieldCheck />
          <h3>Security solutions</h3>
          <p>Practical guidance for a more secure digital world.</p>
        </div>

        <div>
          <Code2 />
          <h3>Web development</h3>
          <p>Modern, responsive websites and applications.</p>
        </div>

        <div>
          <GraduationCap />
          <h3>Career training</h3>
          <p>Skill-focused learning for students and teams.</p>
        </div>
      </div>
    </section>
  );
}

export default function HeroSection() {
  return (
    <main className="page-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <div id="home">
        <HeroContent />
      </div>

      <FeatureStrip />

      <div id="courses">
        <BelowSection />
      </div>

      <footer id="contact">
        <span>
          © {new Date().getFullYear()} AskYRA Tech. Learn • Build • Secure •
          Grow
        </span>
      </footer>
    </main>
  );
}
