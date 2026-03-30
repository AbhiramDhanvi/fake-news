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
import Footer from './components/Footer'
import type { AnalysisResult } from './lib/insforge'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const scannerRef = useRef<HTMLDivElement>(null)
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleThemeToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  const handleAnalysisComplete = (newsId: string, _analysis: AnalysisResult) => {
    setCurrentNewsId(newsId)
  }

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
          <Scanner scannerRef={scannerRef} onAnalysisComplete={handleAnalysisComplete} />
        </div>
        <KnowledgeGraph />
        <ShaderAnimation />
        <Comparison />
        <Contact />
      </main>
      <Footer />
      {/* Chatbot receives current article context */}
      <Chatbot currentNewsId={currentNewsId} />
    </>
  )
}

export default App
