const stripe = Stripe('pk_test_51PSOTJGQKQvL2xOfBPkl3ORHGVbBCq9soqAhrWaaxEEntLO0MeAAPepJBLvg3MbRHuNDW4P3n2YMjj1AzOWWMajx00BfIjSsok')
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
// 1) Get checkout session from the API
const session = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`);


// 2) Create checkout form + charge credit card
await stripe.redirectToCheckout({
  sessionId: session.data.session.id
});

  } catch(err) {
    console.log(err);
showAlert('error', err);
  }
}