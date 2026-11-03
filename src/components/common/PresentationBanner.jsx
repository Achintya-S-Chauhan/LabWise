import {
  ChevronLeft,
  ChevronRight,
  X,
  Award
} from 'lucide-react';
import { PRESENTATION_SLIDES } from './presentationSlides';

export default function PresentationBanner({
  currentSlideIndex,
  onNavigateSlide,
  onExitPresentation
}) {
  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex] || PRESENTATION_SLIDES[0];

  return (
    <div className="presentation-banner-root">
      <div className="presentation-banner-container">
        {/* Left: Branding & Step Indicator */}
        <div className="pres-left-col">
          <div className="pres-badge">
            <Award size={14} className="text-amber" />
            <span>5-MINUTE COMPETITION DEMO</span>
          </div>
          <div className="pres-slide-title">
            {currentSlide.title}
          </div>
          <div className="pres-slide-subtitle">
            {currentSlide.subtitle}
          </div>
        </div>

        {/* Center: Quick Talking Points */}
        <div className="pres-center-col">
          <ul className="pres-talking-points">
            {currentSlide.talkingPoints.map((point, idx) => (
              <li key={idx}>
                <span className="point-bullet">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Stepper Navigation */}
        <div className="pres-right-col">
          <div className="pres-slide-dots">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.step}
                className={`pres-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                onClick={() => onNavigateSlide(idx)}
                title={`Jump to Slide ${s.step}: ${s.title}`}
              >
                {s.step}
              </button>
            ))}
          </div>

          <div className="pres-nav-buttons">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigateSlide(Math.min(PRESENTATION_SLIDES.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>

            <button
              className="btn btn-secondary btn-sm icon-only-btn"
              onClick={onExitPresentation}
              title="Exit Presentation Mode"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
