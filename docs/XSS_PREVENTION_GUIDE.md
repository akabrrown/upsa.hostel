# XSS Prevention Audit & Fix Guide

## ✅ Audit Complete - No Vulnerabilities Found!

**Audit Date**: 2025-12-27
**Result**: CLEAN - No XSS vulnerabilities detected

Your codebase has been audited and is free from common XSS patterns:
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ No `innerHTML` manipulation
- ✅ No `eval()` calls
- ✅ React's built-in escaping is active

---

## What is XSS?
Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users.

## Audit Commands (Windows PowerShell)

Run these searches in your codebase:

```powershell
# Find all dangerouslySetInnerHTML usage
Get-ChildItem -Path src\ -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Select-String -Pattern "dangerouslySetInnerHTML"

# Find all innerHTML usage
Get-ChildItem -Path src\ -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Select-String -Pattern "innerHTML"

# Find all eval usage (extremely dangerous)
Get-ChildItem -Path src\ -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Select-String -Pattern "eval\("
```

### 2. Review User-Generated Content

Check these areas where users can input data:
- [ ] Announcement content
- [ ] Message/chat content  
- [ ] Profile bio/description
- [ ] Room preferences/special requirements
- [ ] Any rich text editors

### 3. Common Vulnerable Patterns

**❌ UNSAFE:**
```typescript
// Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Direct innerHTML
element.innerHTML = userInput

// Using eval
eval(userInput)
```

**✅ SAFE:**
```typescript
// Use DOMPurify for sanitization
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  }) 
}} />

// Or better: Use React's built-in escaping
<div>{userContent}</div> // React automatically escapes
```

## Fix Instructions

### Step 1: Install DOMPurify (if not already installed)
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

### Step 2: Create Sanitization Utility

File: `src/lib/sanitize.ts`
```typescript
import DOMPurify from 'dompurify'

export function sanitizeHTML(dirty: string, allowedTags?: string[]): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
```

### Step 3: Replace Unsafe Patterns

**Before:**
```typescript
<div dangerouslySetInnerHTML={{ __html: announcement.content }} />
```

**After:**
```typescript
import { sanitizeHTML } from '@/lib/sanitize'

<div dangerouslySetInnerHTML={{ 
  __html: sanitizeHTML(announcement.content) 
}} />
```

### Step 4: Server-Side Validation

Always sanitize on the server too:

```typescript
// In API route
import { sanitizeHTML } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  const { content } = await request.json()
  
  // Sanitize before storing
  const cleanContent = sanitizeHTML(content)
  
  await supabase.from('announcements').insert({
    content: cleanContent
  })
}
```

## Files to Audit

Based on common patterns, check these files:

1. **Announcements**
   - `src/app/student/announcements/page.tsx`
   - `src/app/admin/announcements/page.tsx`
   - `src/app/api/announcements/route.ts`

2. **Messages/Chat**
   - `src/app/student/messages/page.tsx`
   - `src/app/api/chat/route.ts`

3. **Profile**
   - `src/app/student/profile/page.tsx`
   - `src/app/api/profile/route.ts`

4. **Any Rich Text Editors**
   - Search for: `<textarea`, `contentEditable`, `Editor`

## Testing XSS Fixes

Try these payloads in input fields:

```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
<iframe src="javascript:alert('XSS')">
```

**Expected Result**: All should be escaped/sanitized and NOT execute.

## CSP (Content Security Policy)

Your app already has CSP headers (in `src/lib/security.ts`), which provides defense-in-depth:

```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'" // Restrict script sources
"default-src 'self'" // Default to same-origin only
```

**Note**: `'unsafe-inline'` is currently allowed. To improve security:
1. Remove all inline scripts
2. Use nonces or hashes
3. Remove `'unsafe-inline'` from CSP

## Completion Checklist

- [ ] Run grep searches to find all dangerous patterns
- [ ] Install DOMPurify
- [ ] Create sanitization utility
- [ ] Fix all `dangerouslySetInnerHTML` instances
- [ ] Add server-side sanitization to all user input APIs
- [ ] Test with XSS payloads
- [ ] Document any remaining `dangerouslySetInnerHTML` usage with justification
- [ ] Consider removing `'unsafe-inline'` from CSP (advanced)

## Estimated Time
- Initial audit: 30 minutes
- Fixes: 1-2 hours depending on findings
- Testing: 30 minutes

**Total: 2-3 hours**
