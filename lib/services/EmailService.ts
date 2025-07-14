import emailjs from '@emailjs/browser'

import { ContactFormData, IEmailService } from '@/lib/interfaces'

export class EmailService implements IEmailService {
  private serviceId: string
  private templateId: string
  private publicKey: string

  constructor() {
    this.serviceId = EmailService.validateEnvVariable('NEXT_PUBLIC_EMAILJS_SERVICE_ID')
    this.templateId = EmailService.validateEnvVariable('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID')
    this.publicKey = EmailService.validateEnvVariable('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY')
  }

  private static validateEnvVariable(key: string): string {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Environment variable ${key} is missing or undefined.`)
    }
    return value
  }

  async sendContactEmail(data: ContactFormData): Promise<void> {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      user_type: data.userType,
      subject: data.subject,
      message: data.message,
    }

    try {
      await emailjs.send(this.serviceId, this.templateId, templateParams, this.publicKey)
    } catch {
      throw new Error('Error al enviar el email')
    }
  }
}

export const emailService = new EmailService()
