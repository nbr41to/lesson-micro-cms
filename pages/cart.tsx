import { NextPage } from 'next';
import { useAtom } from 'jotai';
import { cartState } from '../src/jotai';
import { useRouter } from 'next/router';
import { Item } from '../src/components/Item';
import { getStripe } from '../src/lib/stripejs';

const CartPage: NextPage = () => {
  const [cart] = useAtom(cartState);
  const router = useRouter();
  const totalPrice = cart.reduce((acc, item) => {
    return acc + item.product.price.unit_amount * item.quantity;
  }, 0);

  const purchase = async () => {
    try {
      const response = await fetch('/api/checkout-sessions', {
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
        body: JSON.stringify({
          items: cart.map((item) => ({
            price: item.product.price.id,
            quantity: item.quantity,
          })),
        }),
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
      <div className='flex gap-2'>
        <span className='py-2 text-xl'>
          合計金額：{totalPrice.toLocaleString()}円
        </span>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={purchase}
        >
          購入する
        </button>
      </div>
      {cart.length > 0 ? (
        <div className='flex gap-4 mt-4'>
          {cart.map((item) => (
            <Item key={item.id} book={item.product} />
          ))}
        </div>
      ) : (
        <div className='py-10'>カートに商品がありません🫠</div>
      )}

      <div className='mt-6'>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => router.back()}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default CartPage;
