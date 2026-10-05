/* =========================================================
   HAADIYA PORTFOLIO — INTERACTION CONTROLLER
   ========================================================= */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

/* ---------- Scroll progress + nav state ---------- */
const progress = $('.progress');
const nav = $('.nav');

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;

  if (progress) progress.style.width = `${ratio * 100}%`;
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 35);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

/* ---------- Pointer system ---------- */
const cursor = $('.cursor');
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;

window.addEventListener('pointermove', e => {
  pointerX = e.clientX;
  pointerY = e.clientY;

  document.documentElement.style.setProperty('--mx', `${pointerX}px`);
  document.documentElement.style.setProperty('--my', `${pointerY}px`);

  if (cursor) {
    cursor.style.left = `${pointerX}px`;
    cursor.style.top = `${pointerY}px`;
  }

  // subtle orbital parallax
  const orb = $('.orb');
  if (orb && window.innerWidth > 900) {
    const x = (pointerX / window.innerWidth - .5) * 18;
    const y = (pointerY / window.innerHeight - .5) * 18;
    orb.style.transform = `translate(${x}px, ${y}px)`;
  }
}, { passive: true });

const interactive = $$('a, button, .project, .stack-list article, .facts div');

interactive.forEach(el => {
  el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
});

window.addEventListener('pointerdown', () => cursor?.classList.add('click'));
window.addEventListener('pointerup', () => cursor?.classList.remove('click'));

/* ---------- Hero typing / split words ---------- */
const heroHeading = $('.hero h1');
if (heroHeading) {
  const nodes = [...heroHeading.childNodes];
  heroHeading.innerHTML = '';

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach(piece => {
        if (!piece.trim()) {
          heroHeading.append(document.createTextNode(piece));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = piece;
          heroHeading.append(span);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const span = document.createElement('span');
      span.className = 'word';
      span.innerHTML = node.outerHTML;
      heroHeading.append(span);
    }
  });
}

const kicker = $('.kicker');
if (kicker) {
  kicker.innerHTML = `<span>${kicker.textContent}</span>`;
}

/* ---------- Generic viewport reveals ---------- */
const revealTargets = [
  ...$$('.section-label'),
  ...$$('.section-title'),
  ...$$('.about-copy'),
  ...$$('.stack-list'),
  ...$$('.work-head'),
  ...$$('.projects'),
  ...$$('.timeline'),
  ...$$('.contact > h2'),
  ...$$('.contact > p'),
  ...$$('.contact-actions'),
  ...$$('.footer')
];

revealTargets.forEach((el, index) => {
  el.classList.add('motion-hidden');
  if (index % 3 === 1) el.classList.add('from-left');
  if (index % 3 === 2) el.classList.add('from-right');
});

$$('.stack-list, .projects, .timeline, .facts').forEach(el => el.classList.add('stagger'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      if (entry.target.classList.contains('contact')) {
        entry.target.classList.add('in-view');
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

revealTargets.forEach(el => revealObserver.observe(el));
$$('.stack-list, .projects, .timeline, .facts').forEach(el => revealObserver.observe(el));

/* ---------- Contact ambient animation ---------- */
const contact = $('.contact');
if (contact) {
  const contactObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) contact.classList.add('in-view');
    });
  }, { threshold: .2 });
  contactObserver.observe(contact);
}

/* ---------- 3D project tilt ---------- */
if (window.matchMedia('(pointer:fine)').matches) {
  $$('.project').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateY = (x - .5) * 5;
      const rotateX = (.5 - y) * 5;

      card.style.setProperty('--px', `${x * 100}%`);
      card.style.setProperty('--py', `${y * 100}%`);
      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px)`;

      const art = $('.project-art', card);
      if (art) {
        art.style.transform =
          `translate(${(x - .5) * 7}px, ${(y - .5) * 7}px) scale(1.025)`;
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      const art = $('.project-art', card);
      if (art) art.style.transform = '';
    });
  });
}

/* ---------- Magnetic buttons ---------- */
if (window.matchMedia('(pointer:fine)').matches) {
  $$('.button, .nav-cta').forEach(button => {
    button.addEventListener('pointermove', e => {
      const r = button.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      button.style.transform = `translate(${x * .13}px, ${y * .13}px)`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

/* ---------- Animated counters for facts ---------- */
function animateNumber(el, target, duration = 900) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ---------- Mobile menu ---------- */
const menu = $('.menu');
const navLinks = $('.nav nav');

menu?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');

  if (open) {
    Object.assign(navLinks.style, {
      display: 'flex',
      position: 'absolute',
      top: '64px',
      left: '0',
      right: '0',
      padding: '25px 6vw',
      background: 'rgba(15,13,18,.98)',
      flexDirection: 'column',
      borderBottom: '1px solid rgba(255,255,255,.14)'
    });
  } else {
    navLinks.style.display = '';
  }
});

$$('.nav nav a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth < 901) {
      navLinks.classList.remove('open');
      navLinks.style.display = 'none';
    }
  });
});

/* ---------- Smooth anchor navigation ---------- */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth'
    });
  });
});

/* ---------- Scroll velocity gives hero a tiny depth shift ---------- */
let lastScroll = window.scrollY;
let velocity = 0;

window.addEventListener('scroll', () => {
  velocity = window.scrollY - lastScroll;
  lastScroll = window.scrollY;

  const heroMain = $('.hero-main');
  if (heroMain && window.scrollY < window.innerHeight) {
    const shift = Math.max(-35, Math.min(35, -window.scrollY * .08));
    heroMain.style.transform = `translateY(${shift}px)`;
  }
}, { passive: true });

/* ---------- Easter egg: press H ---------- */
let hTimer;
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'h') return;

  const logo = $('.logo');
  if (!logo) return;

  clearTimeout(hTimer);
  logo.textContent = 'H ✦';
  logo.style.color = '#b48ab0';

  hTimer = setTimeout(() => {
    logo.innerHTML = 'H<span>.</span>';
    logo.style.color = '';
  }, 1000);
});
