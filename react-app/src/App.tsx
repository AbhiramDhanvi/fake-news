import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import CommunityPage from './pages/CommunityPage'
import ContactPage from './pages/ContactPage'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
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
      <Routes>
        <Route path="/" element={<HomePage onArticleAnalyzed={setCurrentArticleText} />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Chatbot articleText={currentArticleText} />
    </>
  )
}

export default App
