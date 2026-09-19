"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/features/billing/actions"
import { api } from "@/trpc/react"
import { Slider } from "@/components/ui/slider"
import { Info, CreditCard, Coins, Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import React, { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"

// ── Inner component that safely uses useSearchParams ──
const BillingContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentSuccess = searchParams.get("success") === "true"

  // fetch credits from API
  const { data: user } = api.project.getMyCredits.useQuery(undefined, {
    // When returning from payment, refetch every 2s so we catch the webhook update
    refetchInterval: paymentSuccess ? 2000 : false,
  })

  const [credited, setCredited] = React.useState(false)
  const [polling, setPolling] = React.useState(paymentSuccess)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!paymentSuccess) return

    // Stop polling after 30s even if webhook hasn't fired
    pollTimeoutRef.current = setTimeout(() => {
      setPolling(false)
      // Clean the URL
      router.replace("/billing")
    }, 30_000)

    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
  }, [paymentSuccess, router])

  useEffect(() => {
    if (!paymentSuccess || !user) return

    const current = user.credits ?? 0
    const prePaymentStr = localStorage.getItem("prePaymentCredits")

    // If no baseline stored, stop polling as soon as we have any credits
    if (!prePaymentStr) {
      if (current > 0) {
        setCredited(true)
        setPolling(false)
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
        setTimeout(() => router.replace("/billing"), 3000)
      }
      return
    }

    const prePayment = parseInt(prePaymentStr, 10)

    if (current > prePayment) {
      // Credits have increased — webhook landed!
      setCredited(true)
      setPolling(false)
      localStorage.removeItem("prePaymentCredits")
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
      setTimeout(() => router.replace("/billing"), 3000)
    }
  }, [user, paymentSuccess, router])

  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100])
  const creditsToBuyAmount = creditsToBuy[0]!
  const price = (creditsToBuyAmount / 50).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Payment success banner */}
      {(paymentSuccess || credited) && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
          {polling && !credited ? (
            <>
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Payment successful!</p>
                <p className="text-xs text-emerald-400/70">Waiting for credits to be added to your account…</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Credits added successfully!</p>
                <p className="text-xs text-emerald-400/70">Your account has been topped up. Happy building!</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Header Card */}
      <div className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
              <p className="text-sm text-muted-foreground">
                You currently have{" "}
                <span className="font-semibold text-primary">{user?.credits ?? 0}</span> credits.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            ${price} total
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Info className="size-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Each credit allows you to index 1 file in a repository.
            </p>
            <p className="text-sm text-muted-foreground">
              E.g. If your project has 100 files, you will need 100 credits to index it.
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">10 credits</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Coins className="h-4 w-4 text-primary" />
              {creditsToBuyAmount} credits
            </div>
            <span className="text-xs font-medium text-muted-foreground">1000 credits</span>
          </div>
          <Slider
            defaultValue={[100]}
            max={1000}
            min={10}
            step={10}
            onValueChange={setCreditsToBuy}
            value={creditsToBuy}
          />
        </div>

        {/* Purchase Button */}
        <div className="mt-8">
          <Button
            onClick={() => {
              if (user?.credits !== undefined) {
                localStorage.setItem("prePaymentCredits", user.credits.toString())
              }
              createCheckoutSession(creditsToBuyAmount)
            }}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            size="lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Buy {creditsToBuyAmount} credits for ${price}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Page wrapper with Suspense boundary (required for useSearchParams) ──
const BillingPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}

export default BillingPage
