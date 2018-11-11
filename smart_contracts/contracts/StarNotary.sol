pragma solidity ^0.4.23;

import "./ERC721Token.sol";

contract StarNotary is ERC721Token { 

    struct Star { 
        string name;
        string dec;
        string mag;
        string cent;
        string story;
    }
    
    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    mapping(string => uint32) public starMap;

    event Exists(bool _status);


    function append(string a, string sep, string b) internal pure returns (string) {
        return string(abi.encodePacked(a, sep, b));
    }

    function checkStarExists(string _dec, string _mag) public returns (bool) {
        string storage decMag = append(_dec, ":", _mag);
        if (starMap[decMag] != 1) {
            emit Exists(false);
            return false;
        } else {
            emit Exists(true);
            return true;
        }
    }

    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public { 
        require(checkStarExists(_dec, _mag), "Star does not exist");

        string decMag = append(_dec, ":", _mag);
        starMap[decMag] = 1;

        Star memory newStar = Star(_name, _dec, _mag, _cent, _story);

        tokenIdToStarInfo[_tokenId] = newStar;

        ERC721Token.mint(_tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);

        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }
}