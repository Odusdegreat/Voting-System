import { expect } from "chai";
import { ethers } from "hardhat";
import type { DAOVotingSystem } from "../typechain-types";

const VoteChoice = {
  NONE: 0,
  YES: 1,
  NO: 2,
};

describe("DAOVotingSystem", function () {
  let dao_voting_system: DAOVotingSystem;
  let owner: any;
  let member_1: any;
  let member_2: any;
  let outsider: any;

  beforeEach(async function () {
    [owner, member_1, member_2, outsider] = await ethers.getSigners();

    const dao_voting_system_factory = await ethers.getContractFactory(
      "DAOVotingSystem",
    );
    dao_voting_system = await dao_voting_system_factory.deploy();
    await dao_voting_system.waitForDeployment();
  });

  it("should set deployer as owner and member", async function () {
    expect(await dao_voting_system.owner()).to.equal(owner.address);
    expect(await dao_voting_system.is_member(owner.address)).to.equal(true);
  });

  it("should allow owner to add members", async function () {
    await dao_voting_system.add_member(member_1.address);

    expect(await dao_voting_system.is_member(member_1.address)).to.equal(true);
  });

  it("should not allow non-owner to add members", async function () {
    await expect(
      dao_voting_system.connect(member_1).add_member(member_2.address),
    ).to.be.revertedWith("Only owner can call this");
  });

  it("should allow members to create proposals", async function () {
    await dao_voting_system.add_member(member_1.address);

    await dao_voting_system
      .connect(member_1)
      .create_proposal(
        "Build Mobile App",
        "Should we build the mobile app first?",
        3600,
      );

    const proposal = await dao_voting_system.get_proposal(1);

    expect(proposal.id).to.equal(1);
    expect(proposal.title).to.equal("Build Mobile App");
    expect(proposal.description).to.equal(
      "Should we build the mobile app first?",
    );
    expect(proposal.executed).to.equal(false);
  });

  it("should not allow outsiders to create proposals", async function () {
    await expect(
      dao_voting_system
        .connect(outsider)
        .create_proposal("Hack", "Outsider proposal", 3600),
    ).to.be.revertedWith("Only members can call this");
  });

  it("should allow members to vote yes or no", async function () {
    await dao_voting_system.add_member(member_1.address);
    await dao_voting_system.add_member(member_2.address);

    await dao_voting_system.create_proposal(
      "Launch Feature",
      "Should we launch version 1?",
      3600,
    );

    await dao_voting_system
      .connect(member_1)
      .vote_on_proposal(1, VoteChoice.YES);
    await dao_voting_system
      .connect(member_2)
      .vote_on_proposal(1, VoteChoice.NO);

    const proposal = await dao_voting_system.get_proposal(1);

    expect(proposal.yes_votes).to.equal(1);
    expect(proposal.no_votes).to.equal(1);
  });

  it("should not allow double voting", async function () {
    await dao_voting_system.add_member(member_1.address);

    await dao_voting_system.create_proposal(
      "Treasury Spend",
      "Should we release 2 ETH?",
      3600,
    );

    await dao_voting_system
      .connect(member_1)
      .vote_on_proposal(1, VoteChoice.YES);

    await expect(
      dao_voting_system.connect(member_1).vote_on_proposal(1, VoteChoice.NO),
    ).to.be.revertedWith("Already voted");
  });

  it("should execute proposal after deadline and mark passed", async function () {
    await dao_voting_system.add_member(member_1.address);
    await dao_voting_system.add_member(member_2.address);

    await dao_voting_system.create_proposal(
      "Build DAO Frontend",
      "Should we build the frontend now?",
      60,
    );

    await dao_voting_system
      .connect(member_1)
      .vote_on_proposal(1, VoteChoice.YES);
    await dao_voting_system
      .connect(member_2)
      .vote_on_proposal(1, VoteChoice.YES);

    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []);

    await dao_voting_system.execute_proposal(1);

    const proposal = await dao_voting_system.get_proposal(1);

    expect(proposal.executed).to.equal(true);
    expect(proposal.passed).to.equal(true);
  });

  it("should mark proposal failed when no_votes are greater or equal", async function () {
    await dao_voting_system.add_member(member_1.address);
    await dao_voting_system.add_member(member_2.address);

    await dao_voting_system.create_proposal(
      "Buy Domain",
      "Should we buy a premium domain?",
      60,
    );

    await dao_voting_system
      .connect(member_1)
      .vote_on_proposal(1, VoteChoice.NO);
    await dao_voting_system
      .connect(member_2)
      .vote_on_proposal(1, VoteChoice.YES);

    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []);

    await dao_voting_system.execute_proposal(1);

    const proposal = await dao_voting_system.get_proposal(1);

    expect(proposal.executed).to.equal(true);
    expect(proposal.passed).to.equal(false);
  });
});
