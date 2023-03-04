import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, EMPTY, filter, finalize, map, switchMap } from 'rxjs';
import { ServiceFinance } from './app.service';
import { Item } from 'src/models/interfaces';
import * as moment from 'moment';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const PAUSA = 300;
const ITERATIONS = 30
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('chart')
  chartElementRef!: ElementRef;

  public myChart!: any;

  title = 'Challenge-Front';
  campoBusca = new FormControl();
  mensagemErro: string | null = null;
  chartResultado!: Item[];

  constructor(private service: ServiceFinance) { }

  ngOnInit(): void {

  }

  chartsFounded$ = this.campoBusca.valueChanges
    .pipe(
      debounceTime(PAUSA),
      filter((valorDigitado) => valorDigitado.length >= 8),
      switchMap((valorDigitado) => {
        return this.service.searchChart(valorDigitado).pipe(
          catchError(error => {
            console.error(error)
            this.chartResultado = [];
            this.myChart.destroy();
            this.mensagemErro = 'Não Encontrado';
            return EMPTY;
          })
        );
      }),
      map(resultado => this.chartResultado = this.zip(resultado.chart.result[0].timestamp, resultado.chart.result[0].indicators.quote[0].open)),
      catchError((error) => {
        console.error(error);
        return EMPTY
      }),
      map((items) => {this.mensagemErro = null; this.buildChart(items)}),
      finalize(() => {
        console.log('Informações montadas', this.chartResultado);
        this.mensagemErro = null
      })
    )
    .subscribe(() => console.log(this.chartResultado))

  zip(a: number[], b: number[]) {
    return a.slice(a.length - ITERATIONS, a.length).map((k: number, i: number) => (
      {
        timestamp: this.convertEpoch2SpecificTimezone(k), value: b[i], subEarlyDay: i !== 0 ? ((b[i] - b[i - 1]) / b[i - 1]) * 100 : '-', subFirstDay: i !== 0 ? ((b[i] - b[0]) / b[0]) * 100 : '-'
      }
    ));
  }

  convertEpoch2SpecificTimezone(timeEpoch: number) {
    const date = moment(timeEpoch.toString(), "X").format();
    return date;
  }

  buildChart(items: Item[]) {
    const xValues = items.map((e) => { return moment(e.timestamp, moment.ISO_8601).format('DD/MM/YYYY') });
    const subEarlyDay = items.map((e) => { return e.subEarlyDay });
    const subFirstDay = items.map((e) => { return e.subFirstDay });
    if (this.myChart) this.myChart.destroy();
    this.myChart = new Chart("myChart", {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          label: 'Comparação Dia Anterior',
          data: subEarlyDay,
          borderColor: "red",
          fill: false
        }, {
          label: 'Comparação Primeiro Dia',
          data: subFirstDay,
          borderColor: "green",
          fill: false
        }
        ]
      },
      options: {}
    });
  }

}
