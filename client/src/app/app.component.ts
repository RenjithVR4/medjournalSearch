import { Component } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClientModule, HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Journal } from './journal';

@Component({
  selector: 'medApp',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  medData: Journal = {};
  medDatum: Journal;

  pubmedId: string;
  title: string;
  authors: string;
  firstAuthor: string;
  seniorAuthor: string;
  abstractlabels: string;
  abstractcontent: string;
  tags: string;
  audioURL: string;
  status: boolean;
  show: boolean = true;

  constructor(private httpClient: HttpClient) {

  }

  pmIDkeyup(event: any) {
    this.pubmedId = event.target.value;
  }

  titleKeyup(event: any) {
    this.title = event.target.value;
  }

  firstAuthorKeyup(event: any) {
    this.firstAuthor = event.target.value;
  }

  seniorAuthorKeyup(event: any) {
    this.seniorAuthor = event.target.value;
  }

  abstractKeyup(event: any) {
    this.abstractcontent = event.target.value;
  }

  tagsKeyup(event: any) {
    this.tags = event.target.value;
  }




  searchMedData(event: any) {
    // this.httpClient.get('http://localhost:3000/api/getDatafromPubmed/' + this.pubmedId)
      this.httpClient.get('https://audio-abstract.herokuapp.com/api/getDatafromPubmed/'+this.pubmedId)
      .subscribe(
        (medData: any[]) => {
          if (!medData[0]) {
            this.show = false;
          }
          else {
            this.medData = medData[0];
            this.show = true;
          }
        });

  }


  updateMedData(event: any) {

    var pubmedId = "";
    var title = "";
    var firstAuthor = "";
    var seniorAuthor = "";
    var abstract = "";
    var tags = "";

    var updateData = [];

    if (this.pubmedId) {
      pubmedId = this.pubmedId.trim();
    }

    if (this.title) {
      title = this.title.trim();
    }

    if (this.firstAuthor) {
      firstAuthor = this.firstAuthor.trim();
    }

    if (this.seniorAuthor) {
      seniorAuthor = this.seniorAuthor.trim();
    }

    if (this.abstractcontent) {
      abstract = this.abstractcontent.trim();
    }

    if (this.tags) {
      tags = this.tags.trim();
    }

    let url = 'http://localhost:3000/api/editDBdata/';
    // const params = new HttpParams().set('PubMedID', pubmedId);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    var body = {
      title: title,
      firstAuthor: firstAuthor,
      seniorAuthor: seniorAuthor,
      abstract: abstract,
      tags: tags
    }

    return this.httpClient.put(url + pubmedId, body)
      .subscribe(
        (medData: any[]) => {
          this.medData = medData[0];
        });
  }



  addComma(content) {
    if (content) {
      content = content.toString();
      // console.log(content);
      return content.replace(/,/g, ", ");
    }
  }

  breakContent(content) {
    if (content) {
      content = content.toString();
      // console.log(content);
      return content.replace(/\n\r/g, "\n\n\n");
    }
  }




  getAbstract(medData) {
    if (!medData.abstractContent) {
      return medData.abstract
    }
    else {
      return medData.abstractContent
    }
  }

}

