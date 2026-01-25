import HeroAboutUs from "./AboutUs";
import HeroHero from "./HeroHero";
import PromoCarousel from "./PromoCarousel";

const Hero = () => {
  return (
    <div>
      <HeroHero />
      <PromoCarousel />
      <HeroAboutUs />
    </div>
  );
};

export default Hero;
