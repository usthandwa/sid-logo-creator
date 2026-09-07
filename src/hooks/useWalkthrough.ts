import { useEffect, useState } from 'react';

export type WalkthroughStep =
  | 'welcome'
  | 'entity-type'
  | 'language'
  | 'layout'
  | 'entity-name'
  | 'color'
  | 'background'
  | 'clear-space'
  | 'download'
  | 'complete';

interface WalkthroughState {
  isActive: boolean;
  currentStep: WalkthroughStep;
  hasSeenWalkthrough: boolean;
  startWalkthrough: () => void;
  endWalkthrough: () => void;
  nextStep: () => void;
  skipWalkthrough: () => void;
}

const STORAGE_KEY = 'sid-logo-creator:walkthrough-seen';
const STEPS: readonly WalkthroughStep[] = [
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

export function useWalkthrough(): WalkthroughState {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<WalkthroughStep>('welcome');
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === 'true';
    setHasSeenWalkthrough(seen);
    if (!seen) {
      setIsActive(true);
    }
  }, []);

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < STEPS.length - 1) {
      const nextStepValue = STEPS[currentIndex + 1];
      if (nextStepValue) {
        setCurrentStep(nextStepValue);
      }
    } else {
      endWalkthrough();
    }
  };

  const endWalkthrough = () => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeenWalkthrough(true);
  };

  const startWalkthrough = () => {
    setIsActive(true);
    setCurrentStep('welcome');
  };

  const skipWalkthrough = () => {
    endWalkthrough();
  };

  return {
    isActive,
    currentStep,
    hasSeenWalkthrough,
    startWalkthrough,
    endWalkthrough,
    nextStep,
    skipWalkthrough,
  };
}
