/**
 * OCR Configuration
 * 
 * Flexy says: Never hardcode OCR patterns and thresholds!
 * Centralized OCR configuration for consistent document processing.
 */

// Language codes for Tesseract.js
export const OCR_LANGUAGE_CODES = {
    INDONESIAN: 'ind',
    ENGLISH: 'eng',
    JAVANESE: 'jav',
    DEFAULT: 'ind',
} as const;

// OCR Quality Thresholds
export const OCR_THRESHOLDS = {
    HIGH_QUALITY_MIN_CONFIDENCE: 70,
    SEARCHABLE_MIN_CONFIDENCE: 50,
    MIN_WORDS_HIGH_QUALITY: 20,
    MIN_WORDS_SEARCHABLE: 5,
    MIN_WORDS_MEANINGFUL: 5,
    SHORT_TEXT_WORD_THRESHOLD: 10,
    SHORT_TEXT_ACCURACY_MULTIPLIER: 0.8,
    SUSPICIOUS_NUMBER_PENALTY: 0.9,
    MIN_CONFIDENCE_OVERALL: 0,
    MAX_CONFIDENCE_OVERALL: 100,
} as const;

// Regular expression patterns for OCR text extraction
export const OCR_PATTERNS = {
    // Grade extraction pattern: Subject name followed by numeric value
    GRADE_EXTRACTION: /([A-Za-z\s]+)[\s:]*([0-9]+(?:,[0-9]{3})?|[0-9]{1,3}(?:,[0-9]{3})?)/g,
    
    // NISN extraction patterns
    NISN_WITH_LABEL: /(?:NISN\s*[:\s]*)?(\d{10})/,
    NISN_EXTRACT: /(?:NISN\s*[:\s]*)?(\d{10})/,
    
    // Name validation pattern: 2-4 capitalized words
    NAME_VALIDATION: /^[A-Z][a-z]+$/,
    
    // Academic document keywords
    ACADEMIC_KEYWORDS: /nilai|grade|matematika|bahasa|ipa|ips|fisika|kimia|biologi/i,
    
    // Form document keywords
    FORM_KEYWORDS: /nisn|nama lengkap|tempat tanggal lahir|alamat/i,
    
    // Certificate document keywords
    CERTIFICATE_KEYWORDS: /surat|sertifikat|ijazah|kelulusan/i,
    
    // Administrative document keywords
    ADMINISTRATIVE_KEYWORDS: /surat|kepala sekolah|tanda tangan|stempel/i,
    
    // Empty or meaningless text pattern
    MEANINGLESS_TEXT: /^\s*$|^[^\w\s]*$|^.{0,3}$/i,
    
    // Suspicious numbers pattern (consecutive digits)
    SUSPICIOUS_NUMBERS: /\d{2,}/,
    
    // Contains letters check
    CONTAINS_LETTERS: /[a-zA-Z]/,
} as const;

// Indonesian school subjects for validation
export const INDONESIAN_SCHOOL_SUBJECTS = [
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'IPA',
    'IPS',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Sosiologi',
    'Ekonomi',
    'PKN',
    'Agama',
    'Seni Budaya',
    'Penjaskes',
    'TIK',
    'Bahasa Arab',
    'Fiqih',
    'Aqidah Akhlak',
    'Bahasa Jawa',
    'Muatan Lokal',
] as const;

// Indonesian school type keywords
export const INDONESIAN_SCHOOL_TYPES = [
    'SD',
    'MI',
    'SMP',
    'MTs',
    'SMA',
    'MA',
    'SMK',
] as const;

// Tesseract status message mappings (Indonesian translations)
export const TESSERACT_STATUS_MAP: Record<string, string> = {
    'loading tesseract core': 'Memuat engine OCR...',
    'initializing tesseract': 'Inisialisasi...',
    'initialized tesseract': 'Engine siap',
    'loading language traineddata': 'Memuat data bahasa...',
    'initializing api': 'Menyiapkan API...',
    'recognizing text': 'Mengenali teks...',
} as const;

// OCR Cache configuration
export const OCR_CACHE_CONFIG = {
    VALIDATION_EVENTS_MAX_SIZE: 100,
    CACHE_KEY_MAX_INPUT_LENGTH: 500,
} as const;

// Grade validation limits
export const OCR_GRADE_LIMITS = {
    MIN: 0,
    MAX: 100,
} as const;

// Name validation configuration
export const NAME_VALIDATION_CONFIG = {
    MIN_WORDS: 2,
    MAX_WORDS: 4,
} as const;

// Document type detection keywords
export const DOCUMENT_TYPE_KEYWORDS = {
    academic: ['nilai', 'grade', 'matematika', 'bahasa', 'ipa', 'ips', 'fisika', 'kimia', 'biologi'],
    form: ['nisn', 'nama lengkap', 'tempat tanggal lahir', 'alamat'],
    certificate: ['surat', 'sertifikat', 'ijazah', 'kelulusan'],
    administrative: ['surat', 'kepala sekolah', 'tanda tangan', 'stempel'],
} as const;

// OCR Event severity levels
export const OCR_EVENT_SEVERITY = {
    SUCCESS: 'success',
    WARNING: 'warning',
    FAILURE: 'failure',
} as const;

// OCR Event types
export const OCR_EVENT_TYPES = {
    VALIDATION_SUCCESS: 'validation-success',
    VALIDATION_WARNING: 'validation-warning',
    VALIDATION_FAILURE: 'validation-failure',
} as const;

/**
 * Check if a subject name is valid
 */
export function isValidSubject(subject: string): boolean {
    const normalizedSubject = subject.toLowerCase();
    return INDONESIAN_SCHOOL_SUBJECTS.some(s => 
        s.toLowerCase().includes(normalizedSubject) || 
        normalizedSubject.includes(s.toLowerCase())
    );
}

/**
 * Check if a grade value is valid
 */
export function isValidOCRGrade(grade: string): boolean {
    const numericGrade = parseInt(grade, 10);
    return !isNaN(numericGrade) && 
           numericGrade >= OCR_GRADE_LIMITS.MIN && 
           numericGrade <= OCR_GRADE_LIMITS.MAX;
}

/**
 * Check if text looks like a school name
 */
export function looksLikeSchoolName(text: string): boolean {
    return INDONESIAN_SCHOOL_TYPES.some(keyword => 
        text.toUpperCase().includes(keyword)
    );
}

/**
 * Check if text looks like a person's name
 */
export function looksLikePersonName(text: string): boolean {
    const words = text.split(' ');
    return words.length >= NAME_VALIDATION_CONFIG.MIN_WORDS && 
           words.length <= NAME_VALIDATION_CONFIG.MAX_WORDS && 
           words.every(word => OCR_PATTERNS.NAME_VALIDATION.test(word));
}

/**
 * Format Tesseract status message
 */
export function formatTesseractStatus(status: string): string {
    return TESSERACT_STATUS_MAP[status] || status;
}

/**
 * Calculate estimated accuracy based on confidence and text characteristics
 */
export function calculateEstimatedAccuracy(
    confidence: number, 
    wordCount: number, 
    text: string
): number {
    let estimatedAccuracy = confidence;
    
    // Penalize very short texts
    if (wordCount < OCR_THRESHOLDS.SHORT_TEXT_WORD_THRESHOLD) {
        estimatedAccuracy *= OCR_THRESHOLDS.SHORT_TEXT_ACCURACY_MULTIPLIER;
    }
    
    // Penalize suspicious numbers without context
    if (OCR_PATTERNS.SUSPICIOUS_NUMBERS.test(text) && 
        !/NISN|Nilai|Grade/i.test(text)) {
        estimatedAccuracy *= OCR_THRESHOLDS.SUSPICIOUS_NUMBER_PENALTY;
    }
    
    return Math.max(
        OCR_THRESHOLDS.MIN_CONFIDENCE_OVERALL, 
        Math.min(OCR_THRESHOLDS.MAX_CONFIDENCE_OVERALL, estimatedAccuracy)
    );
}

/**
 * Determine document type from text content
 */
export function determineDocumentType(text: string): 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate' {
    if (OCR_PATTERNS.ACADEMIC_KEYWORDS.test(text)) {
        return 'academic';
    }
    if (OCR_PATTERNS.FORM_KEYWORDS.test(text)) {
        return 'form';
    }
    if (OCR_PATTERNS.CERTIFICATE_KEYWORDS.test(text)) {
        return 'certificate';
    }
    if (OCR_PATTERNS.ADMINISTRATIVE_KEYWORDS.test(text)) {
        return 'administrative';
    }
    return 'unknown';
}

/**
 * Check if text has meaningful content
 */
export function hasMeaningfulContent(text: string, wordCount: number): boolean {
    return wordCount >= OCR_THRESHOLDS.MIN_WORDS_MEANINGFUL && 
           !OCR_PATTERNS.MEANINGLESS_TEXT.test(text) && 
           OCR_PATTERNS.CONTAINS_LETTERS.test(text);
}
