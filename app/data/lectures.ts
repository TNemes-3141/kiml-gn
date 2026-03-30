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
  title: string
  icon: string
  order: number
  semesterId: string
  unlockDateTime: Date
  materials: LectureMaterial[]
}

export function getLectureSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function getLectureDisplayTitle(lecture: Lecture): string {
  return `Lecture ${lecture.order} - ${lecture.title}`
}

export const semesters: Semester[] = [
  { id: 'SS2026', slug: 'sommersem-2026', displayName: 'Sommersem. 2026', isCurrent: true },
  { id: 'WS2025', slug: 'wintersem-2025', displayName: 'Wintersem. 2025', isCurrent: false }
]

export const lectures: Lecture[] = [
  {
    title: 'Lineare Regression, logistischer Fehler, Klassifikation',
    icon: 'i-lucide-chart-spline',
    order: 1,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-02-16'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/1' },
      { title: 'Ordinary Least Squares (OLS) Demo', link: 'https://example.com/ols-demo' },
      { title: 'Die Kostenfunktion (Animiertes GIF)', link: 'https://example.com/cost-function-gif' }
    ]
  },
  {
    title: 'Perzeptron, biologischer Hintergrund',
    icon: 'i-lucide-sprout',
    order: 2,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-01-23'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/2' }
    ]
  },
  {
    title: 'Neuronale Netzwerke, Backpropagation',
    icon: 'i-lucide-brain-circuit',
    order: 3,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-01-30'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/3' }
    ]
  },
  {
    title: 'Entscheidungsbume',
    icon: 'i-lucide-git-fork',
    order: 4,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-02-06'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/4' }
    ]
  },
  {
    title: 'Q-Learning',
    icon: 'i-lucide-swords',
    order: 5,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-02-13'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/5' }
    ]
  },
  {
    title: 'Clustering',
    icon: 'i-lucide-chart-scatter',
    order: 6,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-02-20'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/6' }
    ]
  },
  {
    title: 'Fundamentale Konzepte des ML',
    icon: 'i-lucide-chart-pie',
    order: 7,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-02-27'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/7' }
    ]
  },
  {
    title: 'Support Vector Machines',
    icon: 'i-lucide-fold-vertical',
    order: 8,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-03-04'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/8' }
    ]
  },
  {
    title: 'Convolutional Neural Networks',
    icon: 'i-lucide-scan-eye',
    order: 9,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-03-11'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/9' }
    ]
  },
  {
    title: 'Generative KI',
    icon: 'i-lucide-brush',
    order: 10,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-03-18'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/10' }
    ]
  },
  {
    title: 'Large Language Models',
    icon: 'i-lucide-message-square-text',
    order: 11,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-03-25'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/11' }
    ]
  },
  {
    title: 'Agenten, MCP/A2A',
    icon: 'i-lucide-bot',
    order: 12,
    semesterId: 'SS2026',
    unlockDateTime: new Date('2026-04-01'),
    materials: [
      { title: 'Slides', link: 'https://example.com/slides/12' }
    ]
  }
]
