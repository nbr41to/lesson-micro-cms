import type { InferGetStaticPropsType, NextPage } from 'next';
import { createClient } from 'microcms-js-sdk'; //ES6
import Image from 'next/image';
import Stripe from 'stripe';
import { useAtom } from 'jotai';

import { TiShoppingCart } from 'react-icons/ti';
import { cartState } from '../src/jotai';
import { dateFormatted } from '../src/dateFormatted';
import { useRouter } from 'next/router';

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
      books: products as Book[],
    },
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Home: NextPage<Props> = ({ books }) => {
  console.log('client', books);
  const router = useRouter();

  const [cart, setCart] = useAtom(cartState);
  console.log('cart', cart);

  return (
    <div>
      <div className='flex gap-4 py-4'>
        <h1 className='text-4xl'>Lesson Micro CMS</h1>
        <div
          className='w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center relative cursor-pointer'
          onClick={() => router.push('/cart')}
        >
          <TiShoppingCart className='text-4xl' />
          {cart.length > 0 && (
            <div className='absolute bg-orange-500 text-white flex justify-center items-center w-8 h-8 rounded-full font-bold -top-2 -right-2'>
              {cart.length}
            </div>
          )}
        </div>
      </div>
      <div className='flex gap-4'>
        {books?.map((book) => (
          <div key={book.id} className='border p-2 w-60 rounded'>
            <h2 className='font-bold'>{book.title}</h2>
            <p>著者：{book.author}</p>
            <div className='relative w-40 h-40 mx-auto'>
              <Image
                src={book.image.url}
                layout='fill'
                objectFit='contain'
                alt=''
              />
            </div>
            <p>{book.description}</p>
            <p>ジャンル：{book.category.join(', ')}</p>
            <div>¥{book.price.unit_amount}</div>
            <button
              className='rounded bg-slate-300 p-2 cursor-pointer'
              onClick={() => setCart((prev) => [...prev, book])}
            >
              カートに入れる
            </button>
            <p>出品日{dateFormatted({ date: book.createdAt })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
