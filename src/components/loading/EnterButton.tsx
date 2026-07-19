'use client';

interface EnterButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function EnterButton({ visible, onClick }: EnterButtonProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        animate-fade-in
        px-12 py-4
        text-lg font-bold tracking-widest
        rounded-full
        border-2 border-white/50
        transition-all duration-500
        hover:scale-110
        active:scale-95
        cursor-pointer
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,20,147,0.3))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 0 30px rgba(255,20,147,0.5), 0 0 60px rgba(255,105,180,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      <span className="chrome-text">
        ✨ ENTER ✨
      </span>
    </button>
  );
}
