import { IconFallback } from './IconFallback';

interface BarberBannerProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'promo';
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function BarberBanner({ variant = 'primary', className = '' }: BarberBannerProps) {
  const variants = {
    primary: {
      bgGradient: 'from-red-900 via-black to-gray-900',
      textColor: 'text-yellow-400',
      accentColor: 'text-red-400',
      borderColor: 'border-yellow-500'
    },
    secondary: {
      bgGradient: 'from-gray-900 via-red-900 to-black',
      textColor: 'text-red-400',
      accentColor: 'text-yellow-400',
      borderColor: 'border-red-500'
    },
    accent: {
      bgGradient: 'from-yellow-900 via-red-900 to-black',
      textColor: 'text-white',
      accentColor: 'text-yellow-300',
      borderColor: 'border-yellow-400'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={`relative overflow-hidden rounded-lg border-2 ${currentVariant.borderColor} ${className}`}>
      <div className={`bg-gradient-to-br ${currentVariant.bgGradient} px-6 py-8`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="flex items-center justify-center h-full space-x-8">
            <IconFallback type="barber-pole" size="xl" className="rotate-12" />
            <IconFallback type="scissors" size="xl" className="-rotate-12" />
            <IconFallback type="razor" size="xl" className="rotate-45" />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-3 rounded-full border-2 border-yellow-400">
              <IconFallback type="logo" size="lg" />
            </div>
            <div className="hidden sm:flex flex-col space-y-1">
              <IconFallback type="scissors" size="md" className={currentVariant.textColor} />
              <IconFallback type="comb" size="md" className={currentVariant.accentColor} />
            </div>
          </div>
          
          <h2 className={`text-3xl font-bold ${currentVariant.textColor} mb-2 tracking-wider`}>
            ELITE BARBER SHOP
          </h2>
          <p className={`text-lg ${currentVariant.accentColor} font-semibold mb-4`}>
            Professional Grooming Experience
          </p>
          
          <div className="flex justify-center items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <IconFallback type="hair-clipper" size="sm" className={currentVariant.accentColor} />
              <span className="text-gray-300">Cortes Modernos</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <IconFallback type="razor" size="sm" className={currentVariant.accentColor} />
              <span className="text-gray-300">Barbas Clássicas</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconFallback type="barber-pole" size="sm" className={currentVariant.accentColor} />
              <span className="text-gray-300">Tradição & Qualidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 