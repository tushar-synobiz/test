'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { opportunities, formatCurrency } from '@/lib/crm-data'

const stageOrder = ['new', 'qualified', 'proposal', 'won', 'lost'] as const

const chartConfig = {
  value: {
    label: 'Pipeline Value',
  },
  new: {
    label: 'New',
    color: 'var(--status-new)',
  },
  qualified: {
    label: 'Qualified',
    color: 'var(--status-qualified)',
  },
  proposal: {
    label: 'Proposal',
    color: 'var(--status-proposal)',
  },
  won: {
    label: 'Won',
    color: 'var(--status-won)',
  },
  lost: {
    label: 'Lost',
    color: 'var(--status-lost)',
  },
}

export function PipelineChart() {
  const pipelineData = stageOrder.map(stage => {
    const stageOpps = opportunities.filter(o => o.stage === stage)
    const totalValue = stageOpps.reduce((sum, o) => sum + o.value, 0)
    return {
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: totalValue,
      count: stageOpps.length,
      fill: `var(--status-${stage})`,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
        <CardDescription>Opportunity values by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                width={70}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{formatCurrency(Number(value))}</span>
                        <span className="text-muted-foreground text-xs">
                          {props.payload.count} {props.payload.count === 1 ? 'deal' : 'deals'}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
