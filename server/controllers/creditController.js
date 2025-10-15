import Stripe from 'stripe';
import Transaction from '../models/transaction.js';

const plans = [
  {
    _id: 'basic',
    name: 'Basic',
    price: 10,
    credits: 100,
    features: [
      '100 text generations',
      '50 image generations',
      'Standard support',
      'Access to basic models',
    ],
  },
  {
    _id: 'pro',
    name: 'Pro',
    price: 20,
    credits: 500,
    features: [
      '500 text generations',
      '200 image generations',
      'Priority support',
      'Access to pro models',
      'Faster response time',
    ],
  },
  {
    _id: 'premium',
    name: 'Premium',
    price: 30,
    credits: 1000,
    features: [
      '1000 text generations',
      '500 image generations',
      '24/7 VIP support',
      'Access to premium models',
      'Dedicated account manager',
    ],
  },
];

// api for getting all plans
export const getPlans = async (request, response) => {
  try {
    response.json({ success: true, plans });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// api for purchasing plan
export const purchasePlan = async (request, response) => {
  try {
    const { planId } = request.body;
    const userId = request.user._id;
    const plan = plans.find((plan) => plan._id === planId);

    if (!plan) return response.json({ success: false, message: 'Invalid plan' });

    // create new transaction
    const transaction = await Transaction.create({
      userId: userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const { origin } = request.headers;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: plan.price * 100,
            product_data: {
              name: plan.name,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/loading`,
      cancel_url: `${origin}`,
      metadata: { transactionId: transaction._id.toString(), appId: 'clonegpt' },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    console.log('stripe redirect to: ', origin);

    response.json({ success: true, url: session.url });
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};
