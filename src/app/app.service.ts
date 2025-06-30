import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestsModel } from './request.model';

@Injectable({
  providedIn: 'root',
})
export class AppServiceModule {
  private apiUrl = 'http://localhost:8000'; // Porta do FastAPI (padrão: 8000)

  constructor(private http: HttpClient) {}

  // Endpoint para enviar job de reconstrução
  request(req: RequestsModel): Observable<{ job_id: string }> {
    const body = {
      user_id: req.user.toString(),
      algorithm: req.model ? 'CGNE' : 'CGNR',
      model_path: req.model ? 'H-1.csv' : 'H-2.csv',
      signal: req.vector,
    };
    return this.http.post<{ job_id: string }>(`${this.apiUrl}/reconstruct`, body);
  }

  // Endpoint para consultar status/resultados de um job específico
  getJobStatus(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status/${jobId}`);
  }

  // (Opcional) Endpoint para estatísticas do servidor, se houver outro serviço
  getStats(): Observable<{ cpu: number; memory: number; interval: number }> {
    return this.http.get<{ cpu: number; memory: number; interval: number }>('http://localhost:3000/stats');
  }
}
