import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';

import { Region, SmallCountry } from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styles: [
  ]
})
export class SelectorComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = []
  public borders: SmallCountry[] = []

  public myForm: FormGroup = this.formBuilder.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required]
  })

  constructor(
    private formBuilder: FormBuilder,
    private countriesSvc: CountriesService
  ) { }

  ngOnInit(): void {
    this.onRegionChanged()
    this.onCountryChanged()
  }

  get regions(): Region[] {
    return this.countriesSvc.regions
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.borders = []),
        switchMap(region => this.countriesSvc.getCountriesByRegion(region))
      )
      .subscribe(
        countries => this.countriesByRegion = countries
      )
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap(() => this.myForm.get('border')!.setValue('')),
      tap(() => this.borders = []),
      filter((value: string) => value.length > 0),
      switchMap((alphaCode) => this.countriesSvc.getCountryByAlphaCode(alphaCode)),
      switchMap((country) => this.countriesSvc.getCountriesBordersByCodes(country.borders))
    )
    .subscribe(
      (countries) => this.borders = countries
    )
  }

}
