import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { auth, onAuthStateChanged } from '../lib/firebase'
import type { User } from '../lib/firebase'
import { ImageEditor } from '../components/ImageEditor'
import Loader from '../components/ui/Loader'

export function HackathonSettingsPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [user, setUser] = useState<User | null>(null)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    title: '',
    tagline: '',
    date: '',
    prize: '',
    startDate: '',
    endDate: '',
    banner: '',
  })

  // Helper to format Date for datetime-local input (local time)
  const formatForInput = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`)
        const data = await res.json()
        setCreatorId(data.creatorId || null)
        setSettings({
          title: data.title || '',
          tagline: data.tagline || '',
          date: data.date || '',
          prize: data.prize || '',
          startDate: formatForInput(data.startDate),
          endDate: formatForInput(data.endDate),
          banner: data.banner || '',
        })
      } catch (err) {
        console.error('Failed to fetch hackathon', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHackathon()
  }, [hackathonId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: settings.title,
          tagline: settings.tagline,
          date: settings.date,
          prize: settings.prize,
          startDate: settings.startDate || undefined,
          endDate: settings.endDate || undefined,
          banner: settings.banner,
          creatorId: user?.uid,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Failed to save: ${err.message}`)
      } else {
        alert('Settings saved successfully.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user) {
        alert("You must be authenticated to delete this hackathon.")
        return
    }
    if (user.uid !== creatorId) {
        alert("Only the creator can delete this hackathon.")
        return
    }
    if (!confirm("Are you sure you want to permanently delete this hackathon and all associated registrations? This action cannot be undone.")) {
        return
    }

    setDeleting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}?creatorId=${user.uid}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        alert('Hackathon deleted successfully')
        navigate({ to: '/' })
      } else {
        const errorData = await response.json()
        alert(`Failed to delete hackathon: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Failed to delete hackathon:', error)
      alert('Failed to delete hackathon')
    } finally {
      setDeleting(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditingImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    setEditingImage(null)
    setUploadingBanner(true)
    const formData = new FormData()
    formData.append('file', croppedImage)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    const isPDF = croppedImage.startsWith('data:application/pdf')
    const resourceType = isPDF ? 'raw' : 'image'
    formData.append('resource_type', resourceType)
    formData.append('folder', `hackathons/${hackathonId}/banners`)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      const data = await res.json()
      if (data.secure_url) {
        setSettings(s => ({ ...s, banner: data.secure_url }))
      } else {
        alert(`Upload failed: ${data.error?.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to upload banner.')
    } finally {
      setUploadingBanner(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader text="Initializing core settings..." />
      </div>
    )
  }

  if (user?.uid !== creatorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron p-8 text-center">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Access Restricted</h2>
        <p className="text-slate-500 max-w-md text-sm">Only the hackathon creator can modify these settings.</p>
      </div>
    )
  }

  const FIELD_CLASS = "admin-input"
  const LABEL_CLASS = "block text-[10px] text-slate-500 font-orbitron uppercase mb-1 tracking-widest"

  return (
    <section className="space-y-5 pb-16">
      {/* Header */}
      <header className="glass-card p-5 sm:p-8 border-cyan-500/20 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
            System Config
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-orbitron">
            Hackathon <span className="text-cyan-400 text-glow">Settings</span>
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="neon-btn-cyan w-full sm:w-auto"
        >
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </header>

      {/* Identity settings */}
      <div className="glass-card p-6 border-white/10 space-y-6">
        <h2 className="text-sm font-orbitron text-cyan-400 tracking-widest uppercase">Global Hackathon Window</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>Hackathon Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))}
              className={FIELD_CLASS}
              placeholder="e.g. CodeCraft 2026"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))}
              className={FIELD_CLASS}
              placeholder="e.g. Where Software Meets Hardware"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Display Date (e.g., "May 15-17")</label>
            <input
              type="text"
              value={settings.date}
              onChange={e => setSettings(s => ({ ...s, date: e.target.value }))}
              className={FIELD_CLASS}
              placeholder="e.g. May 15-17"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Prize Pool (Optional)</label>
            <input
              type="text"
              value={settings.prize}
              onChange={e => setSettings(s => ({ ...s, prize: e.target.value }))}
              className={FIELD_CLASS}
              placeholder="e.g. ₹1,00,000 or leave empty"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>System Start Date & Time</label>
            <input
              type="datetime-local"
              value={settings.startDate}
              onChange={e => setSettings(s => ({ ...s, startDate: e.target.value }))}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>System End Date & Time</label>
            <input
              type="datetime-local"
              value={settings.endDate}
              onChange={e => setSettings(s => ({ ...s, endDate: e.target.value }))}
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Branding Settings */}
      <div className="glass-card p-6 border-white/10 space-y-6">
        <h2 className="text-sm font-orbitron text-cyan-400 tracking-widest uppercase">Branding & Identity</h2>
        
        <div className="space-y-4">
          <label className={LABEL_CLASS}>Hackathon Banner Image</label>
          
          <div className="relative group">
            <div className="h-40 w-full bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center relative">
              {settings.banner ? (
                <>
                  {settings.banner.trim().toLowerCase().startsWith('linear-gradient') ? (
                    <div 
                      className="w-full h-full opacity-60 group-hover:opacity-40 transition-opacity"
                      style={{ backgroundImage: settings.banner.trim() }}
                    />
                  ) : (
                    <img 
                      src={settings.banner} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-orbitron text-white uppercase tracking-widest bg-black/60 px-4 py-2 border border-white/20">Click to Replace</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] font-orbitron uppercase tracking-widest">No Banner Selected</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                onChange={handleBannerUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {uploadingBanner && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <div className="text-cyan-400 font-orbitron text-[10px] animate-pulse tracking-[0.3em] uppercase">Uploading to Cloud...</div>
                </div>
              )}
            </div>
            
            <p className="mt-2 text-[10px] text-slate-500 font-mono leading-relaxed">
              Recommended: 1920x400. This banner will be displayed at the top of the participant dashboard to define your hackathon's visual theme.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-rose-500/20 bg-rose-500/5 space-y-6">
        <div>
          <h2 className="text-sm font-orbitron text-rose-500 tracking-widest uppercase mb-1">Danger Zone</h2>
          <p className="text-[10px] text-rose-500/50 font-mono uppercase tracking-widest">Permanent Destruction Protocol</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 border border-rose-500/20 bg-rose-500/5">
          <div className="max-w-md">
            <h3 className="text-xs font-bold text-white font-orbitron mb-1 uppercase">Delete this Hackathon</h3>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              This action is irreversible. It will wipe all phases, configuration data, and participant registrations from the central database.
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="border border-rose-500/50 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold uppercase tracking-widest text-[10px] py-3 px-8 transition-colors font-orbitron whitespace-nowrap"
          >
            {deleting ? 'DELETING NODE...' : 'DELETE HACKATHON'}
          </button>
        </div>
      </div>

      {editingImage && (
        <ImageEditor 
          image={editingImage} 
          aspect={1920 / 480} // Wide banner aspect
          onCropComplete={handleCropComplete}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </section>
  )
}
