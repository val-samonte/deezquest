'use client'

import { Application } from 'pixi.js'
import { useLayoutEffect, useRef, useState } from 'react'
import { Stage as PixiStage } from 'react-pixi-fiber'

export default function Stage() {
  const div = useRef<HTMLDivElement | null>(null)
  const [app, setApp] = useState<Application | null>(null)

  useLayoutEffect(() => {
    if (!div.current) return

    const canvas = document.createElement('canvas')
    div.current.appendChild(canvas)

    const app = new Application({
      view: canvas,
      width: div.current.clientWidth,
      height: div.current.clientHeight,
    })
    setApp(app)

    const resize = () => {
      if (!div.current) return
      app.renderer.resize(div.current.clientWidth, div.current.clientHeight)
    }

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      setApp(null)
      app.destroy(true, true)
    }
  }, [])

  return (
    <div className='w-full h-full flex portrait:flex-col'>
      <div className='flex-auto'></div>
      <div
        ref={div}
        className='landscape:h-full portrait:w-full aspect-square bg-black flex-none'
      >
        {app && <PixiStage app={app} />}
      </div>
      <div className='flex-auto'></div>
    </div>
  )
}
