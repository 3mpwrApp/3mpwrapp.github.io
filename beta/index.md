---
layout: default
title: Beta Test Signup
description: Sign up to become a dedicated beta tester and help improve 3mpwr App.
---

# Become a 3mpwr Beta Tester!

Help us shape the future of the 3mpwr App by joining our beta tester program.  
**Beta testing requires dedicated people who can test the full app and provide detailed feedback, including reporting any bugs.**

## Signup Form

<form action="https://docs.google.com/forms/d/e/1FAIpQLScY599ZYJtpRakd421ADGZumejk2WjmbVvpUknw2uHAzTNx9A/formResponse" method="POST" target="_blank">
  <div>
    <label for="beta-name">Name</label><br>
    <input id="beta-name" type="text" name="entry.2048050345" autocomplete="name" required>
  </div>
  <br>

  <div>
    <label for="beta-email">Email</label><br>
    <input id="beta-email" type="email" name="entry.2128873790" autocomplete="email" inputmode="email" required>
  </div>
  <br>

  <fieldset aria-describedby="devices-hint">
    <legend>What device(s) will you be testing on? <span aria-hidden="true">*</span></legend>
    <p id="devices-hint" class="sr-only">Select all that apply. Choose Other to specify another device.</p>

    <label><input type="checkbox" name="entry.470559077" value="Android" required> Android phone</label><br>
    <label><input type="checkbox" name="entry.470559077" value="iPhone/iOS"> iPhone/iOS</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Tablet"> Tablet</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Windows PC"> Windows PC</label><br>
    <label><input type="checkbox" name="entry.470559077" value="Mac"> Mac</label><br>

    <label>
      <input type="checkbox" id="device-other" name="entry.470559077" value="Other">
      Other
    </label>
    <label for="device-other-text" class="sr-only">Please specify your device</label>
    <input
      type="text"
      id="device-other-text"
      name="entry.470559077.other_option_response"
      placeholder="Please specify"
      disabled
      aria-disabled="true"
    >
  </fieldset>
  <br>

  <div>
    <label for="beta-reason">Why would you like to be a beta tester?</label><br>
    <textarea id="beta-reason" name="entry.1434274983" rows="5"></textarea>
  </div>
  <br>

  <div>
    <label for="beta-willing">Are you willing to test all the features and report bugs/feedback?</label><br>
    <select id="beta-willing" name="entry.617838265" required>
      <option value="">Please select</option>
      <option value="Yes">Yes, I am dedicated to testing and providing feedback.</option>
      <option value="No">No, I may not be able to test everything.</option>
    </select>
  </div>
  <br>

  <button type="submit">Sign Up</button>
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

*We will contact selected testers by email. Thank you for your interest!*
