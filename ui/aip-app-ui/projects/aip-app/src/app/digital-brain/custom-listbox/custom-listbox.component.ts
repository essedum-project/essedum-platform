import { Component, ElementRef, EventEmitter, Input, IterableDiffers, Output, ViewChild } from '@angular/core';
import { DualListComponent } from 'angular-dual-listbox';
@Component({
  selector: 'app-custom-listbox',
  templateUrl: './custom-listbox.component.html',
  styleUrls: ['./custom-listbox.component.scss']
})
export class CustomListboxComponent extends DualListComponent {
  @Input() sourceName = '';
	@Input() targetName = '';
	@Output() valueChange = new EventEmitter();
	@Output() selectChange = new EventEmitter();
	@Output() searchvalue = new EventEmitter();
	@Output() scrollChange = new EventEmitter<number>();
	@ViewChild("targetList", { static: false }) targetList: ElementRef;
	@ViewChild("myInput1", { static: false }) myInputReference1: ElementRef;
	@ViewChild("myInput2", { static: false }) myInputReference2: ElementRef;
	@Input() displayTooltip: boolean = false;
	@Input() tooltipKey: any[] = [];
	@Input() tooltipProperty: string = '';
	@Input() disabledview: boolean = false;
	confirmCopy=[];
	availableCopy=[];


	constructor(differs: IterableDiffers) {
		super(differs);
	}

	moveAll() {
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
		this.selectAll(this.available);
		this.moveItem(this.available, this.confirmed);
		this.valueChange.emit(this.confirmed.list);
	}

	removeAll() {
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
		this.selectAll(this.confirmed);
		this.moveItem(this.confirmed, this.available);
		this.valueChange.emit(this.confirmed.list);
	}
	moveItemUp(list) {
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
		if (this.confirmed.pick.length === 1) {
			for (const i in list) {
				if (list[i] === this.confirmed.pick[0] && list[Number(i) - 1]) {
					const cur = list[i];
					const above = list[Number(i) - 1];
					list.splice(Number(i) - 1, 1);
					list.splice(Number(i) - 1, 1);
					list.splice(Number(i) - 1, 0, cur, above);
				}
			}
			this.valueChange.emit(list);
		} else {
			alert('Can only move one item up from the list');
		}
	}

	moveItemDown(list) {
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
		if (this.confirmed.pick.length === 1) {
			for (const k in list) {
				if (list[k] === this.confirmed.pick[0] && list[Number(k) + 1]) {
					const below = list[Number(k) + 1];
					const current = list[k];
					list[k] = below;
					list[Number(k) + 1] = current;
					break;
				}
			}
			this.valueChange.emit(list);
		} else {
			alert('Only move one item down from the list');
		}

	}
	// Override function in DualListComponent to add custom selectChange event.
	override selectItem(list: Array<any>, item: any) {
		const pk = list.filter((e: any) => {
			return Object.is(e, item);
		});
		if (pk.length > 0) {
			// Already in list, so deselect.
			for (let i = 0, len = pk.length; i < len; i += 1) {
				const idx = list.indexOf(pk[i]);
				if (idx !== -1) {
					list.splice(idx, 1);
					this.selectChange.emit({ key: item._id, selected: false });
				}
			}
		} else {
			list.push(item);
			this.selectChange.emit({ key: item._id, selected: true });
		}
	}

	select(available, confirmed) {
    console.log('selectavai',available);
    console.log('confr',confirmed);
    
		this.moveItem(this.available, this.confirmed);
		this.valueChange.emit(this.confirmed.list);
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
	}

	remove(confirmed, available) {
		this.moveItem(this.confirmed, this.available);
		this.valueChange.emit(this.confirmed.list);
		this.myInputReference1.nativeElement.value = null;
		this.myInputReference2.nativeElement.value = null;
	}

	tooltip(itemsList: any[], item: any): any {
		// let temp = this.source[idx];
		// this.tooltipKey.forEach(tool => {
		// 	temp = temp[tool];
		// })
		// return this.tooltipProperty + ' - ' + temp;
		let temp = this.source.find(tmp => tmp.id == item._id);
		let tooltip = ''
		if (this.tooltipKey && this.tooltipKey.length) {
			this.tooltipKey.forEach((tool, idx) => {
				let tempTooltip = Object.assign({}, temp);
				if(tool && tool.length) {
					tool.forEach(attr => {
						if(tempTooltip[attr])
							tempTooltip = tempTooltip[attr]
					})
					tooltip += this.tooltipProperty[idx] + ': ' + tempTooltip + ' ';
				}
			});
			return tooltip.trim()
		}
	}

	handleScroll(event) {
		this.scrollChange.emit(event.target.scrollTop)
	}

	scrollChild(event) {
		this.targetList.nativeElement.scroll({
			top: event.target.scrollTop,
			behavior: 'smooth'
		})
	}

	checkEnterPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterItem(event.srcElement.value);
	}
  }

  filterItem(value) {
	if( this.availableCopy.length==0)
	this.availableCopy=Object.assign([], this.available.sift);
    if (!value) {
	  this.assignCopy();
    }
    this.available.sift = Object.assign([], this.availableCopy).filter(
      (item1) => item1._name.toLowerCase().indexOf(value.toLowerCase()) > -1
	);
  }

  assignCopy() {
	this.available.sift = Object.assign([], this.availableCopy);
  }

  checkEnterconfirmedPressed(event: any, val: any) {
    if (event.keyCode === 13) {
      this.filterconfirmedItem(event.srcElement.value);
    }
  }

  filterconfirmedItem(value) {
	  if( this.confirmCopy.length==0)
	  this.confirmCopy=Object.assign([], this.confirmed.sift);
    if (!value) {
      this.assignconfirmedCopy();
    }
    this.confirmed.sift = Object.assign([], this.confirmCopy).filter(
	  (item1) => item1._name.toLowerCase().indexOf(value.toLowerCase()) > -1
	);
	this.searchvalue.emit(this.confirmed.sift);
  }

  assignconfirmedCopy() {
    this.confirmed.sift = Object.assign([], this.confirmCopy);
  }


}
