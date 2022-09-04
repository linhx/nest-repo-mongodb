import { Repository } from '@linhx/nest-repo';
import { PagingDto } from '@linhx/rest-common';
import { Model } from 'mongoose';
import { DbMongo, MongoTransaction } from './db.mongo';

export class RepositoryImpl<T> implements Repository<T> {
  constructor(private _db: DbMongo, private _model: Model<any>) {}
  create(trx: MongoTransaction, t: T): Promise<T> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.create([t], { session: _trx });
    });
  }
  update(trx: MongoTransaction, t: T): Promise<T> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model
        .findByIdAndUpdate((t as any)._id, t, { session: _trx })
        .exec();
    });
  }
  save(trx: MongoTransaction, t: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  delete(trx: MongoTransaction, t: T): Promise<T> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model
        .findByIdAndDelete((t as any)._id, { session: _trx })
        .exec();
    });
  }
  findAll(
    trx: MongoTransaction,
    condition?: Partial<T>,
    paging?: PagingDto
  ): Promise<T[]> {
    return this._db.withTransaction(trx, (_trx) => {
      const query = this._model.find(condition).session(_trx);

      if (paging) {
        query.limit(paging.limit).skip(paging.getSkip()).sort(paging.sort);
      }
      return query.exec();
    });
  }
  count(trx: MongoTransaction, condition?: Partial<T>): Promise<number> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.countDocuments(condition, { session: _trx }).exec();
    });
  }
}
