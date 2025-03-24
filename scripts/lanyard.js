const DISCORD_ID = '730478491513913416';
const API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
const WEBSOCKET_URL = 'wss://api.lanyard.rest/socket';

let socket;
let currentPresence = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;
let progressInterval;

function initLanyard() {
    fetchInitialPresence();
    initWebSocket();
}

function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateSpotifyProgress(startTime, endTime) {
    clearInterval(progressInterval);
    
    const spotifyProgress = document.getElementById('spotify-progress');
    const currentTimeEl = document.getElementById('spotify-current-time');
    const endTimeEl = document.getElementById('spotify-end-time');
    
    const duration = endTime - startTime;
    const updateProgress = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        spotifyProgress.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(elapsed);
        endTimeEl.textContent = formatTime(duration);
        
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    };
    
    updateProgress();
    progressInterval = setInterval(updateProgress, 1000);
}

function fetchInitialPresence() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updatePresenceUI(data.data);
            }
        })
        .catch(error => {
            console.log('Error fetching initial presence:', error);
            document.getElementById('discord-status').textContent = 'Unable to connect to Discord';
        });
}

function initWebSocket() {
    if (socket) {
        socket.close();
    }
    
    socket = new WebSocket(WEBSOCKET_URL);
    
    socket.onopen = () => {
        socket.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: DISCORD_ID
            }
        }));
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.op === 0) {
            if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                updatePresenceUI(data.d);
            }
        }
        
        if (data.op === 1) {
            const interval = data.d.heartbeat_interval;
            setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ op: 3 }));
                }
            }, interval);
        }
    };
    
    socket.onclose = () => {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => {
                initWebSocket();
            }, RETRY_DELAY);
        } else {
            document.getElementById('discord-status').textContent = 'Connection to Discord closed';
        }
    };
    
    socket.onerror = (error) => {
        console.log('WebSocket error:', error);
        document.getElementById('discord-status').textContent = 'Error connecting to Discord';
    };
}

function updatePresenceUI(data) {
    currentPresence = data;
    
    const statusIndicator = document.getElementById('status-indicator');
    const discordUsername = document.getElementById('discord-username');
    const discordDiscriminator = document.getElementById('discord-discriminator');
    const discordStatus = document.getElementById('discord-status');
    const activityContainer = document.getElementById('activity-container');
    const activityDetails = document.getElementById('activity-details');
    const spotifyWidget = document.getElementById('spotify-widget');
    
    discordUsername.textContent = data.discord_user.username;
    
    if (data.discord_user.discriminator && data.discord_user.discriminator !== '0') {
        discordDiscriminator.textContent = `#${data.discord_user.discriminator}`;
    } else {
        discordDiscriminator.textContent = '';
    }
    
    statusIndicator.className = 'status-indicator';
    statusIndicator.classList.add(data.discord_status);
    
    let statusText = '';
    
    switch (data.discord_status) {
        case 'online':
            statusText = 'Online';
            break;
        case 'idle':
            statusText = 'Idle';
            break;
        case 'dnd':
            statusText = 'Do Not Disturb';
            break;
        default:
            statusText = 'Offline';
    }
    
    if (data.discord_status !== 'offline' && data.active_on_discord_desktop) {
        statusText += ' • Desktop';
    } else if (data.discord_status !== 'offline' && data.active_on_discord_mobile) {
        statusText += ' • Mobile';
    } else if (data.discord_status !== 'offline' && data.active_on_discord_web) {
        statusText += ' • Web';
    }
    
    discordStatus.textContent = statusText;
    
    if (data.activities && data.activities.length > 0) {
        const activity = data.activities.find(a => a.type !== 2) || data.activities[0];
        activityContainer.style.display = 'block';
        
        let activityText = '';
        
        if (activity.type === 0) {
            activityText = `<span class="game-activity"><i class="fas fa-gamepad"></i> Playing ${activity.name}</span>`;
            if (activity.details) {
                activityText += ` - ${activity.details}`;
            }
        } else if (activity.type === 1) {
            activityText = `<span class="game-activity"><i class="fas fa-broadcast-tower"></i> Streaming ${activity.name}</span>`;
        } else if (activity.type === 3) {
            activityText = `<span class="game-activity"><i class="fas fa-tv"></i> Watching ${activity.name}</span>`;
        } else if (activity.type === 4) {
            activityText = `<span class="game-activity"><i class="fas fa-user"></i> ${activity.state}</span>`;
        } else if (activity.type === 5) {
            activityText = `<span class="game-activity"><i class="fas fa-trophy"></i> Competing in ${activity.name}</span>`;
        }
        
        activityDetails.innerHTML = activityText;
    } else {
        activityContainer.style.display = 'none';
        activityDetails.textContent = '';
    }
    
    if (data.listening_to_spotify) {
        spotifyWidget.style.display = 'flex';
        const albumArt = document.getElementById('spotify-album-art');
        const songEl = document.getElementById('spotify-song');
        const artistEl = document.getElementById('spotify-artist');
        
        albumArt.src = data.spotify.album_art_url;
        songEl.textContent = data.spotify.song;
        artistEl.textContent = data.spotify.artist;
        
        spotifyWidget.classList.add('playing');
        
        updateSpotifyProgress(
            data.spotify.timestamps.start,
            data.spotify.timestamps.end
        );
    } else {
        spotifyWidget.style.display = 'none';
        spotifyWidget.classList.remove('playing');
        clearInterval(progressInterval);
    }
}

document.addEventListener('DOMContentLoaded', initLanyard);