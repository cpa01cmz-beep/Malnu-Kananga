// Messaging service untuk komunikasi antara orang tua, guru, dan admin
// Sistem pesan terintegrasi dengan real-time notifications

import { Message, currentParent } from '../data/parentData';

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'parent' | 'teacher' | 'admin';
  }[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'behavior' | 'announcement' | 'meeting';
  role: 'teacher' | 'admin';
}

class MessagingService {
  private static conversations: Conversation[] = [];
  private static templates: MessageTemplate[] = [
    {
      id: 'TMP001',
      title: 'Perkembangan Akademik',
      content: 'Assalamualaikum Bapak/Ibu, saya ingin memberikan update mengenai perkembangan akademik anak Bapak/Ibu di mata pelajaran [MATA_PELAJARAN].',
      category: 'academic',
      role: 'teacher'
    },
    {
      id: 'TMP002',
      title: 'Undangan Rapat',
      content: 'Dengan hormat, kami mengundang Bapak/Ibu untuk menghadiri rapat orang tua siswa yang akan dilaksanakan pada [TANGGAL] pukul [WAKTU].',
      category: 'meeting',
      role: 'admin'
    },
    {
      id: 'TMP003',
      title: 'Perilaku Positif',
      content: 'Saya ingin menginformasikan bahwa anak Bapak/Ibu menunjukkan perilaku yang sangat baik dalam beberapa minggu terakhir.',
      category: 'behavior',
      role: 'teacher'
    }
  ];

  // Mengirim pesan baru
  static async sendMessage(
    to: { id: string; name: string; role: 'parent' | 'teacher' | 'admin' },
    subject: string,
    content: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Message> {
    const newMessage: Message = {
      id: `MSG${Date.now()}`,
      from: {
        id: currentParent.id,
        name: currentParent.name,
        role: 'parent'
      },
      to,
      subject,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority
    };

    // In real implementation, this would save to database
    // For now, we'll simulate the message creation
    console.log('Message sent:', newMessage);

    return newMessage;
  }

  // Mendapatkan semua percakapan
  static getConversations(): Conversation[] {
    // Mock conversations based on messages
    const conversationsMap = new Map<string, Conversation>();

    // Group messages by conversation (simplified logic)
    const mockConversations: Conversation[] = [
      {
        id: 'CONV001',
        participants: [
          { id: currentParent.id, name: currentParent.name, role: 'parent' },
          { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' }
        ],
        lastMessage: {
          id: 'MSG001',
          from: { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' },
          to: { id: currentParent.id, name: currentParent.name, role: 'parent' },
          subject: 'Perkembangan Akademik Ahmad Fauzi',
          content: 'Assalamualaikum Bapak Ahmad, saya ingin memberikan update mengenai perkembangan akademik Ahmad Fauzi di mata pelajaran Matematika.',
          timestamp: '2024-10-01T10:30:00Z',
          isRead: false,
          priority: 'normal'
        },
        unreadCount: 1,
        updatedAt: '2024-10-01T10:30:00Z'
      }
    ];

    return mockConversations;
  }

  // Mendapatkan pesan dalam percakapan tertentu
  static getMessages(conversationId: string): Message[] {
    // Return mock messages for the conversation
    return [
      {
        id: 'MSG001',
        from: { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' },
        to: { id: currentParent.id, name: currentParent.name, role: 'parent' },
        subject: 'Perkembangan Akademik Ahmad Fauzi',
        content: 'Assalamualaikum Bapak Ahmad, saya ingin memberikan update mengenai perkembangan akademik Ahmad Fauzi di mata pelajaran Matematika. Beliau menunjukkan peningkatan yang signifikan dalam beberapa minggu terakhir.',
        timestamp: '2024-10-01T10:30:00Z',
        isRead: false,
        priority: 'normal'
      },
      {
        id: 'MSG002',
        from: { id: currentParent.id, name: currentParent.name, role: 'parent' },
        to: { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' },
        subject: 'Re: Perkembangan Akademik Ahmad Fauzi',
        content: 'Waalaikumsalam Ibu Siti. Terima kasih atas informasinya. Apa yang bisa kami lakukan di rumah untuk mendukung perkembangan Ahmad?',
        timestamp: '2024-10-01T11:15:00Z',
        isRead: true,
        priority: 'normal'
      }
    ];
  }

  // Mendapatkan template pesan
  static getMessageTemplates(): MessageTemplate[] {
    return this.templates;
  }

  // Membuat pesan dari template
  static createMessageFromTemplate(
    templateId: string,
    customizations: { [key: string]: string }
  ): { subject: string; content: string } | null {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return null;

    let { subject, content } = {
      subject: template.title,
      content: template.content
    };

    // Replace placeholders with actual values
    Object.entries(customizations).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, content };
  }

  // Menandai pesan sebagai sudah dibaca
  static markMessageAsRead(messageId: string): void {
    // In real implementation, this would update the database
    console.log('Message marked as read:', messageId);
  }

  // Menandai semua pesan sebagai sudah dibaca
  static markAllMessagesAsRead(): void {
    // In real implementation, this would update the database
    console.log('All messages marked as read');
  }

  // Mendapatkan statistik pesan
  static getMessageStats(): {
    total: number;
    unread: number;
    byPriority: { low: number; normal: number; high: number; urgent: number };
    bySender: { teachers: number; admins: number; parents: number };
  } {
    // Mock statistics
    return {
      total: 25,
      unread: 3,
      byPriority: { low: 5, normal: 15, high: 4, urgent: 1 },
      bySender: { teachers: 18, admins: 5, parents: 2 }
    };
  }

  // Mengirim pesan broadcast ke semua orang tua
  static async sendBroadcastMessage(
    subject: string,
    content: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<void> {
    // In real implementation, this would send to all parents
    console.log('Broadcast message sent:', { subject, content, priority });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Upload lampiran pesan
  static async uploadAttachment(file: File): Promise<string> {
    // In real implementation, this would upload to cloud storage
    console.log('File uploaded:', file.name);

    // Return mock URL
    return `https://storage.example.com/attachments/${Date.now()}-${file.name}`;
  }

  // Real-time message listener (mock implementation)
  static onNewMessage(callback: (message: Message) => void): () => void {
    // In real implementation, this would use WebSocket or Server-Sent Events
    const mockNewMessage = (): void => {
      const randomMessage: Message = {
        id: `MSG${Date.now()}`,
        from: { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' },
        to: { id: currentParent.id, name: currentParent.name, role: 'parent' },
        subject: 'Update Akademik',
        content: 'Assalamualaikum, berikut adalah update terbaru mengenai perkembangan akademik anak Bapak/Ibu.',
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'normal'
      };

      callback(randomMessage);
    };

    // Simulate receiving new messages occasionally
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        mockNewMessage();
      }
    }, 10000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export default MessagingService;