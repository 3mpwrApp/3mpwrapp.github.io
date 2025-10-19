---
layout: default
title: Inscription au programme bêta
description: Inscrivez-vous pour devenir testeur bêta et aider à améliorer l'application 3mpwrApp.
lang: fr
permalink: /fr/beta/
---

# Devenez testeur bêta 3mpwrApp !

Aidez-nous à façonner l'avenir de l'application 3mpwrApp en rejoignant notre programme de testeurs bêta.  
**Les tests bêta nécessitent des personnes engagées qui peuvent tester l'application complète et fournir des commentaires détaillés, y compris signaler tout bogue.**

## Formulaire d'inscription

<form action="https://docs.google.com/forms/d/e/1FAIpQLScY599ZYJtpRakd421ADGZumejk2WjmbVvpUknw2uHAzTNx9A/formResponse" method="POST" target="_blank">
  <div>
    <label for="beta-name">Nom</label><br>
    <input id="beta-name" type="text" name="entry.2048050345" autocomplete="name" required>
  </div>
  <br>

  <div>
    <label for="beta-email">Courriel</label><br>
    <input id="beta-email" type="email" name="entry.2128873790" autocomplete="email" inputmode="email" required>
  </div>
  <br>

  <fieldset aria-describedby="devices-hint">
    <legend>Sur quel(s) appareil(s) effectuerez-vous les tests ? <span aria-hidden="true">*</span></legend>
    <p id="devices-hint" class="sr-only">Sélectionnez tout ce qui s'applique. Choisissez Autre pour spécifier un autre appareil.</p>

    <label><input type="checkbox" name="entry.470559077" value="Android" required> Téléphone Android</label><br>
    <label><input type="checkbox" name="entry.470559077" value="iPhone/iOS"> iPhone/iOS</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Tablet"> Tablette</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Windows PC"> PC Windows</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Mac"> Mac</label><br>

    <label>
      <input type="checkbox" id="device-other" name="entry.470559077" value="Other">
      Autre
    </label>
    <label for="device-other-text" class="sr-only">Veuillez préciser votre appareil</label>
    <input
      type="text"
      id="device-other-text"
      name="entry.470559077.other_option_response"
      placeholder="Veuillez préciser"
      disabled
      aria-disabled="true"
    >
  </fieldset>
  <br>

  <div>
    <label for="beta-reason">Pourquoi aimeriez-vous être testeur bêta ?</label><br>
    <textarea id="beta-reason" name="entry.1434274983" rows="5"></textarea>
  </div>
  <br>

  <div>
    <label for="beta-willing">Êtes-vous prêt(e) à tester toutes les fonctionnalités et à signaler les bogues/commentaires ?</label><br>
    <select id="beta-willing" name="entry.617838265" required>
      <option value="">Veuillez sélectionner</option>
      <option value="Yes">Oui, je suis engagé(e) à tester et à fournir des commentaires.</option>
      <option value="No">Non, je ne pourrai peut-être pas tout tester.</option>
    </select>
  </div>
  <br>

  <button type="submit">S'inscrire</button>
</form>

<script>
  (function () {
    const otherCb = document.getElementById('device-other');
    const otherText = document.getElementById('device-other-text');
    if (otherCb && otherText) {
      const sync = () => {
        const on = otherCb.checked;
        otherText.disabled = !on;
        otherText.setAttribute('aria-disabled', String(!on));
        if (!on) otherText.value = '';
      };
      otherCb.addEventListener('change', sync);
      sync();
    }
  })();
</script>

*Nous contacterons les testeurs sélectionnés par courriel. Merci de votre intérêt !*

---

## Ce que vous ferez en tant que testeur bêta

En tant que testeur bêta 3mpwrApp, vous aurez accès en avant-première aux nouvelles fonctionnalités et aiderez à :

### 1. Tester les fonctionnalités
- Essayer toutes les nouvelles fonctionnalités avant leur lancement public
- Vérifier que les fonctionnalités fonctionnent comme prévu
- Tester sur différents appareils et scénarios

### 2. Signaler les bogues
- Identifier et documenter les problèmes techniques
- Fournir des captures d'écran et des étapes de reproduction
- Aider à prioriser les corrections critiques

### 3. Fournir des commentaires
- Partager votre expérience utilisateur
- Suggérer des améliorations
- Commenter l'interface et l'utilisabilité

### 4. Participer activement
- Répondre aux sondages et questionnaires
- Rejoindre les discussions communautaires (optionnel)
- Assister aux sessions de feedback (optionnel)

## Avantages pour les testeurs bêta

### Accès anticipé
- ⭐ Soyez le premier à essayer les nouvelles fonctionnalités
- 🎯 Influencez le développement du produit
- 🚀 Aidez à façonner l'avenir de 3mpwrApp

### Reconnaissance
- 🏆 Crédits de testeur bêta dans l'application (optionnel)
- 📧 Invitation à des événements exclusifs
- 🎁 Surprises occasionnelles pour les contributeurs actifs

### Communauté
- 🤝 Rejoignez un groupe de testeurs dévoués
- 💬 Accès à un canal de communication dédié
- 🌟 Contribuez à une cause significative

## Engagement requis

### Temps
- **Minimum** : 2-3 heures par semaine
- **Tests ponctuels** : Lorsque de nouvelles fonctionnalités sont publiées
- **Flexibilité** : Testez à votre rythme, dans votre emploi du temps

### Responsabilités
- ✅ Tester les fonctionnalités assignées
- ✅ Signaler les problèmes rapidement
- ✅ Rester confidentiel sur les fonctionnalités non publiques
- ✅ Être constructif et respectueux

### Confidentialité
- 🔒 Ne pas partager de captures d'écran publiquement sans permission
- 🔒 Ne pas divulguer de fonctionnalités non annoncées
- 🔒 Signaler les vulnérabilités de sécurité en privé

## Processus de sélection

1. **Inscription** : Remplissez le formulaire ci-dessus
2. **Examen** : Nous examinerons votre candidature (1-2 semaines)
3. **Sélection** : Les testeurs sélectionnés recevront une invitation par courriel
4. **Intégration** : Instructions d'installation et d'utilisation de la version bêta
5. **Test** : Commencez à tester et à fournir des commentaires !

## Questions fréquentes

### Combien de testeurs bêta acceptez-vous ?
Nous acceptons un nombre limité de testeurs pour assurer une communication de qualité. Nous priorisons la diversité des appareils et des cas d'utilisation.

### Dois-je avoir des compétences techniques ?
Non ! Nous recherchons des testeurs de tous niveaux. Votre perspective d'utilisateur ordinaire est précieuse.

### Puis-je arrêter à tout moment ?
Oui, absolument. Aucun engagement à long terme requis. Prévenez-nous simplement si vous souhaitez arrêter.

### Mes données sont-elles en sécurité ?
Oui. Les données de test peuvent être supprimées à tout moment. Nous suivons notre [Politique de confidentialité](/fr/privacy/) strictement.

### Puis-je partager la version bêta avec d'autres ?
Non. L'accès bêta est personnel et confidentiel. Ne partagez pas les liens d'installation.

### Y a-t-il une compensation ?
Les tests bêta sont volontaires. Nous offrons de la reconnaissance et des surprises occasionnelles, mais pas de compensation monétaire.

## Prêt(e) à contribuer ?

Remplissez le formulaire ci-dessus et rejoignez notre équipe de testeurs bêta dévoués !

Pour toute question :
- **Courriel** : [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- **Sujet** : "Question programme bêta"

Merci de nous aider à créer une meilleure application pour tous ! 💚
