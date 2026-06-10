// ============================================================
// TRACKING CODE GENERATOR — All Platform Variants
// HTML Script Tag | Standalone JS | PHP Inline | PHP File
// WordPress Plugin | Next.js | Python | Nginx Lua
// ============================================================

export interface WebsiteConfig {
  id: string | number
  name: string
  domain: string
  landing_page_url: string
  safe_page_url: string
  allowed_countries: string[]
  blocked_ad_platforms: string[]
  max_visit_limit?: number
  visit_limit_time_hours?: number
  cloaking_enabled?: boolean
}

// ── Core JS logic (shared across all variants) ─────────────
function coreJsLogic(cfg: Record<string, any>): string {
  return `(function(){
  var CFG=${JSON.stringify(cfg)};
  var BOT_UA=[/bot\\b/i,/crawler/i,/spider/i,/scraper/i,/googlebot/i,/bingbot/i,
    /facebookexternalhit/i,/twitterbot/i,/linkedinbot/i,/bytespider/i,
    /selenium/i,/puppeteer/i,/playwright/i,/headless/i,/webdriver/i,
    /curl\\//i,/wget\\//i,/python-requests/i,/go-http-client/i,/java\\//i,
    /doubleverify/i,/ias[-_]?crawler/i,/moat/i,/grapeshot/i,/adsbot/i,
    /gptbot/i,/claudebot/i,/anthropic-ai/i,/ahrefsbot/i,/semrushbot/i,
    /dotbot/i,/mj12bot/i,/rogerbot/i,/screaming.*frog/i,/applebot/i];
  var ua=navigator.userAgent||"";
  var clientBot=!ua||ua.length<10||BOT_UA.some(function(p){return p.test(ua);});
  if(navigator.webdriver===true)clientBot=true;
  if(!navigator.languages||navigator.languages.length===0)clientBot=true;
  if(navigator.plugins&&navigator.plugins.length===0&&/Chrome/.test(ua)&&!/Android/.test(ua))clientBot=true;
  var ref=document.referrer||"";
  var adPlatform="unknown";
  var adRef={google:/google\\.com\\/aclk|googleadservices|googlesyndication|doubleclick/i,
    facebook:/facebook\\.com|fbcdn\\.net|l\\.facebook/i,tiktok:/tiktok\\.com|ads\\.tiktok/i,
    microsoft:/bing\\.com|ads\\.microsoft/i,taboola:/taboola\\.com/i,
    outbrain:/outbrain\\.com/i,propellerads:/propellerads\\.com|onclickads/i,
    adsterra:/adsterra\\.com/i,popads:/popads\\.net/i,zeropark:/zeropark\\.com/i};
  for(var k in adRef){if(adRef[k].test(ref)){adPlatform=k;break;}}
  function capped(){
    if(!CFG.maxVisitLimit||CFG.maxVisitLimit<=0)return false;
    try{var key="tfp_"+CFG.websiteId,stored=JSON.parse(localStorage.getItem(key)||"[]"),
      cutoff=Date.now()-(CFG.visitLimitTimeHours*3600000),recent=stored.filter(function(t){return t>cutoff;});
      if(recent.length>=CFG.maxVisitLimit)return true;
      recent.push(Date.now());localStorage.setItem(key,JSON.stringify(recent));}catch(e){}
    return false;}
  function go(url){if(window.location.href.indexOf(url)===-1)window.location.replace(url);}
  function decide(res){
    if(!CFG.isActive)return;
    if(clientBot){go(CFG.landingPageUrl);return;}
    if(capped()){go(CFG.landingPageUrl);return;}
    if(res&&res.action==="stay_on_landing")go(CFG.landingPageUrl);
    else if(res&&res.action==="redirect_safe")go(CFG.safePageUrl);}
  if(clientBot){go(CFG.landingPageUrl);return;}
  var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}
  fetch(CFG.appUrl+"/api/track-visit",{method:"POST",
    headers:{"Content-Type":"application/json"},credentials:"omit",
    body:JSON.stringify({websiteId:CFG.websiteId,userAgent:ua,referrer:ref,url:window.location.href,
      detectedAdPlatform:adPlatform,clientBotDetection:{isBot:clientBot,botType:clientBot?"client_ua":null},
      features:{webdriver:navigator.webdriver||false,plugins:navigator.plugins?navigator.plugins.length:0,
        timezone:tz,languages:(navigator.languages||[]).join(","),screenRes:screen.width+"x"+screen.height}})})
  .then(function(r){return r.ok?r.json():null;}).then(decide).catch(function(){decide(null);});
})();`
}

function buildConfig(website: WebsiteConfig, appUrl: string) {
  return {
    websiteId: String(website.id),
    appUrl: appUrl.replace(/\/$/, ""),
    landingPageUrl: website.landing_page_url,
    safePageUrl: website.safe_page_url,
    allowedCountries: website.allowed_countries || [],
    blockedAdPlatforms: website.blocked_ad_platforms || [],
    maxVisitLimit: website.max_visit_limit || 0,
    visitLimitTimeHours: website.visit_limit_time_hours || 24,
    isActive: website.cloaking_enabled !== false,
  }
}

// ── 1. HTML <script> tag ───────────────────────────────────
export function generateHtmlCode(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `<!-- Traffic Filter Pro — ${website.name} -->
<!-- Paste inside <head> tag of every page you want to protect -->
<script>
${coreJsLogic(cfg)}
</script>
<!-- End Traffic Filter Pro -->`
}

// ── 2. Standalone JS file ──────────────────────────────────
export function generateJsFile(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `/**
 * Traffic Filter Pro — ${website.name}
 * Save as: tfp-filter.js
 * Then add to your HTML: <script src="tfp-filter.js"></script>
 * OR host it on your CDN and use that URL
 */
${coreJsLogic(cfg)}`
}

// ── 3. PHP inline (paste in PHP file) ─────────────────────
export function generatePhpInline(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  const cfgJson = JSON.stringify(cfg)
  return `<?php
/**
 * Traffic Filter Pro — ${website.name}
 * Paste this at the TOP of your PHP file (before any HTML output)
 * Works on: index.php, any landing page PHP file
 */

// Server-side bot/country check (runs before page loads)
function tfp_server_check() {
    $app_url    = ${JSON.stringify(cfg.appUrl)};
    $website_id = ${JSON.stringify(cfg.websiteId)};
    $landing    = ${JSON.stringify(cfg.landingPageUrl)};
    $safe       = ${JSON.stringify(cfg.safePageUrl)};
    $allowed_countries   = ${JSON.stringify(cfg.allowedCountries)};
    $blocked_platforms   = ${JSON.stringify(cfg.blockedAdPlatforms)};

    $ua      = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip      = $_SERVER['HTTP_CF_CONNECTING_IP']
            ?? $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '';
    $ip      = explode(',', $ip)[0];
    $country = $_SERVER['HTTP_CF_IPCOUNTRY']
            ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY']
            ?? '';

    // Quick server-side bot UA check
    $bot_patterns = [
        '/bot\\b/i','/crawler/i','/spider/i','/googlebot/i','/bingbot/i',
        '/selenium/i','/puppeteer/i','/playwright/i','/headless/i',
        '/curl\\//i','/wget\\//i','/python-requests/i','/doubleverify/i',
        '/facebookexternalhit/i','/bytespider/i','/gptbot/i','/adsbot/i',
    ];
    foreach ($bot_patterns as $pattern) {
        if (preg_match($pattern, $ua)) {
            header('Location: ' . $landing);
            exit;
        }
    }

    // Country filter
    if (!empty($allowed_countries) && !empty($country)) {
        if (!in_array(strtoupper($country), $allowed_countries)) {
            header('Location: ' . $landing);
            exit;
        }
    }

    // Call Traffic Filter API for deep check (datacenter/VPN/proxy)
    $payload = json_encode([
        'websiteId'           => $website_id,
        'userAgent'           => $ua,
        'referrer'            => $_SERVER['HTTP_REFERER'] ?? '',
        'url'                 => (isset($_SERVER['HTTPS']) ? 'https' : 'http')
                                 . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
        'detectedCountry'     => $country,
        'clientBotDetection'  => ['isBot' => false, 'botType' => null],
    ]);

    $ch = curl_init($app_url . '/api/track-visit');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 3,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $result = json_decode($response, true);
        if (!empty($result['action'])) {
            if ($result['action'] === 'stay_on_landing') {
                header('Location: ' . $landing);
                exit;
            }
        }
    }
}

tfp_server_check();
?>
<!DOCTYPE html>
<!-- Your normal HTML continues here -->`
}

// ── 4. PHP separate file (upload filter.php) ───────────────
export function generatePhpFile(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `<?php
/**
 * Traffic Filter Pro — ${website.name}
 * ===================================
 * Step 1: Upload this file as "tfp-filter.php" to your server root
 * Step 2: Add this line to the TOP of your index.php:
 *         <?php require_once __DIR__ . '/tfp-filter.php'; ?>
 */

if (!defined('TFP_LOADED')) {
    define('TFP_LOADED', true);

    $TFP_CONFIG = [
        'website_id'          => ${JSON.stringify(cfg.websiteId)},
        'app_url'             => ${JSON.stringify(cfg.appUrl)},
        'landing_page_url'    => ${JSON.stringify(cfg.landingPageUrl)},
        'safe_page_url'       => ${JSON.stringify(cfg.safePageUrl)},
        'allowed_countries'   => ${JSON.stringify(cfg.allowedCountries)},
        'blocked_platforms'   => ${JSON.stringify(cfg.blockedAdPlatforms)},
        'max_visit_limit'     => ${cfg.maxVisitLimit},
        'visit_limit_hours'   => ${cfg.visitLimitTimeHours},
        'is_active'           => ${cfg.isActive ? 'true' : 'false'},
    ];

    function tfp_get_ip() {
        foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','REMOTE_ADDR'] as $key) {
            if (!empty($_SERVER[$key])) {
                return trim(explode(',', $_SERVER[$key])[0]);
            }
        }
        return '';
    }

    function tfp_redirect($url) {
        header('Location: ' . $url, true, 302);
        exit;
    }

    function tfp_run(array $config) {
        if (!$config['is_active']) return;

        $ua      = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ip      = tfp_get_ip();
        $country = strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']
                ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? '');
        $referer = $_SERVER['HTTP_REFERER'] ?? '';

        // Bot UA patterns
        $bots = ['/bot\\b/i','/crawler/i','/googlebot/i','/bingbot/i',
            '/facebookexternalhit/i','/bytespider/i','/selenium/i',
            '/puppeteer/i','/playwright/i','/webdriver/i','/headless/i',
            '/curl\\//i','/wget\\//i','/python-requests/i','/java\\//i',
            '/doubleverify/i','/ias[-_]?crawler/i','/moat/i','/gptbot/i',
            '/ahrefsbot/i','/semrushbot/i','/adsbot-google/i'];
        foreach ($bots as $p) {
            if (preg_match($p, $ua)) {
                tfp_redirect($config['landing_page_url']);
            }
        }

        // Country filter
        if (!empty($config['allowed_countries']) && !empty($country)) {
            if (!in_array($country, $config['allowed_countries'])) {
                tfp_redirect($config['landing_page_url']);
            }
        }

        // Deep API check (datacenter, VPN, proxy, ad platform IPs)
        $payload = json_encode([
            'websiteId'          => $config['website_id'],
            'userAgent'          => $ua,
            'referrer'           => $referer,
            'url'                => (isset($_SERVER['HTTPS']) ? 'https' : 'http')
                                    . '://' . ($_SERVER['HTTP_HOST'] ?? '')
                                    . ($_SERVER['REQUEST_URI'] ?? '/'),
            'detectedCountry'    => $country,
            'clientBotDetection' => ['isBot' => false, 'botType' => null],
        ]);

        $ch = curl_init($config['app_url'] . '/api/track-visit');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 3,
        ]);
        $res = curl_exec($ch);
        curl_close($ch);

        if ($res) {
            $data = json_decode($res, true);
            if (!empty($data['action']) && $data['action'] === 'stay_on_landing') {
                tfp_redirect($config['landing_page_url']);
            }
        }
    }

    tfp_run($TFP_CONFIG);
}`
}

// ── 5. WordPress plugin ────────────────────────────────────
export function generateWordPressPlugin(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `<?php
/**
 * Plugin Name: Traffic Filter Pro — ${website.name}
 * Description: Filters bot traffic and protects your landing pages
 * Version: 1.0.0
 * Author: Traffic Filter Pro
 *
 * INSTALLATION:
 * 1. Save this file as: tfp-filter/tfp-filter.php
 * 2. Zip the folder: tfp-filter.zip
 * 3. WordPress Admin → Plugins → Upload Plugin → Install & Activate
 */

if (!defined('ABSPATH')) exit;

define('TFP_WEBSITE_ID',   ${JSON.stringify(cfg.websiteId)});
define('TFP_APP_URL',      ${JSON.stringify(cfg.appUrl)});
define('TFP_LANDING_URL',  ${JSON.stringify(cfg.landingPageUrl)});
define('TFP_SAFE_URL',     ${JSON.stringify(cfg.safePageUrl)});
define('TFP_COUNTRIES',    '${cfg.allowedCountries.join(",")}');
define('TFP_IS_ACTIVE',    ${cfg.isActive ? 'true' : 'false'});

// Run before WordPress loads the page
add_action('init', 'tfp_filter_traffic', 1);

function tfp_filter_traffic() {
    if (!TFP_IS_ACTIVE) return;
    if (is_admin()) return; // Never filter WP admin

    $ua      = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $country = strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']
            ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? '');

    // Bot check
    $bots = ['bot','crawler','spider','googlebot','bingbot',
             'facebookexternalhit','bytespider','selenium',
             'puppeteer','playwright','headless','webdriver',
             'curl/','wget/','python-requests','doubleverify',
             'ias-crawler','moat','gptbot','adsbot'];
    $ua_lower = strtolower($ua);
    foreach ($bots as $bot) {
        if (strpos($ua_lower, $bot) !== false) {
            wp_redirect(TFP_LANDING_URL);
            exit;
        }
    }

    // Country filter
    $allowed = array_filter(explode(',', TFP_COUNTRIES));
    if (!empty($allowed) && !empty($country) && !in_array($country, $allowed)) {
        wp_redirect(TFP_LANDING_URL);
        exit;
    }

    // Deep API check
    $payload = json_encode([
        'websiteId'          => TFP_WEBSITE_ID,
        'userAgent'          => $ua,
        'referrer'           => $_SERVER['HTTP_REFERER'] ?? '',
        'url'                => home_url(add_query_arg(null, null)),
        'detectedCountry'    => $country,
        'clientBotDetection' => ['isBot' => false, 'botType' => null],
    ]);

    $response = wp_remote_post(TFP_APP_URL . '/api/track-visit', [
        'body'    => $payload,
        'headers' => ['Content-Type' => 'application/json'],
        'timeout' => 3,
    ]);

    if (!is_wp_error($response)) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($data['action']) && $data['action'] === 'stay_on_landing') {
            wp_redirect(TFP_LANDING_URL);
            exit;
        }
    }
}

// Also inject client-side script for extra detection
add_action('wp_head', 'tfp_inject_script', 1);
function tfp_inject_script() {
    if (!TFP_IS_ACTIVE) return;
    ?>
<script>
/* Traffic Filter Pro client-side backup */
(function(){
var ua=navigator.userAgent||"";
var bots=[/bot\\b/i,/selenium/i,/puppeteer/i,/playwright/i,/headless/i,/webdriver/i];
if(bots.some(function(p){return p.test(ua);})||navigator.webdriver===true){
  window.location.replace(<?php echo json_encode(TFP_LANDING_URL); ?>);}
})();
</script>
    <?php
}`
}

// ── 6. Next.js / React middleware ──────────────────────────
export function generateNextjsCode(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `// middleware.ts — Add to your Next.js project root
// Traffic Filter Pro — ${website.name}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TFP_CONFIG = ${JSON.stringify(cfg, null, 2)}

const BOT_PATTERNS = [
  /bot\\b/i, /crawler/i, /spider/i, /googlebot/i, /bingbot/i,
  /facebookexternalhit/i, /bytespider/i, /selenium/i,
  /puppeteer/i, /playwright/i, /headless/i, /webdriver/i,
  /curl\\//i, /wget\\//i, /python-requests/i, /doubleverify/i,
  /ias[-_]?crawler/i, /moat/i, /gptbot/i, /ahrefsbot/i,
]

export async function middleware(req: NextRequest) {
  const ua      = req.headers.get('user-agent') || ''
  const country = req.headers.get('x-vercel-ip-country')
               || req.headers.get('cf-ipcountry') || ''
  const ip      = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               || req.headers.get('x-real-ip') || ''

  const landing = new URL(TFP_CONFIG.landingPageUrl)
  const safe    = new URL(TFP_CONFIG.safePageUrl)

  if (!TFP_CONFIG.isActive) return NextResponse.next()

  // Bot UA check
  if (!ua || BOT_PATTERNS.some(p => p.test(ua))) {
    return NextResponse.redirect(landing)
  }

  // Country filter
  if (TFP_CONFIG.allowedCountries.length > 0 && country && country !== 'XX') {
    if (!TFP_CONFIG.allowedCountries.includes(country.toUpperCase())) {
      return NextResponse.redirect(landing)
    }
  }

  // Deep server check (async — call Traffic Filter API)
  try {
    const res = await fetch(TFP_CONFIG.appUrl + '/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: TFP_CONFIG.websiteId,
        userAgent: ua, detectedCountry: country,
        clientBotDetection: { isBot: false, botType: null },
      }),
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.action === 'stay_on_landing') return NextResponse.redirect(landing)
      if (data.action === 'redirect_safe')    return NextResponse.redirect(safe)
    }
  } catch {}

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}`
}

// ── 7. Python Flask / Django middleware ────────────────────
export function generatePythonCode(website: WebsiteConfig, appUrl: string): string {
  const cfg = buildConfig(website, appUrl)
  return `# Traffic Filter Pro — ${website.name}
# Works with: Flask, Django, FastAPI, any Python web app
# Save as: tfp_filter.py in your project root
#
# Flask usage:   from tfp_filter import tfp_middleware; app.before_request(tfp_middleware)
# Django usage:  Add 'tfp_filter.TFPMiddleware' to MIDDLEWARE in settings.py

import re, json, urllib.request
from typing import Optional

TFP_CONFIG = ${JSON.stringify(cfg, null, 2).replace(/true/g, 'True').replace(/false/g, 'False')}

BOT_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r'bot\\b', r'crawler', r'spider', r'googlebot', r'bingbot',
        r'facebookexternalhit', r'bytespider', r'selenium',
        r'puppeteer', r'playwright', r'headless', r'webdriver',
        r'curl/', r'wget/', r'python-requests', r'doubleverify',
        r'ias[_-]?crawler', r'moat', r'gptbot', r'ahrefsbot',
    ]
]

def is_bot(user_agent: str) -> bool:
    if not user_agent or len(user_agent) < 10:
        return True
    return any(p.search(user_agent) for p in BOT_PATTERNS)

def check_with_api(ua: str, country: str, url: str) -> Optional[str]:
    """Returns 'stay_on_landing', 'redirect_safe', or None"""
    try:
        payload = json.dumps({
            'websiteId': TFP_CONFIG['websiteId'],
            'userAgent': ua,
            'detectedCountry': country,
            'clientBotDetection': {'isBot': False, 'botType': None},
            'url': url,
        }).encode()
        req = urllib.request.Request(
            TFP_CONFIG['appUrl'] + '/api/track-visit',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=3) as r:
            data = json.loads(r.read())
            return data.get('action')
    except Exception:
        return None

# ── Flask integration ─────────────────────────────────────
def tfp_middleware():
    """Use as: app.before_request(tfp_middleware)"""
    from flask import request, redirect
    if not TFP_CONFIG['isActive']:
        return None

    ua      = request.headers.get('User-Agent', '')
    country = (request.headers.get('CF-IPCountry')
            or request.headers.get('X-Vercel-IP-Country', '')).upper()

    if is_bot(ua):
        return redirect(TFP_CONFIG['landingPageUrl'])

    allowed = TFP_CONFIG.get('allowedCountries', [])
    if allowed and country and country not in allowed:
        return redirect(TFP_CONFIG['landingPageUrl'])

    action = check_with_api(ua, country, request.url)
    if action == 'stay_on_landing':
        return redirect(TFP_CONFIG['landingPageUrl'])
    return None

# ── Django Middleware class ────────────────────────────────
class TFPMiddleware:
    """Add to MIDDLEWARE = ['tfp_filter.TFPMiddleware', ...] in settings.py"""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not TFP_CONFIG['isActive']:
            return self.get_response(request)

        from django.shortcuts import redirect as dj_redirect
        ua      = request.META.get('HTTP_USER_AGENT', '')
        country = (request.META.get('HTTP_CF_IPCOUNTRY')
                or request.META.get('HTTP_X_VERCEL_IP_COUNTRY', '')).upper()

        if is_bot(ua):
            return dj_redirect(TFP_CONFIG['landingPageUrl'])

        allowed = TFP_CONFIG.get('allowedCountries', [])
        if allowed and country and country not in allowed:
            return dj_redirect(TFP_CONFIG['landingPageUrl'])

        action = check_with_api(ua, country, request.build_absolute_uri())
        if action == 'stay_on_landing':
            return dj_redirect(TFP_CONFIG['landingPageUrl'])

        return self.get_response(request)`
}

// ── Export all generators ──────────────────────────────────
export const CODE_VARIANTS = [
  { id: "html",      label: "HTML Script Tag",       ext: "html",  lang: "html",       icon: "html5",    desc: "Har website ke liye — <head> mein paste karo" },
  { id: "js",        label: "JavaScript File",        ext: "js",    lang: "javascript", icon: "brand-javascript", desc: "Alag .js file — CDN ya server par upload karo" },
  { id: "php_inline",label: "PHP Inline",             ext: "php",   lang: "php",        icon: "brand-php", desc: "PHP file ke top mein paste karo" },
  { id: "php_file",  label: "PHP File (Upload)",      ext: "php",   lang: "php",        icon: "brand-php", desc: "tfp-filter.php upload karo, require_once karo" },
  { id: "wordpress", label: "WordPress Plugin",       ext: "php",   lang: "php",        icon: "brand-wordpress", desc: "Plugin install karo — no coding needed" },
  { id: "nextjs",    label: "Next.js Middleware",     ext: "ts",    lang: "typescript", icon: "brand-nextjs", desc: "middleware.ts — Next.js projects ke liye" },
  { id: "python",    label: "Python (Flask/Django)",  ext: "py",    lang: "python",     icon: "brand-python", desc: "Flask before_request ya Django middleware" },
]

export function generateCode(variant: string, website: WebsiteConfig, appUrl: string): string {
  switch (variant) {
    case "html":       return generateHtmlCode(website, appUrl)
    case "js":         return generateJsFile(website, appUrl)
    case "php_inline": return generatePhpInline(website, appUrl)
    case "php_file":   return generatePhpFile(website, appUrl)
    case "wordpress":  return generateWordPressPlugin(website, appUrl)
    case "nextjs":     return generateNextjsCode(website, appUrl)
    case "python":     return generatePythonCode(website, appUrl)
    default:           return generateHtmlCode(website, appUrl)
  }
}
