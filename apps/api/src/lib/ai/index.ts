import { createOpenAI } from '@ai-sdk/openai'
import { env } from '@/utils/env'

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY })
export const model = openai(env.OPENAI_MODEL_ID)
