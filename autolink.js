// ✅ Auto Internal Link Script for Blogger (ZoneAdorn Edition)
const JSON_URL = "https://ahanalui-hub.github.io/zoneadorn-scripts/published-posts.json";
const MAX_LINKS_PER_KEYWORD = 1;
const MIN_PARTIAL_WORDS = 2;
const EXCLUDE_TAGS = ["A", "PRE", "CODE", "BLOCKQUOTE"];

// 🔹 Fetch published post data from JSON
async function fetchPublishedPosts() {
  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error("Failed to load JSON");
    const posts = await res.json();
    console.log("✅ Loaded:", posts.length, "posts from JSON");
    return posts;
  } catch (err) {
    console.error("❌ JSON Fetch Error:", err);
    return [];
  }
}

// 🔹 Check if a node is inside excluded tag
function isInsideExcluded(node) {
  let parent = node.parentNode;
  while (parent && parent.nodeType === 1) {
    if (EXCLUDE_TAGS.includes(parent.tagName)) return true;
    parent = parent.parentNode;
  }
  return false;
}

// 🔹 Main linking function
function addInternalLinks(container, posts) {
  posts.forEach(post => {
    let linksAdded = 0;
    const { keyword, url } = post;
    if (!keyword || !url) return;

    const regexFull = new RegExp(`\\b(${keyword})\\b`, "gi");
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];

    // Collect text nodes
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!isInsideExcluded(node) && node.nodeValue.trim().length) {
        textNodes.push(node);
      }
    }

    // Replace text in nodes
    textNodes.forEach(node => {
      if (linksAdded >= MAX_LINKS_PER_KEYWORD) return;

      const val = node.nodeValue;
      if (regexFull.test(val)) {
        const span = document.createElement("span");
        span.innerHTML = val.replace(regexFull, match => {
          if (linksAdded < MAX_LINKS_PER_KEYWORD) {
            linksAdded++;
            console.log(`🔗 Linked "${match}" → ${url}`);
            return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${match}</a>`;
          }
          return match;
        });
        node.replaceWith(...span.childNodes);
      }
    });
  });
}

// 🔹 Initialize when DOM ready
async function initAutoInternalLinks() {
  const posts = await fetchPublishedPosts();
  if (!posts.length) {
    console.warn("⚠️ No JSON data found for linking!");
    return;
  }

  const postBody = document.querySelector(".post-body");
  if (!postBody) {
    console.warn("⚠️ .post-body not found on this page!");
    return;
  }

  addInternalLinks(postBody, posts);
  console.log("✅ Auto Internal Linking Activated on zoneadorn.com!");
}

document.addEventListener("DOMContentLoaded", initAutoInternalLinks);
