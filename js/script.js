// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. Navigation mobile accessible =====
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

    function openMenu() {
        navLinks.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
        document.body.style.overflow = 'hidden';
        // Focus le premier lien
        setTimeout(() => navAnchors[0]?.focus(), 100);
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        document.body.style.overflow = '';
        menuToggle.focus();
    }

    menuToggle.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Fermer le menu quand on clique sur un lien
    navAnchors.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    // Fermer avec Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    // ===== 2. Smooth scroll (compatible avec le menu) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 3. Leçons pliables =====
    window.toggleLesson = function(button) {
        const panel = button.nextElementSibling;
        const isOpen = panel.classList.contains('open');
        const icon = button.querySelector('.fa-chevron-down');

        // Ferme tous les autres
        document.querySelectorAll('.lesson-panel.open').forEach(p => {
            if (p !== panel) p.classList.remove('open');
        });
        document.querySelectorAll('.fa-chevron-down').forEach(i => {
            if (i !== icon) i.style.transform = 'rotate(0deg)';
        });

        panel.classList.toggle('open');
        button.setAttribute('aria-expanded', !isOpen);
        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    };

    // ===== 4. Toast notification =====
    window.copyToClipboard = function(elementId, message) {
        const element = document.getElementById(elementId);
        const text = element?.textContent || element?.innerText || '';
        navigator.clipboard.writeText(text.trim()).then(() => {
            showToast(message);
        }).catch(() => {
            // Fallback pour contextes non sécurisés
            const textarea = document.createElement('textarea');
            textarea.value = text.trim();
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(message);
        });
    };

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.querySelector('span').textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // ===== 5. Formulaire de réservation =====
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let valid = true;

        // Nettoyage des erreurs précédentes
        bookingForm.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
        bookingForm.querySelectorAll('.error-msg').forEach(msg => msg.remove());

        const fullname = document.getElementById('fullname');
        const email = document.getElementById('email');
        const courseType = document.getElementById('courseType');
        const phone = document.getElementById('phone');

        // Validation nom
        if (!fullname.value.trim() || fullname.value.trim().length < 2) {
            markError(fullname, 'Veuillez entrer votre nom complet');
            valid = false;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            markError(email, 'Veuillez entrer un email valide');
            valid = false;
        }

        // Validation type de cours
        if (!courseType.value) {
            markError(courseType, 'Veuillez choisir une formule');
            valid = false;
        }

        // Validation téléphone
        const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
        const phoneClean = phone.value.replace(/[\s.-]/g, '');
        if (!phoneClean || !phoneRegex.test(phoneClean)) {
            markError(phone, 'Veuillez entrer un numéro de téléphone valide');
            valid = false;
        }

        if (!valid) {
            // Scroll au premier champ en erreur
            bookingForm.querySelector('.error')?.focus();
            return;
        }

        // Construction du message WhatsApp
        const message = encodeURIComponent(
            `Bonjour Yassine, je souhaite réserver un cours.\n\n` +
            `Nom : ${fullname.value.trim()}\n` +
            `Email : ${email.value.trim()}\n` +
            `Formule : ${courseType.value}\n` +
            `Téléphone : ${phone.value.trim()}\n` +
            `Message : ${document.getElementById('message')?.value.trim() || 'Non spécifié'}`
        );
        const whatsappURL = `https://wa.me/33758648161?text=${message}`;

        // Feedback visuel
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitBtn.disabled = true;

        // Redirection WhatsApp
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            bookingForm.reset();
            showToast('✓ Redirection vers WhatsApp...');
        }, 800);
    });

    function markError(field, message) {
        field.classList.add('error');
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-msg text-xs text-[--destructive] mt-1 block';
        errorMsg.textContent = message;
        field.parentNode.appendChild(errorMsg);
        field.addEventListener('input', () => {
            field.classList.remove('error');
            const msg = field.parentNode.querySelector('.error-msg');
            if (msg) msg.remove();
        }, { once: true });
    }

    // ===== 6. Floating CTA =====
    const floatingCta = document.getElementById('floatingCta');
    const reservationSection = document.getElementById('reservation');
    
    function updateFloatingCta() {
        if (!reservationSection) return;
        const rect = reservationSection.getBoundingClientRect();
        // Afficher si la section réservation n'est pas dans le viewport
        if (rect.top > window.innerHeight || rect.bottom < 0) {
            floatingCta.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', updateFloatingCta, { passive: true });
    updateFloatingCta();

    // ===== 7. Animation au scroll (fade-up) =====
    const animatedElements = document.querySelectorAll('.fade-up, [class*="hover:-translate"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => {
        if (!el.classList.contains('fade-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }
        observer.observe(el);
    });

    // ===== 8. Packs – sélection visuelle =====
    document.querySelectorAll('.pack-radio').forEach(radio => {
        radio.addEventListener('change', function() {
            // Mise à jour visuelle déjà gérée par CSS
            // On pourrait pré-remplir le formulaire
            const courseType = document.getElementById('courseType');
            if (this.id === 'pack-unite') courseType.value = '';
            if (this.id === 'pack-5') courseType.value = 'Pack 5 cours (45€)';
            if (this.id === 'pack-10') courseType.value = 'Pack 10 cours (80€)';
        });
    });

    console.log('✨ Nour Alarabiya – interface modernisée et prête');
});