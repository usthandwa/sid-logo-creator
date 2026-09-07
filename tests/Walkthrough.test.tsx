import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Walkthrough } from '@/components/Walkthrough';
import type { WalkthroughStep } from '@/hooks/useWalkthrough';

describe('Walkthrough Component', () => {
  describe('Rendering', () => {
    it('should not render when inactive', () => {
      const { container } = render(
        <Walkthrough isActive={false} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render overlay and popup when active', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      expect(document.querySelector('.walkthrough-overlay')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup')).toBeInTheDocument();
    });

    it('should render highlight box when target element exists', () => {
      document.body.innerHTML = '<div id="walkthrough-entity-type">Test</div>';

      render(
        <Walkthrough isActive={true} currentStep="entity-type" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      expect(document.querySelector('.walkthrough-highlight')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    const steps: Array<WalkthroughStep> = [
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

    steps.forEach((step) => {
      it(`should render correct title for ${step} step`, () => {
        render(
          <Walkthrough isActive={true} currentStep={step} onNext={vi.fn()} onSkip={vi.fn()} />,
        );

        const title = screen.getByRole('dialog').querySelector('.walkthrough-popup__title');
        expect(title?.textContent).toBeTruthy();
        expect(title?.textContent?.length ?? 0).toBeGreaterThan(0);
      });

      it(`should render description for ${step} step`, () => {
        render(
          <Walkthrough isActive={true} currentStep={step} onNext={vi.fn()} onSkip={vi.fn()} />,
        );

        const description = screen
          .getByRole('dialog')
          .querySelector('.walkthrough-popup__description');
        expect(description?.textContent).toBeTruthy();
        expect(description?.textContent?.length ?? 0).toBeGreaterThan(0);
      });
    });

    it('should show "Get Started" button on complete step', () => {
      render(
        <Walkthrough isActive={true} currentStep="complete" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const button = screen.getByRole('button', { name: /Get Started/i });
      expect(button).toBeInTheDocument();
    });

    it('should show "Next" button on other steps', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const button = screen.getByRole('button', { name: /^Next$/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onNext when Next button clicked', () => {
      const onNext = vi.fn();
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={onNext} onSkip={vi.fn()} />,
      );

      const button = screen.getByRole('button', { name: /^Next$/i });
      fireEvent.click(button);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when Skip Tutorial button clicked', () => {
      const onSkip = vi.fn();
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={onSkip} />,
      );

      const button = screen.getByRole('button', { name: /Skip Tutorial/i });
      fireEvent.click(button);

      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when overlay clicked', () => {
      const onSkip = vi.fn();
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={onSkip} />,
      );

      const overlay = document.querySelector('.walkthrough-overlay') as HTMLElement;
      fireEvent.click(overlay);

      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('should call onNext for complete step', () => {
      const onNext = vi.fn();
      render(
        <Walkthrough isActive={true} currentStep="complete" onNext={onNext} onSkip={vi.fn()} />,
      );

      const button = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(button);

      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label');
    });

    it('should have accessible button text', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Skip Tutorial/i })).toBeInTheDocument();
    });

    it('should have semantic structure', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const popup = screen.getByRole('dialog');
      const title = popup.querySelector('h2');
      const description = popup.querySelector('p');

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should handle center positioning', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const popup = document.querySelector('.walkthrough-popup') as HTMLElement;
      expect(popup).toHaveClass('walkthrough-popup');
      expect(popup).toHaveAttribute('style');
      expect(popup.style.top).toBeTruthy();
      expect(popup.style.left).toBeTruthy();
    });

    it('should position popup when target exists', () => {
      document.body.innerHTML =
        '<div id="walkthrough-entity-type" style="position: absolute; top: 100px; left: 100px; width: 200px; height: 50px;">Target</div>';

      render(
        <Walkthrough isActive={true} currentStep="entity-type" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const popup = document.querySelector('.walkthrough-popup') as HTMLElement;
      expect(popup.style.top).toBeTruthy();
      expect(popup.style.left).toBeTruthy();
    });

    it('should never place the popup above the top of the viewport', () => {
      // Simulate a target near the very top edge, where a "bottom"-flowing
      // popup could previously be pushed off-screen to a negative top.
      const target = document.createElement('div');
      target.id = 'walkthrough-language';
      document.body.appendChild(target);
      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: -10,
        bottom: 10,
        left: 20,
        right: 220,
        width: 200,
        height: 20,
        x: 20,
        y: -10,
        toJSON: () => ({}),
      });

      render(
        <Walkthrough isActive={true} currentStep="language" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const popup = document.querySelector('.walkthrough-popup') as HTMLElement;
      const top = parseFloat(popup.style.top);
      expect(top).toBeGreaterThanOrEqual(0);
    });

    it('should never place the popup below the bottom of the viewport, even when the page is scrolled', () => {
      // Regression test: the popup uses position:fixed, whose coordinates
      // are already relative to the viewport. Previously the calculation
      // also added window.scrollY, so as the user scrolled down to reach
      // a field further down the page (e.g. "download" on mobile), the
      // popup drifted further and further below the visible viewport.
      Object.defineProperty(window, 'scrollY', { value: 2000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 700, configurable: true });

      const target = document.createElement('div');
      target.id = 'walkthrough-download';
      document.body.appendChild(target);
      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 600,
        bottom: 650,
        left: 20,
        right: 220,
        width: 200,
        height: 50,
        x: 20,
        y: 600,
        toJSON: () => ({}),
      });

      render(
        <Walkthrough isActive={true} currentStep="download" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      const popup = document.querySelector('.walkthrough-popup') as HTMLElement;
      const top = parseFloat(popup.style.top);
      const height = popup.getBoundingClientRect().height;

      expect(top + height).toBeLessThanOrEqual(700);
      expect(top).toBeGreaterThanOrEqual(0);

      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct CSS classes', () => {
      render(
        <Walkthrough isActive={true} currentStep="welcome" onNext={vi.fn()} onSkip={vi.fn()} />,
      );

      expect(document.querySelector('.walkthrough-overlay')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup__content')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup__actions')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup__title')).toBeInTheDocument();
      expect(document.querySelector('.walkthrough-popup__description')).toBeInTheDocument();
    });
  });

  describe('Step Content Validation', () => {
    it('should have unique titles for each step', () => {
      const titles = new Set<string>();
      const steps: Array<WalkthroughStep> = [
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

      steps.forEach((step) => {
        const { unmount } = render(
          <Walkthrough isActive={true} currentStep={step} onNext={vi.fn()} onSkip={vi.fn()} />,
        );

        const title = screen.getByRole('dialog').querySelector('.walkthrough-popup__title');
        const titleText = title?.textContent || '';
        titles.add(titleText);

        unmount();
      });

      expect(titles.size).toBe(steps.length);
    });

    it('should have substantial descriptions for all steps', () => {
      const steps: Array<WalkthroughStep> = [
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

      steps.forEach((step) => {
        const { unmount } = render(
          <Walkthrough isActive={true} currentStep={step} onNext={vi.fn()} onSkip={vi.fn()} />,
        );

        const description = screen
          .getByRole('dialog')
          .querySelector('.walkthrough-popup__description');
        const descriptionText = description?.textContent || '';

        expect(descriptionText.length).toBeGreaterThan(20);

        unmount();
      });
    });
  });
});
