// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.2 <0.9.0;

contract Rightful {

    struct Document {
        string title;
        string description;
        string resourceLocation; // link to content / location
        string documentHash; // file hash
        
        uint256 tokenCount; // token count
        uint256 lexicalDensity; // number of unique tokens
        uint256 audienceEngagement;

        address submitterAddress; // address of submitting user
        uint256 submissionTimestamp; // timestamp for when submitted

        string vector; // serialised vector (comma-separated values)
    }

    event DocumentCreated (
        string documentHash,
        string vector
    );

    mapping(string => Document[]) public documentMap;
    string[] public documentHashes;

    function storeDocument(
        string memory _title,
        string memory _description,
        string memory _resourceLocation,
        string memory _documentHash,
        uint256 _tokenCount,
        uint256 _lexicalDensity,
        uint256 _audienceEngagement,
        string memory _vector
    ) public {
        Document memory document;
        document.title = _title;
        document.description = _description;
        document.resourceLocation = _resourceLocation;
        document.documentHash = _documentHash;
        document.tokenCount = _tokenCount;
        document.lexicalDensity = _lexicalDensity;
        document.audienceEngagement = _audienceEngagement;
        document.submitterAddress = msg.sender;
        document.submissionTimestamp = block.timestamp;
        document.vector = _vector;
        documentMap[_documentHash].push(document);
        documentHashes.push(_documentHash);

        emit DocumentCreated(_documentHash, _vector);
    }

    function getDocument(
        string memory _documentHash,
        uint256 _index
    ) public view returns (Document memory document) {
        return documentMap[_documentHash][_index];
    }

}