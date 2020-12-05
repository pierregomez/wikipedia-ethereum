pragma solidity ^0.5.0;

contract Wikipedia {
  struct Article {
    string content;
  }

  uint[] public ids;
  mapping (uint => Article) public articlesById;

  constructor() public {
    uint index = 0;
    ids.push(index);
    Article memory newArticle = Article("This is your first article in your contract");
    articlesById[index] = newArticle;
  }

  function articleContent(uint index) public view returns (string memory content) {
    return articlesById[index].content;
  }

  function getAllIds() public view returns (uint[] memory allids) {
    return ids;
  }

  function addNewArticle(string memory content) public {
      uint index = ids.length;
      ids.push(index);
      Article memory newArticle = Article(content);
      articlesById[index] = newArticle;
  }

  function updateArticle(uint index, string memory content) public {
    Article memory updatedArticle = Article(content);
    articlesById[index] = updatedArticle;
  }
}
