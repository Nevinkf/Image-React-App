import { useState, type FormEvent } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useAuth } from './AuthContext'

export type AuthMode = 'login' | 'register'

type Props = {
  mode: AuthMode | null
  onClose: () => void
  onSwitch: (mode: AuthMode) => void
}

function AuthModal({ mode, onClose, onSwitch }: Props) {
  const { login, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode !== 'register'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await (isLogin ? login : register)(username, password)
      setPassword('')
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

   return (
    <Modal show={mode !== null} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isLogin ? 'Log in' : 'Sign up'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="authUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </Form.Group>
          <Form.Group controlId="authPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : 8}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button
            variant="link"
            onClick={() => {
              setError(null)
              onSwitch(isLogin ? 'register' : 'login')
            }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </Button>
          <Button type="submit" disabled={submitting}>
            {isLogin ? 'Log in' : 'Sign up'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AuthModal