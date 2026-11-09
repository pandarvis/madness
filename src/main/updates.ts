import { autoUpdater } from 'electron-updater'

/** Reads the latest GitHub Release, downloads the changed blocks and installs when the app quits. */
export function checkForUpdates(): void {
  autoUpdater.logger = null
  // Offline or no published version yet: Madness simply stays on its current version.
  autoUpdater.on('error', () => undefined)
  void autoUpdater.checkForUpdatesAndNotify({ title: 'Mise à jour de Madness prête', body: 'La version {version} s’installera à la fermeture de Madness.' }).catch(() => undefined)
}
