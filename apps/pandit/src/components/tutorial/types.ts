export interface TutorialScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onKeyboard: () => void; // opens the keyboard input overlay
  onRepeat: () => void;   // replays the voice prompt
  isMuted: boolean;
  toggleMute: () => void;
  stepIndex: number;
  totalSteps: number;
}
