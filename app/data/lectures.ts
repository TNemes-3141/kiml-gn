export interface Semester {
  id: string
  displayName: string
  passingThreshold: number
  startDate: string
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
  return `Einheit ${lecture.order}: ${lecture.title}`
}

/**
 * Returns only lectures whose semesterId exists in the provided semesters list.
 * Logs a console.error for any lecture referencing an unknown semester.
 */
export function getValidatedLectures(semesters: Semester[]): Lecture[] {
  const validIds = new Set(semesters.map(s => s.id))
  return lectures.filter((lecture) => {
    if (validIds.has(lecture.semesterId)) return true
    console.error(
      `[lectures] CRITICAL: Lecture "${lecture.title}" references unknown semester "${lecture.semesterId}"; excluded from display`
    )
    return false
  })
}

export const lectures: Lecture[] = [
  {
    title: 'Einstieg',
    icon: 'i-lucide-info',
    order: 1,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-04-09'),
    materials: [
      { title: 'The map of artificial intelligence', link: 'http://medium.com/swlh/the-map-of-artificial-intelligence-2020-2c4f446f4e43' },
      { title: 'Eine kurze Geschichte der KI', link: 'https://mebis.bycs.de/beitrag/ki-geschichte-der-ki' },
      { title: 'KI-"Chatbot" ELIZA', link: 'https://anthay.github.io/eliza.html' }
    ]
  },
  {
    title: 'Biologischer Hintergrund, Lineare Regression, Perzeptron',
    icon: 'i-lucide-sprout',
    order: 2,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-04-16'),
    materials: [
      { title: 'Synaptische Plastizität (Video)', link: 'https://www.youtube.com/watch?v=EGKTH60rvoU' },
      { title: 'Lineare Regression (Demo)', link: 'https://www.desmos.com/calculator/uhrhuaxu3m' },
      { title: 'Die Kostenfunktion (Animation)', link: 'https://gifyu.com/image/SGlgS' },
      { title: 'Demonstration des Mark I Perzeptron', link: 'https://www.youtube.com/watch?v=cNxadbrN_aI' },
      { title: 'Mitmachübung: Interaktives Modell eines Perzeptrons', link: 'https://tnemes-3141.github.io/perzeptron-demo/' },
      { title: 'Datensatz: Hintergrund- und Schriftfarben (Demo)', link: 'https://www.desmos.com/3d/hasp8zptfn' }
    ]
  },
  {
    title: 'Neuronale Netzwerke, Backpropagation',
    icon: 'i-lucide-brain-circuit',
    order: 3,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-04-23'),
    materials: [
    ]
  },
  {
    title: 'Logistischer Fehler, Klassifikation, SVMs',
    icon: 'i-lucide-fold-vertical',
    order: 4,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-04-30'),
    materials: [
    ]
  },
  {
    title: 'Clustering, K-means',
    icon: 'i-lucide-chart-scatter',
    order: 5,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-05-07'),
    materials: [
    ]
  },
  {
    title: 'Entscheidungsbäume, ID3, CART',
    icon: 'i-lucide-git-fork',
    order: 6,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-05-21'),
    materials: [
    ]
  },
  {
    title: 'Q-Learning, Reinforcement Learning',
    icon: 'i-lucide-swords',
    order: 7,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-05-28'),
    materials: [
    ]
  },
  {
    title: 'Fundamentale Konzepte des ML',
    icon: 'i-lucide-chart-pie',
    order: 8,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-06-04'),
    materials: [
    ]
  },
  {
    title: 'Convolutional Neural Networks',
    icon: 'i-lucide-scan-eye',
    order: 9,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-06-11'),
    materials: [
    ]
  },
  {
    title: 'Object detection, Segmentation',
    icon: 'i-lucide-image',
    order: 10,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-06-18'),
    materials: [
    ]
  },
  {
    title: 'Generative KI, Large Language Models',
    icon: 'i-lucide-brush',
    order: 11,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-06-25'),
    materials: [
    ]
  },
  {
    title: 'Agenten, MCP/A2A',
    icon: 'i-lucide-bot',
    order: 12,
    semesterId: 'ss2026',
    unlockDateTime: new Date('2026-07-02'),
    materials: [
    ]
  },
  {
    title: 'Biologischer Hintergrund, Perzeptron',
    icon: 'i-lucide-sprout',
    order: 1,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Ordinary Least Squares (OLS) Demo', link: 'https://www.desmos.com/calculator/r9fm4syebi?lang=de' },
      { title: 'Die Kostenfunktion (Animiertes GIF)', link: 'https://gifyu.com/image/SGlgS' },
      { title: 'Mitmachübung: Interaktives Modell eines Perzeptrons', link: 'https://tnemes-3141.github.io/perzeptron-demo/' }
    ]
  },
  {
    title: 'Aktivierung, Neuronale Netzwerke, Backpropagation',
    icon: 'i-lucide-brain-circuit',
    order: 2,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Sigmoid vs. ReLU Demo', link: 'https://www.desmos.com/calculator/lz8h2iejdx' },
      { title: 'Gradient descent (Animiertes GIF)', link: 'https://gifyu.com/image/SGlg6' },
      { title: 'Mitmachübung: Trainieren eines neuronalen Netzwerks', link: 'https://colab.research.google.com/drive/1HVMc-fIU4gWD0SiswDBzVSRafJzcFyaX?usp=sharing' },
      { title: 'Neural Networks (Videoreihe) von 3Blue1Brown', link: 'https://www.youtube.com/playlist?list=PLgxo3DDiqnvAmMOTzZbgD9d4gtQ9V7Lig' },
    ]
  },
  {
    title: 'Entscheidungsbäume, ID3/CART, Q-Learning',
    icon: 'i-lucide-git-fork',
    order: 3,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Splitting in Decision Trees (Animiertes GIF)', link: 'https://gifyu.com/image/SGl4j' },
      { title: 'Demo für DTL-Komplexität', link: 'https://www.desmos.com/calculator/wlt2aaf15m' },
      { title: 'Flappy Bird-Spielumgebung (Animiertes GIF)', link: 'https://gifyu.com/image/SGl4r' },
      { title: 'Mitmachübung: Frozen Lake-Game', link: 'https://tnemes-3141.github.io/q-learning-demo/' },
    ]
  },
  {
    title: 'SVMs, Clustering, Fundamentale Konzepte des ML',
    icon: 'i-lucide-chart-scatter',
    order: 4,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Support Vector Machines (SVMs) zum Ausprobieren', link: 'https://greitemann.dev/svm-demo' },
      { title: 'Visualisierung k-nearest neighbors (Animiertes GIF)', link: 'https://gifyu.com/image/SGnbt' },
      { title: 'K-means Clustering zum Ausprobieren', link: 'http://alekseynp.com/viz/k-means.html' },
      { title: 'Mitmachübung: Vor- und Nachbereitung eines Datensatzes', link: 'https://colab.research.google.com/drive/1-z1cXOFJMKlvTEWs3W7jldfNBNSFuKMA?usp=sharing' },
    ]
  },
  {
    title: 'Convolutional Neural Networks',
    icon: 'i-lucide-scan-eye',
    order: 5,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Fashion-MNIST Inspektor', link: 'https://huggingface.co/datasets/zalando-datasets/fashion_mnist/viewer' },
      { title: 'Kernels zum Ausprobieren', link: 'https://editor.p5js.org/MaschinenNah/full/PZYCjAsie' },
      { title: 'CNN Explainer', link: 'https://poloclub.github.io/cnn-explainer/' },
    ]
  },
  {
    title: 'Generative KI, Large Language Models',
    icon: 'i-lucide-brush',
    order: 6,
    semesterId: 'ss2025',
    unlockDateTime: new Date('2025-01-01'),
    materials: [
      { title: 'Image-2-Image Demo', link: 'https://affinelayer.com/pixsrv/index.html' },
      { title: 'Fooocus (Open source-Bildgenerator): GitHub-Repo', link: 'https://github.com/lllyasviel/Fooocus' },
      { title: 'Fooocus (Open source-Bildgenerator): HuggingFace-Modell', link: 'https://huggingface.co/RunDiffusion/Juggernaut-XL-v9' },
      { title: 'Fooocus (Open source-Bildgenerator): CivitAI-Seite', link: 'https://civitai.com/models/133005/juggernaut-xl' },
      { title: 'Attention und Transformers (Videoreihe) von StatQuest', link: 'https://www.youtube.com/watch?v=PSs6nxngL6k&list=PLgxo3DDiqnvA72eCg3Feqn0D7ooEu1lgB&index=3' },
      { title: 'Attention und Transformers (Videoreihe) von 3Blue1Brown', link: 'https://www.youtube.com/watch?v=wjZofJX0v4M&list=PLgxo3DDiqnvCozXT5wbttuszwPV0CdF8d&index=1' },
      { title: 'Machine Learning-Glossar', link: 'https://developers.google.com/machine-learning/glossary' },
    ]
  },
]
