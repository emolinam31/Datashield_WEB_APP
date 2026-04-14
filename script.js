/* ============================================
   CORE-GUARD — Interactive Scripts
   Particle System, Animations, Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // PARTICLE SYSTEM
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 185 : 260; // cyan or purple
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.008;
                    this.speedX -= dx * force;
                    this.speedY -= dy * force;
                }
            }

            // Damping
            this.speedX *= 0.999;
            this.speedY *= 0.999;

            // Bounds
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            if (this.hue === 185) {
                ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
            } else {
                ctx.fillStyle = `rgba(123, 97, 255, ${this.opacity})`;
            }
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animationId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    initParticles();
    animateParticles();

    // Re-init on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initParticles();
        }, 200);
    });


    // ==========================================
    // NAVBAR
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });


    // ==========================================
    // SCROLL ANIMATIONS (AOS-like)
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });


    // ==========================================
    // COUNTER ANIMATION
    // ==========================================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCount(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Easing: ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);

                        entry.target.textContent = current.toLocaleString('es-CO');

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        }
                    }

                    requestAnimationFrame(updateCount);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounters();


    // ==========================================
    // ACTIVE NAV LINK HIGHLIGHT
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.style.color = '';
                });
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink && !activeLink.classList.contains('nav-link--cta')) {
                    activeLink.style.color = '#00F0FF';
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNav);


    // ==========================================
    // CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const originalContent = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Enviando...</span>';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<span>✓ Solicitud enviada</span>';
            submitBtn.style.opacity = '1';
            submitBtn.style.background = 'linear-gradient(135deg, #00D68F, #00F0FF)';

            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 3000);
        }, 1500);
    });


    // ==========================================
    // TILT EFFECT ON SERVICE CARDS
    // ==========================================
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -2;
            const rotateY = (x - centerX) / centerX * 2;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });


    // ==========================================
    // GLOW CURSOR EFFECT ON METRIC CARDS
    // ==========================================
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `radial-gradient(circle 120px at ${x}px ${y}px, rgba(0, 240, 255, 0.06), transparent)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = '';
        });
    });


    // ==========================================
    // TYPING EFFECT FOR HERO
    // ==========================================
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(20px)';

        setTimeout(() => {
            heroTitle.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 300);
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(20px)';

        setTimeout(() => {
            heroSubtitle.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 600);
    }

    const heroActions = document.querySelector('.hero-actions');
    if (heroActions) {
        heroActions.style.opacity = '0';
        heroActions.style.transform = 'translateY(20px)';

        setTimeout(() => {
            heroActions.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            heroActions.style.opacity = '1';
            heroActions.style.transform = 'translateY(0)';
        }, 900);
    }

});
