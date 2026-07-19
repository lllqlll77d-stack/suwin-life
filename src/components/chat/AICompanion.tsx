'use client';

type PetState = 'idle' | 'thinking' | 'happy' | 'sad';

interface AICompanionProps {
  state?: PetState;
}

const PET_EMOJIS: Record<PetState, string> = {
  idle: '🐱',
  thinking: '🤔',
  happy: '😸',
  sad: '😿',
};

export default function AICompanion({ state = 'idle' }: AICompanionProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
      {/* Pet avatar */}
      <div
        className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,192,203,0.4))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.5)',
          boxShadow: '0 2px 12px rgba(255,20,147,0.15)',
        }}
      >
        {PET_EMOJIS[state]}
      </div>

      {/* Name + status */}
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Suwin
        </p>
        <p className="text-xs text-[var(--text-secondary)] opacity-70">
          {state === 'idle' && '在聆听...'}
          {state === 'thinking' && '正在思考...'}
          {state === 'happy' && '好开心 ✨'}
          {state === 'sad' && '遇到了一点问题 💦'}
        </p>
      </div>
    </div>
  );
}
