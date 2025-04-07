import { Component, Input, OnInit } from '@angular/core';
import { Services } from '../../services/service';
import { AdapterServices } from '../../adapter/adapter-service';
import { LedsModalService } from 'leds-lib';

@Component({
  selector: 'app-semantic-search-feedback-popup',
  templateUrl: './semantic-search-feedback-popup.component.html',
  styleUrls: ['./semantic-search-feedback-popup.component.scss']
})
export class SemanticSearchFeedbackPopup implements OnInit {

  @Input() indexname: any;
  @Input() query: any;
  @Input() topicAdaperInstance: any;
  feedback = '';

  constructor(
    private service: Services,
    private adapterServices: AdapterServices,
    private modalService: LedsModalService,
  ) {
  }

  ngOnInit(): void {
    this.feedback = '';
  }

  closeModal() {
    this.modalService.dismissAll('close the modal');

  }

  submit() {
    this.submitFeedback();
  }

  async submitFeedback() {
    try {
      let adapterInstanceName = this.topicAdaperInstance[this.indexname];
      let requestBody = {};
      requestBody["indexname"] = this.indexname;
      requestBody["query"] = this.query;
      requestBody["feedback"] = this.feedback;
      let url = `/api/aip/adapters/${adapterInstanceName}/semanticsearch_feedback/${sessionStorage.getItem('organization')}?isInstance=true`;
      let params = {}
      let headers = {}
      let resp = this.adapterServices.callPostApi(url, requestBody, params, headers).toPromise();
      await resp.then((resp) => {
        if (resp && resp.body) {
          if (resp.body.status) {
            this.service.message(resp.body.status, 'success');
            this.closeModal();
          }
          else {
            if (resp.body.message)
              this.service.message(resp.body.message, 'warning');
            else
              this.service.message('Feedback service not available', 'warning');
            this.closeModal();
          }
        } else
          this.service.message('Upstream API is down, please try again!', 'warning');
      }
      );
    } catch (error) {
      console.log('ERROR:', error);
      this.service.message('Upstream API is down, please try again!', 'warning');
    }
  }

  close() {
    this.closeModal();
  }

}
