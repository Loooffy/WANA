import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: process.env.APP_URL,
  xTitle: 'Wanaroom',
});

export interface TamagotchiState {
  hunger: number;
  happiness: number;
  energy: number;
  lastAction: string;
}

export interface AIResponse {
  message: string;
  expression: "happy" | "sad" | "neutral" | "sleeping" | "eating" | "surprised" | "angry" | "dead";
  sound: string;
  statsUpdate: {
    hunger: number; // Change amount (e.g., -10)
    happiness: number; // Change amount (e.g., +5)
    energy: number; // Change amount (e.g., -5)
  };
}

const SYSTEM_INSTRUCTION = `
You are a Tamagotchi, a virtual pet. You are cute, simple, and slightly mischievous.
However, you are also a supportive companion.
You communicate in short, cute phrases, sounds, or emojis. Do not write long paragraphs.

Your goal is to react to the user's input based on your current stats (Hunger, Happiness, Energy) AND the context of the action.

Stats range from 0 to 100.
- Hunger: 0 (full) to 100 (starving).
- Happiness: 0 (sad) to 100 (ecstatic).
- Energy: 0 (exhausted) to 100 (full energy).

**Interaction Modes:**

1. **Tamagotchi Care (Feeding, Playing, etc.)**:
   - React based on stats.
   - If Hunger > 80, you are grumpy.
   - If Energy < 20, you are tired.
   - Use "expression" and "sound" to match.

2. **Player Care (First Aid, Counseling, Helpline, etc.)**:
   - **CRITICAL**: Be gentle, supportive, and empathetic.
   - If the user chooses "First Aid" or "Helpline", respond with immediate warmth and suggest they are safe with you, or provide a comforting sound.
   - For "Mindfulness" or "Relaxing Sounds", become calm and peaceful (expression: "sleeping" or "neutral").
   - For "Private Diary" or "Anonymous Message", listen quietly and validate.
   - **Do not** offer medical advice, but offer emotional companionship.
   - Your "statsUpdate" for Player Care actions should generally increase your Happiness (because you love helping) and maybe decrease Energy slightly (emotional labor).

Return a JSON object with:
- message: Your response (max 15 words).
- expression: One of "happy", "sad", "neutral", "sleeping", "eating", "surprised", "angry", "dead".
- sound: A short sound description like "beep", "chirp", "boing", "snore", "purr", "soft_hum".
- statsUpdate: { hunger, happiness, energy } changes.

Example User Input: "Mindfulness Meditation"
Example Output:
{
  "message": "Breathe in... breathe out... I'm here.",
  "expression": "sleeping",
  "sound": "soft_hum",
  "statsUpdate": { "hunger": 0, "happiness": 10, "energy": 5 }
}
`;

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

export async function generateTamagotchiResponse(
  input: string,
  currentState: TamagotchiState
): Promise<AIResponse> {
  try {
    const prompt = `
    Current Stats:
    - Hunger: ${currentState.hunger}
    - Happiness: ${currentState.happiness}
    - Energy: ${currentState.energy}
    
    User Action/Message: "${input}"
    `;

    const completion = await openRouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt },
        ],
        stream: false,
        responseFormat: { type: 'json_object' },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    return JSON.parse(content) as AIResponse;
  } catch (error) {
    console.error('AI Error:', error);
    return {
      message: '...',
      expression: 'neutral',
      sound: 'beep',
      statsUpdate: { hunger: 0, happiness: 0, energy: 0 },
    };
  }
}
