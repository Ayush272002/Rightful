import { getContract } from "./rightful";

export async function getDocumentHashes() {
  const contract = getContract();
  let index = 0;
  let res: number[] = [];
  while (true) {
    try {
      const docHash = await contract.documentHashes(index);
      res.push(docHash);
      index += 1;
    } catch (err) {
      break;
    }
  }
  return res;
}
