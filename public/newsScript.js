document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // MOBILE MENU TOGGLE LOGIC
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon to cross icon
            const icon = mobileMenu.querySelector('i');
            if(navMenu.classList.contains('active')){
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close menu when a link is clicked (on mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 992) {
                navMenu.classList.remove('active');
                if(mobileMenu) {
                    const icon = mobileMenu.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // ==========================================
    // 1. Dark/Light Theme Toggle Logic
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            if (document.body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // ==========================================
    // 2. Load More News Logic (Learn More Button)
    // ==========================================
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const learnMoreContainer = document.getElementById('learnMoreContainer');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const hiddenCards = document.querySelectorAll('.hidden-card');
            
            hiddenCards.forEach(card => {
                card.style.display = 'block';
                setTimeout(() => {
                    card.classList.remove('hidden-card');
                }, 10);
            });
            
            if (learnMoreContainer) {
                learnMoreContainer.style.display = 'none';
            }
        });
    }

    // ==========================================
    // 3. Auto-update Hero Background Image
    // ==========================================
    const latestNewsImg = document.querySelector('.news-grid .news-card:first-child .news-image-wrapper img');
    const heroSection = document.querySelector('.news-hero');

    if (latestNewsImg && heroSection) {
        const imgSrc = latestNewsImg.getAttribute('src');
        heroSection.style.backgroundImage = `url('${imgSrc}')`;
    }

});