import { NextPage } from 'next';
import { useAtom } from 'jotai';
import { cartState } from '../src/jotai';
import Image from 'next/image';
import { TiShoppingCart } from 'react-icons/ti';
import { dateFormatted } from '../src/dateFormatted';
import { useRouter } from 'next/router';

const CartPage: NextPage = () => {
  const [cart] = useAtom(cartState);
  const router = useRouter();

  /* 表示用 */
  const items = Array.from(new Set(cart));

  /* 商品のそれぞれの個数 */
  const itemCounts = items.map((item) => {
    const count = cart.filter((book) => book.id === item.id).length;
    return {
      id: item.id,
      count,
    };
  }, {});

  return (
    <div>
      <div className='flex gap-4 py-4'>
        <h1 className='text-4xl'>Lesson Micro CMS</h1>
        <div className='w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center relative'>
          <TiShoppingCart className='text-4xl' />
          {cart.length > 0 && (
            <div className='absolute bg-orange-500 text-white flex justify-center items-center w-8 h-8 rounded-full font-bold -top-2 -right-2'>
              {cart.length}
            </div>
          )}
        </div>
      </div>
      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={() => router.back()}
      >
        戻る
      </button>
      <div className='flex gap-4'>
        {items.map((book) => (
          <div key={book.id} className='border p-2 w-60 rounded'>
            <div>
              {itemCounts.find((item) => item.id === book.id)?.count || 0}個
            </div>
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
            <p>{book.category.join(', ')}</p>
            <p>{dateFormatted({ date: book.createdAt })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartPage;
