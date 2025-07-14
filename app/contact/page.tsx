'use client'

import { Building, Mail, MapPin, MessageSquare, Phone, Send, Users } from 'lucide-react'
import { useState } from 'react'

import HeaderDynamic from '@/app/components/HeaderDynamic'
import Sidebar from '@/app/components/Sidebar'
import { PageTransition } from '@/components/PageTransition'
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
import { useToast } from '@/hooks/use-toast'
import { ContactFormData } from '@/lib/interfaces'
import { emailService } from '@/lib/services/EmailService'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

export default function ContactPage() {
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
        title: 'Campos incompletos',
        description: 'Por favor, completa todos los campos del formulario.',
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
        title: 'Mensaje enviado',
        description: 'Gracias por contactarnos. Te responderemos pronto.',
      })

      setName('')
      setEmail('')
      setUserType('')
      setSubject('')
      setMessage('')
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje.',
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
          <div className='flex-1 bg-gradient-to-br from-background via-background to-muted/30 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto md:h-auto mobile-scroll-container ios-scroll-fix'>
            <div className='w-full max-w-6xl mx-auto px-2 sm:px-0 py-4'>
              <div className='mb-4 sm:mb-8 text-center'>
                <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2 sm:mb-4'>
                  Contáctanos
                </h1>
                <p className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4'>
                  Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta
                  o soporte.
                </p>
              </div>

              <div className='space-y-4 sm:space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 mb-4 sm:mb-8'>
                {/* Información de contacto */}
                <div className='w-full lg:col-span-1 space-y-6 order-2 lg:order-1'>
                  <Card className='border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10'>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-xl'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                        Información de Contacto
                      </CardTitle>
                      <CardDescription>
                        Múltiples formas de comunicarte con nosotros
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <Mail className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>Email</p>
                          <p className='text-sm text-muted-foreground'>contacto@mobve.com</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <Phone className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>Teléfono</p>
                          <p className='text-sm text-muted-foreground'>+57 300 123 4567</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-3 bg-background/50 rounded-lg'>
                        <MapPin className='h-5 w-5 text-primary' />
                        <div>
                          <p className='font-semibold'>Ubicación</p>
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
                        Tipos de Usuario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-green-700'>Usuario Normal</h4>
                        <p className='text-sm text-muted-foreground'>
                          Acceso a videos y contenido destacado
                        </p>
                      </div>

                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-purple-700'>Creador de Contenido</h4>
                        <p className='text-sm text-muted-foreground'>
                          Publica videos sin restricciones
                        </p>
                      </div>

                      <div className='p-3 bg-background/50 rounded-lg'>
                        <h4 className='font-semibold text-orange-700'>Usuario Pautas</h4>
                        <p className='text-sm text-muted-foreground'>Empresas y publicidad</p>
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
                        Envíanos un Mensaje
                      </CardTitle>
                      <CardDescription className='text-sm sm:text-base'>
                        Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='p-4 sm:p-6'>
                      <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='name'>Nombre completo *</Label>
                            <Input
                              id='name'
                              type='text'
                              placeholder='Tu nombre'
                              value={name}
                              onChange={e => setName(e.target.value)}
                              disabled={submitting}
                              className='h-11 text-sm'
                              required
                              aria-describedby='name-help'
                            />
                            <p id='name-help' className='text-xs text-muted-foreground'>
                              Ingresa tu nombre real para una mejor comunicación
                            </p>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='email'>Correo electrónico *</Label>
                            <Input
                              id='email'
                              type='email'
                              placeholder='email@ejemplo.com'
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              disabled={submitting}
                              className='h-11 text-sm'
                              required
                              aria-describedby='email-help'
                            />
                            <p id='email-help' className='text-xs text-muted-foreground'>
                              Te responderemos a esta dirección
                            </p>
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='userType'>Tipo de usuario *</Label>
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
                              <SelectValue placeholder='Selecciona tu tipo de usuario' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='normal'>Usuario Normal</SelectItem>
                              <SelectItem value='creator'>Creador de Contenido</SelectItem>
                              <SelectItem value='business'>Usuario Pautas/Empresa</SelectItem>
                              <SelectItem value='other'>Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <p id='usertype-help' className='text-xs text-muted-foreground'>
                            Esto nos ayuda a dirigir tu consulta al equipo correcto
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='subject'>Asunto *</Label>
                          <Input
                            id='subject'
                            type='text'
                            placeholder='Asunto de tu consulta'
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            disabled={submitting}
                            className='h-11 text-sm'
                            required
                            aria-describedby='subject-help'
                          />
                          <p id='subject-help' className='text-xs text-muted-foreground'>
                            Un resumen corto de tu mensaje
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='message'>Mensaje *</Label>
                          <Textarea
                            id='message'
                            placeholder='Describe tu consulta...'
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={submitting}
                            rows={4}
                            className='min-h-[100px] text-sm resize-none'
                            required
                            aria-describedby='message-help'
                          />
                          <p id='message-help' className='text-xs text-muted-foreground'>
                            Proporciona todos los detalles relevantes para ayudarte mejor
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
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Send className='h-4 w-4 mr-2' />
                                Enviar Mensaje
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
                            Limpiar
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
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold mb-2'>Horarios de Atención</h4>
                      <p className='text-sm text-muted-foreground mb-1'>
                        Lunes a Viernes: 8:00 AM - 6:00 PM
                      </p>
                      <p className='text-sm text-muted-foreground mb-1'>
                        Sábados: 9:00 AM - 2:00 PM
                      </p>
                      <p className='text-sm text-muted-foreground'>Domingos: Cerrado</p>
                    </div>

                    <div>
                      <h4 className='font-semibold mb-2'>Tiempo de Respuesta</h4>
                      <p className='text-sm text-muted-foreground mb-1'>
                        Consultas generales: 24-48 horas
                      </p>
                      <p className='text-sm text-muted-foreground mb-1'>
                        Soporte técnico: 12-24 horas
                      </p>
                      <p className='text-sm text-muted-foreground'>Emergencias: Inmediato</p>
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
