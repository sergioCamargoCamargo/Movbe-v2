'use client'

import { Building, Mail, MapPin, MessageSquare, Phone, Send, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import HeaderDynamic from '@/components/HeaderDynamic'
import { PageTransition } from '@/components/PageTransition'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import { emailService } from '@/lib/services/EmailService'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { ContactFormData } from '@/lib/types'

export default function ContactPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !userType || !subject || !message) {
      toast({
        title: t('contact.fieldsIncomplete'),
        description: t('contact.fillAllFields'),
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    const formData: ContactFormData = {
      name,
      email,
      userType,
      subject,
      message,
    }

    try {
      await emailService.sendContactEmail(formData)

      toast({
        title: t('contact.messageSent'),
        description: t('contact.messageSentDescription'),
      })

      setName('')
      setEmail('')
      setUserType('')
      setSubject('')
      setMessage('')
    } catch {
      toast({
        title: t('contact.error'),
        description: t('contact.errorSending'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 pt-16 sm:pt-20'>
          <Sidebar />
          <div className='flex-1 bg-gradient-to-br from-background via-background to-muted/30 p-3 sm:p-4 md:p-6 lg:p-8'>
            <div className='w-full max-w-6xl mx-auto px-2 sm:px-0 py-4'>
              <div className='mb-4 sm:mb-8 text-center'>
                <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2 sm:mb-4'>
                  {t('contact.title')}
                </h1>
                <p className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4'>
                  {t('contact.description')}
                </p>
              </div>

              <div className='space-y-4 sm:space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 mb-4 sm:mb-8'>
                {/* Información de contacto */}
                <div className='w-full lg:col-span-1 space-y-6 order-2 lg:order-1'>
                  <Card className='border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-xl'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                        {t('contact.contactInfo')}
                      </CardTitle>
                      <CardDescription>{t('contact.contactInfoDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <Mail className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>{t('contact.email')}</p>
                          <p className='text-sm text-muted-foreground'>contacto@movbe.com</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <Phone className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>{t('contact.phone')}</p>
                          <p className='text-sm text-muted-foreground'>+57 300 123 4567</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <MapPin className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>{t('contact.location')}</p>
                          <p className='text-sm text-muted-foreground'>Barranquilla, Colombia</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tipos de usuarios */}
                  <Card className='border-0 shadow-lg bg-gradient-to-br from-blue/5 to-blue/10'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-xl'>
                        <Users className='h-5 w-5 text-blue-600' />
                        {t('contact.userTypes')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-green-700'>{t('contact.normalUser')}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {t('contact.normalUserDescription')}
                        </p>
                      </div>

                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-purple-700'>
                          {t('contact.contentCreator')}
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          {t('contact.contentCreatorDescription')}
                        </p>
                      </div>

                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-orange-700'>
                          {t('contact.businessUser')}
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          {t('contact.businessUserDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Formulario de contacto */}
                <div className='w-full lg:col-span-2 order-1 lg:order-2'>
                  <Card className='border-0 shadow-xl w-full'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-xl sm:text-2xl'>
                        <Send className='h-6 w-6 text-primary' />
                        {t('contact.sendMessage')}
                      </CardTitle>
                      <CardDescription className='text-sm sm:text-base'>
                        {t('contact.formDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='p-4 sm:p-6'>
                      <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='name'>{t('contact.fullName')} *</Label>
                            <Input
                              id='name'
                              type='text'
                              placeholder={t('contact.fullNamePlaceholder')}
                              value={name}
                              onChange={e => setName(e.target.value)}
                              disabled={submitting}
                              className='h-11 text-sm'
                              required
                              aria-describedby='name-help'
                            />
                            <p id='name-help' className='text-xs text-muted-foreground'>
                              {t('contact.fullNameHelp')}
                            </p>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='email'>{t('contact.email')} *</Label>
                            <Input
                              id='email'
                              type='email'
                              placeholder={t('contact.emailPlaceholder')}
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              disabled={submitting}
                              className='h-11 text-sm'
                              required
                              aria-describedby='email-help'
                            />
                            <p id='email-help' className='text-xs text-muted-foreground'>
                              {t('contact.emailHelp')}
                            </p>
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='userType'>{t('contact.userType')} *</Label>
                          <Select
                            value={userType}
                            onValueChange={setUserType}
                            disabled={submitting}
                            required
                          >
                            <SelectTrigger
                              className='h-11 text-sm'
                              aria-describedby='usertype-help'
                            >
                              <SelectValue placeholder={t('contact.selectUserType')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='normal'>{t('contact.normalUser')}</SelectItem>
                              <SelectItem value='creator'>{t('contact.contentCreator')}</SelectItem>
                              <SelectItem value='business'>{t('contact.businessUser')}</SelectItem>
                              <SelectItem value='other'>{t('contact.other')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <p id='usertype-help' className='text-xs text-muted-foreground'>
                            {t('contact.userTypeHelp')}
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='subject'>{t('contact.subject')} *</Label>
                          <Input
                            id='subject'
                            type='text'
                            placeholder={t('contact.subjectPlaceholder')}
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            disabled={submitting}
                            className='h-11 text-sm'
                            required
                            aria-describedby='subject-help'
                          />
                          <p id='subject-help' className='text-xs text-muted-foreground'>
                            {t('contact.subjectHelp')}
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='message'>{t('contact.message')} *</Label>
                          <Textarea
                            id='message'
                            placeholder={t('contact.messagePlaceholder')}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={submitting}
                            rows={4}
                            className='min-h-[100px] text-sm resize-none'
                            required
                            aria-describedby='message-help'
                          />
                          <p id='message-help' className='text-xs text-muted-foreground'>
                            {t('contact.messageHelp')}
                          </p>
                        </div>

                        <div className='flex flex-col gap-4 pt-4'>
                          <Button
                            type='submit'
                            disabled={submitting}
                            className='w-full h-11 text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary'
                          >
                            {submitting ? (
                              <>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                                {t('contact.sending')}
                              </>
                            ) : (
                              <>
                                <Send className='h-4 w-4 mr-2' />
                                {t('contact.sendMessage')}
                              </>
                            )}
                          </Button>

                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                              setName('')
                              setEmail('')
                              setUserType('')
                              setSubject('')
                              setMessage('')
                            }}
                            disabled={submitting}
                            className='h-11 text-sm'
                          >
                            {t('contact.clear')}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Información adicional */}
              <Card className='border-0 shadow-lg bg-gradient-to-r from-muted/30 to-muted/10 w-full mt-4 sm:mt-8'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-xl'>
                    <Building className='h-5 w-5 text-primary' />
                    {t('contact.additionalInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold mb-2'>{t('contact.businessHours')}</h4>
                      <p className='text-sm text-muted-foreground mb-1'>
                        {t('contact.mondayToFriday')}
                      </p>
                      <p className='text-sm text-muted-foreground mb-1'>{t('contact.saturday')}</p>
                      <p className='text-sm text-muted-foreground'>{t('contact.sunday')}</p>
                    </div>

                    <div>
                      <h4 className='font-semibold mb-2'>{t('contact.responseTime')}</h4>
                      <p className='text-sm text-muted-foreground mb-1'>
                        {t('contact.generalQueries')}
                      </p>
                      <p className='text-sm text-muted-foreground mb-1'>
                        {t('contact.technicalSupport')}
                      </p>
                      <p className='text-sm text-muted-foreground'>{t('contact.emergencies')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
