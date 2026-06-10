import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const websiteId = searchParams.get("id") || "default"

  // Get the current domain dynamically
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const metricsEndpoint = `${protocol}://${host}/api/track-visit`

  // Advanced cloaking JavaScript with automatic endpoint detection
  const trackingScript = `
(function() {
  'use strict';
  
  // Configuration with dynamic endpoint
  const config = {
    websiteId: '${websiteId}',
    metricsEndpoint: '${metricsEndpoint}',
    debug: false
  };

  // Visitor classification system
  const VisitorAnalytics = {
    // Collect comprehensive visitor data
    collectVisitorData: function() {
      const data = {
        // Browser characteristics
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(',') : '',
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        
        // Screen and display
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        screenPixelDepth: screen.pixelDepth,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        
        // Timezone and location
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        
        // Performance and capabilities
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null,
        
        // Page information
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
        
        // Session data
        sessionId: this.generateSessionId(),
        timestamp: Date.now(),
        loadTime: performance.now()
      };
      
      return data;
    },
    
    // Generate unique session identifier
    generateSessionId: function() {
      return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },
    
    // Behavioral analysis
    analyzeBehavior: function() {
      const behavior = {
        mouseMovements: 0,
        clicks: 0,
        scrolls: 0,
        keystrokes: 0,
        focusChanges: 0,
        timeOnPage: 0,
        interactions: []
      };
      
      // Track mouse movements
      let mouseTimer;
      document.addEventListener('mousemove', function() {
        behavior.mouseMovements++;
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => {
          behavior.interactions.push({type: 'mouse', time: Date.now()});
        }, 100);
      });
      
      // Track clicks
      document.addEventListener('click', function(e) {
        behavior.clicks++;
        behavior.interactions.push({
          type: 'click', 
          time: Date.now(),
          x: e.clientX,
          y: e.clientY,
          target: e.target.tagName
        });
      });
      
      // Track scrolling
      let scrollTimer;
      window.addEventListener('scroll', function() {
        behavior.scrolls++;
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          behavior.interactions.push({
            type: 'scroll', 
            time: Date.now(),
            scrollY: window.scrollY
          });
        }, 100);
      });
      
      // Track keyboard input
      document.addEventListener('keydown', function() {
        behavior.keystrokes++;
        behavior.interactions.push({type: 'keystroke', time: Date.now()});
      });
      
      // Track focus changes
      window.addEventListener('focus', function() {
        behavior.focusChanges++;
        behavior.interactions.push({type: 'focus', time: Date.now()});
      });
      
      window.addEventListener('blur', function() {
        behavior.focusChanges++;
        behavior.interactions.push({type: 'blur', time: Date.now()});
      });
      
      return behavior;
    },
    
    // Send data to server
    transmitData: function(data) {
      // Use multiple transmission methods for reliability
      const payload = JSON.stringify(data);
      
      // Method 1: Fetch API (preferred)
      if (typeof fetch !== 'undefined') {
        fetch(config.metricsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: payload,
          keepalive: true
        }).catch(() => {
          // Fallback to beacon if fetch fails
          this.sendBeacon(data);
        });
      } else {
        // Method 2: XMLHttpRequest fallback
        this.sendXHR(data);
      }
    },
    
    // Beacon API fallback
    sendBeacon: function(data) {
      if (navigator.sendBeacon) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        navigator.sendBeacon(config.metricsEndpoint, formData);
      }
    },
    
    // XMLHttpRequest fallback
    sendXHR: function(data) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', config.metricsEndpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
  };
  
  // Initialize tracking
  function initializeTracking() {
    const visitorData = VisitorAnalytics.collectVisitorData();
    const behaviorData = VisitorAnalytics.analyzeBehavior();
    
    // Combine all data
    const trackingData = {
      websiteId: config.websiteId,
      visitor: visitorData,
      behavior: behaviorData,
      pageShown: window.location.pathname.includes('/safe') ? 'safe' : 'landing'
    };
    
    // Send initial data
    VisitorAnalytics.transmitData(trackingData);
    
    // Send periodic updates
    setInterval(function() {
      const updatedData = {
        ...trackingData,
        behavior: {
          ...behaviorData,
          timeOnPage: Date.now() - visitorData.timestamp
        },
        timestamp: Date.now()
      };
      VisitorAnalytics.transmitData(updatedData);
    }, 30000); // Every 30 seconds
    
    // Send data on page unload
    window.addEventListener('beforeunload', function() {
      const finalData = {
        ...trackingData,
        behavior: {
          ...behaviorData,
          timeOnPage: Date.now() - visitorData.timestamp
        },
        event: 'page_unload'
      };
      VisitorAnalytics.sendBeacon(finalData);
    });
  }
  
  // Start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTracking);
  } else {
    initializeTracking();
  }
  
  // Debug logging
  if (config.debug) {
    console.log('Advanced visitor tracking initialized');
    console.log('Metrics endpoint:', config.metricsEndpoint);
  }
})();
`

  return new NextResponse(trackingScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
