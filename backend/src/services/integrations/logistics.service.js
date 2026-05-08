'use strict'

/**
 * LogisticsService — adapter for querying shipment tracking.
 *
 * In production, replace each driver with real carrier API calls
 * (e.g. SF Express, STO, YTO, EMS). The mock driver returns
 * realistic-looking data so the rest of the system can be built
 * and tested without a real carrier account.
 */

// ── Mock driver ──────────────────────────────────────────────────────────────

class MockCarrierDriver {
  constructor(name) {
    this.name = name
  }

  async queryTracking(trackingNo) {
    const now = new Date()
    const eta = new Date(now)
    eta.setDate(eta.getDate() + 1)
    return {
      carrier: this.name,
      trackingNo,
      status: 'in_transit',
      estimatedDelivery: eta.toISOString(),
      events: [
        { time: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(), location: '分拨中心', description: '包裹已到达分拨中心，正在分拣' },
        { time: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(), location: '揽收站', description: '快递员已揽收包裹' },
      ],
    }
  }
}

// ── Real driver stubs (replace with actual SDK calls) ────────────────────────

class SFExpressDriver {
  constructor() { this.name = 'SF Express' }
  async queryTracking(trackingNo) {
    // In production: POST https://bspgw.sf-express.com/std/service with trackingNo
    return new MockCarrierDriver(this.name).queryTracking(trackingNo)
  }
}

class YTODriver {
  constructor() { this.name = 'YTO Express' }
  async queryTracking(trackingNo) {
    // In production: call YTO OpenAPI
    return new MockCarrierDriver(this.name).queryTracking(trackingNo)
  }
}

class STODriver {
  constructor() { this.name = 'STO Express' }
  async queryTracking(trackingNo) {
    return new MockCarrierDriver(this.name).queryTracking(trackingNo)
  }
}

// ── Service ──────────────────────────────────────────────────────────────────

const DRIVERS = {
  sf: new SFExpressDriver(),
  yto: new YTODriver(),
  sto: new STODriver(),
  mock: new MockCarrierDriver('Mock Carrier'),
}

class LogisticsService {
  /**
   * Detect carrier from tracking number prefix and query tracking events.
   * @param {string} trackingNo
   * @param {string} [carrier]  - Optional explicit carrier code
   * @returns {Promise<Object>}
   */
  async queryTracking(trackingNo, carrier) {
    const code = carrier || this._detectCarrier(trackingNo)
    const driver = DRIVERS[code] || DRIVERS.mock
    return driver.queryTracking(trackingNo)
  }

  /** @private Naive prefix-based detection */
  _detectCarrier(trackingNo) {
    if (!trackingNo) return 'mock'
    const no = String(trackingNo).toUpperCase()
    if (no.startsWith('SF')) return 'sf'
    if (no.startsWith('YT')) return 'yto'
    if (no.startsWith('ST')) return 'sto'
    return 'mock'
  }

  getSupportedCarriers() {
    return Object.keys(DRIVERS).filter(k => k !== 'mock')
  }
}

module.exports = new LogisticsService()
