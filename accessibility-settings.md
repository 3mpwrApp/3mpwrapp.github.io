---
layout: default
title: Accessibility Settings
description: Customize your viewing experience with accessibility options including text size, contrast, dark mode, and reading preferences.
permalink: /accessibility-settings/
---


{%- include status-banner.html -%}

# Accessibility Settings

Use these controls to customize your viewing experience. Your preferences are saved in your browser on this device.

## Display options

- High contrast mode: use the “High contrast” button in the site header. This increases color contrast and focus visibility.
- Dark mode: use the “Dark mode” button in the site header. This switches to a dark color scheme.

### Fine‑tune reading preferences

<form data-a11y-form aria-labelledby="a11y-form-title">
	<h2 id="a11y-form-title">Reading preferences</h2>
	<div>
		<label for="font-scale">Text size</label><br>
		<input id="font-scale" name="font-scale" type="range" min="90" max="150" step="5" value="100" aria-describedby="font-scale-hint">
		<p id="font-scale-hint">Adjusts overall text size on the site.</p>
	</div>
	<div>
		<label for="line-height">Line spacing</label><br>
		<select id="line-height" name="line-height">
			<option value="normal">Normal</option>
			<option value="loose">Loose</option>
		</select>
	</div>
	<div>
		<label for="letter-spacing">Letter spacing</label><br>
		<select id="letter-spacing" name="letter-spacing">
			<option value="normal">Normal</option>
			<option value="wide">Wide</option>
		</select>
	</div>
	<div>
		<label for="underline-links">Underline links</label><br>
		<select id="underline-links" name="underline-links">
			<option value="auto">Auto</option>
			<option value="always">Always underline</option>
		</select>
	</div>
	<div>
		<label for="readable-font">Font family</label><br>
		<select id="readable-font" name="readable-font">
			<option value="default">Default</option>
			<option value="readable">Readable sans-serif</option>
				<option value="dyslexia">Dyslexia-friendly</option>
		</select>
	</div>
		<div>
			<label for="reduce-motion">Motion</label><br>
			<select id="reduce-motion" name="reduce-motion">
				<option value="auto">Follow system setting</option>
				<option value="on">Reduce motion</option>
			</select>
		</div>
			<div>
				<label for="color-filter">Color filter</label><br>
				<select id="color-filter" name="color-filter">
					<option value="none">None</option>
					<option value="grayscale">Grayscale</option>
					<option value="hue">Hue shift</option>
				</select>
			</div>
			<div>
				<label for="focus-ring">Focus ring</label><br>
				<select id="focus-ring" name="focus-ring">
					<option value="default">Default</option>
					<option value="thick">Thick</option>
					<option value="color">High-visibility color</option>
				</select>
			</div>
	<p>
		<button type="button" data-reset class="button">Reset to defaults</button>
	</p>
</form>

## Motion

This site respects your system’s “Reduce Motion” preference and avoids unnecessary animations automatically. If you need further adjustments, let us know.

## Keyboard navigation

- Use the “Skip to content” and “Skip to footer” links at the top of the page.
- Press “Tab” to move between links and controls; “Shift + Tab” moves backwards.
- The newsletter modal can be closed with the “Escape” key, by clicking outside the dialog, or using the “Close”/“Not now” buttons. Focus is kept within the dialog while it is open.

## Reset preferences

If you want to reset your saved preferences, use the “Reset to defaults” button above or clear your browser’s site data for this domain.

## Feedback

If any setting isn’t working as expected, contact us at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) with your browser and device information.

<script src="{{ '/assets/js/settings.js' | relative_url }}" defer></script>

{%- include page-feedback.html -%}
