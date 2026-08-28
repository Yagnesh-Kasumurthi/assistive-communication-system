import React, { useEffect, useRef } from 'react'

/**
 * Animated technology background canvas.
 * Draws subtle circuit traces, glowing nodes, data lines, and particles.
 */
export default function TechBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let w, h

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Nodes (circuit board intersections) ──
    const nodeCount = Math.floor((w * h) / 35000)
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.008,
    }))

    // ── Particles (floating micro-dots) ──
    const particleCount = Math.floor(nodeCount * 0.6)
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    // ── Data transmission lines ──
    const lineCount = Math.floor(nodeCount * 0.15)
    const dataLines = Array.from({ length: lineCount }, () => ({
      x1: Math.random() * w,
      y1: Math.random() * h,
      length: Math.random() * 120 + 40,
      angle: (Math.floor(Math.random() * 4) * Math.PI) / 2 + (Math.random() - 0.5) * 0.3,
      progress: Math.random(),
      speed: Math.random() * 0.004 + 0.002,
    }))

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // ── Circuit traces (connections between nearby nodes) ──
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            ctx.globalAlpha = (1 - dist / 200) * 0.3
            ctx.beginPath()
            // Draw right-angle circuit paths
            if (Math.random() > 0.5) {
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
            } else {
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[i].x, nodes[j].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
            }
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // ── Glowing connection nodes ──
      for (const node of nodes) {
        node.pulse += node.speed
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > w) node.vx *= -1
        if (node.y < 0 || node.y > h) node.vy *= -1

        const glow = 0.3 + Math.sin(node.pulse) * 0.2
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${glow})`
        ctx.fill()

        // Outer glow ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${glow * 0.15})`
        ctx.fill()
      }

      // ── Floating particles ──
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 191, 165, ${p.opacity})`
        ctx.fill()
      }

      // ── Data transmission lines ──
      for (const line of dataLines) {
        line.progress += line.speed
        if (line.progress > 1) line.progress = 0

        const x2 = line.x1 + Math.cos(line.angle) * line.length
        const y2 = line.y1 + Math.sin(line.angle) * line.length

        // Base line
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Moving signal dot
        const px = line.x1 + (x2 - line.x1) * line.progress
        const py = line.y1 + (y2 - line.y1) * line.progress
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 229, 255, 0.5)'
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id="tech-background" aria-hidden="true" />
}
