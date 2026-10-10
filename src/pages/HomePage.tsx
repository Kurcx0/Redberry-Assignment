import ComingSoon from '@/components/home/ComingSoon'
import Hero from '@/components/home/Hero'
import NowPlaying from '@/components/home/NowPlaying'
import RecentlyViewed from '@/components/home/RecentlyViewed'

export default function HomePage() {
  return (
    <>
      <Hero />
      <RecentlyViewed />
      <NowPlaying />
      <ComingSoon />
    </>
  )
}
