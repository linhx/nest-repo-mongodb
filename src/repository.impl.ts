import { PagingDto } from '@linhx/rest-common';
import { Model } from 'mongoose';
import { CSession, Db } from './db';
import { Repository } from './repository';

export class RepositoryImpl<T> implements Repository<T> {
  constructor(private _db: Db, private _model: Model<any>) {}
  create(sess: CSession, t: T): Promise<T> {
    return this._db.withTransaction(sess, (_sess) => {
      return this._model.create([t], { session: _sess });
    });
  }
  update(sess: CSession, t: T): Promise<T> {
    return this._db.withTransaction(sess, (_sess) => {
      return this._model
        .findByIdAndUpdate((t as any)._id, t, { session: _sess })
        .exec();
    });
  }
  save(sess: CSession, t: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  delete(sess: CSession, t: T): Promise<T> {
    return this._db.withTransaction(sess, (_sess) => {
      return this._model
        .findByIdAndDelete((t as any)._id, { session: _sess })
        .exec();
    });
  }
  findAll(
    sess: CSession,
    condition?: Partial<T>,
    paging?: PagingDto,
  ): Promise<T[]> {
    return this._db.withTransaction(sess, (_sess) => {
      const query = this._model.find(condition).session(_sess);

      if (paging) {
        query.limit(paging.limit).skip(paging.getSkip()).sort(paging.sort);
      }
      return query.exec();
    });
  }
  count(sess: CSession, condition?: Partial<T>): Promise<number> {
    return this._db.withTransaction(sess, (_sess) => {
      return this._model.countDocuments(condition, { session: _sess }).exec();
    });
  }
}
