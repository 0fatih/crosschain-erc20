// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract Token is ERC20, EIP712 {
    // EIP-712
    using ECDSA for bytes32;

    struct MintRequest {
        address to;
        uint256 amount;
        uint256 nonce;
    }

    bytes32 private constant REQUEST_TYPEHASH = keccak256(abi.encodePacked("Request(address to,uint256 amount,uint256 nonce)"));
    // EIP-712

    mapping(address => uint256) public nonces;

    address immutable public VERIFIER;
    
    constructor(address _verifier) ERC20("My Awesome Token", "MAT") EIP712("My Awesome Token", "1") {
        _mint(msg.sender, 100_000_000 * 1e18);
        VERIFIER = _verifier;
    }

    function mint(MintRequest memory request, bytes memory signature) external {
        if(request.nonce != nonces[request.to])
            revert WrongNonce();

        if(verify(request, signature) != VERIFIER)
            revert WrongSigner();
        
        nonces[request.to]++;

        _mint(request.to, request.amount);
    }

    function moveToOtherChain(uint256 amount) external {
      _burn(msg.sender, amount);

      emit Moved(msg.sender, amount);
    }

    function verify(MintRequest memory request, bytes memory signature) public view returns(address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(REQUEST_TYPEHASH, request.to, request.amount, request.nonce)));

        return ECDSA.recover(digest, signature);
    }

    // Events
    event Moved(address indexed owner, uint256 amount);

    // Errors
    error WrongNonce();
    error WrongSigner();
}
