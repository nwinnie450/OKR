import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Objective, KeyResult, CheckIn } from '@/types/okr';

interface OKRState {
  // Data
  objectives: Objective[];
  keyResults: KeyResult[];
  checkIns: CheckIn[];

  // Objectives CRUD
  createObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => Objective;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  getObjective: (id: string) => Objective | undefined;
  getObjectivesByOwner: (ownerId: string) => Objective[];
  getObjectivesByTeam: (teamId: string) => Objective[];

  // Key Results CRUD
  createKeyResult: (kr: Omit<KeyResult, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'currentValue'>) => KeyResult;
  updateKeyResult: (id: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (id: string) => void;
  getKeyResult: (id: string) => KeyResult | undefined;
  getKeyResultsByObjective: (objectiveId: string) => KeyResult[];

  // Check-ins CRUD
  createCheckIn: (checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'submittedAt'>) => CheckIn;
  getCheckInsByKeyResult: (keyResultId: string) => CheckIn[];
  getLatestCheckIn: (keyResultId: string) => CheckIn | undefined;

  // Computed/Helper methods
  calculateObjectiveProgress: (objectiveId: string) => number;
  recalculateAllProgress: () => void;
  getAtRiskOKRs: () => Objective[];
  getOverdueKeyResults: () => KeyResult[];
}

// Helper: Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper: Calculate KR progress
const calculateKRProgress = (kr: Pick<KeyResult, 'startingValue' | 'currentValue' | 'targetValue'>): number => {
  const { startingValue, currentValue, targetValue } = kr;
  if (targetValue === startingValue) return 100;
  const progress = ((currentValue - startingValue) / (targetValue - startingValue)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

// Helper: Determine confidence level based on progress and timeline
const determineConfidence = (progress: number, daysRemaining?: number): 'on-track' | 'at-risk' | 'off-track' => {
  if (progress >= 70) return 'on-track';
  if (progress >= 40) return 'at-risk';
  return 'off-track';
};

export const useOKRStore = create<OKRState>()(
  persist(
    (set, get) => ({
      // Initial state
      objectives: [],
      keyResults: [],
      checkIns: [],

      // Create Objective
      createObjective: (data) => {
        const now = new Date().toISOString();
        const newObjective: Objective = {
          ...data,
          id: generateId(),
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          objectives: [...state.objectives, newObjective],
        }));

        return newObjective;
      },

      // Update Objective
      updateObjective: (id, updates) => {
        set((state) => ({
          objectives: state.objectives.map((obj) =>
            obj.id === id
              ? { ...obj, ...updates, updatedAt: new Date().toISOString() }
              : obj
          ),
        }));
      },

      // Delete Objective (also deletes related KRs)
      deleteObjective: (id) => {
        set((state) => ({
          objectives: state.objectives.filter((obj) => obj.id !== id),
          keyResults: state.keyResults.filter((kr) => kr.objectiveId !== id),
        }));
      },

      // Get Objective by ID
      getObjective: (id) => {
        return get().objectives.find((obj) => obj.id === id);
      },

      // Get Objectives by Owner
      getObjectivesByOwner: (ownerId) => {
        return get().objectives.filter((obj) => obj.ownerId === ownerId);
      },

      // Get Objectives by Team
      getObjectivesByTeam: (teamId) => {
        return get().objectives.filter((obj) => obj.teamId === teamId);
      },

      // Create Key Result
      createKeyResult: (data) => {
        const now = new Date().toISOString();
        const newKR: KeyResult = {
          ...data,
          id: generateId(),
          currentValue: data.startingValue,
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          keyResults: [...state.keyResults, newKR],
        }));

        // Recalculate objective progress
        get().calculateObjectiveProgress(data.objectiveId);

        return newKR;
      },

      // Update Key Result
      updateKeyResult: (id, updates) => {
        set((state) => {
          const kr = state.keyResults.find((k) => k.id === id);
          if (!kr) return state;

          const updatedKR = { ...kr, ...updates, updatedAt: new Date().toISOString() };

          // Recalculate progress if values changed
          if (
            updates.currentValue !== undefined ||
            updates.startingValue !== undefined ||
            updates.targetValue !== undefined
          ) {
            updatedKR.progress = calculateKRProgress(updatedKR);
            updatedKR.confidence = determineConfidence(updatedKR.progress);
          }

          return {
            keyResults: state.keyResults.map((k) => (k.id === id ? updatedKR : k)),
          };
        });

        // Recalculate parent objective progress
        const kr = get().keyResults.find((k) => k.id === id);
        if (kr) {
          get().calculateObjectiveProgress(kr.objectiveId);
        }
      },

      // Delete Key Result
      deleteKeyResult: (id) => {
        const kr = get().keyResults.find((k) => k.id === id);
        const objectiveId = kr?.objectiveId;

        set((state) => ({
          keyResults: state.keyResults.filter((k) => k.id !== id),
          checkIns: state.checkIns.filter((ci) => ci.keyResultId !== id),
        }));

        // Recalculate parent objective progress
        if (objectiveId) {
          get().calculateObjectiveProgress(objectiveId);
        }
      },

      // Get Key Result by ID
      getKeyResult: (id) => {
        return get().keyResults.find((kr) => kr.id === id);
      },

      // Get Key Results by Objective
      getKeyResultsByObjective: (objectiveId) => {
        return get().keyResults.filter((kr) => kr.objectiveId === objectiveId);
      },

      // Create Check-in
      createCheckIn: (data) => {
        const now = new Date().toISOString();
        const newCheckIn: CheckIn = {
          ...data,
          id: generateId(),
          createdAt: now,
          submittedAt: now,
        };

        set((state) => ({
          checkIns: [...state.checkIns, newCheckIn],
        }));

        // Update the Key Result with new values
        get().updateKeyResult(data.keyResultId, {
          currentValue: data.currentValue,
          progress: data.progress,
          confidence: data.confidence,
          lastCheckinAt: now,
        });

        return newCheckIn;
      },

      // Get Check-ins by Key Result
      getCheckInsByKeyResult: (keyResultId) => {
        return get()
          .checkIns.filter((ci) => ci.keyResultId === keyResultId)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },

      // Get Latest Check-in
      getLatestCheckIn: (keyResultId) => {
        const checkIns = get().getCheckInsByKeyResult(keyResultId);
        return checkIns[0];
      },

      // Calculate Objective Progress (average of all KRs)
      calculateObjectiveProgress: (objectiveId) => {
        const krs = get().getKeyResultsByObjective(objectiveId);
        if (krs.length === 0) return 0;

        const totalProgress = krs.reduce((sum, kr) => sum + kr.progress, 0);
        const avgProgress = Math.round(totalProgress / krs.length);

        // Determine confidence based on average progress
        const confidence = determineConfidence(avgProgress);

        // Update objective
        get().updateObjective(objectiveId, {
          progress: avgProgress,
          confidence,
        });

        return avgProgress;
      },

      // Recalculate all progress (useful after bulk imports)
      recalculateAllProgress: () => {
        const { objectives } = get();
        objectives.forEach((obj) => {
          get().calculateObjectiveProgress(obj.id);
        });
      },

      // Get At-Risk OKRs
      getAtRiskOKRs: () => {
        return get().objectives.filter(
          (obj) => obj.status === 'active' && (obj.confidence === 'at-risk' || obj.confidence === 'off-track')
        );
      },

      // Get Overdue Key Results (no check-in in last 7 days)
      getOverdueKeyResults: () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return get().keyResults.filter((kr) => {
          if (!kr.lastCheckinAt) return true; // Never checked in
          return new Date(kr.lastCheckinAt) < sevenDaysAgo;
        });
      },
    }),
    {
      name: 'okr-storage', // localStorage key
      partialize: (state) => ({
        objectives: state.objectives,
        keyResults: state.keyResults,
        checkIns: state.checkIns,
      }),
    }
  )
);
