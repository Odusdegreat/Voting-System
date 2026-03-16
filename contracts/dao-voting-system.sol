// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DAOVotingSystem {
    enum VoteChoice {
        NONE,
        YES,
        NO
    }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 deadline;
        uint256 yes_votes;
        uint256 no_votes;
        bool executed;
        bool passed;
        address created_by;
    }

    address public owner;
    uint256 public proposal_count;

    mapping(address => bool) public is_member;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => VoteChoice)) public votes;

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event ProposalCreated(
        uint256 indexed proposal_id,
        string title,
        uint256 deadline,
        address indexed created_by
    );
    event Voted(
        uint256 indexed proposal_id,
        address indexed voter,
        VoteChoice choice
    );
    event ProposalExecuted(
        uint256 indexed proposal_id,
        bool passed,
        uint256 yes_votes,
        uint256 no_votes
    );

    modifier only_owner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier only_member() {
        require(is_member[msg.sender], "Only members can call this");
        _;
    }

    modifier proposal_exists(uint256 _proposal_id) {
        require(
            _proposal_id > 0 && _proposal_id <= proposal_count,
            "Proposal does not exist"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        is_member[msg.sender] = true;
        emit MemberAdded(msg.sender);
    }

    function add_member(address _member) external only_owner {
        require(_member != address(0), "Invalid address");
        require(!is_member[_member], "Already a member");

        is_member[_member] = true;
        emit MemberAdded(_member);
    }

    function remove_member(address _member) external only_owner {
        require(_member != address(0), "Invalid address");
        require(is_member[_member], "Not a member");
        require(_member != owner, "Cannot remove owner");

        is_member[_member] = false;
        emit MemberRemoved(_member);
    }

    function create_proposal(
        string calldata _title,
        string calldata _description,
        uint256 _duration_in_seconds
    ) external only_member returns (uint256) {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_duration_in_seconds > 0, "Duration must be greater than zero");

        proposal_count++;

        uint256 proposal_id = proposal_count;
        uint256 deadline = block.timestamp + _duration_in_seconds;

        proposals[proposal_id] = Proposal({
            id: proposal_id,
            title: _title,
            description: _description,
            deadline: deadline,
            yes_votes: 0,
            no_votes: 0,
            executed: false,
            passed: false,
            created_by: msg.sender
        });

        emit ProposalCreated(proposal_id, _title, deadline, msg.sender);

        return proposal_id;
    }

    function vote_on_proposal(
        uint256 _proposal_id,
        VoteChoice _choice
    ) external only_member proposal_exists(_proposal_id) {
        Proposal storage proposal = proposals[_proposal_id];

        require(block.timestamp < proposal.deadline, "Voting has ended");
        require(!proposal.executed, "Proposal already executed");
        require(votes[_proposal_id][msg.sender] == VoteChoice.NONE, "Already voted");
        require(
            _choice == VoteChoice.YES || _choice == VoteChoice.NO,
            "Invalid vote choice"
        );

        votes[_proposal_id][msg.sender] = _choice;

        if (_choice == VoteChoice.YES) {
            proposal.yes_votes++;
        } else {
            proposal.no_votes++;
        }

        emit Voted(_proposal_id, msg.sender, _choice);
    }

    function execute_proposal(
        uint256 _proposal_id
    ) external proposal_exists(_proposal_id) {
        Proposal storage proposal = proposals[_proposal_id];

        require(block.timestamp >= proposal.deadline, "Voting is still ongoing");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;

        if (proposal.yes_votes > proposal.no_votes) {
            proposal.passed = true;
        } else {
            proposal.passed = false;
        }

        emit ProposalExecuted(
            _proposal_id,
            proposal.passed,
            proposal.yes_votes,
            proposal.no_votes
        );
    }

    function get_proposal(
        uint256 _proposal_id
    )
        external
        view
        proposal_exists(_proposal_id)
        returns (Proposal memory)
    {
        return proposals[_proposal_id];
    }

    function get_vote_status(
        uint256 _proposal_id,
        address _voter
    )
        external
        view
        proposal_exists(_proposal_id)
        returns (VoteChoice)
    {
        return votes[_proposal_id][_voter];
    }
}