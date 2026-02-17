"use client"

export function InfoCards() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Large Featured Card - Third Party */}
          <div className="md:col-span-2 relative overflow-hidden bg-[#FF6600] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
            {/* Background Illustration - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-30">
              <img 
                src="/illustrations/third_party_illustration.svg" 
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Content - Positioned at top-left */}
            <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full min-h-[280px]">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-white">
                  Third Party Vehicles
                </h3>
                <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-md">
                  Explore a wide selection of vehicles from trusted third-party dealers. Quality inspected cars with competitive pricing and financing options available.
                </p>
              </div>
              
              <a href="/shop?category=third-party">
                <button className="mt-6 px-6 py-3 bg-white text-[#FF6600] rounded-full font-semibold hover:bg-white/90 transition-all w-fit">
                  Browse Third Party
                </button>
              </a>
            </div>
          </div>

          {/* Two Smaller Cards - Right Side */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* Top Right Card - New Car */}
            <a href="/shop" className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex-1 cursor-pointer block">
              {/* Background Illustration */}
              <div className="absolute top-0 right-0 opacity-30 w-32 h-32">
                <img 
                  src="/illustrations/new_car_illustration.svg" 
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  New Car
                </h3>
                <p className="text-muted-foreground text-sm">
                  Brand new vehicles with full warranty. Latest models with zero mileage.
                </p>
              </div>
            </a>

            {/* Bottom Right Card - Second Hand */}
            <a href="/shop" className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex-1 cursor-pointer block">
              {/* Background Illustration */}
              <div className="absolute top-0 right-0 opacity-30 w-32 h-32">
                <img 
                  src="/illustrations/second_hand_illustrarion.svg" 
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Second Hand
                </h3>
                <p className="text-muted-foreground text-sm">
                  Quality pre-owned cars. Inspected and certified for reliability.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
