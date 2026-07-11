// Global test setup for all tests
global.jQuery = jest.fn();
global.jQuery.fn = { owlCarousel: jest.fn() };

// Mock XMLHttpRequest
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  onload: null,
  onerror: null,
  status: 200,
  responseText: '{}'
}));

// Mock fetch if needed
global.fetch = jest.fn();

// Mock URL search params
global.URLSearchParams = jest.fn(function(search) {
  this.get = jest.fn(() => 'test-value');
});
