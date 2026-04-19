import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-need',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-need.component.html'
})
export class AddNeedComponent {

  type = '';
  urgency = 'low';

  constructor(private firestore: Firestore) {}

  async submit() {
    try {
      await addDoc(collection(this.firestore, 'needs'), {
        type: this.type,
        urgency: this.urgency,
        location: {
          lat: 19.0760,
          lng: 72.8777
        },
        createdAt: new Date()
      });

      alert("✅ Data saved in Firebase!");

      // reset form
      this.type = '';
      this.urgency = 'low';

    } catch (error) {
      console.error(error);
      alert("❌ Error saving data");
    }
  }
}