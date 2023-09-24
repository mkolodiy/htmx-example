import crypto from 'node:crypto';

export type Post = {
  id: string;
  title: string;
  description: string;
};

export type Comment = {
  id: string;
  postId: string;
  message: string;
  createdAt: Date;
};

let posts: Array<Post> = [];

const comments: Array<Comment> = [];

export async function createPost(newPost: Omit<Post, 'id'>) {
  const id = crypto.randomUUID();
  const post: Post = {
    id,
    ...newPost,
  };
  posts.push(post);
  return Promise.resolve(id);
}

export async function updatePost(newPost: Post) {
  const post = posts.find((post) => post.id === newPost.id);
  if (post) {
    post.title = newPost.title;
    post.description = newPost.description;
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}

export async function deletePost(id: string) {
  posts = posts.filter((post) => post.id !== id);
  return Promise.resolve();
}

export async function getPost(id: string) {
  const post = posts.find((post) => post.id === id);
  return Promise.resolve(post);
}

export async function getPosts() {
  return Promise.resolve(posts);
}

export async function searchPosts(searchTerm: string) {
  const result = posts.filter(
    (post) =>
      post.title.toLocaleLowerCase().includes(searchTerm) ||
      post.description.toLocaleLowerCase().includes(searchTerm)
  );
  return Promise.resolve(result);
}

export function getComments(postId: string) {
  const result = comments.filter((comment) => comment.postId === postId);
  return Promise.resolve(result);
}

export function createComment(newComment: Omit<Comment, 'id' | 'createdAt'>) {
  const id = crypto.randomUUID();
  const comment: Comment = {
    id,
    createdAt: new Date(),
    ...newComment,
  };
  comments.push(comment);
  return Promise.resolve(comment);
}
