interface IconFallbackProps {
  type: 'scissors' | 'barber-chair' | 'razor' | 'hair-clipper' | 'comb' | 'barber-pole' | 'logo';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function IconFallback({ type, size = 'md', className = '' }: IconFallbackProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
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
    <span className={`inline-block ${sizeClasses[size]} ${className}`} role="img" aria-label={type}>
      {icons[type]}
    </span>
  );
} 