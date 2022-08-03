import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './app-service.service';
import { map} from 'rxjs/operators';
import { Postcode } from './shared/postcode.model';
import { Observable } from 'rxjs';
import { MapDirectionsService } from '@angular/google-maps';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit{
 
  //maps
  postcodes: Postcode[] = [];
  display: any;
  postcode = '';
  center!: google.maps.LatLngLiteral;


  markers = []  as  any;
  zoom = 14;

  //distance
  distanceKm?: number;
  distanceMiles?: number;

  //instatiate google map objects for directions 
  directionsResults$!: Observable<google.maps.DirectionsResult | undefined>;


  constructor(private service : AppServiceService, private mapDirectionsService: MapDirectionsService){}

  ngOnInit() {}

  onEnter(value: string) {
    this.postcode = value;
    this.validatePostcode(this.postcode);
  }

  getDataFromAPI(postcode: string){
    this.service.getData(postcode).pipe(map((res) => JSON.parse(JSON.stringify(res)))).subscribe({
      next: response => {
        console.log('Response from API is ', response);
        if(this.postcodes.length < 3){
          this.postcodes.push(new Postcode(response.postcode, response.latitude, response.longitude, response.country, response.region));
        }else{
          this.postcodes.shift();
          this.postcodes.push(new Postcode(response.postcode, response.latitude, response.longitude, response.country, response.region));
        }
        
        this.changePositionMap(response.latitude, response.longitude);
      }, 
      error: error => {
        console.log('Error is', error);
      }
    })
  }

  validatePostcode(postcode: string){
    this.service.validatePostcodeService(postcode).subscribe({
      next: response => {
        if(response){
          this.getDataFromAPI(postcode);
        }else{
          alert('Enter a valid postal code')
        }
      }, 
      error: error => {
        console.log('Error is', error);
      }
    });
  }

  changePositionMap(lat: number, long: number){
    const lat2 = 51.4700223
    const long2 = -0.4542955

    this.center = {
      lat: lat,
      lng: long
    }
    this.markers.push({
      position: {
        lat: lat,
        lng: long
      }
    })

    this.getDistanceFromLatLongInKm(lat, long, lat2, long2)
    //define direction 
    const request: google.maps.DirectionsRequest = {
      destination: {lat: lat2, lng: long2},
      origin: {lat: lat, lng: long},
      travelMode: google.maps.TravelMode.DRIVING
    }
    this.directionsResults$ = this.mapDirectionsService.route(request).pipe(map(response => response.result));
  }

  getDistanceFromLatLongInKm(lat1: number ,long1: number,lat2: number, long2:number) {
    const radius = 6371;
    const dLat = this.deg2rad(lat2-lat1);
    const dLong = this.deg2rad(long2-long1);
    const a =  Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
    Math.sin(dLong/2) * Math.sin(dLong/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    this.distanceKm = parseFloat((radius * c).toFixed(2)); 
    this.distanceMiles = (this.distanceKm * 0,621371);

  }
  
  deg2rad(deg:number){
    return deg * (Math.PI/180)
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }
  move(event: google.maps.MapMouseEvent) {
      if (event.latLng != null) this.display = event.latLng.toJSON();
  }
}
