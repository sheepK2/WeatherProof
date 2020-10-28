import { Component, OnInit, ViewChild } from '@angular/core';

import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { DatePipe } from '@angular/common';

import { WeatherApiService } from '../services/weather-api.service';
import { WeatherApiResponse } from '../services/payloads/weather-api-response';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent implements OnInit {


  constructor(private ngxCsvParser: NgxCsvParser,
              private datePipe: DatePipe,
              private weatherService: WeatherApiService) {
  }

  ngOnInit(): void {
  }

  showTable: boolean = false;
  validFile: boolean = true;
  validDate: boolean = true;

  csvFile: any[] = [];
  csvRecords: any[] = [];
  cities: string[] = [];
  images: string[] = [];

  date = new Date();
  startDate = this.datePipe.transform(this.date,"yyyy-MM-dd");

  weatherDataText: string[] = [];
  weatherDataIcon: string[] = [];

  csvProperties: string[] = [];

  askInputFile(): void {
    this.showTable = false;
  }

  dateChangeListener($event: any) {
    // console.log("Validating date...");
    this.validDate = true;
    this.weatherDataText = [];
    this.weatherDataIcon = [];

    let dateString = this.startDate;
    let dateNumber = new Date(dateString); 
    let tomorrow = new Date();
    let lastWeek = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    lastWeek.setDate(lastWeek.getDate() - 7);
    // console.log(dateNumber, tomorrow, lastWeek);
    if ((dateNumber > tomorrow) || (dateNumber < lastWeek)) {
      this.validDate = false;
    }
  }

  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;
 
  // Input change listener for the CSV File
  fileChangeListener($event: any): void {
 
    // Select the files from the event
    const files = $event.srcElement.files;
    this.csvFile = files;
    this.cities = [];
    this.validFile = true;
    this.weatherDataText = [];
    this.weatherDataIcon = [];
    this.csvProperties = [];
    this.images = [];
 
    // Parse file
    this.ngxCsvParser.parse(files[0], { header: true, delimiter: ',' })
      .pipe().subscribe((result: Array<any>) => {
        // console.log('Result', result);
        this.csvRecords = result;
        // console.log(this.csvRecords)
        for (let i of this.csvRecords) {
          this.cities.push(i["location.city"]);
        }
        for (let y of this.csvRecords) {
          this.images.push(y["picture.thumbnail"]);
        }
      }, (error: NgxCSVParserError) => {
        console.log('Error', error);
        // window.alert(error.message);
        if (error.code == 2) {
          this.validFile = false;
        }
        else if (error.code == 404) {
          window.alert("Please input a CSV file.");
        }
      });
  }

  // WORKING BUT SLOW!
  async getWeatherData(): Promise<void> {
    this.weatherDataText = [];
    this.weatherDataIcon = [];
    for (let i of this.cities) {
      let result: WeatherApiResponse;
      try {
        result = await this.weatherService.getWeather(i, this.startDate).toPromise();
        this.weatherDataText.push(result.forecast.forecastday[0].day.condition.text);
        this.weatherDataIcon.push(result.forecast.forecastday[0].day.condition.icon);
      } catch (error) {
        if (error.error.error.code == 1006) {
          this.weatherDataText.push("ERROR: Location not found in API service");
          this.weatherDataIcon.push("https://img.icons8.com/cotton/64/000000/database-error.png");
        }
        else {
          this.weatherDataText.push("ERROR: DATA NOT FOUND");
          this.weatherDataIcon.push("https://img.icons8.com/cotton/64/000000/database-error.png");
        }
      }
    }
  }

  // NOT WORKING BUT WILL DEFINITELY OPTIMIZED THE FLOW
  // async getWeatherA(city: string, date: string): Promise<string> {
  //   let weather: WeatherApiResponse;
  //   try {
  //     weather = await this.weatherService.getWeather(city, date).toPromise();
  //     return weather.forecast.forecastday[0].day.condition.text;
  //   }
  //   catch {
  //     return "ERROR";
  //   }
  // }

  checkCsvFileFormat(): boolean {
    let x = new Object();
    x = this.csvRecords[0];
    for (let property in x) {
      this.csvProperties.push(property);
    }
    // console.log(this.csvProperties);
    if ( (this.csvProperties[1] != "name.title") || 
        (this.csvProperties[2] != "name.first") || 
        (this.csvProperties[3] != "name.last") ||
        (this.csvProperties[8] != "phone") || 
        (this.csvProperties[6] != "location.city") ||
        (this.csvProperties[7] != "location.country")) {
          this.validFile = false;
          return(false)
        }
    this.validFile = true;
    return(true);
  }

  generate(): void {
    // console.log("Generate Data...");

    // If no file input
    if (this.csvFile.length == 0) {
      window.alert("Can't generate! No CSV file uploaded.");
    }
    // If not a CSV file
    else if (this.validFile == false) {
      window.alert("Can't generate! Uploaded file is not a csv file.");
    }
    // If CSV file doesn't have the correct headers
    else if (!this.checkCsvFileFormat()) {
      if (window.confirm('Invalid CSV file header format. Click OK to see a valid CSV file.')) {
        window.location.href='https://gist.github.com/jjlumagbas/3f120ae3d11574aede6a9804505ff23a';
      };
    }
    // If date input is invalid (valid dates are the last 7 days only, as per Weather API free subscription pricing)
    // Input date should technically be only for "today" as per docu, but will just include the last 7 days for valid input
    else if (this.validDate == false) {
      window.alert("Please input date within the last 7 days.");
    }
    else {
      // console.log(this.cities);
      // console.log(this.startDate);
      this.getWeatherData();
      // console.log(this.weatherDataText);
      this.showTable = true;
    }
  }

}