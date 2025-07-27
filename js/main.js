document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    if (mainContent) {
        mainContent.style.display = 'block';
    }

    document.querySelectorAll('.collab-card').forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.bot-card, .collab-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}); 