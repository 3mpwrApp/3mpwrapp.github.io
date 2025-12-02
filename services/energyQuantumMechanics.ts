/**
 * Energy Quantum Mechanics
 * 
 * Advanced upgrade to Pacing Partner with energy debt calculator, quantum energy
 * states, temporal energy shifting, energy inheritance tracking, and social energy economics.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

import { hapticLanguage } from './hapticLanguage';
import { spoonEconomist } from './spoonEconomist';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type QuantumEnergyState =
  | 'quantum_superposition' // Multiple energy states at once (chronic illness reality)
  | 'energy_entanglement' // Your energy affects others', theirs affects yours
  | 'wave_collapse' // Sudden energy crash (when you "observe" you're tired)
  | 'tunneling' // Passing through energy barriers with unknown mechanism
  | 'zero_point' // Minimal baseline energy that never reaches absolute zero
  | 'excited_state' // Temporary high-energy state (will decay)
  | 'ground_state'; // Stable baseline energy

export interface EnergyQuantum {
  id: string;
  timestamp: number;
  state: QuantumEnergyState;
  energyLevel: number; // 0-100
  uncertainty: number; // 0-100 (how predictable is this state?)
  halfLife: number; // Minutes until energy decays by 50%
  source: 'rest' | 'medication' | 'social' | 'mystery' | 'borrowed';
}

export interface EnergyDebt {
  principal: number; // Energy units borrowed
  interestRate: number; // Compound rate per hour
  accruedSince: number; // Timestamp
  repaymentHistory: Array<{ timestamp: number; amount: number }>;
  currentBalance: number; // Principal + interest
  defaultRisk: number; // 0-100 likelihood of chronic fatigue
}

export interface TemporalEnergyShift {
  id: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  energyBorrowed: number;
  reason: string;
  repaid: boolean;
  interestAccrued: number;
}

export interface EnergyInheritance {
  id: string;
  fromPersonId: string;
  fromPersonName: string;
  energyTransferred: number;
  timestamp: number;
  mechanism: 'caretaking' | 'emotional_support' | 'advocacy' | 'direct_help';
  notes?: string;
}

export interface SocialEnergyLedger {
  personId: string;
  personName: string;
  energyGiven: number; // Total energy you've given them
  energyReceived: number; // Total energy they've given you
  balance: number; // Positive = you're owed, negative = you owe
  transactions: SocialEnergyTransaction[];
}

export interface SocialEnergyTransaction {
  id: string;
  timestamp: number;
  direction: 'given' | 'received';
  amount: number;
  context: string;
  reciprocated: boolean;
}

export interface EnergyForecast {
  date: string;
  predictedLevel: number; // 0-100
  confidence: number; // 0-100
  factors: Array<{ name: string; impact: number }>; // Impact can be negative
  recommendations: string[];
}

export interface EnergyMetrics {
  currentEnergy: number;
  quantumState: QuantumEnergyState;
  debt: EnergyDebt;
  weeklyAverage: number;
  volatility: number; // How much energy fluctuates (0-100)
  sustainabilityScore: number; // 0-100 (are you over-borrowing?)
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  QUANTA: 'energyQuantum:quanta:v1',
  DEBT: 'energyQuantum:debt:v1',
  SHIFTS: 'energyQuantum:temporalShifts:v1',
  INHERITANCES: 'energyQuantum:inheritances:v1',
  SOCIAL_LEDGERS: 'energyQuantum:socialLedgers:v1',
  CURRENT_STATE: 'energyQuantum:currentState:v1',
} as const;

const QUANTUM_STATE_THRESHOLDS: Record<QuantumEnergyState, { min: number; max: number; uncertainty: number }> = {
  zero_point: { min: 0, max: 20, uncertainty: 10 },
  ground_state: { min: 20, max: 50, uncertainty: 20 },
  quantum_superposition: { min: 0, max: 100, uncertainty: 80 }, // Can be any energy level
  energy_entanglement: { min: 30, max: 70, uncertainty: 60 },
  wave_collapse: { min: 0, max: 30, uncertainty: 90 }, // Sudden crash
  tunneling: { min: 40, max: 80, uncertainty: 70 }, // Unexplained energy
  excited_state: { min: 70, max: 100, uncertainty: 50 },
};

const ENERGY_DECAY_HALF_LIVES: Record<EnergyQuantum['source'], number> = {
  rest: 480, // 8 hours
  medication: 240, // 4 hours
  social: 120, // 2 hours
  mystery: 60, // 1 hour
  borrowed: 30, // 30 minutes (borrowed energy decays fast)
};

// ============================================================================
// Energy Quantum Mechanics Manager
// ============================================================================

class EnergyQuantumMechanicsManager {
  private static instance: EnergyQuantumMechanicsManager;
  private quanta: EnergyQuantum[] = [];
  private debt: EnergyDebt;
  private temporalShifts: TemporalEnergyShift[] = [];
  private inheritances: EnergyInheritance[] = [];
  private socialLedgers: Map<string, SocialEnergyLedger> = new Map();
  private currentState: QuantumEnergyState = 'ground_state';

  private constructor() {
    this.debt = {
      principal: 0,
      interestRate: 0.1, // 10% per hour
      accruedSince: Date.now(),
      repaymentHistory: [],
      currentBalance: 0,
      defaultRisk: 0,
    };
    this.loadData();
  }

  static getInstance(): EnergyQuantumMechanicsManager {
    if (!EnergyQuantumMechanicsManager.instance) {
      EnergyQuantumMechanicsManager.instance = new EnergyQuantumMechanicsManager();
    }
    return EnergyQuantumMechanicsManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [quantaStr, debtStr, shiftsStr, inheritStr, ledgersStr, stateStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.QUANTA),
        AsyncStorage.getItem(STORAGE_KEYS.DEBT),
        AsyncStorage.getItem(STORAGE_KEYS.SHIFTS),
        AsyncStorage.getItem(STORAGE_KEYS.INHERITANCES),
        AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_LEDGERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STATE),
      ]);

      if (quantaStr) this.quanta = JSON.parse(quantaStr);
      if (debtStr) this.debt = JSON.parse(debtStr);
      if (shiftsStr) this.temporalShifts = JSON.parse(shiftsStr);
      if (inheritStr) this.inheritances = JSON.parse(inheritStr);
      
      if (ledgersStr) {
        const ledgersArray: SocialEnergyLedger[] = JSON.parse(ledgersStr);
        this.socialLedgers = new Map(ledgersArray.map(l => [l.personId, l]));
      }

      if (stateStr) this.currentState = JSON.parse(stateStr);

      // Calculate current debt balance
      this.updateDebtBalance();
    } catch (err) {
      logError('energyQuantumMechanics', 'Failed to load energy quantum data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.QUANTA, JSON.stringify(this.quanta.slice(-500))),
        AsyncStorage.setItem(STORAGE_KEYS.DEBT, JSON.stringify(this.debt)),
        AsyncStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(this.temporalShifts.slice(-100))),
        AsyncStorage.setItem(STORAGE_KEYS.INHERITANCES, JSON.stringify(this.inheritances.slice(-200))),
        AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_LEDGERS, JSON.stringify(Array.from(this.socialLedgers.values()))),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(this.currentState)),
      ]);
    } catch (err) {
      logError('energyQuantumMechanics', 'Failed to save energy quantum data', err);
    }
  }

  // ============================================================================
  // Energy Quanta Management
  // ============================================================================

  async recordEnergyQuantum(
    energyLevel: number,
    source: EnergyQuantum['source'],
    state?: QuantumEnergyState
  ): Promise<EnergyQuantum> {
    const detectedState = state || this.detectQuantumState(energyLevel);
    const thresholds = QUANTUM_STATE_THRESHOLDS[detectedState];

    const quantum: EnergyQuantum = {
      id: `quantum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      state: detectedState,
      energyLevel,
      uncertainty: thresholds.uncertainty,
      halfLife: ENERGY_DECAY_HALF_LIVES[source],
      source,
    };

    this.quanta.push(quantum);
    this.currentState = detectedState;

    // Trigger haptic feedback for certain states
    if (detectedState === 'wave_collapse') {
      await hapticLanguage.play('energy_low');
    } else if (detectedState === 'excited_state') {
      await hapticLanguage.play('achievement');
    }

    await this.saveData();
    return quantum;
  }

  private detectQuantumState(energyLevel: number): QuantumEnergyState {
    // Check for special states first
    const recentQuanta = this.quanta.slice(-10);
    
    // Wave collapse: sudden drop
    if (recentQuanta.length > 1) {
      const lastEnergy = recentQuanta[recentQuanta.length - 1].energyLevel;
      if (lastEnergy - energyLevel > 30) {
        return 'wave_collapse';
      }
    }

    // Quantum superposition: high variability
    if (recentQuanta.length >= 5) {
      const variance = this.calculateVariance(recentQuanta.map(q => q.energyLevel));
      if (variance > 400) { // High variance
        return 'quantum_superposition';
      }
    }

    // Tunneling: unexplained energy gain
    if (recentQuanta.length > 1) {
      const lastEnergy = recentQuanta[recentQuanta.length - 1].energyLevel;
      if (energyLevel - lastEnergy > 25 && recentQuanta[recentQuanta.length - 1].source === 'mystery') {
        return 'tunneling';
      }
    }

    // Default to energy-based states
    if (energyLevel >= 70) return 'excited_state';
    if (energyLevel <= 20) return 'zero_point';
    return 'ground_state';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }

  getCurrentEnergy(): number {
    if (this.quanta.length === 0) return 50; // Default

    // Calculate decayed energy from most recent quantum
    const latest = this.quanta[this.quanta.length - 1];
    const minutesElapsed = (Date.now() - latest.timestamp) / (1000 * 60);
    const halfLives = minutesElapsed / latest.halfLife;
    const decayedEnergy = latest.energyLevel * Math.pow(0.5, halfLives);

    return Math.max(0, Math.min(100, decayedEnergy));
  }

  async adjustEnergy(delta: number): Promise<void> {
    const newEnergy = Math.max(0, Math.min(100, this.getCurrentEnergy() + delta));
    await this.recordEnergyQuantum(newEnergy, delta >= 0 ? 'social' : 'exertion');
  }

  getCurrentState(): QuantumEnergyState {
    return this.currentState;
  }

  // ============================================================================
  // Energy Debt System
  // ============================================================================

  async borrowEnergy(amount: number, reason?: string): Promise<void> {
    this.debt.principal += amount;
    this.debt.accruedSince = Date.now();
    
    // Record as temporal shift for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const shift: TemporalEnergyShift = {
      id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromDate: tomorrow.toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      energyBorrowed: amount,
      reason: reason || 'Energy borrowed from future',
      repaid: false,
      interestAccrued: 0,
    };

    this.temporalShifts.push(shift);

    // Record quantum from borrowed source
    await this.recordEnergyQuantum(this.getCurrentEnergy() + amount, 'borrowed');

    // Integrate with spoon economist
    await spoonEconomist.borrowSpoons(Math.ceil(amount / 10)); // 10 energy = 1 spoon

    await this.saveData();
  }

  async repayEnergyDebt(amount: number): Promise<void> {
    const repayment = Math.min(amount, this.debt.currentBalance);
    
    this.debt.repaymentHistory.push({
      timestamp: Date.now(),
      amount: repayment,
    });

    this.debt.currentBalance -= repayment;
    this.debt.principal = Math.max(0, this.debt.principal - repayment);

    // Mark temporal shifts as repaid
    let remaining = repayment;
    for (const shift of this.temporalShifts.filter(s => !s.repaid)) {
      if (remaining <= 0) break;
      
      const toRepay = Math.min(remaining, shift.energyBorrowed + shift.interestAccrued);
      remaining -= toRepay;
      
      if (toRepay >= shift.energyBorrowed + shift.interestAccrued) {
        shift.repaid = true;
      }
    }

    await this.saveData();
  }

  private updateDebtBalance(): void {
    if (this.debt.principal === 0) {
      this.debt.currentBalance = 0;
      this.debt.defaultRisk = 0;
      return;
    }

    const hoursElapsed = (Date.now() - this.debt.accruedSince) / (1000 * 60 * 60);
    const compoundMultiplier = Math.pow(1 + this.debt.interestRate, hoursElapsed);
    this.debt.currentBalance = this.debt.principal * compoundMultiplier;

    // Calculate default risk
    const totalRepaid = this.debt.repaymentHistory.reduce((sum, r) => sum + r.amount, 0);
    const repaymentRate = this.debt.principal > 0 ? totalRepaid / this.debt.principal : 0;
    this.debt.defaultRisk = Math.min(100, (1 - repaymentRate) * 100);
  }

  getEnergyDebt(): EnergyDebt {
    this.updateDebtBalance();
    return { ...this.debt };
  }

  // ============================================================================
  // Temporal Energy Shifting
  // ============================================================================

  getTemporalShifts(includeRepaid: boolean = false): TemporalEnergyShift[] {
    return this.temporalShifts
      .filter(s => includeRepaid || !s.repaid)
      .sort((a, b) => b.fromDate.localeCompare(a.fromDate));
  }

  // ============================================================================
  // Energy Inheritance
  // ============================================================================

  async recordEnergyInheritance(
    fromPersonName: string,
    energyReceived: number,
    mechanism: EnergyInheritance['mechanism'],
    notes?: string
  ): Promise<void> {
    const inheritance: EnergyInheritance = {
      id: `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromPersonId: fromPersonName.toLowerCase().replace(/\s+/g, '_'),
      fromPersonName,
      energyTransferred: energyReceived,
      timestamp: Date.now(),
      mechanism,
      notes,
    };

    this.inheritances.push(inheritance);

    // Update social ledger
    await this.updateSocialLedger(
      inheritance.fromPersonId,
      fromPersonName,
      'received',
      energyReceived,
      `${mechanism}: ${notes || ''}`
    );

    // Record energy quantum
    await this.recordEnergyQuantum(this.getCurrentEnergy() + energyReceived, 'social');

    await this.saveData();
  }

  async giveEnergy(
    toPersonName: string,
    energyGiven: number,
    context: string
  ): Promise<void> {
    const personId = toPersonName.toLowerCase().replace(/\s+/g, '_');

    // Update social ledger
    await this.updateSocialLedger(personId, toPersonName, 'given', energyGiven, context);

    // Deduct from current energy
    await this.recordEnergyQuantum(Math.max(0, this.getCurrentEnergy() - energyGiven), 'social');

    await this.saveData();
  }

  // ============================================================================
  // Social Energy Economics
  // ============================================================================

  private async updateSocialLedger(
    personId: string,
    personName: string,
    direction: 'given' | 'received',
    amount: number,
    context: string
  ): Promise<void> {
    let ledger = this.socialLedgers.get(personId);

    if (!ledger) {
      ledger = {
        personId,
        personName,
        energyGiven: 0,
        energyReceived: 0,
        balance: 0,
        transactions: [],
      };
      this.socialLedgers.set(personId, ledger);
    }

    const transaction: SocialEnergyTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      direction,
      amount,
      context,
      reciprocated: false,
    };

    ledger.transactions.push(transaction);

    if (direction === 'given') {
      ledger.energyGiven += amount;
      ledger.balance -= amount;
    } else {
      ledger.energyReceived += amount;
      ledger.balance += amount;
    }
  }

  getSocialEnergyLedgers(): SocialEnergyLedger[] {
    return Array.from(this.socialLedgers.values())
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)); // Most imbalanced first
  }

  getSocialEnergyLedger(personId: string): SocialEnergyLedger | null {
    return this.socialLedgers.get(personId) || null;
  }

  // ============================================================================
  // Energy Forecasting
  // ============================================================================

  forecastEnergy(daysAhead: number = 7): EnergyForecast[] {
    const forecasts: EnergyForecast[] = [];
    
    // Analyze historical patterns
    const last30Days = this.quanta.filter(q => q.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);
    const avgEnergy = last30Days.reduce((sum, q) => sum + q.energyLevel, 0) / (last30Days.length || 1);

    // Group by day of week
    const byDayOfWeek = new Map<number, number[]>();
    last30Days.forEach(q => {
      const dayOfWeek = new Date(q.timestamp).getDay();
      if (!byDayOfWeek.has(dayOfWeek)) {
        byDayOfWeek.set(dayOfWeek, []);
      }
      byDayOfWeek.get(dayOfWeek)!.push(q.energyLevel);
    });

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const dayOfWeek = futureDate.getDay();

      // Base prediction on historical day-of-week average
      const historicalForDay = byDayOfWeek.get(dayOfWeek) || [avgEnergy];
      const basePrediction = historicalForDay.reduce((sum, e) => sum + e, 0) / historicalForDay.length;

      const factors: Array<{ name: string; impact: number }> = [];

      // Factor: Debt repayment
      if (this.debt.currentBalance > 0) {
        const debtImpact = -Math.min(20, this.debt.currentBalance / 10);
        factors.push({ name: 'Energy debt', impact: debtImpact });
      }

      // Factor: Temporal shifts
      const dateStr = futureDate.toISOString().split('T')[0];
      const shiftsOnDay = this.temporalShifts.filter(s => s.fromDate === dateStr && !s.repaid);
      if (shiftsOnDay.length > 0) {
        const borrowedTotal = shiftsOnDay.reduce((sum, s) => sum + s.energyBorrowed, 0);
        factors.push({ name: 'Borrowed from this day', impact: -borrowedTotal });
      }

      // Factor: Recent trend
      const recentTrend = this.calculateTrend(last30Days.slice(-7).map(q => q.energyLevel));
      if (Math.abs(recentTrend) > 2) {
        factors.push({ name: recentTrend > 0 ? 'Upward trend' : 'Downward trend', impact: recentTrend * i });
      }

      const totalImpact = factors.reduce((sum, f) => sum + f.impact, 0);
      const predictedLevel = Math.max(0, Math.min(100, basePrediction + totalImpact));
      const confidence = Math.max(20, 80 - i * 10); // Confidence decreases with distance

      const recommendations: string[] = [];
      if (predictedLevel < 30) {
        recommendations.push('Schedule rest day');
        recommendations.push('Cancel non-essential activities');
      } else if (predictedLevel > 70) {
        recommendations.push('Good day for challenging tasks');
        recommendations.push('Consider repaying energy debt');
      }

      forecasts.push({
        date: dateStr,
        predictedLevel: Math.round(predictedLevel),
        confidence,
        factors,
        recommendations,
      });
    }

    return forecasts;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  // ============================================================================
  // Metrics
  // ============================================================================

  getMetrics(): EnergyMetrics {
    const currentEnergy = this.getCurrentEnergy();
    const debt = this.getEnergyDebt();

    const lastWeek = this.quanta.filter(q => q.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAverage = lastWeek.length > 0
      ? lastWeek.reduce((sum, q) => sum + q.energyLevel, 0) / lastWeek.length
      : 50;

    const volatility = lastWeek.length > 1
      ? Math.sqrt(this.calculateVariance(lastWeek.map(q => q.energyLevel)))
      : 0;

    // Sustainability: low debt + low volatility = high sustainability
    const debtPenalty = Math.min(50, debt.currentBalance);
    const volatilityPenalty = Math.min(30, volatility);
    const sustainabilityScore = Math.max(0, 100 - debtPenalty - volatilityPenalty);

    return {
      currentEnergy: Math.round(currentEnergy),
      quantumState: this.currentState,
      debt,
      weeklyAverage: Math.round(weeklyAverage),
      volatility: Math.round(volatility),
      sustainabilityScore: Math.round(sustainabilityScore),
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const energyQuantumMechanics = EnergyQuantumMechanicsManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useEnergyQuantumMechanics() {
  const [metrics, setMetrics] = React.useState<EnergyMetrics>(
    energyQuantumMechanics.getMetrics()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(energyQuantumMechanics.getMetrics());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Current state
    metrics,
    getCurrentEnergy: () => energyQuantumMechanics.getCurrentEnergy(),
    getCurrentState: () => energyQuantumMechanics.getCurrentState(),
    adjustEnergy: (delta: number) => energyQuantumMechanics.adjustEnergy(delta),
    
    // Energy recording
    recordEnergy: (level: number, source: EnergyQuantum['source'], state?: QuantumEnergyState) =>
      energyQuantumMechanics.recordEnergyQuantum(level, source, state),
    
    // Debt
    borrowEnergy: (amount: number, reason?: string) =>
      energyQuantumMechanics.borrowEnergy(amount, reason),
    repayDebt: (amount: number) => energyQuantumMechanics.repayEnergyDebt(amount),
    getDebt: () => energyQuantumMechanics.getEnergyDebt(),
    
    // Temporal shifts
    getTemporalShifts: (includeRepaid?: boolean) =>
      energyQuantumMechanics.getTemporalShifts(includeRepaid),
    
    // Social energy
    recordInheritance: (name: string, amount: number, mechanism: EnergyInheritance['mechanism'], notes?: string) =>
      energyQuantumMechanics.recordEnergyInheritance(name, amount, mechanism, notes),
    giveEnergy: (name: string, amount: number, context: string) =>
      energyQuantumMechanics.giveEnergy(name, amount, context),
    getSocialLedgers: () => energyQuantumMechanics.getSocialEnergyLedgers(),
    getSocialLedger: (personId: string) => energyQuantumMechanics.getSocialEnergyLedger(personId),
    
    // Forecasting
    forecastEnergy: (daysAhead?: number) => energyQuantumMechanics.forecastEnergy(daysAhead),
  };
}
