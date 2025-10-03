---
layout: default
title: Beta Test Signup
---

# Become a 3mpowr Beta Tester!

Help us shape the future of the 3mpowr App by joining our beta tester program.  
**Beta testing requires dedicated people who can test the full app and provide detailed feedback, including reporting any bugs.**

## Signup Form

<form action="https://docs.google.com/forms/d/e/1FAIpQLScY599ZYJtpRakd421ADGZumejk2WjmbVvpUknw2uHAzTNx9A/formResponse" method="POST" target="_blank">
  <label>
    Name:<br>
    <input type="text" name="entry.2048050345" required>
  </label><br><br>
  <label>
    Email:<br>
    <input type="email" name="entry.2128873790" required>
  </label><br><br>

  <fieldset>
    <legend>What device(s) will you be testing on?</legend>
    <label>
      <input type="checkbox" name="entry.470559077" value="Android" required>
      Android phone
    </label><br>
    <label>
      <input type="checkbox" name="entry.470559077" value="iPhone/iOS">
      iPhone/iOS
    </label><br>
    <label>
      <input type="checkbox" name="entry.470559077" value="Tablet">
      Tablet
    </label><br>
    <label>
      <input type="checkbox" name="entry.470559077" value="Windows PC">
      Windows PC
    </label><br>
    <label>
      <input type="checkbox" name="entry.470559077" value="Mac">
      Mac
    </label><br>
    <label>
      <input type="checkbox" id="device-other" name="entry.470559077" value="Other">
      Other
    </label>
    <label for="device-other-text" class="sr-only" style="position:absolute;left:-9999px;">Please specify</label>
    <input type="text" id="device-other-text" name="entry.470559077.other_option_response" placeholder="Please specify" disabled>
  </fieldset>
  <br>

  <label>
    Why would you like to be a beta tester?<br>
    <textarea name="entry.1434274983"></textarea>
  </label><br><br>
  <label>
    Are you willing to test all the features and report bugs/feedback?<br>
    <select name="entry.617838265" required>
      <option value="">Please select</option>
      <option value="Yes">Yes, I am dedicated to testing and providing feedback.</option>
      <option value="No">No, I may not be able to test everything.</option>
    </select>
  </label><br><br>
  <button type="submit">Sign Up</button>
</form>

<script>
  (function () {
    const otherCb = document.getElementById('device-other');
    const otherText = document.getElementById('device-other-text');
    if (otherCb && otherText) {
      const sync = () => {
        otherText.disabled = !otherCb.checked;
        if (!otherCb.checked) otherText.value = '';
      };
      otherCb.addEventListener('change', sync);
      sync();
    }
  })();
</script>

*We will contact selected testers by email. Thank you for your interest!*
