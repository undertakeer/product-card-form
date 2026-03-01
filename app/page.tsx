"use client";

const BASE_URL =
  "https://app.tablecrm.com/api/v1/nomenclature/?token=af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";


import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProductFormValues = {
  name: string;
  type: string;
  description_short: string;
  description_long: string;
  code: string;
  unit: string;
  category: string;
  cashback_type: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string | string[];
  global_category_id: string;
  marketplace_price: string;
  chatting_percent: string;
  address: string;
};

export default function ProductForm() {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      type: "product",
      cashback_type: "lcard_cashback",
    },
  });

  const { register, handleSubmit, watch } = form;

  const [mounted, setMounted] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  const generateKeywords = async () => {
    const currentName = watch("name");
    const currentDescription = watch("description_long");

    setKeywordsError(null);
    if (!currentName?.trim() || !currentDescription?.trim()) {
      setKeywordsError("Enter product name and long description first.");
      return;
    }

    setKeywordsLoading(true);
    try {
      const res = await fetch("/api/generateKeywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: currentName.trim(),
          description: currentDescription.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setKeywordsError(data?.error ?? "Failed to generate keywords");
        return;
      }

      if (data.keywords) {
        form.setValue("seo_keywords", data.keywords.trim());
      } else {
        setKeywordsError("No keywords returned");
      }
    } catch {
      setKeywordsError("Network error. Try again.");
    } finally {
      setKeywordsLoading(false);
    }
  };

  async function onSubmit(formData: ProductFormValues) {
    const data = {
      ...formData,
      seo_keywords:
        typeof formData.seo_keywords === "string"
          ? formData.seo_keywords.split(",")
          : formData.seo_keywords,
    };
    console.log("Form data:", data.seo_keywords);

    try {
      const res = await axios.post(BASE_URL, [data]);
      console.log("response is: ", res);
      toast.success("Product submitted successfully.");
      form.reset();
    } catch (err: unknown) {
      console.error("Submit error:", err);
      if (axios.isAxiosError(err)) {
        const axErr = err as import("axios").AxiosError<{ detail?: string; message?: string }>;
        const responseData = axErr.response?.data;
        if (responseData) {
          toast.error(responseData.detail ?? responseData.message ?? "Failed to submit. Please try again.");
        } else {
          toast.error(axErr.message ?? "Failed to submit. Please try again.");
        }
      } else {
        const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
        toast.error(msg);
      }
    }
  }

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="flex justify-center items-start py-10 min-h-screen">
      <div
        className="w-full max-w-xl mx-auto p-6 bg-black text-white rounded-xl
                  shadow-lg ring-2 ring-white/30 hover:ring-white/60 transition-all duration-300"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create Product</FieldLegend>
            </FieldSet>

            <FieldGroup>
              <Field>
                <FieldLabel>Name of product</FieldLabel>
                <Input placeholder="Enter product name" {...register("name")} />
              </Field>

              <Field>
                <FieldLabel>Type</FieldLabel>
                <Input {...register("type")} />
              </Field>

              <Field>
                <FieldLabel>Short description</FieldLabel>
                <Input
                  placeholder="Short description"
                  {...register("description_short")}
                />
              </Field>

              <Field>
                <FieldLabel>Long description</FieldLabel>
                <Textarea
                  placeholder="Long description"
                  {...register("description_long")}
                  className="h-24"
                />
              </Field>

              <Field>
                <FieldLabel>Product code (SKU)</FieldLabel>
                <Input placeholder="Code / Article" {...register("code")} />
              </Field>

              <Field>
                <FieldLabel>Unit ID</FieldLabel>
                <Input
                  type="number"
                  placeholder="e.g. 116"
                  {...register("unit")}
                />
              </Field>

              <Field>
                <FieldLabel>Category ID</FieldLabel>
                <Input
                  type="number"
                  placeholder="e.g. 2477"
                  {...register("category")}
                />
              </Field>

              <Field>
                <FieldLabel>Cashback type</FieldLabel>
                <Input {...register("cashback_type")} />
              </Field>

              <Field>
                <FieldLabel>SEO Title</FieldLabel>
                <Input placeholder="SEO title" {...register("seo_title")} />
              </Field>

              <Field>
                <FieldLabel>SEO Description</FieldLabel>
                <Textarea
                  placeholder="SEO description"
                  {...register("seo_description")}
                  className="h-20"
                />
              </Field>

              <div className="flex items-end gap-4">
                <Field>
                  <FieldLabel>SEO Keywords (comma separated)</FieldLabel>
                  <Input
                    placeholder="keyword1, keyword2"
                    {...register("seo_keywords")}
                  />
                  {keywordsError && (
                    <p className="text-sm text-red-400 mt-1">{keywordsError}</p>
                  )}
                </Field>

                <Button
                  type="button"
                  className="rounded-2xl p-0"
                  onClick={generateKeywords}
                  disabled={keywordsLoading}
                  aria-label="Generate SEO keywords with AI"
                >
                  {keywordsLoading ? (
                    <span className="flex items-center justify-center w-10 h-10 text-xs">...</span>
                  ) : (
                    <Image src="/ai-generate.png" alt="" width={40} height={40} />
                  )}
                </Button>
              </div>

              <Field>
                <FieldLabel>Global Category ID</FieldLabel>
                <Input
                  type="number"
                  placeholder="127"
                  {...register("global_category_id")}
                />
              </Field>

              <Field>
                <FieldLabel>Marketplace Price</FieldLabel>
                <Input
                  type="number"
                  placeholder="500"
                  {...register("marketplace_price")}
                />
              </Field>

              <Field>
                <FieldLabel>Chatting Percent</FieldLabel>
                <Input
                  type="number"
                  placeholder="4"
                  {...register("chatting_percent")}
                />
              </Field>

              <Field>
                <FieldLabel>Address</FieldLabel>
                <Input
                  placeholder="Street, city, country, postal code"
                  {...register("address")}
                />
              </Field>
            </FieldGroup>

            <Field orientation="horizontal" className="mt-6 flex gap-4">
              <Button
                type="submit"
                className="flex-1 border shadow-lg ring-2 ring-white/30 hover:ring-white/60 transition-all duration-300"
              >
                Submit
              </Button>
              <Button
                variant="outline"
                type="button"
                className="flex-1 shadow-lg ring-2 ring-white/30 hover:ring-white/60 transition-all duration-300"
              >
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </main>
  );
}
