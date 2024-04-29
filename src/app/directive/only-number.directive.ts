import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumber]',
  standalone: true,
})
export class OnlyNumberDirective {
  constructor() {}

  @HostListener('keydown', ['$event'])
  onValueChange(event: KeyboardEvent) {
    const { key } = event;
    // Allow backspace, delete, tab, escape, enter
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key) ||
      // Allow Ctrl+A
      (key === 'a' && (event.ctrlKey || event.metaKey)) ||
      // Allow Ctrl+C
      (key === 'c' && (event.ctrlKey || event.metaKey)) ||
      // Allow Ctrl+V
      (key === 'v' && (event.ctrlKey || event.metaKey)) ||
      // Allow Ctrl+X
      (key === 'x' && (event.ctrlKey || event.metaKey)) ||
      // Allow home, end, left, right
      key === 'Home' ||
      key === 'End' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight'
    ) {
      // Let it happen, don't do anything
      return;
    }

    // Ensure that it is a number and stop the keypress
    if (isNaN(Number(key))) {
      event.preventDefault();
    }
  }
}
