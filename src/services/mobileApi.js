/**
 * WebSocket client helper connecting to the C++ Crow backend at /ws.
 */
export function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export class MobileWebSocketClient {
  constructor(mobileId, onMessage, onStatusChange) {
    this.mobileId = mobileId || `MOBILE-${Math.floor(1000 + Math.random() * 9000)}`;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectTimer = null;
    this.currentNodeId = 1;
    this.isConnected = false;
  }

  connect() {
    try {
      const url = getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatusChange) this.onStatusChange('connected');
        this.register(this.currentNodeId);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error('[MobileWS] Failed to parse message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[MobileWS] Error:', err);
        if (this.onStatusChange) this.onStatusChange('error');
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onStatusChange) this.onStatusChange('disconnected');
        // Auto reconnect after 3 seconds
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };
    } catch (e) {
      console.warn('[MobileWS] Connection failed:', e);
      if (this.onStatusChange) this.onStatusChange('offline');
    }
  }

  register(nodeId = 1) {
    this.currentNodeId = nodeId;
    this.send({
      action: 'register',
      mobileId: this.mobileId,
      nodeId,
    });
  }

  requestRoute(startNodeId, destinationNodeId) {
    this.send({
      action: 'route',
      mobileId: this.mobileId,
      startNodeId,
      destinationNodeId,
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

export function getMobileUsers() {
  // Mobile users registered over WebSocket are tracked in state
  return Promise.resolve({
    success: true,
    activeMobiles: [],
  });
}

