import { Repository, Transaction } from '@linhx/nest-repo';
import { PagingDto } from '@linhx/rest-common';
import { Model } from 'mongoose';
import { DbMongo, MongoTransaction } from './db.mongo';

export class RepositoryImpl<T, U> implements Repository<T, U> {
  constructor(private _db: DbMongo, private _model: Model<any>) {}
  create(trx: MongoTransaction, t: T): Promise<T> {
    return this._db.withTransaction(trx, async (_trx) => {
      const [entity] = await this._model.create([t], { session: _trx });
      return entity;
    });
  }
  createMany(trx: MongoTransaction, ...ts: T[]): Promise<T> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.create(ts, { session: _trx });
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
    return this._db.withTransaction(trx, (_trx) => {
      return this._model
        .findByIdAndUpdate((t as any)._id, t, { session: _trx, upsert: true })
        .exec();
    });
  }
  saveAll(trx: MongoTransaction, ts: T[]): Promise<T[]> {
    return this._db.withTransaction(trx, (_trx) => {
      return Promise.all(ts.map((t) => this.save(_trx, t)));
    });
  }
  delete(trx: MongoTransaction, t: T): Promise<T> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model
        .findByIdAndDelete((t as any)._id, { session: _trx })
        .exec();
    });
  }
  deleteAll(trx: MongoTransaction): Promise<void> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.deleteMany({}, { session: _trx }).exec();
    });
  }
  deleteById(trx: MongoTransaction, id: U): Promise<void> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.findByIdAndDelete(id, { session: _trx }).exec();
    });
  }
  deleteAllById(trx: MongoTransaction, ids: U[]): Promise<void> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model
        .deleteMany({ _id: { $in: ids } }, { session: _trx })
        .exec();
    });
  }
  existsById(trx: MongoTransaction, id: U): Promise<boolean> {
    return this._db.withTransaction(trx, async (_trx) => {
      const count = await this._model
        .find({ _id: id }, undefined, { session: _trx })
        .countDocuments()
        .exec();
      return count > 0;
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
  findAllById(trx: MongoTransaction, ids: U[]): Promise<T[]> {
    return this._db.withTransaction(trx, async (_trx) => {
      return this._model
        .find({ _id: { $in: ids } }, undefined, {
          session: _trx,
        })
        .exec();
    });
  }
  findById(trx: MongoTransaction, id: U): Promise<T> {
    return this._db.withTransaction(trx, async (_trx) => {
      return this._model
        .findById(id, undefined, {
          session: _trx,
        })
        .exec();
    });
  }
  count(trx: MongoTransaction, condition?: Partial<T>): Promise<number> {
    return this._db.withTransaction(trx, (_trx) => {
      return this._model.countDocuments(condition, { session: _trx }).exec();
    });
  }
}
