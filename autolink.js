// Auto Internal Link Script for Blogger
const JSON_URL = "https://ahanalui-hub.github.io/zoneadorn-scripts/published-posts.json";
const MAX_LINKS_PER_KEYWORD = 1;
const MIN_PARTIAL_WORDS = 2;
const EXCLUDE_SELECTORS = [".post-body a", ".toc", "pre", "code", "blockquote"];

// 🔹 Load all published post data from GitHub JSON
async function fetchPublishedPosts() {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) throw new Error("Failed to fetch JSON file");
    const posts = await response.json();
    console.log("✅ JSON Loaded Successfully:", posts.length, "posts found.");
    return posts;
  } catch (error) {
    console.error("❌ Error loading JSON:", error);
    return [];
  }
}

// 🔹 Add internal links dynamically
function addInternalLinks(html, posts) {
  let linksAdded = 0;

  posts.forEach(post => {
    if (linksAdded >= MAX_LINKS_PER_KEYWORD) return;
    const { keyword, url } = post;

    // Skip empty keywords
    if (!keyword || !url) return;

    // Full match (exact keyword)
    const fullRegex = new RegExp(`\\b(${keyword})\\b`, "gi");
    html = html.replace(fullRegex, match => {
      if (linksAdded < MAX_LINKS_PER_KEYWORD) {
        linksAdded++;
        console.log("🔗 Full Match:", match, "→", url);
        return `<a href="${url}" target="_blank">${match}</a>`;
      }
      return match;
    });

    // Partial match (any word inside keyword)
    if (linksAdded < MAX_LINKS_PER_KEYWORD) {
      const words = keyword.split(" ").filter(w => w.length >= MIN_PARTIAL_WORDS);
      if (words.length >= MIN_PARTIAL_WORDS) {
        const partialRegex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
        html = html.replace(partialRegex, match => {
          if (linksAdded < MAX_LINKS_PER_KEYWORD) {
            linksAdded++;
            console.log("🟡 Partial Match:", match, "→", url);
            return `<a href="${url}" target="_blank">${match}</a>`;
          }
          return match;
        });
      }
    }
  });

  return html;
}

// 🔹 Initialize after content loads
async function initAutoInternalLinks() {
  const posts = await fetchPublishedPosts();
  if (!posts.length) {
    console.warn("⚠️ No posts found for linking!");
    return;
  }

  const postBody = document.querySelector(".post-body");
  if (!postBody) return;

  // Exclude unwanted selectors
  EXCLUDE_SELECTORS.forEach(selector => {
    postBody.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Add links
  postBody.innerHTML = addInternalLinks(postBody.innerHTML, posts);
  console.log("✅ Auto Internal Linking Activated!");
}

// 🔹 Run after DOM fully loaded
document.addEventListener("DOMContentLoaded", initAutoInternalLinks);
