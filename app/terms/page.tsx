'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className='min-h-screen bg-muted/50 p-4 relative overflow-y-auto mobile-scroll-container ios-scroll-fix'>
      {/* Logo - top left */}
      <Link href='/' className='absolute top-4 left-4 z-10'>
        <Image
          src='/logo_black.png'
          alt='Movbe'
          width={100}
          height={32}
          className='dark:hidden w-24 h-auto'
        />
        <Image
          src='/logo_white.png'
          alt='Movbe'
          width={100}
          height={32}
          className='hidden dark:block w-24 h-auto'
        />
      </Link>

      <div className='max-w-4xl mx-auto'>
        <Card className='relative mt-16'>
          {/* Back arrow - top left of card */}
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-4 left-4 z-10'
            onClick={() => router.back()}
          >
            <ArrowLeft className='h-6 w-6' />
          </Button>

          <CardHeader className='pt-12 text-center'>
            <CardTitle className='text-2xl sm:text-3xl'>Términos y Condiciones</CardTitle>
            <p className='text-muted-foreground'>
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </CardHeader>

          <CardContent className='space-y-6 text-sm sm:text-base'>
            <section>
              <h2 className='text-xl font-semibold mb-3'>1. Aceptación de los Términos</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Al acceder y utilizar Movbe, usted acepta estar sujeto a estos Términos y
                Condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no
                debe utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>2. Descripción del Servicio</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe es una plataforma de compartición de videos que permite a los usuarios cargar,
                ver, compartir y comentar contenido de video. Nos reservamos el derecho de modificar
                o discontinuar el servicio en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>3. Registro de Cuenta</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>
                  Para utilizar ciertas funciones del servicio, debe registrar una cuenta. Al
                  registrarse, usted se compromete a:
                </p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Proporcionar información precisa y completa</li>
                  <li>Mantener la seguridad de su contraseña</li>
                  <li>Actualizar su información cuando sea necesario</li>
                  <li>Ser responsable de toda actividad en su cuenta</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>4. Contenido del Usuario</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>Al cargar contenido a Movbe, usted declara que:</p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Es el propietario del contenido o tiene los derechos necesarios</li>
                  <li>El contenido no infringe derechos de terceros</li>
                  <li>El contenido cumple con nuestras políticas comunitarias</li>
                  <li>No contiene material ilegal, difamatorio o dañino</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>5. Conducta Prohibida</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>Los usuarios no pueden:</p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Cargar contenido que viole derechos de autor</li>
                  <li>Acosar, intimidar o amenazar a otros usuarios</li>
                  <li>Usar el servicio para actividades ilegales</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                  <li>Distribuir virus o código malicioso</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>6. Privacidad</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Su privacidad es importante para nosotros. Recopilamos y utilizamos su información
                personal de acuerdo con nuestra Política de Privacidad, que forma parte integral de
                estos términos.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>7. Propiedad Intelectual</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe y su contenido original, características y funcionalidad son propiedad de
                Movbe y están protegidos por derechos de autor, marcas comerciales y otras leyes de
                propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>8. Limitación de Responsabilidad</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe no será responsable por daños indirectos, incidentales, especiales o
                consecuentes que resulten del uso o la imposibilidad de usar el servicio, incluso si
                hemos sido advertidos de la posibilidad de tales daños.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>9. Modificaciones</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las
                modificaciones serán efectivas inmediatamente después de su publicación. Su uso
                continuado del servicio constituye su aceptación de los términos modificados.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>10. Contacto</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:
                <br />
                <span className='font-medium'>Email:</span> legal@movbe.com
                <br />
                <span className='font-medium'>Teléfono:</span> +1 (555) 123-4567
              </p>
            </section>

            <div className='pt-6 border-t'>
              <p className='text-center text-xs text-muted-foreground'>
                © 2024 Movbe. Todos los derechos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
