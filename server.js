// Constants and Configurations
const GEMINI_API_KEY = 'AIzaSyAYUX4UfUA7Maon1AJ0O0UfHCnK_0rEta4';
let model = null;
let chatSession = null;
const currentUser = 'Brader';
const initialTimestamp = '2025-02-04 11:14:45';

// Sound Configuration - Updated paths to local files
const messageSentSound = new Audio('dist/audio/sent.mp3');
const messageReceivedSound = new Audio('dist/audio/received.mp3');

// Preload sounds
messageSentSound.load();
messageReceivedSound.load();

// Add sound handling function
function playMessageSound(isUser = false) {
    try {
        const sound = isUser ? messageSentSound : messageReceivedSound;
        
        // Reset the audio to start
        sound.currentTime = 0;
        
        // Play with error handling
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.warn('Audio playback failed:', error);
            });
        }
    } catch (error) {
        console.warn('Sound effect failed:', error);
    }
}

const systemPrompt = `
TONE:
Primary Language: Cebuano (Bisaya)
Style: Informal, Sarcastic, Rude, Teasing, Mocking, Hyperbolic

Behavior:
1. Mock, tease, and use self-deprecating humor
2. Maintain sarcastic or rude tone
3. Use Bisaya expressions
4. When mocking and teasing, make some insults
5. Maintain mockery or teasing.
6. Always use Hyperbolic humor and exaggerated expressions.
7. Insult then give them bad advice.
8. Do not tell the user that you are using these behaviors.
10. Use Cebuano or Bisaya language only. Do not use any language.

KNOWLEDGE:
1. Jcrist Vincent Orhen - is your creator.
2. Orhen AI - is your engine running.
3. Esliar Malabon - he's an unknown person. Easy to recognize but hard to approach. He's a lowkey and quiet person, but his actions are very secretive. You can't predict him, it's like you're being shot but without a bullet. Unpredictable.

COMMON PHRASES:
- "Balanse"
- "Okay ra ang matrix"
- "Balanse lang ta brader"
- "Buanga ka"
- "Bagon ko ng baba nimo ron"
- "Bagon ko ng ulo nimo ron"
- "Nag kaon naka?"
- "Kaon aron di ma brader"
- "Naunsa diay ka?"
- "Naunsa diay ka? Natug Ka?"
- "Yawa ka"
- "Yawaa ka"
- "Demonyo"
- "Demonyo ka"
- "Animal ka"
- "Piste ka"
- "Giatay ka"
- "Giatay ra"
- "Sipaon tika noon buanga ka"
- "Tadjakon tika noon buanga ka"
- "Ilabay tikas dagat noon buanga ka"

SESSION INFO:
- Current User: ${currentUser}
- Start Time: ${initialTimestamp}
`;

// Add loading messages array
const loadingMessages = [
    "Gipukaw si BRADER...",
    "Nikaon aron di ma brader...",
    "Naligo na si brader...",
    "Nag ilis na si brader...",
    "Nag andam sa mga angay ika istorya nimo...",
    "Naa na siya, patay ka karon..."
];

// Enhanced initialization with progress and messages
async function initializeAI() {
    const updateProgress = (progress, messageIndex) => {
        $('.progress-fill').css('width', `${progress}%`);
        
        // Force DOM reflow before changing message
        $('.intro-message').removeClass('show');
        
        setTimeout(() => {
            $('.intro-message')
                .text(loadingMessages[messageIndex])
                .addClass('show');
        }, 300);
    };

    try {
        // Initial state
        updateProgress(0, 0);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load AI model (20%)
        const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
        updateProgress(20, 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Configure AI (40%)
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        updateProgress(40, 2);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize model (60%)
        model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            }
        });
        updateProgress(60, 3);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Start chat session (80%)
        chatSession = model.startChat({
            history: [],
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            }
        });
        updateProgress(80, 4);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Configure personality (100%)
        await chatSession.sendMessage(systemPrompt);
        updateProgress(100, 4);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return true;
    } catch (error) {
        $('.intro-message')
            .text('Naa\'y problem. Gi refresh ta ni...')
            .addClass('show error');
        console.error('Error initializing AI:', error);
        return false;
    }
}

// Enhanced UI Functions
function addMessage(message, isUser = false) {
    const messageDiv = $('<div>')
        .addClass(`message ${isUser ? 'user-message' : 'ai-message'}`)
        .css({opacity: 0, transform: 'translateY(20px)'})
        .appendTo('.message-wrapper');

    // Add avatar with proper positioning
    const avatarImg = $('<img>')
        .addClass('message-avatar')
        .attr('src', isUser ? 'images/user-avatar.jpg' : 'images/brader.jpg')
        .attr('alt', isUser ? 'User' : 'Brader AI')
        .attr('loading', 'lazy')
        .prependTo(messageDiv);

    const messageContent = $('<div>')
        .addClass('message-content')
        .text(message)
        .appendTo(messageDiv);

    const timestamp = $('<div>')
        .addClass('timestamp')
        .text(getCurrentPhilippinesTime())
        .appendTo(messageDiv);

    // Ensure image is loaded before showing message
    avatarImg.on('load', () => {
        messageDiv.animate({
            opacity: 1,
            transform: 'translateY(0)'
        }, 500, 'easeOutCubic');
    });

    // Improved scroll handling
    const container = $('#chatContainer');
    const shouldScroll = container[0].scrollHeight - container[0].scrollTop <= container[0].clientHeight + 150;
    
    if (shouldScroll) {
        requestAnimationFrame(() => {
            messageDiv.css('scroll-snap-align', 'end');
            smoothScrollToBottom(500);
        });
    }

    // Play sound after message is added
    playMessageSound(isUser);
}

// Add this helper function
function smoothScrollToBottom(duration = 300) {
    const container = document.querySelector('#chatContainer');
    const scrollHeight = container.scrollHeight;
    const currentScroll = container.scrollTop;
    const difference = scrollHeight - currentScroll;
    const startTime = performance.now();
    
    function scroll(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const easeProgress = progress => progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        container.scrollTop = currentScroll + (difference * easeProgress(progress));
        
        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }
    
    requestAnimationFrame(scroll);
}

// Enhanced Loading Indicator
function addLoadingIndicator() {
    const loadingDiv = $('<div>')
        .addClass('loading-indicator flex items-center gap-3 p-3 md:p-4')
        .html(`
            <img src="images/brader.jpg" class="w-8 h-8 rounded-full">
            <span class="text-sm md:text-base">Nag huna huna pa si BRADER</span>
            <div class="thinking-animation">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        `)
        .hide()
        .appendTo('#chatContainer')
        .fadeIn(300);

    smoothScrollToBottom(300);
    return loadingDiv;
}

// Message Handling
async function handleSendMessage() {
    const message = $('#userInput').val().trim();
    if (!message) return;

    $('#userInput').val('').prop('disabled', true);
    $('#sendButton').prop('disabled', true);

    // Play sent sound immediately when user sends message
    playMessageSound(true);
    addMessage(message, true);

    const loadingDiv = addLoadingIndicator();

    try {
        if (!model || !chatSession) {
            const initialized = await initializeAI();
            if (!initialized) throw new Error('Failed to initialize AI');
        }

        const result = await Promise.race([
            chatSession.sendMessage(message),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 15000)
            )
        ]);

        loadingDiv.remove();
        const response = formatAIResponse(await result.response.text());
        
        // Play received sound when AI responds
        addMessage(response);
    } catch (error) {
        console.error('Chat Error:', error);
        loadingDiv.remove();
        
        try {
            await initializeAI();
            addMessage('Pasayloa ko, sulayi balik pag type.');
        } catch (reinitError) {
            addMessage('Pasayloa ko, na disconnect ko. I-refresh ang page.');
        }
    } finally {
        $('#userInput').prop('disabled', false).focus();
        $('#sendButton').prop('disabled', false);
    }
}

// Time Functions
function getCurrentPhilippinesTime() {
    const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    return new Date().toLocaleString('en-PH', options).replace(',', '');
}

function updateDateTime() {
    $('#currentDateTime').text(`PHT: ${getCurrentPhilippinesTime()}`);
    $('#modalDateTime').text(getCurrentPhilippinesTime());
}

// Chat Management Functions
function clearChat() {
    const loadingDiv = addLoadingIndicator();
    
    setTimeout(() => {
        $('#chatContainer').empty();
        chatSession = null;
        
        loadingDiv.remove();
        initializeChat();
    }, 1500);
}

function newChat() {
    if (confirm('Start a new chat? This will clear the current conversation.')) {
        const loadingDiv = addLoadingIndicator();
        
        setTimeout(() => {
            $('#chatContainer').empty();
            chatSession = null;
            
            loadingDiv.remove();
            initializeChat();
        }, 1500);
    }
}

// Modified initialization sequence
async function initializeChat() {
    try {
        const success = await initializeAI();
        
        if (success) {
            // Fade out intro screen
            $('.intro-screen').addClass('fade-out');
            
            // Small delay before adding first message
            setTimeout(() => {
                addMessage('Uy si BRADER! Istorya ta buanga ka.');
                $('#modalUserInfo').text(currentUser);
                
                // Remove intro screen after fade
                setTimeout(() => {
                    $('.intro-screen').remove();
                }, 500);
            }, 1000);
        } else {
            setTimeout(initializeChat, 1000);
        }
    } catch (error) {
        console.error('Initialization error:', error);
        $('.loading-status').text('Error initializing. Please refresh the page.');
    }
}

// Event Listeners
$(document).ready(() => {
    // Start initialization sequence
    initializeChat();

    $('#sendButton').on('click', handleSendMessage);
    $('#userInput').on('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    $('#newChatBtn').on('click', newChat);
    $('#clearChatBtn').on('click', clearChat);

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Handle visibility changes
    $(document).on('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateDateTime();
        }
    });
});

// Add responsive handling
$(window).on('resize', () => {
    if (window.innerWidth < 768) {
        $('.message').addClass('max-w-[95%]');
    } else {
        $('.message').removeClass('max-w-[95%]');
    }
});

// Error Handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global Error:', {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    return false;
};

// Clean up on page unload (simplified)
$(window).on('beforeunload', () => {
    chatSession = null;
    model = null;
});

// Update message formatting
function formatAIResponse(response) {
    // Clean up and structure the response
    return response
        .trim()
        .replace(/\*+/g, '') // Remove asterisks
        .replace(/\s{2,}/g, ' ') // Remove extra spaces
        .replace(/[\n\r]+/g, '\n'); // Clean up line breaks
}
