import { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

import Header from './Header'
import Footer from './Footer'
import AuthModal, { type AuthMode } from './AuthModal'
import UploadModal from './UploadModal'
import { useAuth } from './AuthContext'
import { api } from './api'
import './App.css'
import { useDebounced } from './useDebounced'
import SearchBar from './SearchBar'

type Image = {
  id: number
  title: string
  url: string
  uploader: string | null
  likeCount: number
  likedByMe: boolean
  tags: string[]
}

function App() {
  const { user } = useAuth()
  const [images, setImages] = useState<Image[]>([])
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const [search, setSearch] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const debouncedSearch = useDebounced(search.trim(), 300)

  const loadImages = useCallback((signal?: AbortSignal) => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (tag) params.set('tag', tag)
    const qs = params.toString()
    return api<Image[]>(`/api/images${qs ? `?${qs}` : ''}`, { signal })
      .then(setImages)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load images', err)
      })
  }, [debouncedSearch, tag])

  // Reload when the user changes so likedByMe matches whoever is logged in.
  // Abort the previous request so a slow, stale search can't overwrite a newer one.
  useEffect(() => {
    const controller = new AbortController()
    loadImages(controller.signal)
    return () => controller.abort()
  }, [loadImages, user?.id])

  // Reload when the user changes so likedByMe matches whoever is logged in.
  // Abort the previous request so a slow, stale search can't overwrite a newer one.
  useEffect(() => {
    const controller = new AbortController()
    loadImages(controller.signal)
    return () => controller.abort()
  }, [loadImages, user?.id])

  async function toggleLike(image: Image) {
    if (!user) {
      setAuthMode('login')
      return
    }
    const setLike = (likedByMe: boolean, likeCount: number) =>
      setImages((imgs) => imgs.map((i) => (i.id === image.id ? { ...i, likedByMe, likeCount } : i)))

    const liked = !image.likedByMe
    setLike(liked, image.likeCount + (liked ? 1 : -1)) // optimistic update
    try {
      const res = await api<{ likeCount: number; likedByMe: boolean }>(
        `/api/images/${image.id}/like`,
        { method: liked ? 'POST' : 'DELETE' }
      )
      setLike(res.likedByMe, res.likeCount)
    } catch (err) {
      console.error('Failed to update like', err)
      setLike(image.likedByMe, image.likeCount) // roll back
    }
  }

  return (
    <>
      <Header onAuth={setAuthMode} onUpload={() => setShowUpload(true)} />

      <div className="container">
        <SearchBar search={search} onSearch={setSearch} tag={tag} onClearTag={() => setTag(null)} />
        {images.length === 0 && (debouncedSearch || tag) && (
          <p className="text-body-secondary">No images match your search.</p>
        )}
        <div className="row g-3">
          {images.map((image) => (
            <div className="col" key={image.id}>
              <div className="card shadow-sm">
                <img className="card-img-top" src={image.url} alt={image.title}/>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="card-text mb-0">{image.title}</p>
                    {image.uploader && (
                      <small className="text-body-secondary">by {image.uploader}</small>
                    )}
                    {image.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {image.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="badge rounded-pill text-bg-light border"
                            onClick={() => setTag(t)}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={image.likedByMe ? 'danger' : 'outline-danger'}
                    aria-pressed={image.likedByMe}
                    onClick={() => toggleLike(image)}
                  >
                    ♥ {image.likeCount}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <Footer />
      </section>

      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />
      <UploadModal show={showUpload} onClose={() => setShowUpload(false)} onUploaded={loadImages} />
    </>
  )
}

export default App
