import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';

// Validates that required accessibility-related i18n keys exist in all locales.
// Focuses on campaign + events interactions recently added.

describe('i18n a11y key parity (campaigns/events)', () => {
  const required = [
    'a11y.shareCampaign',
    'a11y.joinCampaign',
    'a11y.leaveCampaign',
    'a11y.supportCampaign',
    'a11y.openCampaignRoom',
    'a11y.saveCampaign',
    'a11y.removeCampaign',
    'a11y.toggleCreateEventFormOpen',
    'a11y.toggleCreateEventFormClose',
    'a11y.scheduleEventReminder',
    'a11y.removeEventReminder',
    'a11y.addToCalendar'
  ];

  function has(obj: any, key: string) {
    return key.split('.').reduce((acc,k)=> (acc && acc[k] != null ? acc[k] : undefined), obj) != null;
  }

  it('english has baseline keys', () => {
    for(const k of required){
      expect(has(en,k)).toBe(true);
    }
  });
  it('spanish has baseline keys', () => {
    for(const k of required){
      expect(has(es,k)).toBe(true);
    }
  });
  it('french has baseline keys', () => {
    for(const k of required){
      expect(has(fr,k)).toBe(true);
    }
  });
});
