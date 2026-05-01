document.addEventListener('DOMContentLoaded', () => {

    // ---------- MENU MOBILE ----------
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = mainNav.querySelectorAll('a[href^="#"]');

    function openMenu() {
        mainNav.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', () => {
        mainNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) closeMenu();
    });

    // ---------- SMOOTH SCROLL (avec offset header) ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const headerHeight = document.querySelector('header').offsetHeight;
            window.scrollTo({
                top: target.offsetTop - headerHeight - 20,
                behavior: 'smooth'
            });
        });
    });

    // ---------- ACCORDÉON FAQ (details) ----------
    document.querySelectorAll('.faq-item').forEach(details => {
        details.addEventListener('toggle', () => {
            if (details.open) {
                // Fermer les autres
                document.querySelectorAll('.faq-item[open]').forEach(other => {
                    if (other !== details) other.open = false;
                });
            }
        });
    });

    // ---------- LEÇONS ACCORDÉON ----------
    document.querySelectorAll('.lesson-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const lesson = btn.closest('.lesson');
            const isOpen = lesson.hasAttribute('open');
            // Ferme les autres leçons
            document.querySelectorAll('.lesson[open]').forEach(l => l.removeAttribute('open'));
            if (!isOpen) lesson.setAttribute('open', '');
        });
    });

    // ---------- COPY TO CLIPBOARD + TOAST ----------
    const toast = document.getElementById('toast');
    let toastTimer;

    window.copyToClipboard = function(elementId, message) {
        const el = document.getElementById(elementId);
        const text = el?.textContent.trim();
        navigator.clipboard.writeText(text).then(() => showToast(message)).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(message);
        });
    };

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ---------- FORMULAIRE DE RÉSERVATION (WhatsApp) ----------
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm()) return;

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const courseType = document.getElementById('courseType').value;
        const phone = document.getElementById('phone').value.replace(/[\s.-]/g, '');
        const message = document.getElementById('message').value.trim() || 'Non spécifié';

        const text = `Bonjour Yassine, je souhaite réserver un cours.\n\nNom : ${fullname}\nEmail : ${email}\nFormule : ${courseType}\nTéléphone : ${phone}\nMessage : ${message}`;
        const whatsappURL = `https://wa.me/33758648161?text=${encodeURIComponent(text)}`;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        submitBtn.disabled = true;

        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            form.reset();
            clearErrors();
        }, 600);
    });

    function validateForm() {
        let valid = true;
        clearErrors();

        const fullname = document.getElementById('fullname');
        if (!fullname.value.trim() || fullname.value.trim().length < 2) {
            showError(fullname, 'Nom requis (min. 2 caractères)');
            valid = false;
        }

        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            showError(email, 'Email valide requis');
            valid = false;
        }

        const courseType = document.getElementById('courseType');
        if (!courseType.value) {
            showError(courseType, 'Veuillez choisir une formule');
            valid = false;
        }

        const phone = document.getElementById('phone');
        const phoneClean = phone.value.replace(/[\s.-]/g, '');
        const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
        if (!phoneClean || !phoneRegex.test(phoneClean)) {
            showError(phone, 'Téléphone valide requis (format français)');
            valid = false;
        }

        if (!valid) {
            form.querySelector('.error')?.focus();
        }
        return valid;
    }

    function showError(field, message) {
        const group = field.closest('.form-group');
        group.classList.add('error');
        group.querySelector('.error-msg').textContent = message;
        field.addEventListener('input', () => {
            group.classList.remove('error');
            group.querySelector('.error-msg').textContent = '';
        }, { once: true });
    }

    function clearErrors() {
        form.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
        form.querySelectorAll('.error-msg').forEach(span => span.textContent = '');
    }

    // ---------- FLOATING CTA ----------
    const floatingCta = document.getElementById('floatingCta');
    const reservationSection = document.getElementById('reservation');
    window.addEventListener('scroll', () => {
        if (!reservationSection) return;
        const rect = reservationSection.getBoundingClientRect();
        const visible = (rect.top > window.innerHeight || rect.bottom < 0);
        floatingCta.classList.toggle('visible', visible);
    }, { passive: true });

    // ---------- ANIMATION AU SCROLL (reveal) ----------
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach(el => observer.observe(el));

    // ---------- PACKS : pré-remplir la sélection dans le formulaire ----------
    document.querySelectorAll('.pack-radio').forEach(radio => {
        radio.addEventListener('change', function() {
            const select = document.getElementById('courseType');
            if (this.id === 'pack-unite') select.value = '';
            if (this.id === 'pack-5') select.value = 'Pack 5 cours (45€)';
            if (this.id === 'pack-10') select.value = 'Pack 10 cours (80€)';
        });
    });

    console.log('✨ Yassine Darija – Expérience 10/10 prête.');
});