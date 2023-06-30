import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { combineLatest, map, Observable, of, tap } from 'rxjs';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUri: string = 'https://restcountries.com/v3.1'

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oseania
  ]

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [...this._regions]
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([])

    const uri: string = `${this.baseUri}/region/${region}?fields=cca3,name,borders`
    return this.http.get<Country[]>(uri)
      .pipe(
        map(countries => countries.map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
        // tap(response => console.log({ response }))
      )
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    console.log({alphaCode})

    const uri: string = `${this.baseUri}/alpha/${alphaCode}?fields=cca3,name,borders`
    return this.http.get<Country>(uri)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        })),
        // tap(response => console.log({ response }))
      )
  }

  getCountriesBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([])

    const countriesRequests: Observable<SmallCountry>[] = []
    borders.forEach(code => {
      const request = this.getCountryByAlphaCode(code)
      countriesRequests.push(request)
    })

    return combineLatest(countriesRequests)
  }

}
