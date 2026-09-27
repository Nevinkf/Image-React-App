import { useState, type FormEvent } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { api } from './api'

type Props = { show: boolean; onClose: () => void; onUploaded: () => void }

function UploadModal({ show, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [tags, setTags] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    const form = new FormData()
    form.append('title', title)
    form.append('image', file)
    form.append('tags', tags)

  
    setSubmitting(true)
    setError(null)
    try {
      // No Content-Type header: the browser sets the multipart boundary itself
      await api('/api/images', { method: 'POST', body: form })
      setTitle('')
      setFile(null)
      setTags('')
      onUploaded()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Upload an image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="uploadTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Form.Group>
           <Form.Group className="mb-3" controlId="uploadTags">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="sunset, beach, travel"
            />
            <Form.Text>Optional, comma-separated. Up to 10.</Form.Text>
          </Form.Group>
          <Form.Group controlId="uploadFile">
            <Form.Label>Image (max 10 MB)</Form.Label>
            <Form.Control
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting || !file}>
            {submitting ? 'Uploading…' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UploadModal