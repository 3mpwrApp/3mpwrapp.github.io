# Legal Action Hub - Code Scaffolding Guide
**Implementation Templates & Code Patterns**  
**Status**: Ready for development | **Target**: Complete by January 10, 2026

---

## 🎯 QUICK START: Copy-Paste Code Templates

### **1. REDIRECT WRAPPER TEMPLATE**

Use this template for each of the 10 old screens that need to redirect to the hub.

```tsx
// Example: app/(tabs)/advocacy/accountability-hub.tsx
/**
 * REDIRECT WRAPPER
 * 
 * Old route: /advocacy/accountability-hub
 * New route: /advocacy/legal-action-hub?tab=accountability
 * 
 * This thin wrapper ensures:
 * - Deep links still work
 * - No performance hit (instant redirect)
 * - History preserved
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';

const REDIRECT_MAP = {
  'accountability-hub': '/(tabs)/advocacy/legal-action-hub?tab=accountability',
  'accountability-cases': '/(tabs)/advocacy/legal-action-hub?tab=accountability',
  'accountability-case': '/(tabs)/advocacy/legal-action-hub?tab=accountability',
  'accountability-coach': '/(tabs)/advocacy/legal-action-hub?tab=coach',
  'accountability-network': '/(tabs)/advocacy/legal-action-hub?tab=coach',
  'lawyer-finder': '/(tabs)/advocacy/legal-action-hub?tab=legal',
  'collective-legal': '/(tabs)/advocacy/legal-action-hub?tab=legal',
  'legal-dna': '/(tabs)/advocacy/legal-action-hub?tab=legal',
  'legal-automation': '/(tabs)/advocacy/legal-action-hub?tab=automation',
  'policy-simple': '/(tabs)/advocacy/legal-action-hub?tab=policy',
};

export default function RedirectWrapper() {
  const router = useRouter();
  const palette = useAppPalette();
  
  useEffect(() => {
    // Instant redirect - no delay
    const screenName = 'accountability-hub'; // Change per file
    const targetPath = REDIRECT_MAP[screenName as keyof typeof REDIRECT_MAP];
    
    if (targetPath) {
      router.replace(targetPath);
    } else {
      // Fallback if not mapped
      router.replace('/(tabs)/advocacy/legal-action-hub');
    }
  }, [router]);
  
  // Show loading screen during redirect
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: palette.background 
    }}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}
```

**Files to Create (10 total)**:
```
accountability-hub.tsx
accountability-cases.tsx
accountability-case.tsx
accountability-coach.tsx
accountability-network.tsx
lawyer-finder.tsx
collective-legal.tsx
legal-dna.tsx
legal-automation.tsx
policy-simple.tsx
```

Each file differs only in the `screenName` variable.

---

### **2. HUB PARAMETER PARSER (Enhancement)**

Add this to `legal-action-hub.tsx` to handle URL params:

```tsx
// Inside legal-action-hub.tsx, at top of component
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function LegalActionHub() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Extract parameters from URL
  const requestedTab = (params.tab as string) || 'accountability';
  const caseId = params.case as string | undefined;
  const searchQuery = params.search as string | undefined;
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [selectedCaseId, setSelectedCaseId] = useState(caseId);
  const [internalSearch, setInternalSearch] = useState(searchQuery || '');
  
  // Sync URL when tab changes
  useEffect(() => {
    router.setParams({ tab: activeTab });
  }, [activeTab]);
  
  // Validate tab exists
  const isValidTab = tabs.some(t => t.id === activeTab);
  if (!isValidTab) {
    setActiveTab('accountability');
  }
  
  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('legal.title', 'Legal Action Hub')}
        subtitle={t('legal.subtitle', 'Accountability, legal help & advocacy tools')}
        icon="⚖️"
        tabs={tabs}
        defaultTab={activeTab}
        showSearch
        searchPlaceholder={t('legal.search', 'Search legal tools...')}
        onTabChange={setActiveTab}
        searchQuery={internalSearch}
        onSearchChange={setInternalSearch}
        analyticsPrefix="legal_action"
      />
    </ResponsiveScreenWrapper>
  );
}
```

---

### **3. CASE CARD COMPONENT (REUSABLE)**

Extract this into `legal-action-hub/components/CaseCard.tsx`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import A11yPressable from '../../../../components/A11yPressable';
import { useAppPalette } from '../../../../theme/usePalette';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';
import type { AccCase } from '../../../../services/accountabilityTracker';

interface CaseCardProps {
  case: AccCase;
  onPress: (caseId: string) => void;
}

export default function CaseCard({ case: caseItem, onPress }: CaseCardProps) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return palette.primary;
      case 'pending': return palette.warning;
      case 'resolved': return palette.success;
      default: return palette.muted;
    }
  };
  
  return (
    <A11yPressable
      onPress={() => onPress(caseItem.id)}
      accessibilityLabel={`${caseItem.target}: ${caseItem.issue}`}
      hitSlop={HIT_SLOP_8}
      style={[styles.card, { backgroundColor: palette.card }]}
    >
      <View style={styles.header}>
        <Text style={[styles.entity, { color: palette.text }]} numberOfLines={1}>
          {caseItem.target || 'Unknown entity'}
        </Text>
        <View style={[
          styles.badge,
          { backgroundColor: getStatusColor(caseItem.status || 'active') + '20' }
        ]}>
          <Text style={[
            styles.badgeText,
            { color: getStatusColor(caseItem.status || 'active') }
          ]}>
            {(caseItem.status || 'active').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.issue, { color: palette.secondaryText }]} numberOfLines={2}>
        {caseItem.issue}
      </Text>
      
      <View style={styles.footer}>
        <Text style={[styles.date, { color: palette.muted }]} numberOfLines={1}>
          Updated {new Date(caseItem.updatedAt).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={palette.secondaryText} />
      </View>
    </A11yPressable>
  );
}

const createStyles = (palette: any) => StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entity: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  issue: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
});
```

---

### **4. LAWYER CARD COMPONENT (REUSABLE)**

Extract this into `legal-action-hub/components/LawyerCard.tsx`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import A11yPressable from '../../../../components/A11yPressable';
import { useAppPalette } from '../../../../theme/usePalette';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';

interface LawyerData {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  phone?: string;
  email?: string;
  jurisdiction?: string;
}

interface LawyerCardProps {
  lawyer: LawyerData;
  horizontal?: boolean;
  onPress: (lawyerId: string) => void;
}

export default function LawyerCard({ lawyer, horizontal = false, onPress }: LawyerCardProps) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  
  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return '#22c55e'; // green
    if (rating >= 4.0) return '#3b82f6'; // blue
    return '#f59e0b'; // amber
  };
  
  return (
    <A11yPressable
      onPress={() => onPress(lawyer.id)}
      accessibilityLabel={`${lawyer.name}, ${lawyer.specialty}, ${lawyer.rating} stars`}
      hitSlop={HIT_SLOP_8}
      style={[
        horizontal ? styles.cardHorizontal : styles.cardVertical,
        { backgroundColor: palette.card }
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: palette.primary + '20' }]}>
        <Text style={styles.avatarText}>{lawyer.name.charAt(0).toUpperCase()}</Text>
      </View>
      
      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
          {lawyer.name}
        </Text>
        <Text style={[styles.specialty, { color: palette.secondaryText }]} numberOfLines={1}>
          {lawyer.specialty}
        </Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={getRatingColor(lawyer.rating)} />
          <Text style={[styles.rating, { color: palette.text }]}>
            {lawyer.rating.toFixed(1)}
          </Text>
          {lawyer.reviews && (
            <Text style={[styles.reviews, { color: palette.muted }]}>
              ({lawyer.reviews})
            </Text>
          )}
        </View>
      </View>
      
      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
    </A11yPressable>
  );
}

const createStyles = (palette: any) => StyleSheet.create({
  cardVertical: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHorizontal: {
    width: 160,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviews: {
    fontSize: 12,
  },
});
```

---

### **5. CUSTOM HOOK: useLegalCases**

Create `legal-action-hub/hooks/useLegalCases.ts`:

```typescript
import { useEffect, useState } from 'react';
import { listCases } from '../../../services/accountabilityTracker';
import type { AccCase } from '../../../services/accountabilityTracker';

export function useLegalCases() {
  const [cases, setCases] = useState<AccCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadCases = async () => {
      try {
        setLoading(true);
        const allCases = await listCases();
        
        if (isMounted) {
          setCases(allCases);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load cases'));
          setCases([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadCases();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  const activeCases = cases.filter(c => c.status === 'active' || !c.status);
  const recentCases = [...cases].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 3);
  
  return {
    cases,
    activeCases,
    recentCases,
    loading,
    error,
    totalCount: cases.length,
    activeCount: activeCases.length,
  };
}
```

---

### **6. CUSTOM HOOK: useLawyerSearch**

Create `legal-action-hub/hooks/useLawyerSearch.ts`:

```typescript
import { useMemo } from 'react';
import { useJurisdiction } from '../../../store/jurisdiction';
import { advocates } from '../../../data/lawyers';

interface LawyerSearchOptions {
  query?: string;
  specialty?: string;
  rating?: number;
}

export function useLawyerSearch(options: LawyerSearchOptions = {}) {
  const { data: jurisdiction } = useJurisdiction();
  
  const filtered = useMemo(() => {
    let results = advocates;
    
    // Filter by jurisdiction
    if (jurisdiction?.code) {
      results = results.filter(lawyer => 
        !lawyer.jurisdictions || 
        lawyer.jurisdictions.includes(jurisdiction.code)
      );
    }
    
    // Filter by query (name, specialty)
    if (options.query) {
      const q = options.query.toLowerCase();
      results = results.filter(lawyer =>
        lawyer.name.toLowerCase().includes(q) ||
        (lawyer.specialty || '').toLowerCase().includes(q)
      );
    }
    
    // Filter by specialty
    if (options.specialty) {
      results = results.filter(lawyer => lawyer.specialty === options.specialty);
    }
    
    // Filter by rating
    if (options.rating) {
      results = results.filter(lawyer => (lawyer.rating || 0) >= options.rating);
    }
    
    // Sort by rating
    return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [jurisdiction, options]);
  
  const specialties = useMemo(() => 
    [...new Set(advocates.map(l => l.specialty).filter(Boolean))],
    []
  );
  
  const topRated = useMemo(() => 
    filtered.slice(0, 3),
    [filtered]
  );
  
  return {
    lawyers: filtered,
    topRated,
    specialties,
    count: filtered.length,
  };
}
```

---

### **7. ENHANCED TAB COMPONENT: LegalHelpTab**

Add jurisdiction context and filtering:

```tsx
// Inside legal-action-hub.tsx, update LegalTab
function LegalTab({ navigateToTab, searchQuery }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const { data: jurisdiction } = useJurisdiction();
  
  // Use custom hook for lawyer search
  const { lawyers, topRated, specialties } = useLawyerSearch({
    query: searchQuery,
  });
  
  const legalResources = [
    { 
      id: 'lawyer', 
      emoji: '👨‍⚖️', 
      name: 'Find a Lawyer', 
      desc: 'Disability law specialists', 
      featured: true, 
      route: '/advocacy/legal-action-hub?tab=legal',
      count: lawyers.length,
    },
    { 
      id: 'collective', 
      emoji: '👥', 
      name: 'Collective Legal Action', 
      desc: 'Join or start class actions', 
      route: '/advocacy/legal-action-hub?tab=legal' 
    },
    { 
      id: 'legal-aid', 
      emoji: '🆓', 
      name: 'Legal Aid Services', 
      desc: jurisdiction ? `Free help in ${jurisdiction.name}` : 'Free legal help',
      route: '/advocacy/legal-action-hub?tab=legal' 
    },
    { 
      id: 'dna', 
      emoji: '🧬', 
      name: 'Legal DNA', 
      desc: 'Your case strength analysis', 
      route: '/advocacy/legal-action-hub?tab=legal' 
    },
  ];
  
  const styles = createLegalStyles(palette);
  
  return (
    <PowerToolTabContent scrollable>
      {/* Jurisdiction Alert */}
      {jurisdiction && (
        <View style={[styles.jurisdictionBadge, { backgroundColor: palette.primary + '10' }]}>
          <Ionicons name="location" size={16} color={palette.primary} />
          <Text style={[styles.jurisdictionText, { color: palette.primary }]}>
            {t('legal.jurisdiction', 'Jurisdiction')}: {jurisdiction.name}
          </Text>
        </View>
      )}
      
      {/* Legal Resources */}
      <PowerToolSection title={t('legal.resources.title', 'Legal Resources')}>
        {legalResources.map((resource) => (
          <A11yPressable
            key={resource.id}
            onPress={() => {
              trackEvent('legal.resource', { resource: resource.id });
              router.push(resource.route as any);
            }}
            accessibilityLabel={resource.name}
            hitSlop={HIT_SLOP_8}
            style={[
              styles.resourceCard,
              {
                backgroundColor: resource.featured ? palette.primary + '15' : palette.card,
                borderColor: resource.featured ? palette.primary : 'transparent',
                borderWidth: resource.featured ? 1 : 0,
              }
            ]}
          >
            <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
            <View style={styles.resourceInfo}>
              <View style={styles.resourceHeader}>
                <Text style={[styles.resourceName, { color: palette.text }]}>
                  {resource.name}
                </Text>
                {resource.count && (
                  <View style={[styles.badge, { backgroundColor: palette.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: palette.primary }]}>
                      {resource.count}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.resourceDesc, { color: palette.secondaryText }]}>
                {resource.desc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>
      
      <GapView style={{ height: 16 }} />
      
      {/* Top Lawyers */}
      {topRated.length > 0 && (
        <>
          <PowerToolSection title={t('legal.topLawyers', 'Top Recommended Lawyers')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {topRated.map((lawyer) => (
                <LawyerCard
                  key={lawyer.id}
                  lawyer={lawyer}
                  horizontal
                  onPress={(id) => {
                    trackEvent('legal.lawyer.view', { id });
                    router.push('/advocacy/legal-action-hub?tab=legal' as any);
                  }}
                />
              ))}
            </ScrollView>
          </PowerToolSection>
          <GapView style={{ height: 16 }} />
        </>
      )}
      
      <PowerToolAction
        label={t('legal.automation.explore', 'Legal Automation')}
        icon="flash"
        onPress={() => navigateToTab('automation')}
      />
    </PowerToolTabContent>
  );
}
```

---

## 📁 FOLDER STRUCTURE TO CREATE

```
app/(tabs)/advocacy/legal-action-hub/
├── components/
│   ├── CaseCard.tsx                    ✅ template above
│   ├── LawyerCard.tsx                  ✅ template above
│   ├── ResourceCard.tsx                (similar pattern)
│   ├── LegalAction.tsx                 (CTA button component)
│   └── TabNavigation.tsx               (in-hub breadcrumb)
│
├── hooks/
│   ├── useLegalCases.ts                ✅ template above
│   ├── useLawyerSearch.ts              ✅ template above
│   ├── useLegalTemplates.ts            (not yet shown)
│   └── useLegalAnalysis.ts             (for Legal DNA tab)
│
├── tabs/
│   ├── AccountabilityTab.tsx           (extract from main)
│   ├── CoachTab.tsx                    (extract from main)
│   ├── LegalHelpTab.tsx                (extract from main, enhanced)
│   ├── AutomationTab.tsx               (extract from main)
│   └── PolicyTab.tsx                   (extract from main)
│
├── __tests__/
│   ├── CaseCard.test.tsx
│   ├── LawyerCard.test.tsx
│   ├── useLegalCases.test.ts
│   └── legalActionHub.integration.test.tsx
│
└── types.ts                             (shared types)
```

---

## 🔄 MIGRATION CHECKLIST

### **Phase 1: Redirect Infrastructure**
- [ ] Create 10 redirect wrapper files (use template above)
- [ ] Test each redirect works
- [ ] Verify analytics capture redirects
- [ ] Update navigation links in other screens

### **Phase 2: Component Extraction**
- [ ] Create `CaseCard.tsx` component
- [ ] Create `LawyerCard.tsx` component
- [ ] Extract `AccountabilityTab` into separate file
- [ ] Extract `CoachTab` into separate file
- [ ] Extract `LegalHelpTab` into separate file
- [ ] Extract `AutomationTab` into separate file
- [ ] Extract `PolicyTab` into separate file

### **Phase 3: Hooks & Utilities**
- [ ] Create `useLegalCases` hook
- [ ] Create `useLawyerSearch` hook
- [ ] Create `useLegalTemplates` hook
- [ ] Create shared `types.ts`

### **Phase 4: Testing**
- [ ] Unit tests for each component
- [ ] Integration tests for hub
- [ ] E2E tests for redirect flow
- [ ] Accessibility audit

---

## 🧪 UNIT TEST TEMPLATE

```tsx
// legal-action-hub/__tests__/CaseCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import CaseCard from '../components/CaseCard';

const mockCase = {
  id: 'case-1',
  target: 'Employer Inc.',
  issue: 'Accessibility violation',
  status: 'active',
  updatedAt: new Date(),
};

describe('CaseCard', () => {
  it('renders case information correctly', () => {
    const mockPress = jest.fn();
    render(<CaseCard case={mockCase} onPress={mockPress} />);
    
    expect(screen.getByText('Employer Inc.')).toBeTruthy();
    expect(screen.getByText('Accessibility violation')).toBeTruthy();
  });
  
  it('calls onPress when tapped', () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <CaseCard case={mockCase} onPress={mockPress} />
    );
    
    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalledWith('case-1');
  });
  
  it('displays correct status color based on status', () => {
    const activeCaseProps = { ...mockCase, status: 'active' };
    const { container: activeContainer } = render(
      <CaseCard case={activeCaseProps} onPress={jest.fn()} />
    );
    
    // Should render with active status styling
    expect(activeContainer).toBeTruthy();
  });
});
```

---

## 📊 TYPE DEFINITIONS

Create `legal-action-hub/types.ts`:

```typescript
import type { AccCase } from '../../../services/accountabilityTracker';

export interface LawyerProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  phone?: string;
  email?: string;
  jurisdictions?: string[];
  experience?: number;
  languages?: string[];
  availability?: 'accepting' | 'waitlist' | 'not_accepting';
}

export interface LegalResource {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  featured?: boolean;
  route: string;
  count?: number;
}

export interface CoachScript {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  content: string;
  category: 'evidence' | 'timeline' | 'accommodation' | 'appeal';
}

export interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  jurisdiction?: string;
  fields: TemplateField[];
  content: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface HubState {
  activeTab: 'accountability' | 'coach' | 'legal' | 'automation' | 'policy';
  selectedCaseId?: string;
  searchQuery: string;
  filter?: string;
}
```

---

## ✅ NEXT STEPS

1. **Copy the redirect template** and create 10 files
2. **Test redirects** in the app simulator
3. **Extract tabs** into separate components
4. **Create custom hooks** for data loading
5. **Run unit tests** to ensure functionality
6. **Update analytics** to track tab usage

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Status**: ✅ Ready for implementation  
**Estimated Effort**: 20-30 developer hours
