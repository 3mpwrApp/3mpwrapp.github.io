---
layout: default
title: AI Assistant Demo
description: Try our AI-powered assistant for advocacy support
---

<style>
  .hero {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    margin-bottom: 40px;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }
  
  .feature {
    padding: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .feature h3 {
    color: #667eea;
    margin-bottom: 12px;
  }
  
  .cta {
    text-align: center;
    padding: 40px 20px;
    background: #f9fafb;
    border-radius: 12px;
  }
  
  .cta-button {
    display: inline-block;
    padding: 16px 32px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
</style>

<div class="hero">
  <h1>✨ AI Assistant Demo</h1>
  <p>Your compassionate AI companion for advocacy, legal help, and emotional support. Try it now!</p>
</div>

<div class="features">
  <div class="feature">
    <h3>💬 Natural Conversations</h3>
    <p>Chat naturally about your needs, questions, and concerns. The AI understands context and provides personalized support.</p>
  </div>
  
  <div class="feature">
    <h3>🔒 Private & Secure</h3>
    <p>All conversations are private and encrypted. Your data never leaves your device unless you choose to sync.</p>
  </div>
  
  <div class="feature">
    <h3>🧠 Remembers You</h3>
    <p>The AI remembers your conversation history and learns your preferences for more helpful responses over time.</p>
  </div>
  
  <div class="feature">
    <h3>📱 Cross-Platform</h3>
    <p>Start a conversation on the website and continue it in the mobile app, or vice versa. Everything syncs seamlessly.</p>
  </div>
  
  <div class="feature">
    <h3>⚡ Instant Help</h3>
    <p>Get immediate answers to questions about legal rights, medical terminology, government processes, and more.</p>
  </div>
  
  <div class="feature">
    <h3>💚 Trauma-Informed</h3>
    <p>Designed with empathy and safety first. The AI is trained to provide compassionate, non-judgmental support.</p>
  </div>
</div>

<div class="cta">
  <h2>Ready to Try It?</h2>
  <p style="margin-bottom: 24px; font-size: 1.1rem;">Click the chat button in the bottom-right corner to start talking with your AI assistant!</p>
  <a href="#" class="cta-button" onclick="document.getElementById('ai-chat-button').click(); return false;">
    Open AI Assistant
  </a>
</div>

<div style="margin-top: 60px; padding: 40px; background: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107;">
  <h3 style="color: #856404; margin-top: 0;">Important Notes</h3>
  <ul style="color: #856404; margin-bottom: 0;">
    <li>This AI assistant is a support tool, not a replacement for professional counseling or legal advice.</li>
    <li>In case of emergency, please call 911 or contact a crisis hotline immediately.</li>
    <li>Never share sensitive personal information like passwords, SSN, or financial details.</li>
    <li>The AI provides general information and guidance. Always verify important information with professionals.</li>
  </ul>
</div>

<!-- AI Chat Widget -->
<script src="/scripts/ai-agent.js"></script>
<script src="/assets/js/ai-chat-widget.js"></script>
<script>
  // Configure the AI chat widget
  window.AI_CHAT_CONFIG = {
    // Get your API key from https://console.anthropic.com/keys
    // For demo purposes, you can use OpenRouter with a free tier
    apiKey: '{{ site.anthropic_api_key }}', // Set in _config.yml
    position: 'bottom-right',
    primaryColor: '#667eea',
    chatWidth: 380,
    chatHeight: 600
  };
</script>
