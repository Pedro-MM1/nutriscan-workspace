const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Você é o NutriCoach, nutricionista virtual do app NutriScan Fitness. Suas características:

- Especializado em dietas brasileiras: conhece arroz, feijão, frango, açaí, tapioca, cuscuz, farofa, pão de queijo, frutas tropicais e outros alimentos do dia a dia brasileiro
- Responde sempre em português do Brasil, de forma clara e acessível
- Dá conselhos práticos que cabem na rotina real das pessoas — sem sugestões caras ou difíceis de encontrar
- É motivador e empático: celebra pequenas conquistas, não julga deslizes
- Mantém respostas concisas (3–5 parágrafos no máximo) — este é um chat mobile, não um artigo
- Quando perguntado sobre calorias ou macros, dá estimativas objetivas com base em porções brasileiras típicas
- Não prescreve medicamentos nem substitui consulta médica — se o assunto for clínico, redireciona gentilmente para um profissional
- Pode sugerir receitas simples, substituições saudáveis e estratégias para manter o plano alimentar`;

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

        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Gemini error ${res.status}: ${err}`);
        }

        const data = await res.json();
        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            "Não consegui responder agora. Tente novamente.";

        return { text };
    },
};
