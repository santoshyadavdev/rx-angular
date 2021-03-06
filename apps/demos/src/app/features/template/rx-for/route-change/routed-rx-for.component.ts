import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TestItem } from '../../../../shared/debug-helper/value-provider/model';

let itemIdx = 0;

function getNewItem(): TestItem {
  const _idx = itemIdx;
  const i = { id: _idx, value: Math.random() };
  ++itemIdx;
  return i;
}

function getItems(num: number) {
  return new Array(num).fill(null).map((_) => getNewItem());
}

@Component({
  selector: 'rxa-routed-rx-for',
  template: `
    <div
      class="d-flex py-3 w-100 align-items-center justify-content-around header"
    >
      <div>ID</div>
      <div class="d-flex align-items-center">
        <span class="mr-2">Value</span>
        <button mat-icon-button (click)="toggleSortDir()">
          <mat-icon *ngIf="sortDir.getValue() === 1">arrow_upward</mat-icon>
          <mat-icon *ngIf="sortDir.getValue() === -1">arrow_downward</mat-icon>
        </button>
      </div>
      <div>Index</div>
      <div>Action</div>
    </div>
    <div
      class="d-flex py-3 w-100 align-items-center justify-content-around item"
      *rxFor="
              let item of items$;
              let i = index;
              let count = count;
              strategy: 'normal';
              trackBy: trackById
            "
    >
      <div>{{ item.id }}</div>
      <div>{{ item.value }}</div>
      <div>{{ i }}</div>
      <button mat-raised-button>
        <mat-icon>delete</mat-icon> CLICK
      </button>
    </div>
  `,
  styles: [`
    :host {
      flex-grow: 1;
      overflow: auto;
    }
    .item {
      border: 1px solid magenta;
    }
    .item:hover {
      background: rgba(0, 0, 0, .35);
    }
    .header {
      font-weight: bold;
      position: sticky;
      top: 0;
      background-color: #424242;
      z-index: 2;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutedRxForComponent {

  sortDir = new BehaviorSubject<number>(1);

  items$ = this.activeRoute.params.pipe(
    map((params) => getItems(coerceNumberProperty(params.count, 1000))),
    switchMap((items) =>
      this.sortDir.pipe(
        map((dir) => [
          ...items.sort((a, b) => (a.value - b.value) * dir)
        ])
      )
    )
  );

  constructor(
    private activeRoute: ActivatedRoute
  ) {

  }

  trackById = (i, v) => v.id;

  toggleSortDir(): void {
    this.sortDir.next(this.sortDir.getValue() * -1);
  }

}
