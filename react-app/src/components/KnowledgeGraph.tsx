import { useEffect, useRef } from 'react'

interface GraphNode {
  x: number; y: number; r: number; label: string; color: string; type: string
}

const EDGES: [number, number][] = [
  [0,1],[0,2],[0,3],[0,4],[1,4],[2,7],[5,6],[6,8],[6,9],[6,11],[3,10],[7,11],[4,6],[1,10],[5,7],[9,11],
]

export default function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width - 48
    canvas.height = 450
    const W = canvas.width, H = canvas.height
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

    const nodes: GraphNode[] = [
      { x: W*0.5,  y: H*0.12, r: 22, label: 'Claim A',   color: '#6366f1', type: 'claim'    },
      { x: W*0.25, y: H*0.35, r: 18, label: 'Reuters',   color: '#22c55e', type: 'trusted'  },
      { x: W*0.75, y: H*0.3,  r: 18, label: 'AP News',   color: '#22c55e', type: 'trusted'  },
      { x: W*0.15, y: H*0.6,  r: 15, label: 'BlogX',     color: '#ef4444', type: 'low'      },
      { x: W*0.45, y: H*0.55, r: 16, label: 'Snopes',    color: '#22c55e', type: 'trusted'  },
      { x: W*0.7,  y: H*0.6,  r: 14, label: 'NewsY',     color: '#f59e0b', type: 'moderate' },
      { x: W*0.5,  y: H*0.82, r: 20, label: 'Claim B',   color: '#6366f1', type: 'claim'    },
      { x: W*0.85, y: H*0.45, r: 17, label: 'WHO',       color: '#22c55e', type: 'trusted'  },
      { x: W*0.3,  y: H*0.82, r: 13, label: 'FakeDaily', color: '#ef4444', type: 'low'      },
      { x: W*0.65, y: H*0.85, r: 15, label: 'PolitiFact',color: '#22c55e', type: 'trusted'  },
      { x: W*0.1,  y: H*0.4,  r: 12, label: 'TweetZ',    color: '#f59e0b', type: 'moderate' },
      { x: W*0.88, y: H*0.75, r: 14, label: 'BBC',        color: '#22c55e', type: 'trusted'  },
    ]

    ctx.clearRect(0, 0, W, H)

    EDGES.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(nodes[a].x, nodes[a].y)
      ctx.lineTo(nodes[b].x, nodes[b].y)
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r + 6, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '18'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '30'
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = isDark ? '#e4e4e7' : '#27272a'
      ctx.font = `${Math.max(10, node.r * 0.55)}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)
    })
  }

  useEffect(() => {
    drawGraph()
    window.addEventListener('resize', drawGraph)
    const observer = new MutationObserver(drawGraph)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      window.removeEventListener('resize', drawGraph)
      observer.disconnect()
    }
  }, [])

  return (
    <section id="knowledge-graph" className="knowledge-graph-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">🌐 Knowledge Graph</span>
          <h2 className="section-title">Source Relationship Visualization</h2>
          <p className="section-desc">Interactive 2D graph showing sources, relationships, and credibility scores with color-coded nodes.</p>
        </div>
        <div className="graph-container">
          <canvas ref={canvasRef} id="knowledge-graph-canvas" width={900} height={500} />
          <div className="graph-legend">
            <div className="legend-item"><span className="legend-dot legend-trusted" /> Trusted Source</div>
            <div className="legend-item"><span className="legend-dot legend-moderate" /> Moderate Trust</div>
            <div className="legend-item"><span className="legend-dot legend-low" /> Low Trust</div>
            <div className="legend-item"><span className="legend-dot legend-claim" /> Claim Node</div>
          </div>
        </div>
      </div>
    </section>
  )
}
