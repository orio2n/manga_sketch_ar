# SketchAI – site web

Site de présentation de l'application Android SketchAI, dans le style de l'app (dégradé violet → rose, lignes de vitesse manga, trame, titres Poppins avec accent jaune, cartes « stickers »).

Site statique : HTML, CSS et JavaScript sans dépendance, en français et en anglais (bouton FR/EN, détection automatique de la langue du navigateur, ou `?lang=en`).

## Pages

- `index.html` : page d'accueil (hero animé, fonctionnalités, programme de 9 semaines, captures Google Play, FAQ)
- `privacy.html` : politique de confidentialité (FR + EN)
- `tos.html` : conditions d'utilisation (FR + EN)
- `tutorials/` et `guides/` : tutoriels et guides de dessin anime/manga en anglais, générés pour le SEO (voir plus bas)

L'app ouvre `https://manga-sketch-ar.vercel.app/privacy.html` et `/tos.html` depuis son profil : ce domaine redirige vers `https://sketchai.space`, où ces liens continuent de fonctionner.

## Tutoriels et guides (SEO)

Des pages de cours (« how to draw anime eyes », « how to learn to draw anime »…) qui répondent à de vraies recherches Google et mènent vers Google Play. Elles ont le style d'un site de tutoriels de dessin (pages blanches, étapes illustrées par les dessins du programme de l'app), pas celui d'une page d'app.

- `content/` : le texte de chaque page, en JSON (la source à relire et à modifier)
- `seo/` : le pipeline, sans dépendance (Node 20+) : mots-clés (Google Autocomplete, Search Console), backlog des pages à écrire, génération des pages, du `sitemap.xml` et du `robots.txt`. Tout est expliqué dans `seo/README.md`, et les règles d'écriture dans `seo/WRITING.md`
- `tools/extract_coach.py` : récupère les illustrations du programme de l'app (`CoachProgram.kt`) dans `assets/img/coach/` et le programme dans `seo/data/coach.json`
- `tools/eye_steps.py` : dessine les étapes du tutoriel sur les yeux (`assets/img/tutorials/`)

Écrire de nouvelles pages : dans Claude Code, « écris les 5 prochaines pages SEO » ou `/seo-content`, puis relire `git diff content/`, et commit + push pour déployer. `npm run seo:build` régénère les pages après une modification d'un fichier de `content/`.


## Lancer en local

```bash
python -m http.server 8417
```

puis ouvrir http://localhost:8417.

## Fichiers

- `assets/css/style.css` : le style de l'accueil et des pages légales
- `assets/css/tutorial.css` : le style des tutoriels et des guides
- `assets/js/lang.js` : choisit la langue avant l'affichage
- `assets/js/i18n.js` : les textes anglais (les textes français sont ceux des pages)
- `assets/js/main.js` : changement de langue, démo de l'onboarding, galerie, animations
- `tools/build_assets.py` : regénère `assets/img` et `assets/fonts` depuis le projet Android et les visuels Google Play (`SCRIPTS/sketchai/generate_playstore`)

Pour ajouter un texte traduit : ajouter `data-i18n="cle"` sur l'élément (texte français dans la page) et la traduction anglaise sous `"cle"` dans `assets/js/i18n.js`.
