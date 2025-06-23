document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const postsGrid = document.getElementById('postsGrid');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    let currentPage = 1;
    let isLoading = false;
    
    // Sample additional posts data
    const samplePosts = [
        {
            title: "5G Network Technology and Its Impact",
            excerpt: "Understanding how 5G technology is revolutionizing communication and enabling new possibilities...",
            author: "Alex Johnson",
            time: "2 days ago",
            readTime: "5 min read",
            image: "https://picsum.photos/400/250?random=7"
        },
        {
            title: "Internet of Things (IoT) Revolution",
            excerpt: "Exploring how IoT devices are connecting our world and creating smart environments...",
            author: "Maria Garcia",
            time: "3 days ago",
            readTime: "6 min read",
            image: "https://picsum.photos/400/250?random=8"
        },
        {
            title: "Virtual Reality in Education",
            excerpt: "Discover how VR technology is transforming the educational landscape and learning experiences...",
            author: "Robert Kim",
            time: "4 days ago",
            readTime: "7 min read",
            image: "https://picsum.photos/400/250?random=9"
        }
    ];
    
    // Load More Functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            if (isLoading) return;
            
            isLoading = true;
            loadMoreBtn.style.display = 'none';
            loadingSpinner.style.display = 'flex';
            
            // Simulate API call delay
            setTimeout(() => {
                loadMorePosts();
                isLoading = false;
                loadingSpinner.style.display = 'none';
                loadMoreBtn.style.display = 'inline-flex';
                
                // Hide load more button after loading a few times
                currentPage++;
                if (currentPage >= 4) {
                    loadMoreBtn.style.display = 'none';
                    const noMoreMsg = document.createElement('p');
                    noMoreMsg.textContent = 'No more articles to load';
                    noMoreMsg.style.color = '#6c757d';
                    noMoreMsg.style.textAlign = 'center';
                    noMoreMsg.style.marginTop = '1rem';
                    document.querySelector('.load-more-container').appendChild(noMoreMsg);
                }
            }, 1500);
        });
    }
    
    function loadMorePosts() {
        const categoryName = document.querySelector('.category-title').textContent;
        
        samplePosts.forEach((post, index) => {
            const postCard = createPostCard(post, categoryName);
            postsGrid.appendChild(postCard);
            
            // Add animation
            setTimeout(() => {
                postCard.style.opacity = '1';
                postCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    function createPostCard(post, categoryName) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = 'all 0.3s ease';
        
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-category">${categoryName}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${post.time}</span>
                    <span class="post-read-time">${post.readTime}</span>
                </div>
            </div>
        `;
        
        return article;
    }
    
    // View Toggle Functionality
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            viewBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Toggle grid view
            const view = this.dataset.view;
            if (view === 'list') {
                postsGrid.classList.add('list-view');
            } else {
                postsGrid.classList.remove('list-view');
            }
        });    });
    
    // Add click handlers to post cards
    function addPostClickHandlers() {
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            card.addEventListener('click', function() {
                // Navigate to post detail page
                // In a real app, you would get the post ID and navigate
                console.log('Navigate to post:', this.querySelector('.post-title').textContent);
            });
        });
    }
    
    // Initialize click handlers
    addPostClickHandlers();
    
    // Re-add click handlers after loading more posts
    const originalLoadMore = loadMorePosts;
    loadMorePosts = function() {
        originalLoadMore();
        setTimeout(addPostClickHandlers, 100);
    };
});