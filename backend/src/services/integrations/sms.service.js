'use strict'

/**
 * SmsService — adapter for sending SMS notifications.
 *
 * Supports multiple template types.  In production, swap the MockDriver
 * for the real Aliyun / Tencent Cloud / Twilio SDK driver.
 *
 * Templates (keys used by callers):
 *   ORDER_PLACED         - Order created successfully
 *   ORDER_PAID           - Payment confirmed
 *   ORDER_SHIPPED        - Parcel dispatched with tracking number
 *   ORDER_DELIVERED      - Order delivered
 *   ORDER_CANCELLED      - Order cancelled
 *   REFUND_REQUESTED     - Refund request received
 *   REFUND_APPROVED      - Refund approved, processing
 *   REFUND_COMPLETED     - Refund funds returned
 *   REFUND_REJECTED      - Refund request rejected
 */

const TEMPLATES = {
  ORDER_PLACED:       '您的订单 {orderNo} 已创建，请在 {expireHours} 小时内完成支付。',
  ORDER_PAID:         '您的订单 {orderNo} 支付成功，金额 ¥{amount}，感谢您的购买！',
  ORDER_SHIPPED:      '您的订单 {orderNo} 已发货，快递单号 {trackingNo}，请注意查收。',
  ORDER_DELIVERED:    '您的订单 {orderNo} 已签收，感谢您的购买，祝您购物愉快！',
  ORDER_CANCELLED:    '您的订单 {orderNo} 已取消。',
  REFUND_REQUESTED:   '您的退款申请（订单 {orderNo}）已提交，我们将在 1-3 个工作日内处理。',
  REFUND_APPROVED:    '您的退款申请（订单 {orderNo}）已批准，退款 ¥{amount} 正在处理中。',
  REFUND_COMPLETED:   '您的退款（订单 {orderNo}）已完成，¥{amount} 将于 1-5 个工作日内到账。',
  REFUND_REJECTED:    '您的退款申请（订单 {orderNo}）已被拒绝，原因：{reason}。如有疑问请联系客服。',
}

// ── Driver implementations ────────────────────────────────────────────────────

class MockSmsDriver {
  async send(phone, message) {
    console.log(`[SMS Mock] To: ${phone} | Message: ${message}`)
    return { success: true, messageId: `mock_${Date.now()}` }
  }
}

class AliyunSmsDriver {
  async send(phone, message) {
    // In production: use aliyun-sdk or @alicloud/pop-core to send SMS
    // const client = new RPCClient({ ... })
    // await client.request('SendSms', { PhoneNumbers: phone, ... })
    console.log(`[Aliyun SMS] To: ${phone} | Message: ${message}`)
    return { success: true, messageId: `aliyun_${Date.now()}` }
  }
}

class TencentSmsDriver {
  async send(phone, message) {
    // In production: use tencentcloud-sdk-nodejs
    console.log(`[Tencent SMS] To: ${phone} | Message: ${message}`)
    return { success: true, messageId: `tencent_${Date.now()}` }
  }
}

// ── Service ──────────────────────────────────────────────────────────────────

class SmsService {
  constructor() {
    // Switch driver via SMS_DRIVER env var (default: mock)
    const driverName = (process.env.SMS_DRIVER || 'mock').toLowerCase()
    const drivers = {
      mock: new MockSmsDriver(),
      aliyun: new AliyunSmsDriver(),
      tencent: new TencentSmsDriver(),
    }
    this._driver = drivers[driverName] || drivers.mock
  }

  /**
   * Send a named template SMS.
   * @param {string} phone         - Phone number
   * @param {string} templateKey   - Key from TEMPLATES (e.g. 'ORDER_PAID')
   * @param {Object} variables     - Template variable substitutions
   * @returns {Promise<{ success: boolean, messageId: string }>}
   */
  async sendTemplate(phone, templateKey, variables = {}) {
    if (!phone) return { success: false, messageId: null }

    const tpl = TEMPLATES[templateKey]
    if (!tpl) {
      console.warn(`[SMS] Unknown template key: ${templateKey}`)
      return { success: false, messageId: null }
    }

    const message = tpl.replace(/\{(\w+)\}/g, (_, k) => variables[k] !== undefined ? variables[k] : `{${k}}`)

    try {
      return await this._driver.send(phone, message)
    } catch (err) {
      // SMS failures must not break the main order flow
      console.error('[SMS] Send failed:', err.message)
      return { success: false, messageId: null }
    }
  }
}

module.exports = new SmsService()
