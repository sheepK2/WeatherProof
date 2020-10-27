import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { WeatherApiResponse } from './payloads/weather-api-response';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {

  constructor(private httpClient: HttpClient) { }

  getWeather(city: string, dateParam: string): Observable<WeatherApiResponse> {
    return this.httpClient.get<WeatherApiResponse>(`http://api.weatherapi.com/v1/history.json?key=139796c8673e4007ad8133147202110&q=${city}&dt=${dateParam}`)
                          .pipe(catchError(err => {
                            return throwError(err);
                          }));
    }

}