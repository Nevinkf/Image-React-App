import { Button } from 'react-bootstrap'
import { useAuth } from './AuthContext'
import type { AuthMode } from './AuthModal'

type Props = {
  onAuth: (mode: AuthMode) => void
  onUpload: () => void
}

function Header({ onAuth, onUpload }: Props) {
  const { user, loading, logout } = useAuth()

  return (
    <header className="container d-flex align-items-center justify-content-between py-3">
      <h1 className="h4 m-0">Image App</h1>
      {!loading && (user ? (
        <div className="d-flex align-items-center gap-2">
          <span className="text-body-secondary">Hi, {user.username}</span>
          <Button size="sm" onClick={onUpload}>Upload</Button>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => logout().catch((err) => console.error('Logout failed', err))}
          >
            Log out
          </Button>
        </div>
      ) : (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => onAuth('login')}>Log in</Button>
          <Button size="sm" onClick={() => onAuth('register')}>Sign up</Button>
        </div>
      ))}
    </header>
  )
}

export default Header