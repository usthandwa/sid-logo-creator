import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalkthrough, type WalkthroughStep } from '@/hooks/useWalkthrough';

describe('useWalkthrough', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with walkthrough inactive on first visit', () => {
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.currentStep).toBe('welcome');
      expect(result.current.hasSeenWalkthrough).toBe(false);
      expect(result.current.isActive).toBe(true);
    });

    it('should not start walkthrough on repeat visits', () => {
      localStorage.setItem('sid-logo-creator:walkthrough-seen', 'true');
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.hasSeenWalkthrough).toBe(true);
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Step Navigation', () => {
    it('should progress through steps correctly', () => {
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.currentStep).toBe('welcome');

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe('entity-type');

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe('language');
    });

    it('should reach complete step at the end', () => {
      const { result } = renderHook(() => useWalkthrough());

      const steps = [
        'welcome',
        'entity-type',
        'language',
        'layout',
        'entity-name',
        'color',
        'background',
        'clear-space',
        'download',
      ];

      for (const step of steps) {
        expect(result.current.currentStep).toBe(step);
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.currentStep).toBe('complete');
      expect(result.current.isActive).toBe(true);
    });

    it('should end walkthrough after complete step', () => {
      const { result } = renderHook(() => useWalkthrough());

      const steps = [
        'welcome',
        'entity-type',
        'language',
        'layout',
        'entity-name',
        'color',
        'background',
        'clear-space',
        'download',
        'complete',
      ];

      for (const step of steps) {
        expect(result.current.currentStep).toBe(step);
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.isActive).toBe(false);
      expect(localStorage.getItem('sid-logo-creator:walkthrough-seen')).toBe('true');
    });
  });

  describe('Skip Walkthrough', () => {
    it('should skip and end walkthrough immediately', () => {
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.skipWalkthrough();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.hasSeenWalkthrough).toBe(true);
    });

    it('should persist skip to localStorage', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.skipWalkthrough();
      });

      expect(localStorage.getItem('sid-logo-creator:walkthrough-seen')).toBe('true');
    });
  });

  describe('Restart Walkthrough', () => {
    it('should restart walkthrough from welcome', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.nextStep();
      });
      act(() => {
        result.current.nextStep();
      });
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe('layout');

      act(() => {
        result.current.startWalkthrough();
      });

      expect(result.current.currentStep).toBe('welcome');
      expect(result.current.isActive).toBe(true);
    });

    it('should not clear seen flag when restarting', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.skipWalkthrough();
      });

      expect(result.current.hasSeenWalkthrough).toBe(true);

      act(() => {
        result.current.startWalkthrough();
      });

      expect(result.current.hasSeenWalkthrough).toBe(true);
    });
  });

  describe('localStorage Persistence', () => {
    it('should read seen status from localStorage', () => {
      localStorage.setItem('sid-logo-creator:walkthrough-seen', 'true');

      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.hasSeenWalkthrough).toBe(true);
      expect(result.current.isActive).toBe(false);
    });

    it('should write seen status to localStorage on skip', () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
        result.current.skipWalkthrough();
      });

      const stored = localStorage.getItem('sid-logo-creator:walkthrough-seen');
      expect(stored).toBe('true');
    });

    it('should write seen status to localStorage on complete', () => {
      const { result } = renderHook(() => useWalkthrough());

      const steps = [
        'welcome',
        'entity-type',
        'language',
        'layout',
        'entity-name',
        'color',
        'background',
        'clear-space',
        'download',
        'complete',
      ];

      for (let i = 0; i < steps.length; i++) {
        act(() => {
          result.current.nextStep();
        });
      }

      const stored = localStorage.getItem('sid-logo-creator:walkthrough-seen');
      expect(stored).toBe('true');
    });
  });

  describe('All Steps Exist', () => {
    it('should have all expected steps in sequence', () => {
      const expectedSteps: readonly WalkthroughStep[] = [
        'welcome',
        'entity-type',
        'language',
        'layout',
        'entity-name',
        'color',
        'background',
        'clear-space',
        'download',
        'complete',
      ];

      const { result } = renderHook(() => useWalkthrough());

      expectedSteps.forEach((_expectedStep, index) => {
        expect(result.current.currentStep).toBe(expectedSteps[index]);
        if (index < expectedSteps.length - 1) {
          act(() => {
            result.current.nextStep();
          });
        }
      });
    });
  });
});
