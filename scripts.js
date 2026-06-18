document.addEventListener('DOMContentLoaded', function() {

    const cards = document.querySelectorAll('.card-inner');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            card.classList.toggle('flipped');
        });
    });

    const modal = document.getElementById('card-modal');
    const modalBody = modal?.querySelector('.modal-body');
    const modalClose = modal?.querySelector('.modal-close');

    function openModal(html) {
        if (!modal) return;
        modalBody.innerHTML = '';
        modalBody.appendChild(html);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalBody.innerHTML = '';
    }

    const expandBtns = document.querySelectorAll('.expand-btn');
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const cardBack = btn.closest('.card-back');
            if (!cardBack) return;
            const content = cardBack.querySelector('.card-back-content');
            if (!content) return;
            const clone = content.cloneNode(true);
            clone.classList.remove('clamped');
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';
            clone.style.padding = '0';
            const innerBtn = clone.querySelector('.expand-btn');
            if (innerBtn) innerBtn.remove();
            openModal(clone);
        });
    });

    const backContents = document.querySelectorAll('.card-back-content');
    backContents.forEach(content => {
        setTimeout(() => {
            if (content.scrollHeight > content.clientHeight) {
                content.classList.add('clamped');
            } else {
                content.classList.remove('clamped');
            }
        }, 50);
    });

    const revealTargets = Array.from(document.querySelectorAll('section, .card, .skill, .sidebar .logo'));
    revealTargets.forEach(el => el.classList.add('reveal'));

    function checkReveal() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        revealTargets.forEach(el => {
            if (el.classList.contains('visible')) return;
            const r = el.getBoundingClientRect();
            if (r.top < vh * 0.92) el.classList.add('visible');
        });
    }

    let revealTicking = false;
    const heroSection = document.getElementById('hero');
    const sidebar = document.querySelector('.sidebar');

    const navLinks = Array.from(document.querySelectorAll('.sidebar ul li a'));
    const trackedSections = navLinks
        .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
        .filter(item => item.section);

    function updateSidebarVisibility() {
        if (!heroSection || !sidebar) return;
        const showSidebar = window.scrollY >= heroSection.offsetHeight - 80;
        sidebar.classList.toggle('visible', showSidebar);
    }

    function updateActiveSidebarLink() {
        const scrollPos = window.scrollY + (window.innerHeight * 0.35);
        let activeItem = trackedSections[0];
        for (const item of trackedSections) {
            const sectionTop = item.section.offsetTop;
            if (sectionTop <= scrollPos) {
                activeItem = item;
            }
        }
        trackedSections.forEach(item => item.link.classList.toggle('active', item === activeItem));
    }

    function onRevealScroll() {
        if (revealTicking) return;
        revealTicking = true;
        requestAnimationFrame(() => {
            checkReveal();
            updateSidebarVisibility();
            updateActiveSidebarLink();
            revealTicking = false;
        });
    }

    requestAnimationFrame(() => {
        checkReveal();
        updateSidebarVisibility();
        updateActiveSidebarLink();
    });
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);

    (function initStarfield() {
        const canvas = document.getElementById('space-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;
        const stars = [];
        const TWO_PI = Math.PI * 2;

        function rand(min, max) { return Math.random() * (max - min) + min; }

        function createStars() {
            stars.length = 0;
            const starCount = Math.floor((width * height) / 6000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z: rand(0.9, 1.6),
                    size: rand(0.9, 2.2),
                    twinkle: Math.random() * TWO_PI,
                    vx: rand(-0.015, 0.015),
                    vy: rand(-0.015, 0.015)
                });
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            createStars();
        }

        function render(now) {
            const dt = Math.min(50, now - last) / 1000;
            last = now;
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';

            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, 'rgba(20, 14, 45, 0.6)');
            grad.addColorStop(1, 'rgba(10, 12, 25, 0.28)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(170, 225, 255, 0.35)';
            for (const s of stars) {
                s.x += s.vx * dt * 60;
                s.y += s.vy * dt * 60;
                if (s.x < 0) s.x = width + 2;
                if (s.x > width) s.x = -2;
                if (s.y < 0) s.y = height + 2;
                if (s.y > height) s.y = -2;
                const alpha = Math.max(0, Math.min(1, 0.45 + Math.sin((now * 0.002) + s.twinkle) * 0.45));
                const radius = s.size * (0.9 + Math.sin(now * 0.003 + s.twinkle) * 0.3);
                ctx.fillStyle = `rgba(140,210,255,${Math.min(1, alpha * s.z * 1.4)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, radius, 0, TWO_PI);
                ctx.fill();
                ctx.globalAlpha = Math.max(0, alpha * 0.14);
                ctx.fillStyle = 'rgba(140,210,255,1)';
                ctx.beginPath();
                ctx.arc(s.x, s.y, radius * 2.2, 0, TWO_PI);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.restore();
            frameId = requestAnimationFrame(render);
        }

        let last = performance.now();
        let frameId = null;
        window.addEventListener('resize', resize);
        resize();
        render(last);
    })();

    modal?.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    modalClose?.addEventListener('click', closeModal);
});
