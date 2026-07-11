import styles from "./ProgressRing.module.css";

type ProgressRingProps = {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({ percent, color, size = 56, strokeWidth = 6 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} className={styles.ring}>
      <circle
        className={styles.track}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke="var(--color-surface-secondary)"
      />
      <circle
        className={styles.progress}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
