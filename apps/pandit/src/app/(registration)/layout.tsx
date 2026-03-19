'use client'

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  // Session tracking logic to be implemented later along with Sarvam
  
  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto bg-surface-base relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-bottom bg-no-repeat bg-contain opacity-5"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCbofJdtiXPBoTIFrt2c6-0slFKco7pMG-dEFH4aLuSZsawtRO8FOIqaHR7ymgXtdnpDnxC7u2ZfvzvZ9HQdff7N6p67V6LWnFP8OfqA8x15JEUlk_Bns41a4UtV1oZi3XFN2Hc2qweZ3qpQGwrbwIvGRGjRHzd6BAyvWqJ3gT3uwfo-O9Zxo2pAp42nkVcAUxLbifx6A4UNNwqJy76SBGkS4pQr4diDyyQOwmfD84xPSKAg5EG4I5KQ927beyWDYCI8d6YZ9Ex1gHd")' }}
        />
      </div>
      <div className="relative z-10 flex-grow flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  )
}
