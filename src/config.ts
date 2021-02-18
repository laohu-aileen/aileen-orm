import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";

export interface Config extends MysqlConnectionOptions {
  /**
   * 是否启用,默认true
   */
  enable?: boolean;
}
