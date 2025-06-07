import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/game.store";
import { useNavigate } from "react-router-dom";

// Validation schema
const formSchema = z.object({
  name: z.string().min(1, "Username is required").max(50, "Username must be less than 50 characters"),
});

export default function Settings() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { updateUsername } = useUserStore();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await toast.promise(
        Promise.resolve(updateUsername(values.name)),
        {
          loading: "Updating username...",
          success: "Username updated successfully!",
          error: "Failed to update username.",
        }
      );
      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
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
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Updating..." : "Update Username"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right half - chess image */}
        <div className="w-1/2 bg-neutral-100 overflow-hidden">
          <img
            src="bg_settings.png"
            alt="Background"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      
      {/* Toaster component for notifications */}
      <Toaster 
        position="top-right"
        richColors
        expand={true}
        closeButton
      />
    </>
  );
}