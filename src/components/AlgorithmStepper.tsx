import React from 'react';
import {
  Play,
  Pause,
  CaretRight,
  CaretLeft,
  ArrowCounterClockwise,
  Gauge,
  Sparkle
} from '@phosphor-icons/react';
import { AlgorithmStep } from '../types';

interface AlgorithmStepperProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const AlgorithmStepper: React.FC<AlgorithmStepperProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    onStepChange(0);
  };

  return (
    <div className="rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] p-4 space-y-3 shadow-sm transition-colors">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-[#EDE4D6] text-[#3F0D1B] border border-[#3F0D1B] hover:bg-[#E2D5C0]'
                : 'bg-[#3F0D1B] text-[#FAF6EE] hover:bg-[#4C1222] shadow-sm'
            }`}
          >
            {isPlaying ? <Pause size={14} weight="bold" /> : <Play size={14} weight="fill" />}
            <span>{isPlaying ? 'Pause' : 'Play Execution'}</span>
          </button>

          {/* Step Backward */}
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-[#3F0D1B] hover:bg-[#E2D5C0] disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            title="Step Backward"
          >
            <CaretLeft size={16} />
          </button>

          {/* Step Forward */}
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1.5 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-[#3F0D1B] hover:bg-[#E2D5C0] disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            title="Step Forward"
          >
            <CaretRight size={16} />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-[#521A27] hover:text-[#3F0D1B] hover:bg-[#E2D5C0] transition-colors shadow-xs cursor-pointer"
            title="Reset to Step 1"
          >
            <ArrowCounterClockwise size={16} />
          </button>

          {/* Step counter */}
          <span className="font-mono text-xs text-[#521A27] px-2">
            Step <strong className="text-[#3F0D1B] font-bold">{currentStepIndex + 1}</strong> of {steps.length}
          </span>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Gauge size={14} className="text-[#521A27]" />
          <span className="text-[#521A27] mr-1">Speed:</span>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-[#3F0D1B] text-[#FAF6EE] font-bold shadow-xs'
                  : 'bg-[#EDE4D6] text-[#521A27] hover:text-[#3F0D1B] border border-[#CDBFA7]'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrubbing timeline slider */}
      <div className="pt-1">
        <input
          type="range"
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStepIndex}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          className="w-full accent-[#3F0D1B] h-1.5 bg-[#CDBFA7] rounded-lg cursor-pointer"
        />
      </div>

      {/* Step Narration Card */}
      {currentStep && (
        <div className="p-3.5 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#3F0D1B] font-bold">{currentStep.title}</span>
            <span className="px-2 py-0.5 rounded bg-[#FAF6EE] text-[#521A27] border border-[#CDBFA7] text-[10px]">
              {currentStep.algorithm}
            </span>
          </div>
          <p className="text-xs text-[#340A16] leading-relaxed font-mono">
            {currentStep.description}
          </p>
        </div>
      )}
    </div>
  );
};
