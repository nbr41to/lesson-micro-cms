import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { TiShoppingCart } from 'react-icons/ti';
import { cartState } from '../jotai';

export const Layout: FC = ({ children }) => {
  const router = useRouter();
  const [cart] = useAtom(cartState);

  return (
    <div>
      <div className='flex items-center gap-4 py-4'>
        <h1 className='text-4xl'>Lesson Micro CMS</h1>
        <div
          className='w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center relative cursor-pointer'
          onClick={() => router.push('/cart')}
        >
          <TiShoppingCart className='text-4xl' />
          {cart.length > 0 && (
            <div className='absolute bg-orange-500 text-white flex justify-center items-center w-8 h-8 rounded-full font-bold -top-2 -right-2'>
              {cart.reduce((acc, cur) => acc + cur.quantity, 0)}
            </div>
          )}
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};
