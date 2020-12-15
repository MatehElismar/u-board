import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  
  slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  constructor() { }

  ngOnInit() {
  }

}
