# Ressources tierces du socle G0

Le paquet inclut les ressources compilées du renderer et le runtime Electron. Aucune ressource réseau n’est requise pour ouvrir l’interface. Les versions exactes et leurs dépendances sont conservées dans `package-lock.json`.

- React et React DOM 19.3.1 : licence MIT, Meta Platforms, Inc. and affiliates. [Licence React](https://github.com/facebook/react/blob/main/LICENSE).
- Electron 45.0.0 : licence MIT, Electron contributors et GitHub Inc. Le runtime distribué contient ses fichiers `LICENSE.electron.txt` et `LICENSES.chromium.html`, qui couvrent notamment Chromium et ses dépendances. [Licence Electron](https://github.com/electron/electron/blob/main/LICENSE).
- Starter `@quick-start/create-electron` 1.0.31, React-TS : licence MIT, Alex Wei. Les fichiers de configuration et la disposition des trois entrées ont servi de base ; les vues, contrats et adaptateurs Madness ont été écrits pour G0. [Licence du starter](https://github.com/alex8088/quick-start/blob/master/LICENSE).

- JOSE 6.2.13 : licence MIT, Copyright (c) 2018 Filip Skokan. Vérification cryptographique des ID tokens ; version exacte dans le lockfile. [Source et licence JOSE](https://github.com/panva/jose/blob/main/LICENSE.md). Le texte MIT reproduit ci-dessous s’applique également avec cette attribution.
- Signe ChatGPT/OpenAI, fichier `src/renderer/src/assets/chatgpt-mark.svg` : ressource de marque officielle utilisée uniquement pour identifier la connexion Codex via ChatGPT. [SVG source](https://raw.githubusercontent.com/openai/sign-in-with-chatgpt-devkit/main/assets/brand/chatgpt-button-black-21.svg), récupéré le 24 octobre 2026 ; droits de marque OpenAI conservés. [Guidelines SIWC](https://developers.openai.com/siwc/ui-ux-guidelines). Ce signe n’est pas une marque Madness, une certification ou une affiliation.

Le protocole SIWC a été implémenté indépendamment à partir de la documentation officielle. Aucun code du SDK Sign in with ChatGPT DevKit sous licence non commerciale n’est incorporé. Le binaire Codex éventuellement présent sur l’ordinateur est utilisé comme outil natif séparé ; il n’est pas embarqué par Madness.

L’icône de l’exécutable reste celle du runtime Electron. Aucune marque Madness définitive n’est revendiquée. Les outils de build et Playwright ne sont pas des services requis à l’exécution du paquet.

## Texte MIT de React et du starter

MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Copyright (c) 2022, Alex Wei

Copyright (c) 2018 Filip Skokan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
