import { useState, useEffect, useCallback } from 'react';
import type { CheckInForm, KeyResult, ConfidenceLevel } from '@/types/okr';

// Local storage key
const DRAFT_KEY = 'okr_checkin_draft';

export interface CheckInDraft extends CheckInForm {
  timestamp: string;
}

export interface CheckInState {
  keyResults: KeyResult[];
  currentIndex: number;
  formData: Map<string, CheckInForm>;
  isComplete: boolean;
  startTime: number;
}

export function useCheckIn(keyResults: KeyResult[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Map<string, CheckInForm>>(new Map());
  const [startTime] = useState(Date.now());
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!hasLoadedDraft && keyResults.length > 0) {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          const draftMap = new Map<string, CheckInForm>(Object.entries(parsed.data));
          setFormData(draftMap);

          // Find the first incomplete KR
          const firstIncompleteIndex = keyResults.findIndex(
            kr => !draftMap.has(kr.id)
          );
          if (firstIncompleteIndex > -1) {
            setCurrentIndex(firstIncompleteIndex);
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
      setHasLoadedDraft(true);
    }
  }, [keyResults, hasLoadedDraft]);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    if (hasLoadedDraft && formData.size > 0) {
      try {
        const draftObject = Object.fromEntries(formData);
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            data: draftObject,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }
  }, [formData, hasLoadedDraft]);

  // Calculate suggested value (last value + 5%)
  const getSuggestedValue = useCallback((kr: KeyResult): number => {
    const increment = (kr.targetValue - kr.startingValue) * 0.05;
    const suggested = kr.currentValue + increment;
    return Math.min(Math.max(suggested, kr.startingValue), kr.targetValue);
  }, []);

  // Auto-calculate confidence based on progress
  const getAutoConfidence = useCallback((currentValue: number, kr: KeyResult): ConfidenceLevel => {
    const totalRange = kr.targetValue - kr.startingValue;
    const currentProgress = currentValue - kr.startingValue;
    const progressPercent = (currentProgress / totalRange) * 100;

    // Calculate expected progress (assuming linear growth over time)
    const quarterDuration = 13 * 7 * 24 * 60 * 60 * 1000; // 13 weeks in ms
    const startDate = new Date(kr.createdAt).getTime();
    const endDate = kr.dueDate ? new Date(kr.dueDate).getTime() : startDate + quarterDuration;
    const now = Date.now();
    const timeElapsed = now - startDate;
    const totalTime = endDate - startDate;
    const expectedProgress = (timeElapsed / totalTime) * 100;

    // Compare actual vs expected
    const progressDelta = progressPercent - expectedProgress;

    if (progressDelta >= -5) return 'on-track';
    if (progressDelta >= -15) return 'at-risk';
    return 'off-track';
  }, []);

  // Update form data for a specific KR
  const updateCheckIn = useCallback((keyResultId: string, data: Partial<CheckInForm>) => {
    setFormData(prev => {
      const updated = new Map(prev);
      const existing = updated.get(keyResultId) || {
        keyResultId,
        currentValue: 0,
        confidence: 'on-track' as ConfidenceLevel,
      };
      updated.set(keyResultId, { ...existing, ...data });
      return updated;
    });
  }, []);

  // Navigate to next KR
  const goToNext = useCallback(() => {
    if (currentIndex < keyResults.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, keyResults.length]);

  // Navigate to previous KR
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Skip current KR
  const skipCurrent = useCallback(() => {
    goToNext();
  }, [goToNext]);

  // Jump to specific KR
  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < keyResults.length) {
      setCurrentIndex(index);
    }
  }, [keyResults.length]);

  // Calculate time taken
  const getTimeTaken = useCallback(() => {
    const elapsed = Date.now() - startTime;
    return Math.floor(elapsed / 1000); // seconds
  }, [startTime]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setFormData(new Map());
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Check if all required KRs have been updated
  const isComplete = formData.size === keyResults.length;

  // Get current KR
  const currentKR = keyResults[currentIndex];

  // Get form data for current KR
  const currentFormData = currentKR ? formData.get(currentKR.id) : undefined;

  return {
    // State
    currentIndex,
    currentKR,
    keyResults,
    formData,
    currentFormData,
    isComplete,

    // Actions
    updateCheckIn,
    goToNext,
    goToPrevious,
    skipCurrent,
    goToIndex,
    clearDraft,

    // Utilities
    getSuggestedValue,
    getAutoConfidence,
    getTimeTaken,
  };
}
