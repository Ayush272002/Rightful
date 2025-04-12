const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rightful Contract", function () {
  let Rightful;
  let rightful;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Rightful = await ethers.getContractFactory("Rightful");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a new contract before each test
    // Using the new deployment method for newer Hardhat versions
    rightful = await Rightful.deploy();
    // Replace deployed() with waitForDeployment()
    await rightful.waitForDeployment();
  });

  describe("Store Document", function () {
    it("should store a document correctly", async function () {
      const _title = "Test Document";
      const _description = "This is a test document.";
      const _resourceLocation = "http://testdocument.com";
      const _documentHash = 123456;
      const _tokenCount = 1000;
      const _lexicalDensity = 10;
      const _audienceEngagement = 50;
      const _vector = "1,2,3,4,5";

      await rightful.storeDocument(
        _title,
        _description,
        _resourceLocation,
        _documentHash,
        _tokenCount,
        _lexicalDensity,
        _audienceEngagement,
        _vector
      );

      // Check the stored document
      const document = await rightful.getDocument(_documentHash, 0);

      expect(document.title).to.equal(_title);
      expect(document.description).to.equal(_description);
      expect(document.resourceLocation).to.equal(_resourceLocation);
      expect(document.documentHash).to.equal(_documentHash);
      expect(document.tokenCount).to.equal(_tokenCount);
      expect(document.lexicalDensity).to.equal(_lexicalDensity);
      expect(document.audienceEngagement).to.equal(_audienceEngagement);
      expect(document.submitterAddress).to.equal(owner.address);
      expect(document.submissionTimestamp).to.be.greaterThan(0);
      expect(document.vector).to.equal(_vector);
    });
  });

  describe("Multiple Document Entries", function () {
    it("should allow multiple documents with the same hash to be stored", async function () {
      const _documentHash = 123456;

      // Store first document
      await rightful.storeDocument(
        "Test Document 1",
        "First document with the same hash.",
        "http://testdocument1.com",
        _documentHash,
        1000,
        10,
        50,
        "1,2,3"
      );

      await rightful.storeDocument(
        "Test Document 2",
        "Second document with the same hash.",
        "http://testdocument2.com",
        _documentHash,
        2000,
        20,
        60,
        "4,5,6"
      );

      const document1 = await rightful.getDocument(_documentHash, 0);
      const document2 = await rightful.getDocument(_documentHash, 1);

      expect(document1.title).to.equal("Test Document 1");
      expect(document2.title).to.equal("Test Document 2");
    });
  });

  describe("Event Emission", function () {
    it("should emit DocumentCreated event when a document is stored", async function () {
      const _title = "Test Document";
      const _description = "This is a test document.";
      const _resourceLocation = "http://testdocument.com";
      const _documentHash = 123456;
      const _tokenCount = 1000;
      const _lexicalDensity = 10;
      const _audienceEngagement = 50;
      const _vector = "1,2,3,4,5";

      await expect(
        rightful.storeDocument(
          _title,
          _description,
          _resourceLocation,
          _documentHash,
          _tokenCount,
          _lexicalDensity,
          _audienceEngagement,
          _vector
        )
      )
        .to.emit(rightful, "DocumentCreated")
        .withArgs(_documentHash, _vector);
    });
  });
});
