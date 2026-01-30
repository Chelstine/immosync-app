import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAnnonce(bienData) {
    const prompt = `
Tu es expert rédaction immobilière. Génère un titre accrocheur (max 100 caractères) et une description persuasive (300-500 mots) pour : 
Type: ${bienData.Type_Bien}
Ville: ${bienData.Ville}
Prix: ${bienData.Prix}€
Surface: ${bienData.Surface}m²
Pièces: ${bienData.Pieces}
DPE: ${bienData.DPE}
Points clés: ${bienData.Description_Courte || 'Aucun point spécifique'}

Format de réponse STRICT : 
TITRE: [titre ici]
DESCRIPTION: [description ici]
`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
            temperature: 0.7,
            max_tokens: 800,
        });

        const text = completion.choices[0].message.content;

        // Parse
        const titreMatch = text.match(/TITRE:\s*(.*)/);
        const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*)/);

        const titre = titreMatch ? titreMatch[1].trim() : "Titre non détecté";
        const description = descMatch ? descMatch[1].trim() : text;

        return { titre, description };
    } catch (error) {
        console.error("OpenAI generation error:", error);
        // Return fallback
        return {
            titre: `${bienData.Type_Bien} à ${bienData.Ville}`,
            description: "La génération de l'annonce a échoué ou est en attente. Veuillez réessayer plus tard."
        };
    }
}
