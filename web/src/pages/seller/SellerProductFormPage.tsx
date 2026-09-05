import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { products } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { toast } from 'sonner'
import type { ProductStatus } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  technicalDescription: z.string().min(1),
  price: z.coerce.number().min(1),
  salePrice: z.coerce.number().optional().nullable(),
  stockQty: z.coerce.number().min(0),
  status: z.enum(['draft', 'published', 'out_of_stock', 'archived']),
})

type FormValues = z.infer<typeof schema>

interface SellerProductFormPageProps {
  productId?: string
}

export function SellerProductFormPage({ productId }: SellerProductFormPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const isEdit = !!productId

  const { data: existing } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => products.getProduct(productId!),
    enabled: isEdit,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      technicalDescription: '',
      price: 0,
      salePrice: null,
      stockQty: 0,
      status: 'draft',
    },
    values: existing
      ? {
          name: existing.name,
          technicalDescription: existing.technicalDescription,
          price: existing.price / 100,
          salePrice: existing.salePrice ? existing.salePrice / 100 : null,
          stockQty: existing.stockQty,
          status: existing.status,
        }
      : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    const payload = {
      sellerId: me!.sellerId!,
      name: values.name,
      technicalDescription: values.technicalDescription,
      price: Math.round(values.price * 100),
      salePrice: values.salePrice ? Math.round(values.salePrice * 100) : null,
      stockQty: values.stockQty,
      status: values.status as ProductStatus,
    }
    if (isEdit) {
      await products.updateProductApi(productId!, payload)
      toast.success('Product updated')
      void navigate({ to: '/seller/products/$productId', params: { productId: productId! } })
    } else {
      const created = await products.createProductApi(payload)
      await queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      toast.success('Product created')
      void navigate({ to: '/seller/products/$productId', params: { productId: created.id } })
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit product' : 'Create product'} />
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
            name="technicalDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (£)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{isEdit ? 'Save changes' : 'Create product'}</Button>
        </form>
      </Form>
    </div>
  )
}
