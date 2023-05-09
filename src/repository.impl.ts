import { Repository, TransactionStore } from '@linhx/nest-repo';
import { PagingDto } from '@linhx/rest-common';
import { ClientSession, Model } from 'mongoose';
import { DbMongo } from './db.mongo';

export class RepositoryImpl<T, U> implements Repository<T, U> {
  constructor(
    private _db: DbMongo,
    private _model: Model<any>,
    private transactionStore?: TransactionStore
  ) {}
  async create(t: T): Promise<T> {
    const [entity] = await this._model.create([t], {
      session: this.transactionStore.getTransaction(),
    });
    return entity;
  }
  createMany(...ts: T[]): Promise<T[]> {
    return this._model.create(ts, {
      session: this.transactionStore.getTransaction(),
    });
  }
  update(t: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this._model.findByIdAndUpdate(
        (t as any)._id,
        t,
        {
          session: this.transactionStore.getTransaction() as ClientSession,
        },
        (err, doc) => {
          if (err) {
            reject(err);
          } else {
            resolve(doc);
          }
        }
      );
    });
  }
  save(t: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this._model.findByIdAndUpdate(
        (t as any)._id,
        t,
        {
          session: this.transactionStore.getTransaction() as ClientSession,
          upsert: true,
        },
        (err, doc) => {
          if (err) {
            reject(err);
          } else {
            resolve(doc);
          }
        }
      );
    });
  }
  saveAll(ts: T[]): Promise<T[]> {
    return Promise.all(ts.map((t) => this.save(t)));
  }
  delete(t: T): Promise<T> {
    return this._model
      .findByIdAndDelete((t as any)._id, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .exec();
  }
  async deleteAll(): Promise<void> {
    await this._model
      .deleteMany(
        {},
        { session: this.transactionStore.getTransaction() as ClientSession }
      )
      .exec();
  }
  async deleteById(id: U): Promise<void> {
    await this._model
      .findByIdAndDelete(id, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .exec();
  }
  async deleteAllById(ids: U[]): Promise<void> {
    await this._model
      .deleteMany(
        { _id: { $in: ids } },
        { session: this.transactionStore.getTransaction() as ClientSession }
      )
      .exec();
  }
  async existsById(id: U): Promise<boolean> {
    const count = await this._model
      .find({ _id: id }, undefined, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .countDocuments()
      .exec();
    return count > 0;
  }
  findAll(condition?: Partial<T>, paging?: PagingDto): Promise<T[]> {
    const query = this._model
      .find(condition)
      .session(this.transactionStore.getTransaction() as ClientSession);

    if (paging) {
      query.limit(paging.limit).skip(paging.getSkip()).sort(paging.sort);
    }
    return query.exec();
  }
  findAllById(ids: U[]): Promise<T[]> {
    return this._model
      .find({ _id: { $in: ids } }, undefined, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .exec();
  }
  findById(id: U): Promise<T> {
    return this._model
      .findById(id, undefined, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .exec();
  }
  count(condition?: Partial<T>): Promise<number> {
    return this._model
      .countDocuments(condition, {
        session: this.transactionStore.getTransaction() as ClientSession,
      })
      .exec();
  }
}
