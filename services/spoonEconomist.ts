/**
 * Spoon Theory Economist
 * 
 * Gamified energy management with cryptocurrency-style tracking.
 * Based on Spoon Theory by Christine Miserandino.
 * 
 * Features:
 * - Daily spoon allocation based on sleep, pain, stress
 * - Task costs and energy budgeting
 * - Spoon interest on rest days
 * - Energy debt with compound costs
 * - Trading spoons with family/caregivers
 * - Monthly budget reports
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';

import { logError } from '../utils/errorLogger';

import { hapticLanguage } from './hapticLanguage';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SpoonAccount {
  userId: string;
  currentSpoons: number;
  maxSpoons: number; // Baseline capacity
  debtSpoons: number; // Borrowed from future days
  savedSpoons: number; // Banked from rest days
  lastUpdated: number;
  todayAllocated: number;
}

export interface SpoonTransaction {
  id: string;
  timestamp: number;
  type: 'earn' | 'spend' | 'borrow' | 'repay' | 'interest' | 'trade' | 'bonus';
  amount: number;
  taskId?: string;
  taskName?: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  debtBefore: number;
  debtAfter: number;
}

export interface SpoonTask {
  id: string;
  name: string;
  category: 'physical' | 'cognitive' | 'social' | 'emotional' | 'medical';
  baseCost: number; // Base spoon cost
  variableCost?: (context: TaskContext) => number; // Dynamic cost calculation
  estimatedDuration: number; // minutes
  canDefer: boolean; // Can be postponed?
  priority: 'low' | 'medium' | 'high' | 'critical';
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

export interface TaskContext {
  timeOfDay: number; // 0-23
  painLevel: number; // 0-10
  stressLevel: number; // 0-10
  socialBattery: number; // 0-100
  weather?: string;
}

export interface SpoonBudget {
  date: string; // YYYY-MM-DD
  allocated: number;
  spent: number;
  saved: number;
  borrowed: number;
  repaid: number;
  interestEarned: number;
  tasks: Array<{ taskName: string; cost: number; time: number }>;
  endBalance: number;
}

export interface TradeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  spoons: number;
  taskDescription: string; // "I'll do dishes for 3 spoons"
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  expiresAt: number;
}

// ============================================================================
// AI PREDICTIVE BUDGETING - NEVER BEEN DONE BEFORE
// ============================================================================

export interface SpoonPrediction {
  predictedSpoons: number;
  confidence: number; // 0-100
  crashRisk: 'low' | 'medium' | 'high' | 'critical';
  crashProbability: number; // 0-100
  recommendations: string[];
  optimalRestTime: string; // e.g., "2:00 PM - 3:30 PM"
  riskFactors: Array<{ factor: string; impact: number }>;
}

export interface MLTaskCostHistory {
  taskId: string;
  actualCosts: number[];
  predictedCosts: number[];
  contexts: TaskContext[];
  accuracy: number;
}

export interface SpoonForecast {
  date: string;
  predictedMax: number;
  predictedSpent: number;
  suggestedTasks: string[];
  avoidTasks: string[];
  weatherImpact: number; // -2 to +2 spoons
  sleepDebtImpact: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  ACCOUNT: 'spoonEconomist:account:v1',
  TRANSACTIONS: 'spoonEconomist:transactions:v1',
  BUDGETS: 'spoonEconomist:budgets:v1',
  TASKS: 'spoonEconomist:tasks:v1',
  TRADES: 'spoonEconomist:trades:v1',
  PREFERENCES: 'spoonEconomist:preferences:v1',
  ML_TASK_COSTS: 'spoonEconomist:mlTaskCosts:v1',
  PREDICTIONS: 'spoonEconomist:predictions:v1',
  FORECASTS: 'spoonEconomist:forecasts:v1',
} as const;

const INTEREST_RATE = 0.2; // 20% interest on saved spoons (rest day bonus)
const DEBT_MULTIPLIER = 1.5; // Borrowing costs 1.5x to repay (compound interest)
const MAX_DEBT_RATIO = 0.5; // Can't borrow more than 50% of max spoons
const REST_DAY_THRESHOLD = 0.3; // Spending <30% of spoons = rest day

// Preset common tasks with spoon costs
const COMMON_TASKS: SpoonTask[] = [
  { id: 'shower', name: 'Shower', category: 'physical', baseCost: 2, estimatedDuration: 20, canDefer: false, priority: 'medium' },
  { id: 'cook_meal', name: 'Cook a meal', category: 'physical', baseCost: 4, estimatedDuration: 45, canDefer: true, priority: 'medium' },
  { id: 'groceries', name: 'Grocery shopping', category: 'physical', baseCost: 6, estimatedDuration: 90, canDefer: true, priority: 'medium' },
  { id: 'doctor_appt', name: 'Doctor appointment', category: 'medical', baseCost: 8, estimatedDuration: 120, canDefer: false, priority: 'high' },
  { id: 'work_hour', name: 'Work (per hour)', category: 'cognitive', baseCost: 3, estimatedDuration: 60, canDefer: false, priority: 'high' },
  { id: 'social_event', name: 'Social event', category: 'social', baseCost: 7, estimatedDuration: 120, canDefer: true, priority: 'low' },
  { id: 'phone_call', name: 'Important phone call', category: 'cognitive', baseCost: 3, estimatedDuration: 30, canDefer: true, priority: 'medium' },
  { id: 'therapy', name: 'Therapy session', category: 'emotional', baseCost: 6, estimatedDuration: 60, canDefer: false, priority: 'high' },
  { id: 'exercise_light', name: 'Light exercise', category: 'physical', baseCost: 3, estimatedDuration: 30, canDefer: true, priority: 'low' },
  { id: 'clean_house', name: 'House cleaning', category: 'physical', baseCost: 8, estimatedDuration: 90, canDefer: true, priority: 'low' },
  { id: 'laundry', name: 'Laundry', category: 'physical', baseCost: 4, estimatedDuration: 60, canDefer: true, priority: 'medium' },
  { id: 'paperwork', name: 'Paperwork/admin', category: 'cognitive', baseCost: 5, estimatedDuration: 60, canDefer: true, priority: 'medium' },
  { id: 'commute', name: 'Commute (per hour)', category: 'physical', baseCost: 2, estimatedDuration: 60, canDefer: false, priority: 'high' },
  { id: 'childcare', name: 'Childcare (per hour)', category: 'physical', baseCost: 4, estimatedDuration: 60, canDefer: false, priority: 'critical' },
];

// ============================================================================
// Spoon Economist Manager
// ============================================================================

class SpoonEconomistManager {
  private static instance: SpoonEconomistManager;
  private account: SpoonAccount | null = null;
  private transactions: SpoonTransaction[] = [];
  private budgets: Map<string, SpoonBudget> = new Map();
  private customTasks: SpoonTask[] = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): SpoonEconomistManager {
    if (!SpoonEconomistManager.instance) {
      SpoonEconomistManager.instance = new SpoonEconomistManager();
    }
    return SpoonEconomistManager.instance;
  }

  // ============================================================================
  // Data Management
  // ============================================================================

  private async loadData(): Promise<void> {
    try {
      // Skip on web during SSR
      if (Platform.OS === 'web' && typeof window === 'undefined') return;
      
      const [accountStr, transactionsStr, budgetsStr, tasksStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
      ]);

      if (accountStr) this.account = JSON.parse(accountStr);
      if (transactionsStr) this.transactions = JSON.parse(transactionsStr);
      if (budgetsStr) {
        const budgetsObj = JSON.parse(budgetsStr);
        this.budgets = new Map(Object.entries(budgetsObj));
      }
      if (tasksStr) this.customTasks = JSON.parse(tasksStr);

      // Initialize account if doesn't exist
      if (!this.account) {
        await this.initializeAccount();
      } else {
        // Check if new day, reset spoons
        await this.checkDailyReset();
      }
    } catch (err) {
      logError('spoonEconomist', 'Failed to load spoon economist data', err);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const budgetsObj = Object.fromEntries(this.budgets.entries());
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(this.account)),
        AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions.slice(-500))),
        AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetsObj)),
        AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.customTasks)),
      ]);
    } catch (err) {
      logError('spoonEconomist', 'Failed to save spoon economist data', err);
    }
  }

  // ============================================================================
  // Account Management
  // ============================================================================

  private async initializeAccount(): Promise<void> {
    this.account = {
      userId: 'default',
      currentSpoons: 12, // Default starting spoons
      maxSpoons: 12,
      debtSpoons: 0,
      savedSpoons: 0,
      lastUpdated: Date.now(),
      todayAllocated: 12,
    };
    await this.saveData();
  }

  async setMaxSpoons(max: number): Promise<void> {
    if (!this.account) return;
    this.account.maxSpoons = Math.max(1, Math.min(30, max)); // 1-30 range
    await this.saveData();
  }

  private async checkDailyReset(): Promise<void> {
    if (!this.account) return;

    const lastUpdate = new Date(this.account.lastUpdated);
    const now = new Date();

    // Check if it's a new day
    if (lastUpdate.getDate() !== now.getDate() || 
        lastUpdate.getMonth() !== now.getMonth() || 
        lastUpdate.getFullYear() !== now.getFullYear()) {
      
      await this.performDailyReset();
    }
  }

  private async performDailyReset(): Promise<void> {
    if (!this.account) return;

    // Save yesterday's budget
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateKey = yesterday.toISOString().split('T')[0];
    
    if (!this.budgets.has(dateKey)) {
      const yesterdayBudget: SpoonBudget = {
        date: dateKey,
        allocated: this.account.todayAllocated,
        spent: this.account.todayAllocated - this.account.currentSpoons,
        saved: 0,
        borrowed: 0,
        repaid: 0,
        interestEarned: 0,
        tasks: [],
        endBalance: this.account.currentSpoons,
      };
      this.budgets.set(dateKey, yesterdayBudget);
    }

    // Calculate new day's spoons
    let newSpoons = this.account.maxSpoons;

    // Apply interest on saved spoons (rest day bonus)
    if (this.account.savedSpoons > 0) {
      const interest = Math.floor(this.account.savedSpoons * INTEREST_RATE);
      newSpoons += interest;
      
      this.addTransaction({
        type: 'interest',
        amount: interest,
        description: `Rest day bonus: ${interest} spoons earned from ${this.account.savedSpoons} saved spoons`,
      });
      
      this.account.savedSpoons = 0; // Reset saved spoons after applying interest
    }

    // Handle debt repayment
    if (this.account.debtSpoons > 0) {
      const repaymentAmount = Math.min(Math.floor(newSpoons * 0.3), this.account.debtSpoons);
      newSpoons -= repaymentAmount;
      this.account.debtSpoons -= repaymentAmount;

      this.addTransaction({
        type: 'repay',
        amount: repaymentAmount,
        description: `Automatic debt repayment: ${repaymentAmount} spoons`,
      });

      if (this.account.debtSpoons === 0) {
        await hapticLanguage.play('achievement');
      }
    }

    this.account.currentSpoons = newSpoons;
    this.account.todayAllocated = newSpoons;
    this.account.lastUpdated = Date.now();

    await this.saveData();
  }

  // ============================================================================
  // Spoon Transactions
  // ============================================================================

  private addTransaction(partial: Omit<SpoonTransaction, 'id' | 'timestamp' | 'balanceBefore' | 'balanceAfter' | 'debtBefore' | 'debtAfter'>): void {
    if (!this.account) return;

    const transaction: SpoonTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      balanceBefore: this.account.currentSpoons,
      debtBefore: this.account.debtSpoons,
      balanceAfter: 0, // Will be set after transaction
      debtAfter: 0,
      ...partial,
    };

    // Update account based on transaction type
    switch (transaction.type) {
      case 'spend':
        this.account.currentSpoons -= transaction.amount;
        break;
      case 'earn':
      case 'bonus':
        this.account.currentSpoons += transaction.amount;
        break;
      case 'borrow':
        this.account.currentSpoons += transaction.amount;
        this.account.debtSpoons += Math.floor(transaction.amount * DEBT_MULTIPLIER);
        break;
      case 'repay':
        this.account.debtSpoons -= transaction.amount;
        break;
      case 'interest':
        this.account.currentSpoons += transaction.amount;
        break;
    }

    transaction.balanceAfter = this.account.currentSpoons;
    transaction.debtAfter = this.account.debtSpoons;

    this.transactions.push(transaction);
    this.account.lastUpdated = Date.now();
  }

  // ============================================================================
  // Task Management
  // ============================================================================

  async spendSpoons(taskId: string, customCost?: number, context?: TaskContext): Promise<{ success: boolean; message: string; spoonsLeft: number }> {
    if (!this.account) {
      return { success: false, message: 'Account not initialized', spoonsLeft: 0 };
    }

    const task = this.getTask(taskId);
    if (!task) {
      return { success: false, message: 'Task not found', spoonsLeft: this.account.currentSpoons };
    }

    const cost = customCost || (task.variableCost && context ? task.variableCost(context) : task.baseCost);

    // Check if user has enough spoons
    if (this.account.currentSpoons >= cost) {
      this.addTransaction({
        type: 'spend',
        amount: cost,
        taskId: task.id,
        taskName: task.name,
        description: `Spent ${cost} spoons on: ${task.name}`,
      });

      await this.saveData();

      // Warn if running low
      if (this.account.currentSpoons < this.account.maxSpoons * 0.2) {
        await hapticLanguage.play('energy_low');
      }

      // Alert if depleted
      if (this.account.currentSpoons === 0) {
        await hapticLanguage.play('spoon_depleted');
      }

      return {
        success: true,
        message: `Spent ${cost} spoons. You have ${this.account.currentSpoons} spoons left.`,
        spoonsLeft: this.account.currentSpoons,
      };
    } else {
      // Offer to borrow
      const maxBorrow = Math.floor(this.account.maxSpoons * MAX_DEBT_RATIO) - this.account.debtSpoons;
      const canBorrow = cost <= maxBorrow;

      return {
        success: false,
        message: canBorrow 
          ? `Not enough spoons! You need ${cost} but only have ${this.account.currentSpoons}. Borrow ${cost} spoons? (You'll owe ${Math.floor(cost * DEBT_MULTIPLIER)} spoons tomorrow)`
          : `Not enough spoons and can't borrow more. Consider deferring this task.`,
        spoonsLeft: this.account.currentSpoons,
      };
    }
  }

  async borrowSpoons(amount: number): Promise<{ success: boolean; message: string }> {
    if (!this.account) {
      return { success: false, message: 'Account not initialized' };
    }

    const maxBorrow = Math.floor(this.account.maxSpoons * MAX_DEBT_RATIO) - this.account.debtSpoons;
    
    if (amount > maxBorrow) {
      return {
        success: false,
        message: `Can only borrow up to ${maxBorrow} spoons (already owe ${this.account.debtSpoons})`,
      };
    }

    this.addTransaction({
      type: 'borrow',
      amount,
      description: `Borrowed ${amount} spoons from tomorrow (will owe ${Math.floor(amount * DEBT_MULTIPLIER)})`,
    });

    await this.saveData();
    await hapticLanguage.play('warning');

    return {
      success: true,
      message: `Borrowed ${amount} spoons. You now owe ${this.account.debtSpoons} spoons.`,
    };
  }

  async earnBonus(amount: number, reason: string): Promise<void> {
    this.addTransaction({
      type: 'bonus',
      amount,
      description: reason,
    });

    await this.saveData();
    await hapticLanguage.play('achievement');
  }

  // ============================================================================
  // Rest Day & Savings
  // ============================================================================

  async endDay(): Promise<{ isRestDay: boolean; spoonsSaved: number; interestEarned: number }> {
    if (!this.account) {
      return { isRestDay: false, spoonsSaved: 0, interestEarned: 0 };
    }

    const spentPercentage = (this.account.todayAllocated - this.account.currentSpoons) / this.account.todayAllocated;
    const isRestDay = spentPercentage < REST_DAY_THRESHOLD;

    let spoonsSaved = 0;
    let interestEarned = 0;

    if (isRestDay && this.account.currentSpoons > 0) {
      // Save remaining spoons
      spoonsSaved = this.account.currentSpoons;
      this.account.savedSpoons += spoonsSaved;
      
      // Calculate tomorrow's interest preview
      interestEarned = Math.floor(this.account.savedSpoons * INTEREST_RATE);

      this.addTransaction({
        type: 'earn',
        amount: 0, // Not added yet, just saved
        description: `Rest day! Saved ${spoonsSaved} spoons. Will earn ${interestEarned} bonus spoons tomorrow.`,
      });

      await this.saveData();
      await hapticLanguage.play('achievement');
    }

    return { isRestDay, spoonsSaved, interestEarned };
  }

  // ============================================================================
  // Budget & Reports
  // ============================================================================

  async getMonthlyReport(year: number, month: number): Promise<{
    totalAllocated: number;
    totalSpent: number;
    totalSaved: number;
    totalBorrowed: number;
    totalRepaid: number;
    totalInterest: number;
    averageDailySpend: number;
    restDays: number;
    debtDays: number;
    topTasks: Array<{ name: string; totalCost: number; count: number }>;
  }> {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthBudgets = Array.from(this.budgets.entries())
      .filter(([date]) => date.startsWith(monthKey))
      .map(([_, budget]) => budget);

    const totalAllocated = monthBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = monthBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalSaved = monthBudgets.reduce((sum, b) => sum + b.saved, 0);
    const totalBorrowed = monthBudgets.reduce((sum, b) => sum + b.borrowed, 0);
    const totalRepaid = monthBudgets.reduce((sum, b) => sum + b.repaid, 0);
    const totalInterest = monthBudgets.reduce((sum, b) => sum + b.interestEarned, 0);
    
    const restDays = monthBudgets.filter(b => b.spent < b.allocated * REST_DAY_THRESHOLD).length;
    const debtDays = monthBudgets.filter(b => b.borrowed > 0).length;

    // Aggregate task costs
    const taskMap = new Map<string, { totalCost: number; count: number }>();
    monthBudgets.forEach(budget => {
      budget.tasks.forEach(task => {
        const existing = taskMap.get(task.taskName) || { totalCost: 0, count: 0 };
        taskMap.set(task.taskName, {
          totalCost: existing.totalCost + task.cost,
          count: existing.count + 1,
        });
      });
    });

    const topTasks = Array.from(taskMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    return {
      totalAllocated,
      totalSpent,
      totalSaved,
      totalBorrowed,
      totalRepaid,
      totalInterest,
      averageDailySpend: monthBudgets.length > 0 ? totalSpent / monthBudgets.length : 0,
      restDays,
      debtDays,
      topTasks,
    };
  }

  // ============================================================================
  // Task Library
  // ============================================================================

  getAllTasks(): SpoonTask[] {
    return [...COMMON_TASKS, ...this.customTasks];
  }

  getTask(taskId: string): SpoonTask | undefined {
    return this.getAllTasks().find(t => t.id === taskId);
  }

  async addCustomTask(task: Omit<SpoonTask, 'id'>): Promise<SpoonTask> {
    const newTask: SpoonTask = {
      ...task,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.customTasks.push(newTask);
    await this.saveData();
    return newTask;
  }

  async deleteCustomTask(taskId: string): Promise<boolean> {
    const index = this.customTasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;
    this.customTasks.splice(index, 1);
    await this.saveData();
    return true;
  }

  async updateCustomTask(taskId: string, updates: Partial<Omit<SpoonTask, 'id'>>): Promise<SpoonTask | null> {
    const index = this.customTasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    this.customTasks[index] = { ...this.customTasks[index], ...updates };
    await this.saveData();
    return this.customTasks[index];
  }

  getCustomTasks(): SpoonTask[] {
    return [...this.customTasks];
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getAccount(): SpoonAccount | null {
    return this.account ? { ...this.account } : null;
  }

  getTransactions(limit: number = 50): SpoonTransaction[] {
    return this.transactions.slice(-limit).reverse();
  }

  async calculateTaskCost(taskId: string, context: TaskContext): Promise<number> {
    const task = this.getTask(taskId);
    if (!task) return 0;

    if (task.variableCost) {
      return task.variableCost(context);
    }

    return task.baseCost;
  }

  // ============================================================================
  // AI PREDICTIVE CRASH RISK ANALYSIS
  // ============================================================================

  async predictSpoonCrash(): Promise<SpoonPrediction> {
    if (!this.account) {
      return {
        predictedSpoons: 0,
        confidence: 0,
        crashRisk: 'low',
        crashProbability: 0,
        recommendations: ['Initialize account first'],
        optimalRestTime: 'N/A',
        riskFactors: [],
      };
    }

    // Analyze recent patterns
    const recentTxns = this.transactions.slice(-50);
    const spendPatterns = recentTxns.filter(t => t.type === 'spend');
    const borrowPatterns = recentTxns.filter(t => t.type === 'borrow');

    // Calculate crash probability based on multiple factors
    const currentRatio = this.account.currentSpoons / this.account.maxSpoons;
    const debtRatio = this.account.debtSpoons / this.account.maxSpoons;
    const avgDailySpend = spendPatterns.reduce((s, t) => s + t.amount, 0) / Math.max(1, spendPatterns.length);
    const borrowFrequency = borrowPatterns.length / Math.max(1, recentTxns.length);

    // ML-style weighted crash probability
    let crashProbability = 0;
    crashProbability += (1 - currentRatio) * 30; // Low spoons
    crashProbability += debtRatio * 25; // Debt burden
    crashProbability += borrowFrequency * 20; // Borrowing habit
    crashProbability += Math.max(0, avgDailySpend - this.account.maxSpoons * 0.7) * 5;

    // Time-of-day adjustment (afternoon crash)
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 16) crashProbability += 10;

    crashProbability = Math.min(100, Math.max(0, crashProbability));

    const crashRisk: SpoonPrediction['crashRisk'] = 
      crashProbability >= 75 ? 'critical' :
      crashProbability >= 50 ? 'high' :
      crashProbability >= 25 ? 'medium' : 'low';

    // Generate smart recommendations
    const recommendations: string[] = [];
    if (currentRatio < 0.3) recommendations.push('Consider resting now - spoons critically low');
    if (debtRatio > 0.3) recommendations.push('Focus on debt repayment before new tasks');
    if (hour >= 14 && hour <= 16) recommendations.push('Afternoon crash zone - take a 15-min break');
    if (borrowFrequency > 0.2) recommendations.push('Reduce borrowing - consider task deferral');
    if (recommendations.length === 0) recommendations.push('You\'re managing energy well - keep it up!');

    // Calculate optimal rest time
    const optimalRestTime = hour < 12 ? '2:00 PM - 3:30 PM' : 
                           hour < 18 ? 'Now - rest immediately' : '9:00 PM - wind down';

    const riskFactors = [
      { factor: 'Current spoon level', impact: Math.round((1 - currentRatio) * 10) },
      { factor: 'Debt burden', impact: Math.round(debtRatio * 10) },
      { factor: 'Borrowing frequency', impact: Math.round(borrowFrequency * 10) },
      { factor: 'Time of day', impact: hour >= 14 && hour <= 16 ? 3 : 0 },
    ].filter(f => f.impact > 0);

    return {
      predictedSpoons: Math.max(0, Math.floor(this.account.currentSpoons - avgDailySpend * 0.3)),
      confidence: Math.min(95, 60 + recentTxns.length),
      crashRisk,
      crashProbability: Math.round(crashProbability),
      recommendations,
      optimalRestTime,
      riskFactors,
    };
  }

  // ============================================================================
  // ML TASK COST LEARNING
  // ============================================================================

  private mlTaskCosts: Map<string, MLTaskCostHistory> = new Map();

  async learnTaskCost(taskId: string, actualCost: number, context: TaskContext): Promise<void> {
    const existing = this.mlTaskCosts.get(taskId) || {
      taskId,
      actualCosts: [],
      predictedCosts: [],
      contexts: [],
      accuracy: 0,
    };

    existing.actualCosts.push(actualCost);
    existing.contexts.push(context);

    // Calculate accuracy of predictions
    if (existing.predictedCosts.length > 0) {
      const lastPredicted = existing.predictedCosts[existing.predictedCosts.length - 1];
      const error = Math.abs(lastPredicted - actualCost);
      existing.accuracy = Math.max(0, 100 - (error / actualCost) * 100);
    }

    this.mlTaskCosts.set(taskId, existing);

    try {
      const costsObj = Object.fromEntries(this.mlTaskCosts.entries());
      await AsyncStorage.setItem(STORAGE_KEYS.ML_TASK_COSTS, JSON.stringify(costsObj));
    } catch (err) {
      logError('spoonEconomist', 'Failed to save ML task costs', err);
    }
  }

  async predictTaskCost(taskId: string, context: TaskContext): Promise<{ cost: number; confidence: number }> {
    const history = this.mlTaskCosts.get(taskId);
    const task = this.getTask(taskId);
    
    if (!history || history.actualCosts.length < 3) {
      return { cost: task?.baseCost || 1, confidence: 30 };
    }

    // Context-weighted average
    let totalWeight = 0;
    let weightedSum = 0;

    history.actualCosts.forEach((cost, i) => {
      const ctx = history.contexts[i];
      let weight = 1;

      // Higher weight for similar contexts
      if (Math.abs(ctx.painLevel - context.painLevel) <= 2) weight += 0.5;
      if (Math.abs(ctx.stressLevel - context.stressLevel) <= 2) weight += 0.5;
      if (Math.abs(ctx.timeOfDay - context.timeOfDay) <= 3) weight += 0.3;

      totalWeight += weight;
      weightedSum += cost * weight;
    });

    const predictedCost = Math.round(weightedSum / totalWeight);
    history.predictedCosts.push(predictedCost);

    return {
      cost: predictedCost,
      confidence: Math.min(95, 50 + history.actualCosts.length * 5),
    };
  }

  // ============================================================================
  // 7-DAY FORECAST
  // ============================================================================

  async getWeekForecast(): Promise<SpoonForecast[]> {
    const forecasts: SpoonForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Analyze historical patterns for this day of week
      const dayOfWeek = date.getDay();
      const historicalBudgets = Array.from(this.budgets.values())
        .filter(b => new Date(b.date).getDay() === dayOfWeek);

      const avgSpent = historicalBudgets.length > 0
        ? historicalBudgets.reduce((s, b) => s + b.spent, 0) / historicalBudgets.length
        : (this.account?.maxSpoons || 12) * 0.7;

      forecasts.push({
        date: dateStr,
        predictedMax: this.account?.maxSpoons || 12,
        predictedSpent: Math.round(avgSpent),
        suggestedTasks: dayOfWeek === 0 || dayOfWeek === 6 ? ['Rest', 'Light activity'] : ['Normal routine'],
        avoidTasks: avgSpent > (this.account?.maxSpoons || 12) * 0.8 ? ['Heavy physical tasks'] : [],
        weatherImpact: 0, // Would integrate with weather API
        sleepDebtImpact: this.account?.debtSpoons ? -1 : 0,
      });
    }

    return forecasts;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const spoonEconomist = SpoonEconomistManager.getInstance();

// ============================================================================
// React Hook
// ============================================================================

export function useSpoonEconomist() {
  const [account, setAccount] = React.useState<SpoonAccount | null>(spoonEconomist.getAccount());
  const [crashPrediction, setCrashPrediction] = React.useState<SpoonPrediction | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAccount(spoonEconomist.getAccount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-update crash prediction every 30 seconds
  React.useEffect(() => {
    const updatePrediction = async () => {
      const prediction = await spoonEconomist.predictSpoonCrash();
      setCrashPrediction(prediction);
    };
    updatePrediction();
    const interval = setInterval(updatePrediction, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    account,
    crashPrediction,
    spendSpoons: (taskId: string, customCost?: number, context?: TaskContext) => 
      spoonEconomist.spendSpoons(taskId, customCost, context),
    borrowSpoons: (amount: number) => spoonEconomist.borrowSpoons(amount),
    earnBonus: (amount: number, reason: string) => spoonEconomist.earnBonus(amount, reason),
    endDay: () => spoonEconomist.endDay(),
    getMonthlyReport: (year: number, month: number) => spoonEconomist.getMonthlyReport(year, month),
    getAllTasks: () => spoonEconomist.getAllTasks(),
    getTransactions: (limit?: number) => spoonEconomist.getTransactions(limit),

    // =========== CUSTOMIZATION ===========
    setMaxSpoons: (max: number) => spoonEconomist.setMaxSpoons(max),
    addCustomTask: (task: Omit<SpoonTask, 'id'>) => spoonEconomist.addCustomTask(task),
    deleteCustomTask: (taskId: string) => spoonEconomist.deleteCustomTask(taskId),
    updateCustomTask: (taskId: string, updates: Partial<Omit<SpoonTask, 'id'>>) => 
      spoonEconomist.updateCustomTask(taskId, updates),
    getCustomTasks: () => spoonEconomist.getCustomTasks(),

    // =========== AI PREDICTIVE FEATURES ===========
    predictCrash: () => spoonEconomist.predictSpoonCrash(),
    learnTaskCost: (taskId: string, actualCost: number, context: TaskContext) =>
      spoonEconomist.learnTaskCost(taskId, actualCost, context),
    predictTaskCost: (taskId: string, context: TaskContext) =>
      spoonEconomist.predictTaskCost(taskId, context),
    getWeekForecast: () => spoonEconomist.getWeekForecast(),
  };
}
