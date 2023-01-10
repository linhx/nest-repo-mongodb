# nest-repo-mongodb

Achieve abstraction in repository pattern (NestJs)

## Install

```shell
npm i @nestjs/mongoose mongoose
npm i @linhx/nest-repo @linhx/nest-repo-mongodb
```

## Example

1. Import module

```typescript
import RepositoryMongodbModule from '@linhx/nest-repo-mongodb';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      dbName: process.env.MONGO_DB_NAME,
      replicaSet: process.env.MONGO_DB_REPLICA,
    }),
    RepositoryMongodbModule.forRoot(),
    ProductModule,
  ],
})
export class AppModule {}

```

2. Interface

```typescript
// product.repository.ts

import { Transaction, Repository } from '@linhx/nest-repo';
import { ObjectId } from 'mongoose';
import { Product } from './entities/product.entity';

export interface ProductRepository extends Repository<Product, ObjectId> {
  findByStore(trx: Transaction, storeId: string): Promise<Product[]>;
}

export const ProductRepositoryProviderName = 'ProductRepository';


```

3. Implementation

```typescript
// product.repository.impl.ts

import {
  ProductRepository,
  ProductRepositoryProviderName,
} from './product.repository';
import { Product, ProductDocument } from './entities/product.entity';
import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MongoTransaction,
  DbMongo,
  RepositoryImpl,
} from '@linhx/nest-repo-mongodb';
import { DB_PROVIDER } from '@linhx/nest-repo';

@Injectable()
export class ProductRepositoryImpl
  extends RepositoryImpl<Product>
  implements ProductRepository
{
  constructor(
    @Inject(DB_PROVIDER) private readonly db: DbMongo,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(db, productModel);
  }

  findByStore(trx: MongoTransaction, storeId: string): Promise<Product[]> {
    return this.findAll(trx, {
      storeId,
    });
  }
}

export const ProductRepositoryProvider: ClassProvider = {
  provide: ProductRepositoryProviderName,
  useClass: ProductRepositoryImpl,
};
```
