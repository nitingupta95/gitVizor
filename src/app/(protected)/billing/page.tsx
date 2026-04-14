"use client"

import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/lib/stripe"
import { api } from "@/trpc/react"
import { Slider } from "@/components/ui/slider"
import { Info, CreditCard, Coins, Sparkles } from "lucide-react"
import React from "react"

const BillingPage = () => {
  // fetch credits from API
  const { data: user } = api.project.getMyCredits.useQuery()

  // slider expects an array of numbers like [100]
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100])

  // get the first value from the array
  const creditsToBuyAmount = creditsToBuy[0]!

  // calculate price
  const price = (creditsToBuyAmount / 50).toFixed(2)

  return (
    <div className="space-y-6">
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
                You currently have <span className="font-semibold text-primary">{user?.credits ?? 0}</span> credits.
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

export default BillingPage
