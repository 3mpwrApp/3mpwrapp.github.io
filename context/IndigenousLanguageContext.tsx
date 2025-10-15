import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { logger } from '../utils/logger';

export interface IndigenousLanguageSupport {
  // Language preferences
  primaryLanguage: 'en' | 'fr' | 'cree' | 'ojibwe' | 'inuktitut' | 'mikmaq' | 'mohawk' | 'dene';
  secondaryLanguage?: 'en' | 'fr' | 'cree' | 'ojibwe' | 'inuktitut' | 'mikmaq' | 'mohawk' | 'dene';
  dialectVariant?: string;
  syllabicsEnabled: boolean;
  
  // Cultural protocols
  enableLandAcknowledgment: boolean;
  traditionalTerritory: string;
  ceremonialConsiderations: boolean;
  elderConsultation: boolean;
  communityProtocols: boolean;
  
  // Traditional knowledge systems
  traditionalHealingIntegration: boolean;
  holisticWellnessApproach: boolean;
  familyCenteredCare: boolean;
  communityCenteredApproach: boolean;
  
  // Legal and governance
  indigenousRights: boolean;
  treatyRights: boolean;
  customaryLaw: boolean;
  tribalCourtSystem: boolean;
  
  // Communication preferences
  storytellingFormat: boolean;
  oralTraditionRespect: boolean;
  visualCommunication: boolean;
  ceremonialLanguage: boolean;
  
  // Accessibility and inclusion
  indigenousDisabilityModels: boolean;
  traditionalAccessibility: boolean;
  elderAccessibility: boolean;
  youthEngagement: boolean;
}

const defaultSettings: IndigenousLanguageSupport = {
  primaryLanguage: 'en',
  syllabicsEnabled: false,
  enableLandAcknowledgment: false,
  traditionalTerritory: '',
  ceremonialConsiderations: false,
  elderConsultation: false,
  communityProtocols: false,
  traditionalHealingIntegration: false,
  holisticWellnessApproach: false,
  familyCenteredCare: false,
  communityCenteredApproach: false,
  indigenousRights: false,
  treatyRights: false,
  customaryLaw: false,
  tribalCourtSystem: false,
  storytellingFormat: false,
  oralTraditionRespect: false,
  visualCommunication: false,
  ceremonialLanguage: false,
  indigenousDisabilityModels: false,
  traditionalAccessibility: false,
  elderAccessibility: false,
  youthEngagement: false,
};

interface IndigenousLanguageContextType {
  settings: IndigenousLanguageSupport;
  updateSetting: <K extends keyof IndigenousLanguageSupport>(
    key: K,
    value: IndigenousLanguageSupport[K]
  ) => Promise<void>;
  getLocalizedText: (key: string, fallback: string) => string;
  enableNationProfile: (nation: string) => Promise<void>;
  getLandAcknowledgment: () => string;
  isLoaded: boolean;
  
  // Additional properties needed by indigenous-language.tsx
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  enableSyllabics: boolean;
  setEnableSyllabics: (enable: boolean) => void;
  culturalProtocols: boolean;
  setCulturalProtocols: (enable: boolean) => void;
  territorialAcknowledgment: boolean;
  setTerritorialAcknowledgment: (enable: boolean) => void;
  availableLanguages: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
}

const IndigenousLanguageContext = createContext<IndigenousLanguageContextType | null>(null);

const STORAGE_KEY = 'indigenous-language-support:v1';

// Indigenous language resources and protocols
export const indigenousLanguages = {
  cree: {
    name: 'ᓀᐦᐃᔭᐍᐏᐣ (Cree)',
    nativeName: 'Nēhiyawēwin',
    syllabics: true,
    regions: ['Alberta', 'Saskatchewan', 'Manitoba', 'Ontario', 'Quebec'],
    protocols: {
      respectfulGreeting: 'Tansi',
      elderAddress: 'Môsom / Nôhkom',
      ceremonialProtocol: 'Smudging, pipe ceremony protocols',
    },
  },
  ojibwe: {
    name: 'ᐊᓂᔑᓈᐯᒧᐎᓐ (Ojibwe)',
    nativeName: 'Anishinaabemowin',
    syllabics: true,
    regions: ['Ontario', 'Manitoba', 'Saskatchewan', 'Alberta'],
    protocols: {
      respectfulGreeting: 'Boozhoo',
      elderAddress: 'Mishomis / Nooko',
      ceremonialProtocol: 'Tobacco offering, sacred fire protocols',
    },
  },
  inuktitut: {
    name: 'ᐃᓄᒃᑎᑐᑦ (Inuktitut)',
    nativeName: 'Inuktitut',
    syllabics: true,
    regions: ['Nunavut', 'Northwest Territories', 'Quebec', 'Newfoundland and Labrador'],
    protocols: {
      respectfulGreeting: 'Atelihai',
      elderAddress: 'Anaana / Ataata',
      ceremonialProtocol: 'Community sharing circles, traditional hunting protocols',
    },
  },
  mikmaq: {
    name: "Mi'kmaq",
    nativeName: "Mi'kmawi'simk",
    syllabics: false,
    regions: ['Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Quebec'],
    protocols: {
      respectfulGreeting: 'Kwe',
      elderAddress: 'Kesalk / Nukumi',
      ceremonialProtocol: 'Talking circles, sacred medicines',
    },
  },
  mohawk: {
    name: 'Kanienʼkéha (Mohawk)',
    nativeName: 'Kanienʼkéha',
    syllabics: false,
    regions: ['Quebec', 'Ontario'],
    protocols: {
      respectfulGreeting: 'Shé:kon',
      elderAddress: 'Raksotha / Akhsotha',
      ceremonialProtocol: 'Thanksgiving address, clan protocols',
    },
  },
  dene: {
    name: 'ᑌᓀ (Dene)',
    nativeName: 'Dene Yatie',
    syllabics: true,
    regions: ['Northwest Territories', 'Alberta', 'Saskatchewan', 'Manitoba'],
    protocols: {
      respectfulGreeting: 'Mahsi',
      elderAddress: 'Elder',
      ceremonialProtocol: 'Drumming ceremonies, traditional medicines',
    },
  },
};

// Traditional territory acknowledgments
export const territorialAcknowledgments = {
  'Treaty 1': {
    territory: 'Treaty 1 Territory',
    nations: ['Anishinaabe', 'Cree', 'Oji-Cree', 'Dakota', 'Dene'],
    acknowledgment: 'We acknowledge that we are gathered on Treaty 1 Territory, the traditional territory of the Anishinaabe, Cree, Oji-Cree, Dakota, and Dene peoples, and the homeland of the Métis Nation.',
    region: 'Southern Manitoba',
  },
  'Treaty 6': {
    territory: 'Treaty 6 Territory',
    nations: ['Cree', 'Dene', 'Saulteaux', 'Blackfoot'],
    acknowledgment: 'We acknowledge that we are on Treaty 6 Territory and the homeland of the Métis. Treaty 6 is the traditional territory of many Indigenous nations including the Cree, Dene, Saulteaux, and Blackfoot peoples.',
    region: 'Central Alberta and Saskatchewan',
  },
  'Turtle Island': {
    territory: 'Turtle Island',
    nations: ['All Indigenous Nations'],
    acknowledgment: 'We acknowledge that we are on the traditional territory of many Indigenous nations. This land, known as Turtle Island, has been stewarded by Indigenous peoples since time immemorial.',
    region: 'North America',
  },
  'Haudenosaunee': {
    territory: 'Haudenosaunee Territory',
    nations: ['Mohawk', 'Oneida', 'Onondaga', 'Cayuga', 'Seneca', 'Tuscarora'],
    acknowledgment: 'We acknowledge that we are on the traditional territory of the Haudenosaunee (Six Nations), who have been the stewards of this land since time immemorial.',
    region: 'Eastern Ontario and New York',
  },
  'Anishinaabe': {
    territory: 'Anishinaabe Territory',
    nations: ['Ojibwe', 'Odawa', 'Potawatomi'],
    acknowledgment: 'We acknowledge that we are on the traditional territory of the Anishinaabe peoples, including the Ojibwe, Odawa, and Potawatomi nations.',
    region: 'Great Lakes Region',
  },
};

export function IndigenousLanguageProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<IndigenousLanguageSupport>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Additional state for the properties needed by indigenous-language.tsx
  const [selectedLanguage, setSelectedLanguageState] = useState(settings.primaryLanguage);
  const [enableSyllabics, setEnableSyllabicsState] = useState(settings.syllabicsEnabled);
  const [culturalProtocols, setCulturalProtocolsState] = useState(settings.ceremonialConsiderations);
  const [territorialAcknowledgment, setTerritorialAcknowledgmentState] = useState(settings.enableLandAcknowledgment);

  // Wrapper functions to match expected interface
  const setSelectedLanguage = (language: string) => {
    setSelectedLanguageState(language as any);
  };

  const setEnableSyllabics = (enable: boolean) => {
    setEnableSyllabicsState(enable);
  };

  const setCulturalProtocols = (enable: boolean) => {
    setCulturalProtocolsState(enable);
  };

  const setTerritorialAcknowledgment = (enable: boolean) => {
    setTerritorialAcknowledgmentState(enable);
  };

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'cree', name: 'Cree', nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ' },
    { code: 'ojibwe', name: 'Ojibwe', nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ' },
    { code: 'inuktitut', name: 'Inuktitut', nativeName: 'ᐃᓄᒃᑎᑐᑦ' },
    { code: 'mikmaq', name: "Mi'kmaq", nativeName: "Mi'kmaq" },
    { code: 'mohawk', name: 'Mohawk', nativeName: 'Kanienʼkehá꞉ka' },
    { code: 'dene', name: 'Dene', nativeName: 'Dené' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      logger.warn('Failed to load Indigenous language settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (newSettings: IndigenousLanguageSupport) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      logger.warn('Failed to save Indigenous language settings:', error);
    }
  };

  const updateSetting = async <K extends keyof IndigenousLanguageSupport>(
    key: K,
    value: IndigenousLanguageSupport[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const getLocalizedText = (_key: string, fallback: string): string => {
    // This would integrate with the translation system
    // For now, return the fallback
    return fallback;
  };

  const enableNationProfile = async (nation: string) => {
    let nationSettings: Partial<IndigenousLanguageSupport> = {};

    switch (nation.toLowerCase()) {
      case 'cree':
        nationSettings = {
          primaryLanguage: 'cree',
          syllabicsEnabled: true,
          enableLandAcknowledgment: true,
          traditionalTerritory: 'Treaty 6 Territory',
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          indigenousRights: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
      case 'ojibwe':
        nationSettings = {
          primaryLanguage: 'ojibwe',
          syllabicsEnabled: true,
          enableLandAcknowledgment: true,
          traditionalTerritory: 'Anishinaabe Territory',
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          indigenousRights: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
      case 'inuit':
        nationSettings = {
          primaryLanguage: 'inuktitut',
          syllabicsEnabled: true,
          enableLandAcknowledgment: true,
          traditionalTerritory: 'Inuit Nunangat',
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          communityCenteredApproach: true,
          indigenousRights: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
      case 'mikmaq':
        nationSettings = {
          primaryLanguage: 'mikmaq',
          enableLandAcknowledgment: true,
          traditionalTerritory: "Mi'kmaki",
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          indigenousRights: true,
          treatyRights: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
      case 'mohawk':
        nationSettings = {
          primaryLanguage: 'mohawk',
          enableLandAcknowledgment: true,
          traditionalTerritory: 'Haudenosaunee Territory',
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          communityCenteredApproach: true,
          indigenousRights: true,
          customaryLaw: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          ceremonialLanguage: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
      case 'dene':
        nationSettings = {
          primaryLanguage: 'dene',
          syllabicsEnabled: true,
          enableLandAcknowledgment: true,
          traditionalTerritory: 'Dene Territory',
          ceremonialConsiderations: true,
          elderConsultation: true,
          traditionalHealingIntegration: true,
          holisticWellnessApproach: true,
          familyCenteredCare: true,
          communityCenteredApproach: true,
          indigenousRights: true,
          storytellingFormat: true,
          oralTraditionRespect: true,
          indigenousDisabilityModels: true,
          elderAccessibility: true,
        };
        break;
    }

    const newSettings = { ...settings, ...nationSettings };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const getLandAcknowledgment = (): string => {
    if (!settings.enableLandAcknowledgment || !settings.traditionalTerritory) {
      return '';
    }

    const acknowledgment = Object.values(territorialAcknowledgments).find(
      territory => territory.territory === settings.traditionalTerritory
    );

    return acknowledgment?.acknowledgment || 
      `We acknowledge that we are on the traditional territory of Indigenous peoples, the stewards of this land since time immemorial.`;
  };

  return (
    <IndigenousLanguageContext.Provider
      value={{
        settings,
        updateSetting,
        getLocalizedText,
        enableNationProfile,
        getLandAcknowledgment,
        isLoaded,
        selectedLanguage,
        setSelectedLanguage,
        enableSyllabics,
        setEnableSyllabics,
        culturalProtocols,
        setCulturalProtocols,
        territorialAcknowledgment,
        setTerritorialAcknowledgment,
        availableLanguages,
      }}
    >
      {children}
    </IndigenousLanguageContext.Provider>
  );
}

export function useIndigenousLanguage() {
  const context = useContext(IndigenousLanguageContext);
  if (!context) {
    throw new Error('useIndigenousLanguage must be used within IndigenousLanguageProvider');
  }
  return context;
}

// Helper hooks for common use cases
export function useLandAcknowledgment() {
  const { getLandAcknowledgment, settings } = useIndigenousLanguage();
  return settings.enableLandAcknowledgment ? getLandAcknowledgment() : null;
}

export function useTraditionalProtocols() {
  const { settings } = useIndigenousLanguage();
  return {
    shouldShowCeremonialConsiderations: settings.ceremonialConsiderations,
    shouldConsultElders: settings.elderConsultation,
    shouldUseCommunityProtocols: settings.communityProtocols,
    shouldUseHolisticApproach: settings.holisticWellnessApproach,
    shouldUseFamilyCenteredCare: settings.familyCenteredCare,
  };
}

export function useIndigenousLanguageFormat() {
  const { settings } = useIndigenousLanguage();
  return {
    useStorytellingFormat: settings.storytellingFormat,
    respectOralTradition: settings.oralTraditionRespect,
    useVisualCommunication: settings.visualCommunication,
    useCeremonialLanguage: settings.ceremonialLanguage,
    useSyllabics: settings.syllabicsEnabled,
  };
}
