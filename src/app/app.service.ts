import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChartModel } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServiceFinance {

  private readonly API = 'api/v8/finance/chart'
  constructor(private http: HttpClient) { }

  searchChart(params2Search: string): Observable<ChartModel> {
    const obj = {
      useYfid: true,
      interval: '1d',
      includePrePost: true,
      lang: 'pt-BR',
      region: 'US',
      range: '2mo',
    }
    const params = new HttpParams({fromObject: obj})
    return this.http.get<ChartModel>(`${this.API}/${params2Search}?`, { params: params })
  }
}