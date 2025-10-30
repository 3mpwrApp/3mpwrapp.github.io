---
layout: default
title: Contactez-nous
description: Contactez l'équipe 3mpwrApp pour des questions, des commentaires ou des opportunités de collaboration.
lang: fr
permalink: /fr/contact
---


{%- include status-banner.html -%}

# Contactez-nous

Nous serions ravis d'avoir de vos nouvelles ! Que vous ayez des questions sur 3mpwrApp, des commentaires à partager ou des opportunités de collaboration, n'hésitez pas à nous contacter.

## Liens rapides

- **Courriel :** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- **Documentation :** [Lire notre guide d'utilisation](/fr/user-guide)
- **Signaler un bogue :** [GitHub Issues](https://github.com/3mpowrApp/3mpwrapp.github.io/issues)

## Formulaire de contact

Veuillez remplir le formulaire ci-dessous et nous vous répondrons dans les 24 heures :

<form action="https://docs.google.com/forms/d/e/1FAIpQLScY599ZYJtpRakd421ADGZumejk2WjmbVvpUknw2uHAzTNx9A/formResponse" method="POST" target="_blank" class="contact-form">
  <fieldset>
    <legend>Envoyez-nous un message</legend>
    
    <div class="form-group">
      <label for="name">Votre nom *</label>
      <input 
        id="name" 
        name="entry.123456789" 
        type="text" 
        required
        aria-describedby="name-help">
      <small id="name-help">Entrez votre nom complet</small>
    </div>

    <div class="form-group">
      <label for="email">Adresse courriel *</label>
      <input 
        id="email" 
        name="emailAddress" 
        type="email" 
        required
        aria-describedby="email-help">
      <small id="email-help">Nous l'utiliserons uniquement pour répondre à votre message</small>
    </div>

    <div class="form-group">
      <label for="subject">Sujet *</label>
      <select id="subject" name="entry.987654321" required aria-describedby="subject-help">
        <option value="">-- Sélectionnez un sujet --</option>
        <option value="general">Demande générale</option>
        <option value="bug">Signaler un bogue</option>
        <option value="feature">Demande de fonctionnalité</option>
        <option value="feedback">Commentaires</option>
        <option value="partnership">Partenariat</option>
        <option value="other">Autre</option>
      </select>
      <small id="subject-help">Choisissez le sujet qui décrit le mieux votre message</small>
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea 
        id="message" 
        name="entry.111222333" 
        rows="6" 
        required
        placeholder="Veuillez nous dire ce que vous avez en tête..."
        aria-describedby="message-help">
      </textarea>
      <small id="message-help">Soyez aussi détaillé que possible pour nous aider à mieux vous assister</small>
    </div>

    <button type="submit" class="btn btn-primary">Envoyer le message</button>
  </fieldset>
</form>

<style>
  .contact-form {
    max-width: 600px;
    margin: 2rem 0;
  }

  .form-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary, #333);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    min-height: 44px;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: 3px solid #0066CC;
    outline-offset: 2px;
    border-color: #0066CC;
    background-color: var(--input-bg-focus, #f0f7ff);
  }

  .form-group textarea {
    min-height: 150px;
    resize: vertical;
  }

  .form-group small {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
  }

  .btn {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-height: 44px;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: #0066CC;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0052a3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }

  .btn-primary:focus {
    outline: 3px solid #0066CC;
    outline-offset: 2px;
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: dark) {
    .form-group input,
    .form-group select,
    .form-group textarea {
      background-color: var(--input-bg-dark, #2d2d2d);
      color: var(--text-dark, #e0e0e0);
      border-color: var(--border-dark, #444);
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      background-color: var(--input-bg-focus-dark, #1a2a3a);
      border-color: #4DB8FF;
      outline-color: #4DB8FF;
    }

    .form-group small {
      color: var(--text-secondary-dark, #aaa);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn,
    .form-group input,
    .form-group select,
    .form-group textarea {
      transition: none;
    }
  }

  @media (max-width: 600px) {
    .contact-form {
      margin: 1rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .btn {
      width: 100%;
    }
  }
</style>

## Autres moyens de nous joindre

### Médias sociaux
- **Facebook :** [@3mpowrapp](https://www.facebook.com/3mpowrapp/)
- **X (Twitter) :** [@3mpowrapp0816](https://x.com/3mpowrapp0816)
- **Instagram :** [@3mpwrapp](https://www.instagram.com/3mpwrapp/)
- **Mastodon :** [@3mpwrApp](https://mastodon.social/@3mpwrApp)
- **Bluesky :** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)

### Accessibilité
Si vous rencontrez des problèmes d'accessibilité pour visualiser ou utiliser ce formulaire, veuillez nous envoyer un courriel directement à [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) et nous vous aiderons rapidement.

### Délai de réponse
Nous nous efforçons de répondre à toutes les demandes dans les 24 heures pendant les jours ouvrables (du lundi au vendredi, de 9h à 17h UTC).

---

**Note :** Ce formulaire nécessite JavaScript pour fonctionner. Si vous rencontrez des problèmes, vous pouvez nous envoyer un courriel directement à [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com).

{%- include page-feedback.html -%}
