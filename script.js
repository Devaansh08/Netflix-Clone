document.addEventListener('DOMContentLoaded', () => {
    const playButtons = document.querySelectorAll('.play-btn');
    const videoModal = document.getElementById('video-modal');
    const closeBtn = document.querySelector('.close-btn');
    const videoPlayer = document.getElementById('video-player');
    
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            videoModal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => {
        videoModal.style.display = 'none';
        videoPlayer.pause();
    });

    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            videoModal.style.display = 'none';
            videoPlayer.pause();
        }
    });

    // Search functionality
    document.getElementById('search-bar').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const contentItems = document.querySelectorAll('.content-item');
        contentItems.forEach(item => {
            const title = item.querySelector('img').alt.toLowerCase();
            if (title.includes(query)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
