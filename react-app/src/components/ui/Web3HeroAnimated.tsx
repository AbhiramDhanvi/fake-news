import { useState, useEffect } from 'react'

// Symmetric pillar heights (%). Tall at edges → dip at center (cityscape)
const PILLARS = [92, 84, 78, 70, 62, 54, 46, 34, 18, 34, 46, 54, 62, 70, 78, 84, 92]
const BRANDS  = ['git', 'npm', 'Lucidchart', 'wrike', 'jquery', 'openstack', 'servicenow', 'Paysafe']

export function Web3HeroAnimated() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {/* ── Self-contained keyframes ───────────────────────────────────────── */}
      <style>{`
        @keyframes w3FadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes w3Pulse {
          0%,100% { opacity: 0.8; transform: translateX(-50%) scale(1);    }
          50%     { opacity: 1;   transform: translateX(-50%) scale(1.06); }
        }
        .w3-fade { animation: w3FadeInUp 0.85s ease-out forwards; }
        .w3-pillar { transition: height 1.1s cubic-bezier(.22,1,.36,1); }
      `}</style>

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section
        id="w3-hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Luminous gradient dome background ──── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: [
              'radial-gradient(80% 55% at 50% 52%, rgba(252,166,154,0.45) 0%, rgba(214,76,82,0.46) 27%, rgba(61,36,47,0.38) 47%, rgba(39,38,67,0.45) 60%, rgba(8,8,12,0.92) 78%, rgba(0,0,0,1) 88%)',
              'radial-gradient(85% 60% at 14% 0%,  rgba(255,193,171,0.65) 0%, rgba(233,109,99,0.58) 30%, rgba(48,24,28,0) 64%)',
              'radial-gradient(70% 50% at 86% 22%, rgba(88,112,255,0.40) 0%, rgba(16,18,28,0) 55%)',
              'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0) 40%)',
            ].join(','),
          }}
        />

        {/* ── Corner vignette ──────────────────────── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'radial-gradient(140% 120% at 50% 0%, transparent 60%, rgba(0,0,0,0.85))',
          }}
        />

        {/* ── Grid overlay ─────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            opacity: 0.25,
            mixBlendMode: 'screen',
            backgroundImage: [
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 96px)',
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 24px)',
              'repeating-radial-gradient(80% 55% at 50% 52%, rgba(255,255,255,0.07) 0 1px, transparent 1px 120px)',
            ].join(','),
          }}
        />

        {/* ── COPY — centred in the hero viewport ──── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'clamp(4rem, 8vh, 8rem) 1.5rem clamp(12rem, 30vh, 20rem)',
          }}
        >
          {/* Badge */}
          <span
            className={isMounted ? 'w3-fade' : ''}
            style={{
              opacity: isMounted ? undefined : 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '0.25rem 0.75rem',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block' }} />
            AI-Powered Verification
          </span>

          {/* Heading */}
          <h1
            className={isMounted ? 'w3-fade' : ''}
            style={{
              opacity: isMounted ? undefined : 0,
              animationDelay: '180ms',
              fontSize: 'clamp(2.25rem, 6vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 1.25rem',
              maxWidth: '52rem',
            }}
          >
            Detect Fake News<br />With Multi-Agent AI
          </h1>

          {/* Sub-copy */}
          <p
            className={isMounted ? 'w3-fade' : ''}
            style={{
              opacity: isMounted ? undefined : 0,
              animationDelay: '300ms',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              color: 'rgba(255,255,255,0.72)',
              maxWidth: '42rem',
              margin: '0 0 2rem',
              lineHeight: 1.65,
            }}
          >
            5 specialized AI agents work together to analyze claims, gather evidence,
            score credibility, and deliver confidence-calibrated verdicts in real-time.
          </p>

          {/* CTAs */}
          <div
            className={isMounted ? 'w3-fade' : ''}
            style={{
              opacity: isMounted ? undefined : 0,
              animationDelay: '420ms',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '3rem',
            }}
          >
            <a
              href="#scanner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                background: '#fff',
                color: '#000',
                padding: '0.75rem 1.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              Start Scanning
            </a>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)',
                padding: '0.75rem 1.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'border-color 0.2s',
              }}
            >
              Learn How It Works
            </a>
          </div>

          {/* Partner trust logos */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center',
              opacity: 0.55,
            }}
          >
            {BRANDS.map(b => (
              <span
                key={b}
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* ── Centre glow beacon ──────────────────── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 128,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            width: 112,
            height: 144,
            borderRadius: 8,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,220,220,0.55), transparent)',
            pointerEvents: 'none',
            animation: 'w3Pulse 6s ease-in-out infinite',
          }}
        />

        {/* ── Stepped pillars silhouette ──────────── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '54vh',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          {/* Dark bottom fade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.88) 35%, transparent 100%)',
            }}
          />
          {/* Bars */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 2,
              right: 2,
              top: 0,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            {PILLARS.map((h, i) => (
              <div
                key={i}
                className="w3-pillar"
                style={{
                  flex: 1,
                  background: '#000',
                  height: isMounted ? `${h}%` : '0%',
                  transitionDelay: `${Math.abs(i - Math.floor(PILLARS.length / 2)) * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Web3HeroAnimated
