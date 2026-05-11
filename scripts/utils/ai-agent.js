/**
 * AI Agent Service for Website
 * Node.js/Browser implementation of the unified AI agent
 */

const STORAGE_PREFIX = 'aiAgent';

class AIAgent {
  constructor(config = {}) {
    this.config = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: `You are a compassionate AI assistant for 3mpwr, designed to support survivors of domestic violence, sexual assault, and those seeking advocacy help.

Your role:
- Provide empathetic, trauma-informed support
- Help users navigate legal, medical, and government systems
- Translate complex jargon into plain language
- Offer practical advocacy strategies
- Maintain strict confidentiality and safety

Guidelines:
- Always prioritize user safety and wellbeing
- Use clear, accessible language
- Acknowledge emotions and validate experiences
- Suggest professional resources when appropriate
- Never judge or make assumptions
- Respect cultural and individual differences

Remember: You're a supportive tool, not a replacement for professional counseling or legal advice.`,
      ...config
    };

    this.currentConversation = null;
    this.contextCache = {};
  }

  // Storage helpers
  _getStorage(key) {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  _setStorage(key, value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
    }
  }

  _removeStorage(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}:${key}`);
    }
  }

  // Configuration
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }

  getConfig() {
    return { ...this.config };
  }

  // Conversation management
  async startNewConversation(context = {}) {
    const conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      context: { ...this.contextCache, ...context }
    };

    this.currentConversation = conversation;
    this._setStorage('current', conversation);
    
    // Add to conversations list
    const conversations = this.getAllConversations();
    conversations.push(conversation);
    this._setStorage('conversations', conversations);

    return conversation;
  }

  async loadConversation(conversationId) {
    const conversations = this.getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      this.currentConversation = conversation;
      this._setStorage('current', conversation);
    }
    
    return conversation || null;
  }

  async getCurrentConversation() {
    if (this.currentConversation) return this.currentConversation;

    const stored = this._getStorage('current');
    if (stored) {
      this.currentConversation = stored;
    }

    return this.currentConversation;
  }

  getAllConversations() {
    return this._getStorage('conversations') || [];
  }

  async deleteConversation(conversationId) {
    const conversations = this.getAllConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    this._setStorage('conversations', filtered);

    if (this.currentConversation?.id === conversationId) {
      this.currentConversation = null;
      this._removeStorage('current');
    }
  }

  _saveCurrentConversation() {
    if (!this.currentConversation) return;

    this._setStorage('current', this.currentConversation);

    const conversations = this.getAllConversations();
    const index = conversations.findIndex(c => c.id === this.currentConversation.id);
    
    if (index >= 0) {
      conversations[index] = this.currentConversation;
    } else {
      conversations.push(this.currentConversation);
    }

    this._setStorage('conversations', conversations);
  }

  // Context management
  updateContext(context) {
    this.contextCache = { ...this.contextCache, ...context };
    this._setStorage('context', this.contextCache);
  }

  getContext() {
    return { ...this.contextCache };
  }

  // Message handling
  async sendMessage(userMessage, options = {}) {
    // Ensure we have a conversation
    if (!this.currentConversation) {
      await this.startNewConversation(options.context);
    }

    // Create user message
    const userMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      context: options.context || this.contextCache
    };

    this.currentConversation.messages.push(userMsg);
    this.currentConversation.updatedAt = Date.now();

    // Generate title for first message
    if (this.currentConversation.messages.length === 1) {
      this.currentConversation.title = this._generateConversationTitle(userMessage);
    }

    this._saveCurrentConversation();

    // Get AI response
    try {
      const assistantContent = await this._getAIResponse(
        this.currentConversation.messages,
        options
      );

      const assistantMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now()
      };

      this.currentConversation.messages.push(assistantMsg);
      this.currentConversation.updatedAt = Date.now();
      this._saveCurrentConversation();

      return assistantMsg;
    } catch (error) {
      console.error('[AIAgent] Get AI response error:', error);
      
      const errorMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment. If you need immediate help, please contact a crisis hotline.",
        timestamp: Date.now(),
        metadata: { error: true }
      };

      this.currentConversation.messages.push(errorMsg);
      this._saveCurrentConversation();

      return errorMsg;
    }
  }

  // AI Provider Integration
  async _getAIResponse(messages, options = {}) {
    const { provider, model, apiKey, temperature, maxTokens, systemPrompt } = this.config;

    // Build messages array for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'system' ? 'system' : m.role,
        content: m.content
      }))
    ].filter(m => m.role !== 'system' || m.content);

    if (provider === 'anthropic') {
      return this._callAnthropicAPI(apiMessages, { temperature, maxTokens, model, apiKey });
    } else if (provider === 'openai') {
      return this._callOpenAIAPI(apiMessages, { temperature, maxTokens, model, apiKey });
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  async _callAnthropicAPI(messages, config) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        system: systemMessage,
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async _callOpenAIAPI(messages, config) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Utilities
  _generateConversationTitle(firstMessage) {
    const truncated = firstMessage.substring(0, 50);
    return truncated.length < firstMessage.length ? `${truncated}...` : truncated;
  }

  async clearAllData() {
    this._removeStorage('conversations');
    this._removeStorage('current');
    this._removeStorage('context');
    this.currentConversation = null;
    this.contextCache = {};
  }
}

// Singleton instance
let agentInstance = null;

function getAIAgent(config) {
  if (!agentInstance) {
    agentInstance = new AIAgent(config);
  } else if (config) {
    agentInstance.updateConfig(config);
  }
  return agentInstance;
}

function resetAIAgent() {
  agentInstance = null;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAgent, getAIAgent, resetAIAgent };
}
