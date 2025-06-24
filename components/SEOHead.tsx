import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'video.other'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  siteName?: string
  locale?: string
  noIndex?: boolean
}

export function SEOHead({
  title = 'MOBVE - Plataforma de Videos para Creadores',
  description = 'MOBVE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
  keywords = ['videos', 'streaming', 'creadores', 'contenido', 'entertainment', 'MOBVE'],
  image = '/og-image.jpg',
  url = 'https://mobve.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'MOBVE',
  siteName = 'MOBVE',
  locale = 'es_CO',
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes('MOBVE') ? title : `${title} | MOBVE`
  const keywordsString = keywords.join(', ')

  return (
    <Head>
      {/* Metadatos básicos */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywordsString} />
      <meta name='author' content={author} />
      <meta name='language' content='es' />
      <meta name='robots' content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:url' content={url} />
      <meta property='og:site_name' content={siteName} />
      <meta property='og:locale' content={locale} />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:site' content='@MOBVE' />
      <meta name='twitter:creator' content='@MOBVE' />

      {/* Fechas de artículo/video */}
      {publishedTime && <meta property='article:published_time' content={publishedTime} />}
      {modifiedTime && <meta property='article:modified_time' content={modifiedTime} />}

      {/* Links canónicos y alternativos */}
      <link rel='canonical' href={url} />
      <link rel='alternate' hrefLang='es' href={url} />
      <link rel='alternate' hrefLang='es-co' href={url} />
      <link rel='alternate' hrefLang='x-default' href={url} />

      {/* Favicon y iconos */}
      <link rel='icon' type='image/x-icon' href='/favicon.ico' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='manifest' href='/site.webmanifest' />
      <meta name='theme-color' content='#1a1a1a' />
      <meta name='msapplication-TileColor' content='#1a1a1a' />

      {/* Metadatos de aplicación web */}
      <meta name='application-name' content='MOBVE' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content='MOBVE' />
      <meta name='format-detection' content='telephone=no' />
      <meta name='mobile-web-app-capable' content='yes' />

      {/* Datos estructurados básicos */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            description: description,
            url: url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${url}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
            publisher: {
              '@type': 'Organization',
              name: siteName,
              logo: {
                '@type': 'ImageObject',
                url: `${url}/logo.png`,
              },
            },
          }),
        }}
      />
    </Head>
  )
}

// Componente específico para páginas de video
export function VideoSEOHead({
  videoTitle,
  videoDescription,
  videoUrl,
  thumbnailUrl,
  duration,
  uploadDate,
  creator,
  viewCount,
  interactionCount: _interactionCount,
  embedUrl,
  ...props
}: SEOHeadProps & {
  videoTitle: string
  videoDescription: string
  videoUrl: string
  thumbnailUrl: string
  duration?: string
  uploadDate?: string
  creator?: string
  viewCount?: number
  interactionCount?: number
  embedUrl?: string
}) {
  return (
    <>
      <SEOHead
        title={videoTitle}
        description={videoDescription}
        image={thumbnailUrl}
        type='video.other'
        publishedTime={uploadDate}
        author={creator}
        {...props}
      />

      <Head>
        {/* Metadatos específicos de video */}
        <meta property='og:video' content={videoUrl} />
        <meta property='og:video:secure_url' content={videoUrl} />
        <meta property='og:video:type' content='video/mp4' />
        <meta property='og:video:width' content='1280' />
        <meta property='og:video:height' content='720' />
        {duration && <meta property='video:duration' content={duration} />}
        {creator && <meta property='video:director' content={creator} />}

        {/* Twitter Player Card */}
        {embedUrl && (
          <>
            <meta name='twitter:card' content='player' />
            <meta name='twitter:player' content={embedUrl} />
            <meta name='twitter:player:width' content='1280' />
            <meta name='twitter:player:height' content='720' />
          </>
        )}

        {/* Datos estructurados para video */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: videoTitle,
              description: videoDescription,
              thumbnailUrl: thumbnailUrl,
              uploadDate: uploadDate,
              duration: duration,
              contentUrl: videoUrl,
              embedUrl: embedUrl,
              ...(creator && {
                author: {
                  '@type': 'Person',
                  name: creator,
                },
              }),
              ...(viewCount && {
                interactionStatistic: {
                  '@type': 'InteractionCounter',
                  interactionType: { '@type': 'WatchAction' },
                  userInteractionCount: viewCount,
                },
              }),
              publisher: {
                '@type': 'Organization',
                name: 'MOBVE',
                logo: {
                  '@type': 'ImageObject',
                  url: '/logo.png',
                },
              },
            }),
          }}
        />
      </Head>
    </>
  )
}

// Componente para páginas de perfil/creador
export function ProfileSEOHead({
  creatorName,
  creatorBio,
  profileImage,
  subscriberCount,
  videoCount: _videoCount,
  ...props
}: SEOHeadProps & {
  creatorName: string
  creatorBio: string
  profileImage: string
  subscriberCount?: number
  videoCount?: number
}) {
  return (
    <>
      <SEOHead
        title={`${creatorName} - Creador en MOBVE`}
        description={creatorBio}
        image={profileImage}
        type='website'
        author={creatorName}
        {...props}
      />

      <Head>
        {/* Datos estructurados para perfil */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: creatorName,
              description: creatorBio,
              image: profileImage,
              ...(subscriberCount && {
                interactionStatistic: {
                  '@type': 'InteractionCounter',
                  interactionType: { '@type': 'SubscribeAction' },
                  userInteractionCount: subscriberCount,
                },
              }),
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': props.url,
              },
            }),
          }}
        />
      </Head>
    </>
  )
}
