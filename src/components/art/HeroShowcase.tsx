'use client'
import { useEffect, useRef, useState } from 'react'
import { HeroDemo } from './HeroDemo'
import { HeroCrm } from './HeroCrm'
import './art.css'

// Hovering the small kanban grows it over the whole coral plate into a fuller CRM.
export function HeroShowcase() {
  const cell = useRef<HTMLDivElement>(null)
  const [inset, setInset] = useState('inset(40% 0 0 60% round 10px)')
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const [ready, setReady] = useState(false)
  const [aspect, setAspect] = useState(0.55)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const canHover = () => window.matchMedia('(hover: hover) and (min-width: 1024px)').matches

  const enter = () => {
    if (!canHover() || !cell.current) return
    clearTimeout(timer.current)
    const plate = cell.current.closest<HTMLElement>('[data-plate]')
    if (!plate) return
    const p = plate.getBoundingClientRect()
    const c = cell.current.getBoundingClientRect()
    const t = Math.max(0, c.top - p.top), l = Math.max(0, c.left - p.left)
    const r = Math.max(0, p.right - c.right), b = Math.max(0, p.bottom - c.bottom)
    setInset(`inset(${t}px ${r}px ${b}px ${l}px round 10px)`)
    setShown(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  const leave = () => {
    setOpen(false)
    timer.current = setTimeout(() => setShown(false), 650)
  }
  // Keep the full CRM mounted and sized to the plate ahead of time, so opening never re-fits it.
  useEffect(() => {
    const plate = cell.current?.closest<HTMLElement>('[data-plate]')
    if (!plate) return
    const measure = () => setAspect(plate.clientHeight / plate.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(plate)
    const id = requestAnimationFrame(() => setReady(true))
    return () => { ro.disconnect(); cancelAnimationFrame(id); clearTimeout(timer.current) }
  }, [])

  return (
    <div ref={cell} onPointerEnter={enter} className="art-cell">
      <HeroDemo />
      <div
        className="art-overlay"
        data-open={open || undefined}
        data-shown={shown || undefined}
        style={{ clipPath: open ? 'inset(0px 0px 0px 0px round 0px)' : inset }}
        onPointerLeave={leave}
      >
        {ready && <HeroCrm aspect={aspect} paused={!shown} />}
      </div>
    </div>
  )
}
