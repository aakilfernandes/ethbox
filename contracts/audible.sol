import "owned.sol";
import "Forum.sol";

contract audible is owned{

	function addComment(address forumAddr, bytes32 parentId, bytes data){
		this.requireOwnership();
		Forum(forumAddr).addComment(parentId,data);
	}

}