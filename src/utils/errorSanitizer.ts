// Error message sanitization service
// Prevents information disclosure through error messages

interface ErrorContext {
  userId?: string;
  ip?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  timestamp?: string;
}

interface SanitizedError {
  message: string;
  code: string;
  statusCode: number;
  shouldLog: boolean;
  context?: ErrorContext;
}

class ErrorSanitizer {
  private static sensitivePatterns = [
    // Database information
    /database/i,
    /table/i,
    /column/i,
    /sql/i,
    /query/i,
    /connection/i,
    
    // File system information
    /\/[a-zA-Z0-9\/_-]+\.(js|ts|json|env|config)/i,
    /c:\\[a-zA-Z0-9\\_-]+\.(js|ts|json|env|config)/i,
    /file path/i,
    /directory/i,
    
    // Server information
    /server/i,
    /host/i,
    /port/i,
    /localhost/i,
    /127\.0\.0\.1/i,
    /internal/i,
    
    // Authentication secrets
    /secret/i,
    /key/i,
    /token/i,
    /password/i,
    /hash/i,
    /salt/i,
    /jwt/i,
    
    // Stack trace patterns
    /at\s+.*\s+\(.*\)/,
    /\.js:\d+:\d+/,
    /\.ts:\d+:\d+/,
    /node_modules/i,
    
    // Environment variables
    /process\.env/i,
    /VITE_/i,
    /ENV_/i,
    
    // API endpoints and internal routes
    /\/api\//i,
    /\/internal\//i,
    /\/admin\//i
  ];

  private static errorCodes = {
    // Authentication errors
    AUTH_INVALID_CREDENTIALS: 'AUTH_001',
    AUTH_TOKEN_EXPIRED: 'AUTH_002', 
    AUTH_TOKEN_INVALID: 'AUTH_003',
    AUTH_UNAUTHORIZED: 'AUTH_004',
    AUTH_FORBIDDEN: 'AUTH_005',
    AUTH_RATE_LIMITED: 'AUTH_006',
    
    // Validation errors
    VALIDATION_INVALID_INPUT: 'VAL_001',
    VALIDATION_MISSING_FIELD: 'VAL_002',
    VALIDATION_INVALID_FORMAT: 'VAL_003',
    VALIDATION_TOO_LONG: 'VAL_004',
    VALIDATION_TOO_SHORT: 'VAL_005',
    
    // Resource errors
    RESOURCE_NOT_FOUND: 'RES_001',
    RESOURCE_ALREADY_EXISTS: 'RES_002',
    RESOURCE_ACCESS_DENIED: 'RES_003',
    RESOURCE_LOCKED: 'RES_004',
    
    // Server errors
    SERVER_INTERNAL_ERROR: 'SRV_001',
    SERVER_UNAVAILABLE: 'SRV_002',
    SERVER_TIMEOUT: 'SRV_003',
    SERVER_OVERLOAD: 'SRV_004',
    
    // Network errors
    NETWORK_CONNECTION_FAILED: 'NET_001',
    NETWORK_TIMEOUT: 'NET_002',
    NETWORK_UNREACHABLE: 'NET_003',
    
    // Security errors
    SECURITY_SUSPICIOUS_ACTIVITY: 'SEC_001',
    SECURITY_BLOCKED_REQUEST: 'SEC_002',
    SECURITY_INVALID_ORIGIN: 'SEC_003',
    SECURITY_CSRF_INVALID: 'SEC_004'
  };

  // Sanitize error message to prevent information disclosure
  static sanitizeError(error: Error | string, context?: ErrorContext): SanitizedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = typeof error === 'string' ? 'Error' : error.name;
    
    // Determine error type and appropriate response
    const errorType = this.classifyError(errorMessage, errorName);
    const sanitizedMessage = this.getSanitizedMessage(errorType);
    const statusCode = this.getStatusCode(errorType);
    const errorCode = this.getErrorCode(errorType);
    
    // Check if this error should be logged with full details
    const shouldLog = this.shouldLogError(errorType, errorMessage);
    
    return {
      message: sanitizedMessage,
      code: errorCode,
      statusCode,
      shouldLog,
      context: shouldLog ? context : undefined
    };
  }

  // Classify error type based on message and name
  private static classifyError(message: string, name: string): string {
    const lowerMessage = message.toLowerCase();
    const lowerName = name.toLowerCase();
    
    // Authentication errors
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication failed')) {
      return 'AUTH_UNAUTHORIZED';
    }
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('access denied')) {
      return 'AUTH_FORBIDDEN';
    }
    if (lowerMessage.includes('token') && (lowerMessage.includes('expired') || lowerMessage.includes('invalid'))) {
      return 'AUTH_TOKEN_INVALID';
    }
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return 'AUTH_RATE_LIMITED';
    }
    
    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid input')) {
      return 'VALIDATION_INVALID_INPUT';
    }
    if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
      return 'VALIDATION_MISSING_FIELD';
    }
    if (lowerMessage.includes('format') || lowerMessage.includes('pattern')) {
      return 'VALIDATION_INVALID_FORMAT';
    }
    
    // Resource errors
    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
      return 'RESOURCE_NOT_FOUND';
    }
    if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
      return 'RESOURCE_ALREADY_EXISTS';
    }
    
    // Network errors
    if (lowerMessage.includes('connection') || lowerMessage.includes('network')) {
      return 'NETWORK_CONNECTION_FAILED';
    }
    if (lowerMessage.includes('timeout')) {
      return 'NETWORK_TIMEOUT';
    }
    
    // Security errors
    if (lowerMessage.includes('csrf') || lowerMessage.includes('cross-site')) {
      return 'SECURITY_CSRF_INVALID';
    }
    if (lowerMessage.includes('origin') || lowerMessage.includes('cors')) {
      return 'SECURITY_INVALID_ORIGIN';
    }
    if (lowerMessage.includes('suspicious') || lowerMessage.includes('blocked')) {
      return 'SECURITY_SUSPICIOUS_ACTIVITY';
    }
    
    // Default to server error
    return 'SERVER_INTERNAL_ERROR';
  }

  // Get sanitized message for error type
  private static getSanitizedMessage(errorType: string): string {
    const messages: Record<string, string> = {
      // Authentication messages
      'AUTH_UNAUTHORIZED': 'Autentikasi diperlukan untuk mengakses resource ini.',
      'AUTH_TOKEN_EXPIRED': 'Sesi Anda telah berakhir. Silakan login kembali.',
      'AUTH_TOKEN_INVALID': 'Token autentikasi tidak valid.',
      'AUTH_FORBIDDEN': 'Anda tidak memiliki izin untuk mengakses resource ini.',
      'AUTH_RATE_LIMITED': 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat.',
      
      // Validation messages
      'VALIDATION_INVALID_INPUT': 'Input yang diberikan tidak valid.',
      'VALIDATION_MISSING_FIELD': 'Field yang diperlukan tidak lengkap.',
      'VALIDATION_INVALID_FORMAT': 'Format input tidak sesuai.',
      'VALIDATION_TOO_LONG': 'Input terlalu panjang.',
      'VALIDATION_TOO_SHORT': 'Input terlalu pendek.',
      
      // Resource messages
      'RESOURCE_NOT_FOUND': 'Resource yang diminta tidak ditemukan.',
      'RESOURCE_ALREADY_EXISTS': 'Resource sudah ada.',
      'RESOURCE_ACCESS_DENIED': 'Akses ke resource ditolak.',
      'RESOURCE_LOCKED': 'Resource sedang dikunci.',
      
      // Server messages
      'SERVER_INTERNAL_ERROR': 'Terjadi kesalahan pada server. Silakan coba lagi.',
      'SERVER_UNAVAILABLE': 'Server sedang tidak tersedia. Silakan coba lagi nanti.',
      'SERVER_TIMEOUT': 'Permintaan timeout. Silakan coba lagi.',
      'SERVER_OVERLOAD': 'Server sedang sibuk. Silakan coba lagi beberapa saat.',
      
      // Network messages
      'NETWORK_CONNECTION_FAILED': 'Koneksi gagal. Periksa koneksi internet Anda.',
      'NETWORK_TIMEOUT': 'Koneksi timeout. Periksa koneksi internet Anda.',
      'NETWORK_UNREACHABLE': 'Tidak dapat terhubung ke server.',
      
      // Security messages
      'SECURITY_SUSPICIOUS_ACTIVITY': 'Permintaan diblokir karena alasan keamanan.',
      'SECURITY_BLOCKED_REQUEST': 'Permintaan diblokir oleh sistem keamanan.',
      'SECURITY_INVALID_ORIGIN': 'Origin tidak valid.',
      'SECURITY_CSRF_INVALID': 'Token CSRF tidak valid.'
    };
    
    return messages[errorType] || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  // Get appropriate HTTP status code
  private static getStatusCode(errorType: string): number {
    const statusCodes: Record<string, number> = {
      // Authentication: 401-403
      'AUTH_UNAUTHORIZED': 401,
      'AUTH_TOKEN_EXPIRED': 401,
      'AUTH_TOKEN_INVALID': 401,
      'AUTH_FORBIDDEN': 403,
      'AUTH_RATE_LIMITED': 429,
      
      // Validation: 400
      'VALIDATION_INVALID_INPUT': 400,
      'VALIDATION_MISSING_FIELD': 400,
      'VALIDATION_INVALID_FORMAT': 400,
      'VALIDATION_TOO_LONG': 400,
      'VALIDATION_TOO_SHORT': 400,
      
      // Resource: 404-409
      'RESOURCE_NOT_FOUND': 404,
      'RESOURCE_ALREADY_EXISTS': 409,
      'RESOURCE_ACCESS_DENIED': 403,
      'RESOURCE_LOCKED': 423,
      
      // Server: 500-503
      'SERVER_INTERNAL_ERROR': 500,
      'SERVER_UNAVAILABLE': 503,
      'SERVER_TIMEOUT': 504,
      'SERVER_OVERLOAD': 503,
      
      // Network: 502-504
      'NETWORK_CONNECTION_FAILED': 502,
      'NETWORK_TIMEOUT': 504,
      'NETWORK_UNREACHABLE': 502,
      
      // Security: 403-429
      'SECURITY_SUSPICIOUS_ACTIVITY': 403,
      'SECURITY_BLOCKED_REQUEST': 429,
      'SECURITY_INVALID_ORIGIN': 403,
      'SECURITY_CSRF_INVALID': 403
    };
    
    return statusCodes[errorType] || 500;
  }

  // Get error code
  private static getErrorCode(errorType: string): string {
    return this.errorCodes[errorType as keyof typeof this.errorCodes] || 'UNKNOWN_001';
  }

  // Determine if error should be logged with full details
  private static shouldLogError(errorType: string, originalMessage: string): boolean {
    // Log all server and security errors
    if (errorType.startsWith('SERVER_') || errorType.startsWith('SECURITY_')) {
      return true;
    }
    
    // Log authentication failures for security monitoring
    if (errorType.startsWith('AUTH_')) {
      return true;
    }
    
    // Log if original message contains sensitive information
    const hasSensitiveInfo = this.sensitivePatterns.some(pattern => 
      pattern.test(originalMessage)
    );
    
    return hasSensitiveInfo;
  }

  // Remove sensitive information from any string
  static removeSensitiveInfo(text: string): string {
    let sanitized = text;
    
    // Remove sensitive patterns
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    
    // Remove potential stack traces
    sanitized = sanitized.replace(/at\s+.*\s+\(.*\)/g, '[STACK_TRACE]');
    sanitized = sanitized.replace(/\.js:\d+:\d+/g, '[LOCATION]');
    sanitized = sanitized.replace(/\.ts:\d+:\d+/g, '[LOCATION]');
    
    // Remove file paths
    sanitized = sanitized.replace(/\/[a-zA-Z0-9\/_-]+\.[a-zA-Z0-9_-]+/g, '[FILE_PATH]');
    sanitized = sanitized.replace(/[a-zA-Z]:\\[a-zA-Z0-9\\_-]+\.[a-zA-Z0-9_-]+/g, '[FILE_PATH]');
    
    // Remove environment variables
    sanitized = sanitized.replace(/process\.env\.[a-zA-Z0-9_]+/g, '[ENV_VAR]');
    sanitized = sanitized.replace(/[A-Z_]+=[a-zA-Z0-9_-]+/g, '[CONFIG]');
    
    return sanitized;
  }

  // Create safe error response for API
  static createErrorResponse(error: Error | string, context?: ErrorContext): Response {
    const sanitized = this.sanitizeError(error, context);
    
    // Log full error if needed
    if (sanitized.shouldLog && context) {
      console.error('Error Details:', {
        code: sanitized.code,
        message: typeof error === 'string' ? error : error.message,
        context,
        timestamp: new Date().toISOString()
      });
    }
    
    const responseBody = {
      success: false,
      error: {
        code: sanitized.code,
        message: sanitized.message,
        timestamp: new Date().toISOString()
      }
    };
    
    return new Response(JSON.stringify(responseBody), {
      status: sanitized.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': sanitized.code,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  }
}

export default ErrorSanitizer;
export { ErrorSanitizer, SanitizedError, ErrorContext };