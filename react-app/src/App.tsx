import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStats from './components/TrustStats'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Agents from './components/Agents'
import Scanner from './components/Scanner'
import KnowledgeGraph from './components/KnowledgeGraph'
import ShaderAnimation from './components/ShaderAnimation'
import Comparison from './components/Comparison'
import Chatbot from './components/Chatbot'
import Contact from './components/Contact'
import Community from './components/Community'
import Footer from './components/Footer'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const scannerRef = useRef<HTMLDivElement>(null)
  const [currentArticleText, setCurrentArticleText] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleThemeToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <>
      <Navbar theme={theme} onThemeToggle={handleThemeToggle} />
      <main>
        <Hero />
        <TrustStats />
        <Features />
        <HowItWorks />
        <Agents />
        <div ref={scannerRef} id="scanner">
          <Scanner scannerRef={scannerRef} onAnalysisComplete={setCurrentArticleText} />
        </div>
        <KnowledgeGraph />
        <ShaderAnimation />
        <Comparison />
        <Contact />
        <Community />
      </main>
      <Footer />
      <Chatbot articleText={currentArticleText} />
    </>
  )
}

export default App
