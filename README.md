# Rightful

**Rightful** detects document similarity and helps you protect your intellectual property, with advanced AI and blockchain technology.

## :globe_with_meridians: RTFL Protocol

Over the course of the hackathon, we spent countless hours discussing, designing and implementing the **RTFL Protocol** - our own in-house protocol that we've deployed on the blockchain, that facilitates for both users and self-hosted verifier nodes to work together to search for similar documents.

### Protocol Implementation (Solidity) 

The preferred way to implement this protocol, or at least how we've chosen to implement it, is through the use of a **Solidity Smart Contract, deployed on the Sepolia Ethereum Testnet**, however in theory this contract could be deployed on any EVM-based chain, such as the Ethereum Mainnet or Binance Smart Chain.

The smart contract, located in `protocol/contracts/RTFL.sol`, provides functionality to upload metadata about documents via the public `storeDocument` function. This function will append the newly-added document metadata to a hashmap data structure indexed by hash (allowing for collision avoidance), as well as appending the hash to a `documentHashes` array, which will be appended to whenever new metadata is uploaded.

We chose to implement this as a smart contract on the blockchain due to it's obvious benefits of immutability and transparency. Anyone can see who submitted or published a document, and documents cannot be changed or modified after being submitted, preventing modifications by malicious actors or impersonators, after the block has been broadcasted to the chain.

Both this hashmap and the array are public, so anyone can implement their own verifier nodes and/or clients to interact with the deployed protocol implementation. This was our intention - to make the protocol accessible and open - to help **promote the growth of an ecosystem of apps that can be built on top of the protocol.**

### Verifier Nodes

Anyone can **self-host a verifier node** which runs on the RTFL Protocol. This repository provides the tools necessary to host a verifier node, and anyone with ETH in their wallet can spin up their own self-hosted Rightful node which builds on top of RTFL.

Users who want to detect document similarity can upload their documents to a verifier node. It's up to this verifier node to extract the metadata from the file, such as the document title and description.

The verifier node will also be responsible for performing any ***natural language processing analysis**, to get values such as the token count (length), lexical density (vocabulary range) and audience engagement (readability) of the text, as well as generating vector data for the text, before then publishing this data to the blockchain.

The node can also implement checks, fetching from the smart contract for similar documents via **cosine similarity** checks to work out the "closeness" between two vectors. This can be used to find documents that are heavily similar to the newly-uploaded document, and these similar documents can be presented to the end-user alongside the metadata (which is also fetched from the smart contract).

## :robot: Agent-powered Rightful Node

The **Rightful node** offers additional AI integrations as an extension to the base RTFL protocol, to provide further enhancements and details about documents before storing metadata about the documents on-chain.

Rightful also offers a friendly front-end user interface, which allows users to visualise the blockchain data more intuitively. **The node offers several agents to end-users**:

### Search agent
Rightful's **search agent** searches all of the existing document submissions in the smart contract and compares them to a user's newly-uploaded document (using cosine similarity and NLP methods) to find potential conflicts with existing documents. Extra "trust" checks have been implemented, which allow for users to see which nodes verified and signed the data onto the blockchain, allowing for additional reliability and transparency in data provided to users.

### General user assistant agent
Rightful's **general user assistant agent** provides guidance to end-users on general information about how the platform works, as well as information about the protocol. The agent may also suggest actionable steps that can be taken to achieve a goal, for example, redirecting the user to the relevant page if they want to upload a document or review previous analysis results. 

### Document similarity analysis agent
Rightful's **document similarity analysis agent** can look at several documents and help users identify how close two documents are in terms of general ideas and structure at a glance.

### Line-by-line similarity analysis agent
Rightful's **line-by-line similarity analysis agent** provides a more granular insight than the document similarity analysis agent, describing which lines are most closely linked between documents. While this doesn't look at the document as a whole, it can provide a more unitary and precise difference analysis between two texts.