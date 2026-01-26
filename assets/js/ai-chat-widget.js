/**
 * AI Chat Widget for Website
 * Floating chat interface that integrates with the unified AI agent
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    primaryColor: '#4F46E5',
    buttonSize: 60,
    chatWidth: 380,
    chatHeight: 600,
    apiKey: null // Set via window.AI_CHAT_CONFIG.apiKey
  };

  // Override with user config
  if (window.AI_CHAT_CONFIG) {
    Object.assign(CONFIG, window.AI_CHAT_CONFIG);
  }

  // Create widget elements
  function createChatWidget() {
    const container = document.createElement('div');
    container.id = 'ai-chat-widget';
    container.innerHTML = `
      <style>
        #ai-chat-widget {
          position: fixed;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }
        
        #ai-chat-button {
          width: ${CONFIG.buttonSize}px;
          height: ${CONFIG.buttonSize}px;
          border-radius: 50%;
          background: ${CONFIG.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        #ai-chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        #ai-chat-button svg {
          width: 28px;
          height: 28px;
          fill: white;
        }
        
        #ai-chat-window {
          position: absolute;
          width: ${CONFIG.chatWidth}px;
          height: ${CONFIG.chatHeight}px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        #ai-chat-window.open {
          display: flex;
        }
        
        #ai-chat-header {
          background: ${CONFIG.primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        #ai-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        #ai-chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        #ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }
        
        .ai-message {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        
        .ai-message.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        
        .ai-message.assistant {
          align-self: flex-start;
        }
        
        .ai-message-content {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .ai-message.user .ai-message-content {
          background: ${CONFIG.primaryColor};
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .ai-message.assistant .ai-message-content {
          background: white;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }
        
        .ai-message-time {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          padding: 0 4px;
        }
        
        #ai-chat-input-container {
          padding: 12px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        
        #ai-chat-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          max-height: 100px;
        }
        
        #ai-chat-input:focus {
          border-color: ${CONFIG.primaryColor};
        }
        
        #ai-chat-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${CONFIG.primaryColor};
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        #ai-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        #ai-chat-send svg {
          width: 18px;
          height: 18px;
          fill: white;
        }
        
        .ai-loading {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
        }
        
        .ai-loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: aiLoading 1.4s infinite;
        }
        
        .ai-loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .ai-loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes aiLoading {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Position variants */
        ${getPositionStyles()}
      </style>
      
      <button id="ai-chat-button" aria-label="Open AI Assistant">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </button>
      
      <div id="ai-chat-window">
        <div id="ai-chat-header">
          <h3>✨ AI Assistant</h3>
          <button id="ai-chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="ai-chat-messages"></div>
        <div id="ai-chat-input-container">
          <textarea id="ai-chat-input" placeholder="Ask me anything..." rows="1"></textarea>
          <button id="ai-chat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    // Initialize chat
    initChat();
  }

  function getPositionStyles() {
    const positions = {
      'bottom-right': `
        #ai-chat-widget {
          bottom: 20px;
          right: 20px;
        }
        #ai-chat-window {
          bottom: ${CONFIG.buttonSize + 12}px;
          right: 0;
        }
      `,
      'bottom-left': `
        #ai-chat-widget {
          bottom: 20px;
          left: 20px;
        }
        #ai-chat-window {
          bottom: ${CONFIG.buttonSize + 12}px;
          left: 0;
        }
      `,
      'top-right': `
        #ai-chat-widget {
          top: 20px;
          right: 20px;
        }
        #ai-chat-window {
          top: ${CONFIG.buttonSize + 12}px;
          right: 0;
        }
      `,
      'top-left': `
        #ai-chat-widget {
          top: 20px;
          left: 20px;
        }
        #ai-chat-window {
          top: ${CONFIG.buttonSize + 12}px;
          left: 0;
        }
      `
    };
    
    return positions[CONFIG.position] || positions['bottom-right'];
  }

  function initChat() {
    const button = document.getElementById('ai-chat-button');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeButton = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input');
    const sendButton = document.getElementById('ai-chat-send');
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    let isOpen = false;
    let agent = null;
    
    // Load AI agent
    if (typeof getAIAgent === 'function') {
      agent = getAIAgent({
        apiKey: CONFIG.apiKey,
        provider: 'anthropic'
      });
      
      // Load existing conversation
      agent.getCurrentConversation().then(conversation => {
        if (conversation && conversation.messages.length > 0) {
          renderMessages(conversation.messages);
        } else {
          showWelcomeMessage();
        }
      });
    }
    
    // Toggle chat
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      chatWindow.classList.toggle('open', isOpen);
      if (isOpen) {
        input.focus();
      }
    });
    
    closeButton.addEventListener('click', () => {
      isOpen = false;
      chatWindow.classList.remove('open');
    });
    
    // Send message
    async function sendMessage() {
      const message = input.value.trim();
      if (!message || !agent) return;
      
      input.value = '';
      input.style.height = 'auto';
      sendButton.disabled = true;
      
      // Add user message
      addMessage('user', message);
      
      // Show loading
      const loadingId = showLoading();
      
      try {
        const response = await agent.sendMessage(message, {
          context: {
            source: 'website-chat',
            page: window.location.pathname
          }
        });
        
        removeLoading(loadingId);
        addMessage('assistant', response.content);
      } catch (error) {
        console.error('Chat error:', error);
        removeLoading(loadingId);
        addMessage('assistant', "I'm having trouble connecting. Please try again.");
      } finally {
        sendButton.disabled = false;
      }
    }
    
    sendButton.addEventListener('click', sendMessage);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
    
    // Message rendering
    function addMessage(role, content) {
      const messageEl = document.createElement('div');
      messageEl.className = `ai-message ${role}`;
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageEl.innerHTML = `
        <div class="ai-message-content">${escapeHtml(content)}</div>
        <div class="ai-message-time">${time}</div>
      `;
      
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function renderMessages(messages) {
      messagesContainer.innerHTML = '';
      messages.forEach(msg => {
        if (msg.role !== 'system') {
          addMessage(msg.role, msg.content);
        }
      });
    }
    
    function showLoading() {
      const loadingId = `loading-${Date.now()}`;
      const loadingEl = document.createElement('div');
      loadingEl.className = 'ai-message assistant';
      loadingEl.id = loadingId;
      loadingEl.innerHTML = `
        <div class="ai-message-content">
          <div class="ai-loading">
            <div class="ai-loading-dot"></div>
            <div class="ai-loading-dot"></div>
            <div class="ai-loading-dot"></div>
          </div>
        </div>
      `;
      messagesContainer.appendChild(loadingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return loadingId;
    }
    
    function removeLoading(loadingId) {
      const el = document.getElementById(loadingId);
      if (el) el.remove();
    }
    
    function showWelcomeMessage() {
      addMessage('assistant', "Hi! I'm your AI assistant. I'm here to help you navigate advocacy, understand legal documents, and provide support. How can I help you today?");
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
