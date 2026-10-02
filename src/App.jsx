import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Worldwide from './components/Worldwide.jsx'
import Events from './components/Events.jsx'
import Benefits from './components/Benefits.jsx'
import Partner from './components/Partner.jsx'
import Team from './components/Team.jsx'
import Join from './components/Join.jsx'
import { GooeyDefs } from './components/GooeyButton.jsx'
import { useNoCopy, useReveal, useScrollVars } from './hooks.js'

export default function App() {
  useReveal()
  useScrollVars()
  useNoCopy()
  return (
    <>
      <div className="grain" aria-hidden />
      <GooeyDefs />
      <Nav />
      <main>
        <Hero />
        <div className="sheet">
          <About />
          <Worldwide />
          <Events />
          <Benefits />
          <Partner />
          <Team />
          <Join />
        </div>
      </main>
    </>
  )
}
