---
layout: default
title: Newsletter
permalink: /newsletter/
description: Subscribe for weekly updates, community stories, resource highlights, events, and advocacy news from 3mpwr App.
---

# Newsletter

Stay informed about product updates, early access, and beta invites. We'll only email you about 3mpwr App. You can unsubscribe any time.

## What You'll Get
- **Weekly Updates**: Latest features and improvements
- **Community Stories**: Inspiring stories from our community
- **Resource Highlights**: New guides, templates, and educational materials
- **Event Announcements**: Upcoming workshops, webinars, and community events
- **Advocacy Updates**: Important policy changes and campaign progress

## Subscribe Now

<div class="newsletter-embed">
  <iframe
    id="newsletter-form"
    title="3mpwr App newsletter signup"
    src="https://docs.google.com/forms/d/e/1FAIpQLSf9AHMg9pMWS2njErNXDj1W0g2rXBNabXsUnZOgRF4vfvk0kQ/viewform?embedded=true"
    loading="lazy"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    referrerpolicy="no-referrer"
  >Loading…</iframe>
</div>

<!-- styles moved to assets/css/style.css -->

<script>
(function () {
  var iframe = document.getElementById('newsletter-form');
  if (!iframe) return;
  var firstLoadDone = false;
  iframe.addEventListener('load', function () {
    if (firstLoadDone) {
      iframe.classList.add('newsletter-redirecting');
      // Redirect immediately after submission view loads
      setTimeout(function () { window.location.href = '/'; }, 0);
      return;
    }
    firstLoadDone = true;
  });
})();
</script>

If you cannot see the embedded form, use this direct link:
- [Open the signup form](https://docs.google.com/forms/d/e/1FAIpQLSf9AHMg9pMWS2njErNXDj1W0g2rXBNabXsUnZOgRF4vfvk0kQ/viewform)

---

**We respect your privacy.** Your email will only be used for 3mpwr App newsletters and important updates. You can unsubscribe at any time.
