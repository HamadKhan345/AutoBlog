//This js is updated for search.html/category_posts.html

document.addEventListener('DOMContentLoaded', function () {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    const categorySlug = postsGrid.dataset.categorySlug;
    const searchQuery = postsGrid.dataset.searchQuery;

    // Always enable grid/list toggle
    const viewToggleBtns = document.querySelectorAll('.view-btn');
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const viewType = this.getAttribute('data-view');
            postsGrid.classList.remove('grid-view', 'list-view');
            postsGrid.classList.add(viewType + '-view');
        });
    });

    // Optional: Add default view class (if not already set in HTML)
    if (!postsGrid.classList.contains('grid-view') && !postsGrid.classList.contains('list-view')) {
        postsGrid.classList.add('grid-view');
    }

    // Only run load more if on category page
    if (categorySlug) {
        let currentPage = 1;
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');

        function renderPost(post) {
          const sectionClass = `${post.category_name.toLowerCase().replace(/\s+/g, '-')}-section`;
            return `
            <article class="post-card">
                <div class="post-image">
                    <a href="${post.url}">
                        <img src="${post.thumbnail}" alt="${post.title}">
                        <div class="post-category ${sectionClass}">${post.category_name}</div>
                    </a>
                </div>
                <div class="post-content">
                    <h3 class="post-title"><a href="${post.url}">${post.title}</a></h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span class="post-author">${post.author}</span>
                        <span class="post-date">${post.time_since}</span>
                        <span class="post-read-time">5 min read</span>
                    </div>
                </div>
            </article>`;
        }

        function loadPosts(page) {
            loadingSpinner.style.display = 'block';
            loadMoreBtn.style.display = 'none';

            fetch(`/api/category/${categorySlug}/posts/?page=${page}`)
                .then(response => response.json())
                .then(data => {
                    data.posts.forEach(post => {
                        postsGrid.insertAdjacentHTML('beforeend', renderPost(post));
                    });
                    loadingSpinner.style.display = 'none';
                    loadMoreBtn.style.display = data.has_more ? 'block' : 'none';
                });
        }

        if (loadMoreBtn) {
            loadPosts(currentPage);
            loadMoreBtn.addEventListener('click', function () {
                currentPage += 1;
                loadPosts(currentPage);
            });
        }
    }
});