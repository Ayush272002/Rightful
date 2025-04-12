import stringSimilarity from "string-similarity";

export interface MatchBlock {
    blockA: string;
    blockB: string;
    startIndexA: number;
    startIndexB: number;
    charOffsetA: number;
    charOffsetB: number;
    length: number;
    averageSimilarity: number;
}


function groupSimilarSentences(
    sentencesA: string[],
    sentencesB: string[],
    threshold = 0.75
): MatchBlock[] {
    const blocks: MatchBlock[] = [];

    for (let i = 0; i < sentencesA.length; i++) {
        for (let j = 0; j < sentencesB.length; j++) {
            let blockA = "";
            let blockB = "";
            let similarities: number[] = [];
            let len = 0;

            // Try to extend the match forward as long as sentences are similar
            while (
                i + len < sentencesA.length &&
                j + len < sentencesB.length
                ) {
                const sim = stringSimilarity.compareTwoStrings(
                    sentencesA[i + len].trim(),
                    sentencesB[j + len].trim()
                );

                if (sim >= threshold) {
                    blockA += sentencesA[i + len].trim() + " ";
                    blockB += sentencesB[j + len].trim() + " ";
                    similarities.push(sim);
                    len++;
                } else {
                    break;
                }
            }

            // Save contiguous match if it's at least 1 sentence long
            if (len > 0) {
                blocks.push({
                    blockA: blockA.trim(),
                    blockB: blockB.trim(),
                    startIndexA: i,
                    startIndexB: j,
                    charOffsetA: 0,
                    charOffsetB: 0,
                    length: len,
                    averageSimilarity:
                        similarities.reduce((a, b) => a + b, 0) / similarities.length,
                });

                // Avoid overlapping matches by skipping ahead
                i += len - 1;
                break;
            }
        }
    }

    return blocks;
}

export function getSimilarity(
    textA: string,
    textB: string
): MatchBlock[] {
    const sentencesA = textA.split(/(?<=[.!?])\s+/);
    const sentencesB = textB.split(/(?<=[.!?])\s+/);

    const blocks = groupSimilarSentences(sentencesA, sentencesB);

    // Add character offsets
    let offsetA = 0;
    const sentenceOffsetsA: number[] = sentencesA.map((s) => {
        const current = textA.indexOf(s, offsetA);
        offsetA = current + s.length;
        return current;
    });

    let offsetB = 0;
    const sentenceOffsetsB: number[] = sentencesB.map((s) => {
        const current = textB.indexOf(s, offsetB);
        offsetB = current + s.length;
        return current;
    });

    return blocks.map((block) => ({
        ...block,
        charOffsetA: sentenceOffsetsA[block.startIndexA],
        charOffsetB: sentenceOffsetsB[block.startIndexB],
    }));
}