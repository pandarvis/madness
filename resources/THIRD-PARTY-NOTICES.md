# Ressources tierces du socle G0

Le paquet inclut les ressources compilées du renderer et le runtime Electron. Aucune ressource réseau n’est requise pour ouvrir l’interface. Les versions exactes et leurs dépendances sont conservées dans `package-lock.json`.

- React et React DOM 19.3.1 : licence MIT, Meta Platforms, Inc. and affiliates. [Licence React](https://github.com/facebook/react/blob/main/LICENSE).
- Electron 45.0.0 : licence MIT, Electron contributors et GitHub Inc. Le runtime distribué contient ses fichiers `LICENSE.electron.txt` et `LICENSES.chromium.html`, qui couvrent notamment Chromium et ses dépendances. [Licence Electron](https://github.com/electron/electron/blob/main/LICENSE).
- Starter `@quick-start/create-electron` 1.0.31, React-TS : licence MIT, Alex Wei. Les fichiers de configuration et la disposition des trois entrées ont servi de base ; les vues, contrats et adaptateurs Madness ont été écrits pour G0. [Licence du starter](https://github.com/alex8088/quick-start/blob/master/LICENSE).

- JOSE 6.2.13 : licence MIT, Copyright (c) 2018 Filip Skokan. Vérification cryptographique des ID tokens ; version exacte dans le lockfile. [Source et licence JOSE](https://github.com/panva/jose/blob/main/LICENSE.md). Le texte MIT reproduit ci-dessous s’applique également avec cette attribution.
- Signe ChatGPT/OpenAI, fichier `src/renderer/src/assets/chatgpt-mark.svg` : ressource de marque officielle utilisée uniquement pour identifier la connexion Codex via ChatGPT. [SVG source](https://raw.githubusercontent.com/openai/sign-in-with-chatgpt-devkit/main/assets/brand/chatgpt-button-black-21.svg), récupéré le 24 octobre 2026 ; droits de marque OpenAI conservés. [Guidelines SIWC](https://developers.openai.com/siwc/ui-ux-guidelines). Ce signe n’est pas une marque Madness, une certification ou une affiliation.
- electron-updater : licence MIT, Loopback Inc. et electron-builder contributors. Mises à jour de Madness depuis GitHub Releases.
- uv 0.13.0 (`runtime-tools/uv.exe`) : licences MIT ou Apache-2.0, Astral Software Inc. [Source et licence](https://github.com/astral-sh/uv).

Le protocole SIWC a été implémenté indépendamment à partir de la documentation officielle. Aucun code du SDK Sign in with ChatGPT DevKit sous licence non commerciale n’est incorporé. Le binaire Codex éventuellement présent sur l’ordinateur est utilisé comme outil natif séparé ; il n’est pas embarqué par Madness.

L’icône originale Madness remplace celle du runtime Electron ; source et provenance dans resources/branding. Les outils de build et Playwright ne sont pas des services requis à l’exécution du paquet.

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

## Scripts natifs BMad pour l’aide

Les fichiers resources/bmad-help/knowledge.py, resolve_config.py et config_utils.py sont des copies exactes de l’installation BMad locale 6.13.0-next. Ils sont exécutés en lecture seule sur des snapshots de données par le code possédé de Madness. Leurs empreintes sont épinglées dans src/adapters/bmad/help-manifest.ts. Aucun code Python du projet ouvert n’est importé.

Source knowledge.py : https://github.com/bmad-code-org/BMAD-METHOD/tree/bd70c643a7ec85d1ec2e88076b3fbdd8e4517f41 ; cette révision correspond au contenu installé après normalisation des seules fins de ligne. Les copies livrées gardent leurs octets locaux exacts. BMad et ses marques restent la propriété de leurs titulaires.
MIT License

Copyright (c) 2025 BMad Code, LLC

This project incorporates contributions from the open source community.
See [CONTRIBUTORS.md](CONTRIBUTORS.md) for contributor attribution.

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

TRADEMARK NOTICE:
BMad™, BMad Method™, and BMad Core™ are trademarks of BMad Code, LLC, covering all
casings and variations (including BMAD, bmad, BMadMethod, BMAD-METHOD, etc.). The use of
these trademarks in this software does not grant any rights to use the trademarks
for any other purpose. See [TRADEMARK.md](TRADEMARK.md) for detailed guidelines.



## Barlow Condensed Bold

Locally bundled from the official Google Fonts repository: https://github.com/google/fonts/tree/main/ofl/barlowcondensed

Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.


## Original atelier illustrations

Seven original character illustrations, two workshop environments and one painted plate-edge frame generated with ImageGen for Madness. Native image pixels are unchanged. Source prompts, reference hashes and generation provenance are retained in the repository preproduction manifests; shipped-file hashes are recorded in notices/atelier-assets.json. These illustrations do not attest agent activation or installed capabilities.


## Oxanium variable

Locally bundled unmodified from https://github.com/google/fonts/tree/main/ofl/oxanium . No remote font service is used at runtime.

Copyright 2019 The Oxanium Project Authors (https://github.com/sevmeyer/oxanium)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.


## Atelier character edition v2 — 3 November 2026

The seven character busts were restyled with built-in ImageGen at the user’s request. Original adult identities are retained with exaggerated comic acting, hard cel shading and eccentric role-specific accessories. Native generated files are copied bit for bit, without postprocessing. Exact prompts, source/reference hashes and output hashes are recorded in resources/atelier-cast-v2/provenance.json in the repository. The environments and painted frame are unchanged.

## Profil BMad pour l’initialisation locale

Le bundle resources/bmad-init/payload-v1.json.gz embarque les fichiers du profil local 6.13.0-next qualifiés en 3.1. Leur attribution BMad Code, LLC et leur licence MIT figurent dans la section BMad ci-dessus. Le manifeste local épinglé décrit leurs octets ; aucun commit amont exact n’a été établi pour ce profil. La configuration embarquée est matérialisée par dossier lors de la préparation et le verrou local Skills est exclu.
