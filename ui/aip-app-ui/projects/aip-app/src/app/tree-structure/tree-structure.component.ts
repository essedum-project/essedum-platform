import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'tree-structure[id=ele]',
  templateUrl: './tree-structure.component.html',
  styleUrls: ['./tree-structure.component.scss']
})
export class TreeStructureComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private formBuilder: FormBuilder
  ) {}


  ngOnInit() {
    console.log('TreeStructureComponent');

  }
}
