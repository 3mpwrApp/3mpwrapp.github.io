---
layout: default
title: "Quoi de neuf - Chaque mise à jour, chaque commit"
lang: fr
description: "Transparence totale - voyez chaque fonctionnalité, correctif et amélioration de 3mpwrApp. Suivez toutes les mises à jour, commits et changements alors que nous construisons en public."
image: /assets/empwrapp-logo.png
image_alt: "3mpwrApp Quoi de neuf - Journal complet des changements avec transparence totale"
permalink: /fr/whats-new/
published: true
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/whats-new.css' | relative_url }}">

{%- include sticky-transparency-banner.html -%}

<div class="gradient-banner">
  <h1 style="margin: 0 0 0.5rem;">📜 Quoi de neuf - Historique complet</h1>
  <p style="margin: 0;">Chaque fonctionnalité, correctif et amélioration de 3mpwrApp. Nous construisons en public - voyez chaque commit depuis le premier jour!</p>
</div>

📖 **3 minutes de lecture** | 🔋🔋 **Énergie : Légère**

<!-- Stats Cards -->
<div id="stats-cards" class="stats-grid" style="display: none;">
  <div class="stat-card">
    <div class="stat-number" id="total-entries">0</div>
    <div class="stat-label">Mises à jour totales</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-features">0</div>
    <div class="stat-label">✨ Fonctionnalités</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-fixes">0</div>
    <div class="stat-label">🐛 Correctifs</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-improvements">0</div>
    <div class="stat-label">⚡ Améliorations</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" id="total-docs">0</div>
    <div class="stat-label">📚 Documentation</div>
  </div>
</div>

<!-- Search and Filter Controls -->
<div class="controls-container">
  <input type="search" id="search-whatsnew" placeholder="🔍 Rechercher des mises à jour..." aria-label="Rechercher des mises à jour">
  <div class="filter-buttons" role="group" aria-label="Filtrer par catégorie">
    <button class="filter-btn active" data-category="all">Tout</button>
    <button class="filter-btn" data-category="feature">✨ Fonctionnalités</button>
    <button class="filter-btn" data-category="fix">🐛 Correctifs</button>
    <button class="filter-btn" data-category="improvement">⚡ Améliorations</button>
    <button class="filter-btn" data-category="docs">📚 Documentation</button>
  </div>
</div>

<div id="loading-message" style="text-align: center; padding: 2rem; color: #666;">
  Chargement des mises à jour...
</div>

<div id="error-message" style="display: none; text-align: center; padding: 2rem; color: #d32f2f;">
  Impossible de charger les mises à jour. Veuillez réessayer plus tard.
</div>

---

## 🎯 Mises à jour récentes majeures

<details class="tldr-box" open>
  <summary>⚡ Faits saillants récents (1 minute)</summary>
  <div class="tldr-content">
    <div class="tldr-item">
      <span class="tldr-icon">🌍</span>
      <div>
        <strong>Traductions françaises complétées — Phase 3 : 100 %</strong>
        <p style="margin: 0; font-size: 0.95rem;">Toutes les pages Tier 1 maintenant disponibles en français canadien avec adaptations culturelles</p>
      </div>
    </div>
    <div class="tldr-item">
      <span class="tldr-icon">🎉</span>
      <div>
        <strong>Première démo réussie — Décembre 2025</strong>
        <p style="margin: 0; font-size: 0.95rem;">Présenté au Groupe de soutien des travailleurs blessés de Thunder Bay — 721 tests réussis</p>
      </div>
    </div>
    <div class="tldr-item">
      <span class="tldr-icon">🇺🇸</span>
      <div>
        <strong>USA Lite lancé</strong>
        <p style="margin: 0; font-size: 0.95rem;">Fonctionnalités de base maintenant disponibles pour les sympathisants américains</p>
      </div>
    </div>
    <div class="tldr-item">
      <span class="tldr-icon">♿</span>
      <div>
        <strong>Conformité WCAG 2.2 AAA</strong>
        <p style="margin: 0; font-size: 0.95rem;">Accessibilité complète avec mode de complexité, contraste élevé, polices dyslexie</p>
      </div>
    </div>
    <div class="tldr-item">
      <span class="tldr-icon">🔒</span>
      <div>
        <strong>Chiffrement AES-256</strong>
        <p style="margin: 0; font-size: 0.95rem;">Coffre à preuves avec chiffrement de grade militaire — vos données restent privées</p>
      </div>
    </div>
  </div>
</details>

---

## 📚 Parcourir les mises à jour et articles

<span class="energy-cost" data-energy="2" aria-label="Coût énergétique : léger">🔋🔋 Énergie : Légère</span>

<div class="features-grid">
  <div class="feature-box">
    <h3>📰 Blog et actualités</h3>
    <p>Parcourez les annonces de fonctionnalités et les nouvelles de développement.</p>
    <p><a href="/blog/" class="btn btn-secondary">Voir les archives →</a></p>
  </div>
  
  <div class="feature-box">
    <h3>🚀 Publications GitHub</h3>
    <p>Consultez l'historique des versions et les journaux techniques.</p>
    <p><a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Voir sur GitHub →</a></p>
  </div>
  
  <div class="feature-box">
    <h3>📖 Guide d'utilisation</h3>
    <p>Retrouvez la documentation complète de toutes les fonctionnalités.</p>
    <p><a href="/fr/user-guide/" class="btn btn-secondary">Lire le guide →</a></p>
  </div>
</div>

---

## 🌟 Journal des changements complet

### Mai 2026 : Traductions françaises complétées

<div class="update-card feature">
  <div class="update-header">
    <h4>✨ Phase 3 : Traductions françaises 100 % complètes</h4>
    <span class="update-date">23 mai 2026</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui a été ajouté :</strong></p>
    <ul>
      <li>✅ <strong>fr/about.md</strong> — 400 lignes, mission complète, histoire, valeurs et équipe</li>
      <li>✅ <strong>fr/features.md</strong> — 400 lignes, toutes les 74 fonctionnalités expliquées en détail</li>
      <li>✅ <strong>fr/contact.md</strong> — 250 lignes, tous les canaux de contact et heures de bureau</li>
      <li>✅ <strong>fr/whats-new.md</strong> — 250 lignes, journal complet des changements et mises à jour</li>
    </ul>
    <p><strong>Adaptations canadiennes-françaises :</strong></p>
    <ul>
      <li>🇨🇦 Références aux systèmes canadiens : CSPAAT, CNESST, WCB, POSPH, AISH</li>
      <li>🗣️ Terminologie française canadienne (pas européenne)</li>
      <li>♿ Langage inclusif : « personnes en situation de handicap »</li>
      <li>🏥 Contexte des soins de santé et de l'indemnisation des travailleurs canadiens</li>
    </ul>
    <p><strong>Impact :</strong> Phase 3 maintenant 100 % complète — toutes les pages Tier 1 disponibles en français et en anglais.</p>
  </div>
</div>

### Décembre 2025 : Jalon de la première démo

<div class="update-card feature">
  <div class="update-header">
    <h4>🎤 Première présentation de démonstration réussie</h4>
    <span class="update-date">9 décembre 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui s'est passé :</strong></p>
    <p>Présentation de 3mpwr App au <strong>Groupe de soutien des travailleurs blessés de Thunder Bay et du district</strong>. La réponse a été incroyable!</p>
    <p><strong>Statut de production :</strong></p>
    <ul>
      <li>✅ 721 tests réussis</li>
      <li>✅ 100 % prêt pour la production</li>
      <li>✅ Commentaires positifs de la communauté</li>
      <li>✅ Intérêt des auditeurs américains → Lancement USA Lite</li>
    </ul>
    <p><strong>Nouvelle fonctionnalité : USA Lite</strong></p>
    <p>Suite à l'intérêt américain, nous avons lancé USA Lite avec :</p>
    <ul>
      <li>✅ Outils de bien-être complets</li>
      <li>✅ Accès communautaire</li>
      <li>✅ Coffre à preuves (chiffrement AES-256)</li>
      <li>✅ Ressources de crise américaines (988, Crisis Text Line)</li>
      <li>✅ Conformité WCAG AAA complète</li>
    </ul>
  </div>
</div>

### Novembre 2025 : Fonctionnalités d'accessibilité

<div class="update-card improvement">
  <div class="update-header">
    <h4>⚡ Conformité WCAG 2.2 AAA atteinte</h4>
    <span class="update-date">Novembre 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Fonctionnalités d'accessibilité ajoutées :</strong></p>
    <ul>
      <li>✅ <strong>Mode de complexité</strong> — Simple (5 outils), Standard (20 outils), Utilisateur avancé (74 fonctionnalités)</li>
      <li>✅ <strong>Mode à contraste élevé</strong> — Pour basse vision et fatigue oculaire</li>
      <li>✅ <strong>Police adaptée à la dyslexie</strong> — OpenDyslexic pour meilleure lisibilité</li>
      <li>✅ <strong>Support de lecteur d'écran</strong> — Navigation complète au clavier</li>
      <li>✅ <strong>Mise à l'échelle du texte</strong> — Ajuster la taille de la police</li>
      <li>✅ <strong>Mode sombre</strong> — Réduire la fatigue oculaire</li>
      <li>✅ <strong>Cibles tactiles 48px+</strong> — Accessibilité mobile</li>
    </ul>
    <p><strong>Impact :</strong> 3mpwrApp fonctionne maintenant pour TOUTES les personnes en situation de handicap, conditions et capacités.</p>
  </div>
</div>

### Octobre 2025 : Coffre à preuves et chiffrement

<div class="update-card feature">
  <div class="update-header">
    <h4>🔒 Coffre à preuves avec chiffrement AES-256</h4>
    <span class="update-date">Octobre 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui a été ajouté :</strong></p>
    <ul>
      <li>✅ Stockage de documents sécurisé avec chiffrement de grade militaire</li>
      <li>✅ Centre de commande des preuves pour organisation</li>
      <li>✅ Chronologie, étiquettes et vues analytiques</li>
      <li>✅ Téléchargement de photos/PDF depuis appareil photo, bibliothèque ou fichiers</li>
      <li>✅ Recherche et filtrage des preuves</li>
    </ul>
    <p><strong>Sécurité :</strong></p>
    <ul>
      <li>🔐 Chiffrement AES-256-GCM (le même que les banques utilisent)</li>
      <li>📱 Les données restent sur votre appareil (local d'abord)</li>
      <li>☁️ Synchronisation cloud facultative (VOTRE fournisseur)</li>
      <li>🚫 Nous ne pouvons JAMAIS voir vos données</li>
    </ul>
  </div>
</div>

### Septembre 2025 : Assistant de lettres et outils juridiques

<div class="update-card feature">
  <div class="update-header">
    <h4>📝 Assistant de lettres et outils de défense juridique</h4>
    <span class="update-date">Septembre 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui a été ajouté :</strong></p>
    <ul>
      <li>✅ <strong>Assistant de lettres</strong> — Rédaction de lettres assistée par IA (appels, accommodements, plaintes)</li>
      <li>✅ <strong>Analyser la réclamation</strong> — Décoder les lettres de décision en langage simple</li>
      <li>✅ <strong>Suivi des échéances</strong> — Ne manquez jamais une date de dépôt</li>
      <li>✅ <strong>Coach d'appel</strong> — Conseils personnalisés sur la stratégie d'appel</li>
      <li>✅ <strong>Chercheur de précédents</strong> — Recherchez 1000+ décisions de tribunaux</li>
      <li>✅ <strong>Base de connaissances</strong> — Droits et lois expliqués en français simple</li>
    </ul>
    <p><strong>Impact :</strong> Les outils juridiques simplifient les processus complexes et donnent aux utilisateurs les moyens d'agir.</p>
  </div>
</div>

### Août 2025 : Centre de bien-être et outils de santé

<div class="update-card feature">
  <div class="update-header">
    <h4>🏥 Centre de bien-être : 41+ outils de santé</h4>
    <span class="update-date">Août 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui a été ajouté :</strong></p>
    <ul>
      <li>✅ <strong>Partenaire de rythme</strong> — Planification d'activités intelligente en énergie pour l'EM/SFC, fibromyalgie</li>
      <li>✅ <strong>Suivi des symptômes</strong> — Enregistrer les symptômes au fil du temps</li>
      <li>✅ <strong>Gestion de la douleur</strong> — Échelles, déclencheurs, soulagement</li>
      <li>✅ <strong>Suivi du sommeil</strong> — Qualité et modèles de sommeil</li>
      <li>✅ <strong>Journal d'humeur</strong> — Suivi de santé mentale</li>
      <li>✅ <strong>Suivi des médicaments</strong> — Quand vous avez pris quoi</li>
      <li>✅ <strong>Ressources de crise</strong> — Lignes d'aide 24/7 (988, Jeunesse, J'écoute, 211)</li>
    </ul>
    <p><strong>Impact :</strong> Les outils de bien-être aident les utilisateurs à gérer leur santé tout en faisant du travail de défense.</p>
  </div>
</div>

### Juillet 2025 : Fonctionnalités communautaires

<div class="update-card feature">
  <div class="update-header">
    <h4>🤝 Communauté et connexion</h4>
    <span class="update-date">Juillet 2025</span>
  </div>
  <div class="update-body">
    <p><strong>Ce qui a été ajouté :</strong></p>
    <ul>
      <li>✅ <strong>Groupes de soutien</strong> — 24+ groupes organisés par handicap, condition, intersection</li>
      <li>✅ <strong>Campagnes</strong> — Action collective pour le changement systémique</li>
      <li>✅ <strong>Messages privés</strong> — Soutien individuel</li>
      <li>✅ <strong>Formats de réunion</strong> — Audio, texte, vidéo pour tous les niveaux d'énergie</li>
    </ul>
    <p><strong>Groupes incluent :</strong></p>
    <ul>
      <li>Collectif fibromyalgie et EM/SFC</li>
      <li>Cercle de justice pour le handicap PANDC</li>
      <li>Alliance 2ELGBTQ+ et handicap</li>
      <li>Auto-défense neurodivergente</li>
      <li>Alliance des travailleurs blessés</li>
      <li>Et beaucoup plus...</li>
    </ul>
  </div>
</div>

---

## 💬 Rester connecté

<span class="energy-cost" data-energy="1" aria-label="Coût énergétique : minimal">🔋 Énergie : Minimale</span>

<div class="features-grid">
  <div class="feature-box">
    <h3>📧 Infolettre</h3>
    <p>Recevez les nouveautés et améliorations dès leur publication.</p>
    <p><a href="/fr/newsletter/" class="btn btn-primary">S'abonner →</a></p>
  </div>
  
  <div class="feature-box">
    <h3>📱 Réseaux sociaux</h3>
    <p>Suivez les mises à jour rapides, astuces et temps forts de la communauté.</p>
    <p><a href="/fr/connect/" class="btn btn-secondary">Nous suivre →</a></p>
  </div>
  
  <div class="feature-box">
    <h3>💬 Discord</h3>
    <p>Rejoignez notre communauté pour un soutien en direct et des tests bêta.</p>
    <p><a href="https://discord.gg/P2qQyjxV" class="btn btn-secondary">Rejoindre Discord →</a></p>
  </div>
</div>

---

## 💡 Proposer une fonctionnalité {#suggest-feature}

<span class="energy-cost" data-energy="2" aria-label="Coût énergétique : léger">🔋🔋 Énergie : Légère</span>

<div class="gradient-banner-pink">
  <h3 style="margin: 0 0 1rem;">Vous avez une idée?</h3>
  <p style="margin: 0 0 1rem;">Votre retour nous aide à orienter les prochaines améliorations de 3mpwrApp.</p>
  <a href="/fr/contact/?subject=Demande%20de%20fonctionnalit%C3%A9" class="cta-button" style="display: inline-block; background: var(--card-bg, #ffffff); color: #5568d3; padding: 0.75rem 2rem; border-radius: 4px; font-weight: bold; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">💡 Envoyer une idée →</a>
</div>

---

## 🔮 Ce qui arrive

<div class="roadmap-section">
  <h3>Feuille de route 2026-2028</h3>
  
  <div class="roadmap-item">
    <h4>📱 Application mobile (2026 T2)</h4>
    <p>Applications iOS et Android natives avec toutes les fonctionnalités</p>
  </div>
  
  <div class="roadmap-item">
    <h4>🌍 Expansion mondiale (2026-2028)</h4>
    <p>Servir 100+ pays et connecter les mouvements pour les droits des personnes handicapées à l'international</p>
  </div>
  
  <div class="roadmap-item">
    <h4>🤖 IA avancée (2026 T3)</h4>
    <p>Meilleure analyse de décisions, suggestions de preuves, coaching d'appel</p>
  </div>
  
  <div class="roadmap-item">
    <h4>📊 Analyse de données (2026 T4)</h4>
    <p>Détection de modèles à travers les décisions de tribunaux, identification des problèmes systémiques</p>
  </div>
  
  <div class="roadmap-item">
    <h4>🎯 Plus de langues (2027)</h4>
    <p>Espagnol, mandarin, punjabi, tagalog et plus</p>
  </div>
  
  <p><a href="/fr/roadmap/" class="btn btn-primary">Voir la feuille de route complète →</a></p>
</div>

---

## 📜 Principes de transparence

<div class="transparency-box">
  <h3>Pourquoi nous construisons en public</h3>
  <ul>
    <li>✅ <strong>Responsabilisation</strong> — Vous voyez exactement ce sur quoi nous travaillons</li>
    <li>✅ <strong>Confiance</strong> — Aucun secret, aucune surprise</li>
    <li>✅ <strong>Commentaires communautaires</strong> — Vous aidez à façonner le développement</li>
    <li>✅ <strong>Apprentissage</strong> — Autres développeurs peuvent apprendre de notre travail</li>
    <li>✅ <strong>Open-source</strong> — Tout le code est public sur GitHub</li>
  </ul>
  <p><strong>Chaque commit, chaque mise à jour, chaque décision — public et traçable.</strong></p>
  <p><a href="https://github.com/3mpowrApp/3mpwrapp.github.io" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Voir notre code sur GitHub →</a></p>
</div>

---

{%- include page-feedback.html -%}

<script src="{{ '/assets/js/page-enhancements.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/whats-new.js' | relative_url }}" defer></script>

<style>
.gradient-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.gradient-banner-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--card-bg, #f5f5f5);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.update-card {
  background: var(--card-bg, #ffffff);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.update-card.feature {
  border-left-color: #667eea;
}

.update-card.improvement {
  border-left-color: #10b981;
}

.update-card.fix {
  border-left-color: #ef4444;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.update-date {
  font-size: 0.875rem;
  color: #666;
  white-space: nowrap;
}

.update-body {
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-box {
  background: var(--card-bg, #ffffff);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.roadmap-section {
  background: var(--card-bg, #f9fafb);
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.roadmap-item {
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.roadmap-item:last-child {
  border-bottom: none;
}

.transparency-box {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.transparency-box ul {
  margin: 1rem 0;
}

.transparency-box a {
  color: white;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--card-bg, #f3f4f6);
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}
</style>
