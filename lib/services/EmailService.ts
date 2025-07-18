import emailjs from '@emailjs/browser'

import { ContactFormData, IEmailService } from '@/lib/types'

export class EmailService implements IEmailService {
  private serviceId: string
  private templateId: string
  private publicKey: string

  constructor() {
    this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
    this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
    this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
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
