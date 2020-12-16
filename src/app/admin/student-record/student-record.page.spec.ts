import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentRecordPage } from './student-record.page';

describe('StudentRecordPage', () => {
  let component: StudentRecordPage;
  let fixture: ComponentFixture<StudentRecordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentRecordPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentRecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
