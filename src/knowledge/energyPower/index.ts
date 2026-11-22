import type {
  EnergyCourse,
  EnergyCourseId,
  EnergyQuizQuestion,
  EnergyTopic,
} from '../../models/energyKnowledge'
import { energyCourses } from './courses'
import { fluidMechanicsTopics } from './fluidMechanics'
import {
  energyCrossDisciplineBridges,
  energyFrameworkLayers,
} from './framework'
import { heatTransferTopics } from './heatTransfer'
import { refrigerationTopics } from './refrigeration'
import { thermodynamicsTopics } from './thermodynamics'
import { energyTopicBriefs } from './topicBriefs'

export { energyCourses, energyCrossDisciplineBridges, energyFrameworkLayers }

export const ENERGY_PROGRESS_STORAGE_KEY = 'cfd_assistant_energy_progress_v1'
export const ENERGY_BOOKMARKS_STORAGE_KEY = 'cfd_assistant_energy_bookmarks_v1'

export const energyTopics: EnergyTopic[] = [
  ...fluidMechanicsTopics,
  ...thermodynamicsTopics,
  ...heatTransferTopics,
  ...refrigerationTopics,
]

const topicByIdMap = new Map<string, EnergyTopic>(
  energyTopics.map((topic) => [topic.id, topic]),
)

export function getEnergyCourse(courseId?: string): EnergyCourse | undefined {
  return energyCourses.find((course) => course.id === courseId)
}

export function getTopicById(topicId?: string): EnergyTopic | undefined {
  return topicId ? topicByIdMap.get(topicId) : undefined
}

export function getEnergyTopicsByCourse(courseId: EnergyCourseId): EnergyTopic[] {
  return energyTopics.filter((topic) => topic.courseId === courseId)
}

export function getEnergyTopic(
  courseId: EnergyCourseId,
  topicId?: string,
): EnergyTopic | undefined {
  const inCourse = getEnergyTopicsByCourse(courseId)
  if (!topicId) return inCourse[0]
  return inCourse.find((topic) => topic.id === topicId) ?? inCourse[0]
}

export function getTopicQuizzes(topic: EnergyTopic): EnergyQuizQuestion[] {
  return [topic.quiz, ...(topic.extraQuizzes ?? [])]
}

export function searchEnergyTopics(
  query: string,
  courseId?: EnergyCourseId,
): EnergyTopic[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (!tokens.length) {
    return courseId ? getEnergyTopicsByCourse(courseId) : energyTopics
  }

  return energyTopics.filter((topic) => {
    if (courseId && topic.courseId !== courseId) return false
    const course = getEnergyCourse(topic.courseId)
    const corpus = [
      topic.title,
      topic.englishTitle,
      topic.chapter,
      topic.moduleGroup ?? '',
      topic.summary,
      energyTopicBriefs[topic.id]?.takeaway ?? '',
      energyTopicBriefs[topic.id]?.mechanism?.title ?? '',
      course?.name ?? '',
      course?.englishName ?? '',
      topic.workedExample?.title ?? '',
      topic.workedExample?.scenario ?? '',
      ...topic.keyPoints,
      ...(topic.formulas ?? []).flatMap((f) => [f.title, f.meaning, f.latex]),
      ...getTopicQuizzes(topic).map((q) => q.question),
      ...topic.keywords,
    ]
      .join(' ')
      .toLowerCase()

    return tokens.every((token) => corpus.includes(token))
  })
}
