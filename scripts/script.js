const LASTFM_API_KEY = window.config.LASTFM_API_KEY;
const LASTFM_USERNAME = window.config.LASTFM_USERNAME;

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

document.addEventListener('DOMContentLoaded', () => {
    const profileCard = document.querySelector('.profile-card');
    
    if (profileCard) {
        profileCard.style.opacity = '0';
        profileCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            profileCard.style.transition = 'all 0.5s ease';
            profileCard.style.opacity = '1';
            profileCard.style.transform = 'translateY(0)';
        }, 100);
    }
});

document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateX(0)';
    });
});

const discordModal = document.getElementById('discord-modal');
const discordTrigger = document.getElementById('discord-trigger');
const closeModal = document.querySelector('.close-modal');
const discordServers = document.querySelector('.discord-servers');

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
        const inviteCode = serverId.includes('discord.gg/') 
            ? serverId.split('discord.gg/')[1]
            : serverId;
            
        const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
        if (!response.ok) {
            throw new Error('Failed to fetch server info');
        }
        const data = await response.json();
        
        const iconUrl = data.guild.icon 
            ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
            : null;

        return {
            members: data.approximate_member_count || 0,
            online: data.approximate_presence_count || 0,
            icon: iconUrl,
            name: data.guild.name
        };
    } catch (error) {
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
    
    const serverInfo = await fetchServerInfo(server.invite);
    
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

discordModal.addEventListener('click', (e) => {
    if (e.target === discordModal) {
        closeModalHandler();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && discordModal.classList.contains('active')) {
        closeModalHandler();
    }
});

const transitionElement = document.createElement('div');
transitionElement.className = 'page-transition';
document.body.appendChild(transitionElement);

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const moreModal = document.getElementById('more-modal');
    const moreButton = document.getElementById('more-info');
    
    if (moreButton && moreModal) {
        function openMoreModal(e) {
            if (e) {
                e.preventDefault();
            }
            
            const moreModal = document.getElementById('more-modal');
            moreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            moreModal.style.visibility = 'visible';
            moreModal.style.display = 'flex';
            moreModal.style.opacity = '0';
            
            moreModal.style.transition = 'opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            
            const modalContent = moreModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'translateY(40px) scale(0.95)';
                modalContent.style.opacity = '0';
                modalContent.style.backgroundColor = 'rgba(15, 15, 15, 0.6)';
                modalContent.style.backdropFilter = 'blur(8px)';
                
                modalContent.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                modalContent.style.willChange = 'transform, opacity';
            }
            
            void moreModal.offsetWidth;
            
            moreModal.style.opacity = '1';
            
            setTimeout(() => {
                if (modalContent) {
                    modalContent.style.transform = 'translateY(0) scale(1)';
                    modalContent.style.opacity = '1';
                }
            }, 50);
            
            const botCards = moreModal.querySelectorAll('.bot-card');
            botCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 75));
            });
            
            const collabCards = moreModal.querySelectorAll('.collab-card');
            collabCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 50));
            });
        }
        
        moreButton.addEventListener('click', openMoreModal);
        
        function closeMoreModal() {
            const moreModal = document.getElementById('more-modal');
            const modalContent = moreModal.querySelector('.modal-content');
            
            moreModal.style.transition = 'opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            
            if (modalContent) {
                modalContent.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
                modalContent.style.transform = 'translateY(-20px) scale(0.98)';
                modalContent.style.opacity = '0';
            }
            
            setTimeout(() => {
                moreModal.style.opacity = '0';
            }, 50);
            
            setTimeout(() => {
                moreModal.style.display = 'none';
                moreModal.style.visibility = 'hidden';
                
                if (modalContent) {
                    modalContent.style.transform = 'translateY(-40px) scale(0.95)';
                }
            }, 450);
        }
        
        const moreModal = document.getElementById('more-modal');
        if (moreModal) {
            const closeButtons = moreModal.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', closeMoreModal);
            });
            
            moreModal.addEventListener('click', (e) => {
                if (e.target === moreModal) {
                    closeMoreModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && 
                    (moreModal.style.display === 'flex' || 
                    getComputedStyle(moreModal).display === 'flex')) {
                    closeMoreModal();
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const discordModal = document.getElementById('discord-modal');
    const discordTrigger = document.getElementById('discord-trigger');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    if (discordModal) {
        const applyTransparency = () => {
            discordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            
            const modalContent = discordModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.backgroundColor = 'rgba(15, 15, 15, 0.6)';
                modalContent.style.backdropFilter = 'blur(8px)';
            }
        };
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'style') {
                    const isVisible = 
                        (discordModal.classList.contains('active')) ||
                        (window.getComputedStyle(discordModal).display !== 'none');
                    
                    if (isVisible) {
                        applyTransparency();
                    }
                }
            });
        });
        
        observer.observe(discordModal, { attributes: true });
        
        applyTransparency();
    }
    
    if (discordTrigger) {
        const newTrigger = discordTrigger.cloneNode(true);
        discordTrigger.parentNode.replaceChild(newTrigger, discordTrigger);
        
        newTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            openModal();
            
            setTimeout(applyTransparency, 10);
        });
    }
    
    closeButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => {
            const modal = newButton.closest('.modal');
            
            if (modal.id === 'discord-modal') {
                closeModalHandler();
            } else if (modal.id === 'more-modal') {
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

document.addEventListener('DOMContentLoaded', () => {
    const discordModal = document.getElementById('discord-modal');
    
    if (discordModal) {
        discordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const modalContent = discordModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
            modalContent.style.backdropFilter = 'blur(5px)';
            modalContent.style.webkitBackdropFilter = 'blur(5px)';
            modalContent.style.backgroundImage = 'none';
            modalContent.style.boxShadow = '0 15px 25px rgba(0, 0, 0, 0.4)';
            modalContent.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }
        
        const serverCards = discordModal.querySelectorAll('.discord-server');
        serverCards.forEach(card => {
            card.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.removeAttribute('style');
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.removeAttribute('style');
            content.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
            content.style.backdropFilter = 'blur(5px)';
        }
    });
});

window.addEventListener('load', () => {
    const style = document.createElement('style');
    style.textContent = `
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
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.setAttribute('style', 'background-color: rgba(0, 0, 0, 0.6) !important');
        
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.setAttribute('style', 'background-color: rgba(15, 15, 15, 0.6) !important; backdrop-filter: blur(8px) !important');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const moreInfoIcon = document.querySelector('#more-info i');
    if (moreInfoIcon) {
        moreInfoIcon.classList.remove('fa-question');
        moreInfoIcon.classList.add('fa-book');
    }
    
    const moreModal = document.getElementById('more-modal');
    if (moreModal) {
        const moreTitle = moreModal.querySelector('.more-content h1');
        if (moreTitle) {
            moreTitle.style.display = 'none';
        }
        
        const firstSection = moreModal.querySelector('.info-section');
        if (firstSection) {
            firstSection.style.marginTop = '0';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const backgroundAudio = document.getElementById('background-audio');
    const audioControls = document.getElementById('audio-controls');
    const audioToggle = document.getElementById('audio-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const body = document.body;
    
    if (audioControls) {
        audioControls.style.opacity = '0';
        audioControls.style.visibility = 'hidden';
    }
    
    function enterSite() {
        backgroundAudio.play().then(() => {
            if (audioToggle) {
                audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                audioToggle.classList.add('playing');
            }
        }).catch(error => {
            if (audioToggle) {
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                audioToggle.classList.remove('playing');
            }
        });
        
        if (backgroundAudio && volumeSlider) {
            backgroundAudio.volume = volumeSlider.value / 100;
        }
        
        splashScreen.style.opacity = '0';
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            
            if (audioControls) {
                audioControls.style.visibility = 'visible';
                setTimeout(() => {
                    audioControls.style.opacity = '1';
                }, 500);
            }
            
            body.classList.remove('loading');
            
            initializeMainSite();
        }, 1000);
    }
    
    function setupAudioControls() {
        if (!audioToggle || !volumeSlider) return;
        
        audioToggle.addEventListener('click', function() {
            if (backgroundAudio.paused) {
                backgroundAudio.play().then(() => {
                    audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    audioToggle.classList.add('playing');
                });
            } else {
                backgroundAudio.pause();
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                audioToggle.classList.remove('playing');
            }
        });
        
        volumeSlider.addEventListener('input', function() {
            const newVolume = this.value / 100;
            backgroundAudio.volume = newVolume;
            
            if (newVolume === 0) {
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (newVolume < 0.5) {
                audioToggle.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            
            updateVolumeSliderBackground(newVolume * 100);
        });
    }
    
    function updateVolumeSliderBackground(value) {
        if (!volumeSlider) return;
        
        volumeSlider.style.background = `linear-gradient(to right, 
            rgba(255, 255, 255, 0.7) 0%, 
            rgba(255, 255, 255, 0.7) ${value}%, 
            rgba(255, 255, 255, 0.2) ${value}%, 
            rgba(255, 255, 255, 0.2) 100%)`;
    }
    
    splashScreen.addEventListener('click', enterSite);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && body.classList.contains('loading')) {
            enterSite();
        }
    });
    
    function initializeMainSite() {
        setupAudioControls();
        
        if (volumeSlider) {
            updateVolumeSliderBackground(volumeSlider.value);
        }
        
        const elementsToAnimate = [
            document.querySelector('.name-glow'),
            document.querySelector('.social-bar'),
            document.querySelector('.music-widget')
        ];
        
        elementsToAnimate.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.classList.add('animate-in');
                    
                }, index * 200);
            }
        });
        
        if (typeof fetchNowPlaying === 'function') {
            setTimeout(() => {
                fetchNowPlaying();
                setInterval(fetchNowPlaying, 30000);
            }, 1000);
        }
    }
    
    window.addEventListener('beforeunload', function() {
        if (backgroundAudio) {
            backgroundAudio.pause();
            backgroundAudio.currentTime = 0;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const transitionElement = document.querySelector('.page-transition');
    if (!transitionElement) {
        return;
    }
    
    if (document.referrer.includes('more/index.html')) {
        const container = document.querySelector('.container');
        
        if (!container) {
            return;
        }
        
        transitionElement.classList.add('active');
        container.style.opacity = '0';
        container.style.transform = 'translateX(-100px)';
        
        setTimeout(() => {
            if (transitionElement && document.body.contains(transitionElement)) {
                transitionElement.classList.remove('active');
            }
            
            if (container && document.body.contains(container) && container.style) {
                container.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                container.style.opacity = '1';
                container.style.transform = 'translateX(0)';
            }
        }, 100);
    }
});