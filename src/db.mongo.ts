import { Transaction, Db } from '@linhx/nest-repo';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

export type MongoTransaction = ClientSession & Transaction;

@Injectable()
export class DbMongo implements Db {
  constructor(@InjectConnection() private conn: Connection) {}

  async withTransaction(
    transaction: MongoTransaction,
    callback: (transaction: MongoTransaction) => Promise<any>
  ) {
    if (transaction) {
      return callback(transaction);
    } else {
      const _transaction = await this.conn.startSession();
      let result;
      await _transaction.withTransaction<any>(async (ss) => {
        result = await callback(ss);
      });
      return result;
    }
  }
}
