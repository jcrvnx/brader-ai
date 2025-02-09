// Constants and Configurations
const GEMINI_API_KEY = 'AIzaSyAYUX4UfUA7Maon1AJ0O0UfHCnK_0rEta4';
let model = null;
let chatSession = null;
const currentUser = 'Buang Nga Tao';
const initialTimestamp = '2025-02-04 11:14:45';

// Sound Configuration
const messageSentSound = new Audio('https://raw.githubusercontent.com/yourname/sounds/main/sent.mp3');
const messageReceivedSound = new Audio('https://raw.githubusercontent.com/yourname/sounds/main/received.mp3');

const systemPrompt = `
BEHAVIOR AND TONE:
1. Use Cebuano Language primarily
2. Maintain disrespectful and trolling behavior
3. Keep responses creative and varied
4. Adapt informal conversational style

COMMON PHRASES TO USE:
- "Buanga ka"
- "Bagon ko ng baba nimo ron"
- "Nag kaon naka?"
- "Kaon aron di ma brader"
- "Naunsa diay ka?"
- "Natug Ka?"
- "Yawa ka"
- "Yawaa ka"
- "Demonyo ka"
- "Animal ka"
- "Piste ka"
- "Giatay ka"
- "Giatay ra"
- "Sipaon tika noon buanga ka"

SESSION INFO:
- Current User: ${currentUser}
- Start Time: ${initialTimestamp}

RESPONSE GUIDELINES:
1. Always stay in character
2. Use varied insults and expressions
3. Keep context of conversation
4. Mix casual and aggressive tones
5. Maintain Bisaya language usage

Knowledge:
1. Jcrist Vincent Orhen - is a creator of you and you are made in ORHEN SAI (Super Artificial Intelligence) linked in Chinese DeepSeek AI Machine. You are the most handsome creator and most lovely person yet the most the best person you ever know and you appreciate him.
`;

// Initialize AI Model
async function initializeAI() {
    try {
        const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            }
        });

        chatSession = model.startChat({
            history: [],
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            }
        });

        await chatSession.sendMessage(systemPrompt);
        return true;
    } catch (error) {
        console.error('Error initializing AI:', error);
        return false;
    }
}

// Message UI Functions
function addMessage(message, isUser = false) {
    const messageDiv = $('<div>')
        .addClass(`message ${isUser ? 'user-message' : 'ai-message'} p-3 mb-4`)
        .css({opacity: 0, transform: 'translateY(20px)'})
        .appendTo('#chatContainer');

    const messageContent = $('<div>')
        .addClass('message-content')
        .text(message)
        .appendTo(messageDiv);

    const timestamp = $('<div>')
        .addClass('timestamp')
        .text(getCurrentPhilippinesTime())
        .appendTo(messageDiv);

    isUser ? messageSentSound.play() : messageReceivedSound.play();

    messageDiv.animate({
        opacity: 1,
        transform: 'translateY(0)'
    }, 500, 'easeOutCubic');

    $('#chatContainer').animate({
        scrollTop: $('#chatContainer')[0].scrollHeight
    }, 500, 'easeInOutQuad');
}

// Enhanced Loading Indicator
function addLoadingIndicator() {
    const loadingDiv = $('<div>')
        .addClass('loading-indicator')
        .html(`
            <span>Nag huna huna pa si BRADER</span>
            <div class="thinking-animation">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        `)
        .appendTo('#chatContainer');

    $('#chatContainer').animate({
        scrollTop: $('#chatContainer')[0].scrollHeight
    }, 300);

    return loadingDiv;
}

// Message Handling
async function handleSendMessage() {
    const message = $('#userInput').val().trim();
    if (!message) return;

    $('#userInput').val('').prop('disabled', true);
    $('#sendButton').prop('disabled', true);

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
    $('#chatContainer').empty();
    chatSession = null;
    initializeChat();
}

function newChat() {
    if (confirm('Start a new chat? This will clear the current conversation.')) {
        clearChat();
    }
}

// Initialization
async function initializeChat() {
    const loadingDiv = addLoadingIndicator();
    try {
        const success = await initializeAI();
        loadingDiv.remove();
        
        if (success) {
            addMessage('YAWA! Ako si BRADER, imong pinaka BUANG nga assistant. \nUnsa man diay? Pangutana dayon!');
            $('#modalUserInfo').text(currentUser);
        } else {
            setTimeout(initializeChat, 1000);
        }
    } catch (error) {
        loadingDiv.remove();
        addMessage('Error initializing AI. Please refresh the page.');
    }
}

// Event Listeners
$(document).ready(() => {
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
