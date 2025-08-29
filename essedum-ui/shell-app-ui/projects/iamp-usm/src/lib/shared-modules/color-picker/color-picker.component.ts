import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Output() colorChange = new EventEmitter<string>();

  private _color: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  get color(): string {
    return this._color;
  }

  @Input()
  set color(value: string) {
    this._color = value;
    this.onChange(value);
    this.colorChange.emit(value);
  }

  get hasColor(): boolean {
    return this._color && this._color.trim() !== '';
  }

  get inputId(): string {
    return `color-picker-${this.name}`;
  }

  onColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.color = target.value;
  }

  clearColor(): void {
    this.color = '';
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._color = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
