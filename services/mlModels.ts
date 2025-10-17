/**
 * ML Model Versioning Service (Phase 6.8)
 *
 * Manages multiple versions of ML models with A/B testing capabilities:
 * - Model registration and version tracking
 * - A/B test configuration and rollout management
 * - Accuracy metrics and performance monitoring
 * - User assignment to model versions
 * - Retraining schedules and model updates
 * - Feedback integration for continuous improvement
 *
 * Models tracked:
 * 1. Energy Prediction Model (energyPrediction.ts)
 * 2. Pattern Learning Model (patternLearning.ts)
 * 3. Smart Notifications Model (smartNotifications.ts)
 */

import type { Database, DataSnapshot } from 'firebase/database';
import { get, limitToLast, orderByChild, query, ref, set } from 'firebase/database';

/**
 * ML Model types
 */
export enum MLModelType {
  ENERGY_PREDICTION = 'energy_prediction',
  PATTERN_LEARNING = 'pattern_learning',
  SMART_NOTIFICATIONS = 'smart_notifications',
}

/**
 * Model version status
 */
export enum ModelStatus {
  DEVELOPMENT = 'development', // In development, not yet tested
  TESTING = 'testing', // Running A/B test
  PRODUCTION = 'production', // Rolled out to all users
  DEPRECATED = 'deprecated', // No longer in use
}

/**
 * A/B test assignment
 */
export enum ABTestGroup {
  CONTROL = 'control', // Using previous/baseline model
  TREATMENT = 'treatment', // Using new model
}

/**
 * Model version definition
 */
export interface MLModel {
  id: string; // Unique model identifier
  type: MLModelType;
  version: string; // Semantic versioning (e.g., "2.1.0")
  status: ModelStatus;
  
  // Model metadata
  name: string;
  description: string;
  createdAt: number; // Unix timestamp
  updatedAt: number;
  
  // Accuracy metrics
  metrics: {
    accuracyScore: number; // 0-100
    precision?: number; // For classification models
    recall?: number;
    f1Score?: number;
    meanAbsoluteError?: number; // For regression models
    rmse?: number; // Root mean squared error
    evaluationDataSize: number; // Number of data points used
    evaluationDate?: number;
  };

  // A/B Testing
  abTest?: {
    enabled: boolean;
    treatmentSplit: number; // 0-1, percentage of users in treatment group
    startDate: number; // Unix timestamp
    endDate?: number;
    successMetric: 'accuracy' | 'engagement' | 'user_satisfaction'; // What we're optimizing for
    targetImprovement: number; // e.g., 5% improvement
  };

  // Feedback integration
  feedbackThreshold: number; // Minimum feedback samples to retrain
  feedbackIntegrated: boolean; // If feedback has been used to improve model
  lastRetrainingDate?: number;

  // Model file and configuration
  modelConfig: {
    algorithm: string; // e.g., "weighted_ensemble", "linear_regression"
    hyperparameters: Record<string, unknown>;
    features: string[]; // Features used by model
    dependencies: string[]; // Services/data this model depends on
  };

  // Rollout configuration
  rollout?: {
    startedAt: number;
    completedAt?: number;
    currentPercentage: number; // 0-100 of users on new model
    rolloutErrors?: number;
  };
}

/**
 * User-model assignment
 */
export interface UserModelAssignment {
  userId: string;
  modelId: string;
  modelVersion: string;
  abTestGroup: ABTestGroup;
  assignedAt: number;
  feedback?: Array<{
    timestamp: number;
    rating: 1 | 2 | 3 | 4 | 5; // 1-5 star rating
    accuracy?: number; // 0-100 if applicable
    notes?: string;
  }>;
}

/**
 * Model performance comparison (for A/B tests)
 */
export interface ModelComparison {
  controlModel: MLModel;
  treatmentModel: MLModel;
  sampleSize: number;
  controlAccuracy: number;
  treatmentAccuracy: number;
  improvementPercentage: number;
  statisticallySignificant: boolean;
  confidence: number; // 0-100, statistical confidence
  recommendation: 'rollout' | 'continue_test' | 'revert' | 'inconclusive';
}

/**
 * Register a new ML model
 */
export async function registerMLModel(
  database: Database,
  model: Omit<MLModel, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<MLModel> {
  const now = Date.now();
  const id = `model_${model.type}_${model.version}_${now}`;

  const fullModel: MLModel = {
    ...model,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const modelRef = ref(database, `mlModels/${id}`);
    await set(modelRef, fullModel);
  } catch {
    // Log but don't fail
  }

  return fullModel;
}

/**
 * Get all models of a specific type
 */
export async function getModelsByType(
  database: Database,
  type: MLModelType,
): Promise<MLModel[]> {
  try {
    const modelsRef = query(
      ref(database, 'mlModels'),
      orderByChild('type'),
      limitToLast(100),
    );

    const snapshot = (await get(modelsRef)) as DataSnapshot;

    if (!snapshot.exists()) {
      return [];
    }

    const models: MLModel[] = [];
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      const model = childSnapshot.val() as MLModel;
      if (model.type === type) {
        models.push(model);
      }
    });

    return models.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Get current production model for a type
 */
export async function getProductionModel(
  database: Database,
  type: MLModelType,
): Promise<MLModel | null> {
  const models = await getModelsByType(database, type);
  const productionModels = models.filter(m => m.status === ModelStatus.PRODUCTION);
  return productionModels.length > 0 ? productionModels[0] : null;
}

/**
 * Assign user to a model version (for A/B testing)
 */
export async function assignUserToModel(
  database: Database,
  userId: string,
  model: MLModel,
  splitPercentage: number = 50,
): Promise<ABTestGroup> {
  // Deterministic assignment based on userId hash (ensures same user always gets same group)
  const userHash = hashUserId(userId);
  const group = (userHash % 100) < splitPercentage ? ABTestGroup.TREATMENT : ABTestGroup.CONTROL;

  const assignment: UserModelAssignment = {
    userId,
    modelId: model.id,
    modelVersion: model.version,
    abTestGroup: group,
    assignedAt: Date.now(),
  };

  try {
    const assignmentRef = ref(database, `users/${userId}/modelAssignments/${model.type}`);
    await set(assignmentRef, assignment);
  } catch {
    // Log but don't fail
  }

  return group;
}

/**
 * Get user's assigned model group
 */
export async function getUserModelAssignment(
  database: Database,
  userId: string,
  modelType: MLModelType,
): Promise<ABTestGroup> {
  try {
    const assignmentRef = ref(database, `users/${userId}/modelAssignments/${modelType}`);
    const snapshot = await get(assignmentRef);

    if (snapshot.exists()) {
      const assignment = snapshot.val() as UserModelAssignment;
      return assignment.abTestGroup;
    }
  } catch {
    // Continue to default
  }

  // Default to control group
  return ABTestGroup.CONTROL;
}

/**
 * Record feedback for a model from a user
 */
export async function recordModelFeedback(
  database: Database,
  userId: string,
  modelId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  accuracy?: number,
  notes?: string,
): Promise<void> {
  try {
    const feedbackRef = ref(database, `mlModels/${modelId}/feedback/${userId}_${Date.now()}`);
    await set(feedbackRef, {
      userId,
      timestamp: Date.now(),
      rating,
      accuracy,
      notes,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Calculate accuracy from feedback
 */
export async function calculateModelAccuracy(
  database: Database,
  modelId: string,
): Promise<number> {
  try {
    const feedbackRef = ref(database, `mlModels/${modelId}/feedback`);
    const snapshot = await get(feedbackRef);

    if (!snapshot.exists()) {
      return 0;
    }

    const feedbacks = snapshot.val() as Record<string, any>;
    let totalAccuracy = 0;
    let count = 0;

    Object.values(feedbacks).forEach((fb: any) => {
      if (fb.accuracy !== undefined) {
        totalAccuracy += fb.accuracy;
        count += 1;
      } else if (fb.rating !== undefined) {
        // Convert star rating to accuracy estimate (5 stars = 100%)
        totalAccuracy += (fb.rating / 5) * 100;
        count += 1;
      }
    });

    return count > 0 ? Math.round(totalAccuracy / count) : 0;
  } catch {
    return 0;
  }
}

/**
 * Start A/B test for a model
 */
export async function startABTest(
  database: Database,
  modelId: string,
  treatmentSplit: number = 20,
  successMetric: 'accuracy' | 'engagement' | 'user_satisfaction' = 'accuracy',
  targetImprovement: number = 5,
): Promise<void> {
  try {
    const modelRef = ref(database, `mlModels/${modelId}`);
    const snapshot = await get(modelRef);

    if (snapshot.exists()) {
      const model = snapshot.val() as MLModel;
      await set(modelRef, {
        ...model,
        abTest: {
          enabled: true,
          treatmentSplit,
          startDate: Date.now(),
          successMetric,
          targetImprovement,
        },
        status: ModelStatus.TESTING,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * End A/B test and rollout model if successful
 */
export async function completeABTest(
  database: Database,
  modelId: string,
  successful: boolean,
): Promise<void> {
  try {
    const modelRef = ref(database, `mlModels/${modelId}`);
    const snapshot = await get(modelRef);

    if (snapshot.exists()) {
      const model = snapshot.val() as MLModel;
      const newStatus = successful ? ModelStatus.PRODUCTION : ModelStatus.DEPRECATED;

      await set(modelRef, {
        ...model,
        status: newStatus,
        abTest: {
          ...model.abTest,
          enabled: false,
          endDate: Date.now(),
        },
        rollout: successful ? {
          startedAt: Date.now(),
          currentPercentage: 100,
        } : undefined,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get statistics for all models of a type
 */
export async function getModelStatistics(
  database: Database,
  type: MLModelType,
): Promise<{
  totalModels: number;
  productionCount: number;
  testingCount: number;
  averageAccuracy: number;
  bestPerformingModel: MLModel | null;
}> {
  const models = await getModelsByType(database, type);

  const productionModels = models.filter(m => m.status === ModelStatus.PRODUCTION);
  const testingModels = models.filter(m => m.status === ModelStatus.TESTING);

  let totalAccuracy = 0;
  let accuracyCount = 0;
  let bestModel: MLModel | null = null;
  let bestAccuracy = 0;

  models.forEach(m => {
    if (m.metrics?.accuracyScore) {
      totalAccuracy += m.metrics.accuracyScore;
      accuracyCount += 1;

      if (m.metrics.accuracyScore > bestAccuracy) {
        bestAccuracy = m.metrics.accuracyScore;
        bestModel = m;
      }
    }
  });

  return {
    totalModels: models.length,
    productionCount: productionModels.length,
    testingCount: testingModels.length,
    averageAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0,
    bestPerformingModel: bestModel,
  };
}

/**
 * Simple hash function for user ID (for deterministic assignment)
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
     
    hash = ((hash << 5) - hash) + char;
     
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Create model comparison report
 */
export function compareModels(
  controlModel: MLModel,
  treatmentModel: MLModel,
  sampleSize: number,
): ModelComparison {
  const controlAccuracy = controlModel.metrics?.accuracyScore ?? 50;
  const treatmentAccuracy = treatmentModel.metrics?.accuracyScore ?? 50;
  const improvementPercentage = treatmentAccuracy - controlAccuracy;

  // Simple statistical significance (in production, use proper statistics)
  const statisticallySignificant = Math.abs(improvementPercentage) > 2;
  const confidence = Math.min(100, (sampleSize / 1000) * 100);

  let recommendation: 'rollout' | 'continue_test' | 'revert' | 'inconclusive';
  if (improvementPercentage > 5 && statisticallySignificant) {
    recommendation = 'rollout';
  } else if (improvementPercentage < -5 && statisticallySignificant) {
    recommendation = 'revert';
  } else if (confidence < 80) {
    recommendation = 'continue_test';
  } else {
    recommendation = 'inconclusive';
  }

  return {
    controlModel,
    treatmentModel,
    sampleSize,
    controlAccuracy,
    treatmentAccuracy,
    improvementPercentage,
    statisticallySignificant,
    confidence,
    recommendation,
  };
}
