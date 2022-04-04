import { VFC } from 'react';
import Image from 'next/image';
import { dateFormatted } from '../dateFormatted';
import { useAtom } from 'jotai';
import { cartState } from '../jotai';

type Props = {
  book: Book;
};

export const Item: VFC<Props> = ({ book }) => {
  const [cart, setCart] = useAtom(cartState);
  const isInCart = cart.some((item) => item.id === book.id);

  /* 商品をカートに追加 */
  const addToCart = (book: Book) => {
    const exist = cart.find((item) => item.id === book.id);
    if (!exist) {
      setCart((prev) => [
        ...prev,
        {
          id: book.id,
          quantity: 1,
          product: book,
        },
      ]);
    }
    if (exist) {
      setCart((prev) => {
        const newCart = [...prev];
        const index = newCart.findIndex((item) => item.id === book.id);
        newCart[index].quantity += 1;
        return newCart;
      });
    }
  };
  /* カートから商品を削除 */
  const removeFromCart = (book: Book) => {
    setCart((prev) => {
      const newCart = [...prev];
      const index = newCart.findIndex((item) => item.id === book.id);
      if (newCart[index].quantity === 1) {
        newCart.splice(index, 1);
      } else {
        newCart[index].quantity -= 1;
      }
      return newCart;
    });
  };

  return (
    <div>
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
        <div>¥{book.price.unit_amount.toLocaleString()}</div>
        {isInCart ? (
          <div className='flex justify-center items-center gap-4'>
            <button
              className='font-bold text-xl rounded-full flex justify-center items-center w-10 h-10 bg-slate-400 cursor-pointer'
              onClick={() => addToCart(book)}
            >
              ＋
            </button>
            <span>{cart.find((item) => item.id === book.id)?.quantity}</span>
            <button
              className='font-bold text-xl rounded-full flex justify-center items-center w-10 h-10 bg-slate-400 cursor-pointer'
              onClick={() => removeFromCart(book)}
            >
              −
            </button>
          </div>
        ) : (
          <div className='text-center'>
            <button
              className='rounded bg-slate-300 p-2 cursor-pointer'
              onClick={() => addToCart(book)}
            >
              カートに入れる
            </button>
          </div>
        )}
        <p>出品日{dateFormatted({ date: book.createdAt })}</p>
      </div>
    </div>
  );
};
