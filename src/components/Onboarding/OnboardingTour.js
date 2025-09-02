// src/components/Onboarding/OnboardingTour.js
import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Play, SkipForward, CheckCircle,
  Lightbulb, Zap, Target, Users, FileText, MessageSquare, Settings
} from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your AI Board of Advisors',
    description: 'Get expert guidance from world-class advisors powered by AI. Let\'s get you started in just a few steps.',
    icon: Lightbulb,
    position: 'center',
    action: null,
    showSkip: true
  },
  {
    id: 'setup-api',
    title: 'Connect Your AI Service',
    description: 'Add your API key to unlock the full power of AI advisors. Don\'t have one? No problem - see what\'s possible with demo responses.',
    icon: Settings,
    target: '[data-tour="settings"]',
    position: 'bottom-left',
    action: 'navigate:settings',
    showSkip: true
  },
  {
    id: 'select-advisors',
    title: 'Choose Your Advisory Board',
    description: 'Select from our curated list of expert advisors. Each brings unique insights from their field of expertise.',
    icon: Users,
    target: '[data-tour="advisors"]',
    position: 'bottom',
    action: 'navigate:advisors',
    highlight: true
  },
  {
    id: 'upload-document',
    title: 'Share Your Challenge',
    description: 'Upload a document or business plan. Your advisors will analyze it and provide personalized insights.',
    icon: FileText,
    target: '[data-tour="documents"]',
    position: 'bottom',
    action: 'navigate:documents',
    highlight: true
  },
  {
    id: 'start-meeting',
    title: 'Hold Your First Advisory Meeting',
    description: 'Start a meeting with your selected advisors. Ask questions and get expert guidance on your business.',
    icon: MessageSquare,
    target: '[data-tour="ai-board"]',
    position: 'bottom',
    action: 'navigate:ai',
    highlight: true
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your AI advisory board is ready. Explore advanced features like voice control, meeting environments, and more.',
    icon: CheckCircle,
    position: 'center',
    action: null,
    celebration: true
  }
];

function OnboardingTour({ 
  isActive, 
  onComplete, 
  onSkip, 
  currentModule, 
  setActiveModule,
  className = '' 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      
      // Handle navigation for current step
      if (step.action && step.action.startsWith('navigate:')) {
        const module = step.action.split(':')[1];
        setActiveModule(module);
        
        // Wait for navigation then update position
        setTimeout(() => {
          updateTargetPosition();
        }, 300);
      } else {
        updateTargetPosition();
      }
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive, currentStep]);

  useEffect(() => {
    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();
    
    if (isActive) {
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isActive, currentStep]);

  const updateTargetPosition = () => {
    if (!step.target) return;

    const targetElement = document.querySelector(step.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });

      // Scroll target into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      // Navigation will be handled by useEffect when currentStep changes
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    onSkip?.();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed_date', new Date().toISOString());
    onComplete?.();
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('onboarding_disabled', 'true');
    onSkip?.();
  };

  const getTooltipPosition = () => {
    if (step.position === 'center' || !step.target) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001
      };
    }

    const padding = 20;
    let position = { position: 'fixed', zIndex: 10001 };

    switch (step.position) {
      case 'top':
        position.top = targetPosition.top - padding;
        position.left = targetPosition.left + (targetPosition.width / 2);
        position.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        position.top = targetPosition.top + targetPosition.height + padding;
        position.left = targetPosition.left + (targetPosition.width / 2);
        position.transform = 'translate(-50%, 0)';
        break;
      case 'left':
        position.top = targetPosition.top + (targetPosition.height / 2);
        position.left = targetPosition.left - padding;
        position.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        position.top = targetPosition.top + (targetPosition.height / 2);
        position.left = targetPosition.left + targetPosition.width + padding;
        position.transform = 'translate(0, -50%)';
        break;
      case 'bottom-left':
        position.top = targetPosition.top + targetPosition.height + padding;
        position.left = targetPosition.left;
        position.transform = 'translate(0, 0)';
        break;
      case 'bottom-right':
        position.top = targetPosition.top + targetPosition.height + padding;
        position.left = targetPosition.left + targetPosition.width;
        position.transform = 'translate(-100%, 0)';
        break;
    }

    return position;
  };

  if (!isVisible) return null;

  const IconComponent = step.icon;

  return (
    <div className={`fixed inset-0 z-10000 ${className}`}>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: step.position === 'center' ? 0.7 : 0.4 }}
      />
      
      {/* Spotlight for target element */}
      {step.target && step.highlight && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
            background: 'transparent',
            border: '3px solid #3B82F6',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.4)',
            animation: 'pulse-border 2s infinite',
            zIndex: 10000
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100"
        style={getTooltipPosition()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-xl 
                ${step.celebration ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
              `}>
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                  {step.celebration && (
                    <div className="text-yellow-500 animate-bounce">🎉</div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {step.description}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Left side - Previous button */}
            <div>
              {currentStep > 0 ? (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-3">
              {step.showSkip && currentStep < TOUR_STEPS.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip tour
                </button>
              )}
              
              <button
                onClick={handleNext}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${step.celebration 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Don't show again option */}
          {currentStep === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleDontShowAgain}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Don't show this tour again
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { 
            border-color: #3B82F6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.4);
          }
          50% { 
            border-color: #1D4ED8;
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
    </div>
  );
}

export default memo(OnboardingTour);