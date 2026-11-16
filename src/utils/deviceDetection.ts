export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isChrome: boolean;
  isChromeDesktop: boolean;
  isChromeMobile: boolean;
  browserName: string;
  osName: string;
  badgeLabel: string;
  badgeIcon: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      isChrome: true,
      isChromeDesktop: true,
      isChromeMobile: false,
      browserName: 'Chrome',
      osName: 'Desktop',
      badgeLabel: 'Google Chrome Desktop',
      badgeIcon: '💻'
    };
  }

  const ua = navigator.userAgent || '';
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // OS Detection
  let osName = 'Unknown OS';
  if (/windows/i.test(ua)) osName = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/linux/i.test(ua)) osName = 'Linux';

  // Mobile & Tablet Detection
  const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|tablet|(android(?!.*mobile))/i;

  const isMobile = mobileRegex.test(ua) || (hasTouch && window.innerWidth <= 768);
  const isTablet = tabletRegex.test(ua) || (hasTouch && window.innerWidth > 768 && window.innerWidth <= 1024);
  const isDesktop = !isMobile && !isTablet;

  // Browser Detection
  const isEdge = /Edg\//i.test(ua);
  const isOpera = /OPR\//i.test(ua);
  const isBrave = (navigator as any).brave !== undefined;
  const isFirefox = /Firefox\//i.test(ua);
  const isSafari = /Safari\//i.test(ua) && !/Chrome\//i.test(ua) && !/Chromium\//i.test(ua);
  const isChromeCore = /Chrome\//i.test(ua) && !isEdge && !isOpera;

  let browserName = 'Browser';
  if (isBrave) browserName = 'Brave';
  else if (isEdge) browserName = 'Microsoft Edge';
  else if (isOpera) browserName = 'Opera';
  else if (isChromeCore) browserName = 'Google Chrome';
  else if (isFirefox) browserName = 'Mozilla Firefox';
  else if (isSafari) browserName = 'Apple Safari';

  const isChrome = isChromeCore;
  const isChromeDesktop = isChrome && isDesktop;
  const isChromeMobile = isChrome && (isMobile || isTablet);

  // Badge Display String
  let badgeLabel = `${browserName} (${osName})`;
  let badgeIcon = isDesktop ? '💻' : isTablet ? '📱' : '📱';

  if (isChromeDesktop) {
    badgeLabel = `Google Chrome Desktop (${osName})`;
    badgeIcon = '💻';
  } else if (isChromeMobile) {
    badgeLabel = `Google Chrome Mobile (${osName})`;
    badgeIcon = '📱';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: hasTouch,
    isChrome,
    isChromeDesktop,
    isChromeMobile,
    browserName,
    osName,
    badgeLabel,
    badgeIcon
  };
}

export async function toggleFullscreen(): Promise<boolean> {
  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return false;
      }
    }
  } catch (err) {
    console.warn('[Fullscreen] Request failed:', err);
  }
  return false;
}
