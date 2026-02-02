import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAnnonce(bienData) {
    const tone = bienData.Ton || 'Professionnel';

    const prompt = `
Tu es un expert en copywriting immobilier de classe mondiale. 
Ton objectif : Rédiger une annonce immobilière ultra-convaincante pour vendre ce bien rapidement.
TON IMPOSÉ : ${tone.toUpperCase()}. ADAPTE LE VOCABULAIRE ET LE STYLE À CE TON.

Détails du bien :
Type: ${bienData.Type_Bien}
Ville: ${bienData.Ville} (${bienData.Code_Postal})
Prix: ${bienData.Prix}€
Surface: ${bienData.Surface}m²
Pièces: ${bienData.Pieces}
DPE: ${bienData.DPE}
Points clés / Description Vendeur: ${bienData.Description_Courte || 'Aucun point spécifique donné, sois créatif sur les avantages standards.'}

Format de réponse STRICT (Ne rien ajouter avant le TITRE) : 
TITRE: [Un titre accrocheur, court et puissant, max 80 caractères + emojis si ton amical]
DESCRIPTION: [Une description structurée avec paragraphes, liste à puces des atouts, et appel à l'action. Longueur 300 mots minimum.]
`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log("OpenAI raw response received");
        const text = completion.choices[0].message.content;
        console.log("Raw Response Content:", text.substring(0, 100) + "...");

        // Flexible Parsing
        let titre = "Titre non détecté";
        let description = text;

        if (text.includes("TITRE:")) {
            const parts = text.split(/TITRE:|DESCRIPTION:/i);
            // parts[0] is often empty or preamble
            // parts[1] is Titre
            // parts[2] is Description
            if (parts.length >= 3) {
                titre = parts[1].trim();
                description = parts[2].trim();
            } else if (parts.length === 2) {
                // Only one tag found?
                if (text.toLowerCase().indexOf("titre:") < text.toLowerCase().indexOf("description:")) {
                    titre = parts[1].split(/description:/i)[0].trim();
                    description = text.split(/description:/i)[1].trim();
                }
            }
        } else {
            // Fallback regex
            const titreMatch = text.match(/TITRE:\s*(.*)/i);
            const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*)/i);
            if (titreMatch) titre = titreMatch[1].trim();
            if (descMatch) description = descMatch[1].trim();
        }

        console.log("Parsed Titre:", titre);

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
