"use client"

import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/lib/stripe"
import { api } from "@/trpc/react"
import { Slider } from "@/components/ui/slider"
import { Info } from "lucide-react"
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
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="text-sm text-muted-foreground">
              You currently have {user?.credits ?? 0} credits.
            </p>
          </div>
          <div className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            ${price} total
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full border border-border/60 bg-muted/40 p-1">
            <Info className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              Each credit allows you to index 1 file in a repository.
            </p>
            <p className="text-sm text-muted-foreground">
              E.g. If your project has 100 files, you will need 100 credits to index it.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Slider
            defaultValue={[100]}
            max={1000}
            min={10}
            step={10}
            onValueChange={setCreditsToBuy}
            value={creditsToBuy}
          />
        </div>

        <div className="mt-6">
          <Button
            onClick={() => {
              createCheckoutSession(creditsToBuyAmount)
            }}
          >
            Buy {creditsToBuyAmount} credits for ${price}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BillingPage
