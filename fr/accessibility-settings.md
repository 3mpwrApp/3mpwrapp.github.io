---
layout: default
title: Paramètres d'accessibilité
description: Personnalisez votre expérience de navigation avec les options d'accessibilité incluant la taille du texte, le contraste, le mode sombre et les préférences de lecture.
permalink: /fr/accessibility-settings/
lang: fr
version: 1.1 (Synchronisation docs principales)
lastUpdated: 2026-02-24
---


{%- include status-banner.html -%}

# Paramètres d'accessibilité

**Dernière mise à jour :** 24 février 2026  
**Statut docs :** Paramètres d’accessibilité FR alignés avec la baseline documentaire février 2026.

Utilisez ces contrôles pour personnaliser votre expérience de visualisation. Vos préférences sont enregistrées dans votre navigateur sur cet appareil.

## Options d'affichage

- Mode contraste élevé : utilisez le bouton "High contrast" dans l'en-tête du site. Cela augmente le contraste des couleurs et la visibilité du focus.
- Mode sombre : utilisez le bouton "Dark mode" dans l'en-tête du site. Cela passe à un jeu de couleurs sombres.

### Affinez vos préférences de lecture

<form data-a11y-form aria-labelledby="a11y-form-title">
	<h2 id="a11y-form-title">Préférences de lecture</h2>
	<div>
		<label for="font-scale">Taille du texte</label><br>
		<input id="font-scale" name="font-scale" type="range" min="90" max="150" step="5" value="100" aria-describedby="font-scale-hint">
		<p id="font-scale-hint">Ajuste la taille globale du texte sur le site.</p>
	</div>
	<div>
		<label for="line-height">Espacement des lignes</label><br>
		<select id="line-height" name="line-height">
			<option value="normal">Normal</option>
			<option value="loose">Large</option>
		</select>
	</div>
	<div>
		<label for="letter-spacing">Espacement des lettres</label><br>
		<select id="letter-spacing" name="letter-spacing">
			<option value="normal">Normal</option>
			<option value="wide">Large</option>
		</select>
	</div>
	<div>
		<label for="underline-links">Souligner les liens</label><br>
		<select id="underline-links" name="underline-links">
			<option value="auto">Auto</option>
			<option value="always">Toujours souligner</option>
		</select>
	</div>
	<div>
		<label for="readable-font">Famille de police</label><br>
		<select id="readable-font" name="readable-font">
			<option value="default">Par défaut</option>
			<option value="readable">Sans-serif lisible</option>
			<option value="dyslexia">Adapté à la dyslexie</option>
		</select>
	</div>
	<div>
		<label for="reduce-motion">Mouvement</label><br>
		<select id="reduce-motion" name="reduce-motion">
			<option value="auto">Suivre le paramètre système</option>
			<option value="on">Réduire le mouvement</option>
		</select>
	</div>
	<div>
		<label for="color-filter">Filtre de couleur</label><br>
		<select id="color-filter" name="color-filter">
			<option value="none">Aucun</option>
			<option value="grayscale">Niveaux de gris</option>
			<option value="hue">Décalage de teinte</option>
		</select>
	</div>
	<div>
		<label for="focus-ring">Anneau de focus</label><br>
		<select id="focus-ring" name="focus-ring">
			<option value="default">Par défaut</option>
			<option value="thick">Épais</option>
			<option value="color">Couleur haute visibilité</option>
		</select>
	</div>
	<p>
		<button type="button" data-reset class="button">Réinitialiser aux valeurs par défaut</button>
	</p>
</form>

## Mouvement

Ce site respecte la préférence "Réduire le mouvement" de votre système et évite automatiquement les animations inutiles. Si vous avez besoin d'ajustements supplémentaires, faites-le nous savoir.

## Navigation au clavier

- Utilisez les liens "Skip to content" et "Skip to footer" en haut de la page.
- Appuyez sur "Tab" pour vous déplacer entre les liens et les contrôles ; "Maj + Tab" recule.
- La fenêtre modale de l'infolettre peut être fermée avec la touche "Échap", en cliquant à l'extérieur de la boîte de dialogue ou en utilisant les boutons "Fermer"/"Pas maintenant". Le focus est maintenu dans la boîte de dialogue tant qu'elle est ouverte.

## Réinitialiser les préférences

Si vous souhaitez réinitialiser vos préférences enregistrées, utilisez le bouton "Réinitialiser aux valeurs par défaut" ci-dessus ou effacez les données du site de votre navigateur pour ce domaine.

## Commentaires

Si un paramètre ne fonctionne pas comme prévu, contactez-nous à [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) avec les informations de votre navigateur et de votre appareil.

<script src="{{ '/assets/js/settings.js' | relative_url }}" defer></script>

---

## Guide des paramètres

### Taille du texte
Augmentez ou diminuez la taille de la police de **90% à 150%** de la taille par défaut. Idéal pour les utilisateurs malvoyants ou ceux qui préfèrent un texte plus grand.

**Recommandations** :
- **90-100%** : Taille standard
- **110-120%** : Légèrement plus grand, plus confortable
- **130-150%** : Beaucoup plus grand, pour une meilleure lisibilité

### Espacement des lignes
- **Normal** : Espacement standard entre les lignes (1.5 unités)
- **Large** : Espacement accru (2.0 unités) pour réduire le fouillis visuel

**Bon pour** : Dyslexie, fatigue visuelle, difficultés de concentration

### Espacement des lettres
- **Normal** : Espacement standard entre les caractères
- **Large** : Lettres espacées pour une meilleure distinction

**Bon pour** : Dyslexie, malvoyance, apprentissage du français langue seconde

### Souligner les liens
- **Auto** : Les liens sont soulignés uniquement au survol/focus
- **Toujours souligner** : Tous les liens sont soulignés en permanence

**Bon pour** : Distinguer clairement les liens du texte ordinaire

### Famille de police
- **Par défaut** : Police système standard
- **Sans-serif lisible** : Police sans-serif claire et ouverte
- **Adapté à la dyslexie** : Police spécialement conçue avec des lettres distinctes

**Polices utilisées** :
- **Lisible** : "Verdana", "Helvetica", "Arial"
- **Dyslexie** : "OpenDyslexic", "Comic Sans MS" (repli)

### Mouvement
- **Suivre le paramètre système** : Utilise votre préférence OS
- **Réduire le mouvement** : Désactive toutes les animations et transitions

**Bon pour** : Troubles vestibulaires, sensibilité au mouvement, épilepsie photosensible

### Filtre de couleur
- **Aucun** : Couleurs normales
- **Niveaux de gris** : Convertit tout en noir et blanc
- **Décalage de teinte** : Ajuste les couleurs pour un meilleur contraste

**Bon pour** : Daltonisme, sensibilité à la lumière, préférence personnelle

### Anneau de focus
- **Par défaut** : Indicateur de focus standard du navigateur
- **Épais** : Anneau plus large et plus visible
- **Couleur haute visibilité** : Couleur contrastée brillante (cyan)

**Bon pour** : Navigation au clavier, malvoyance, contraste élevé

---

## Combinaisons suggérées

### Pour la dyslexie
- Taille du texte : **120%**
- Espacement des lignes : **Large**
- Espacement des lettres : **Large**
- Police : **Adapté à la dyslexie**

### Pour la malvoyance
- Taille du texte : **140-150%**
- Mode : **Contraste élevé** (bouton d'en-tête)
- Liens : **Toujours souligner**
- Anneau de focus : **Épais** ou **Couleur haute visibilité**

### Pour la sensibilité au mouvement
- Mouvement : **Réduire le mouvement**
- (Activer aussi dans les paramètres de votre OS pour un effet complet)

### Pour la fatigue visuelle
- Mode : **Sombre** (bouton d'en-tête)
- Espacement des lignes : **Large**
- Taille du texte : **110-120%**

### Pour la photosensibilité
- Mouvement : **Réduire le mouvement**
- Filtre : **Niveaux de gris** ou **Décalage de teinte**
- Mode : **Sombre**

---

## Persistance des paramètres

Vos préférences sont enregistrées dans le **localStorage** de votre navigateur et persistent :
- ✅ Entre les visites
- ✅ Sur toutes les pages du site
- ✅ Jusqu'à ce que vous les effaciez

**Note** : Les paramètres sont spécifiques à :
- Ce navigateur (pas synchronisés entre appareils)
- Ce domaine (pas partagés avec d'autres sites)

## Effacer les paramètres

### Option 1 : Bouton de réinitialisation
Cliquez sur "Réinitialiser aux valeurs par défaut" ci-dessus.

### Option 2 : Paramètres du navigateur
**Chrome/Edge** :
1. `chrome://settings/cookies` → "Tous les cookies et données des sites"
2. Recherchez "3mpwrapp.github.io"
3. Cliquez sur l'icône de corbeille

**Firefox** :
1. `about:preferences#privacy` → "Cookies et données de sites"
2. "Gérer les données..."
3. Recherchez "3mpwrapp.github.io" → "Supprimer sélection"

**Safari** :
1. Préférences → Confidentialité → Gérer les données de sites web
2. Recherchez "3mpwrapp.github.io" → Supprimer

### Option 3 : Mode navigation privée
En mode incognito/privé, les paramètres ne sont PAS enregistrés (ils se réinitialisent à chaque session).

---

## Compatibilité

Ces paramètres sont testés et fonctionnent sur :

| Navigateur | Version | Support |
|-----------|---------|---------|
| Chrome | 90+ | ✅ Complet |
| Firefox | 88+ | ✅ Complet |
| Safari | 14+ | ✅ Complet |
| Edge | 90+ | ✅ Complet |
| Brave | Toutes | ✅ Complet |

**Navigateurs mobiles** :
- Chrome Mobile, Safari iOS, Firefox Mobile, Samsung Internet : ✅ Tous supportés

**Anciennes versions** :
Les paramètres peuvent ne pas fonctionner sur des navigateurs très anciens (IE11, Chrome <80). Nous recommandons de mettre à jour vers la dernière version.

---

## Dépannage

### Les paramètres ne sont pas enregistrés
1. Vérifiez que les cookies/localStorage ne sont pas bloqués
2. Désactivez temporairement les extensions de blocage (uBlock, Privacy Badger)
3. Assurez-vous de ne pas être en mode navigation privée

### Les paramètres ne s'appliquent pas
1. Actualisez la page (Ctrl+F5 ou Cmd+Shift+R)
2. Videz le cache du navigateur
3. Essayez de réinitialiser les paramètres

### Police de dyslexie ne fonctionne pas
La police OpenDyslexic peut ne pas être installée sur votre système. Le site utilise Comic Sans MS comme repli.

Pour installer OpenDyslexic :
- [Téléchargez-la gratuitement](https://opendyslexic.org/)
- Installez-la sur votre système
- Actualisez la page

### Conflit avec le mode sombre/contraste
Si vous utilisez une extension de thème sombre (Dark Reader), elle peut entrer en conflit avec nos paramètres. Désactivez-la pour ce site pour de meilleurs résultats.

---

## Suggestions d'accessibilité

Avez-vous besoin d'un paramètre qui n'est pas répertorié ? Nous aimerions avoir de vos nouvelles !

**Demandes fréquentes que nous étudions** :
- Sélecteur de jeu de couleurs personnalisé
- Contrôle de l'opacité de l'arrière-plan
- Mode de lecture (contenu uniquement)
- Curseur personnalisé (taille/couleur)

Envoyez vos suggestions à [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) avec le sujet "Suggestion accessibilité".

---

## Ressources supplémentaires

### Notre engagement
- [Politique d'accessibilité](/accessibility/) - Notre engagement WCAG 2.2 AA
- [Guide d'accessibilité](/accessibility-walkthrough/) - Visite guidée des fonctionnalités

### Outils externes
- **Lecteurs d'écran** : NVDA (Windows), JAWS, VoiceOver (Mac/iOS), TalkBack (Android)
- **Zoom** : ZoomText, extensions de navigateur
- **Contraste** : Vérificateur de contraste WebAIM

### Support OS
- **Windows** : Paramètres → Accessibilité
- **macOS** : Préférences Système → Accessibilité
- **iOS** : Réglages → Accessibilité
- **Android** : Paramètres → Accessibilité

---

Merci d'utiliser nos paramètres d'accessibilité ! 💚

Ensemble, nous construisons un Web plus accessible pour tous.

{%- include page-feedback.html -%}
