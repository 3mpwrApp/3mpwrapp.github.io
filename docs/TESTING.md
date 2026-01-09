# Testing & Quality Assurance

## Testing Strategy

### Test Pyramid

```
         ┌─────────────────┐
         │   E2E Tests     │  ← Test critical user flows
         │  (5-10% tests)  │     Maestro/Espresso/Detox
         ├─────────────────┤
         │ Integration     │  ← Test components + services
         │  Tests          │     Jest + Testing Library
         │ (20-30% tests)  │
         ├─────────────────┤
         │  Unit Tests     │  ← Test individual functions
         │ (60-70% tests)  │    Jest
         └─────────────────┘
```

### Coverage Targets

| Type | Target | Current |
|------|--------|---------|
| Unit Tests | 80% | 85% ✅ |
| Integration Tests | 60% | 65% ✅ |
| E2E Tests | Critical flows | 100% ✅ |
| Overall | 70% | 78% ✅ |

## Unit Testing

### Running Tests

**All Tests**
```bash
npm test
```

**Watch Mode** (auto-rerun on changes)
```bash
npm run test:watch
```

**Specific File**
```bash
npm test -- validation.test.ts
```

**Coverage Report**
```bash
npm test -- --coverage
```

### Test Examples

**Validation (Zod)**
```typescript
describe('CampaignSchema', () => {
  it('should validate campaign with valid data', () => {
    const data = {
      title: 'Climate Action',
      summary: 'Help us fight climate change with collective evidence',
      target: 'Government',
    };
    
    const result = CampaignSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject campaign with missing title', () => {
    const data = {
      summary: 'Help us fight climate change',
    };
    
    const result = CampaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe('title');
  });

  it('should sanitize HTML in summary', () => {
    const data = {
      title: 'Campaign',
      summary: '<img src=x onerror=alert(1)>Content</img>',
    };
    
    const result = CampaignSchema.parse(data);
    expect(result.summary).toBe('Content');
    expect(result.summary).not.toContain('img');
  });
});
```

**Encryption**
```typescript
describe('Encryption', () => {
  const key = 'my-secret-key-32-chars-long!!!!!!';
  const plaintext = 'sensitive data';

  it('should encrypt and decrypt data', () => {
    const encrypted = encryptData(plaintext, key);
    const decrypted = decryptData(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should fail with wrong key', () => {
    const encrypted = encryptData(plaintext, key);
    const wrongKey = 'wrong-key!!!!!!!!!!!!!!!!!!!!!!!!!';
    
    expect(() => decryptData(encrypted, wrongKey)).toThrow();
  });
});
```

### Jest Configuration

**jest.config.js**
```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
};
```

## Integration Testing

### Testing Components with Services

```typescript
describe('CampaignScreen', () => {
  it('should load and display campaigns', async () => {
    const mockCampaigns = [
      { id: '1', title: 'Climate Action' },
      { id: '2', title: 'Clean Water' },
    ];

    jest
      .spyOn(firestoreService, 'getCampaigns')
      .mockResolvedValue(mockCampaigns);

    render(<CampaignScreen />);

    await waitFor(() => {
      expect(screen.getByText('Climate Action')).toBeOnTheScreen();
    });
  });

  it('should handle loading state', () => {
    jest
      .spyOn(firestoreService, 'getCampaigns')
      .mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CampaignScreen />);

    expect(screen.getByTestId('skeleton-loader')).toBeOnTheScreen();
  });

  it('should handle errors gracefully', async () => {
    jest
      .spyOn(firestoreService, 'getCampaigns')
      .mockRejectedValue(new Error('Network error'));

    render(<CampaignScreen />);

    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeOnTheScreen();
    });
  });
});
```

## E2E Testing (Maestro)

### Maestro Flows

**6 Critical User Flows Tested**

1. **auth-flow.yaml** - Sign in/out
2. **campaigns-flow.yaml** - Browse campaigns
3. **community-flow.yaml** - Post messages
4. **wellness-flow.yaml** - Log mood
5. **settings-flow.yaml** - Change settings
6. **search-flow.yaml** - Search functionality

### Running Maestro Tests

**All Tests**
```bash
npm run test:e2e:maestro
```

**Specific Test**
```bash
maestro test e2e/maestro/auth-flow.yaml
```

**With Debug**
```bash
maestro test e2e/maestro/auth-flow.yaml --debug
```

### Example Maestro Test

**e2e/maestro/wellness-flow.yaml**
```yaml
---
appId: com.example.empowrapp
launchApp:
  wait:
    timeout: 3000

---
# Test: User logs mood
- tapOn:
    id: wellness_tab

- waitForElement:
    id: mood_selector
    timeout: 2000

- tapOn:
    id: mood_happy

- assertVisible:
    text: Happy

- tapOn:
    id: mood_save

- assertVisible:
    text: Mood saved

- appKill:
    bundle: com.example.empowrapp
```

## Accessibility Testing

### Automated WCAG Audit

```bash
# Run WCAG 2.2 AAA audit
npm run wcag:aaa

# Strict mode (warnings fail)
npm run wcag:aaa:strict
```

### Manual Accessibility Testing

**Screen Reader Testing (iOS)**
```
1. Settings → Accessibility → VoiceOver → On
2. Navigate with 2-finger gestures
3. Verify all elements announced
4. Check focus order makes sense
```

**Screen Reader Testing (Android)**
```
1. Settings → Accessibility → TalkBack → On
2. Navigate with 2-finger swipes
3. Verify all elements announced
4. Check focus order makes sense
```

**Color Contrast Testing**
```typescript
import { checkContrast } from '../utils/accessibility';

it('should have sufficient color contrast', () => {
  const { contrastRatio } = checkContrast(
    '#000000', // text color
    '#FFFFFF'  // background
  );
  
  expect(contrastRatio).toBeGreaterThanOrEqual(7);
});
```

## Performance Testing

### Stress Testing

```bash
# Run with extended timeout (120s)
npm run test:stress
```

### Load Testing

```typescript
describe('Performance', () => {
  it('should load 1000 items in < 5s', async () => {
    const start = performance.now();
    const items = await loadLargeDataset(1000);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(5000);
  });

  it('should handle rapid list scrolling', () => {
    const { rerender } = render(<LargeList />);
    
    // Simulate rapid scroll
    for (let i = 0; i < 100; i++) {
      rerender(<LargeList offset={i * 20} />);
    }
    
    // Should not crash or freeze
  });
});
```

### Memory Leak Testing

```typescript
it('should not leak memory on mount/unmount', () => {
  const { unmount, rerender } = render(<MyComponent />);
  
  const initialMemory = getMemoryUsage();
  
  // Mount/unmount cycle 10 times
  for (let i = 0; i < 10; i++) {
    rerender(<MyComponent key={i} />);
    unmount();
  }
  
  const finalMemory = getMemoryUsage();
  const increase = finalMemory - initialMemory;
  
  // Memory increase should be minimal
  expect(increase).toBeLessThan(1000000); // < 1MB
});
```

## Continuous Integration

### GitHub Actions

**Run on Every Commit**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run typecheck:strict
```

### Pre-Commit Hooks

**Prevent Bad Code**
```bash
# Install husky
npm install husky --save-dev

# Add pre-commit hook
echo "npm run lint && npm test" > .husky/pre-commit
chmod +x .husky/pre-commit
```

## Quality Metrics

### Code Coverage

**Target: 70%+**

```bash
npm test -- --coverage

# Output
File                  | % Statements | % Branch | % Functions | % Lines
─────────────────────────────────────────────────────────────────────────
All files             |       78     |   72     |     75      |   78
 types/validation.ts  |       95     |   90     |     100     |   95
 utils/encryption.ts  |       88     |   85     |     90      |   88
 services/firestore   |       75     |   70     |     80      |   75
```

### Linting

```bash
npm run lint

# Should output 0 errors, <5 warnings
```

### Type Checking

```bash
npm run typecheck:strict

# Should show 0 errors
```

## Test Plan Template

### New Feature Test Plan

```markdown
## Feature: [Name]

### Unit Tests
- [ ] Valid input accepted
- [ ] Invalid input rejected
- [ ] Edge cases handled
- [ ] Error states handled

### Integration Tests
- [ ] Works with real Firestore data
- [ ] Handles network errors
- [ ] Shows loading states
- [ ] Shows error messages

### E2E Tests
- [ ] Happy path works
- [ ] Error handling visible to user
- [ ] Accessibility verified
- [ ] Performance acceptable

### Manual Testing
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works in web
- [ ] Works offline (if applicable)
```

## Debugging Tests

### Common Issues

**Test Timeout**
```javascript
// Increase timeout
jest.setTimeout(10000); // 10 seconds

// Or per test
it('should load large dataset', async () => {
  // test code
}, 10000);
```

**Flaky Tests**
```javascript
// Add retry
jest.retryTimes(3);

// Or mock better
jest.useFakeTimers();
jest.runAllTimers();
jest.useRealTimers();
```

**Debugging**
```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Or use debugger
it('should work', () => {
  debugger; // Will pause here
  // test code
});
```

---

**Last Updated:** January 9, 2026  
**Status:** Production-Ready
