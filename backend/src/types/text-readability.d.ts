declare module "text-readability" {
  interface ReadabilityStats {
    fleschReadingEase(text: string): number;
    fleschKincaidGrade(text: string): number;
    smogIndex(text: string): number;
    colemanLiauIndex(text: string): number;
    automatedReadabilityIndex(text: string): number;
    daleChallReadabilityScore(text: string): number;
    difficultWords(text: string): number;
    linsearWriteFormula(text: string): number;
    gunningFog(text: string): number;
    textStandard(text: string, floatOutput?: boolean): string | number;
    syllableCount(text: string, lang?: string): number;
    lexiconCount(text: string, removePunctuation?: boolean): number;
    sentenceCount(text: string): number;
  }

  const rs: ReadabilityStats;
  export default rs;
}
