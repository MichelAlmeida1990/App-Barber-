interface IconFallbackProps {
  type: 'scissors' | 'barber-chair' | 'razor' | 'hair-clipper' | 'comb' | 'barber-pole' | 'logo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function IconFallback({ type, size = 'md', className = '' }: IconFallbackProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const icons = {
    'scissors': '✂️',
    'barber-chair': '💺',
    'razor': '🪒',
    'hair-clipper': '✂️',
    'comb': '🧼',
    'barber-pole': '💈',
    'logo': '💈'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {icons[type]}
    </span>
  );
} 