const API_URL = "https://eduflowpro.vitalstats.app/api/v1/graphql";
const API_KEY = "<YOUR_API_KEY>";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Api-Key": API_KEY,
};

// Reusable function to call the GraphQL API
async function callGraphQL(query, variables = {}) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();

    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  } catch (err) {
    throw new Error(`API Error: ${err.message}`);
  }
}

//######################################################################################
// Fetch all forum posts
//######################################################################################
async function fetchPosts() {
  const postHeading = document.querySelector(".right > h1");
  console.log(postHeading);

  postHeading.innerText = "Posts | Loading...";

  const query = `
    query {
      getForumPosts {
        ID: id
        Author_ID: author_id
        Copy: copy
      }
    }
  `;
  try {
    const data = await callGraphQL(query);
    const posts = data.getForumPosts;
    const list = document.getElementById("post-list");
    list.innerHTML = posts
      .slice()
      .reverse()
      .map(
        (p) =>
          `<div class="card">
          <div class="content">
          <div class="copy"> ${p.Copy} </div>
            <div class="author"> author_id: ${p.Author_ID} | </div>
            <div class="id"> post_id: ${p.ID} </div>
          </div>
          <div class="actions">
            <button class="delete" data-id="${p.ID}">Delete</button>
          </div>
        
        </div>`
      )
      .join("");
  } catch (err) {
    alert(err.message);
  } finally {
    postHeading.innerText = "Posts";
  }
}

//######################################################################################
// Create new post
//######################################################################################
async function createPost(copy) {
  const mutation = `
    mutation($payload: ForumPostCreateInput) {
      createForumPost(payload: $payload) {
        Copy: copy
      }
    }
  `;
  try {
    const data = await callGraphQL(mutation, {
      payload: { author_id: 62, copy },
    });
    document.getElementById("create-status").textContent =
      "Created successfully!";
    console.log("New Post:", data.createForumPost);

    fetchPosts();
  } catch (err) {
    document.getElementById("create-status").textContent = err.message;
  }
}

//######################################################################################
// Update post
//######################################################################################
async function updatePost(id, copy) {
  const mutation = `
    mutation($id: EduflowproForumPostID, $payload: ForumPostUpdateInput) {
      updateForumPost(query: [{ where: { id: $id } }], payload: $payload) {
        id
        copy
      }
    }
  `;
  try {
    const data = await callGraphQL(mutation, { id, payload: { copy } });
    document.getElementById("update-status").textContent =
      "Updated successfully!";
    console.log("Updated:", data.updateForumPost);

    fetchPosts();
  } catch (err) {
    document.getElementById("update-status").textContent = err.message;
  }
}

//######################################################################################
// Delete post
//######################################################################################
async function deletePost(id) {
  const mutation = `
    mutation($id: EduflowproForumPostID) {
      deleteForumPost(query: [{ where: { id: $id } }]) {
        id
      }
    }
  `;
  try {
    const data = await callGraphQL(mutation, { id });
    document.getElementById(
      "delete-status"
    ).textContent = `Post ${data.deleteForumPost.id} deleted`;

    fetchPosts();
  } catch (err) {
    document.getElementById("delete-status").textContent = err.message;
  }
}

//######################################################################################
// Event Listeners
//######################################################################################
document.getElementById("fetch-posts").addEventListener("click", fetchPosts);
document.getElementById("create-post").addEventListener("click", () => {
  const copy = document.getElementById("create-copy").value;
  if (!copy) return alert("Copy is required.");
  createPost(copy);
});
document.getElementById("update-post").addEventListener("click", () => {
  const id = document.getElementById("update-id").value;
  const copy = document.getElementById("update-copy").value;
  if (!id || !copy) return alert("Both ID and new copy are required.");
  updatePost(id, copy);
});
document.getElementById("delete-post").addEventListener("click", () => {
  const id = document.getElementById("delete-id").value;
  if (!id) return alert("ID is required.");
  deletePost(id);
});

//######################################################################################
// Delete button listener
//######################################################################################
document.getElementById("post-list").addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("delete")) {
    const id = e.target.dataset.id;
    if (confirm(`Are you sure you want to delete post ID ${id}?`)) {
      deletePost(id);
    }
  }
});
