import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-questionare-form',
  templateUrl: './questionare-form.component.html',
  styleUrls: ['./questionare-form.component.scss'],
})
export class QuestionareFormComponent {
  form: FormGroup;
  questions = [
    {
      question_id: 1,
      question_content: 'What is your name?',
      response_type: 'text'
    },
    {
      question_id: 2,
      question_content: 'What is your email address?',
      response_type: 'email'
    },
    {
      question_id: 3,
      question_content: 'What is your favorite color?',
      response_type: 'dropdown',
      options: ['Red', 'Green', 'Blue']
    },
    {
      question_id: 4,
      question_content: 'What is your age?',
      response_type: 'number'
    },
    {
      question_id: 5,
      question_content: 'Do you like Angular?',
      response_type: 'checkbox',
      options: ['Yes', 'No']
    }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({});
    this.questions.forEach(question => {
      this.form.addControl(question.question_id.toString(), this.formBuilder.control('', Validators.required));
    });
  }

  onSubmit(): void {
    const user_response = [];
    this.questions.forEach(question => {
      user_response.push({
        question_id: question.question_id,
        user_response: this.form.get(question.question_id.toString())?.value
      });
    });
  }
}