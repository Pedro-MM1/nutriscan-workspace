type CoachAIResponse = {
    text: string;
};

export const api = {
    coachAI: async (
        message: string,
        history: string[]
    ): Promise<CoachAIResponse> => {
        const res = await fetch("SUA_URL_DA_API", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                history,
            }),
        });

        if (!res.ok) {
            throw new Error("Erro ao chamar AI Coach");
        }

        return (await res.json()) as CoachAIResponse;
    },
};
