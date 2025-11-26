// Local database service untuk development environment
// Menggunakan localStorage sebagai penyimpanan sederhana

export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

class LocalDatabase {
  private static USERS_KEY = 'malnu_db_users';
  private static INITIALIZED_KEY = 'malnu_db_initialized';

  // Initialize database dengan data contoh
  static initialize(): void {
    if (localStorage.getItem(this.INITIALIZED_KEY)) {
      return; // Sudah diinisialisasi
    }

    const initialUsers: User[] = [
      {
        id: 1,
        email: 'admin@ma-malnukananga.sch.id',
        name: 'Administrator Sekolah',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 2,
        email: 'guru@ma-malnukananga.sch.id',
        name: 'Dr. Siti Nurhaliza, M.Pd.',
        role: 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 3,
        email: 'siswa@ma-malnukananga.sch.id',
        name: 'Ahmad Fauzi Rahman',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 4,
        email: 'walikelas@ma-malnukananga.sch.id',
        name: 'Prof. Budi Santoso, M.T.',
        role: 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ];

    localStorage.setItem(this.USERS_KEY, JSON.stringify(initialUsers));
    localStorage.setItem(this.INITIALIZED_KEY, 'true');
    console.log('✅ Local database initialized dengan data contoh');
  }

  // CRUD operations untuk users
  static getAllUsers(): User[] {
    this.initialize();
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static getUserById(id: number): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  static getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email && user.is_active) || null;
  }

  static createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getAllUsers();
    const newUser: User = {
      ...userData,
      id: Date.now(), // Simple ID generation
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  static updateUser(id: number, updates: Partial<User>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex(user => user.id === id);

    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return users[index];
  }

  static deleteUser(id: number): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== id);

    if (filteredUsers.length === users.length) return false;

    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
    return true;
  }

  // Utility functions
  static reset(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.INITIALIZED_KEY);
    console.log('🗑️ Local database direset');
  }

  static exportData(): string {
    const data = {
      users: this.getAllUsers(),
      exported_at: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && Array.isArray(data.users)) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(data.users));
        localStorage.setItem(this.INITIALIZED_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Auto-initialize saat module di-load (development only)
if (import.meta.env?.DEV) {
  LocalDatabase.initialize();
}

export { LocalDatabase };