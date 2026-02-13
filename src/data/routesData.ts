export const ACADEMY_DATA: Record<string, any[]> = {
  "Experto en Frontend": [
    {
      id: 'master-react-ventas',
      title: 'Máster en React y Sistemas de Ventas',
      description: 'Desde las bases de la web hasta sistemas profesionales con React 19 y Zustand.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      color: '#61dafb',
      // Mapeo: HTML/CSS(352), JS Master(353), React 19(374), Ventas(375), TanStack/Zustand(377), Inventarios(378)
      courseIds: [352, 353, 374, 375, 377, 378]
    }
  ],
  "Experto en Backend": [
    {
      id: 'backend-pro',
      title: 'Backend & Databases',
      description: 'Domina Node.js, Ruby on Rails y arquitecturas de bases de datos.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      color: '#4ade80',
      // Mapeo: NODE JS Cero(357), Ruby on Rails(363), PHP(366), SQL Cero(398), SQL Master(399), MongoDB(400)
      courseIds: [357, 363, 366, 398, 399, 400]
    }
  ],
  "Experto en Mobile": [
    {
      id: 'mobile-kotlin',
      title: 'Desarrollo Mobile Multiplataforma',
      description: 'Crea apps nativas con Kotlin y multiplataforma con Flutter y React Native.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      color: '#3ddc84',
      // Mapeo: Flutter Cero(388), Android Kotlin P1(391), Swift(389), React Native(394), App Android IA(397)
      courseIds: [388, 391, 389, 394, 397]
    }
  ],
  "Experto en DevOps": [
    {
      id: 'devops-infra',
      title: 'Infraestructura y Despliegue',
      description: 'Automatización con Docker, Terminal Linux y flujos de trabajo profesionales.',
      image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      color: '#6366f1',
      // Mapeo: GIT Cero(404), Terminal Linux(407), DOCKER(425), DEVOPS 1(426), DEVOPS 2(427), HOSTING(461)
      courseIds: [404, 407, 425, 426, 427, 461]
    }
  ],
  "Experto en Ciberseguridad": [
    {
      id: 'cyber-security',
      title: 'Hacking Ético y Ciberseguridad',
      description: 'Protección de sistemas, uso de Kali Linux y análisis forense digital.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      color: '#f87171',
      // Mapeo: LINUX DEBIAN(429), KALI LINUX(432), FORENSE DIGITAL(433), SQL Master(399)
      courseIds: [429, 432, 433, 399]
    }
  ],
  "Especialista en IA": [
    {
      id: 'ai-specialist',
      title: 'Inteligencia Artificial Aplicada',
      description: 'Aprende a desarrollar aplicaciones integrando modelos de IA y automatización.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      color: '#a855f7',
      // Mapeo: IA Completo(447), N8N Cero(448), DESARROLLO con IA(449), App con 3 IAs(450)
      courseIds: [447, 448, 449, 450]
    }
  ]
};