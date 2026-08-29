interface ScallopDividerProps {
  // The color the scallops are cut FROM — i.e. the section below/above,
  // not the section this divider visually belongs to.
  fill?: string;
  flip?: boolean;
  className?: string;
}

// A repeating frosting-edge curve — the bakery's signature section break
// instead of a plain straight line.
export default function ScallopDivider({
  fill = '#FFFCF9',
  flip = false,
  className = '',
}: ScallopDividerProps) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={`w-full h-5 block ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,12 C4,4 12,0 20,0 C28,0 36,4 40,12 C44,4 52,0 60,0 C68,0 76,4 80,12
           C84,4 92,0 100,0 C108,0 116,4 120,12 C124,4 132,0 140,0 C148,0 156,4 160,12
           C164,4 172,0 180,0 C188,0 196,4 200,12 L200,12 L0,12 Z"
        fill={fill}
      />
    </svg>
  );
}
