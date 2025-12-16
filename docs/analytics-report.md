# Analytics Event Report

Generated: 2025-12-16T22:26:04.700Z

## Summary

- Registry events: 166
- Unique events referenced in code: 118
- Total literal emissions (static scan): 121
- Missing (used not registered): 0
- Unused (registered not used): 48
- Sensitive field occurrences (schema): 6
- Classification counts: other=2, secret=1, pii=3

### Unused

- advocacy.finder.search
- advocacy.finder.open_website
- advocacy.finder.email
- advocacy.finder.open_map
- advocacy.finder.save_toggle
- letter_insert_from_trackers
- events.export.ics
- events.export.csv
- events.subscribe.calendar
- events.create
- events.delete
- events.share
- events.add_to_calendar
- events.submit_to_3mpwr
- evidence.export.encrypted
- evidence.import.encrypted
- evidence.save.single
- evidence.save.bulk
- evidence.queue.enqueued
- evidence.queue.processed
- jurisdiction.changed
- jurisdiction.deadline_calculated
- jurisdiction.form_helper_used
- beta.session.start
- beta.session.end
- beta.feedback.banner.shown
- beta.feedback.banner.dismissed
- beta.feedback.initiated
- beta.discord.opened
- beta.nps.survey.shown
- beta.nps.score.selected
- beta.nps.survey.completed
- beta.nps.survey.dismissed
- beta.onboarding.quick.started
- beta.feature.first_use
- beta.tab.visit
- beta.complexity.mode.changed
- beta.error.encountered
- beta.crash.recovered
- beta.a11y.feature.enabled
- beta.tool.usage
- beta.session.duration
- body.area.view
- body.tool.open
- chronic.condition.add
- chronic.condition.select
- chronic.tool.open
- rehab.program.open

## Categories

| Category | Events |
|----------|-------:|
| account_delete | 1 |
| account_delete_failed | 1 |
| adaptive | 2 |
| advocacy | 8 |
| ai | 2 |
| ai_command_center_used | 1 |
| allies | 2 |
| assistant | 4 |
| beta | 26 |
| beta_discord_opened | 1 |
| beta_feedback_banner_dismissed | 1 |
| beta_feedback_initiated | 1 |
| body | 4 |
| bookmark_add | 1 |
| bookmark_clear_all | 1 |
| bookmark_remove | 1 |
| campaign | 1 |
| campaign_create | 1 |
| campaign_join | 1 |
| campaign_leave | 1 |
| campaign_share | 1 |
| chronic | 3 |
| claims | 2 |
| coach | 2 |
| deadlines | 2 |
| denial | 2 |
| doctor | 2 |
| document | 1 |
| emergency | 2 |
| energy | 1 |
| energy_reset_day | 1 |
| energy_set_daily | 1 |
| energy_spend | 1 |
| environment | 2 |
| error_displayed | 1 |
| events | 8 |
| evidence | 13 |
| jurisdiction | 3 |
| legal | 6 |
| letter_insert_from_trackers | 1 |
| letter_wizard_delete | 1 |
| letter_wizard_insert_trackers | 1 |
| letter_wizard_load | 1 |
| letter_wizard_save | 1 |
| master | 1 |
| meds | 1 |
| mood | 1 |
| movement | 2 |
| myths | 1 |
| notification | 2 |
| nps_score_selected | 1 |
| nps_survey_completed | 1 |
| nps_survey_dismissed | 1 |
| nps_survey_manual_trigger | 1 |
| nps_survey_shown | 1 |
| nutrition | 2 |
| podcast_share | 1 |
| policy | 2 |
| quick_log_used | 1 |
| ratings | 3 |
| recovery | 1 |
| rehab | 3 |
| rights | 2 |
| rtw | 2 |
| selfcare | 2 |
| support | 2 |
| symptoms | 2 |
| tech | 2 |
| tools | 2 |
| tracker_add_entry | 1 |
| tracker_share | 1 |
| wellness_opposite_next_step | 1 |
| world | 3 |

## Event Usage

| Event | Count | Status |
|-------|------:|--------|
| tracker_add_entry | 2 | OK |
| tracker_share | 2 | OK |
| campaign.submit_to_3mpwr | 2 | OK |
| ai.translator.quick_translate | 1 | OK |
| ai.assistant.question_asked | 1 | OK |
| ai_command_center_used | 1 | OK |
| support.category.select | 1 | OK |
| support.resource.view | 1 | OK |
| allies.type.select | 1 | OK |
| allies.resource.view | 1 | OK |
| coach.module.open | 1 | OK |
| coach.lesson.start | 1 | OK |
| ratings.category.select | 1 | OK |
| ratings.review.view | 1 | OK |
| ratings.add.start | 1 | OK |
| world.map.open | 1 | OK |
| world.region.select | 1 | OK |
| world.campaign.view | 1 | OK |
| advocacy.ask.submitted | 1 | OK |
| assistant.search_open | 1 | OK |
| assistant.disability_wizard_cta | 1 | OK |
| assistant.quick_prompt | 1 | OK |
| assistant.recents.clear | 1 | OK |
| evidence.add | 1 | OK |
| evidence.file.open | 1 | OK |
| evidence.timeline.event | 1 | OK |
| evidence.timeline.add | 1 | OK |
| evidence.voice.toggle | 1 | OK |
| evidence.voice.play | 1 | OK |
| evidence.checklist.toggle | 1 | OK |
| legal.case.open | 1 | OK |
| legal.action | 1 | OK |
| legal.resource | 1 | OK |
| legal.match.view | 1 | OK |
| legal.automation.tool | 1 | OK |
| legal.jaas.service | 1 | OK |
| policy.area | 1 | OK |
| policy.action | 1 | OK |
| advocacy.world.view | 1 | OK |
| deadlines.open | 1 | OK |
| deadlines.add | 1 | OK |
| master.case.open | 1 | OK |
| denial.analyze.start | 1 | OK |
| denial.reason.view | 1 | OK |
| claims.type.select | 1 | OK |
| claims.tool.open | 1 | OK |
| rtw.stage.open | 1 | OK |
| rtw.resource.open | 1 | OK |
| document.template.selected | 1 | OK |
| rights.featured.view | 1 | OK |
| rights.category.browse | 1 | OK |
| tech.tool.featured | 1 | OK |
| tech.category.browse | 1 | OK |
| myths.category.browse | 1 | OK |
| tools.power.open | 1 | OK |
| tools.advanced.open | 1 | OK |
| emergency.contact.find | 1 | OK |
| emergency.resource.open | 1 | OK |
| quick_log_used | 1 | OK |
| account_delete | 1 | OK |
| account_delete_failed | 1 | OK |
| energy_set_daily | 1 | OK |
| energy_spend | 1 | OK |
| energy_reset_day | 1 | OK |
| energy.updated | 1 | OK |
| mood.logged | 1 | OK |
| symptoms.quick.severity | 1 | OK |
| symptoms.individual.open | 1 | OK |
| meds.toggle | 1 | OK |
| doctor.appt.view | 1 | OK |
| doctor.prep.tool | 1 | OK |
| body.tracker.open | 1 | OK |
| body.cognitive.open | 1 | OK |
| environment.factor.open | 1 | OK |
| environment.sensory.open | 1 | OK |
| nutrition.guide.open | 1 | OK |
| nutrition.harm.open | 1 | OK |
| selfcare.checklist.toggle | 1 | OK |
| selfcare.library.open | 1 | OK |
| movement.exercise.start | 1 | OK |
| movement.category.select | 1 | OK |
| rehab.program.start | 1 | OK |
| rehab.game.start | 1 | OK |
| adaptive.micro.start | 1 | OK |
| adaptive.capacity.open | 1 | OK |
| recovery.tool.open | 1 | OK |
| wellness_opposite_next_step | 1 | OK |
| campaign_create | 1 | OK |
| campaign_share | 1 | OK |
| campaign_leave | 1 | OK |
| campaign_join | 1 | OK |
| podcast_share | 1 | OK |
| beta_feedback_banner_dismissed | 1 | OK |
| beta_feedback_initiated | 1 | OK |
| beta_discord_opened | 1 | OK |
| beta.donation.button.shown | 1 | OK |
| beta.donation.button.dismissed | 1 | OK |
| beta.donation.button.pressed | 1 | OK |
| beta.donation.platform.selected | 1 | OK |
| letter_wizard_save | 1 | OK |
| letter_wizard_load | 1 | OK |
| letter_wizard_delete | 1 | OK |
| letter_wizard_insert_trackers | 1 | OK |
| nps_survey_shown | 1 | OK |
| nps_score_selected | 1 | OK |
| nps_survey_completed | 1 | OK |
| nps_survey_dismissed | 1 | OK |
| nps_survey_manual_trigger | 1 | OK |
| beta.onboarding.quick.disclaimers_accepted | 1 | OK |
| beta.onboarding.quick.mode_selected | 1 | OK |
| beta.onboarding.quick.completed | 1 | OK |
| notification.delivered | 1 | OK |
| notification.quiet_suppressed | 1 | OK |
| advocacy.collective.submit | 1 | OK |
| bookmark_add | 1 | OK |
| bookmark_remove | 1 | OK |
| bookmark_clear_all | 1 | OK |
| error_displayed | 1 | OK |
