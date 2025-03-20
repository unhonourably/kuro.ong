class AudioController {
    constructor() {
        this.audioPlayer = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause');
        this.muteBtn = document.getElementById('mute');
        this.volumeSlider = document.getElementById('volume-slider');
        this.prevBtn = document.getElementById('prev-track');
        this.nextBtn = document.getElementById('next-track');
        this.trackNameDisplay = document.getElementById('current-track-name');
        
        // Playlist configuration
        this.playlist = [
            // Add your music files here
            'music/wildflower.wav',
            'music/runaway.wav',
        ];
        
        this.trackNames = [
            // Add your track names here (in the same order as playlist)
            'WILDFLOWER - Billie Eilish',
            'RUNAWAY - Kanye West',
        ];

        this.currentTrackIndex = 0;
        this.initializePlayer();
        this.setupEventListeners();
        
        // Load the last known state from localStorage or set default state
        this.loadState();

        // Call autoplay immediately and set up multiple attempts
        this.forceAutoplay();
    }

    initializePlayer() {
        this.audioPlayer.src = this.playlist[this.currentTrackIndex];
        this.trackNameDisplay.textContent = this.trackNames[this.currentTrackIndex];
        
        // Set default volume to 50%
        this.audioPlayer.volume = 0.5;
        this.volumeSlider.value = 50;
    }

    setupEventListeners() {
        // Play/Pause
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());

        // Previous Track
        this.prevBtn.addEventListener('click', () => this.previousTrack());

        // Next Track
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Mute
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Volume
        this.volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));

        // Track Ended
        this.audioPlayer.addEventListener('ended', () => this.nextTrack());

        // Save state before page unload
        window.addEventListener('beforeunload', () => this.saveState());

        // Add visibilitychange event listener to handle tab changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Update UI to match current state when tab becomes visible
                this.updateUIState();
            }
        });
    }

    togglePlay() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    previousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadAndPlayTrack();
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadAndPlayTrack();
    }

    loadAndPlayTrack() {
        this.audioPlayer.src = this.playlist[this.currentTrackIndex];
        this.trackNameDisplay.textContent = this.trackNames[this.currentTrackIndex];
        this.audioPlayer.play();
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    toggleMute() {
        this.audioPlayer.muted = !this.audioPlayer.muted;
        this.muteBtn.innerHTML = this.audioPlayer.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    }

    updateVolume(value) {
        this.audioPlayer.volume = value / 100;
        if (value == 0) {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.audioPlayer.muted = true;
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.audioPlayer.muted = false;
        }
    }

    saveState() {
        localStorage.setItem('audioPlayerState', JSON.stringify({
            currentTrackIndex: this.currentTrackIndex,
            currentTime: this.audioPlayer.currentTime,
            volume: this.audioPlayer.volume,
            isPlaying: !this.audioPlayer.paused,
            muted: this.audioPlayer.muted
        }));
    }

    loadState() {
        const savedState = JSON.parse(localStorage.getItem('audioPlayerState'));
        if (savedState) {
            // Load saved state
            this.currentTrackIndex = savedState.currentTrackIndex;
            this.audioPlayer.src = this.playlist[this.currentTrackIndex];
            this.audioPlayer.currentTime = savedState.currentTime;
            this.audioPlayer.volume = savedState.volume;
            this.volumeSlider.value = savedState.volume * 100;
            this.trackNameDisplay.textContent = this.trackNames[this.currentTrackIndex];
            
            // Always try to play, regardless of saved state
            this.forceAutoplay();
        } else {
            // Set default state for first time visitors
            this.audioPlayer.volume = 0.5;
            this.volumeSlider.value = 50;
            this.trackNameDisplay.textContent = this.trackNames[0];
            
            // Force autoplay for new visitors
            this.forceAutoplay();
        }
    }

    updateUIState() {
        // Update play/pause button
        this.playPauseBtn.innerHTML = this.audioPlayer.paused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
        
        // Update volume button
        this.muteBtn.innerHTML = this.audioPlayer.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
        
        // Update track name
        this.trackNameDisplay.textContent = this.trackNames[this.currentTrackIndex];
    }

    forceAutoplay() {
        // Try immediate autoplay
        this.tryAutoplay();

        // Backup attempts in case the first one fails
        const attempts = [0, 100, 500, 1000, 2000]; // Multiple timing attempts
        attempts.forEach(delay => {
            setTimeout(() => this.tryAutoplay(), delay);
        });

        // Add user interaction listeners to enable audio
        const userInteractionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        const enableAudio = () => {
            this.tryAutoplay();
            userInteractionEvents.forEach(event => {
                document.removeEventListener(event, enableAudio);
            });
        };

        userInteractionEvents.forEach(event => {
            document.addEventListener(event, enableAudio, { once: true });
        });
    }

    tryAutoplay() {
        if (this.audioPlayer.paused) {
            const playPromise = this.audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Playback started successfully
                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        this.audioPlayer.volume = 0.5;
                        this.volumeSlider.value = 50;
                    })
                    .catch(error => {
                        // Auto-play was prevented
                        console.log("Autoplay prevented:", error);
                        // Will try again on user interaction
                    });
            }
        }
    }
}

// Initialize with a small delay to ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is properly loaded
    setTimeout(() => {
        const audioController = new AudioController();
    }, 100);
});
