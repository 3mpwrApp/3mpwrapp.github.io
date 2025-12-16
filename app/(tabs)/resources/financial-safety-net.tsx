import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { GapView } from "../../../components/GapView";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

async function copyToClipboard(text: string) {
  try {
    const mod = await import("expo-clipboard");
    await mod.setStringAsync(text);
  } catch {
    Alert.alert(
      "Clipboard unavailable",
      "Copy failed because the dev client doesn’t include expo-clipboard. Rebuild the native app or open in Expo Go."
    );
  }
}
// Tab Navigation Component
function TabNav({ activeTab, onTabChange, palette }: { 
  activeTab: number; 
  onTabChange: (tab: number) => void; 
  palette: ReturnType<typeof useAppPalette>;
}) {
  const tabs = [
    { id: 1, label: "📋 Situation", short: "1" },
    { id: 2, label: "📅 Plan", short: "2" },
    { id: 3, label: "💰 Budget", short: "3" },
  ];
  
  return (
    <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
      {tabs.map((tab) => (
        <A11yPressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          accessibilityLabel={`Go to ${tab.label}`}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.id }}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRadius: 8,
            backgroundColor: activeTab === tab.id ? palette.primary : palette.surface,
            borderWidth: 1,
            borderColor: activeTab === tab.id ? palette.primary : palette.muted,
            alignItems: "center",
          }}
        >
          <Text style={{ 
            color: activeTab === tab.id ? palette.onPrimary : palette.text, 
            fontWeight: "600",
            fontSize: 13,
          }}>
            {tab.label}
          </Text>
        </A11yPressable>
      ))}
    </View>
  );
}

// Custom expense type
interface CustomExpense {
  id: string;
  name: string;
  amount: string;
}
export default function FinancialSafetyNetNavigator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Financial Safety Net Navigator");
  useFocusOnRefOnMount(titleRef);

  const [step, setStep] = React.useState(1);
  const [employed, setEmployed] = React.useState<"yes" | "no" | "casual" | "unknown">("unknown");
  const [workRelated, setWorkRelated] = React.useState<"yes" | "no" | "unknown">("unknown");
  const [province, setProvince] = React.useState<string>("");
  const [lastDay, setLastDay] = React.useState<string>("");
  const [hasBenefits, setHasBenefits] = React.useState<string>("");
  const [summary, setSummary] = React.useState<string>("");

  // Budget calculator state (Step 3)
  const [monthlyIncome, setMonthlyIncome] = React.useState<string>("");
  const [selectedProgram, setSelectedProgram] = React.useState<string>("");
  const [rent, setRent] = React.useState<string>("");
  const [utilities, setUtilities] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [transit, setTransit] = React.useState<string>("");
  const [medications, setMedications] = React.useState<string>("");
  const [otherFixed, setOtherFixed] = React.useState<string>("");
  const [customExpenses, setCustomExpenses] = React.useState<CustomExpense[]>([]);
  const [newExpenseName, setNewExpenseName] = React.useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = React.useState<string>("");
  const [budgetResult, setBudgetResult] = React.useState<{
    remaining: number;
    dailyGroceries: number;
    weeklyGroceries: number;
    fixedExpenses: number;
  } | null>(null);

  // Add a custom expense
  const addCustomExpense = () => {
    if (!newExpenseName.trim()) {
      Alert.alert("Name required", "Please enter a name for the expense.");
      return;
    }
    const expense: CustomExpense = {
      id: Date.now().toString(),
      name: newExpenseName.trim(),
      amount: newExpenseAmount || "0",
    };
    setCustomExpenses([...customExpenses, expense]);
    setNewExpenseName("");
    setNewExpenseAmount("");
  };

  // Remove a custom expense
  const removeCustomExpense = (id: string) => {
    setCustomExpenses(customExpenses.filter(e => e.id !== id));
  };

  // Update a custom expense amount
  const updateCustomExpenseAmount = (id: string, amount: string) => {
    setCustomExpenses(customExpenses.map(e => e.id === id ? { ...e, amount } : e));
  };

  // Canadian disability benefit presets (2024-2025 rates, approximate)
  // These are rough monthly maximums - actual amounts vary by situation
  const BENEFIT_PRESETS: { id: string; label: string; province?: string; amount: number; note: string }[] = [
    // Federal Programs
    { id: "cpp-d", label: "CPP Disability", amount: 1606, note: "Max $1,606.78/mo (2024)" },
    { id: "cpp-d-child", label: "CPP-D + Child Benefit", amount: 1900, note: "CPP-D + approx child portion" },
    { id: "oas-gis", label: "OAS + GIS (65+)", amount: 1800, note: "Combined for single, low income" },
    
    // Provincial Programs
    { id: "odsp-single", label: "ODSP (ON) - Single", province: "ON", amount: 1308, note: "$1,308/mo (2024)" },
    { id: "odsp-couple", label: "ODSP (ON) - Couple", province: "ON", amount: 1981, note: "$1,981/mo (2024)" },
    { id: "aish-single", label: "AISH (AB) - Single", province: "AB", amount: 1863, note: "$1,863/mo (2024)" },
    { id: "aish-couple", label: "AISH (AB) - Couple", province: "AB", amount: 2583, note: "$2,583/mo (2024)" },
    { id: "pwd-single", label: "PWD (BC) - Single", province: "BC", amount: 1483, note: "$1,483.50/mo (2024)" },
    { id: "said-single", label: "SAID (SK) - Single", province: "SK", amount: 1200, note: "~$1,200/mo varies" },
    { id: "eia-single", label: "EIA-Disability (MB)", province: "MB", amount: 1200, note: "~$1,200/mo varies" },
    { id: "nb-single", label: "NB Disability (NB)", province: "NB", amount: 950, note: "~$950/mo varies" },
    { id: "ns-single", label: "NS Disability (NS)", province: "NS", amount: 950, note: "~$950/mo varies" },
    
    // Combined scenarios
    { id: "cpp-odsp", label: "CPP-D + ODSP top-up (ON)", province: "ON", amount: 1700, note: "CPP-D with ODSP supplement" },
    { id: "cpp-aish", label: "CPP-D + AISH (AB)", province: "AB", amount: 1863, note: "AISH claws back CPP-D" },
    { id: "custom", label: "Enter custom amount", amount: 0, note: "" },
  ];

  const selectBenefitProgram = (programId: string) => {
    setSelectedProgram(programId);
    const preset = BENEFIT_PRESETS.find(p => p.id === programId);
    if (preset && preset.amount > 0) {
      setMonthlyIncome(preset.amount.toString());
    }
  };

  const calculateBudget = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const customTotal = customExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const fixedExpenses = 
      (parseFloat(rent) || 0) +
      (parseFloat(utilities) || 0) +
      (parseFloat(phone) || 0) +
      (parseFloat(transit) || 0) +
      (parseFloat(medications) || 0) +
      (parseFloat(otherFixed) || 0) +
      customTotal;
    
    const remaining = income - fixedExpenses;
    const dailyGroceries = remaining / 30;
    const weeklyGroceries = remaining / 4;
    
    setBudgetResult({
      remaining,
      dailyGroceries,
      weeklyGroceries,
      fixedExpenses,
    });
  };

  const parseDate = (s: string) => {
    const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(s);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  };
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const computePlan = () => {
    const parts: string[] = [];
    const last = parseDate(lastDay);
    const bullets: string[] = [];
    if (workRelated === "yes") {
      bullets.push("File Workers’ Compensation claim immediately (work-related injury/illness).");
    } else if (workRelated === "no") {
      bullets.push("Consider EI Sickness for up to 26 weeks.");
    } else {
      bullets.push("Clarify if the condition is work-related; this affects first coverage.");
    }
    bullets.push("Evaluate CPP‑Disability if prolonged/severe disability is expected.");
    bullets.push("Check provincial disability supports (e.g., ODSP/AISH/SAID) for longer-term help.");
    if (hasBenefits.trim()) bullets.push(`Already receiving: ${hasBenefits}. Confirm how offsets apply.`);

    const dates: string[] = [];
    if (last) {
      const eiEnd = addDays(last, 26 * 7);
      dates.push(`EI Sickness potential end: ${fmt(eiEnd)}`);
      const wlReport = addDays(last, 3);
      dates.push(`Workers’ Comp incident reporting window target: ${fmt(wlReport)} (check province).`);
    }
    if (province) bullets.push(`Province: ${province} — verify local rules.`);

    parts.push("Recommended path:");
    parts.push(...bullets.map((b) => `• ${b}`));
    if (dates.length) {
      parts.push("Key dates:");
      parts.push(...dates.map((d) => `• ${d}`));
    }
    const out = parts.join("\n");
    setSummary(out);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Financial Safety Net Navigator
      </Text>
      <DisclaimerBanner type="financial" compact={true} />
      <Text style={styles.subtitle}>
        Step-by-step guidance to combine Workers’ Comp, CPP‑D, ODSP/provincial supports, and EI without overlap penalties.
        This is a planning tool — verify specifics with official program rules.
      </Text>
      {/* Tab Navigation - jump to any step directly */}
      <TabNav activeTab={step} onTabChange={setStep} palette={palette} />
      {step === 1 && (
        <Step n={1} title="Your situation">
          <Text style={styles.text}>Employment status</Text>
          <RowChips value={employed} onChange={setEmployed} options={["yes", "no", "casual", "unknown"]} />
          <Text style={styles.text}>Is it work-related?</Text>
          <RowChips value={workRelated} onChange={setWorkRelated} options={["yes", "no", "unknown"]} />
          <Text style={styles.text}>Province/Territory (e.g., ON, BC)</Text>
          <TextInput value={province} onChangeText={setProvince} placeholder="ON" style={styles.input} autoCapitalize="characters" />
          <Text style={styles.text}>Last day worked (YYYY-MM-DD)</Text>
          <TextInput value={lastDay} onChangeText={setLastDay} placeholder="2025-09-01" style={styles.input} />
          <Text style={styles.text}>Currently receiving benefits (optional)</Text>
          <TextInput value={hasBenefits} onChangeText={setHasBenefits} placeholder="e.g., EI Sickness" style={styles.input} />
          <NavButtons onNext={() => setStep(2)} />
        </Step>
      )}

      {step === 2 && (
        <Step n={2} title="Plan & dates">
          <Text style={styles.text}>We’ll draft a suggested order and dates from your info.</Text>
          <A11yPressable onPress={computePlan} accessibilityLabel="Compute plan" style={styles.cta}>
            <Text style={styles.ctaText}>Compute Plan</Text>
          </A11yPressable>
          {!!summary && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.text, { fontWeight: "700" }]}>Draft plan</Text>
              <Text style={styles.text}>{summary}</Text>
              <View style={{ height: 8 }} />
              <A11yPressable onPress={() => copyToClipboard(summary)} accessibilityLabel="Copy to clipboard" style={styles.secondary}>
                <Text style={{ color: palette.text, fontWeight: "700" }}>Copy to clipboard</Text>
              </A11yPressable>
            </View>
          )}
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Step>
      )}

      {step === 3 && (
        <Step n={3} title="Budget Calculator">
          <Text style={[styles.text, { marginBottom: 8 }]}>
            Track your disability income and expenses. See how much you have left for groceries and essentials each month.
          </Text>

          {/* Income Program Selection */}
          <Text style={[styles.text, { fontWeight: "700", marginTop: 8 }]}>💵 Select your income program:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            <GapView gap={8} style={{ flexDirection: "row" }}>
              {BENEFIT_PRESETS.filter(p => !p.province || p.province === province.toUpperCase() || province === "").slice(0, 8).map((preset) => (
                <A11yPressable
                  key={preset.id}
                  onPress={() => selectBenefitProgram(preset.id)}
                  accessibilityLabel={`${preset.label}: ${preset.note}`}
                  style={{
                    borderWidth: 1,
                    borderColor: selectedProgram === preset.id ? palette.primary : palette.muted,
                    backgroundColor: selectedProgram === preset.id ? palette.primary : "transparent",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    minWidth: 100,
                  }}
                >
                  <Text style={{ color: selectedProgram === preset.id ? palette.onPrimary : palette.text, fontWeight: "600", fontSize: 12 }}>
                    {preset.label}
                  </Text>
                  {preset.amount > 0 && (
                    <Text style={{ color: selectedProgram === preset.id ? palette.onPrimary : palette.textSecondary, fontSize: 11 }}>
                      ${preset.amount}/mo
                    </Text>
                  )}
                </A11yPressable>
              ))}
            </GapView>
          </ScrollView>

          <Text style={styles.text}>Monthly income ($)</Text>
          <TextInput
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            placeholder="e.g., 1308"
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Monthly income in dollars"
          />

          <Text style={[styles.text, { fontWeight: "700", marginTop: 12 }]}>🏠 Fixed Monthly Expenses:</Text>
          
          <Text style={styles.text}>Rent / Mortgage ($)</Text>
          <TextInput value={rent} onChangeText={setRent} placeholder="e.g., 800" style={styles.input} keyboardType="numeric" />
          
          <Text style={styles.text}>Utilities (hydro, heat, water) ($)</Text>
          <TextInput value={utilities} onChangeText={setUtilities} placeholder="e.g., 100" style={styles.input} keyboardType="numeric" />
          
          <Text style={styles.text}>Phone / Internet ($)</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="e.g., 60" style={styles.input} keyboardType="numeric" />
          
          <Text style={styles.text}>Transit / Transportation ($)</Text>
          <TextInput value={transit} onChangeText={setTransit} placeholder="e.g., 50" style={styles.input} keyboardType="numeric" />
          
          <Text style={styles.text}>Medications / Medical ($)</Text>
          <TextInput value={medications} onChangeText={setMedications} placeholder="e.g., 30" style={styles.input} keyboardType="numeric" />
          
          <Text style={styles.text}>Other fixed expenses ($)</Text>
          <TextInput value={otherFixed} onChangeText={setOtherFixed} placeholder="e.g., 50" style={styles.input} keyboardType="numeric" />

          {/* Custom Expenses Section */}
          <Text style={[styles.text, { fontWeight: "700", marginTop: 12 }]}>➕ Custom Expenses:</Text>
          <Text style={[styles.text, { fontSize: 12, opacity: 0.8, marginBottom: 8 }]}>
            Add your own expenses like insurance, subscriptions, pet care, debt payments, etc.
          </Text>

          {/* List existing custom expenses */}
          {customExpenses.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {customExpenses.map((expense) => (
                <View 
                  key={expense.id} 
                  style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    marginBottom: 8,
                    backgroundColor: palette.surface,
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: palette.muted,
                  }}
                >
                  <Text style={[styles.text, { flex: 1, marginBottom: 0 }]}>{expense.name}</Text>
                  <TextInput
                    value={expense.amount}
                    onChangeText={(val) => updateCustomExpenseAmount(expense.id, val)}
                    placeholder="0"
                    style={[styles.input, { width: 80, marginBottom: 0, marginRight: 8 }]}
                    keyboardType="numeric"
                    accessibilityLabel={`Amount for ${expense.name}`}
                  />
                  <A11yPressable
                    onPress={() => removeCustomExpense(expense.id)}
                    accessibilityLabel={`Remove ${expense.name}`}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: palette.error, fontSize: 18 }}>✕</Text>
                  </A11yPressable>
                </View>
              ))}
            </View>
          )}

          {/* Add new custom expense */}
          <View style={{ 
            flexDirection: "row", 
            alignItems: "flex-end", 
            gap: 8,
            marginBottom: 12,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.text, { fontSize: 12 }]}>Expense name</Text>
              <TextInput
                value={newExpenseName}
                onChangeText={setNewExpenseName}
                placeholder="e.g., Pet food"
                style={styles.input}
                accessibilityLabel="New expense name"
              />
            </View>
            <View style={{ width: 80 }}>
              <Text style={[styles.text, { fontSize: 12 }]}>Amount ($)</Text>
              <TextInput
                value={newExpenseAmount}
                onChangeText={setNewExpenseAmount}
                placeholder="50"
                style={styles.input}
                keyboardType="numeric"
                accessibilityLabel="New expense amount"
              />
            </View>
            <A11yPressable
              onPress={addCustomExpense}
              accessibilityLabel="Add custom expense"
              style={{
                backgroundColor: palette.primary,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: "600" }}>Add</Text>
            </A11yPressable>
          </View>

          <View style={{ height: 12 }} />
          <A11yPressable onPress={calculateBudget} accessibilityLabel="Calculate remaining budget" style={styles.cta}>
            <Text style={styles.ctaText}>Calculate Budget</Text>
          </A11yPressable>

          {budgetResult && (
            <View style={{ marginTop: 16, backgroundColor: palette.card, padding: 16, borderRadius: 12 }}>
              <Text style={[styles.text, { fontWeight: "700", fontSize: 16, marginBottom: 8 }]}>📊 Your Budget Breakdown</Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={styles.text}>Total Income:</Text>
                <Text style={[styles.text, { fontWeight: "600" }]}>${parseFloat(monthlyIncome) || 0}</Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={styles.text}>Fixed Expenses:</Text>
                <Text style={[styles.text, { fontWeight: "600", color: palette.error }]}>-${budgetResult.fixedExpenses.toFixed(2)}</Text>
              </View>
              
              <View style={{ height: 1, backgroundColor: palette.muted, marginVertical: 8 }} />
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={[styles.text, { fontWeight: "700" }]}>Remaining for Groceries & Essentials:</Text>
                <Text style={[styles.text, { fontWeight: "700", color: budgetResult.remaining >= 0 ? palette.success : palette.error }]}>
                  ${budgetResult.remaining.toFixed(2)}
                </Text>
              </View>

              <View style={{ backgroundColor: palette.info + "22", padding: 12, borderRadius: 8, marginTop: 8 }}>
                <Text style={[styles.text, { fontWeight: "600", marginBottom: 4 }]}>💡 Budget Tips:</Text>
                <Text style={styles.text}>• Weekly grocery budget: ~${budgetResult.weeklyGroceries.toFixed(2)}</Text>
                <Text style={styles.text}>• Daily spending limit: ~${budgetResult.dailyGroceries.toFixed(2)}</Text>
                {budgetResult.remaining < 200 && (
                  <Text style={[styles.text, { color: palette.warning, marginTop: 4 }]}>
                    ⚠️ Budget is tight. Consider food banks, community meals, or emergency funds.
                  </Text>
                )}
                {budgetResult.remaining < 0 && (
                  <Text style={[styles.text, { color: palette.error, marginTop: 4 }]}>
                    🚨 Expenses exceed income. Contact your worker about emergency support.
                  </Text>
                )}
              </View>

              <View style={{ height: 8 }} />
              <A11yPressable 
                onPress={() => copyToClipboard(
                  `Monthly Budget Summary\n` +
                  `Income: $${monthlyIncome}\n` +
                  `Fixed Expenses: $${budgetResult.fixedExpenses.toFixed(2)}\n` +
                  `Remaining: $${budgetResult.remaining.toFixed(2)}\n` +
                  `Weekly Groceries: $${budgetResult.weeklyGroceries.toFixed(2)}\n` +
                  `Daily Limit: $${budgetResult.dailyGroceries.toFixed(2)}`
                )} 
                accessibilityLabel="Copy budget summary" 
                style={styles.secondary}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>Copy Summary</Text>
              </A11yPressable>
            </View>
          )}

          <NavButtons onBack={() => setStep(2)} />
        </Step>
      )}
    </ScrollView>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  const palette = useAppPalette();
  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 4 }}>{`Step ${n}: ${title}`}</Text>
      {children}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    text: { color: palette.text, marginBottom: 4 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 6,
      color: palette.text,
      marginBottom: 8,
    },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    secondary: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: "center",
    },
  });
}

function RowChips({ value, onChange, options }: { value: string; onChange: (v: any) => void; options: string[] }) {
  const palette = useAppPalette();
  return (
    <GapView gap={8} style={{ flexDirection: "row", marginVertical: 6, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <A11yPressable
            key={opt}
            onPress={() => onChange(opt as any)}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: palette.muted,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 14,
              backgroundColor: active ? palette.primary : "transparent",
            }}
          >
            <Text style={{ color: active ? palette.onPrimary : palette.text }}>{opt.toUpperCase()}</Text>
          </A11yPressable>
        );
      })}
    </GapView>
  );
}

function NavButtons({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const palette = useAppPalette();
  return (
    <GapView gap={10} style={{ flexDirection: "row", marginTop: 8 }}>
      {onBack && (
        <A11yPressable onPress={onBack} style={{ paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8 }}>
          <Text style={{ color: palette.text }}>Back</Text>
        </A11yPressable>
      )}
      {onNext && (
        <A11yPressable onPress={onNext} style={{ paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8 }}>
          <Text style={{ color: palette.text }}>Next</Text>
        </A11yPressable>
      )}
    </GapView>
  );
}
