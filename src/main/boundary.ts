/** Comparaison d'identité : une URL seule n'autorise pas une iframe ou une autre fenêtre. */
export function isTrustedCaller(event: { sender: unknown; senderFrame: unknown }, expected: { webContents: unknown; mainFrame: { url: string } }, rendererUrl: string): boolean {
  return event.sender === expected.webContents && event.senderFrame === expected.mainFrame && expected.mainFrame.url === rendererUrl
}
