import type { InferGetStaticPropsType, NextPage } from 'next';
import { createClient } from 'microcms-js-sdk';
import Stripe from 'stripe';
import { Item } from '../src/components/Item';
import { getStripe } from '../src/lib/stripejs';

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
  const subscription = async () => {
    try {
      const response = await fetch('/api/subscription-sessions', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
      });
      const session = await response.json();
      console.log('session', session);

      /* Redirect */
      const stripe = await getStripe();
      const { error } = await stripe!.redirectToCheckout({
        // Make the id field from the Checkout Session creation API response
        // available to this file, so you can provide it as parameter here
        // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
        sessionId: session.id,
      });
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `error.message`.
      console.warn(error.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className='text-xl'>商品一覧</h2>
      <div className='flex gap-4'>
        {books?.map((book, index) => (
          <Item key={`${book.id}${index}`} book={book} />
        ))}
      </div>
      <hr />
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={subscription}
      >
        定期購読はこちら
      </button>
    </div>
  );
};

export default Home;
