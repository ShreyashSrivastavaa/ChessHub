"use client";

import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className = "" }: FaqAccordionProps) {
  return (
    <Accordion.Root type="single" collapsible className={`w-full divide-y divide-[#1d1d1d] ${className}`}>
      {items.map((item, idx) => (
        <Accordion.Item key={idx} value={`item-${idx}`} className="py-5">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex flex-1 items-center justify-between text-left text-[20px] font-[family-name:var(--font-heading)] font-light text-[#ffffff] cursor-pointer group py-1">
              <span>{item.question}</span>
              <Plus
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-[#d6d5d0] transition-transform duration-200 group-data-[state=open]:rotate-45"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-3 text-[15px] leading-[1.6] text-[#d6d5d0] font-[family-name:var(--font-body)] overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <p>{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
