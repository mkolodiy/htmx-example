export type Post = {
  id: string;
  title: string;
  description: string;
};

const posts: Array<Post> = [
  {
    id: '1',
    title: 'Post 1',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
  },
  {
    id: '1',
    title: 'Different',
    description: 'Different post',
  },
];

export async function createPost(post: Post) {
  posts.push(post);
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
