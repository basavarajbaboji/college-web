/**
 * COLLEGE WEBSITE - Main JavaScript
 * Dynamic features, animations, and interactivity
 */

console.log("📚 College Website Loaded");

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("✨ DOM Ready - Initializing features...");

    // Initialize all features with error handling
    try { initScrollProgress(); } catch (e) { console.log('Scroll progress not needed on this page'); }
    try { initGallery(); } catch (e) { console.log('Gallery not present on this page'); }
    try { initMobileMenu(); } catch (e) { console.log('Mobile menu error:', e); }
    try { initScrollAnimations(); } catch (e) { console.log('Scroll animations not needed'); }
    try { initParallaxEffects(); } catch (e) { console.log('Parallax not needed on this page'); }
    try { initFormEnhancements(); } catch (e) { console.log('Form enhancements not needed'); }

    // Apply saved visual styles
    fetch('/api/get_styles')
        .then(res => res.json())
        .then(styles => {
            Object.entries(styles).forEach(([selector, rules]) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    Object.assign(el.style, rules);
                });
            });
            console.log("🎨 Applied custom visual styles");
        })
        .catch(err => console.log('No custom styles found or error loading them.'));

    console.log("🎉 Page initialized!");
});

// ========================================
// SCROLL PROGRESS BAR
// ========================================
function initScrollProgress() {
    // Don't add on admin pages
    if (window.location.pathname.includes('/admin')) return;

    // Check if already exists
    if (document.querySelector('.scroll-progress')) return;

    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }
    });
}

// ========================================
// IMAGE GALLERY WITH SMOOTH TRANSITIONS
// ========================================
function initGallery() {
    const images = document.querySelectorAll('.gallery-image');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Exit if gallery elements don't exist
    if (!images.length || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let autoPlayInterval;

    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    // Start autoplay
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextImage, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Event listeners
    // Clone buttons to remove existing listeners (prevent duplicate bindings on re-init)
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    // Re-assign to use the new elements
    const activePrev = newPrev;
    const activeNext = newNext;

    activePrev.addEventListener('click', () => {
        stopAutoPlay();
        prevImage();
        startAutoPlay();
    });

    activeNext.addEventListener('click', () => {
        stopAutoPlay();
        nextImage();
        startAutoPlay();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAutoPlay();
            prevImage();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            stopAutoPlay();
            nextImage();
            startAutoPlay();
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    const galleryContainer = document.querySelector('.gallery-images');

    if (galleryContainer) {
        galleryContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        galleryContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                stopAutoPlay();
                if (diff > 0) {
                    nextImage();
                } else {
                    prevImage();
                }
                startAutoPlay();
            }
        });
    }

    // Initialize
    showImage(currentIndex);
    startAutoPlay();
}

// ========================================
// MOBILE MENU TOGGLE
// ========================================
function initMobileMenu() {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');

    if (!nav || !navLinks) return;

    // Find or create menu toggle button
    let menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) return; // If no toggle button exists, exit

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('show');
        menuToggle.innerHTML = isOpen ? '✕' : '☰';
        // Removed body scroll lock for dropdown behavior
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.innerHTML = '☰';
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            menuToggle.innerHTML = '☰';
        });
    });
}

// ========================================
// SCROLL-TRIGGERED ANIMATIONS
// ========================================
function initScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;

    // Observe elements for animation on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections and list items
    const elementsToAnimate = document.querySelectorAll('.section, .branches-list li, .faculty-list li');
    if (elementsToAnimate.length === 0) return;

    elementsToAnimate.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// ========================================
// PARALLAX EFFECTS
// ========================================
function initParallaxEffects() {
    const heroSection = document.querySelector('.hero-section');
    const heroImage = document.querySelector('.hero-image img');

    if (!heroSection || !heroImage) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;

        if (scrolled < window.innerHeight) {
            heroImage.style.transform = `translateY(${rate * 0.5}px) scale(${1 + scrolled * 0.0002})`;
        }
    });
}

// ========================================
// FORM ENHANCEMENTS
// ========================================
function initFormEnhancements() {
    const forms = document.querySelectorAll('form');

    if (forms.length === 0) return;

    forms.forEach(form => {
        // Add focus effects
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (input.parentElement) {
                    input.parentElement.classList.add('focused');
                }
            });

            input.addEventListener('blur', () => {
                if (!input.value && input.parentElement) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });

        // Contact form submission with animation
        if (form.id === 'contactForm') {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = form.querySelector('button[type="submit"]');
                const responseDiv = document.getElementById('formResponse');

                if (!submitBtn || !responseDiv) return;

                const originalText = submitBtn.textContent;

                // Show loading state
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                try {
                    const formData = {
                        name: form.querySelector('#name')?.value || '',
                        email: form.querySelector('#email')?.value || '',
                        message: form.querySelector('#message')?.value || ''
                    };

                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        responseDiv.innerHTML = `<p style="color: var(--accent-green);">✓ ${data.message}</p>`;
                        form.reset();
                        submitBtn.textContent = '✓ Sent!';
                        setTimeout(() => {
                            submitBtn.textContent = originalText;
                        }, 2000);
                    } else {
                        responseDiv.innerHTML = `<p style="color: var(--accent-orange);">✗ ${data.error}</p>`;
                        submitBtn.textContent = originalText;
                    }
                } catch (error) {
                    responseDiv.innerHTML = `<p style="color: var(--accent-orange);">✗ An error occurred. Please try again.</p>`;
                    submitBtn.textContent = originalText;
                }

                submitBtn.disabled = false;
            });
        }
    });
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================
const header = document.querySelector('header');
if (header) {
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return; // Skip empty anchors

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
function animateCounter(element, target, duration = 2000) {
    if (!element) return;

    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    updateCounter();
}

// Expose utility functions globally
window.CollegeUI = {
    animateCounter,
    initGallery
};
