import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CourseService } from '../../../../services/course.service';
import { StatusMessageService } from '../../../../services/status-message.service';
import { TimezoneService } from '../../../../services/timezone.service';
import { ErrorMessageOutput } from '../../../error-message-output';

interface Timezone {
  id: string;
  offset: string;
}

const formatTwoDigits: Function = (n: number): string => {
  if (n < 10) {
    return `0${n}`;
  }
  return String(n);
};

/**
 * Instructor add new course form
 */
@Component({
  selector: 'tm-add-course-form',
  templateUrl: './add-course-form.component.html',
  styleUrls: ['./add-course-form.component.scss'],
})

export class AddCourseFormComponent implements OnInit {

  @Input() isEnabled: boolean = true;
  @Output() courseAdded: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeCourseFormEvent: EventEmitter<void> = new EventEmitter<void>();


  // @ViewChildren('courseIdText, new-course-name, new-time-zone, btn-save-course,btn btn-primary') formElements:QueryList<ElementRef>;
  // @ViewChild('courseIdText', { static: false }) courseIdText: ElementRef;
  // @ViewChild('new-course-name');
  // @ViewChild('new-time-zone')
  // @ViewChild('btn-save-course')
  // @ViewChild('btn btn-primary')

  timezones: Timezone[] = [];
  timezone: string = '';
  newCourseId: string = '';
  newCourseName: string = '';
  isAddingCourse: boolean = false;

  // elementRef: ElementRef;

  @Input() isExample: boolean = false; // *ngIf to check tab accessibility

  constructor(private statusMessageService: StatusMessageService,
              private courseService: CourseService,
              private timezoneService: TimezoneService,
              // @Inject(ElementRef) elementRef: ElementRef
              // private ref: ElementRef
              // this.courseIdText = elementRef;
               ) {  }


  ngOnInit(): void {
    for (const [id, offset] of Object.entries(this.timezoneService.getTzOffsets())) {
      const hourOffset: number = Math.floor(Math.abs(offset) / 60);
      const minOffset: number = Math.abs(offset) % 60;
      const sign: string = offset < 0 ? '-' : '+';
      this.timezones.push({
        id,
        offset: offset === 0 ? 'UTC' : `UTC ${sign}${formatTwoDigits(hourOffset)}:${formatTwoDigits(minOffset)}`,
      });
    }
    // If the form is used as example,
    // if(!this.isExample) {
      // this.ref.nativeElement.focus();
      //this is not working
    // } else {
      // this.ref.nativeElement.tabindex = 0;
    // }

    this.timezone = this.timezoneService.guessTimezone();
  }

  ngAfterViewInit() {
    // setTimeout(() =>this.courseIdText.nativeElement.focus());
    if(this.isExample){
      var typeCourseId = document.getElementById("new-course-id");
      var typeCourseName = document.getElementById("new-course-name");
      var selectTimeZone = document.getElementById("new-time-zone");
      var btnAutoDetect = document.getElementById("btn-auto-detect");
      var btnAddCourse = document.getElementById("btn-save-course");
      typeCourseId?.setAttribute('tabindex', '-1');
      typeCourseName?.setAttribute('tabindex', '-1');
      selectTimeZone?.setAttribute('tabindex', '-1');
      btnAutoDetect?.setAttribute('tabindex', '-1');
      btnAddCourse?.setAttribute('tabindex', '-1');
    }
  }


  /**
   * Auto-detects timezone for instructor.
   */
  onAutoDetectTimezone(): void {
    if (!this.isEnabled) {
      return;
    }
    this.timezone = this.timezoneService.guessTimezone();
  }

  /**
   * Submits the data to add the new course.
   */
  onSubmit(): void {
    if (!this.isEnabled) {
      return;
    }
    if (!this.newCourseId || !this.newCourseName) {
      this.statusMessageService.showErrorToast(
          'Please make sure you have filled in both Course ID and Name before adding the course!');
      return;
    }

    this.isAddingCourse = true;
    this.courseService.createCourse({
      courseName: this.newCourseName,
      timeZone: this.timezone,
      courseId: this.newCourseId,
    }).pipe(finalize(() => this.isAddingCourse = false)).subscribe(() => {
      this.courseAdded.emit();
      this.statusMessageService.showSuccessToast('The course has been added.');
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorToast(resp.error.message);
    });
    this.newCourseId = '';
    this.newCourseName = '';
    this.timezone = this.timezoneService.guessTimezone();
  }

  /**
   * Handles closing of the edit form.
   */
  closeEditFormHandler(): void {
    this.closeCourseFormEvent.emit();
  }
/*
* Accessibility control
*/
  // setActiveTab(index: number) {
  //   this.tabIndex = index;
  // }

}
