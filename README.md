# nest-repo-mongodb

Example

1. Interface

```typescript
// product.repository.ts

import { CSession, Repository } from '@linhx/nest-repo-mongodb';
import { Product } from './entities/product.entity';

export interface ProductRepository extends Repository<Product> {
  findByStore(sess: CSession, storeId: string): Promise<Product[]>;
}

export const ProductRepositoryProviderName = 'ProductRepository';

```

2. Implementation

```typescript
// product.repository.impl.ts

import {
  ProductRepository,
  ProductRepositoryProviderName,
} from './product.repository';
import { Product, ProductDocument } from './entities/product.entity';
import { ClassProvider, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CSession, Db, RepositoryImpl } from '@linhx/nest-repo-mongodb';

@Injectable()
export class ProductRepositoryImpl
  extends RepositoryImpl<Product>
  implements ProductRepository
{
  constructor(
    private readonly db: Db,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(db, productModel);
  }

  findByStore(sess: CSession, storeId: string): Promise<Product[]> {
    return this.findAll(sess, {
      storeId,
    });
  }
}

export const ProductRepositoryProvider: ClassProvider = {
  provide: ProductRepositoryProviderName,
  useClass: ProductRepositoryImpl,
};
```
