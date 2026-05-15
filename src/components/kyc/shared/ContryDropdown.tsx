"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { getCountries, type Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CountryEntry {
  value: Country;
  label: string;
}

interface CountryDropdownProps {
  value: Country;
  onChange: (value: Country) => void;
  disabled?: boolean;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const countryOptions: CountryEntry[] = getCountries().map((code) => ({
    value: code,
    label: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-md px-3 h-12 w-full justify-between"
          disabled={disabled}
        >
          <div className="flex gap-2 items-center line-clamp-1">
            <FlagComponent country={value} countryName={value} />
            <span>
              {new Intl.DisplayNames(["en"], { type: "region" }).of(value)}
            </span>
          </div>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryOptions.map(({ value: code, label }) => (
                  <CommandItem
                    key={code}
                    onSelect={() => {
                      onChange(code);
                      setOpen(false); // Close the dropdown
                    }}
                    className="gap-2"
                  >
                    <FlagComponent country={code} countryName={label} />
                    <span className="flex-1 text-sm">{label}</span>
                    {/* <span className='text-sm text-foreground/50'>
                      +{getCountryCallingCode(code)}
                    </span> */}
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        code === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({
  country,
  countryName,
}: {
  country: Country;
  countryName: string;
}) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm flag-container">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
