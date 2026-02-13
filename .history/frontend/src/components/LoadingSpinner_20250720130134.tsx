interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'white', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    white: 'border-white',
    yellow: 'border-yellow-400',
    red: 'border-red-400',
    blue: 'border-blue-400'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]}`}></div>
    </div>
  );
} 