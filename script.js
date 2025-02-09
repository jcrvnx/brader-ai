        // Add smooth scroll behavior
        document.querySelector('#chatContainer').style.scrollBehavior = 'smooth';
        
        // Add touch support for mobile
        let touchStartY = 0;
        document.querySelector('#chatContainer').addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // Enhanced scroll behavior
        const chatContainer = document.querySelector('#chatContainer');
        
        // Smooth scroll settings
        const smoothScroll = {
            behavior: 'smooth',
            block: 'end'
        };

        // Handle scroll events
        chatContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer;
            if (scrollHeight - scrollTop === clientHeight) {
                chatContainer.setAttribute('data-at-bottom', 'true');
            } else {
                chatContainer.setAttribute('data-at-bottom', 'false');
            }
        });

        // Improved smooth scroll function
        function smoothScrollToBottom(duration = 300) {
            const scrollHeight = chatContainer.scrollHeight;
            const currentScroll = chatContainer.scrollTop;
            const difference = scrollHeight - currentScroll;
            const startTime = performance.now();
            
            function scroll(currentTime) {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Easing function
                const easeProgress = progress => progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                chatContainer.scrollTop = currentScroll + (difference * easeProgress(progress));
                
                if (progress < 1) {
                    requestAnimationFrame(scroll);
                }
            }
            
            requestAnimationFrame(scroll);
        }

        // Observe chat container for changes
        new MutationObserver(() => {
            const shouldAutoScroll = chatContainer.scrollTop + chatContainer.clientHeight >= 
                chatContainer.scrollHeight - 100;
                
            if (shouldAutoScroll) {
                smoothScrollToBottom();
            }
        }).observe(chatContainer, { childList: true, subtree: true });

        // Handle resize events
        window.addEventListener('resize', () => {
            if (chatContainer.scrollHeight > chatContainer.clientHeight) {
                smoothScrollToBottom(100);
            }
        }, { passive: true });