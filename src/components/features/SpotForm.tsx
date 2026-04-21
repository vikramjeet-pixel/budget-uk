"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { LONDON_LOCATIONS } from "@/data/london-locations";

export const submissionSchema = z.object({
  name: z.string().min(2, "Spot name is too short"),
  category: z.string().min(1, "Please select a category"),
  priceTier: z.enum(["free", "£", "££", "£££", "££££"]),
  borough: z.string().min(1, "Please select a borough"),
  neighbourhood: z.string().min(1, "Please select a neighbourhood"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tips: z.array(z.object({
    value: z.string().min(5, "Tip is too short")
  })).min(1, "Add at least one tip"),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

const categories = [
  "food", "coffee", "housing", "workspace", "gym", "bars", "grocery", "accelerator", "vc", "entertainment", "services"
];

interface SpotFormProps {
  initialData?: Partial<SubmissionFormData>;
  onSubmit: (data: SubmissionFormData) => Promise<void>;
  isLoading: boolean;
  buttonText?: string;
}

export function SpotForm({ initialData, onSubmit, isLoading, buttonText = "Publish Spot" }: SpotFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      priceTier: initialData?.priceTier || "£",
      tips: initialData?.tips?.length ? initialData.tips : [{ value: "" }],
      ...initialData
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tips"
  });

  const selectedBorough = watch("borough");
  const availableNeighbourhoods = React.useMemo(() => {
    return LONDON_LOCATIONS.find(b => b.name === selectedBorough)?.neighbourhoods || [];
  }, [selectedBorough]);

  // Sync category and other external components with react-hook-form
  React.useEffect(() => {
    if (initialData?.category) setValue("category", initialData.category);
    if (initialData?.borough) setValue("borough", initialData.borough);
    if (initialData?.neighbourhood) setValue("neighbourhood", initialData.neighbourhood);
  }, [initialData, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 bg-[#f7f4ed] p-8 md:p-10 rounded-[12px] border border-[var(--border-passive)] shadow-sm">
      
      {/* Spot Name */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Spot Name</label>
        <Input 
          {...register("name")}
          placeholder="e.g. Franco Manca Brixton"
          className={cn(errors.name && "border-red-500")}
        />
        {errors.name && <span className="text-[12px] text-red-500">{errors.name.message}</span>}
      </div>

      {/* Category selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Category</label>
        <Select onValueChange={(val) => setValue("category", val)} value={watch("category")}>
          <SelectTrigger className={cn(errors.category && "border-red-500")}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <span className="text-[12px] text-red-500">{errors.category.message}</span>}
      </div>

      {/* Price Tier */}
      <div className="flex flex-col gap-3">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Price Tier</label>
        <RadioGroup 
          defaultValue={initialData?.priceTier || "£"} 
          className="flex gap-3"
          onValueChange={(val: any) => setValue("priceTier", val)}
          value={watch("priceTier")}
        >
          {["free", "£", "££", "£££", "££££"].map((tier) => (
            <div key={tier} className="flex items-center">
              <RadioGroupItem value={tier} id={`tier-${tier}`} className="sr-only" />
              <label 
                htmlFor={`tier-${tier}`}
                className={cn(
                  "px-4 py-2 rounded-full border border-[var(--border-interactive)] text-[14px] cursor-pointer transition-all",
                  watch("priceTier") === tier 
                    ? "bg-[#1c1c1c] text-white border-[#1c1c1c] shadow-md" 
                    : "bg-white text-[#1c1c1c] hover:border-[#1c1c1c]"
                )}
              >
                {tier === "free" ? "Free" : tier}
              </label>
            </div>
          ))}
        </RadioGroup>
        {errors.priceTier && <span className="text-[12px] text-red-500">{errors.priceTier.message}</span>}
      </div>

      {/* Location (Borough & Neighbourhood) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1c1c1c]">Borough</label>
          <Select 
            value={watch("borough")}
            onValueChange={(val) => {
              setValue("borough", val);
              setValue("neighbourhood", ""); // Reset neighbourhood when borough changes
            }}
          >
            <SelectTrigger className={cn(errors.borough && "border-red-500")}>
              <SelectValue placeholder="Select a borough" />
            </SelectTrigger>
            <SelectContent>
              {LONDON_LOCATIONS.map((b) => (
                <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.borough && <span className="text-[12px] text-red-500">{errors.borough.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1c1c1c]">Neighbourhood</label>
          <Select 
            onValueChange={(val) => setValue("neighbourhood", val)}
            disabled={!selectedBorough}
            value={watch("neighbourhood")}
          >
            <SelectTrigger className={cn(errors.neighbourhood && "border-red-500")}>
              <SelectValue placeholder={selectedBorough ? "Select a neighbourhood" : "Select a borough first"} />
            </SelectTrigger>
            <SelectContent>
              {availableNeighbourhoods.map((nbh) => (
                <SelectItem key={nbh} value={nbh}>{nbh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.neighbourhood && <span className="text-[12px] text-red-500">{errors.neighbourhood.message}</span>}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Description</label>
        <Textarea 
          {...register("description")}
          placeholder="What makes this spot special and budget-friendly?"
          className={cn("min-h-[120px] resize-none", errors.description && "border-red-500")}
        />
        {errors.description && <span className="text-[12px] text-red-500">{errors.description.message}</span>}
      </div>

      {/* Tips (Dynamic List) */}
      <div className="flex flex-col gap-3">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Pro Tips</label>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input 
                {...register(`tips.${index}.value` as const)}
                placeholder="e.g. Try the pasta on Tuesdays"
                className={cn(errors.tips?.[index]?.value && "border-red-500")}
              />
              {fields.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => append({ value: "" })}
          className="w-fit text-[13px] hover:bg-[#1c1c1c] hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another tip
        </Button>
      </div>

      {/* Photo Upload Placeholder */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#1c1c1c]">Photo</label>
        <div className="w-full h-40 border-2 border-dashed border-[var(--border-interactive)] rounded-[12px] flex flex-col items-center justify-center gap-2 bg-[#fcfbf8] opacity-60 cursor-not-allowed">
          <Camera className="w-8 h-8 text-[#5f5f5d]" />
          <span className="text-[13px] text-[#5f5f5d]">Photo upload coming soon</span>
        </div>
      </div>

      <hr className="my-2 border-[var(--border-passive)]" />

      <Button 
        type="submit" 
        variant="primary" 
        className="py-6 text-lg justify-center transition-all"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
}
