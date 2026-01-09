# Code Patterns & Best Practices

## State Management with Zustand

### Creating Slices
```typescript
// Store slices organized by domain
interface AuthState {
  user: User | null;
  status: 'loading' | 'signedIn' | 'signedOut';
  signIn: (user: User) => void;
  signOut: () => void;
}

interface NotificationState {
  items: Notification[];
  unread: number;
  add: (item: Notification) => void;
  markRead: (id: string) => void;
}

// Single store combines all slices
const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  status: 'signedOut',
  signIn: (user) => set({ user, status: 'signedIn' }),
  
  // Notifications
  items: [],
  unread: 0,
  add: (item) => set((state) => ({
    items: [item, ...state.items],
    unread: state.unread + 1,
  })),
}));
```

### Using Selectors
```typescript
// Create selector hooks
const useAuth = () => useStore((state) => ({
  user: state.user,
  status: state.status,
  signIn: state.signIn,
  signOut: state.signOut,
}));

// Use in components
const MyComponent = () => {
  const { user, signOut } = useAuth();
  return <Text>{user?.name}</Text>;
};
```

### Persistence
```typescript
// Store persists automatically via middleware
const useStore = create<AppState>(
  persist(
    (set) => ({
      // state and actions
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## Form Validation with Zod

### Defining Schemas
```typescript
export const CampaignSchema = z.object({
  title: z.string()
    .min(5, 'Title must be 5+ chars')
    .max(200, 'Title must be ≤200 chars')
    .trim(),
  summary: z.string()
    .min(20, 'Summary must be 20+ chars')
    .max(5000)
    .transform(sanitizeText),
  target: z.string().optional(),
  goalCount: z.number().positive().optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;
```

### Using in Forms
```typescript
const MyForm = () => {
  const form = useFormValidation(CampaignSchema, {
    title: '',
    summary: '',
    target: '',
  });

  const handleSubmit = async () => {
    await form.handleSubmit(async (values) => {
      // values is type-safe Campaign
      await createCampaign(values);
    })();
  };

  return (
    <>
      <TextInput
        value={form.values.title}
        onChangeText={form.handleChange('title')}
        onBlur={form.handleBlur('title')}
      />
      {form.errors.title && (
        <Text>{form.errors.title[0]}</Text>
      )}
    </>
  );
};
```

## Component Memoization

### Basic Memoization
```typescript
interface ListItemProps {
  item: Campaign;
  onPress: () => void;
}

// ✅ Memoize to prevent re-renders
const ListItem = React.memo(({ item, onPress }: ListItemProps) => (
  <Pressable onPress={onPress}>
    <Text>{item.title}</Text>
  </Pressable>
));
```

### Custom Comparison
```typescript
// Custom memo with deep comparison
const ListItem = memoWithComparison(ListItemImpl, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title
  );
});
```

### useCallback for Handlers
```typescript
const MyList = ({ campaigns, onPress }) => {
  // ✅ Memoize callback so ListItem doesn't re-render
  const handlePress = useCallback(
    (id: string) => onPress(id),
    [onPress]
  );

  return (
    <FlatList
      data={campaigns}
      renderItem={({ item }) => (
        <ListItem
          item={item}
          onPress={() => handlePress(item.id)}
        />
      )}
    />
  );
};
```

### useMemo for Calculations
```typescript
const MyComponent = ({ items }) => {
  // ✅ Only recalculate when items change
  const sorted = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return <FlatList data={sorted} />;
};
```

## Loading States

### Basic Pattern
```typescript
const MyScreen = () => {
  const { loading, withLoading } = useLoading();
  const [data, setData] = useState([]);

  const loadData = async () => {
    await withLoading(async () => {
      const result = await fetchData();
      setData(result);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <FlatList
        data={Array(5).fill(null)}
        renderItem={() => <SkeletonCard height={120} />}
      />
    );
  }

  return <FlatList data={data} />;
};
```

### Advanced Pattern with Error Handling
```typescript
const { loading, withLoading, error, setError } = useLoading({
  timeout: 30000,
  onError: (err) => logError('load', err),
});

const load = async () => {
  setError(null);
  await withLoading(async () => {
    try {
      const data = await fetchAPI();
      setData(data);
    } catch (err) {
      throw new AppError(
        ErrorType.ServerError,
        'Failed to load data'
      );
    }
  });
};
```

## Firestore Pagination

### Query with Pagination
```typescript
const CampaignsScreen = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const unsubscribe = getCampaignsPaginated(
      20,
      { active: true, orderBy: 'createdAt' }
    );

    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    const more = await loadCampaignsPaginated(20);
    setCampaigns((prev) => [...prev, ...more]);
  };

  return (
    <FlatList
      data={campaigns}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

## Secure Storage

### Auth Token Storage
```typescript
import { saveAuthToken, getAuthToken } from '../services/secureStorage';

// Save token
const handleSignIn = async (credentials) => {
  const response = await authenticate(credentials);
  await saveAuthToken(response.token);
};

// Retrieve token
const getToken = async () => {
  return await getAuthToken();
};

// Clear on logout
const handleSignOut = async () => {
  await clearAuthToken();
};
```

### Encrypted Data Storage
```typescript
import { saveUserData, getUserData } from '../services/secureStorage';

// Save sensitive data
await saveUserData('user_preferences', {
  language: 'en',
  accessibility: true,
});

// Retrieve and decrypt
const prefs = await getUserData('user_preferences');
```

## Error Handling

### AppError Pattern
```typescript
try {
  const campaign = await getCampaign(id);
} catch (error: any) {
  if (error instanceof AppError) {
    // Handle specific error type
    if (error.type === ErrorType.NotFoundError) {
      showNotFound();
    } else if (error.type === ErrorType.PermissionError) {
      showPermissionDenied();
    }
  } else {
    // Unknown error
    logError('getCampaign', 'Unknown error', error);
  }
}
```

### Error Recovery
```typescript
const withErrorRecovery = async <T,>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logError('operation', 'Failed with recovery', error);
    return fallback;
  }
};

// Usage
const campaigns = await withErrorRecovery(
  () => getCampaigns(),
  [] // Return empty array on error
);
```

## Accessibility Patterns

### Screen Reader Announcements
```typescript
const MyComponent = () => {
  const { announce } = useA11y();

  useEffect(() => {
    announce('Campaign list loaded', 'polite');
  }, [campaigns]);

  return <View accessibilityLabel="Campaigns">{/* ... */}</View>;
};
```

### Focus Management
```typescript
const MyModal = () => {
  const focusRef = useRef(null);

  return (
    <FocusLock>
      <Modal>
        <View ref={focusRef} accessible>
          <Text>Modal Content</Text>
        </View>
      </Modal>
    </FocusLock>
  );
};
```

### Touch Target Size
```typescript
// ✅ Minimum 44x44pt for touch targets
<A11yPressable
  style={{ minWidth: 44, minHeight: 44 }}
  onPress={handlePress}
  accessibilityRole="button"
/>
```

## Feature Flags

### Using Features
```typescript
const MyComponent = () => {
  const collectiveEvidenceEnabled = useFeature(
    FeatureFlag.COLLECTIVE_EVIDENCE
  );

  if (!collectiveEvidenceEnabled) {
    return null; // Hidden for non-beta users
  }

  return <CollectiveEvidenceTab />;
};
```

### Rollout Control
```typescript
// 50% of beta testers see new UI
const newUIEnabled = useFeature(
  FeatureFlag.NEW_COMMUNITY_UI,
  { betaOnly: true, rolloutPercentage: 50 }
);
```

## Performance Monitoring

### Component Render Time
```typescript
const MyComponent = () => {
  // Warns if render time > 50ms
  useRenderPerformance('MyComponent', 50);

  return <View>Content</View>;
};
```

### Profiling Async Operations
```typescript
const result = useProfiler('fetch-campaigns', async () => {
  return await fetchCampaigns();
});
// Logs: "fetch-campaigns: 245ms"
```

## Testing Patterns

### Form Validation Test
```typescript
it('should validate campaign title', () => {
  const { result } = renderHook(() =>
    useFormValidation(CampaignSchema, {})
  );

  act(() => {
    result.current.handleChange('title')('bad');
  });

  expect(result.current.errors.title).toBeDefined();
});
```

### Firestore Query Test
```typescript
it('should paginate campaigns', async () => {
  const { unsubscribe, data } = await getPaginatedCampaigns(20);

  expect(data).toHaveLength(20);
  expect(unsubscribe).toBeDefined();
});
```

---

**Last Updated:** January 9, 2026  
**Version:** 1.0
