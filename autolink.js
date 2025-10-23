(function() {
  var maxLinksPerKeyword = 2;
  var minPartialWords = 2;
  var excludeSelectors = ['.sidebar', '.footer', '.header'];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function addLinks(html, posts) {
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var linksAdded = 0;
      var targetAttr = post.nofollow ? ' rel="nofollow noopener noreferrer"' : ' rel="noopener noreferrer"';

      // Full match
      var fullRegex = new RegExp("\\b(" + escapeRegex(post.keyword) + ")\\b", "gi");
      html = html.replace(fullRegex, function(match) {
        if (linksAdded < maxLinksPerKeyword) {
          linksAdded++;
          return '<a href="' + post.url + '" target="_blank"' + targetAttr + '>' + match + '</a>';
        }
        return match;
      });

      // Partial match
      if (linksAdded < maxLinksPerKeyword) {
        var words = post.keyword.split(" ");
        var filtered = [];
        for (var w = 0; w < words.length; w++) {
          if (words[w].length >= minPartialWords) filtered.push(words[w]);
        }
        if (filtered.length >= minPartialWords) {
          var partialPattern = filtered.map(escapeRegex).join("|");
          var partialRegex = new RegExp("\\b(" + partialPattern + ")\\b", "gi");
          html = html.replace(partialRegex, function(match) {
            if (linksAdded < maxLinksPerKeyword) {
              linksAdded++;
              return '<a href="' + post.url + '" target="_blank"' + targetAttr + '>' + match + '</a>';
            }
            return match;
          });
        }
      }
    }
    return html;
  }

  function fetchPosts(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.zoneadorn.com/published-posts.json", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          callback(data);
        } catch(e) { console.log("JSON Parse Error"); }
      }
    };
    xhr.send();
  }

  function initAutoLinking() {
    fetchPosts(function(posts) {
      if (!posts || !posts.length) return;
      var postBody = document.querySelector(".post-body");
      if (!postBody) return;
      for (var e = 0; e < excludeSelectors.length; e++) {
        var ex = postBody.querySelector(excludeSelectors[e]);
        if (ex) ex.innerHTML = '';
      }
      postBody.innerHTML = addLinks(postBody.innerHTML, posts);
    });
  }

  document.addEventListener("DOMContentLoaded", initAutoLinking);
})();
