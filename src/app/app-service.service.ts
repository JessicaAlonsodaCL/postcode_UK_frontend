import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private http : HttpClient) { }
  //N7 6BT N7 6RT
  getData(postcode: string){
    return this.http.get(`/api/getData/${postcode}`);
  }

  validatePostcodeService(postcode: string){
    return this.http.get(`/api/validateCode/${postcode}`);
  }
}
