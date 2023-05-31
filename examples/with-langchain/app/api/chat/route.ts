// app/api/chat/route.ts
import {
  StreamingTextResponse,
  createLangChainStreamingAdapter
} from '@vercel/ai-utils'
import { CallbackManager } from 'langchain/callbacks'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  //
  const { stream, handlers } = createLangChainStreamingAdapter()

  const llm = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers)
  })

  llm
    .call(
      messages.map(m =>
        m.role == 'user'
          ? new HumanChatMessage(m.content)
          : new AIChatMessage(m.content)
      )
    )
    .catch(console.error)

  return new StreamingTextResponse(stream)
}