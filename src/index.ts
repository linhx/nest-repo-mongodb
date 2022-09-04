import { DB_PROVIDER } from '@linhx/nest-repo';
import { DynamicModule, Global } from '@nestjs/common';
import { DbMongo } from './db.mongo';
export { DbMongo, MongoTransaction } from './db.mongo';
export { RepositoryImpl } from './repository.impl';

const DbMongoProvider = {
  provide: DB_PROVIDER,
  useClass: DbMongo,
};

@Global()
export default class RepositoryMongodbModule {
  static forRoot(): DynamicModule {
    return {
      module: RepositoryMongodbModule,
      providers: [DbMongoProvider],
      exports: [DbMongoProvider],
    };
  }
}
