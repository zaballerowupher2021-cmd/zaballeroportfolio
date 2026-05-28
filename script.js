/* LOADER */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 900);
});

/* THEME TOGGLE */
const themeBtn = document.getElementById('themeToggle');

let isDark = true;

themeBtn.addEventListener('click', () => {

  isDark = !isDark;

  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light'
  );

  themeBtn.textContent = isDark ? '🌙' : '☀️';
});

/* CUSTOM CURSOR */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', e => {

  mouseX = e.clientX;
  mouseY = e.clientY;

  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

function animateRing(){

  ring.style.left = mouseX + 'px';
  ring.style.top = mouseY + 'px';

  requestAnimationFrame(animateRing);
}

animateRing();

/* MOBILE MENU */
function openMobileMenu(){
  document.getElementById('mobileMenu').classList.add('open');
}

function closeMobileMenu(){
  document.getElementById('mobileMenu').classList.remove('open');
}

/* PARTICLE BACKGROUND */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i = 0; i < 70; i++){

  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2
  });
}

function drawParticles(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p => {

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

drawParticles();