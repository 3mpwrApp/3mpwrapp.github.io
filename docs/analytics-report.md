# Analytics Event Report

Generated: 2025-12-12T17:43:08.274Z

## Summary

- Registry events: 78
- Unique events referenced in code: 124
- Total literal emissions (static scan): 127
- Missing (used not registered): 88
- Unused (registered not used): 42
- Sensitive field occurrences (schema): 5
- Classification counts: other=2, secret=1, pii=2

### Missing

- ai.translator.quick_translate
- ai.assistant.question_asked
- support.category.select
- support.resource.view
- allies.type.select
- allies.resource.view
- coach.module.open
- coach.lesson.start
- ratings.category.select
- ratings.review.view
- ratings.add.start
- world.map.open
- world.region.select
- world.campaign.view
- evidence.add
- evidence.file.open
- evidence.timeline.event
- evidence.timeline.add
- evidence.voice.toggle
- evidence.voice.play
- evidence.checklist.toggle
- legal.case.open
- legal.action
- legal.resource
- legal.match.view
- legal.automation.tool
- legal.jaas.service
- policy.area
- policy.action
- deadlines.open
- deadlines.add
- master.case.open
- denial.analyze.start
- denial.reason.view
- claims.type.select
- claims.tool.open
- rtw.stage.open
- rtw.resource.open
- document.template.selected
- meds.toggle
- doctor.appt.view
- doctor.prep.tool
- chronic.condition.select
- chronic.condition.add
- chronic.tool.open
- rehab.program.open
- body.area.view
- body.tool.open
- rights.featured.view
- rights.category.browse
- tech.tool.featured
- tech.category.browse
- myths.category.browse
- tools.power.open
- tools.advanced.open
- emergency.contact.find
- emergency.resource.open
- energy.updated
- mood.logged
- symptoms.quick.severity
- symptoms.individual.open
- body.tracker.open
- body.cognitive.open
- environment.factor.open
- environment.sensory.open
- nutrition.guide.open
- nutrition.harm.open
- selfcare.checklist.toggle
- selfcare.library.open
- movement.exercise.start
- movement.category.select
- rehab.program.start
- rehab.game.start
- adaptive.micro.start
- adaptive.capacity.open
- recovery.tool.open
- beta_feedback_banner_dismissed
- beta_feedback_initiated
- beta_discord_opened
- beta.donation.button.dismissed
- beta.donation.platform.selected
- nps_survey_shown
- nps_score_selected
- nps_survey_completed
- nps_survey_dismissed
- nps_survey_manual_trigger
- beta.onboarding.quick.disclaimers_accepted
- beta.onboarding.quick.mode_selected

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
| ai.translator.quick_translate | 1 | MISSING |
| ai.assistant.question_asked | 1 | MISSING |
| ai_command_center_used | 1 | OK |
| support.category.select | 1 | MISSING |
| support.resource.view | 1 | MISSING |
| allies.type.select | 1 | MISSING |
| allies.resource.view | 1 | MISSING |
| coach.module.open | 1 | MISSING |
| coach.lesson.start | 1 | MISSING |
| ratings.category.select | 1 | MISSING |
| ratings.review.view | 1 | MISSING |
| ratings.add.start | 1 | MISSING |
| world.map.open | 1 | MISSING |
| world.region.select | 1 | MISSING |
| world.campaign.view | 1 | MISSING |
| advocacy.ask.submitted | 1 | OK |
| assistant.search_open | 1 | OK |
| assistant.disability_wizard_cta | 1 | OK |
| assistant.quick_prompt | 1 | OK |
| assistant.recents.clear | 1 | OK |
| evidence.add | 1 | MISSING |
| evidence.file.open | 1 | MISSING |
| evidence.timeline.event | 1 | MISSING |
| evidence.timeline.add | 1 | MISSING |
| evidence.voice.toggle | 1 | MISSING |
| evidence.voice.play | 1 | MISSING |
| evidence.checklist.toggle | 1 | MISSING |
| legal.case.open | 1 | MISSING |
| legal.action | 1 | MISSING |
| legal.resource | 1 | MISSING |
| legal.match.view | 1 | MISSING |
| legal.automation.tool | 1 | MISSING |
| legal.jaas.service | 1 | MISSING |
| policy.area | 1 | MISSING |
| policy.action | 1 | MISSING |
| advocacy.world.view | 1 | OK |
| deadlines.open | 1 | MISSING |
| deadlines.add | 1 | MISSING |
| master.case.open | 1 | MISSING |
| denial.analyze.start | 1 | MISSING |
| denial.reason.view | 1 | MISSING |
| claims.type.select | 1 | MISSING |
| claims.tool.open | 1 | MISSING |
| rtw.stage.open | 1 | MISSING |
| rtw.resource.open | 1 | MISSING |
| document.template.selected | 1 | MISSING |
| meds.toggle | 1 | MISSING |
| doctor.appt.view | 1 | MISSING |
| doctor.prep.tool | 1 | MISSING |
| chronic.condition.select | 1 | MISSING |
| chronic.condition.add | 1 | MISSING |
| chronic.tool.open | 1 | MISSING |
| rehab.program.open | 1 | MISSING |
| body.area.view | 1 | MISSING |
| body.tool.open | 1 | MISSING |
| rights.featured.view | 1 | MISSING |
| rights.category.browse | 1 | MISSING |
| tech.tool.featured | 1 | MISSING |
| tech.category.browse | 1 | MISSING |
| myths.category.browse | 1 | MISSING |
| tools.power.open | 1 | MISSING |
| tools.advanced.open | 1 | MISSING |
| emergency.contact.find | 1 | MISSING |
| emergency.resource.open | 1 | MISSING |
| quick_log_used | 1 | OK |
| account_delete | 1 | OK |
| account_delete_failed | 1 | OK |
| energy_set_daily | 1 | OK |
| energy_spend | 1 | OK |
| energy_reset_day | 1 | OK |
| energy.updated | 1 | MISSING |
| mood.logged | 1 | MISSING |
| symptoms.quick.severity | 1 | MISSING |
| symptoms.individual.open | 1 | MISSING |
| body.tracker.open | 1 | MISSING |
| body.cognitive.open | 1 | MISSING |
| environment.factor.open | 1 | MISSING |
| environment.sensory.open | 1 | MISSING |
| nutrition.guide.open | 1 | MISSING |
| nutrition.harm.open | 1 | MISSING |
| selfcare.checklist.toggle | 1 | MISSING |
| selfcare.library.open | 1 | MISSING |
| movement.exercise.start | 1 | MISSING |
| movement.category.select | 1 | MISSING |
| rehab.program.start | 1 | MISSING |
| rehab.game.start | 1 | MISSING |
| adaptive.micro.start | 1 | MISSING |
| adaptive.capacity.open | 1 | MISSING |
| recovery.tool.open | 1 | MISSING |
| wellness_opposite_next_step | 1 | OK |
| campaign_create | 1 | OK |
| campaign_share | 1 | OK |
| campaign_leave | 1 | OK |
| campaign_join | 1 | OK |
| podcast_share | 1 | OK |
| beta_feedback_banner_dismissed | 1 | MISSING |
| beta_feedback_initiated | 1 | MISSING |
| beta_discord_opened | 1 | MISSING |
| beta.donation.button.shown | 1 | OK |
| beta.donation.button.dismissed | 1 | MISSING |
| beta.donation.button.pressed | 1 | OK |
| beta.donation.platform.selected | 1 | MISSING |
| letter_wizard_save | 1 | OK |
| letter_wizard_load | 1 | OK |
| letter_wizard_delete | 1 | OK |
| letter_wizard_insert_trackers | 1 | OK |
| nps_survey_shown | 1 | MISSING |
| nps_score_selected | 1 | MISSING |
| nps_survey_completed | 1 | MISSING |
| nps_survey_dismissed | 1 | MISSING |
| nps_survey_manual_trigger | 1 | MISSING |
| beta.onboarding.quick.disclaimers_accepted | 1 | MISSING |
| beta.onboarding.quick.mode_selected | 1 | MISSING |
| beta.onboarding.quick.completed | 1 | OK |
| notification.delivered | 1 | OK |
| notification.quiet_suppressed | 1 | OK |
| advocacy.collective.submit | 1 | OK |
| bookmark_add | 1 | OK |
| bookmark_remove | 1 | OK |
| bookmark_clear_all | 1 | OK |
| error_displayed | 1 | OK |
