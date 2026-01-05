export interface User {
  email: string
  name?: string
}

export class AuthService {
  private readonly AUTH_KEY = 'isAuthenticated'
  private readonly USER_KEY = 'user'

  async login(email: string, password: string): Promise<boolean> {
    try {
      // Simple validation logic
      if (!email || !password) {
        return false
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return false
      }

      // In a real app, this would validate against a backend
      // For demo purposes, accept any valid email + non-empty password
      if (password.length >= 6) {
        const user: User = { email, name: email.split('@')[0] }
        
        localStorage.setItem(this.AUTH_KEY, 'true')
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
        
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(this.AUTH_KEY)
      localStorage.removeItem(this.USER_KEY)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  isAuthenticated(): boolean {
    try {
      const result = localStorage.getItem(this.AUTH_KEY)
      return result === 'true'
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }
}