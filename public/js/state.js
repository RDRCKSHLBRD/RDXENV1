//state.js


// public/js/state.js

const State = {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
    device: 'desktop',
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  },
  user: {
    scrollTop: 0,
    scrollProgress: 0,
    activeClientId: null,
    lastClickedNavButton: null
  },
  app: {
    loading: false,
    error: null,
    lastAPIResponseTime: 0
  },

  updateViewport() {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.viewport.aspectRatio = window.innerWidth / window.innerHeight;
    this.viewport.device = getDeviceType(window.innerWidth);
    this.viewport.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },

  updateScroll(scrollTop, scrollHeight, clientHeight) {
    this.user.scrollTop = scrollTop;
    this.user.scrollProgress = (scrollTop / (scrollHeight - clientHeight)) * 100;
  },

  setActiveClient(clientId) {
    this.user.activeClientId = clientId;
  },

  recordLastNavClick(clientId) {
    this.user.lastClickedNavButton = clientId;
  },

  setLoading(isLoading) {
    this.app.loading = isLoading;
  },

  setError(errorMessage) {
    this.app.error = errorMessage;
  },

  setLastAPIResponseTime(timeMs) {
    this.app.lastAPIResponseTime = timeMs;
  }
};

function getDeviceType(width) {
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  return 'desktop';
}

// Window listeners
window.addEventListener('resize', () => {
  State.updateViewport();
  console.log('[State] Viewport updated:', State.viewport);
});

window.addEventListener('scroll', () => {
  State.updateScroll(
    document.documentElement.scrollTop || document.body.scrollTop,
    document.documentElement.scrollHeight || document.body.scrollHeight,
    document.documentElement.clientHeight || window.innerHeight
  );
});

window.RDXENV = window.RDXENV || {};
window.RDXENV.State = State;