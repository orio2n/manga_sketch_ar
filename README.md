# SketchAI – site web

Site de présentation de l'application Android SketchAI, dans le style de l'app (dégradé violet → rose, lignes de vitesse manga, trame, titres Poppins avec accent jaune, cartes « stickers »).

Site statique : HTML, CSS et JavaScript sans dépendance, en français et en anglais (bouton FR/EN, détection automatique de la langue du navigateur, ou `?lang=en`).

## Pages

- `index.html` : page d'accueil (hero animé, fonctionnalités, programme de 9 semaines, captures Google Play, FAQ)
- `privacy.html` : politique de confidentialité (FR + EN)
- `tos.html` : conditions d'utilisation (FR + EN)

L'app ouvre `https://manga-sketch-ar.vercel.app/privacy.html` et `/tos.html` depuis son profil : en déployant ce dossier sur ce domaine, ces liens continuent de fonctionner.

## Lancer en local

```bash
python -m http.server 8417
```

puis ouvrir http://localhost:8417.

## Fichiers

- `assets/css/style.css` : tout le style
- `assets/js/lang.js` : choisit la langue avant l'affichage
- `assets/js/i18n.js` : les textes anglais (les textes français sont ceux des pages)
- `assets/js/main.js` : changement de langue, démo de l'onboarding, galerie, animations
- `tools/build_assets.py` : regénère `assets/img` et `assets/fonts` depuis le projet Android et les visuels Google Play (`SCRIPTS/sketchai/generate_playstore`)

Pour ajouter un texte traduit : ajouter `data-i18n="cle"` sur l'élément (texte français dans la page) et la traduction anglaise sous `"cle"` dans `assets/js/i18n.js`.
