import {
    trigger,
    state,
    style,
    animate,
    transition,
  } from '@angular/animations';

  export const OVERLAYANIMATION = [
    trigger('listAnimation', [
      state(
        'void',
        style({
          transform: 'translateY(10%)',
          opacity: 0,
        })
      ),
      state(
        'visible',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => visible', animate('225ms ease-out')),
      transition('visible => void', animate('195ms ease-in')),
    ]),
  ];