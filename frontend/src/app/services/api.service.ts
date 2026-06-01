import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  //base = 'http://localhost:8000/api/v1/';
   base = 'https://userback.seejobrun.com/api/v1/';
  constructor(private http: HttpClient) {}
  get(path: string){
    const headers = this.authHeader();
    return this.http.get(this.base + path, { headers }).toPromise();
  }
  
  post(path: string, body: any){
    const headers = this.authHeader();
    return this.http.post(this.base + path, body, { headers }).toPromise();
  }
  
  postFormData(path: string, formData: FormData){
    const headers = this.authHeaderForFormData();
    return this.http.post(this.base + path, formData, { headers }).toPromise();
  }
  
  put(path: string, body: any){
    const headers = this.authHeader();
    return this.http.put(this.base + path, body, { headers }).toPromise();
  }
  
  putFormData(path: string, formData: FormData){
    const headers = this.authHeaderForFormData();
    return this.http.put(this.base + path, formData, { headers }).toPromise();
  }
  
  delete(path: string){
    const headers = this.authHeader();
    return this.http.delete(this.base + path, { headers }).toPromise();
  }
  private authHeader(){
    const token = localStorage.getItem('token');
    if (token) return new HttpHeaders({ Authorization: `Bearer ${token}` });
    return undefined as any;
  }
  
  private authHeaderForFormData(){
    const token = localStorage.getItem('token');
    if (token) {
      // Don't set Content-Type for FormData, let browser set it with boundary
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return undefined as any;
  }
}

