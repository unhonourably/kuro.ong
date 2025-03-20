// Get Last.fm credentials from config
console.log('Config object:', window.config);
const LASTFM_API_KEY = window.config.LASTFM_API_KEY;
const LASTFM_USERNAME = window.config.LASTFM_USERNAME;
console.log('API Key:', LASTFM_API_KEY);
console.log('Username:', LASTFM_USERNAME);

// Bio rotation functionality
const bios = window.config.BIOS || [
    "Software Engineer & Designer",
    "Building digital experiences",
    "Creating elegant solutions",
    "Making the web beautiful"
];

let currentBioIndex = 0;
const bioElement = document.querySelector('.bio');

function updateBio() {
    // Remove visible class to trigger exit animation
    bioElement.classList.remove('visible');
    
    // Wait for exit animation to complete
    setTimeout(() => {
        // Update text
        bioElement.textContent = bios[currentBioIndex];
        
        // Add visible class to trigger enter animation
        bioElement.classList.add('visible');
        
        // Move to next bio
        currentBioIndex = (currentBioIndex + 1) % bios.length;
    }, 500); // Match this with CSS transition duration
}

// Start bio rotation
updateBio();
setInterval(updateBio, 5000); // Change bio every 5 seconds

// Function to fetch Last.fm now playing
async function fetchNowPlaying() {
    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
        console.error('Last.fm credentials not loaded');
        return;
    }

    try {
        const params = new URLSearchParams({
            method: 'user.getrecenttracks',
            user: LASTFM_USERNAME,
            api_key: LASTFM_API_KEY,
            format: 'json',
            limit: '1'
        });
        
        const url = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;
        console.log('Full URL:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Last.fm response:', data);
        
        if (!data.recenttracks) {
            throw new Error('No recent tracks data in response');
        }
        
        if (data.recenttracks && data.recenttracks.track && data.recenttracks.track.length > 0) {
            const track = data.recenttracks.track[0];
            console.log('Current track:', track);
            
            // Get the largest available image
            const images = track.image || [];
            const largeImage = images.find(img => img.size === 'large') || images[images.length - 1];
            const imageUrl = largeImage ? largeImage['#text'] : 'https://placehold.co/50x50';
            
            // Update the album artwork
            const albumArt = document.getElementById('album-art');
            albumArt.src = imageUrl;
            
            // Update the track info
            const title = track.name;
            const artist = track.artist['#text'];
            
            // Update text content
            document.querySelector('.now-playing-title').textContent = title;
            document.querySelector('.now-playing-artist').textContent = artist;

            // Update links
            const trackUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}/_/${encodeURIComponent(title)}`;
            const artistUrl = `https://www.last.fm/music/${encodeURIComponent(artist)}`;
            
            document.getElementById('track-link').href = trackUrl;
            document.getElementById('track-link-text').href = trackUrl;
            document.getElementById('artist-link').href = artistUrl;
            
            console.log('Updated display with:', { title, artist, imageUrl });
        } else {
            throw new Error('No tracks found in response');
        }
    } catch (error) {
        console.error('Error fetching Last.fm data:', error);
        if (error.name === 'AbortError') {
            console.log('Request timed out');
        }
        document.querySelector('.now-playing-title').textContent = 'Error loading Last.fm data';
        document.querySelector('.now-playing-artist').textContent = 'Last.fm';
    }
}

// Initial fetch
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting fetch...');
    fetchNowPlaying();
});

// Update now playing every 30 seconds
setInterval(fetchNowPlaying, 30000);

// Add smooth scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add a subtle animation to the profile card on load
document.addEventListener('DOMContentLoaded', () => {
    const profileCard = document.querySelector('.profile-card');
    profileCard.style.opacity = '0';
    profileCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        profileCard.style.transition = 'all 0.5s ease';
        profileCard.style.opacity = '1';
        profileCard.style.transform = 'translateY(0)';
    }, 100);
});

// Add hover effect to social links
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateX(0)';
    });
});

// Discord Modal Functionality
const discordModal = document.getElementById('discord-modal');
const discordTrigger = document.getElementById('discord-trigger');
const closeModal = document.querySelector('.close-modal');
const discordServers = document.querySelector('.discord-servers');

// Discord servers data - replace these with your actual servers
const servers = [
    {
        invite: "evict",
        serverId: "892675627373699072"
    },
    {
        invite: "sewer", 
        serverId: "986035606658351166"
    },
    {
        invite: "MLB", 
        serverId: "368552693888974848" 
    },
    {
        invite: "slashest",
        serverId: "1018517286199500861"
    }
];

async function fetchServerInfo(serverId) {
    try {
        // Extract invite code from full URL if provided
        const inviteCode = serverId.includes('discord.gg/') 
            ? serverId.split('discord.gg/')[1]
            : serverId;
            
        const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
        if (!response.ok) {
            throw new Error('Failed to fetch server info');
        }
        const data = await response.json();
        
        // Get the server icon URL from the API response
        const iconUrl = data.guild.icon 
            ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
            : null;

        return {
            members: data.approximate_member_count || 0,
            online: data.approximate_presence_count || 0,
            icon: iconUrl,
            name: data.guild.name // Get server name from API as well
        };
    } catch (error) {
        console.error('Error fetching server info:', error);
        return {
            members: 0,
            online: 0,
            icon: null,
            name: null
        };
    }
}

async function createServerCard(server) {
    const card = document.createElement('div');
    card.className = 'discord-server';
    
    // Show loading state
    card.innerHTML = `
        <div class="server-icon loading"></div>
        <div class="server-info">
            <h3 class="server-name">Loading...</h3>
            <div class="server-stats">
                Loading...
            </div>
            <div class="server-status">
                <span class="status-dot offline"></span>
                Loading...
            </div>
        </div>
    `;
    
    // Fetch server info using the invite code
    const serverInfo = await fetchServerInfo(server.invite);
    
    // Update card with real data
    card.innerHTML = `
        <img src="${serverInfo.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${serverInfo.name || 'Discord Server'}" class="server-icon">
        <div class="server-info">
            <h3 class="server-name">${serverInfo.name || 'Discord Server'}</h3>
            <div class="server-stats">
                ${serverInfo.members.toLocaleString()} members
            </div>
            <div class="server-status">
                <span class="status-dot ${serverInfo.online > 0 ? 'online' : 'offline'}"></span>
                ${serverInfo.online.toLocaleString()} online
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.open(`https://discord.gg/${server.invite}`, '_blank');
    });
    
    return card;
}

async function populateServers() {
    discordServers.innerHTML = '';
    
    // Remove the header code and just populate the servers
    for (const server of servers) {
        const card = await createServerCard(server);
        discordServers.appendChild(card);
    }
}

function openModal() {
    discordModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    populateServers();
}

function closeModalHandler() {
    discordModal.classList.remove('active');
    document.body.style.overflow = '';
}

discordTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

closeModal.addEventListener('click', closeModalHandler);

// Close modal when clicking outside
discordModal.addEventListener('click', (e) => {
    if (e.target === discordModal) {
        closeModalHandler();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && discordModal.classList.contains('active')) {
        closeModalHandler();
    }
});

// Add page transition element
const transitionElement = document.createElement('div');
transitionElement.className = 'page-transition';
document.body.appendChild(transitionElement);

// Add animation effects for initial load
document.addEventListener('DOMContentLoaded', () => {
    // Animate the profile card
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
}); 

// More Modal Functionality (separate from Discord modal)
document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const moreModal = document.getElementById('more-modal');
    const moreButton = document.getElementById('more-info');
    
    console.log('Modal elements:', { moreModal, moreButton });
    
    if (moreButton && moreModal) {
        // Function to open more modal
        function openMoreModal(e) {
            if (e) {
                e.preventDefault();
            }
            
            const moreModal = document.getElementById('more-modal');
            moreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            moreModal.style.visibility = 'visible';
            moreModal.style.display = 'flex';
            moreModal.style.opacity = '0';
            
            // Set up smooth transitions
            moreModal.style.transition = 'opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            
            const modalContent = moreModal.querySelector('.modal-content');
            if (modalContent) {
                // Start from a smaller, lower position
                modalContent.style.transform = 'translateY(40px) scale(0.95)';
                modalContent.style.opacity = '0';
                modalContent.style.backgroundColor = 'rgba(15, 15, 15, 0.6)';
                modalContent.style.backdropFilter = 'blur(8px)';
                
                // Set up smooth transition
                modalContent.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                modalContent.style.willChange = 'transform, opacity';
            }
            
            // Force a reflow to ensure transitions work
            void moreModal.offsetWidth;
            
            // Fade in the background
            moreModal.style.opacity = '1';
            
            // Animate in the content with a slight delay
            setTimeout(() => {
                if (modalContent) {
                    modalContent.style.transform = 'translateY(0) scale(1)';
                    modalContent.style.opacity = '1';
                }
            }, 50);
            
            // Add staggered loading animation for bot cards
            const botCards = moreModal.querySelectorAll('.bot-card');
            botCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                // Stagger the animations
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 75)); // 75ms stagger between each card
            });
            
            // Similar animation for collab cards
            const collabCards = moreModal.querySelectorAll('.collab-card');
            collabCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 50)); // Faster 50ms stagger since there are more collab cards
            });
        }
        
        // Add click listener
        moreButton.addEventListener('click', openMoreModal);
        console.log('Added click listener to more button');
        
        // Improve the more modal closing animation
        function closeMoreModal() {
            // Get the modal and its content
            const moreModal = document.getElementById('more-modal');
            const modalContent = moreModal.querySelector('.modal-content');
            
            // Add a smoother transition for the fade out
            moreModal.style.transition = 'opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            
            if (modalContent) {
                // Use a smoother easing function for the content animation
                modalContent.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
                modalContent.style.transform = 'translateY(-20px) scale(0.98)';
                modalContent.style.opacity = '0';
            }
            
            // Fade out the modal background with a slight delay
            setTimeout(() => {
                moreModal.style.opacity = '0';
            }, 50);
            
            // Hide the modal after the animation completes
            setTimeout(() => {
                moreModal.style.display = 'none';
                moreModal.style.visibility = 'hidden';
                
                // Reset transform for next opening
                if (modalContent) {
                    modalContent.style.transform = 'translateY(-40px) scale(0.95)';
                }
            }, 450); // Slightly longer duration to ensure animation completes
        }
        
        // Find and update all close button handlers for the more modal
        const moreModal = document.getElementById('more-modal');
        if (moreModal) {
            // Update close button handler
            const closeButtons = moreModal.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                // Remove old handlers
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add new smooth closing handler
                newButton.addEventListener('click', closeMoreModal);
            });
            
            // Update click outside handler
            moreModal.addEventListener('click', (e) => {
                if (e.target === moreModal) {
                    closeMoreModal();
                }
            });
            
            // Update Escape key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && 
                    (moreModal.style.display === 'flex' || 
                    getComputedStyle(moreModal).display === 'flex')) {
                    closeMoreModal();
                }
            });
        }
    } else {
        console.error('Could not find more modal elements');
    }
});

// Fix for Discord modal - restore original functionality but keep transparency

document.addEventListener('DOMContentLoaded', () => {
    const discordModal = document.getElementById('discord-modal');
    const discordTrigger = document.getElementById('discord-trigger');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Apply transparency without changing functionality
    if (discordModal) {
        // Override styles without changing event handlers
        const applyTransparency = () => {
            // Apply transparency to modal
            discordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            
            // Apply transparency to content
            const modalContent = discordModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.backgroundColor = 'rgba(15, 15, 15, 0.6)';
                modalContent.style.backdropFilter = 'blur(8px)';
            }
        };
        
        // Use MutationObserver to detect when modal becomes visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'style') {
                    // Check if modal is visible
                    const isVisible = 
                        (discordModal.classList.contains('active')) ||
                        (window.getComputedStyle(discordModal).display !== 'none');
                    
                    if (isVisible) {
                        applyTransparency();
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(discordModal, { attributes: true });
        
        // Also run once on page load
        applyTransparency();
    }
    
    // Ensure only one click handler for the discord trigger
    if (discordTrigger) {
        // Remove all existing click handlers
        const newTrigger = discordTrigger.cloneNode(true);
        discordTrigger.parentNode.replaceChild(newTrigger, discordTrigger);
        
        // Add back the original handler
        newTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Use the original openModal function - don't try to reimplement it
            openModal();
            
            // Apply transparency after a short delay
            setTimeout(applyTransparency, 10);
        });
    }
    
    // Fix close buttons
    closeButtons.forEach(button => {
        // Remove existing handlers
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add back the handler
        newButton.addEventListener('click', () => {
            // Find the parent modal
            const modal = newButton.closest('.modal');
            
            if (modal.id === 'discord-modal') {
                // Use the original close function for discord modal
                closeModalHandler();
            } else if (modal.id === 'more-modal') {
                // Close the more modal
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transform = 'translateY(-20px)';
                }
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Add this new function to make the Discord modal transparent too
document.addEventListener('DOMContentLoaded', () => {
    // Get the Discord modal and update its style to be truly transparent
    const discordModal = document.getElementById('discord-modal');
    
    if (discordModal) {
        // Force the modal to be transparent
        discordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        // Apply transparency to the modal content
        const modalContent = discordModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
            modalContent.style.backdropFilter = 'blur(5px)';
            modalContent.style.webkitBackdropFilter = 'blur(5px)';
            modalContent.style.backgroundImage = 'none';
            modalContent.style.boxShadow = '0 15px 25px rgba(0, 0, 0, 0.4)';
            modalContent.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }
        
        // Also apply transparency to all server cards within the Discord modal
        const serverCards = discordModal.querySelectorAll('.discord-server');
        serverCards.forEach(card => {
            card.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        });
    }
});

// At the start of your DOMContentLoaded event, add this to remove any inline styles
document.addEventListener('DOMContentLoaded', () => {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Force transparency by removing inline styles that might override it
        modal.removeAttribute('style');
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        // Make sure modal content is transparent too
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.removeAttribute('style');
            content.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
            content.style.backdropFilter = 'blur(5px)';
        }
    });
    
    // Rest of your initialization code...
});

// Add this at the top of your script to ensure it runs as soon as possible
window.addEventListener('load', () => {
    // Create a style element and inject it into the head
    const style = document.createElement('style');
    style.textContent = `
        /* Override modal styles with important flags */
        .modal {
            background-color: rgba(0, 0, 0, 0.6) !important;
        }
        
        .modal .modal-content {
            background-color: rgba(15, 15, 15, 0.6) !important;
            background: rgba(15, 15, 15, 0.6) !important;
            backdrop-filter: blur(8px) !important;
        }
        
        .modal .bot-card,
        .modal .collab-card,
        .modal .discord-server {
            background-color: rgba(25, 25, 25, 0.6) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Also directly apply inline styles to ensure they take effect
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Force style directly
        modal.setAttribute('style', 'background-color: rgba(0, 0, 0, 0.6) !important');
        
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.setAttribute('style', 'background-color: rgba(15, 15, 15, 0.6) !important; backdrop-filter: blur(8px) !important');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Change the question mark icon to a book icon
    const moreInfoIcon = document.querySelector('#more-info i');
    if (moreInfoIcon) {
        // Remove the question mark icon class
        moreInfoIcon.classList.remove('fa-question');
        // Add the book icon class
        moreInfoIcon.classList.add('fa-book');
    }
    
    // Remove the "More Information" title from the modal
    const moreModal = document.getElementById('more-modal');
    if (moreModal) {
        const moreTitle = moreModal.querySelector('.more-content h1');
        if (moreTitle) {
            moreTitle.style.display = 'none'; // Hide the title
            // Or remove it completely:
            // moreTitle.remove();
        }
        
        // Adjust spacing since we removed the title
        const firstSection = moreModal.querySelector('.info-section');
        if (firstSection) {
            firstSection.style.marginTop = '0';
        }
    }
});