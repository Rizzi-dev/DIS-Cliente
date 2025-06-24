import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppServiceModule } from './app.service';
import { RequestsModel } from './request.model';
import { ReturnModel } from './return.model';

import * as html2canvas from 'html2canvas';

enum File {
  'MODEL1.csv',
  'MODEL2.csv',
  'MODEL3.csv',
}


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public requisicoes!: number;
  titulo = 'Desenvolvimento Integrado de Sistemas';

  allRequests: RequestsModel[] = [];
  allReturns: ReturnModel[] = [];

  PATH_MODEL1 = './assets/model1/'
  PATH_MODEL2 = './assets/model2/'

  isOpen: boolean[] = [];

  toggleAccordion(index: number) {
    this.isOpen[index] = !this.isOpen[index];
  }

  constructor(private http: HttpClient, private service: AppServiceModule) {}

  public randomizeValues(req: RequestsModel){
    req.user = Math.floor(Math.random() * 30000)
    // req.ganho = Math.random() > 0.5 ? true : false; //Desabilitado opção de enviar com ganho pois está dando errado :(
    req.ganho = false; //Caso vá reabilitar o ganho, remova/comente essa linha e libere a de cima
    req.model = Math.random() > 0.5 ? true : false;
  }

  public async loadVector(req: RequestsModel) {
    const vectorToRead = this.getRandomFilePath(req);
    const vectorLoaded = await this.readCSVFile(vectorToRead);

    req.vector = vectorLoaded;
  }

  private getRandomFilePath(req: RequestsModel): string {
    const vector = Math.floor(Math.random() * 2.999999999);
    const fileName = File[vector];
    return (req.model ? this.PATH_MODEL1 : this.PATH_MODEL2) + fileName;
  }

  private async readCSVFile(filePath: string): Promise<string[]> {
    try {
      const fileContent: string | undefined = await this.http.get(filePath, { responseType: 'text' }).toPromise();
      
      if (fileContent === undefined) {
        console.error('Conteúdo do arquivo é indefinido.');
        return [];
      }
      const lines = fileContent.split('\n').map(line => line.trim());
      return lines;
    } catch (error) {
      console.error('Erro ao carregar o arquivo CSV:', error);
      return [];
    }
  }

  public async sendRequests() {
    this.allReturns = [];
    this.allRequests = [];
    for (let i = 0; i < this.requisicoes; i++) {
      let req = new RequestsModel;
      this.randomizeValues(req);
      await this.loadVector(req);
      this.requestService(req); 
      this.allRequests.push(req);
    }
  }

  public async requestService(i: RequestsModel) {
    await sleep(Math.floor(Math.random() * 5000))
    this.service.request(i).subscribe((res) => { 
      if(res) {
        res.image = this.generateImage(res.imageVector)
        this.allReturns.push(res);
      } 
    });  
  }

  atualizarAccordion(i: number){
    let element = document.getElementById(`accordion_${i}`)
    element?.classList.contains("show") ? element?.classList.remove("show") : element?.classList.add("show")
  }

  private generateImage(vetor: number[]): string {
    const pixelSize = 10; // Define o tamanho do pixel (multiplier)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const size = Math.sqrt(vetor.length);
    const scaledSize = size * pixelSize; // Tamanho escalado
  
    canvas.width = scaledSize;
    canvas.height = scaledSize;
  
    for (let i = 0; i < vetor.length; i++) {
      const x = (i % size) * pixelSize;
      const y = Math.floor(i / size) * pixelSize;
      const grayscaleValue = vetor[i];
      if (ctx) {
        ctx.fillStyle = `rgb(${grayscaleValue}, ${grayscaleValue}, ${grayscaleValue})`;
        ctx.fillRect(x, y, pixelSize, pixelSize); // Aumenta o tamanho do pixel
      }
    }
  
    // Converte o canvas para imagem base64 e retorna
    return canvas.toDataURL('image/png');
  }  

  public serverStats: { cpu: number; memory: number; interval: number } | null = null;

  public getServerStats(): void {
    this.service.getStats().subscribe(
      (data) => {
      this.serverStats = {
        cpu: data.cpu,
        memory: data.memory,
        interval: data.interval
      };
    },
    (error) => {
      console.error('Erro ao obter estatísticas do servidor:', error);
    }
  );
}

}
