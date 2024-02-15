import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

// Definir el evento relevante para cuentas conectadas que deseas manejar
const connectedAccountWebhookEvent = 'payment_intent.succeeded'

export async function POST(req: NextRequest) {
  let stripeEvent: Stripe.Event
  const body = await req.text()
  const sig = headers().get('Stripe-Signature')
  const webhookSecret =
    process.env.CONNECTED_ACCOUNT_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET

  try {
    if (!sig || !webhookSecret) {
      console.log(
        '🔴 Error: Stripe webhook secret or the signature does not exist.'
      )
      return
    }
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (error: any) {
    console.log(`🔴 Error ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  try {
    if (stripeEvent.type === connectedAccountWebhookEvent) {
      // Manejar el evento payment_intent.succeeded para la cuenta conectada
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
      const connectedAccountId = paymentIntent.transfer_data?.destination
      console.log('Payment Intent Succeeded for Connected Account:', connectedAccountId)
      // Ejecutar acciones adicionales según sea necesario para procesar el pago
      // Por ejemplo, registrar la transacción en tu base de datos o notificar al usuario
    }
  } catch (error) {
    console.log(error)
    return new NextResponse('🔴 Webhook Error', { status: 400 })
  }

  // Responder con una respuesta JSON indicando que se recibió correctamente el evento
  return NextResponse.json(
    {
      webhookActionReceived: true,
    },
    {
      status: 200,
    }
  )
}
