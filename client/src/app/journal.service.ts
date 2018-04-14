import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Journal } from './journal';

// @Injectable()
// export class JournalService {

//   constructor(private http: HttpClient  ) { }


//  //retrieving JournalService 
//   getMedData() {
//     // return this.http.get<any[]>('http://127.0.0.1:3000/api/getDatafromPubmed/25725728');
//     return this.http.get<any[]>(' https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=17284678&retmode=json&rettype=abstract');

//   }

// }



@Injectable()
export class JournalService {
  private url = 'https://audio-abstract.herokuapp.com/api/getDatafromPubmed/';
  // private url = 'http://127.0.0.1:3000/api/getDatafromPubmed/';
  constructor(private _http: HttpClient) { }
  getMedData(): Observable<any[]> {
    return this._http.get<any[]>(this.url, )
      .do(data => console.log(JSON.stringify(data)))
      .catch(this.handleError);
  }
  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }
}
