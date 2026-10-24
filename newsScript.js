document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !navMenu.classList.contains('active'));
                icon.classList.toggle('fa-xmark', navMenu.classList.contains('active'));
            }
        });
    }
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
        if (window.innerWidth <= 992 && navMenu) navMenu.classList.remove('active');
    }));

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });

    const grid = document.getElementById('newsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => {
        document.querySelectorAll('.news-grid .hidden-card').forEach(card => card.classList.remove('hidden-card'));
        const container = document.getElementById('learnMoreContainer');
        if (container) container.style.display = 'none';
    });
    if (grid) loadNews(grid);
    loadNewsDetail();
});

const garageFirebaseConfig = {
    apiKey: "AIzaSyCDqryDjXE4mipP-sAxH5ExJ_x9-mr2gli0",
    authDomain: "garage-lk-c27a9.firebaseapp.com",
    projectId: "garage-lk-c27a9",
    storageBucket: "garage-lk-c27a9.firebasestorage.app",
    messagingSenderId: "974892352940",
    appId: "1:974892352940:web:860ae44797ab1b976f6609"
};

function getNewsDatabase() {
    if (!window.firebase || !firebase.firestore) throw new Error('News database is unavailable.');
    if (!firebase.apps.length) firebase.initializeApp(garageFirebaseConfig);
    return firebase.firestore();
}

function newsDate(value) {
    const date = value && typeof value.toDate === 'function' ? value.toDate() : (value ? new Date(value) : null);
    return date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
}

function makeNewsCard(id, news) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    const openArticle = () => { window.location.href = `newsin.html?id=${encodeURIComponent(id)}`; };
    card.addEventListener('click', openArticle);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openArticle(); } });

    const imageWrap = document.createElement('div');
    imageWrap.className = 'news-image-wrapper';
    const date = document.createElement('span');
    date.className = 'news-date';
    date.textContent = newsDate(news.createdAt) || 'GARAGE.lk News';
    imageWrap.append(date);
    if (news.imageUrl) {
        const image = document.createElement('img');
        image.src = news.imageUrl;
        image.alt = news.imageAlt || news.title || 'News article image';
        image.loading = 'lazy';
        imageWrap.append(image);
    }
    const content = document.createElement('div');
    content.className = 'news-content';
    const title = document.createElement('h4');
    title.textContent = news.title || 'Untitled news';
    content.append(title);
    if (news.summary) {
        const summary = document.createElement('p');
        summary.textContent = news.summary;
        content.append(summary);
    }
    const link = document.createElement('a');
    link.href = `newsin.html?id=${encodeURIComponent(id)}`;
    link.className = 'news-arrow';
    link.setAttribute('aria-label', `Read ${news.title || 'news article'}`);
    link.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    link.addEventListener('click', event => event.stopPropagation());
    content.append(link);
    card.append(imageWrap, content);
    return card;
}

async function loadNews(grid) {
    const moreContainer = document.getElementById('learnMoreContainer');
    const status = document.createElement('p');
    status.className = 'news-loading';
    status.textContent = 'Loading news…';
    grid.replaceChildren(status);
    if (moreContainer) moreContainer.style.display = 'none';

    try {
        // Firestore returns newest first; render in that order so the latest article is always first.
        const snapshot = await getNewsDatabase().collection('news').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            status.textContent = 'There are no news articles yet.';
            return;
        }

        const cards = snapshot.docs.map(doc => makeNewsCard(doc.id, doc.data()));
        const initialCount = 6;
        cards.forEach((card, index) => {
            if (index >= initialCount) card.classList.add('hidden-card');
        });
        const fragment = document.createDocumentFragment();
        cards.forEach(card => fragment.append(card));
        grid.replaceChildren(fragment);

        const hiddenCards = grid.querySelectorAll('.hidden-card');
        if (moreContainer) moreContainer.style.display = hiddenCards.length ? '' : 'none';
        const firstImage = grid.querySelector('.news-card .news-image-wrapper img');
        const hero = document.querySelector('.news-hero');
        if (firstImage && hero) hero.style.backgroundImage = `url("${firstImage.src.replaceAll('"', '%22')}")`;
    } catch (error) {
        console.error('Unable to load news:', error);
        status.textContent = 'News could not be loaded. Please try again later.';
        status.className = 'news-load-error';
        grid.replaceChildren(status);
    }
}
async function loadNewsDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id || !document.querySelector('.news-detail-main')) return;
    try {
        const doc = await getNewsDatabase().collection('news').doc(id).get();
        if (!doc.exists) throw new Error('News article was not found.');
        const news = doc.data();
        const title = document.querySelector('.news-detail-title');
        const meta = document.querySelector('.news-detail-meta span');
        const image = document.querySelector('.news-detail-image');
        const content = document.querySelector('.news-detail-content');
        const breadcrumb = document.querySelector('.breadcrumbs span');
        if (title) title.textContent = news.title || 'News';
        if (meta) meta.textContent = newsDate(news.createdAt);
        if (breadcrumb) breadcrumb.textContent = news.title || 'News';
        if (image) {
            if (news.imageUrl) image.src = news.imageUrl;
            image.alt = news.imageAlt || news.title || 'News article image';
        }
        if (content) {
            content.replaceChildren();
            (news.content || news.summary || '').split(/\n\s*\n/).filter(Boolean).forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                content.append(p);
            });
        }
        const learnMore = document.querySelector('.learn-more-container');
        if (learnMore) learnMore.style.display = 'none';
    } catch (error) {
        console.error('Unable to load news article:', error);
        const title = document.querySelector('.news-detail-title');
        if (title) title.textContent = 'News article could not be loaded';
    }
}
