// API Base URL - Using Vercel Serverless Function as proxy
const USE_PROXY = window.location.hostname !== 'localhost';
const API_BASE = USE_PROXY ? '/api/proxy?endpoint=' : 'https://www.sankavollerei.com/novel/sakuranovel';

// State Management
const state = {
    currentPage: 'home',
    currentNovel: null,
    currentChapter: null,
    homePage: 1,
    genrePage: 1,
    tagPage: 1,
    currentGenre: null,
    currentTag: null
};

// DOM Elements
const pages = {
    home: document.getElementById('homePage'),
    search: document.getElementById('searchPage'),
    genres: document.getElementById('genresPage'),
    genreDetail: document.getElementById('genreDetailPage'),
    tags: document.getElementById('tagsPage'),
    tagDetail: document.getElementById('tagDetailPage'),
    list: document.getElementById('listPage'),
    detail: document.getElementById('detailPage'),
    reader: document.getElementById('readerPage')
};

const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Utility Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');
    state.currentPage = pageName;
    window.scrollTo(0, 0);
}

function updateNavLinks(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
}

function showError(message) {
    const container = document.querySelector('.page.active .novel-grid, .page.active > div:first-of-type');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ff69b4;">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.8rem 2rem; background: linear-gradient(135deg, #ff69b4, #ff1493); border: none; border-radius: 25px; color: white; cursor: pointer; font-weight: bold;">
                    🔄 Refresh Page
                </button>
            </div>
        `;
    }
}

async function fetchAPI(endpoint) {
    try {
        const url = USE_PROXY ? `${API_BASE}${encodeURIComponent(endpoint)}` : `${API_BASE}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            return data;
        }
        throw new Error(data.message || 'API request failed');
    } catch (error) {
        console.error('API Error:', error);
        showError(`Gagal memuat data: ${error.message}<br>Silakan coba lagi atau refresh halaman.`);
        return null;
    }
}

// Home Page Functions
async function loadHomePage(page = 1) {
    showLoading();
    const data = await fetchAPI(`/home?page=${page}`);
    hideLoading();

    if (data && data.data && data.data.results) {
        state.homePage = page;
        displayNovels(data.data.results, 'novelGrid');
        updateHomePagination(data.data.pagination);
    } else {
        showError('Tidak dapat memuat data novel. Pastikan koneksi internet Anda stabil.');
    }
}

function displayNovels(novels, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = novels.map(novel => `
        <div class="novel-card" onclick="loadNovelDetail('${novel.slug}')">
            <img src="${novel.poster}" alt="${novel.title}" class="novel-poster" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            <div class="novel-info">
                <h3 class="novel-title">${novel.title}</h3>
                <div class="novel-meta">
                    <span class="novel-type">${novel.type || 'Novel'}</span>
                    ${novel.rating ? `<span class="novel-rating">⭐ ${novel.rating}</span>` : ''}
                </div>
                ${novel.latest_chapter ? `<p class="novel-latest">${novel.latest_chapter}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function updateHomePagination(pagination) {
    const currentPageSpans = [
        document.getElementById('currentPageHome'),
        document.getElementById('currentPageHome2')
    ];
    const prevBtns = [
        document.getElementById('prevPageHome'),
        document.getElementById('prevPageHome2')
    ];
    const nextBtns = [
        document.getElementById('nextPageHome'),
        document.getElementById('nextPageHome2')
    ];

    currentPageSpans.forEach(span => span.textContent = `Page ${pagination.currentPage}`);
    
    prevBtns.forEach(btn => {
        btn.disabled = pagination.currentPage === 1;
        btn.onclick = () => loadHomePage(pagination.currentPage - 1);
    });

    nextBtns.forEach(btn => {
        btn.disabled = !pagination.hasNext;
        btn.onclick = () => loadHomePage(pagination.currentPage + 1);
    });
}

// Search Functions
async function searchNovels(query) {
    showLoading();
    const data = await fetchAPI(`/search?q=${encodeURIComponent(query)}`);
    hideLoading();

    if (data && data.data.results) {
        document.getElementById('searchQuery').textContent = query;
        displayNovels(data.data.results, 'searchResults');
        showPage('search');
    }
}

// Genres Functions
async function loadGenres() {
    showLoading();
    const data = await fetchAPI('/genres');
    hideLoading();

    if (data && data.data) {
        const container = document.getElementById('genresList');
        container.innerHTML = data.data.map(genre => `
            <div class="genre-card" onclick="loadGenreDetail('${genre.slug}', '${genre.name}')">
                <div class="genre-name">${genre.name}</div>
                <div class="genre-count">${genre.count} novels</div>
            </div>
        `).join('');
    }
}

async function loadGenreDetail(slug, name, page = 1) {
    showLoading();
    state.currentGenre = slug;
    const data = await fetchAPI(`/genre/${slug}?page=${page}`);
    hideLoading();

    if (data && data.data.results) {
        document.getElementById('genreName').textContent = name;
        displayNovels(data.data.results, 'genreNovels');
        updateGenrePagination(data.data.pagination);
        showPage('genreDetail');
    }
}

function updateGenrePagination(pagination) {
    const currentPageSpans = [
        document.getElementById('currentPageGenre'),
        document.getElementById('currentPageGenre2')
    ];
    const prevBtns = [
        document.getElementById('prevPageGenre'),
        document.getElementById('prevPageGenre2')
    ];
    const nextBtns = [
        document.getElementById('nextPageGenre'),
        document.getElementById('nextPageGenre2')
    ];

    currentPageSpans.forEach(span => span.textContent = `Page ${pagination.currentPage}`);
    
    prevBtns.forEach(btn => {
        btn.disabled = pagination.currentPage === 1;
        btn.onclick = () => loadGenreDetail(state.currentGenre, document.getElementById('genreName').textContent, pagination.currentPage - 1);
    });

    nextBtns.forEach(btn => {
        btn.disabled = !pagination.hasNext;
        btn.onclick = () => loadGenreDetail(state.currentGenre, document.getElementById('genreName').textContent, pagination.currentPage + 1);
    });
}

// Tags Functions
async function loadTags() {
    showLoading();
    const data = await fetchAPI('/tags');
    hideLoading();

    if (data && data.data) {
        const container = document.getElementById('tagsList');
        container.innerHTML = data.data.map(tag => `
            <div class="tag-item" onclick="loadTagDetail('${tag.slug}', '${tag.name}')">
                <span class="tag-name">${tag.name}</span>
                <span class="tag-count">${tag.count}</span>
            </div>
        `).join('');
    }
}

async function loadTagDetail(slug, name, page = 1) {
    showLoading();
    state.currentTag = slug;
    const data = await fetchAPI(`/tag/${slug}?page=${page}`);
    hideLoading();

    if (data && data.data.results) {
        document.getElementById('tagName').textContent = name;
        displayNovels(data.data.results, 'tagNovels');
        updateTagPagination(data.data.pagination);
        showPage('tagDetail');
    }
}

function updateTagPagination(pagination) {
    const currentPageSpans = [
        document.getElementById('currentPageTag'),
        document.getElementById('currentPageTag2')
    ];
    const prevBtns = [
        document.getElementById('prevPageTag'),
        document.getElementById('prevPageTag2')
    ];
    const nextBtns = [
        document.getElementById('nextPageTag'),
        document.getElementById('nextPageTag2')
    ];

    currentPageSpans.forEach(span => span.textContent = `Page ${pagination.currentPage}`);
    
    prevBtns.forEach(btn => {
        btn.disabled = pagination.currentPage === 1;
        btn.onclick = () => loadTagDetail(state.currentTag, document.getElementById('tagName').textContent, pagination.currentPage - 1);
    });

    nextBtns.forEach(btn => {
        btn.disabled = !pagination.hasNext;
        btn.onclick = () => loadTagDetail(state.currentTag, document.getElementById('tagName').textContent, pagination.currentPage + 1);
    });
}

// Novel List Functions
async function loadNovelList() {
    showLoading();
    const data = await fetchAPI('/daftar-novel');
    hideLoading();

    if (data && data.data) {
        const container = document.getElementById('novelList');
        
        // Group by letter
        const grouped = {};
        data.data.forEach(novel => {
            const letter = novel.letter_group || '#';
            if (!grouped[letter]) {
                grouped[letter] = [];
            }
            grouped[letter].push(novel);
        });

        // Display grouped novels
        container.innerHTML = Object.keys(grouped).sort().map(letter => `
            <div class="letter-group">
                <h3 class="letter-header">${letter}</h3>
                <div class="novel-list">
                    ${grouped[letter].map(novel => `
                        <div class="novel-list-item" onclick="loadNovelDetail('${novel.slug}')">
                            <div>
                                <div class="novel-list-title">${novel.title}</div>
                                <div class="novel-list-type">${novel.type}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Novel Detail Functions
async function loadNovelDetail(slug) {
    showLoading();
    state.currentNovel = slug;
    const data = await fetchAPI(`/detail/${slug}`);
    hideLoading();

    if (data && data.data) {
        const novel = data.data;
        const container = document.getElementById('novelDetail');
        
        container.innerHTML = `
            <div class="detail-header">
                <img src="${novel.poster}" alt="${novel.title}" class="detail-poster" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                <div class="detail-info">
                    <h2>${novel.title}</h2>
                    ${novel.alt_title ? `<p class="detail-alt-title">${novel.alt_title}</p>` : ''}
                    <div class="detail-meta">
                        ${novel.rating ? `<span class="meta-item">⭐ ${novel.rating}</span>` : ''}
                        <span class="meta-item">${novel.status || 'Unknown'}</span>
                        <span class="meta-item">${novel.type || 'Novel'}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-synopsis">
                <h3>Synopsis</h3>
                <p>${novel.synopsis || 'No synopsis available.'}</p>
            </div>
            
            ${novel.genres && novel.genres.length > 0 ? `
                <div class="detail-genres">
                    <h3>Genres</h3>
                    <div class="genres-list">
                        ${novel.genres.map(g => `<span class="genre-badge">${g.name}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${novel.info ? `
                <div class="detail-info-section">
                    <h3>Information</h3>
                    <div class="info-grid">
                        ${novel.info.author ? `
                            <div class="info-item">
                                <div class="info-label">Author</div>
                                <div class="info-value">${novel.info.author}</div>
                            </div>
                        ` : ''}
                        ${novel.info.country ? `
                            <div class="info-item">
                                <div class="info-label">Country</div>
                                <div class="info-value">${novel.info.country}</div>
                            </div>
                        ` : ''}
                        ${novel.info.published ? `
                            <div class="info-item">
                                <div class="info-label">Published</div>
                                <div class="info-value">${novel.info.published}</div>
                            </div>
                        ` : ''}
                        ${novel.info.volume ? `
                            <div class="info-item">
                                <div class="info-label">Volume</div>
                                <div class="info-value">${novel.info.volume}</div>
                            </div>
                        ` : ''}
                        ${novel.info.total_chapter ? `
                            <div class="info-item">
                                <div class="info-label">Total Chapters</div>
                                <div class="info-value">${novel.info.total_chapter}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${novel.chapters && novel.chapters.length > 0 ? `
                <div class="chapters-section">
                    <h3>Chapters</h3>
                    <div class="chapters-list">
                        ${novel.chapters.map(chapter => `
                            <div class="chapter-item" onclick="loadChapter('${chapter.slug}')">
                                <span>${chapter.title}</span>
                                <span class="chapter-date">${chapter.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        showPage('detail');
    }
}

// Reader Functions
async function loadChapter(slug) {
    showLoading();
    state.currentChapter = slug;
    const data = await fetchAPI(`/read/${slug}`);
    hideLoading();

    if (data && data.data) {
        const chapter = data.data;
        const container = document.getElementById('readerContent');
        
        container.innerHTML = `
            <h2 class="reader-title">${chapter.title}</h2>
            <div class="reader-text">${chapter.content}</div>
            <div class="reader-navigation">
                <button class="nav-btn" id="prevChapter" ${!chapter.navigation.prev_slug ? 'disabled' : ''}>
                    ← Previous Chapter
                </button>
                <button class="nav-btn" id="nextChapter" ${!chapter.navigation.next_slug ? 'disabled' : ''}>
                    Next Chapter →
                </button>
            </div>
        `;

        // Setup navigation buttons
        if (chapter.navigation.prev_slug) {
            document.getElementById('prevChapter').onclick = () => loadChapter(chapter.navigation.prev_slug);
        }
        if (chapter.navigation.next_slug) {
            document.getElementById('nextChapter').onclick = () => loadChapter(chapter.navigation.next_slug);
        }

        showPage('reader');
    }
}

// Event Listeners
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        
        updateNavLinks(page);
        
        switch(page) {
            case 'home':
                loadHomePage(1);
                showPage('home');
                break;
            case 'genres':
                loadGenres();
                showPage('genres');
                break;
            case 'tags':
                loadTags();
                showPage('tags');
                break;
            case 'list':
                loadNovelList();
                showPage('list');
                break;
        }
    });
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchNovels(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchNovels(query);
        }
    }
});

document.getElementById('backBtn').addEventListener('click', () => {
    showPage('home');
    updateNavLinks('home');
});

document.getElementById('backToDetailBtn').addEventListener('click', () => {
    if (state.currentNovel) {
        loadNovelDetail(state.currentNovel);
    } else {
        showPage('home');
        updateNavLinks('home');
    }
});

// Initialize
loadHomePage(1);
