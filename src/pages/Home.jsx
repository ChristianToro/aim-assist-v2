import BoardSentence from '../components/landing/BoardSentence'
import ClosingCall from '../components/landing/ClosingCall'
import Hero from '../components/landing/Hero'
import ModeList from '../components/landing/ModeList'
import { useReveal } from '../hooks/useReveal'

// The landing page, in the order of its argument: what it is, what you
// train, who's on the board, and the first step.
const Home = () => {
  const revealRef = useReveal()

  return (
    <div ref={revealRef}>
      <Hero />
      <ModeList />
      <BoardSentence />
      <ClosingCall />
    </div>
  )
}

export default Home
