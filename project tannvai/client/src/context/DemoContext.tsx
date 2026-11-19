import React, { createContext, useContext, useState } from 'react';
import { api } from '../utils/api';

export interface DemoStep {
  step: number;
  title: string;
  badge: string;
  description: string;
  routeHint: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Community Report Ingestion',
    badge: 'Citizen Submission',
    description: 'A motorist submits a natural-language report about flash flooding and trapped vehicles at the Maple Ave & 5th St Underpass.',
    routeHint: 'submit',
  },
  {
    step: 2,
    title: 'AI Incident Interpreter',
    badge: 'AI Extraction',
    description: 'The AI extracts category (FLOOD), needs (swift water rescue, towing), location coordinates, and explains urgency without hallucinating.',
    routeHint: 'analysis',
  },
  {
    step: 3,
    title: 'Corroborating Eyewitness Report',
    badge: 'Second Report',
    description: 'A second resident reports high water under the train bridge 68 meters away, corroborating trapped vehicles.',
    routeHint: 'explorer',
  },
  {
    step: 4,
    title: 'Duplicate Detection Engine',
    badge: 'Spatial & Semantic NLP',
    description: 'ResQNet detects an 89% match (within 70m, 20 mins, matching keywords) and presents an explainable match rationale to the reviewer.',
    routeHint: 'admin',
  },
  {
    step: 5,
    title: 'Human Review & Verification',
    badge: 'Authorized Reviewer',
    description: 'Reviewer inspects reports side-by-side, verifies the incident, confirms the duplicate link, and marks report as VERIFIED.',
    routeHint: 'admin',
  },
  {
    step: 6,
    title: 'Resource Coordination & Dispatch',
    badge: 'Field Coordinator',
    description: 'Coordinator assigns "Swift Water Rescue Squad Alpha" to the high-urgency evacuation request.',
    routeHint: 'coordination',
  },
  {
    step: 7,
    title: 'Real-Time Intelligence & Audit',
    badge: 'Live Dashboard',
    description: 'Dashboard KPIs and Recharts reflect active response deployment, and the complete audit trail logs every event.',
    routeHint: 'dashboard',
  },
];

interface DemoContextType {
  activeStep: number;
  isLoading: boolean;
  isScenarioLoaded: boolean;
  statusMessage: string | null;
  loadScenario: () => Promise<void>;
  resetDemo: () => Promise<void>;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode; onNavigate?: (page: string) => void }> = ({
  children,
  onNavigate,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScenarioLoaded, setIsScenarioLoaded] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadScenario = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Loading hackathon demonstration scenario into backend...');
      await api.loadDemoScenario();
      setIsScenarioLoaded(true);
      setStatusMessage('Demo scenario loaded! You can now step through the complete 7-step emergency response.');
      setActiveStep(1);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage(`Failed to load scenario: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Resetting system to clean baseline...');
      await api.resetDemo();
      setIsScenarioLoaded(false);
      setActiveStep(1);
      setStatusMessage('System state reset to clean baseline.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(`Failed to reset: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (stepNumber: number) => {
    const target = Math.max(1, Math.min(DEMO_STEPS.length, stepNumber));
    setActiveStep(target);
    const stepData = DEMO_STEPS[target - 1];
    if (stepData && onNavigate) {
      onNavigate(stepData.routeHint);
    }
  };

  const nextStep = () => goToStep(activeStep + 1);
  const prevStep = () => goToStep(activeStep - 1);

  return (
    <DemoContext.Provider
      value={{
        activeStep,
        isLoading,
        isScenarioLoaded,
        statusMessage,
        loadScenario,
        resetDemo,
        goToStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
};
