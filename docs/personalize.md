---
layout: default
title: Website Personalization - Choose Your Path
description: Personalize your 3mpwrApp website experience based on your role and needs
permalink: /personalize/
---

<style>
.persona-selector {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.persona-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.persona-card:hover {
  border-color: #4CAF50;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.persona-card.selected {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.persona-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.persona-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.persona-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

.persona-features {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.persona-features h4 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #4CAF50;
}

.persona-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.persona-features li {
  font-size: 0.85rem;
  padding: 0.25rem 0;
  color: #555;
}

.persona-features li::before {
  content: "✓ ";
  color: #4CAF50;
  font-weight: bold;
}

.btn-continue {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 2rem;
  transition: background 0.3s ease;
}

.btn-continue:hover {
  background: #45a049;
  color: white;
}

.skip-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}
</style>

<div class="persona-selector">
  <h1 style="text-align: center; margin-bottom: 1rem;">Welcome to 3mpwrApp™</h1>
  <p style="text-align: center; font-size: 1.1rem; color: #666; max-width: 600px; margin: 0 auto 3rem;">
    Tell us who you are so we can show you the most relevant information first.
  </p>

  <div class="persona-grid" id="persona-grid">
    <!-- Injured Worker / Person with Disability -->
    <div class="persona-card" data-persona="injured-worker" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">💪</span>
      <h3 class="persona-title">Injured Worker / Person with Disability</h3>
      <p class="persona-desc">
        You're navigating workers' compensation, disability benefits, or tribunal appeals.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>Claim assistance tools</li>
          <li>Evidence management</li>
          <li>Tribunal preparation</li>
          <li>Wellness tracking</li>
          <li>Community support</li>
        </ul>
      </div>
    </div>

    <!-- Advocate / Support Person -->
    <div class="persona-card" data-persona="advocate" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">🤝</span>
      <h3 class="persona-title">Advocate / Support Person</h3>
      <p class="persona-desc">
        You help others navigate the system - paralegal, case worker, family member, or friend.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>Client management tools</li>
          <li>Advocacy resources</li>
          <li>Legal research database</li>
          <li>Template libraries</li>
          <li>Training materials</li>
        </ul>
      </div>
    </div>

    <!-- Legal Professional -->
    <div class="persona-card" data-persona="legal" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">⚖️</span>
      <h3 class="persona-title">Legal Professional</h3>
      <p class="persona-desc">
        You're a lawyer, paralegal, or legal clinic representative.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>134,000+ tribunal decisions</li>
          <li>Legal research tools</li>
          <li>Partnership opportunities</li>
          <li>Referral information</li>
          <li>Data analytics</li>
        </ul>
      </div>
    </div>

    <!-- Healthcare Provider -->
    <div class="persona-card" data-persona="healthcare" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">🩺</span>
      <h3 class="persona-title">Healthcare Provider</h3>
      <p class="persona-desc">
        You're a doctor, therapist, or medical professional supporting patients.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>Medical reporting guides</li>
          <li>Documentation standards</li>
          <li>Wellness resources</li>
          <li>Patient advocacy info</li>
          <li>Professional partnerships</li>
        </ul>
      </div>
    </div>

    <!-- Organization / Institution -->
    <div class="persona-card" data-persona="organization" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">🏢</span>
      <h3 class="persona-title">Organization / Institution</h3>
      <p class="persona-desc">
        You represent a union, community group, legal clinic, or advocacy organization.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>Partnership opportunities</li>
          <li>Bulk user management</li>
          <li>Campaign tools</li>
          <li>Data dashboards</li>
          <li>Integration options</li>
        </ul>
      </div>
    </div>

    <!-- Just Exploring -->
    <div class="persona-card" data-persona="explorer" role="button" tabindex="0">
      <span class="persona-icon" aria-hidden="true">👀</span>
      <h3 class="persona-title">Just Exploring</h3>
      <p class="persona-desc">
        You're curious about 3mpwrApp or exploring options for yourself or someone else.
      </p>
      <div class="persona-features">
        <h4>You'll see first:</h4>
        <ul>
          <li>Platform overview</li>
          <li>App tour</li>
          <li>Feature highlights</li>
          <li>Success stories</li>
          <li>Getting started guide</li>
        </ul>
      </div>
    </div>
  </div>

  <div style="text-align: center;">
    <a href="#" class="btn-continue" id="btn-continue" style="display: none;">
      Continue with Personalized Experience
    </a>
    <a href="/" class="skip-link">Skip personalization (show everything)</a>
  </div>
</div>

<script>
(function() {
  const personaCards = document.querySelectorAll('.persona-card');
  const btnContinue = document.getElementById('btn-continue');
  let selectedPersona = null;

  // Handle card selection
  personaCards.forEach(card => {
    card.addEventListener('click', function() {
      // Deselect all cards
      personaCards.forEach(c => c.classList.remove('selected'));
      
      // Select this card
      this.classList.add('selected');
      selectedPersona = this.getAttribute('data-persona');
      
      // Show continue button
      btnContinue.style.display = 'inline-block';
      btnContinue.href = `/?persona=${selectedPersona}`;
    });

    // Keyboard accessibility
    card.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Save persona to localStorage on continue
  btnContinue.addEventListener('click', function(e) {
    if (selectedPersona) {
      localStorage.setItem('3mpwrapp_persona', selectedPersona);
      localStorage.setItem('3mpwrapp_persona_timestamp', Date.now());
    }
  });

  // Check if persona already saved
  const savedPersona = localStorage.getItem('3mpwrapp_persona');
  if (savedPersona) {
    const card = document.querySelector(`[data-persona="${savedPersona}"]`);
    if (card) {
      card.classList.add('selected');
      btnContinue.style.display = 'inline-block';
      btnContinue.href = `/?persona=${savedPersona}`;
      selectedPersona = savedPersona;
    }
  }
})();
</script>
