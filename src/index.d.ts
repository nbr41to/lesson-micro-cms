type Book = {
  author: string;
  category: string[];
  createdAt: string;
  description: string;
  id: string;
  image: { url: string; height: number; width: number };
  publish: boolean;
  publishedAt: string;
  revisedAt: string;
  title: string;
  updatedAt: string;
  stripeId: string;
  price: any;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Book;
};
