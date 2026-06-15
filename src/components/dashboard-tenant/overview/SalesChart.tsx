"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMonthlyRevenueForTenant } from "@/hooks/useTenantTransactions";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SalesChart() {
  const { data: monthlyRevenue, isPending } = useGetMonthlyRevenueForTenant();

  const chartData =
    monthlyRevenue?.map((d) => ({
      month: MONTH_LABELS[d.month - 1],
      revenue: d.revenue,
    })) ?? [];

  if (isPending) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  };

  if (!monthlyRevenue || monthlyRevenue.length === 0) {
    return (
      <Card className="shadow-sm border-border">
        <CardHeader className="flex flex-col items-start space-y-1 pb-6">
          <CardTitle className="text-xl font-bold tracking-tight">
            Revenue Analytics
          </CardTitle>
          <CardDescription>
            Monthly confirmed booking revenue for {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No revenue data available.
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-col items-start space-y-1 pb-6">
        <CardTitle className="text-xl font-bold tracking-tight">
          Revenue Analytics
        </CardTitle>
        <CardDescription>
          Monthly confirmed booking revenue for {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-21/9 max-h-[320px] w-full"
        >
          {isPending ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/60" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground font-medium"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
              {new Date().getFullYear()} Revenue{" "}
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              January - December {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
