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

// Handle more info link click
document.getElementById('more-info').addEventListener('click', (e) => {
    e.preventDefault();
    const container = document.querySelector('.container');
    
    // Start the transition
    container.classList.add('fade-out');
    setTimeout(() => {
        transitionElement.classList.add('active');
    }, 300);
    
    // Navigate after transition
    setTimeout(() => {
        window.location.href = e.currentTarget.href;
    }, 800);
});

// Check if we're coming back from the more page
if (document.referrer.includes('more/index.html')) {
    // Add initial state classes
    transitionElement.classList.add('active');
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateX(-100px)';
    
    // Remove transition after a brief delay
    setTimeout(() => {
        transitionElement.classList.remove('active');
        container.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '1';
        container.style.transform = 'translateX(0)';
    }, 100);
} 