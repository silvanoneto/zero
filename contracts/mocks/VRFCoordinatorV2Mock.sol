// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VRFCoordinatorV2Mock
 * @notice Mock simplificado do Chainlink VRF Coordinator V2 para testes
 * @dev Para produção, usar o VRF Coordinator real do Chainlink
 */
contract VRFCoordinatorV2Mock {
    uint256 private _requestIdCounter;
    
    mapping(uint256 => address) private _consumers;
    
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint96 payment,
        bool success
    );
    
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256) {
        uint256 requestId = ++_requestIdCounter;
        _consumers[requestId] = msg.sender;
        
        emit RandomWordsRequested(
            keyHash,
            requestId,
            uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))),
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );
        
        return requestId;
    }
    
    /**
     * @notice Simula o callback do VRF (apenas para testes)
     * @dev Em produção, isso é chamado automaticamente pela rede Chainlink
     */
    function fulfillRandomWords(uint256 requestId, address consumer) external {
        require(_consumers[requestId] != address(0), "Request not found");
        
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = uint256(keccak256(abi.encodePacked(
            requestId,
            block.timestamp,
            block.prevrandao,
            blockhash(block.number - 1)
        )));
        
        // Chama o callback no consumer
        VRFConsumerBaseV2Mock(consumer).rawFulfillRandomWords(requestId, randomWords);
        
        emit RandomWordsFulfilled(requestId, randomWords[0], 0, true);
    }
}

/**
 * @title VRFConsumerBaseV2Mock
 * @notice Mock base para consumers do VRF V2
 */
abstract contract VRFConsumerBaseV2Mock {
    error OnlyCoordinatorCanFulfill(address have, address want);
    
    address private immutable vrfCoordinator;
    
    constructor(address _vrfCoordinator) {
        vrfCoordinator = _vrfCoordinator;
    }
    
    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        if (msg.sender != vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
        }
        fulfillRandomWords(requestId, randomWords);
    }
    
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;
}

/**
 * @title VRFCoordinatorV2Interface
 * @notice Interface mock do VRF Coordinator
 */
interface VRFCoordinatorV2Interface {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}
