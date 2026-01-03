/**
 * Redirect Tests - Verify legacy screens redirect to PowerTools
 */

import { cleanup, render } from '@testing-library/react-native';

// Case Tracker Pro redirects
import AppealCoachRedirect from '../app/(tabs)/resources/appeal-coach';
import CaseTimelineRedirect from '../app/(tabs)/resources/case-timeline';
import ClaimsNavigatorRedirect from '../app/(tabs)/resources/claims-navigator';
import DeadlinesRedirect from '../app/(tabs)/resources/deadlines';
import DeadlinesListRedirect from '../app/(tabs)/resources/deadlines-list';
import DenialDecoderRedirect from '../app/(tabs)/resources/denial-decoder';
import MasterTrackerHubRedirect from '../app/(tabs)/resources/master-tracker-hub';
import RtwPlannerRedirect from '../app/(tabs)/resources/rtw-planner';
// Document Factory redirects
import AccommodationRequestRedirect from '../app/(tabs)/resources/(tools)/accommodation-request';
import PrepareAppealRedirect from '../app/(tabs)/resources/(tools)/prepare-appeal';
// Evidence Command Center redirects
import EvidenceManagerRedirect from '../app/(tabs)/advocacy/evidence-manager';
import EvidenceVaultRedirect from '../app/(tabs)/advocacy/evidence-vault';
import EvidenceChecklistRedirect from '../app/(tabs)/resources/evidence-checklist';
import EvidenceQueueRedirect from '../app/(tabs)/resources/evidence-queue';
// Health Tracker Pro redirects
import MedsTrackerRedirect from '../app/(tabs)/resources/meds-tracker';
import CognitiveScannerRedirect from '../app/(tabs)/wellness/cognitive-scanner';
import EnvironmentalAdaptationRedirect from '../app/(tabs)/wellness/environmental-adaptation';
import FunctionalCapacityRedirect from '../app/(tabs)/wellness/functional-capacity';
import HealthManagementHubRedirect from '../app/(tabs)/wellness/health-management-hub';
import HealthTrackerRedirect from '../app/(tabs)/wellness/health-tracker';
import MedicationsRedirect from '../app/(tabs)/wellness/medications';
import SymptomTrackerRedirect from '../app/(tabs)/wellness/symptom-tracker';
import TriggerDetectorRedirect from '../app/(tabs)/wellness/trigger-detector';
// Energy Command Center redirects
import EnergyMoodDashboardRedirect from '../app/(tabs)/wellness/energy-mood-dashboard';
import PacingPartnerRedirect from '../app/(tabs)/wellness/pacing-partner';
import PainForecastRedirect from '../app/(tabs)/wellness/pain-forecast';
import SleepEnergyTrackerRedirect from '../app/(tabs)/wellness/sleep-energy-tracker';
import SpoonEconomistRedirect from '../app/(tabs)/wellness/spoon-economist';
import SpoonMarketplaceRedirect from '../app/(tabs)/wellness/spoon-marketplace';
import SymptomSymphonyRedirect from '../app/(tabs)/wellness/symptom-symphony';
// Mental Wellness Toolkit redirects
import AcceptanceFunctionRedirect from '../app/(tabs)/wellness/acceptance-function';
import AiGroundingRedirect from '../app/(tabs)/wellness/ai-grounding';
import BeliefMeterRedirect from '../app/(tabs)/wellness/belief-meter';
import CbtCoachRedirect from '../app/(tabs)/wellness/cbt-coach';
import DbtRedirect from '../app/(tabs)/wellness/dbt';
import DistressToleranceRedirect from '../app/(tabs)/wellness/distress-tolerance';
import OppositeActionRedirect from '../app/(tabs)/wellness/opposite-action';
import RadicalAcceptanceRedirect from '../app/(tabs)/wellness/radical-acceptance';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => <>{`Redirecting to ${href}`}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('Legacy Screen Redirects', () => {
  afterEach(cleanup);
  
  describe('Case Tracker Pro', () => {
    it('redirects master-tracker-hub to case-tracker-pro', () => {
      const { getByText } = render(<MasterTrackerHubRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects case-timeline to case-tracker-pro', () => {
      const { getByText } = render(<CaseTimelineRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects deadlines to case-tracker-pro', () => {
      const { getByText } = render(<DeadlinesRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects deadlines-list to case-tracker-pro', () => {
      const { getByText } = render(<DeadlinesListRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects claims-navigator to case-tracker-pro', () => {
      const { getByText } = render(<ClaimsNavigatorRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects denial-decoder to case-tracker-pro', () => {
      const { getByText } = render(<DenialDecoderRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });

    it('redirects rtw-planner to case-tracker-pro', () => {
      const { getByText } = render(<RtwPlannerRedirect />);
      expect(getByText(/case-tracker-pro/)).toBeTruthy();
    });
  });

  describe('Document Factory', () => {
    it('redirects appeal-coach to document-factory', () => {
      const { getByText } = render(<AppealCoachRedirect />);
      expect(getByText(/document-factory/)).toBeTruthy();
    });

    it('redirects prepare-appeal to document-factory', () => {
      const { getByText } = render(<PrepareAppealRedirect />);
      expect(getByText(/document-factory/)).toBeTruthy();
    });

    it('redirects accommodation-request to document-factory', () => {
      const { getByText } = render(<AccommodationRequestRedirect />);
      expect(getByText(/document-factory/)).toBeTruthy();
    });
  });

  describe('Evidence Command Center', () => {
    it('redirects evidence-manager to evidence-command-center', () => {
      const { getByText } = render(<EvidenceManagerRedirect />);
      expect(getByText(/evidence-command-center/)).toBeTruthy();
    });

    it('redirects evidence-vault to evidence-command-center', () => {
      const { getByText } = render(<EvidenceVaultRedirect />);
      expect(getByText(/evidence-command-center/)).toBeTruthy();
    });

    it('redirects evidence-queue to evidence-command-center', () => {
      const { getByText } = render(<EvidenceQueueRedirect />);
      expect(getByText(/evidence-command-center/)).toBeTruthy();
    });

    it('redirects evidence-checklist to evidence-command-center', () => {
      const { getByText } = render(<EvidenceChecklistRedirect />);
      expect(getByText(/evidence-command-center/)).toBeTruthy();
    });
  });

  describe('Health Tracker Pro', () => {
    it('redirects health-tracker to health-tracker-pro', () => {
      const { getByText } = render(<HealthTrackerRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects health-management-hub to health-tracker-pro', () => {
      const { getByText } = render(<HealthManagementHubRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects symptom-tracker to health-tracker-pro', () => {
      const { getByText } = render(<SymptomTrackerRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects medications to health-tracker-pro', () => {
      const { getByText } = render(<MedicationsRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects meds-tracker to health-tracker-pro', () => {
      const { getByText } = render(<MedsTrackerRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects cognitive-scanner to health-tracker-pro', () => {
      const { getByText } = render(<CognitiveScannerRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects functional-capacity to health-tracker-pro', () => {
      const { getByText } = render(<FunctionalCapacityRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects environmental-adaptation to health-tracker-pro', () => {
      const { getByText } = render(<EnvironmentalAdaptationRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });

    it('redirects trigger-detector to health-tracker-pro', () => {
      const { getByText } = render(<TriggerDetectorRedirect />);
      expect(getByText(/health-tracker-pro/)).toBeTruthy();
    });
  });

  describe('Energy Command Center', () => {
    it('redirects spoon-economist to energy-command-center', () => {
      const { getByText } = render(<SpoonEconomistRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects spoon-marketplace to energy-command-center', () => {
      const { getByText } = render(<SpoonMarketplaceRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects energy-mood-dashboard to energy-command-center', () => {
      const { getByText } = render(<EnergyMoodDashboardRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects pacing-partner to energy-command-center', () => {
      const { getByText } = render(<PacingPartnerRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects pain-forecast to energy-command-center', () => {
      const { getByText } = render(<PainForecastRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects sleep-energy-tracker to energy-command-center', () => {
      const { getByText } = render(<SleepEnergyTrackerRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });

    it('redirects symptom-symphony to energy-command-center', () => {
      const { getByText } = render(<SymptomSymphonyRedirect />);
      expect(getByText(/energy-command-center/)).toBeTruthy();
    });
  });

  describe('Mental Wellness Toolkit', () => {
    it('redirects cbt-coach to mental-wellness-toolkit', () => {
      const { getByText } = render(<CbtCoachRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects dbt to mental-wellness-toolkit', () => {
      const { getByText } = render(<DbtRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects opposite-action to mental-wellness-toolkit', () => {
      const { getByText } = render(<OppositeActionRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects radical-acceptance to mental-wellness-toolkit', () => {
      const { getByText } = render(<RadicalAcceptanceRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects acceptance-function to mental-wellness-toolkit', () => {
      const { getByText } = render(<AcceptanceFunctionRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects belief-meter to mental-wellness-toolkit', () => {
      const { getByText } = render(<BeliefMeterRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects ai-grounding to mental-wellness-toolkit', () => {
      const { getByText } = render(<AiGroundingRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });

    it('redirects distress-tolerance to mental-wellness-toolkit', () => {
      const { getByText } = render(<DistressToleranceRedirect />);
      expect(getByText(/mental-wellness-toolkit/)).toBeTruthy();
    });
  });
});
