import { useEffect, useRef, useState } from 'react';
import type { WalkthroughStep } from '@/hooks/useWalkthrough';
import './Walkthrough.css';

interface WalkthroughProps {
  isActive: boolean;
  currentStep: WalkthroughStep;
  onNext: () => void;
  onSkip: () => void;
}

const STEP_CONFIG: Record<
  WalkthroughStep,
  {
    title: string;
    description: string;
    targetId?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  }
> = {
  welcome: {
    title: 'Welcome to the Adventist Logo Creator',
    description:
      "This tool helps you create official Seventh-day Adventist logo lockups for your organization. Let's walk through the process in under 2 minutes.",
    position: 'center',
  },
  'entity-type': {
    title: 'Choose Your Entity Type',
    description:
      'Start by selecting what kind of organization you are: a Church, Conference, Union, or Institution. Each has specific logo variations.',
    targetId: 'walkthrough-entity-type',
    position: 'bottom',
  },
  language: {
    title: 'Select Your Language',
    description:
      'Choose the language for your logo text. You can use English or other available languages. Only verified translations are ready for publication.',
    targetId: 'walkthrough-language',
    position: 'bottom',
  },
  layout: {
    title: 'Pick Your Layout',
    description:
      'Select how you want your logo arranged: Horizontal (side-by-side), Vertical (stacked), or Symbol only (just the church icon).',
    targetId: 'walkthrough-layout',
    position: 'bottom',
  },
  'entity-name': {
    title: 'Add Your Organization Name',
    description:
      'Type your official organization name. This will appear on the logo. Leave it blank if you only want the base denomination logo.',
    targetId: 'walkthrough-entity-name',
    position: 'bottom',
  },
  color: {
    title: 'Choose Your Logo Color',
    description:
      'Select the color for your logo. The official palette ensures your logo meets brand guidelines.',
    targetId: 'walkthrough-color',
    position: 'bottom',
  },
  background: {
    title: 'Set Preview Background',
    description:
      "Choose a background color to preview how your logo looks. This background is only for preview—it won't be included in the download.",
    targetId: 'walkthrough-background',
    position: 'bottom',
  },
  'clear-space': {
    title: 'Include Clear Space (Optional)',
    description:
      'The clear space protects your logo from being crowded when placed in documents. Toggle this on to include the required spacing.',
    targetId: 'walkthrough-clear-space',
    position: 'bottom',
  },
  download: {
    title: 'Download Your Logo',
    description:
      "When you're happy with your preview, scroll down to download your logo as SVG or PNG. SVG is recommended for scalability.",
    targetId: 'walkthrough-download',
    position: 'top',
  },
  complete: {
    title: "You're All Set!",
    description:
      'You now know how to create logos. Experiment with different options to find the perfect look for your organization. You can restart this guide anytime from the menu.',
    position: 'center',
  },
};

export function Walkthrough({
  isActive,
  currentStep,
  onNext,
  onSkip,
}: WalkthroughProps): React.JSX.Element | null {
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [highlightBox, setHighlightBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const config = STEP_CONFIG[currentStep];
  const targetId = config.targetId;

  useEffect(() => {
    if (!isActive || !targetId) {
      setHighlightBox(null);
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      setHighlightBox(null);
      return;
    }

    // Bring the target into view first so both the highlight and the
    // popup are computed against its final, visible position. Guarded
    // since jsdom (used in tests) doesn't implement scrollIntoView.
    target.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const updateHighlight = () => {
      const rect = target.getBoundingClientRect();
      setHighlightBox({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    };

    updateHighlight();
    // Re-measure after the smooth scroll settles.
    const settleTimer = window.setTimeout(updateHighlight, 350);

    return () => {
      window.clearTimeout(settleTimer);
    };
  }, [isActive, targetId, currentStep]);

  useEffect(() => {
    if (!isActive) return;

    const computePosition = () => {
      const popup = popupRef.current;
      if (!popup) return;

      const popupRect = popup.getBoundingClientRect();
      const target = targetId ? document.getElementById(targetId) : null;

      let top = 0;
      let left = 0;

      if (target && config.position && config.position !== 'center') {
        // Fixed-position popup: coordinates are relative to the viewport,
        // so do NOT add window.scrollY/scrollX here — doing so was the
        // cause of the popup drifting off-screen as the page scrolled.
        const targetRect = target.getBoundingClientRect();

        if (config.position === 'top') {
          top = targetRect.top - popupRect.height - 20;
          left = targetRect.left + (targetRect.width - popupRect.width) / 2;
        } else if (config.position === 'bottom') {
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width - popupRect.width) / 2;
        } else if (config.position === 'left') {
          top = targetRect.top + (targetRect.height - popupRect.height) / 2;
          left = targetRect.left - popupRect.width - 20;
        } else {
          top = targetRect.top + (targetRect.height - popupRect.height) / 2;
          left = targetRect.right + 20;
        }
      } else {
        top = window.innerHeight / 2 - popupRect.height / 2;
        left = window.innerWidth / 2 - popupRect.width / 2;
      }

      // Constrain to viewport on both axes so the popup can never render
      // partly or fully off-screen, e.g. on short mobile viewports.
      const padding = 16;
      if (left < padding) left = padding;
      if (left + popupRect.width > window.innerWidth - padding) {
        left = Math.max(padding, window.innerWidth - popupRect.width - padding);
      }
      if (top < padding) top = padding;
      if (top + popupRect.height > window.innerHeight - padding) {
        top = Math.max(padding, window.innerHeight - popupRect.height - padding);
      }

      setPopupPosition({ top, left });
    };

    computePosition();
    // Recompute after the target's smooth scroll-into-view settles, and
    // keep tracking the target while the user scrolls or rotates/resizes
    // the device — otherwise the popup can end up stranded off-screen.
    const settleTimer = window.setTimeout(computePosition, 350);
    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isActive, targetId, currentStep, config.position]);

  if (!isActive) return null;

  return (
    <>
      {/* Overlay */}
      <div className="walkthrough-overlay" onClick={onSkip} aria-hidden="true" />

      {/* Highlight Box */}
      {highlightBox && (
        <div
          className="walkthrough-highlight"
          style={{
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Popup */}
      <div
        ref={popupRef}
        className="walkthrough-popup"
        style={{
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
        }}
        role="dialog"
        aria-label="Tutorial step"
      >
        <div className="walkthrough-popup__content">
          <h2 className="walkthrough-popup__title">{config.title}</h2>
          <p className="walkthrough-popup__description">{config.description}</p>
        </div>

        <div className="walkthrough-popup__actions">
          <button
            type="button"
            className="walkthrough-popup__button walkthrough-popup__button--secondary"
            onClick={onSkip}
          >
            Skip Tutorial
          </button>
          <button type="button" className="walkthrough-popup__button" onClick={onNext}>
            {currentStep === 'complete' ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
