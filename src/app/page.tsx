import Footer from '@/components/Footer'
import HeroEmbla from '@/components/homepage/HeroSection'
import PromoCarousel from '@/components/homepage/PromoCarousel'

import Navbar from '@/components/Navbar'

const Homepage = () => {
  return (
    <div>
      <Navbar />
      <HeroEmbla />
      <PromoCarousel />
      <Footer />
    </div>
  )
}

export default Homepage