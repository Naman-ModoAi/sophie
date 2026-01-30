import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    console.log('[Stripe Webhook] Received event:', event.type, event.id);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe Webhook] Checkout session completed:', session.id);

        const userId = session.metadata?.userId;
        if (!userId) {
          console.error('[Stripe Webhook] No userId in checkout session metadata');
          break;
        }

        // For subscription checkouts, immediately update user plan
        if (session.mode === 'subscription' && session.subscription) {
          console.log(`[Stripe Webhook] Updating user ${userId} to pro plan immediately`);

          const { error: userError } = await supabase
            .from('users')
            .update({
              stripe_customer_id: session.customer as string,
              plan_type: 'pro',
            })
            .eq('id', userId);

          if (userError) {
            console.error('[Stripe Webhook] Error updating user on checkout completion:', userError);
          } else {
            console.log('[Stripe Webhook] User plan updated to pro immediately after checkout');
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Stripe Webhook] Subscription ID:', subscription.id);
        console.log('[Stripe Webhook] Customer ID:', subscription.customer);
        console.log('[Stripe Webhook] Metadata:', subscription.metadata);

        let userId = subscription.metadata?.userId;

        // Fallback: lookup user by customer_id if metadata missing
        if (!userId) {
          console.warn('[Stripe Webhook] No userId in subscription metadata, looking up by customer_id');
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer as string)
            .single();

          userId = user?.id;
        }

        if (!userId) {
          console.error('[Stripe Webhook] Cannot determine userId for subscription');
          break;
        }

        console.log(`[Stripe Webhook] Processing subscription ${event.type} for user ${userId}`);

        // Get plan_id from Stripe price_id lookup
        const priceId = subscription.items.data[0]?.price.id;
        const { data: plan } = await supabase
          .from('plans')
          .select('id, name, monthly_credits')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          console.error(`[Stripe Webhook] No plan found for price_id: ${priceId}`);
          // Still update user to pro if subscription is active, even if plan lookup fails
          if (subscription.status === 'active') {
            await supabase
              .from('users')
              .update({
                stripe_subscription_id: subscription.id,
                stripe_subscription_status: subscription.status,
                stripe_customer_id: subscription.customer as string,
                plan_type: 'pro',
              })
              .eq('id', userId);
            console.log('[Stripe Webhook] Updated user to pro plan (fallback)');
          }
          break;
        }

        console.log(`[Stripe Webhook] Plan found: ${plan.name} (${plan.id})`);

        // Upsert subscription record - handle period timestamps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = subscription as any;
        const currentPeriodStart = typeof subData.current_period_start === 'number'
          ? new Date(subData.current_period_start * 1000).toISOString()
          : new Date().toISOString();
        const currentPeriodEnd = typeof subData.current_period_end === 'number'
          ? new Date(subData.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days default

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subData.cancel_at_period_end || false,
          }, {
            onConflict: 'stripe_subscription_id'
          });

        if (subError) {
          console.error('[Stripe Webhook] Error upserting subscription:', subError);
        } else {
          console.log('[Stripe Webhook] Subscription record created/updated');
        }

        // Allocate monthly credits immediately for active subscriptions
        if (subscription.status === 'active') {
          const { error: creditError } = await supabase.rpc('allocate_monthly_credits', {
            p_user_id: userId
          });

          if (creditError) {
            console.error('[Stripe Webhook] Error allocating credits:', creditError);
          } else {
            console.log(`[Stripe Webhook] Allocated ${plan.monthly_credits} credits to user`);
          }
        }

        // Update user's plan_type for backward compatibility
        await supabase
          .from('users')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: subscription.status,
            stripe_customer_id: subscription.customer as string,
            plan_type: subscription.status === 'active' && plan.name === 'pro' ? 'pro' : 'free',
          })
          .eq('id', userId);

        console.log('[Stripe Webhook] User record updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;

        // Fallback: lookup user by customer_id if metadata missing
        if (!userId) {
          console.warn('[Stripe Webhook] No userId in subscription metadata, looking up by customer_id');
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer as string)
            .single();

          userId = user?.id;
        }

        if (!userId) {
          console.error('[Stripe Webhook] Cannot determine userId for subscription');
          break;
        }

        console.log(`[Stripe Webhook] Processing subscription deletion for user ${userId}`);

        // Update subscription status to canceled
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        // Downgrade user to free plan
        await supabase
          .from('users')
          .update({
            stripe_subscription_id: null,
            stripe_subscription_status: 'canceled',
            plan_type: 'free',
          })
          .eq('id', userId);

        // Allocate free plan credits
        await supabase.rpc('allocate_monthly_credits', {
          p_user_id: userId
        });

        console.log('[Stripe Webhook] User downgraded to free plan');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoiceData = invoice as any;
        const customerId = invoice.customer as string;

        console.log(`[Stripe Webhook] Processing successful payment for invoice ${invoice.id}`);

        // Get user ID from customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.warn('[Stripe Webhook] No user found for customer:', customerId);
          break;
        }

        // Get subscription ID from subscriptions table
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', invoiceData.subscription as string)
          .single();

        // Upsert transaction record (use upsert to handle duplicate webhooks)
        const { error: txError } = await supabase
          .from('transactions')
          .upsert({
            user_id: user.id,
            subscription_id: subscription?.id || null,
            stripe_transaction_id: invoiceData.charge || invoice.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoiceData.payment_intent,
            amount_cents: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            description: invoice.description || `Payment for invoice ${invoiceData.number || 'N/A'}`,
            metadata: {
              invoice_number: invoiceData.number,
              period_start: invoiceData.period_start,
              period_end: invoiceData.period_end,
            }
          }, {
            onConflict: 'stripe_transaction_id'
          });

        if (txError) {
          console.error('[Stripe Webhook] Error creating transaction:', txError);
        } else {
          console.log('[Stripe Webhook] Transaction record created');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoiceData = invoice as any;
        const customerId = invoice.customer as string;

        console.log(`[Stripe Webhook] Processing failed payment for invoice ${invoice.id}`);

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoiceData.subscription as string);

          // Update user record
          await supabase
            .from('users')
            .update({ stripe_subscription_status: 'past_due' })
            .eq('id', user.id);

          console.log('[Stripe Webhook] Subscription marked as past_due');
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
