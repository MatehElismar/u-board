import { Injectable } from "@angular/core";
import GLightbox from "glightbox";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor() {}

  openImages(images: Array<{ url: string; title: string; description: string }>) {
    const myGallery = GLightbox({
      elements: images.map((i) => ({
        href: i.url,
        type: "image",
        title: i.title,
        description: i.description,
      })),
    });
    myGallery.open();
  }

  openProfilePic(imageURL: string, userFullname: string) {
    // if (!this.platform.is("capacitor")) return EMPTY.toPromise();
    console.log("click glight");
    if (imageURL) {
      const myGallery = GLightbox({
        elements: [
          {
            href: imageURL,
            type: "image",
            title: userFullname,
          },
          {
            href: imageURL,
            type: "image",
            title: userFullname,
          },
        ],
      });
      myGallery.open();
    }
  }
}
