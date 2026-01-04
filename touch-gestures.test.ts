import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define interface for testing environment
interface MockTouch {
  identifier: number;
  target: EventTarget; // Global EventTarget API available in jsdom
  clientX: number;
  clientY: number;
}

// Mock browser APIs for testing environment
Object.defineProperty(window, 'Touch', {
  writable: true,
  value: class implements MockTouch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    
    constructor(init: MockTouch) {
      this.identifier = init.identifier;
      this.target = init.target;
      this.clientX = init.clientX;
      this.clientY = init.clientY;
    }
  }
});

Object.defineProperty(window, 'TouchEvent', {
  writable: true,
  value: class {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    touches: MockTouch[];
    
    constructor(type: string, init?: {
      bubbles?: boolean;
      cancelable?: boolean;
      touches?: MockTouch[];
    }) {
      this.type = type;
      this.bubbles = init?.bubbles ?? false;
      this.cancelable = init?.cancelable ?? false;
      this.touches = init?.touches ?? [];
    }
  }
});

Object.defineProperty(window, 'MouseEvent', {
  writable: true,
  value: class {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    clientX: number;
    clientY: number;
    
    constructor(type: string, init?: {
      bubbles?: boolean;
      cancelable?: boolean;
      clientX?: number;
      clientY?: number;
    }) {
      this.type = type;
      this.bubbles = init?.bubbles ?? false;
      this.cancelable = init?.cancelable ?? false;
      this.clientX = init?.clientX ?? 0;
      this.clientY = init?.clientY ?? 0;
    }
  }
});

describe('Touch gesture utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should simulate touch start event', () => {
    const mockElement = document.createElement('div');
    
    const touchStart = new (window.TouchEvent)('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [new Touch({
        identifier: 1,
        target: mockElement,
        clientX: 0,
        clientY: 0
      })]
    });
    
    expect(touchStart.type).toBe('touchstart');
    expect(touchStart.touches.length).toBe(1);
  });

  it('should simulate touch move event', () => {
    const mockElement = document.createElement('div');
    
    const touchMove = new (window.TouchEvent)('touchmove', {
      bubbles: true,
      cancelable: true,
      touches: [new (window.Touch)({
        identifier: 1,
        target: mockElement,
        clientX: 10,
        clientY: 10
      })]
    });
    
    expect(touchMove.type).toBe('touchmove');
    expect(touchMove.touches.length).toBe(1);
  });

  it('should simulate touch end event', () => {
    const touchEnd = new (window.TouchEvent)('touchend', {
      bubbles: true,
      cancelable: true,
      touches: []
    });
    
    expect(touchEnd.type).toBe('touchend');
    expect(touchEnd.touches.length).toBe(0);
  });

  it('should handle mouse events as fallback', () => {
    const mockElement = document.createElement('div');
    const mockCallback = vi.fn();
    
    mockElement.addEventListener('mousedown', mockCallback);
    
    // Use native browser MouseEvent which should work in jsdom
    const event = new Event('mousedown', { bubbles: true, cancelable: true });
    
    mockElement.dispatchEvent(event);
    
    expect(mockCallback).toHaveBeenCalled();
  });
});