import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51NoqBbFmRo4wpcM6WYgWfqYRo2KckKWDxj2oJFn5eXCI6ZYL37he3WK6FlwAob5dAUSP9AOIAa0jOa4ynX87xQRO00Mi1NW0lw',
    );

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
