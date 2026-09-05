import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { buyers } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export function BuyerProfilePage() {
  const queryClient = useQueryClient()
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })

  const form = useForm({
    resolver: zodResolver(schema),
    values: me ? { name: me.name, email: me.email } : undefined,
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!me?.buyerId) return
    await buyers.updateBuyer(me.buyerId, values)
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    toast.success('Profile updated')
  }

  return (
    <div>
      <PageHeader title="Profile" description="Update your account details" />
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="max-w-xl space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save changes</Button>
        </form>
      </Form>
    </div>
  )
}
