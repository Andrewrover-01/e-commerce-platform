'use strict'

/**
 * PaymentGatewayService — adapter pattern over third-party payment gateways.
 *
 * In production, replace each driver's `createOrder` / `verify` implementation
 * with the real SDK calls (e.g. alipay-sdk, wechatpay-axios-plugin).
 *
 * All public methods are async and return a normalised shape so callers are
 * decoupled from any specific gateway SDK.
 */

class AlipayDriver {
  async createOrder({ outTradeNo, totalAmount, subject }) {
    // In production: call AliPay openapi to get a pay URL / QR code.
    const url = new URL('https://openapi.alipay.com/gateway.do')
    url.searchParams.set('method', 'alipay.trade.page.pay')
    url.searchParams.set('out_trade_no', outTradeNo)
    url.searchParams.set('total_amount', totalAmount)
    url.searchParams.set('subject', subject)
    const payUrl = url.toString()
    return { payUrl, paymentToken: Buffer.from(`alipay:${outTradeNo}:${Date.now()}`).toString('base64') }
  }

  async verify(payload) {
    // In production: verify RSA signature from Alipay callback.
    return { valid: true, outTradeNo: payload.out_trade_no, status: payload.trade_status === 'TRADE_SUCCESS' ? 'success' : 'failed' }
  }

  async refund({ outTradeNo, refundAmount, reason }) {
    // In production: call alipay.trade.refund
    return { success: true, outTradeNo, refundAmount, reason }
  }
}

class WechatPayDriver {
  async createOrder({ outTradeNo, totalAmount, subject }) {
    // In production: call WeChatPay v3 API to get prepay_id.
    const prepayId = `wx${outTradeNo.slice(0, 12)}`
    return { prepayId, paymentToken: Buffer.from(`wechat:${outTradeNo}:${Date.now()}`).toString('base64') }
  }

  async verify(payload) {
    // In production: verify HMAC-SHA256 signature from WeChat callback.
    const status = payload.result_code === 'SUCCESS' ? 'success' : 'failed'
    return { valid: true, outTradeNo: payload.out_trade_no, status }
  }

  async refund({ outTradeNo, refundAmount, reason }) {
    // In production: call WeChatPay refund API
    return { success: true, outTradeNo, refundAmount, reason }
  }
}

class CreditCardDriver {
  async createOrder({ outTradeNo, totalAmount, subject }) {
    const sessionId = `cc_${outTradeNo}_${Date.now()}`
    return { sessionId, paymentToken: Buffer.from(`creditcard:${outTradeNo}:${Date.now()}`).toString('base64') }
  }

  async verify(payload) {
    const status = payload.status === 'succeeded' ? 'success' : 'failed'
    return { valid: true, outTradeNo: payload.metadata?.outTradeNo || '', status }
  }

  async refund({ outTradeNo, refundAmount, reason }) {
    return { success: true, outTradeNo, refundAmount, reason }
  }
}

const DRIVERS = {
  alipay: new AlipayDriver(),
  wechat: new WechatPayDriver(),
  creditcard: new CreditCardDriver(),
}

class PaymentGatewayService {
  /**
   * Create a payment order with the given gateway.
   * @param {string} method  - 'alipay' | 'wechat' | 'creditcard'
   * @param {{ outTradeNo: string, totalAmount: number, subject: string }} params
   * @returns {Promise<Object>}
   */
  async createOrder(method, params) {
    const driver = DRIVERS[method]
    if (!driver) throw new Error(`不支持的支付方式: ${method}`)
    return driver.createOrder(params)
  }

  /**
   * Verify a gateway payment callback.
   * @param {string} method
   * @param {Object} payload
   * @returns {Promise<{ valid: boolean, outTradeNo: string, status: 'success'|'failed' }>}
   */
  async verify(method, payload) {
    const driver = DRIVERS[method]
    if (!driver) return { valid: false, outTradeNo: '', status: 'failed' }
    return driver.verify(payload)
  }

  /**
   * Initiate a refund via gateway.
   * @param {string} method
   * @param {{ outTradeNo: string, refundAmount: number, reason: string }} params
   * @returns {Promise<Object>}
   */
  async refund(method, params) {
    const driver = DRIVERS[method]
    if (!driver) throw new Error(`不支持的支付方式: ${method}`)
    return driver.refund(params)
  }

  getSupportedMethods() {
    return Object.keys(DRIVERS)
  }
}

module.exports = new PaymentGatewayService()
