import IconFallback from './IconFallback';

interface BarberBannerProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'promo';
}

export default function BarberBanner({ 
  title = "Elite Barber Shop", 
  subtitle = "Excelência em cada corte",
  variant = 'default' 
}: BarberBannerProps) {

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-black via-gray-800 to-red-900 px-4 py-2 rounded-lg shadow-sm border-2 border-yellow-500">
        <div className="flex items-center justify-center space-x-3">
          <IconFallback type="scissors" size="sm" className="opacity-70" />
          <span className="text-sm font-bold text-yellow-400">{title}</span>
          <IconFallback type="razor" size="sm" className="opacity-70" />
        </div>
      </div>
    );
  }

  if (variant === 'promo') {
    return (
      <div className="bg-gradient-to-r from-black via-red-900 to-gray-900 px-6 py-4 rounded-xl shadow-lg border-2 border-yellow-500 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-4">
            <IconFallback type="barber-pole" size="md" />
          </div>
          <div className="absolute bottom-2 right-4">
            <IconFallback type="hair-clipper" size="sm" />
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-400 tracking-wider">{title}</h3>
              <p className="text-sm text-red-400">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <IconFallback type="scissors" size="sm" className="opacity-60" />
              <IconFallback type="comb" size="sm" className="opacity-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-red-900 px-8 py-6 rounded-xl shadow-xl border-2 border-yellow-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-8">
          <IconFallback type="barber-chair" size="lg" />
        </div>
        <div className="absolute top-4 right-8">
          <IconFallback type="barber-pole" size="md" />
        </div>
        <div className="absolute bottom-4 left-1/4">
          <IconFallback type="hair-clipper" size="md" />
        </div>
        <div className="absolute bottom-4 right-1/4">
          <IconFallback type="razor" size="lg" />
        </div>
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg inline-block">
          <IconFallback type="logo" size="lg" />
        </div>
        
        <h2 className="text-2xl font-bold text-yellow-400 mb-2 tracking-wider">{title}</h2>
        <p className="text-red-400 mb-4">{subtitle}</p>
        
        {/* Decorative icons */}
        <div className="flex justify-center items-center space-x-4">
          <IconFallback type="scissors" size="sm" className="opacity-60" />
          <div className="w-px h-4 bg-yellow-500 opacity-60"></div>
          <IconFallback type="razor" size="sm" className="opacity-60" />
          <div className="w-px h-4 bg-red-500 opacity-60"></div>
          <IconFallback type="comb" size="sm" className="opacity-60" />
          <div className="w-px h-4 bg-yellow-500 opacity-60"></div>
          <IconFallback type="hair-clipper" size="sm" className="opacity-60" />
        </div>
      </div>
    </div>
  );
} 