import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import DOMPurify from 'dompurify'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// Initialize Redis for rate limiting
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else {
  console.warn('Redis configuration missing. Rate limiting and security features will be disabled.')
  // Create a mock Redis client for development
  redis = {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    incr: async () => 1,
    pipeline: () => ({
      incr: () => {},
      expire: () => {},
      exec: async () => [1, 1]
    }),
    ttl: async () => 0,
    lpush: async () => 1,
    expire: async () => 1,
  } as any
}

// Rate limiting configuration
const RATE_LIMITS = {
  auth: {
    max: 5, // 5 attempts
    window: 15 * 60 * 1000, // 15 minutes
  },
  api: {
    max: 100, // 100 requests
    window: 15 * 60 * 1000, // 15 minutes
  },
  upload: {
    max: 10, // 10 uploads
    window: 60 * 60 * 1000, // 1 hour
  },
  search: {
    max: 50, // 50 searches
    window: 15 * 60 * 1000, // 15 minutes
  },
}

// Rate limiting middleware
export async function rateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'api'
): Promise<{ success: boolean; remaining?: number; reset?: number }> {
  if (!redis) {
    // If Redis is not available, allow all requests
    return { success: true }
  }

  const config = RATE_LIMITS[type]
  const key = `rate_limit:${type}:${identifier}`
  
  try {
    const current = await redis.get(key) as string | null
    const count = current ? parseInt(current) : 0
    
    if (count >= config.max) {
      // Get TTL for reset time
      const ttl = await redis.ttl(key)
      return { 
        success: false, 
        reset: Date.now() + (ttl * 1000)
      }
    }
    
    // Increment counter
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, Math.ceil(config.window / 1000))
    
    const results = await pipeline.exec() as [any, any][]
    const newCount = results?.[0]?.[1] as number || 0
    
    return {
      success: true,
      remaining: Math.max(0, config.max - newCount),
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return { success: true }
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

// Output encoding
export function encodeOutput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  if (!redis) {
    // If Redis is not available, don't validate CSRF tokens
    return false
  }
  
  const storedToken = await redis.get(`csrf:${token}`)
  return storedToken !== null
}

export async function storeCSRFToken(token: string): Promise<void> {
  if (!redis) {
    // If Redis is not available, log warning but don't throw error
    console.warn('Redis not available, cannot store CSRF token')
    return
  }
  
  await redis.setex(`csrf:${token}`, 3600, 'valid') // 1 hour expiry
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' http://localhost:* https://api.supabase.co https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  return response
}

// CORS configuration
export function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'https://*.netlify.app',
  ].filter(Boolean)

  if (origin && allowedOrigins.some((allowed: string | undefined) => allowed && (origin === allowed || allowed.includes('*')))) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one uppercase letter')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one lowercase letter')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one number')
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one special character (@$!%*?&)')
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
  ]

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
  if (hasCommonPattern) {
    score -= 1
    feedback.push('Avoid common password patterns')
  }

  return {
    isStrong: score >= 4,
    score: Math.max(0, Math.min(5, score)),
    feedback
  }
}

// Secure session management
export interface SessionData {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  loginTime: number;
  lastActivity: number;
  csrfToken: string;
}

export async function createSession(sessionData: Omit<SessionData, 'loginTime' | 'lastActivity'>): Promise<string> {
  if (!redis) {
    // If Redis is not available, generate a mock session ID
    console.warn('Redis not available, creating mock session')
    return crypto.randomUUID()
  }

  const sessionId = crypto.randomUUID()
  const fullSessionData: SessionData = {
    ...sessionData,
    loginTime: Date.now(),
    lastActivity: Date.now(),
  }

  await redis.setex(`session:${sessionId}`, 24 * 60 * 60, JSON.stringify(fullSessionData))
  return sessionId
}

export async function validateSession(sessionId: string): Promise<SessionData | null> {
  if (!redis) {
    // If Redis is not available, return null
    console.warn('Redis not available, cannot validate session')
    return null
  }

  try {
    const sessionData = await redis.get(`session:${sessionId}`)
    if (!sessionData) return null

    const session: SessionData = JSON.parse(sessionData as string)
    
    // Update last activity
    session.lastActivity = Date.now()
    await redis.setex(`session:${sessionId}`, 24 * 60 * 60, JSON.stringify(session))
    
    return session
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  if (!redis) {
    // If Redis is not available, log warning but don't throw error
    console.warn('Redis not available, cannot destroy session')
    return
  }
  
  await redis.del(`session:${sessionId}`)
}

// Audit logging
export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  userAgent: string
  timestamp: number
  success: boolean
  details?: Record<string, any>
}

export async function logAuditEvent(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  if (!redis) {
    // If Redis is not available, log warning but don't throw error
    console.warn('Redis not available, cannot log audit event:', log.action)
    return
  }

  const auditLog: AuditLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }

  // Store in Redis with 30-day retention
  await redis.setex(
    `audit:${auditLog.id}`,
    30 * 24 * 60 * 60,
    JSON.stringify(auditLog)
  )

  // Also add to a daily log for easier querying
  const dailyKey = `audit_daily:${new Date().toISOString().split('T')[0]}`
  await redis.lpush(dailyKey, JSON.stringify(auditLog))
  await redis.expire(dailyKey, 30 * 24 * 60 * 60)
}

// IP-based security
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = request.ip

  return forwarded?.split(',')[0] || realIP || ip || 'unknown'
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  if (!redis) {
    // If Redis is not available, don't block any IPs
    return false
  }
  
  const blocked = await redis.get(`blocked_ip:${ip}`)
  return blocked !== null
}

export async function blockIP(ip: string, duration: number = 24 * 60 * 60): Promise<void> {
  if (!redis) {
    // If Redis is not available, log warning but don't throw error
    console.warn('Redis not available, cannot block IP:', ip)
    return
  }
  
  await redis.setex(`blocked_ip:${ip}`, duration, 'blocked')
}

// Bot detection
export function detectBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /node/i,
  ]

  return botPatterns.some(pattern => pattern.test(userAgent))
}

// Cloudflare Turnstile integration
export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET || '',
        response: token,
        remoteip: ip,
      }),
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

// Request validation middleware
export async function validateRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requireCSRF?: boolean
    rateLimitType?: keyof typeof RATE_LIMITS
    sanitizeInput?: boolean
    validateSchema?: z.ZodSchema<any>
  } = {}
): Promise<{
  success: boolean
  error?: string
  data?: any
  session?: SessionData
}> {
  const {
    requireAuth = false,
    requireCSRF = false,
    rateLimitType = 'api',
    sanitizeInput: shouldSanitize = false,
    validateSchema,
  } = options

  try {
    // Check if IP is blocked
    const ip = getClientIP(request)
    if (await isIPBlocked(ip)) {
      return { success: false, error: 'Access denied' }
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(ip, rateLimitType)
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded' }
    }

    // Bot detection for sensitive endpoints
    const userAgent = request.headers.get('user-agent') || ''
    if (detectBot(userAgent) && (requireAuth || rateLimitType === 'auth')) {
      return { success: false, error: 'Bot access denied' }
    }

    // Session validation
    let session: SessionData | null = null
    if (requireAuth) {
      const sessionId = request.cookies.get('session')?.value
      if (!sessionId) {
        return { success: false, error: 'Authentication required' }
      }

      session = await validateSession(sessionId)
      if (!session) {
        return { success: false, error: 'Invalid session' }
      }
    }

    // CSRF protection
    if (requireCSRF) {
      const csrfToken = request.headers.get('x-csrf-token')
      if (!csrfToken || !(await validateCSRFToken(csrfToken))) {
        return { success: false, error: 'Invalid CSRF token' }
      }
    }

    // Schema validation
    let data: any = null
    if (validateSchema) {
      const body = await request.json()
      const validation = validateInput(validateSchema, body)
      if (!validation.success) {
        return { 
          success: false, 
          error: 'Validation failed', 
          data: validation.errors 
        }
      }
      data = validation.data
    }

    // Input sanitization
    if (shouldSanitize && data) {
      data = sanitizeObject(data)
    }

    return { 
      success: true, 
      data,
      session: session || undefined 
    }
  } catch (error) {
    console.error('Request validation error:', error)
    return { success: false, error: 'Validation failed' }
  }
}

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}
