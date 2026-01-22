"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema
const formSchema = z.object({
  location: z.string().min(2, "Location is required"),
  radius: z.number().min(1).max(50),
  dayOfWeek: z.string().optional(),
  date: z.string().optional(),
});

interface SearchFormProps {
  compact?: boolean;
  initialValues?: {
    location: string;
    radius: number;
    dayOfWeek?: string;
    date?: string;
  };
}

export default function SearchForm({ compact = false, initialValues }: SearchFormProps) {
  const router = useRouter();
  const [radius, setRadius] = useState(initialValues?.radius || 10);
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialValues?.location || "",
      radius: initialValues?.radius || 10,
      dayOfWeek: initialValues?.dayOfWeek || "any",
      date: initialValues?.date || "",
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    const searchParams = new URLSearchParams();
    searchParams.append("location", values.location);
    searchParams.append("radius", values.radius.toString());
    
    if (values.dayOfWeek && values.dayOfWeek !== "any") {
      searchParams.append("dayOfWeek", values.dayOfWeek);
    }
    
    if (values.date) {
      searchParams.append("date", values.date);
    }
    
    router.push(`/search?${searchParams.toString()}`);
  }
  
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-4'}`}>
            {/* Location Field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className={compact ? '' : 'md:col-span-2'}>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Where would you like to go Car Boot?"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Day of Week Select */}
            {!compact && (
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Any day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any day</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
            
            {/* Submit Button */}
            <FormItem>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </FormItem>
          </div>
          
          {/* Radius Slider */}
          <div className="pt-2">
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => {
                        field.onChange(values[0]);
                        setRadius(values[0]);
                      }}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mile</span>
                    <span className="font-bold text-gray-900 px-3 py-1 border border-red-400 rounded-md bg-white shadow-sm">{radius} miles</span>
                    <span>50 miles</span>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
