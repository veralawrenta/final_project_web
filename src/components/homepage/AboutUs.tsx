import {
  ShieldCheck,
  PhoneCall,
  MapPin,
  CreditCard,
  Sparkles,
  HomeIcon,
} from "lucide-react";

const Features = [
  {
    icon: HomeIcon,
    title: "Curated stays",
    description: "Handpicked apartments, villas, and homes designed for comfort and convenience.",
  },
  {
    icon: MapPin,
    title: "Prime locations",
    description: "Stay close to beaches, city centers, and must-see destinations.",
  },
  {
    icon: ShieldCheck,
    title: "Staynuit guarantee",
    description: "If something goes wrong with your stay, we’re here to help make it right.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    description: "Your payments are protected with trusted and encrypted payment methods.",
  },
  {
    icon: PhoneCall,
    title: "24/7 guest support",
    description: "Real support from real people—before, during, and after your stay.",
  },
  {
    icon: Sparkles,
    title: "Easy check-in",
    description: "Simple booking and smooth check-in, so you can focus on your trip.",
  },
];

const HeroAboutUs = () => {
  return (
    <section className="relative py-20 px-4 bg-white overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-50/50 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[2px] w-10 bg-primary"></span>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Why Staynuit
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Reimagining the way {" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-600 to-blue-600">
              you experience travel.
            </span>
          </h2>
          
          <p className="mt-8 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
            We combine the comforts of home with the reliability of a boutique hotel, 
            ensuring every stay is memorable, seamless, and completely stress-free.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="group p-8 rounded-3xl border border-slate-100 bg-white transition-all duration-500 hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:-translate-y-2"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroAboutUs;