import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2020-08-27',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  if (method === 'POST') {
    try {
      // Create Checkout Sessions from body params.
      const session: Stripe.Subscription = await stripe.subscriptions.del(
        'sub_1KnNBjBRpmzh4CVCMWll9K73',
      );
      console.log('unsubscribe', session);

      res.status(200).end();
    } catch (err: any) {
      console.log('err', err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
