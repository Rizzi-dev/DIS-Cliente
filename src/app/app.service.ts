import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestsModel } from './request.model';
import { ReturnModel } from './return.model';

@Injectable({
  providedIn: 'root',
})
export class AppServiceModule {
  private apiUrl = 'http://localhost:8080'; // Certifique-se de que o servidor está em execução

  constructor(private http: HttpClient) {}

  teste(): Observable<any> {
    const url = `${this.apiUrl}/`; // Substitua "seu-endpoint" pelo caminho específico do seu servidor
    return this.http.get(url);
  }

  request(i: RequestsModel): Observable<ReturnModel> {
    return this.http.post<ReturnModel>(this.apiUrl, i) 
  }

  getStats() {
  return this.http.get<{ cpu: number, memory: number, interval: number }>('http://localhost:3000/stats');
}

}
