# 🏠 ImmoSync - Solution de Multidiffusion Immobilière IA

ImmoSync est une plateforme SaaS hybride permettant aux agents immobiliers de générer des annonces par IA et de les diffuser automatiquement sur Facebook Marketplace et LeBonCoin.

## 🌟 Architecture Hybride

Le projet repose sur deux composants qui communiquent de manière asynchrone via Airtable :

1.  **ImmoSync Web (Cloud)** :
    *   Hébergé sur [Railway](https://railway.app).
    *   Interface Next.js 14 pour la gestion des annonces.
    *   Génération de textes par OpenAI (GPT-4o).
    *   Stockage des photos sur Cloudinary.
    *   Base de données : Airtable.

2.  **ImmoSync Agent (Desktop)** :
    *   Logiciel installé sur le PC du client.
    *   Surveille Airtable pour les nouvelles demandes de publication.
    *   Utilise Playwright pour piloter un navigateur "Fantôme" et publier sur les plateformes.
    *   Utilise l'IP résidentielle du client (Anti-Blocage).

---

## 🚀 Déploiement (Pour l'Admin)

### 1. Mise en ligne du Site
Le site se déploie automatiquement sur Railway via GitHub.
Les variables d'environnement requises sont :
*   `OPENAI_API_KEY`
*   `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`
*   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
*   `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

### 2. Mise à jour de l'Agent Client
Pour générer une nouvelle version de l'agent distribuable :
1.  Lancer `PREPARER_DEPLOYMENT.bat` à la racine du projet.
2.  Cela va :
    *   Obfusquer le code source JS (protection IP).
    *   Créer le ZIP d'installation (`ImmoSync-Agent.zip`).
    *   Placer ce ZIP dans le dossier `public/` du site Web.
3.  Faire un `git push` pour mettre en ligne la nouvelle version.

---

## 💻 Installation (Pour le Client Final)

Le client n'a besoin de faire cela qu'une seule fois :

1.  Se connecter sur ImmoSync Web.
2.  Aller sur la page **"Télécharger l'Assistant"** (ou `/download`).
3.  Télécharger et dézipper le dossier.
4.  Lancer **`INSTALL_AGENT.bat`**.
    *   Cela installe les dépendances.
    *   Cela configure le démarrage automatique (Mode Fantôme 👻).
5.  Lancer **`GÉRER_COMPTES.bat`** pour connecter ses comptes Facebook / LeBonCoin.

---

## 🛠️ Stack Technique

*   **Frontend :** Next.js 14, TailwindCSS, Lucide Icons.
*   **Backend :** API Routes Next.js, Airtable SDK.
*   **Automation :** Node.js, Playwright, Stealth Plugin.
*   **Security :** NextAuth.js, Javascript Obfuscator.

## 📝 Licence
Propriété exclusive de NOVEK. Code source protégé.
