import React, {
    ComponentPropsWithRef,
    useCallback,
    useEffect,
    useState
  } from 'react'
  import { EmblaCarouselType } from 'embla-carousel'
  
  type UseDotButtonType = {
    selectedIndex: number
    scrollSnaps: number[]
    onDotButtonClick: (index: number) => void
  }
  
  export const useDotButton = (
    emblaApi: EmblaCarouselType | undefined
  ): UseDotButtonType => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  
    const onDotButtonClick = useCallback(
      (index: number) => {
        if (!emblaApi) return
        emblaApi.scrollTo(index)
      },
      [emblaApi]
    )
  
    const onInit = useCallback((emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList())
    }, [])
  
    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [])
  
    useEffect(() => {
      if (!emblaApi) return
  
      onInit(emblaApi)
      onSelect(emblaApi)
      emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onInit, onSelect])
  
    return {
      selectedIndex,
      scrollSnaps,
      onDotButtonClick
    }
  }

  interface PropType extends ComponentPropsWithRef<'button'> {
    selected: boolean
  }
  
  export const DotButton: React.FC<PropType> = ({ selected, className, ...restProps }) => {
    return (
      <button
        type="button"
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          selected ? 'bg-yellow-600 w-6' : 'bg-gray-300'
        } ${className}`}
        {...restProps}
      />
    )
  }