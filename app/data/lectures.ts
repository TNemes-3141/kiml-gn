export interface Semester {
  id: string
  slug: string
  displayName: string
  isCurrent: boolean
}

export interface LectureMaterial {
  title: string
  link: string
}

export interface Lecture {
  slug: string
  title: string
  subtitle?: string
  icon: string
  order: number
  semesterId: string
  materials: LectureMaterial[]
}

export const semesters: Semester[] = [
  { id: 'SS2026', slug: 'sommersem-2026', displayName: 'Sommersem. 2026', isCurrent: true },
  { id: 'WS2025', slug: 'wintersem-2025', displayName: 'Wintersem. 2025', isCurrent: false }
]

export const lectures: Lecture[] = [
  {
    slug: 'lineare-regression-logistischer-fehler-klassifikation',
    title: 'Lecture 1 - Lineare Regression, logistischer Fehler, Klassifikation',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-chart-spline',
    order: 1,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/1' },
      { title: 'Ordinary Least Squares (OLS) Demo', link: 'https://example.com/ols-demo' },
      { title: 'Die Kostenfunktion (Animiertes GIF)', link: 'https://example.com/cost-function-gif' }
    ]
  },
  {
    slug: 'perzeptron-biologischer-hintergrund',
    title: 'Lecture 2 - Perzeptron, biologischer Hintergrund',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-sprout',
    order: 2,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/2' }
    ]
  },
  {
    slug: 'neuronale-netzwerke-backpropagation',
    title: 'Lecture 3 - Neuronale Netzwerke, Backpropagation',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-brain-circuit',
    order: 3,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/3' }
    ]
  },
  {
    slug: 'entscheidungsbaeume',
    title: 'Lecture 4 - Entscheidungsbäume',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-git-fork',
    order: 4,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/4' }
    ]
  },
  {
    slug: 'q-learning',
    title: 'Lecture 5 - Q-Learning',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-swords',
    order: 5,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/5' }
    ]
  },
  {
    slug: 'clustering',
    title: 'Lecture 6 - Clustering',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-chart-scatter',
    order: 6,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/6' }
    ]
  },
  {
    slug: 'fundamentale-konzepte-des-ml',
    title: 'Lecture 7 - Fundamentale Konzepte des ML',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-chart-pie',
    order: 7,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/7' }
    ]
  },
  {
    slug: 'support-vector-machines',
    title: 'Lecture 8 - Support Vector Machines',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-fold-vertical',
    order: 8,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/8' }
    ]
  },
  {
    slug: 'convolutional-neural-networks',
    title: 'Lecture 9 - Convolutional Neural Networks',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-scan-eye',
    order: 9,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/9' }
    ]
  },
  {
    slug: 'generative-ki',
    title: 'Lecture 10 - Generative KI',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-brush',
    order: 10,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/10' }
    ]
  },
  {
    slug: 'large-language-models',
    title: 'Lecture 11 - Large Language Models',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-message-square-text',
    order: 11,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/11' }
    ]
  },
  {
    slug: 'agenten-mcp-a2a',
    title: 'Lecture 12 - Agenten, MCP/A2A',
    subtitle: 'Sommersem. 2026',
    icon: 'i-lucide-bot',
    order: 12,
    semesterId: 'SS2026',
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/12' }
    ]
  }
]
