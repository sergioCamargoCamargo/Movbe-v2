export interface ContactFormData {
  name: string
  email: string
  userType: string
  subject: string
  message: string
}

export interface IEmailService {
  sendContactEmail(data: ContactFormData): Promise<void>
}
