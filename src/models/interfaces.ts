export interface Items {
  itens: Item[]
}

export interface Item {
  timestamp: string,
  value: number,
  subEarlyDay: number | string,
  subFirstDay: number | string
}

export interface ChartModel {
  chart: any
}
