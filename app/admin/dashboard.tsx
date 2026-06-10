"use client"

import { useState } from "react"
import { AdPlatformSelector } from "@/components/ad-platform-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Shield, Bot, Plus, Trash2, Edit, Copy, Activity, Users, TrendingUp, Code } from "lucide-react"

// Expanded country options (50+ countries)
const COUNTRY_OPTIONS = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
]

// Expanded ad platforms (100+ platforms)
const AD_PLATFORMS = [
  // Search Engine Bots
  { id: "googlebot", name: "Googlebot", category: "Search Engines", risk: "low" },
  { id: "bingbot", name: "Bingbot", category: "Search Engines", risk: "low" },
  { id: "slurp", name: "Yahoo Slurp", category: "Search Engines", risk: "low" },
  { id: "duckduckbot", name: "DuckDuckBot", category: "Search Engines", risk: "low" },
  { id: "baiduspider", name: "Baidu Spider", category: "Search Engines", risk: "low" },
  { id: "yandexbot", name: "YandexBot", category: "Search Engines", risk: "low" },

  // Social Media Crawlers
  { id: "facebookexternalhit", name: "Facebook External Hit", category: "Social Media", risk: "medium" },
  { id: "twitterbot", name: "Twitterbot", category: "Social Media", risk: "medium" },
  { id: "linkedinbot", name: "LinkedInBot", category: "Social Media", risk: "medium" },
  { id: "pinterestbot", name: "Pinterest Bot", category: "Social Media", risk: "medium" },
  { id: "instagrambot", name: "Instagram Bot", category: "Social Media", risk: "medium" },
  { id: "whatsappbot", name: "WhatsApp Bot", category: "Social Media", risk: "medium" },
  { id: "telegrambot", name: "Telegram Bot", category: "Social Media", risk: "medium" },
  { id: "snapchatbot", name: "Snapchat Bot", category: "Social Media", risk: "medium" },
  { id: "tiktokbot", name: "TikTok Bot", category: "Social Media", risk: "medium" },
  { id: "redditbot", name: "Reddit Bot", category: "Social Media", risk: "medium" },

  // Ad Verification (HIGH RISK)
  { id: "integral_ad_science", name: "Integral Ad Science", category: "Ad Verification", risk: "critical" },
  { id: "doubleverify", name: "DoubleVerify", category: "Ad Verification", risk: "critical" },
  { id: "moat", name: "Moat (Oracle)", category: "Ad Verification", risk: "critical" },
  { id: "grapeshot", name: "Grapeshot (Oracle)", category: "Ad Verification", risk: "critical" },
  { id: "adsystem", name: "Ad System Verification", category: "Ad Verification", risk: "critical" },
  { id: "adnxs", name: "AppNexus Verification", category: "Ad Verification", risk: "critical" },
  { id: "adsbot", name: "Generic Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "adbeat", name: "AdBeat", category: "Ad Verification", risk: "critical" },
  { id: "adform", name: "Adform Verification", category: "Ad Verification", risk: "critical" },
  { id: "adsense", name: "Google AdSense Bot", category: "Ad Verification", risk: "critical" },
  { id: "adwords", name: "Google Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "facebook_ads", name: "Facebook Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "microsoft_ads", name: "Microsoft Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "amazon_ads", name: "Amazon Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "twitter_ads", name: "Twitter Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "linkedin_ads", name: "LinkedIn Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "pinterest_ads", name: "Pinterest Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "snapchat_ads", name: "Snapchat Ads Bot", category: "Ad Verification", risk: "critical" },
  { id: "tiktok_ads", name: "TikTok Ads Bot", category: "Ad Verification", risk: "critical" },

  // Content Discovery & Native Ads
  { id: "taboola", name: "Taboola", category: "Content Discovery", risk: "high" },
  { id: "outbrain", name: "Outbrain", category: "Content Discovery", risk: "high" },
  { id: "revcontent", name: "RevContent", category: "Content Discovery", risk: "high" },
  { id: "mgid", name: "MGID", category: "Content Discovery", risk: "high" },
  { id: "zemanta", name: "Zemanta", category: "Content Discovery", risk: "high" },
  { id: "content_ad", name: "Content.ad", category: "Content Discovery", risk: "high" },
  { id: "yahoo_gemini", name: "Yahoo Gemini", category: "Content Discovery", risk: "high" },
  { id: "plista", name: "Plista", category: "Content Discovery", risk: "high" },
  { id: "ligatus", name: "Ligatus", category: "Content Discovery", risk: "high" },
  { id: "adblade", name: "AdBlade", category: "Content Discovery", risk: "high" },
  { id: "contentad", name: "ContentAd", category: "Content Discovery", risk: "high" },
  { id: "nativo", name: "Nativo", category: "Content Discovery", risk: "high" },
  { id: "sharethrough", name: "Sharethrough", category: "Content Discovery", risk: "high" },
  { id: "triplelift", name: "TripleLift", category: "Content Discovery", risk: "high" },

  // Programmatic & DSPs
  { id: "google_dbm", name: "Google Display & Video 360", category: "Programmatic", risk: "high" },
  { id: "amazon_dsp", name: "Amazon DSP", category: "Programmatic", risk: "high" },
  { id: "trade_desk", name: "The Trade Desk", category: "Programmatic", risk: "high" },
  { id: "adobe_advertising", name: "Adobe Advertising Cloud", category: "Programmatic", risk: "high" },
  { id: "mediamath", name: "MediaMath", category: "Programmatic", risk: "high" },
  { id: "dataxu", name: "DataXu", category: "Programmatic", risk: "high" },
  { id: "turn", name: "Turn (Amobee)", category: "Programmatic", risk: "high" },
  { id: "rocket_fuel", name: "Rocket Fuel", category: "Programmatic", risk: "high" },
  { id: "criteo", name: "Criteo", category: "Programmatic", risk: "high" },
  { id: "rubicon", name: "Rubicon Project", category: "Programmatic", risk: "high" },
  { id: "pubmatic", name: "PubMatic", category: "Programmatic", risk: "high" },
  { id: "openx", name: "OpenX", category: "Programmatic", risk: "high" },
  { id: "appnexus", name: "AppNexus (Xandr)", category: "Programmatic", risk: "high" },
  { id: "index_exchange", name: "Index Exchange", category: "Programmatic", risk: "high" },
  { id: "sovrn", name: "Sovrn", category: "Programmatic", risk: "high" },

  // Mobile Ad Networks
  { id: "admob", name: "Google AdMob", category: "Mobile Ads", risk: "high" },
  { id: "facebook_audience", name: "Facebook Audience Network", category: "Mobile Ads", risk: "high" },
  { id: "unity_ads", name: "Unity Ads", category: "Mobile Ads", risk: "high" },
  { id: "vungle", name: "Vungle", category: "Mobile Ads", risk: "high" },
  { id: "chartboost", name: "Chartboost", category: "Mobile Ads", risk: "high" },
  { id: "applovin", name: "AppLovin", category: "Mobile Ads", risk: "high" },
  { id: "ironsource", name: "ironSource", category: "Mobile Ads", risk: "high" },
  { id: "tapjoy", name: "Tapjoy", category: "Mobile Ads", risk: "high" },
  { id: "adcolony", name: "AdColony", category: "Mobile Ads", risk: "high" },
  { id: "mopub", name: "MoPub (Twitter)", category: "Mobile Ads", risk: "high" },
  { id: "inmobi", name: "InMobi", category: "Mobile Ads", risk: "high" },
  { id: "millennial_media", name: "Millennial Media", category: "Mobile Ads", risk: "high" },

  // Video Ad Platforms
  { id: "youtube_ads", name: "YouTube Ads", category: "Video Ads", risk: "high" },
  { id: "brightroll", name: "BrightRoll (Yahoo)", category: "Video Ads", risk: "high" },
  { id: "tremor_video", name: "Tremor Video", category: "Video Ads", risk: "high" },
  { id: "spotx", name: "SpotX", category: "Video Ads", risk: "high" },
  { id: "undertone", name: "Undertone", category: "Video Ads", risk: "high" },
  { id: "innovid", name: "Innovid", category: "Video Ads", risk: "high" },
  { id: "teads", name: "Teads", category: "Video Ads", risk: "high" },
  { id: "jwplayer", name: "JW Player", category: "Video Ads", risk: "medium" },

  // Affiliate Networks
  { id: "commission_junction", name: "Commission Junction", category: "Affiliate", risk: "medium" },
  { id: "shareasale", name: "ShareASale", category: "Affiliate", risk: "medium" },
  { id: "clickbank", name: "ClickBank", category: "Affiliate", risk: "medium" },
  { id: "rakuten_advertising", name: "Rakuten Advertising", category: "Affiliate", risk: "medium" },
  { id: "impact_radius", name: "Impact Radius", category: "Affiliate", risk: "medium" },
  { id: "partnerize", name: "Partnerize", category: "Affiliate", risk: "medium" },
  { id: "awin", name: "Awin", category: "Affiliate", risk: "medium" },
  { id: "tradedoubler", name: "TradeDoubler", category: "Affiliate", risk: "medium" },

  // Generic Bot Patterns
  { id: "generic_bot", name: "Generic Bot Pattern", category: "Generic Bots", risk: "medium" },
  { id: "crawler", name: "Web Crawler", category: "Generic Bots", risk: "medium" },
  { id: "spider", name: "Web Spider", category: "Generic Bots", risk: "medium" },
  { id: "scraper", name: "Web Scraper", category: "Generic Bots", risk: "high" },
  { id: "headless", name: "Headless Browser", category: "Automation", risk: "high" },
  { id: "phantom", name: "PhantomJS", category: "Automation", risk: "high" },
  { id: "selenium", name: "Selenium", category: "Automation", risk: "high" },
  { id: "webdriver", name: "WebDriver", category: "Automation", risk: "high" },
  { id: "puppeteer", name: "Puppeteer", category: "Automation", risk: "high" },
  { id: "playwright", name: "Playwright", category: "Automation", risk: "high" },
]

const FREQUENCY_OPTIONS = [
  { value: "once", label: "Once per visitor" },
  { value: "daily", label: "Once per day" },
  { value: "weekly", label: "Once per week" },
  { value: "monthly", label: "Once per month" },
  { value: "always", label: "Every visit" },
]

interface Website {
  id: string
  name: string
  domain: string
  landingPageUrl: string
  safePageUrl: string
  allowedCountries: string[]
  blockedAdPlatforms: string[]
  maxVisitLimit: number
  visitLimitTimeHours: number
  frequency: string
  isActive: boolean
  createdAt: string
  stats: {
    totalVisits: number
    humanVisits: number
    botVisits: number
    blockedVisits: number
    conversionRate: number
  }
}

export default function AdminDashboard() {
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: "1",
      name: "Main Campaign",
      domain: "example.com",
      landingPageUrl: "/pricing",
      safePageUrl: "/safe",
      allowedCountries: ["US", "CA", "GB", "AU"],
      blockedAdPlatforms: ["integral_ad_science", "doubleverify", "moat"],
      maxVisitLimit: 10,
      visitLimitTimeHours: 24,
      frequency: "daily",
      isActive: true,
      createdAt: "2024-01-15",
      stats: {
        totalVisits: 15420,
        humanVisits: 12336,
        botVisits: 3084,
        blockedVisits: 892,
        conversionRate: 3.2,
      },
    },
  ])

  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    landingPageUrl: "",
    safePageUrl: "",
    allowedCountries: [] as string[],
    blockedAdPlatforms: [] as string[],
    maxVisitLimit: 10,
    visitLimitTimeHours: 24,
    frequency: "daily",
    isActive: true,
  })

  const handleAddWebsite = () => {
    const newWebsite: Website = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      stats: {
        totalVisits: 0,
        humanVisits: 0,
        botVisits: 0,
        blockedVisits: 0,
        conversionRate: 0,
      },
    }
    setWebsites([...websites, newWebsite])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditWebsite = () => {
    if (selectedWebsite) {
      setWebsites(websites.map((w) => (w.id === selectedWebsite.id ? { ...selectedWebsite, ...formData } : w)))
      setIsEditDialogOpen(false)
      setSelectedWebsite(null)
      resetForm()
    }
  }

  const handleDeleteWebsite = (id: string) => {
    setWebsites(websites.filter((w) => w.id !== id))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      domain: "",
      landingPageUrl: "",
      safePageUrl: "",
      allowedCountries: [],
      blockedAdPlatforms: [],
      maxVisitLimit: 10,
      visitLimitTimeHours: 24,
      frequency: "daily",
      isActive: true,
    })
  }

  const openEditDialog = (website: Website) => {
    setSelectedWebsite(website)
    setFormData({
      name: website.name,
      domain: website.domain,
      landingPageUrl: website.landingPageUrl,
      safePageUrl: website.safePageUrl,
      allowedCountries: website.allowedCountries,
      blockedAdPlatforms: website.blockedAdPlatforms,
      maxVisitLimit: website.maxVisitLimit,
      visitLimitTimeHours: website.visitLimitTimeHours,
      frequency: website.frequency,
      isActive: website.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const generateCloakingCode = (website: Website) => {
    return ` Traffic Filter Pro - Cloaking Code 
<script>
(function() {
  // Configuration
  const config = {
    websiteId: '${website.id}',
    domain: '${website.domain}',
    landingPageUrl: '${website.landingPageUrl}',
    safePageUrl: '${website.safePageUrl}',
    allowedCountries: ${JSON.stringify(website.allowedCountries)},
    blockedAdPlatforms: ${JSON.stringify(website.blockedAdPlatforms)},
    maxVisitLimit: ${website.maxVisitLimit},
    visitLimitTimeHours: ${website.visitLimitTimeHours},
    frequency: '${website.frequency}',
    isActive: ${website.isActive}
  };

  // Bot detection patterns
  const botPatterns = [
    ${website.blockedAdPlatforms
      .map((platform) => {
        const platformData = AD_PLATFORMS.find((p) => p.id === platform)
        return platformData ? `/${platformData.name.toLowerCase().replace(/\s+/g, ".*")}/i` : ""
      })
      .filter(Boolean)
      .join(",\n    ")}
  ];

  // Advanced bot detection
  function detectBot() {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check against blocked platforms
    for (let pattern of botPatterns) {
      if (pattern.test(ua)) {
        return { isBot: true, type: 'blocked_platform' };
      }
    }

    // Additional bot checks
    if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
      return { isBot: true, type: 'generic_bot' };
    }

    // Headless browser detection
    if (ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium')) {
      return { isBot: true, type: 'automation' };
    }

    return { isBot: false, type: 'human' };
  }

  // Country detection (requires server-side implementation)
  function getCountry() {
    // This would typically be done server-side
    return 'US'; // Fallback
  }

  // Main filtering logic
  function applyFilter() {
    if (!config.isActive) {
      // Campaign is off - show landing page
      if (window.location.pathname !== config.landingPageUrl) {
        window.location.href = config.landingPageUrl;
      }
      return;
    }

    const botDetection = detectBot();
    const country = getCountry();

    if (botDetection.isBot) {
      // Bot detected - redirect to landing page
      if (window.location.pathname !== config.landingPageUrl) {
        window.location.href = config.landingPageUrl;
      }
    } else if (config.allowedCountries.length > 0 && !config.allowedCountries.includes(country)) {
      // Country not allowed - redirect to landing page
      if (window.location.pathname !== config.landingPageUrl) {
        window.location.href = config.landingPageUrl;
      }
    } else {
      // Human from allowed country - show safe page
      if (window.location.pathname !== config.safePageUrl) {
        window.location.href = config.safePageUrl;
      }
    }

    // Log the visit
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: config.websiteId,
        userAgent: navigator.userAgent,
        isBot: botDetection.isBot,
        botType: botDetection.type,
        country: country,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }

  // Apply filter when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFilter);
  } else {
    applyFilter();
  }
})();
</script>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Traffic Filter Pro
              </h1>
              <p className="text-gray-600 mt-1">Advanced traffic filtering and bot protection</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Website
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Website</DialogTitle>
                  <DialogDescription>Configure traffic filtering for a new website</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Website Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="My Campaign"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="landingPageUrl">Landing Page URL (Decoy)</Label>
                      <Input
                        id="landingPageUrl"
                        value={formData.landingPageUrl}
                        onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                        placeholder="/pricing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="safePageUrl">Safe Page URL (Real Content)</Label>
                      <Input
                        id="safePageUrl"
                        value={formData.safePageUrl}
                        onChange={(e) => setFormData({ ...formData, safePageUrl: e.target.value })}
                        placeholder="/safe"
                      />
                    </div>
                  </div>

                  {/* Country Selection */}
                  <div>
                    <Label>Allowed Countries</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {COUNTRY_OPTIONS.map((country) => (
                          <label key={country.code} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.allowedCountries.includes(country.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    allowedCountries: [...formData.allowedCountries, country.code],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    allowedCountries: formData.allowedCountries.filter((c) => c !== country.code),
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">
                              {country.flag} {country.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ad Platform Blocking */}
                  <div>
                    <Label className="text-base font-semibold">🚫 Block Ad Platform Traffic</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select platforms you run ads on. Their reviewer bots and datacenter IPs will be blocked automatically.
                    </p>
                    <AdPlatformSelector
                      selected={formData.blockedAdPlatforms}
                      onChange={(val) => setFormData({ ...formData, blockedAdPlatforms: val })}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxVisitLimit">Max Visits per IP</Label>
                      <Input
                        id="maxVisitLimit"
                        type="number"
                        value={formData.maxVisitLimit}
                        onChange={(e) => setFormData({ ...formData, maxVisitLimit: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="visitLimitTimeHours">Time Window (Hours)</Label>
                      <Input
                        id="visitLimitTimeHours"
                        type="number"
                        value={formData.visitLimitTimeHours}
                        onChange={(e) =>
                          setFormData({ ...formData, visitLimitTimeHours: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddWebsite}>Add Website</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {websites.reduce((sum, w) => sum + w.stats.totalVisits, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Human Traffic</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {websites.reduce((sum, w) => sum + w.stats.humanVisits, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(
                      (websites.reduce((sum, w) => sum + w.stats.humanVisits, 0) /
                        websites.reduce((sum, w) => sum + w.stats.totalVisits, 0)) *
                        100,
                    )}
                    % of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blocked Bots</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {websites.reduce((sum, w) => sum + w.stats.botVisits, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(
                      (websites.reduce((sum, w) => sum + w.stats.botVisits, 0) /
                        websites.reduce((sum, w) => sum + w.stats.totalVisits, 0)) *
                        100,
                    )}
                    % filtered out
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(websites.reduce((sum, w) => sum + w.stats.conversionRate, 0) / websites.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">+0.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest traffic filtering events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "2 minutes ago",
                      event: "Bot blocked",
                      details: "Integral Ad Science bot detected",
                      type: "blocked",
                    },
                    {
                      time: "5 minutes ago",
                      event: "Human visitor",
                      details: "US visitor allowed to safe page",
                      type: "allowed",
                    },
                    {
                      time: "8 minutes ago",
                      event: "Country blocked",
                      details: "Visitor from CN redirected",
                      type: "blocked",
                    },
                    {
                      time: "12 minutes ago",
                      event: "Bot blocked",
                      details: "DoubleVerify crawler detected",
                      type: "blocked",
                    },
                    {
                      time: "15 minutes ago",
                      event: "Human visitor",
                      details: "CA visitor allowed to safe page",
                      type: "allowed",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div
                        className={`w-2 h-2 rounded-full ${activity.type === "blocked" ? "bg-red-500" : "bg-green-500"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.event}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            <div className="grid gap-6">
              {websites.map((website) => (
                <Card key={website.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {website.name}
                          <Badge
                            className={`ml-2 ${website.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {website.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{website.domain}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWebsite(website)
                            setIsCodeDialogOpen(true)
                          }}
                        >
                          <Code className="h-4 w-4 mr-1" />
                          Code
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(website)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteWebsite(website.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {website.stats.totalVisits.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Visits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {website.stats.humanVisits.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Human Visits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {website.stats.botVisits.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Blocked Bots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{website.stats.conversionRate}%</div>
                        <div className="text-sm text-gray-500">Conversion Rate</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Landing Page:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{website.landingPageUrl}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Safe Page:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{website.safePageUrl}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Frequency:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {FREQUENCY_OPTIONS.find((f) => f.value === website.frequency)?.label || website.frequency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Allowed Countries:</span>
                        <div className="flex flex-wrap gap-1">
                          {website.allowedCountries.slice(0, 5).map((code) => {
                            const country = COUNTRY_OPTIONS.find((c) => c.code === code)
                            return (
                              <Badge key={code} variant="outline" className="text-xs">
                                {country?.flag} {code}
                              </Badge>
                            )
                          })}
                          {website.allowedCountries.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{website.allowedCountries.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Blocked Platforms:</span>
                        <div className="flex flex-wrap gap-1">
                          {website.blockedAdPlatforms.slice(0, 3).map((platformId) => {
                            const platform = AD_PLATFORMS.find((p) => p.id === platformId)
                            return (
                              <Badge key={platformId} variant="outline" className="text-xs">
                                {platform?.name || platformId}
                              </Badge>
                            )
                          })}
                          {website.blockedAdPlatforms.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{website.blockedAdPlatforms.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Distribution</CardTitle>
                  <CardDescription>Breakdown of visitor types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {websites.map((website) => (
                      <div key={website.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{website.name}</span>
                          <span>{website.stats.totalVisits.toLocaleString()} visits</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-16 text-xs text-gray-500">Human</div>
                            <Progress
                              value={(website.stats.humanVisits / website.stats.totalVisits) * 100}
                              className="flex-1 mx-2 h-2"
                            />
                            <div className="w-12 text-xs text-right">
                              {Math.round((website.stats.humanVisits / website.stats.totalVisits) * 100)}%
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-xs text-gray-500">Bots</div>
                            <Progress
                              value={(website.stats.botVisits / website.stats.totalVisits) * 100}
                              className="flex-1 mx-2 h-2"
                            />
                            <div className="w-12 text-xs text-right">
                              {Math.round((website.stats.botVisits / website.stats.totalVisits) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Blocked Platforms</CardTitle>
                  <CardDescription>Most frequently blocked ad platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Integral Ad Science", blocks: 1247, percentage: 35 },
                      { name: "DoubleVerify", blocks: 892, percentage: 25 },
                      { name: "Moat (Oracle)", blocks: 634, percentage: 18 },
                      { name: "Taboola", blocks: 445, percentage: 12 },
                      { name: "Outbrain", blocks: 356, percentage: 10 },
                    ].map((platform, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{platform.name}</div>
                          <div className="text-xs text-gray-500">{platform.blocks} blocks</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{platform.percentage}%</div>
                          <Progress value={platform.percentage} className="w-16 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Configure global filtering preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Global Protection</Label>
                    <p className="text-sm text-gray-500">Apply bot detection across all websites</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Aggressive Filtering</Label>
                    <p className="text-sm text-gray-500">Use stricter bot detection algorithms</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Real-time Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified of suspicious activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Default Landing Page</Label>
                  <Input placeholder="/pricing" />
                  <p className="text-sm text-gray-500">Default decoy page for new websites</p>
                </div>

                <div className="space-y-2">
                  <Label>Default Safe Page</Label>
                  <Input placeholder="/safe" />
                  <p className="text-sm text-gray-500">Default safe page for legitimate traffic</p>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Website Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Website</DialogTitle>
              <DialogDescription>Update traffic filtering configuration</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Same form content as Add Website */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Website Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-domain">Domain</Label>
                  <Input
                    id="edit-domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-landingPageUrl">Landing Page URL</Label>
                  <Input
                    id="edit-landingPageUrl"
                    value={formData.landingPageUrl}
                    onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-safePageUrl">Safe Page URL</Label>
                  <Input
                    id="edit-safePageUrl"
                    value={formData.safePageUrl}
                    onChange={(e) => setFormData({ ...formData, safePageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-maxVisitLimit">Max Visits per IP</Label>
                  <Input
                    id="edit-maxVisitLimit"
                    type="number"
                    value={formData.maxVisitLimit}
                    onChange={(e) => setFormData({ ...formData, maxVisitLimit: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visitLimitTimeHours">Time Window (Hours)</Label>
                  <Input
                    id="edit-visitLimitTimeHours"
                    type="number"
                    value={formData.visitLimitTimeHours}
                    onChange={(e) => setFormData({ ...formData, visitLimitTimeHours: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditWebsite}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Code Generation Dialog */}
        <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Cloaking Code</DialogTitle>
              <DialogDescription>Copy this code and paste it into your website's HTML</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">
                  <code>{selectedWebsite ? generateCloakingCode(selectedWebsite) : ""}</code>
                </pre>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">Place this code in the {"<head>"} section of your website</div>
                <Button
                  variant="outline"
                  onClick={() => selectedWebsite && copyToClipboard(generateCloakingCode(selectedWebsite))}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
