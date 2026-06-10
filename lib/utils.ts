import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return formatDate(date)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    CA: "🇨🇦",
    GB: "🇬🇧",
    DE: "🇩🇪",
    FR: "🇫🇷",
    IT: "🇮🇹",
    ES: "🇪🇸",
    NL: "🇳🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    CH: "🇨🇭",
    AT: "🇦🇹",
    BE: "🇧🇪",
    IE: "🇮🇪",
    PT: "🇵🇹",
    PL: "🇵🇱",
    CZ: "🇨🇿",
    HU: "🇭🇺",
    AU: "🇦🇺",
    NZ: "🇳🇿",
    JP: "🇯🇵",
    KR: "🇰🇷",
    CN: "🇨🇳",
    IN: "🇮🇳",
    SG: "🇸🇬",
    HK: "🇭🇰",
    BR: "🇧🇷",
    MX: "🇲🇽",
    AR: "🇦🇷",
    CL: "🇨🇱",
    CO: "🇨🇴",
    ZA: "🇿🇦",
    RU: "🇷🇺",
  }
  return flags[countryCode] || "🌍"
}

export function getBotTypeIcon(botType: string): string {
  const icons: Record<string, string> = {
    Googlebot: "🔍",
    Bingbot: "🔍",
    "Facebook Bot": "📘",
    "Twitter Bot": "🐦",
    "Integral Ad Science": "🛡️",
    DoubleVerify: "🛡️",
    Moat: "🛡️",
    Taboola: "📰",
    Outbrain: "📰",
    "Generic Bot": "🤖",
    "Headless Browser": "👻",
    Selenium: "⚙️",
    Puppeteer: "🎭",
  }
  return icons[botType] || "🤖"
}

export function calculateConversionRate(humans: number, total: number): number {
  if (total === 0) return 0
  return (humans / total) * 100
}

export function getTrafficQuality(conversionRate: number): {
  label: string
  color: string
  description: string
} {
  if (conversionRate >= 80) {
    return {
      label: "Excellent",
      color: "text-green-600",
      description: "Very high quality human traffic",
    }
  } else if (conversionRate >= 60) {
    return {
      label: "Good",
      color: "text-blue-600",
      description: "Good quality traffic with some bots",
    }
  } else if (conversionRate >= 40) {
    return {
      label: "Fair",
      color: "text-yellow-600",
      description: "Mixed traffic quality",
    }
  } else if (conversionRate >= 20) {
    return {
      label: "Poor",
      color: "text-orange-600",
      description: "High bot traffic detected",
    }
  } else {
    return {
      label: "Very Poor",
      color: "text-red-600",
      description: "Mostly automated traffic",
    }
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
