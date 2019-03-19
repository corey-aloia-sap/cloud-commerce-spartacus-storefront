import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { TranslationService } from './translation.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { shallowEqualObjects } from './utils/shallow-equal-objects';

@Pipe({ name: 'cxTranslate', pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string;
  private lastOptions: object;
  private lastObservable: Observable<string>;
  private asyncPipe: AsyncPipe;
  constructor(private service: TranslationService, cd: ChangeDetectorRef) {
    this.asyncPipe = new AsyncPipe(cd);
  }

  transform(key: any, options: object = {}): string {
    if (
      key !== this.lastKey ||
      !shallowEqualObjects(options, this.lastOptions)
    ) {
      this.lastKey = key;
      this.lastOptions = options;

      this.lastObservable = this.service.translateLazy(key, options);
    }
    return this.asyncPipe.transform(this.lastObservable);
  }

  ngOnDestroy(): void {
    this.asyncPipe.ngOnDestroy();
  }
}