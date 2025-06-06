"use client"

import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/stores/game.store"

const formSchema = z.object({
  name: z.string().min(1, "Username is required"),
})

export default function Settings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  const {updateUsername} = useUserStore()
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const toastId = toast.loading("Saving...")
    try {
      await updateUsername(values.name)
      toast.success("Saved successfully", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Error saving", { id: toastId })
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left half - centered form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <h1 className="text-2xl font-bold mb-6">User Settings</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Right half - chess images */}
      <div className="w-1/2 bg-neutral-100 overflow-hidden">
        <div className="">
          <img src="bg_settings.png" />
        </div>
      </div>
    </div>
  )
}
