interface IconFallbackProps {
  type: 'scissors' | 'barber-chair' | 'razor' | 'hair-clipper' | 'comb' | 'barber-pole' | 'logo' | 'calendar' | 'chart' | 'ai' | 'settings' | 'user';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export function IconFallback({ type, size = 'md', className = '' }: IconFallbackProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl'
  };

  const icons = {
    'scissors': '✂️',
    'barber-chair': '💺', 
    'razor': '🪒',
    'hair-clipper': '✂️',
    'comb': '🧼',
    'barber-pole': '💈',
    'logo': '💈',
    'calendar': '📅',
    'chart': '📊',
    'ai': '🤖',
    'settings': '⚙️',
    'user': '👤'
  };

  return (
    <span 
      className={`inline-block ${sizeClasses[size]} ${className} transition-transform duration-200 hover:scale-110`} 
      role="img" 
      aria-label={type}
    >
      {icons[type]}
    </span>
  );
} 