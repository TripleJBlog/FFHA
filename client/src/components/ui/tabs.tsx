import * as React from "react";

export function Tabs({ defaultValue, className, children }: React.PropsWithChildren<{ defaultValue?: string; className?: string }>) {
  const [value, setValue] = React.useState(defaultValue || "");
  return <div className={className}>{React.Children.map(children, (child) => (React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { value, setValue }) : child))}</div>;
}

export function TabsList({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value: triggerValue, setValue, value, className, children }: React.PropsWithChildren<{ value: string; setValue?: (v: string) => void; className?: string }>) {
  const isActive = value === triggerValue;
  return (
    <button type="button" className={className} data-state={isActive ? "active" : undefined} onClick={() => setValue && setValue(triggerValue)}>
      {children}
    </button>
  );
}

export function TabsContent({ value: contentValue, value: currentValue, className, children }: React.PropsWithChildren<{ value: string; className?: string }>) {
  // @ts-ignore
  return currentValue === contentValue ? <div className={className}>{children}</div> : null;
}
