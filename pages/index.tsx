import type { NextPage } from 'next';
import { createClient } from 'microcms-js-sdk'; //ES6
import Image from 'next/image';
import Stripe from 'stripe';

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
type Props = {
  books: Book[];
};

export const getStaticProps = async () => {
  /**
   * microCMS　SDKを利用して、商品データを取得する
   **/
  const client = createClient({
    serviceDomain: 'booknob',
    apiKey: process.env.MICROCMS_API_KEY || '',
  });
  const response = await client.get({
    endpoint: 'books',
    queries: { limit: 20 },
  });
  const books = response.contents;
  console.log('books', books);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2020-08-27',
  });
  /**
   * Stripe　SDKを利用して、料金データを取得し、マージする
   **/
  const products = await Promise.all(
    books.map(async (book: Book) => {
      try {
        const price = await stripe.prices.retrieve(book.stripeId);
        return {
          ...book,
          price: {
            unit_amount: price.unit_amount,
            currency: price.currency,
            id: price.id,
          },
        };
      } catch (e) {
        console.log('eeeee', e);
        return book;
      }
    }),
  );

  return {
    props: {
      books: products,
    },
  };
};

const Home: NextPage<Props> = ({ books }) => {
  console.log('client', books);

  return (
    <div>
      <h1>Lesson Micro CMS</h1>
      <div>
        {books?.map((book) => (
          <div key={book.id}>
            <p>著者：{book.author}</p>
            <h2>{book.title}</h2>
            <Image
              src={book.image.url}
              width={book.image.width}
              height={book.image.height}
              alt=''
            />
            <p>{book.description}</p>
            <p>{book.category.join(', ')}</p>
            <p>{book.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
