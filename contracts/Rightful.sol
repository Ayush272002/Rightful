// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.2 <0.9.0;

contract Rightful {

    struct Document {
        string title;
        string description;
        string resourceLocation; // link to content / location
        uint256 documentHash; // file hash
        
        uint256 length; // token count
        uint256 lexicalDensity; // number of unique tokens
        uint256 audienceEngagement;

        address submitterAddress; // address of submitting user
        uint256 submissionTimestamp; // timestamp for when submitted
    }

    mapping(uint256 => Document[]) public documentMap;

    function storeDocument(
        string memory _title,
        string memory _description,
        string memory _resourceLocation,
        uint256 _documentHash,
        uint256 _length,
        uint256 _lexicalDensity,
        uint256 _audienceEngagement
    ) public {
        Document memory document;
        document.title = _title;
        document.description = _description;
        document.resourceLocation = _resourceLocation;
        document.documentHash = _documentHash;
        document.length = _length;
        document.lexicalDensity = _lexicalDensity;
        document.audienceEngagement = _audienceEngagement;
        document.submitterAddress = msg.sender;
        document.submissionTimestamp = block.timestamp;
        documentMap[_documentHash].push(document);
    }

}