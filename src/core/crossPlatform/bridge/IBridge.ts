export interface IBridge {
  getPageContent(): Promise<string | undefined>

  getTabContent(): Promise<{ url: string; title: string } | undefined>
}
