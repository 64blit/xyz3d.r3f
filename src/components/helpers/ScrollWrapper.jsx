// a react component that passes useScroll to the parent

import { useScroll } from '@react-three/drei'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useStore from '../../store'

gsap.registerPlugin(ScrollTrigger)

export function ScrollWrapper(props) {
  const scroll = useScroll()
  const setScrollProgress = useStore(state => state.setScrollProgress)

  useEffect(() => {
    props.onReady(scroll)
    
    const handleScroll = () => {
      const scrollOffset = scroll.el.scrollTop / scroll.el.scrollHeight
      setScrollProgress(scrollOffset)
    }
    
    scroll.el.addEventListener('scroll', handleScroll)
    
    handleScroll()
    
    return () => {
      scroll.el.removeEventListener('scroll', handleScroll)
    }
  }, [scroll, setScrollProgress, props])

  return <>{props.children}</>
}
