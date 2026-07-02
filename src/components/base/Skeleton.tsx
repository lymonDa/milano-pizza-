interface SkeletonProps {
  className?: string;
  height?: string;
}

export function Skeleton({ className = '', height }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-background-100 ${className}`} style={height ? { height } : undefined} />;
}
