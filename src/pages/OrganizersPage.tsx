import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { auth, onAuthStateChanged } from '../lib/firebase'
import type { User } from '../lib/firebase'
import { ImageEditor } from '../components/ImageEditor'
import Loader from '../components/ui/Loader'

type Socials = {
  twitter: string
  linkedin: string
  github: string
}

type Organizer = {
  name: string
  phone: string
  email: string
  avatar: string
  socials: Socials
}

export function OrganizersPage() {
  const { hackathonId } = useParams({ from: '/h/$hackathonId' })
  const [user, setUser] = useState<User | null>(null)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [uploading, setUploading] = useState<number | null>(null)
  const [editingImage, setEditingImage] = useState<{ index: number; src: string } | null>(null)

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
        setOrganizers(data.organizers || [])
      } catch (err) {
        console.error('Failed to fetch hackathon', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHackathon()
  }, [hackathonId])

  const handleSave = async () => {
    if (!user) {
      alert('You must be signed in to commit changes.')
      return
    }

    setSaving(true)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          organizers,
          creatorId: user.uid,
        }),
      })
      if (res.ok) {
        alert('Organizers updated successfully.')
      } else {
        const err = await res.json()
        alert(`Failed to save: ${err.message}`)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save organizers.')
    } finally {
      setSaving(false)
    }
  }

  const addOrganizer = () => {
    setOrganizers([
      ...organizers,
      {
        name: '',
        phone: '',
        email: '',
        avatar: '',
        socials: { twitter: '', linkedin: '', github: '' },
      },
    ])
  }

  const removeOrganizer = (index: number) => {
    if (confirm('Are you sure you want to remove this organizer?')) {
      setOrganizers(organizers.filter((_, i) => i !== index))
    }
  }

  const updateOrganizer = (index: number, updates: Partial<Organizer>) => {
    const newOrgs = [...organizers]
    newOrgs[index] = { ...newOrgs[index], ...updates }
    setOrganizers(newOrgs)
  }

  const updateSocials = (index: number, social: keyof Socials, value: string) => {
    const newOrgs = [...organizers]
    newOrgs[index].socials[social] = value
    setOrganizers(newOrgs)
  }

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditingImage({ index, src: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!editingImage) return
    const { index } = editingImage
    setEditingImage(null)
    setUploading(index)

    const formData = new FormData()
    formData.append('file', croppedImage)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    const isPDF = croppedImage.startsWith('data:application/pdf');
    const resourceType = isPDF ? "raw" : "image";
    formData.append('resource_type', resourceType);
    formData.append('folder', `hackathons/${hackathonId}/organisers`)

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
        updateOrganizer(index, { avatar: data.secure_url })
      }
    } catch (err) {
      console.error('Upload failed', err)
      alert('Image upload failed.')
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader text="Initializing Organizers..." />
      </div>
    )
  }

  if (user?.uid !== creatorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron p-8 text-center">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Access Restricted</h2>
        <p className="text-slate-500 max-w-md text-sm">Only the hackathon creator can modify organizer details.</p>
      </div>
    )
  }

  return (
    <section className="space-y-5 pb-16">
      <header className="glass-card p-5 sm:p-8 border-cyan-500/20 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 font-orbitron mb-2">
            Team Management
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-orbitron">
            Organizer <span className="text-cyan-400 text-glow">Profiles</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={addOrganizer} className="neon-btn-outline">
            + ADD ORGANIZER
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="neon-btn-cyan"
          >
            {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {organizers.map((org, index) => (
          <div key={index} className="glass-card p-6 border-white/10 relative group overflow-hidden">
            <button
              onClick={() => removeOrganizer(index)}
              className="absolute top-4 right-4 text-rose-500/30 hover:text-rose-500 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Upload */}
              <div className="shrink-0 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 bg-slate-900 border border-white/10 overflow-hidden">
                  {org.avatar ? (
                    <img src={org.avatar} alt={org.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                    </div>
                  )}
                  {uploading === index && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent animate-spin rounded-full" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(index, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Click to upload photo</p>
              </div>

              {/* Form Info */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1 tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={org.name}
                      onChange={(e) => updateOrganizer(index, { name: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1 tracking-widest">Phone / Support Call</label>
                    <input
                      type="tel"
                      value={org.phone}
                      onChange={(e) => updateOrganizer(index, { phone: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 outline-none"
                      placeholder="e.g. +1 234 567 890"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-orbitron uppercase mb-1 tracking-widest">Support / Contact Email</label>
                    <input
                      type="email"
                      value={org.email}
                      onChange={(e) => updateOrganizer(index, { email: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 outline-none"
                      placeholder="e.g. support@codecraft.com"
                    />
                  </div>

                  {/* Internal Links - Hidden from Dashboard */}
                  <div className="col-span-2 pt-2 border-t border-white/5">
                    <p className="text-[9px] text-[#00ffff]/40 font-orbitron uppercase tracking-widest mb-3">Integrations</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={org.socials.linkedin}
                          onChange={(e) => updateSocials(index, 'linkedin', e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 pl-8 pr-3 py-1.5 text-[10px] font-mono text-white focus:border-cyan-400 outline-none"
                          placeholder="LinkedIn URL"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">in</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={org.socials.github}
                          onChange={(e) => updateSocials(index, 'github', e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 pl-8 pr-3 py-1.5 text-[10px] font-mono text-white focus:border-cyan-400 outline-none"
                          placeholder="GitHub URL"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">gh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    
        {organizers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed border-white/10">
             <div className="h-12 w-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             </div>
             <p className="text-xs font-orbitron text-slate-500 uppercase tracking-widest">No organizers initialized</p>
             <button onClick={addOrganizer} className="mt-4 text-cyan-400 text-[10px] font-bold hover:underline tracking-widest">+ ADD FIRST ORGANIZER</button>
          </div>
        )}
      </div>

      {editingImage && (
        <ImageEditor 
          image={editingImage.src} 
          aspect={1 / 1} // Profile aspect
          onCropComplete={handleCropComplete}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </section>
  )
}
