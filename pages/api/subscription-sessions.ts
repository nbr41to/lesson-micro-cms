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
      console.log('hello');
      // Create Checkout Sessions from body params.
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          line_items: [
            {
              price: 'price_1KnMuyBRpmzh4CVCVCB0CRDc',
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${req.headers.origin}/?status=success`, // Redirect URL
          cancel_url: `${req.headers.origin}/?success=field`,
        });
      console.log('session', session);

      res.status(200).json(session);
    } catch (err: any) {
      console.log('err', err);
      // res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
