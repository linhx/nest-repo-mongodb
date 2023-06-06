import {
  DB_PROVIDER,
  TRANSACTIONAL_EVENT_EMITTER_PROVIDER,
  TransactionalEventEmitter,
} from '@linhx/nest-repo';
import {
  ClassProvider,
  DynamicModule,
  ExistingProvider,
  FactoryProvider,
  Module,
  Provider,
  ValueProvider,
} from '@nestjs/common';
import { DbMongo } from './db.mongo';
export { DbMongo, MongoTransaction } from './db.mongo';
export { RepositoryImpl } from './repository.impl';

export const DbMongoProvider: Provider = {
  provide: DB_PROVIDER,
  useClass: DbMongo,
};

export type EventEmitterProvider =
  | Omit<ClassProvider<TransactionalEventEmitter>, 'provide'>
  | Omit<ValueProvider<TransactionalEventEmitter>, 'provide'>
  | Omit<FactoryProvider<TransactionalEventEmitter>, 'provide'>
  | Omit<ExistingProvider<TransactionalEventEmitter>, 'provide'>;

@Module({})
export default class RepositoryMongodbModule {
  static forRoot(options: {
    global?: boolean;
    eventEmitterProvider: EventEmitterProvider;
  }): DynamicModule {
    const eventEmitterProvider = {
      ...options.eventEmitterProvider,
      provide: TRANSACTIONAL_EVENT_EMITTER_PROVIDER,
    } as Provider<TransactionalEventEmitter>;

    return {
      module: RepositoryMongodbModule,
      providers: [DbMongoProvider, eventEmitterProvider],
      exports: [DbMongoProvider, eventEmitterProvider],
      global: options?.global ?? true,
    };
  }
}
