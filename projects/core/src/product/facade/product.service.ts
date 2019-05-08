import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import * as fromStore from '../store/index';
import { UIProduct } from '../model/product';

@Injectable()
export class ProductService {
  constructor(private store: Store<fromStore.StateWithProduct>) {}

  private products: { [code: string]: Observable<UIProduct> } = {};

  /**
   * Returns the product observable. The product will be loaded
   * whenever there's no value observed.
   *
   * The underlying product loader ensures that the product is
   * only loaded once, even in case of parallel observers.
   */
  get(productCode: string): Observable<UIProduct> {
    if (!this.products[productCode]) {
      this.products[productCode] = this.store.pipe(
        select(fromStore.getSelectedProductStateFactory(productCode)),
        tap(productState => {
          const attemptedLoad =
            productState.loading || productState.success || productState.error;

          if (!attemptedLoad) {
            this.store.dispatch(new fromStore.LoadProduct(productCode));
          }
        }),
        map(productState => productState.value),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.products[productCode];
  }

  /**
   * Returns boolean observable for product's loading state
   */
  isLoading(productCode: string): Observable<boolean> {
    return this.store.pipe(
      select(fromStore.getSelectedProductLoadingFactory(productCode))
    );
  }

  /**
   * Returns boolean observable for product's load success state
   */
  isSuccess(productCode: string): Observable<boolean> {
    return this.store.pipe(
      select(fromStore.getSelectedProductSuccessFactory(productCode))
    );
  }

  /**
   * Returns boolean observable for product's load error state
   */
  hasError(productCode: string): Observable<boolean> {
    return this.store.pipe(
      select(fromStore.getSelectedProductErrorFactory(productCode))
    );
  }

  /**
   * Reloads the product. The product is loaded implicetly
   * whenever selected by the `get`, but in some cases an
   * explicit reload might be needed.
   */
  reload(productCode: string): void {
    this.store.dispatch(new fromStore.LoadProduct(productCode));
  }
}