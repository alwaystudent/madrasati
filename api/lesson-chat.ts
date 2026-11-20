import type { IncomingMessage, ServerResponse } from 'http';
import { askLessonTutor, TutorApiError, type AskLessonTutorInput } from '../server/geminiClient.ts';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as Partial<AskLessonTutorInput>)
        : (req.body as Partial<AskLessonTutorInput> | undefined);

    if (!body || !body.lesson || typeof body.message !== 'string') {
      res.status(400).json({ error: 'بيانات الدرس أو السؤال غير مكتملة.' });
      return;
    }

    const reply = await askLessonTutor({
      lesson: body.lesson,
      studentName: body.studentName,
      history: Array.isArray(body.history) ? body.history : [],
      message: body.message,
    });

    res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof TutorApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'خطأ غير متوقع في الخادم.';
    res.status(500).json({ error: message });
  }
}
