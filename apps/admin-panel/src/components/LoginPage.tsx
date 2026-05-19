import { useState } from 'react'
import type { FC } from 'react'
import { login, setToken } from '../services/auth'
import styles from './LoginPage.module.css'

interface Props {
  onLogin: () => void
}

export const LoginPage: FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setError('')
    setPending(true)
    try {
      const token = await login({ username: username.trim(), password })
      setToken(token)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Admin Login</h1>

        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            disabled={pending}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={pending}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.btn}
          type="submit"
          disabled={!username || !password || pending}
        >
          {pending ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}
