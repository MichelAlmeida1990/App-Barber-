import Image from 'next/image';

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
          <Image src="/images/barbershop/scissors.svg" alt="" width={16} height={16} className="opacity-70" />
          <span className="text-sm font-bold text-yellow-400">{title}</span>
          <Image src="/images/barbershop/razor.svg" alt="" width={20} height={12} className="opacity-70" />
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
            <Image src="/images/barbershop/barber-pole.svg" alt="" width={20} height={40} />
          </div>
          <div className="absolute bottom-2 right-4">
            <Image src="/images/barbershop/hair-clipper.svg" alt="" width={16} height={32} />
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-400 tracking-wider">{title}</h3>
              <p className="text-sm text-red-400">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Image src="/images/barbershop/scissors.svg" alt="" width={20} height={20} className="opacity-60" />
              <Image src="/images/barbershop/comb.svg" alt="" width={24} height={8} className="opacity-60" />
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
          <Image src="/images/barbershop/barber-chair.svg" alt="" width={40} height={40} />
        </div>
        <div className="absolute top-4 right-8">
          <Image src="/images/barbershop/barber-pole.svg" alt="" width={20} height={40} />
        </div>
        <div className="absolute bottom-4 left-1/4">
          <Image src="/images/barbershop/hair-clipper.svg" alt="" width={24} height={48} />
        </div>
        <div className="absolute bottom-4 right-1/4">
          <Image src="/images/barbershop/razor.svg" alt="" width={40} height={24} />
        </div>
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg inline-block">
          <Image 
            src="/images/barbershop/logo.svg" 
            alt="Elite Barber Shop Logo" 
            width={100} 
            height={50} 
            className="mx-auto"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-yellow-400 mb-2 tracking-wider">{title}</h2>
        <p className="text-red-400 mb-4">{subtitle}</p>
        
        {/* Decorative icons */}
        <div className="flex justify-center items-center space-x-4">
          <Image src="/images/barbershop/scissors.svg" alt="Scissors" width={20} height={20} className="opacity-60" />
          <div className="w-px h-4 bg-yellow-500 opacity-60"></div>
          <Image src="/images/barbershop/razor.svg" alt="Razor" width={28} height={16} className="opacity-60" />
          <div className="w-px h-4 bg-red-500 opacity-60"></div>
          <Image src="/images/barbershop/comb.svg" alt="Comb" width={32} height={10} className="opacity-60" />
          <div className="w-px h-4 bg-yellow-500 opacity-60"></div>
          <Image src="/images/barbershop/hair-clipper.svg" alt="Hair Clipper" width={16} height={32} className="opacity-60" />
        </div>
      </div>
    </div>
  );
} 