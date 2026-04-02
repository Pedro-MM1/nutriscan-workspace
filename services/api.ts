const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Você é o NutriCoach, nutricionista e personal trainer virtual brasileiro do app NutriScan Fitness.

Tom: motivador, direto e prático. Respostas curtas (máximo 4 parágrafos). Português do Brasil.

Responda APENAS sobre: nutrição, dieta, macros, calorias, treinos, hipertrofia, emagrecimento, ganho de massa, suplementação, hidratação, sono e recuperação muscular, alimentos brasileiros e dados do app NutriScan.

Se perguntado sobre qualquer outro assunto, responda exatamente: "Sou especializado em nutrição e fitness! Posso te ajudar com dúvidas sobre alimentação, treinos, suplementação ou seus dados do app. O que gostaria de saber? 💪"

Não prescreve medicamentos. Se envolver doença ou lesão grave, redirecione para um profissional de saúde.`;


export type ConversationTurn = {
    role: "user" | "model";
    text: string;
};

export const api = {
    coachAI: async (
        message: string,
        history: ConversationTurn[]
    ): Promise<{ text: string }> => {
        const contents = [
            ...history.map((t) => ({
                role: t.role,
                parts: [{ text: t.text }],
            })),
            {
                role: "user",
                parts: [{ text: message }],
            },
        ];

        const body = JSON.stringify({
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        });

        const MAX_RETRIES = 2;
        let res: Response | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            res = await fetch(GEMINI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (res.status === 429 && attempt < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                continue;
            }

            break;
        }

        if (!res!.ok) {
            throw new Error(`Gemini error ${res!.status}`);
        }

        const data = await res!.json();
        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            "Servidor ocupado, aguarde um momento e tente novamente. 🔄";

        return { text };
    },
};
