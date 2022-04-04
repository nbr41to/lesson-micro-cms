import type { InferGetStaticPropsType, NextPage } from 'next';
import { createClient } from 'microcms-js-sdk';
import Stripe from 'stripe';
import { Item } from '../src/components/Item';

export const getStaticProps = async () => {
  /*
   * microCMS　SDKを利用して、商品データを取得する
   */
  const client = createClient({
    serviceDomain: 'booknob',
    apiKey: process.env.MICROCMS_API_KEY || '',
  });
  const response = await client.get({
    endpoint: 'books',
    queries: { limit: 20 },
  });
  const books = response.contents;

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
        return book;
      }
    }),
  );

  return {
    props: {
      books: products as Book[],
    },
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Home: NextPage<Props> = ({ books }) => {
  return (
    <div>
      <h2 className='text-xl'>商品一覧</h2>
      <div className='flex gap-4'>
        {books?.map((book, index) => (
          <Item key={`${book.id}${index}`} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Home;
