# Sources Win32 pour le batch local

Consultées le4novembre2026, sources Microsoft primaires. Leur description aide à concevoir le candidat ; seule la qualification locale établira ses refus et performances.

- [GetFileInformationByHandle](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfileinformationbyhandle) rapporte le succès ou l’échec de lecture des métadonnées. Volume et index servent à rapprocher des identités ; les systèmes de fichiers/réseaux peuvent retourner des informations incomplètes. Ne pas réparer une erreur en identité normale.
- [BY_HANDLE_FILE_INFORMATION](https://learn.microsoft.com/en-us/windows/desktop/api/fileapi/ns-fileapi-by_handle_file_information) décrit notamment attributs, volume/index et nNumberOfLinks. Le nombre de liens doit provenir des métadonnées, pas de l’absence de cible de lien symbolique.
- [Reparse Points and File Operations](https://learn.microsoft.com/en-us/windows/win32/fileio/reparse-points-and-file-operations) explique les précautions d’ouverture des points de réanalyse ; FILE_FLAG_OPEN_REPARSE_POINT concerne leur traitement. Ce drapeau ne prouve pas à lui seul la sûreté des ancêtres, de la résolution ou d’une course.

Le profil déjà qualifié reste Windows local et runtime fermé735fichiers. Aucune nouvelle plateforme, sandbox OS ni absence générale de course déduite de ces APIs.
