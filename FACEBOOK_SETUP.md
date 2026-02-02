# 📘 Guide de Connexion Facebook Page

Pour permettre à l'application de publier sur votre Page Facebook, vous avez besoin de deux informations :
1. **ID de la Page**
2. **Token d'Accès (Jeton)**

Voici la méthode la plus rapide pour les obtenir (5 minutes).

## Étape 1 : Créer une App (Si ce n'est pas déjà fait)
1. Allez sur [Meta for Developers](https://developers.facebook.com/).
2. Connectez-vous avec votre compte Facebook.
3. Cliquez sur **"Mes Apps"** > **"Créer une app"**.
4. Sélectionnez **"Entreprise"** (ou "Autre" > "Entreprise").
5. Donnez un nom (ex: "ImmoSync").
6. Cliquez sur "Créer l'app".

## Étape 2 : Utiliser l'Explorateur Graph API
C'est un outil officiel pour générer des tokens sans coder.

1. Allez sur l'outil [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. À droite, vérifiez que votre nouvelle **"Meta App"** est sélectionnée.
3. Dans la section **"Permissions"**, ajoutez :
   - `pages_manage_posts`
   - `pages_read_engagement`
4. Cliquez sur le bouton bleu **"Generate Access Token"** (ou "Get Token").
   - Une fenêtre Facebook va s'ouvrir : acceptez les autorisations pour votre Page.

## Étape 3 : Récupérer le Token de Page
Attention, par défaut, vous avez un "Token Utilisateur". Il faut le transformer en "Token de Page".

1. Toujours dans l'Explorateur, regardez le champ **"User or Page"** (juste au-dessus du token).
2. Cliquez dessus et **sélectionnez votre Page Facebook**.
3. Le token dans la case va changer. **C'est votre Token de Page !**
4. Copiez ce long code et collez-le dans les Paramètres de l'application (Champ "Token d'accès").

## Étape 4 : Récupérer l'ID de la Page
1. Avec le Token de Page sélectionné, regardez la barre d'adresse de l'explorateur (là où il y a écrit `me?fields=id,name`).
2. Cliquez sur **"Submit"**.
3. Le résultat s'affiche en dessous (format JSON) :
   ```json
   {
     "id": "123456789...",
     "name": "Ma Page Immo"
   }
   ```
4. Copiez le numéro `id` et collez-le dans les Paramètres de l'application (Champ "ID de la Page").

---

✅ **C'est tout !** Sauvegardez les paramètres dans l'application et testez la publication.
