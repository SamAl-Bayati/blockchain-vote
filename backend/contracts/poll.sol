// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PollContract {
    uint256 public pollCount = 0;

    struct Option {
        string text;
        uint256 voteCount;
    }

    struct Poll {
        uint256 id;
        address creator;
        string title;
        string description;
        mapping(uint256 => Option) options;
        uint256 optionsCount;
        mapping(address => bool) voters;
        bool exists;
    }

    mapping(uint256 => Poll) public polls;

    event PollCreated(
        uint256 id,
        address creator,
        string title,
        string description,
        uint256 optionsCount
    );

    event Voted(uint256 pollId, address voter, uint256 optionId);

    function createPoll(
        string memory _title,
        string memory _description,
        string[] memory _options
    ) public {
        require(_options.length >= 2, "At least two options required");

        pollCount++;
        Poll storage poll = polls[pollCount];
        poll.id = pollCount;
        poll.creator = msg.sender;
        poll.title = _title;
        poll.description = _description;
        poll.optionsCount = _options.length;
        poll.exists = true;

        for (uint256 i = 0; i < _options.length; i++) {
            poll.options[i] = Option({text: _options[i], voteCount: 0});
        }

        emit PollCreated(poll.id, msg.sender, _title, _description, _options.length);
    }

    function vote(uint256 _pollId, uint256 _optionId) public {
        Poll storage poll = polls[_pollId];
        require(poll.exists, "Poll does not exist");
        require(!poll.voters[msg.sender], "Already voted");
        require(_optionId < poll.optionsCount, "Invalid option");

        poll.options[_optionId].voteCount++;
        poll.voters[msg.sender] = true;

        emit Voted(_pollId, msg.sender, _optionId);
    }

    function getOption(uint256 _pollId, uint256 _optionId)
        public
        view
        returns (string memory, uint256)
    {
        Poll storage poll = polls[_pollId];
        require(poll.exists, "Poll does not exist");
        require(_optionId < poll.optionsCount, "Invalid option");

        Option storage option = poll.options[_optionId];
        return (option.text, option.voteCount);
    }

    function getPoll(uint256 _pollId)
        public
        view
        returns (
            uint256,
            address,
            string memory,
            string memory,
            uint256
        )
    {
        Poll storage poll = polls[_pollId];
        require(poll.exists, "Poll does not exist");

        return (
            poll.id,
            poll.creator,
            poll.title,
            poll.description,
            poll.optionsCount
        );
    }
}
