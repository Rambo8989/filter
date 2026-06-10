// ============================================================
// COMPLETE AD PLATFORM DETECTION — 60+ Networks
// Detection: IP CIDR + ASN keywords + UA patterns + Referrer
// ============================================================

export interface AdPlatformInfo {
  id: string
  name: string
  category: "search" | "social" | "display" | "programmatic" | "native" | "mobile" | "pop_push" | "affiliate" | "video" | "ad_verification"
  icon: string
  description: string
  website: string
  asnKeywords: string[]   // ISP/Org/ASN name keywords from ip-api
  cidrs: string[]         // Known IP ranges
  uaPatterns: RegExp[]    // User-Agent regex
  referrerPatterns: RegExp[]
}

export const AD_PLATFORMS: Record<string, AdPlatformInfo> = {

  // ── SEARCH ENGINES ──────────────────────────────────────
  google: {
    id: "google", name: "Google Ads", category: "search", icon: "🔍",
    website: "ads.google.com",
    description: "Search, Display, YouTube, Shopping, Performance Max",
    cidrs: [
      "66.249.64.0/19","66.249.80.0/20","66.249.96.0/19",
      "209.85.128.0/17","216.239.32.0/19","172.217.0.0/16",
      "173.194.0.0/16","74.125.0.0/16","64.233.160.0/19",
      "72.14.192.0/18","203.208.32.0/19","108.177.8.0/21",
      "142.250.0.0/15","172.253.0.0/16","216.58.192.0/19",
    ],
    asnKeywords: ["google llc","google cloud","google fiber","google inc"],
    uaPatterns: [/googlebot/i,/adsbot-google/i,/mediapartners-google/i,/google-inspectiontool/i,/google-adwords/i],
    referrerPatterns: [/google\.com\/aclk/i,/googleadservices\.com/i,/googlesyndication\.com/i,/doubleclick\.net/i],
  },

  microsoft: {
    id: "microsoft", name: "Microsoft / Bing Ads", category: "search", icon: "🪟",
    website: "ads.microsoft.com",
    description: "Bing Search, Microsoft Audience Network, LinkedIn Ads",
    cidrs: [
      "40.77.167.0/24","157.55.39.0/24","207.46.13.0/24","207.46.199.0/24",
      "65.52.104.0/24","131.253.26.0/24","20.36.0.0/14","20.40.0.0/13",
      "20.48.0.0/12","20.64.0.0/10","40.64.0.0/10","52.96.0.0/11",
    ],
    asnKeywords: ["microsoft corporation","microsoft limited","msn","microsoft azure"],
    uaPatterns: [/bingbot/i,/bingpreview/i,/msnbot/i,/adidxbot/i],
    referrerPatterns: [/bing\.com/i,/microsoft\.com\/ads/i,/ads\.microsoft\.com/i],
  },

  yahoo: {
    id: "yahoo", name: "Yahoo Gemini / DSP", category: "search", icon: "🟣",
    website: "advertising.yahoo.com",
    description: "Yahoo Search, Gemini Native, Verizon Media",
    cidrs: ["98.136.0.0/16","69.147.64.0/18","74.6.0.0/16","66.196.64.0/18"],
    asnKeywords: ["yahoo","oath inc","verizon media","yahoo inc"],
    uaPatterns: [/slurp/i,/yahooseeker/i,/yahoo/i],
    referrerPatterns: [/yahoo\.com/i,/gemini\.yahoo\.com/i,/advertising\.yahoo\.com/i],
  },

  yandex: {
    id: "yandex", name: "Yandex Direct", category: "search", icon: "🔶",
    website: "direct.yandex.com",
    description: "Yandex search and display advertising",
    cidrs: ["5.45.192.0/18","37.9.64.0/18","77.88.0.0/16","87.250.224.0/19","93.158.128.0/18","178.154.128.0/17"],
    asnKeywords: ["yandex","yandex llc","yandex enterprise"],
    uaPatterns: [/yandexbot/i,/yandex\//i],
    referrerPatterns: [/yandex\.ru/i,/yandex\.com/i,/direct\.yandex/i],
  },

  baidu: {
    id: "baidu", name: "Baidu Ads", category: "search", icon: "🐼",
    website: "e.baidu.com",
    description: "Baidu search advertising — major China platform",
    cidrs: ["111.192.0.0/12","180.76.0.0/16","119.63.192.0/21"],
    asnKeywords: ["baidu","baidu inc"],
    uaPatterns: [/baiduspider/i,/baidu/i],
    referrerPatterns: [/baidu\.com/i,/e\.baidu\.com/i],
  },

  // ── SOCIAL MEDIA ────────────────────────────────────────
  facebook: {
    id: "facebook", name: "Meta (Facebook + Instagram)", category: "social", icon: "📘",
    website: "business.facebook.com",
    description: "Facebook, Instagram, Messenger, Audience Network",
    cidrs: [
      "31.13.24.0/21","31.13.64.0/18","31.13.96.0/19",
      "66.220.144.0/20","66.220.160.0/19","69.63.176.0/20",
      "69.171.224.0/19","74.119.76.0/22","103.4.96.0/22",
      "129.134.0.0/17","157.240.0.0/17","173.252.64.0/18",
      "179.60.192.0/22","185.60.216.0/22","204.15.20.0/22",
      "163.70.128.0/17","163.71.128.0/17","163.77.128.0/17",
    ],
    asnKeywords: ["facebook","meta platforms","instagram","meta inc"],
    uaPatterns: [/facebookexternalhit/i,/facebookcatalog/i,/facebookbot/i,/instagram/i],
    referrerPatterns: [/facebook\.com/i,/fbcdn\.net/i,/instagram\.com/i,/l\.facebook\.com/i],
  },

  tiktok: {
    id: "tiktok", name: "TikTok Ads", category: "social", icon: "🎵",
    website: "ads.tiktok.com",
    description: "TikTok in-feed, TopView, Branded content",
    cidrs: ["103.18.16.0/22","162.159.192.0/24","13.224.0.0/14","205.251.192.0/19"],
    asnKeywords: ["bytedance","tiktok","tiktok pte","beijing bytedance"],
    uaPatterns: [/bytespider/i,/tiktok/i,/bytedance/i],
    referrerPatterns: [/tiktok\.com/i,/ads\.tiktok\.com/i],
  },

  twitter: {
    id: "twitter", name: "Twitter / X Ads", category: "social", icon: "🐦",
    website: "ads.twitter.com",
    description: "Promoted Tweets, X ad campaigns",
    cidrs: ["199.16.156.0/22","199.59.148.0/22","192.133.76.0/22","69.195.160.0/19","104.244.40.0/21"],
    asnKeywords: ["twitter","x corp","twitter inc"],
    uaPatterns: [/twitterbot/i],
    referrerPatterns: [/twitter\.com/i,/t\.co/i,/ads-twitter\.com/i],
  },

  linkedin: {
    id: "linkedin", name: "LinkedIn Ads", category: "social", icon: "💼",
    website: "business.linkedin.com",
    description: "Sponsored Content, InMail, Lead Gen Forms",
    cidrs: ["108.174.0.0/16","144.2.0.0/16","216.52.16.0/20","216.52.32.0/20"],
    asnKeywords: ["linkedin","linkedin corporation"],
    uaPatterns: [/linkedinbot/i],
    referrerPatterns: [/linkedin\.com/i,/ads\.linkedin\.com/i],
  },

  snapchat: {
    id: "snapchat", name: "Snapchat Ads", category: "social", icon: "👻",
    website: "forbusiness.snapchat.com",
    description: "Story Ads, Collection Ads, AR Lenses",
    cidrs: ["35.190.0.0/17","34.100.0.0/16"],
    asnKeywords: ["snap inc","snapchat"],
    uaPatterns: [/snapchat/i],
    referrerPatterns: [/snapchat\.com/i,/ads\.snapchat\.com/i],
  },

  pinterest: {
    id: "pinterest", name: "Pinterest Ads", category: "social", icon: "📌",
    website: "ads.pinterest.com",
    description: "Promoted Pins, Shopping Ads, Video Pins",
    cidrs: ["54.236.0.0/16","54.208.0.0/14"],
    asnKeywords: ["pinterest"],
    uaPatterns: [/pinterestbot/i],
    referrerPatterns: [/pinterest\.com/i,/ads\.pinterest\.com/i],
  },

  reddit: {
    id: "reddit", name: "Reddit Ads", category: "social", icon: "🤖",
    website: "ads.reddit.com",
    description: "Promoted Posts, Video Ads, Takeovers",
    cidrs: ["151.101.0.0/16","198.41.128.0/17"],
    asnKeywords: ["reddit inc","reddit"],
    uaPatterns: [/redditbot/i],
    referrerPatterns: [/reddit\.com/i,/ads\.reddit\.com/i],
  },

  // ── DISPLAY / PROGRAMMATIC ───────────────────────────────
  amazon: {
    id: "amazon", name: "Amazon DSP / Sponsored", category: "display", icon: "📦",
    website: "advertising.amazon.com",
    description: "Amazon Display, Sponsored Products, DSP, OTT",
    cidrs: [
      "54.239.0.0/16","54.240.0.0/12","52.46.0.0/17",
      "54.182.0.0/16","52.84.0.0/14","13.249.0.0/16","176.32.96.0/21",
    ],
    asnKeywords: ["amazon.com","amazon technologies","aws","amazon"],
    uaPatterns: [/amazonbot/i],
    referrerPatterns: [/advertising\.amazon\.com/i,/amazon\.com/i],
  },

  thetradedesk: {
    id: "thetradedesk", name: "The Trade Desk (TTD)", category: "programmatic", icon: "📊",
    website: "thetradedesk.com",
    description: "Programmatic DSP — display, video, audio, CTV",
    cidrs: ["209.234.168.0/21","144.202.0.0/16","45.63.0.0/16"],
    asnKeywords: ["the trade desk","tradedesk"],
    uaPatterns: [/thetradedesk/i,/\bttd\b/i],
    referrerPatterns: [/thetradedesk\.com/i,/adsrvr\.org/i],
  },

  criteo: {
    id: "criteo", name: "Criteo", category: "display", icon: "🎯",
    website: "criteo.com",
    description: "Retargeting display and commerce ads",
    cidrs: ["88.221.0.0/16","185.34.216.0/22","185.43.8.0/22","62.75.0.0/16"],
    asnKeywords: ["criteo"],
    uaPatterns: [/criteo/i],
    referrerPatterns: [/criteo\.com/i,/rtax\.criteo\.com/i],
  },

  mediamind: {
    id: "mediamind", name: "Sizmek / Amazon DSP", category: "programmatic", icon: "🧠",
    website: "sizmek.com",
    description: "Ad serving and programmatic buying platform",
    cidrs: ["23.23.0.0/16","54.204.0.0/14"],
    asnKeywords: ["sizmek","mediamind","amazon advertising"],
    uaPatterns: [/sizmek/i,/mediamind/i],
    referrerPatterns: [/sizmek\.com/i],
  },

  // ── NATIVE ADVERTISING ────────────────────────────────────
  taboola: {
    id: "taboola", name: "Taboola", category: "native", icon: "📰",
    website: "taboola.com",
    description: "Native content recommendation ads",
    cidrs: ["184.26.0.0/16","23.67.0.0/16","23.215.0.0/16","184.28.0.0/14"],
    asnKeywords: ["taboola"],
    uaPatterns: [/taboola/i],
    referrerPatterns: [/taboola\.com/i,/trc\.taboola\.com/i],
  },

  outbrain: {
    id: "outbrain", name: "Outbrain", category: "native", icon: "📖",
    website: "outbrain.com",
    description: "Native content amplification platform",
    cidrs: ["152.199.0.0/16","23.67.0.0/16","23.111.0.0/16"],
    asnKeywords: ["outbrain"],
    uaPatterns: [/outbrain/i],
    referrerPatterns: [/outbrain\.com/i,/amplify\.outbrain\.com/i],
  },

  mgid: {
    id: "mgid", name: "MGID", category: "native", icon: "📢",
    website: "mgid.com",
    description: "Native content recommendation network",
    cidrs: ["185.104.116.0/22","185.58.208.0/22"],
    asnKeywords: ["mgid"],
    uaPatterns: [/mgid/i],
    referrerPatterns: [/mgid\.com/i],
  },

  revcontent: {
    id: "revcontent", name: "RevContent", category: "native", icon: "📑",
    website: "revcontent.com",
    description: "Native content recommendation advertising",
    cidrs: ["205.185.0.0/16"],
    asnKeywords: ["revcontent"],
    uaPatterns: [/revcontent/i],
    referrerPatterns: [/revcontent\.com/i],
  },

  sharethrough: {
    id: "sharethrough", name: "Sharethrough", category: "native", icon: "🔄",
    website: "sharethrough.com",
    description: "Native advertising marketplace",
    cidrs: [],
    asnKeywords: ["sharethrough"],
    uaPatterns: [/sharethrough/i],
    referrerPatterns: [/sharethrough\.com/i],
  },

  nativo: {
    id: "nativo", name: "Nativo", category: "native", icon: "📄",
    website: "nativo.com",
    description: "Native advertising technology platform",
    cidrs: [],
    asnKeywords: ["nativo"],
    uaPatterns: [/nativo/i],
    referrerPatterns: [/nativo\.com/i],
  },

  // ── POP / PUSH NETWORKS ───────────────────────────────────
  propellerads: {
    id: "propellerads", name: "PropellerAds", category: "pop_push", icon: "🚀",
    website: "propellerads.com",
    description: "Push notifications, pop-under, interstitial, survey exit",
    cidrs: ["185.108.68.0/22","193.105.173.0/24","46.161.40.0/22","185.42.136.0/22"],
    asnKeywords: ["propellerads","propeller ads media","adtelligent"],
    uaPatterns: [/propellerads/i,/onclickads/i,/monetag/i],
    referrerPatterns: [/propellerads\.com/i,/onclickads\.net/i,/monetag\.com/i],
  },

  adsterra: {
    id: "adsterra", name: "Adsterra", category: "pop_push", icon: "⭐",
    website: "adsterra.com",
    description: "Popunder, social bar, in-page push, display",
    cidrs: ["104.21.0.0/16","172.67.0.0/16","185.82.216.0/22"],
    asnKeywords: ["adsterra"],
    uaPatterns: [/adsterra/i],
    referrerPatterns: [/adsterra\.com/i,/adsterra\.network/i],
  },

  popads: {
    id: "popads", name: "PopAds", category: "pop_push", icon: "🔔",
    website: "popads.net",
    description: "Popunder ad network — Tier 1 traffic specialists",
    cidrs: ["185.234.218.0/24","194.165.16.0/22"],
    asnKeywords: ["popads","popads.net"],
    uaPatterns: [/popads/i],
    referrerPatterns: [/popads\.net/i],
  },

  popcash: {
    id: "popcash", name: "PopCash", category: "pop_push", icon: "💰",
    website: "popcash.net",
    description: "Popunder advertising network",
    cidrs: ["185.220.0.0/17"],
    asnKeywords: ["popcash"],
    uaPatterns: [/popcash/i],
    referrerPatterns: [/popcash\.net/i],
  },

  hilltopads: {
    id: "hilltopads", name: "HilltopAds", category: "pop_push", icon: "⛰️",
    website: "hilltopads.com",
    description: "Push, pop-under, direct links, display banners",
    cidrs: ["194.247.12.0/22","185.189.13.0/24"],
    asnKeywords: ["hilltopads","hilltop ads"],
    uaPatterns: [/hilltopads/i],
    referrerPatterns: [/hilltopads\.com/i,/hilltopads\.net/i],
  },

  clickadu: {
    id: "clickadu", name: "Clickadu", category: "pop_push", icon: "👆",
    website: "clickadu.com",
    description: "Push, pop, video, banner ads for performance",
    cidrs: ["195.123.212.0/22","185.230.184.0/22"],
    asnKeywords: ["clickadu"],
    uaPatterns: [/clickadu/i],
    referrerPatterns: [/clickadu\.com/i],
  },

  zeropark: {
    id: "zeropark", name: "Zeropark", category: "pop_push", icon: "0️⃣",
    website: "zeropark.com",
    description: "Pop, domain redirect, push traffic — performance focus",
    cidrs: ["185.49.0.0/16","91.239.201.0/24"],
    asnKeywords: ["zeropark","adcolony","digital turbine"],
    uaPatterns: [/zeropark/i],
    referrerPatterns: [/zeropark\.com/i],
  },

  richads: {
    id: "richads", name: "RichAds", category: "pop_push", icon: "💎",
    website: "richads.com",
    description: "Push, pop, domain redirect, native — AI optimized",
    cidrs: ["185.173.36.0/22","185.147.124.0/22"],
    asnKeywords: ["richads","rich ads"],
    uaPatterns: [/richads/i,/richpush/i],
    referrerPatterns: [/richads\.com/i],
  },

  adcash: {
    id: "adcash", name: "Adcash", category: "pop_push", icon: "💵",
    website: "adcash.com",
    description: "Pop-under, interstitial, push, display, native",
    cidrs: ["185.75.120.0/22","91.228.228.0/22"],
    asnKeywords: ["adcash"],
    uaPatterns: [/adcash/i],
    referrerPatterns: [/adcash\.com/i],
  },

  exoclick: {
    id: "exoclick", name: "ExoClick", category: "pop_push", icon: "🔥",
    website: "exoclick.com",
    description: "Mainstream and adult push/pop/video ads",
    cidrs: ["176.31.0.0/16","178.33.0.0/16","5.196.0.0/16"],
    asnKeywords: ["exoclick","exo click"],
    uaPatterns: [/exoclick/i],
    referrerPatterns: [/exoclick\.com/i],
  },

  evadav: {
    id: "evadav", name: "EvaDav", category: "pop_push", icon: "🌊",
    website: "evadav.com",
    description: "Push notifications and popunder ads",
    cidrs: ["185.189.203.0/24","185.244.214.0/24"],
    asnKeywords: ["evadav"],
    uaPatterns: [/evadav/i],
    referrerPatterns: [/evadav\.com/i],
  },

  trafficstars: {
    id: "trafficstars", name: "TrafficStars", category: "pop_push", icon: "⭐",
    website: "trafficstars.com",
    description: "Push, popunder, banner, native, video — adult+mainstream",
    cidrs: ["185.189.14.0/23","185.171.64.0/22"],
    asnKeywords: ["trafficstars","traffic stars"],
    uaPatterns: [/trafficstars/i],
    referrerPatterns: [/trafficstars\.com/i],
  },

  admaven: {
    id: "admaven", name: "AdMaven", category: "pop_push", icon: "🦅",
    website: "ad-maven.com",
    description: "Quality pop traffic — 500M daily impressions",
    cidrs: ["185.246.208.0/22","185.213.26.0/24"],
    asnKeywords: ["admaven","ad maven","adm-aws"],
    uaPatterns: [/admaven/i,/ad-maven/i],
    referrerPatterns: [/ad-maven\.com/i,/admaven\.com/i],
  },

  roiads: {
    id: "roiads", name: "ROIads", category: "pop_push", icon: "📈",
    website: "roiads.co",
    description: "Pop, push, in-page push, direct click — AI bidding",
    cidrs: [],
    asnKeywords: ["roiads"],
    uaPatterns: [/roiads/i],
    referrerPatterns: [/roiads\.co/i],
  },

  clickadilla: {
    id: "clickadilla", name: "ClickAdilla", category: "pop_push", icon: "🖱️",
    website: "clickadilla.com",
    description: "4.5 billion daily impressions — push, pop, in-page",
    cidrs: ["185.244.173.0/24"],
    asnKeywords: ["clickadilla"],
    uaPatterns: [/clickadilla/i],
    referrerPatterns: [/clickadilla\.com/i],
  },

  rollerads: {
    id: "rollerads", name: "RollerAds", category: "pop_push", icon: "🎢",
    website: "rollerads.com",
    description: "Push notifications, popunder — 1.2B daily impressions",
    cidrs: [],
    asnKeywords: ["rollerads","roller ads"],
    uaPatterns: [/rollerads/i],
    referrerPatterns: [/rollerads\.com/i],
  },

  galaksion: {
    id: "galaksion", name: "Galaksion", category: "pop_push", icon: "🌌",
    website: "galaksion.com",
    description: "Direct publisher traffic — push, pop, interstitial",
    cidrs: [],
    asnKeywords: ["galaksion"],
    uaPatterns: [/galaksion/i],
    referrerPatterns: [/galaksion\.com/i],
  },

  kadam: {
    id: "kadam", name: "Kadam", category: "pop_push", icon: "🔮",
    website: "kadam.net",
    description: "Push, teasers, pop, banner network",
    cidrs: ["91.234.36.0/22"],
    asnKeywords: ["kadam"],
    uaPatterns: [/kadam/i],
    referrerPatterns: [/kadam\.net/i],
  },

  popmyads: {
    id: "popmyads", name: "PopMyAds", category: "pop_push", icon: "🎈",
    website: "popmyads.com",
    description: "Popunder and popup advertising network",
    cidrs: [],
    asnKeywords: ["popmyads"],
    uaPatterns: [/popmyads/i],
    referrerPatterns: [/popmyads\.com/i],
  },

  pushground: {
    id: "pushground", name: "Pushground", category: "pop_push", icon: "📲",
    website: "pushground.com",
    description: "Push notification advertising network",
    cidrs: ["185.220.101.0/24"],
    asnKeywords: ["pushground"],
    uaPatterns: [/pushground/i],
    referrerPatterns: [/pushground\.com/i],
  },

  trafficnomads: {
    id: "trafficnomads", name: "Traffic Nomads", category: "pop_push", icon: "🏕️",
    website: "trafficnomads.com",
    description: "Push and pop traffic for performance marketers",
    cidrs: [],
    asnKeywords: ["traffic nomads","trafficnomads"],
    uaPatterns: [/trafficnomads/i],
    referrerPatterns: [/trafficnomads\.com/i],
  },

  juicyads: {
    id: "juicyads", name: "JuicyAds", category: "pop_push", icon: "🍊",
    website: "juicyads.com",
    description: "Adult and mainstream banner, push, pop network",
    cidrs: ["162.252.220.0/22"],
    asnKeywords: ["juicyads","juicy ads"],
    uaPatterns: [/juicyads/i],
    referrerPatterns: [/juicyads\.com/i],
  },

  twinred: {
    id: "twinred", name: "TwinRed", category: "pop_push", icon: "🔴",
    website: "twinred.com",
    description: "Adult traffic — push, pop, display, video",
    cidrs: [],
    asnKeywords: ["twinred","twin red"],
    uaPatterns: [/twinred/i],
    referrerPatterns: [/twinred\.com/i],
  },

  adscompass: {
    id: "adscompass", name: "AdsCompass", category: "pop_push", icon: "🧭",
    website: "adscompass.com",
    description: "Push, pop, redirect, display traffic exchange",
    cidrs: [],
    asnKeywords: ["adscompass","ads compass"],
    uaPatterns: [/adscompass/i],
    referrerPatterns: [/adscompass\.com/i],
  },

  onclicka: {
    id: "onclicka", name: "OnClickA", category: "pop_push", icon: "🖱️",
    website: "onclicka.com",
    description: "Self-serve pop, push, banner network",
    cidrs: [],
    asnKeywords: ["onclicka"],
    uaPatterns: [/onclicka/i],
    referrerPatterns: [/onclicka\.com/i],
  },

  bidvertiser: {
    id: "bidvertiser", name: "BidVertiser", category: "pop_push", icon: "💹",
    website: "bidvertiser.com",
    description: "Pop, push, redirect, native advertising",
    cidrs: ["64.74.96.0/20"],
    asnKeywords: ["bidvertiser"],
    uaPatterns: [/bidvertiser/i],
    referrerPatterns: [/bidvertiser\.com/i],
  },

  coinis: {
    id: "coinis", name: "Coinis", category: "pop_push", icon: "🪙",
    website: "coinis.com",
    description: "Push, pop, native, interstitial traffic",
    cidrs: [],
    asnKeywords: ["coinis"],
    uaPatterns: [/coinis/i],
    referrerPatterns: [/coinis\.com/i],
  },

  ezmob: {
    id: "ezmob", name: "EZmob", category: "pop_push", icon: "📡",
    website: "ezmob.com",
    description: "Mobile-first push, pop, banner network",
    cidrs: [],
    asnKeywords: ["ezmob"],
    uaPatterns: [/ezmob/i],
    referrerPatterns: [/ezmob\.com/i],
  },

  mybid: {
    id: "mybid", name: "MyBid", category: "pop_push", icon: "🤝",
    website: "mybid.com",
    description: "Managed push and pop campaigns",
    cidrs: [],
    asnKeywords: ["mybid"],
    uaPatterns: [/mybid/i],
    referrerPatterns: [/mybid\.com/i],
  },

  fatads: {
    id: "fatads", name: "FatAds", category: "pop_push", icon: "🎪",
    website: "fatads.com",
    description: "Push, pop, in-page push network",
    cidrs: [],
    asnKeywords: ["fatads","fat ads"],
    uaPatterns: [/fatads/i],
    referrerPatterns: [/fatads\.com/i],
  },

  // ── AD VERIFICATION (always block) ───────────────────────
  doubleverify: {
    id: "doubleverify", name: "DoubleVerify", category: "ad_verification", icon: "🛡️",
    website: "doubleverify.com",
    description: "Ad verification and fraud detection service",
    cidrs: ["199.83.128.0/21","149.126.72.0/21"],
    asnKeywords: ["doubleverify"],
    uaPatterns: [/doubleverify/i,/dv[-_]?crawler/i],
    referrerPatterns: [/doubleverify\.com/i],
  },

  ias: {
    id: "ias", name: "Integral Ad Science (IAS)", category: "ad_verification", icon: "🔬",
    website: "integralads.com",
    description: "Ad verification, brand safety, viewability",
    cidrs: ["185.238.3.0/24","212.59.0.0/16"],
    asnKeywords: ["integral ad science","integralads"],
    uaPatterns: [/integral.*ad.*science/i,/ias[-_]?crawler/i],
    referrerPatterns: [/integralads\.com/i],
  },

  moat: {
    id: "moat", name: "Oracle Moat", category: "ad_verification", icon: "🏰",
    website: "moat.com",
    description: "Ad analytics and verification by Oracle",
    cidrs: ["205.220.0.0/16"],
    asnKeywords: ["oracle","moat analytics"],
    uaPatterns: [/moat(bot)?/i,/oracle.*moat/i],
    referrerPatterns: [/moat\.com/i],
  },

  // ── MOBILE NETWORKS ───────────────────────────────────────
  applovin: {
    id: "applovin", name: "AppLovin / MAX", category: "mobile", icon: "📱",
    website: "applovin.com",
    description: "Mobile app install, in-app, rewarded video",
    cidrs: ["64.74.16.0/20","208.80.152.0/22"],
    asnKeywords: ["applovin"],
    uaPatterns: [/applovin/i],
    referrerPatterns: [/applovin\.com/i],
  },

  ironsource: {
    id: "ironsource", name: "ironSource / Unity Ads", category: "mobile", icon: "🎮",
    website: "ironsrc.com",
    description: "Mobile game monetization, rewarded ads",
    cidrs: ["178.33.0.0/16"],
    asnKeywords: ["ironsource","unity technologies","ironsrc"],
    uaPatterns: [/ironsource/i,/unity.*ads/i],
    referrerPatterns: [/ironsrc\.com/i,/unity3d\.com/i],
  },

  chartboost: {
    id: "chartboost", name: "Chartboost", category: "mobile", icon: "🏆",
    website: "chartboost.com",
    description: "Mobile gaming ads and in-app monetization",
    cidrs: [],
    asnKeywords: ["chartboost"],
    uaPatterns: [/chartboost/i],
    referrerPatterns: [/chartboost\.com/i],
  },

  // ── AFFILIATE NETWORKS ────────────────────────────────────
  cj: {
    id: "cj", name: "Commission Junction (CJ)", category: "affiliate", icon: "🔗",
    website: "cj.com",
    description: "Affiliate marketing network",
    cidrs: ["63.140.0.0/16"],
    asnKeywords: ["commission junction","cj affiliate"],
    uaPatterns: [/commissionjunction/i,/\bcj\b/i],
    referrerPatterns: [/cj\.com/i,/commissionjunction\.com/i],
  },

  shareasale: {
    id: "shareasale", name: "ShareASale (Awin)", category: "affiliate", icon: "💸",
    website: "shareasale.com",
    description: "Affiliate marketing marketplace by Awin",
    cidrs: [],
    asnKeywords: ["shareasale","awin"],
    uaPatterns: [/shareasale/i,/awin/i],
    referrerPatterns: [/shareasale\.com/i,/awin\.com/i],
  },

  rakuten: {
    id: "rakuten", name: "Rakuten Advertising", category: "affiliate", icon: "🛍️",
    website: "rakutenadvertising.com",
    description: "Affiliate and performance marketing network",
    cidrs: [],
    asnKeywords: ["rakuten","linkshare"],
    uaPatterns: [/rakuten/i,/linkshare/i],
    referrerPatterns: [/rakutenadvertising\.com/i,/linksynergy\.com/i],
  },

  // ── VIDEO ─────────────────────────────────────────────────
  youtube: {
    id: "youtube", name: "YouTube Ads", category: "video", icon: "▶️",
    website: "ads.google.com",
    description: "YouTube in-stream, bumper, discovery ads (via Google Ads)",
    cidrs: ["142.250.0.0/15","172.217.0.0/16"],
    asnKeywords: ["google llc"],
    uaPatterns: [/youtube/i,/googlebot-video/i],
    referrerPatterns: [/youtube\.com/i,/youtu\.be/i],
  },

  medianet: {
    id: "medianet", name: "Media.net (Yahoo/Bing)", category: "display", icon: "🌐",
    website: "media.net",
    description: "Contextual display ads powered by Yahoo/Bing",
    cidrs: [],
    asnKeywords: ["media.net","media net"],
    uaPatterns: [/media\.net/i],
    referrerPatterns: [/media\.net/i],
  },

  searchppc: {
    id: "searchppc", name: "7Search PPC", category: "search", icon: "7️⃣",
    website: "7searchppc.com",
    description: "Pay-per-click search and display advertising",
    cidrs: [],
    asnKeywords: ["7search","7searchppc"],
    uaPatterns: [/7searchppc/i],
    referrerPatterns: [/7searchppc\.com/i],
  },
}

// ── IP utility ─────────────────────────────────────────────
function ipToLong(ip: string): number {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return 0
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}
function isInCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split("/")
    const mask = bits ? (~0 << (32 - parseInt(bits))) >>> 0 : 0xffffffff
    return (ipToLong(ip) & mask) === (ipToLong(range) & mask)
  } catch { return false }
}

// ── Main detection function ─────────────────────────────────
export function detectAdPlatform(
  ip: string,
  userAgent: string,
  referrer: string,
  selectedPlatforms: string[]
): { detected: boolean; platformId: string | null; platformName: string | null; method: string } {

  const ua = (userAgent || "").toLowerCase()
  const ref = (referrer || "").toLowerCase()

  // ad_verification platforms are ALWAYS checked regardless of selection
  const verificationIds = Object.values(AD_PLATFORMS)
    .filter(p => p.category === "ad_verification")
    .map(p => p.id)

  const toCheck = [...new Set([
    ...verificationIds,
    ...(selectedPlatforms.length > 0 ? selectedPlatforms.filter(id => AD_PLATFORMS[id]) : [])
  ])]

  for (const platformId of toCheck) {
    const platform = AD_PLATFORMS[platformId]
    if (!platform) continue

    if (platform.cidrs.some(cidr => isInCIDR(ip, cidr)))
      return { detected: true, platformId, platformName: platform.name, method: "ip_cidr" }

    if (platform.uaPatterns.some(p => p.test(ua)))
      return { detected: true, platformId, platformName: platform.name, method: "user_agent" }

    if (ref && platform.referrerPatterns.some(p => p.test(ref)))
      return { detected: true, platformId, platformName: platform.name, method: "referrer" }
  }

  return { detected: false, platformId: null, platformName: null, method: "none" }
}

// ── ASN keyword check (used by datacenter-detection.ts) ────
export function checkAdPlatformByASN(ispOrOrg: string): string | null {
  const text = ispOrOrg.toLowerCase()
  for (const platform of Object.values(AD_PLATFORMS)) {
    if (platform.asnKeywords.some(k => text.includes(k))) {
      return platform.id
    }
  }
  return null
}

// ── For frontend UI ─────────────────────────────────────────
export function getAdPlatformList() {
  return Object.values(AD_PLATFORMS).map(p => ({
    id: p.id, name: p.name, category: p.category,
    icon: p.icon, description: p.description, website: p.website,
  }))
}

export const AD_PLATFORM_CATEGORIES: Record<string, string> = {
  search:           "🔍 Search Engines",
  social:           "📱 Social Media",
  display:          "🖥️ Display Networks",
  programmatic:     "⚙️ Programmatic DSP",
  native:           "📰 Native Advertising",
  mobile:           "📲 Mobile Networks",
  pop_push:         "🔔 Pop / Push Networks",
  affiliate:        "🔗 Affiliate Networks",
  video:            "▶️ Video Platforms",
  ad_verification:  "🛡️ Ad Verification (Auto-blocked)",
}
