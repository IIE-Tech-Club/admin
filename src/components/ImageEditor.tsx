import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../lib/cropUtils'

interface ImageEditorProps {
  image: string
  aspect?: number
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
}

interface Area {
  width: number
  height: number
  x: number
  y: number
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
  image, 
  aspect = 4 / 3, 
  onCropComplete, 
  onCancel 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl h-[60vh] md:h-[70vh] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={setZoom}
          classes={{
            containerClassName: "bg-slate-950",
            cropAreaClassName: "border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          }}
        />
      </div>

      <div className="mt-8 w-full max-w-xl space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-widest">Optical Zoom</label>
            <span className="text-[10px] font-mono text-slate-500">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-black py-4 tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
          >
            Confirm & Initialize
          </button>
          <button
            onClick={onCancel}
            className="px-8 border border-white/10 hover:bg-white/5 text-white font-orbitron font-bold py-4 tracking-[0.2em] uppercase transition-all active:scale-95"
          >
            Abort
          </button>
        </div>
        
        <p className="text-[9px] text-center text-slate-600 font-mono uppercase tracking-[0.3em]">
          Drag to reposition • Scroll or use slider to zoom
        </p>
      </div>
    </div>
  )
}
