/**
 * Утилиты для отправки SMS через SMS.ru
 */

interface SMSResponse {
  status: 'OK' | 'ERROR'
  status_code: number
  sms?: {
    [key: string]: {
      status: string
      status_code: number
      sms_id: string
    }
  }
  balance?: number
}

/**
 * Отправка SMS через SMS.ru API
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SMS_RU_API_KEY

  // Если нет API ключа - выводим в консоль (для разработки)
  if (!apiKey) {
    console.log('📱 SMS (dev mode):')
    console.log(`   Телефон: ${phone}`)
    console.log(`   Сообщение: ${message}`)
    return { success: true }
  }

  try {
    // Форматируем номер телефона (удаляем все кроме цифр)
    const cleanPhone = phone.replace(/\D/g, '')

    const params = new URLSearchParams({
      api_id: apiKey,
      to: cleanPhone,
      msg: message,
      json: '1',
    })

    const response = await fetch(`https://sms.ru/sms/send?${params}`, {
      method: 'GET',
    })

    const data: SMSResponse = await response.json()

    if (data.status === 'OK') {
      return { success: true }
    } else {
      console.error('SMS.ru error:', data)
      return {
        success: false,
        error: 'Ошибка отправки SMS',
      }
    }
  } catch (error) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: 'Ошибка при отправке SMS',
    }
  }
}

/**
 * Отправка кода верификации по SMS
 */
export async function sendVerificationSMS(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Ваш код подтверждения: ${code}\n\nМойДокумент`
  return sendSMS(phone, message)
}
