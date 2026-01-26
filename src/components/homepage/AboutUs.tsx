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

const AboutUs = () => {
  return (
    <section className="py-20 px-6 bg-white border-b border-slate-100">
      <div className="container mx-auto max-w-7xl">

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-slate-300"></span>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Why Staynuit
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Reimagining the way {" "}
            <span className="bg-[#C7E1FB] px-2 py-0.5 rounded-sm">
              you experience travel.
            </span>
          </h2>
          
          <p className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
            We combine the comforts of home with the reliability of a boutique hotel, 
            ensuring every stay is curated, seamless, and stress-free.
          </p>
        </div>

        <div className="grid gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden md:grid-cols-2 lg:grid-cols-3">
          {Features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="group bg-white p-10 transition-colors duration-200 hover:bg-slate-50/50"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors duration-300 group-hover:bg-[#C7E1FB] group-hover:text-[#334155]">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
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

export default AboutUs;