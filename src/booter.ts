import { declareRegister, Autowride, Newable } from "aileen-core";
import { ConfigBean, ConnectionBean } from "./injector";
import { createConnection } from "typeorm";
import {
  EntityComponentID,
  EntityRepository,
  getEntityRepositoryRef,
} from "./annotation";
import { Config } from "./config";

/**
 * 申明REPO
 * @param name
 */
export const declareRepo = <T>(
  name?: string
): {
  ID: symbol;
  Injector: PropertyDecorator & MethodDecorator;
  Component: (entity: Newable<T>) => ClassDecorator;
} => {
  const ID = Symbol(name);
  return {
    Component: (entity: Newable<T>) => EntityRepository(entity, ID),
    Injector: Autowride(ID),
    ID,
  };
};

/**
 * 声明启动器
 */
export const register = declareRegister(async (app, next) => {
  // 插件未配置
  if (!app.has(ConfigBean.ID)) return await next();

  // 服务不启动
  const config = app.get<Config>(ConfigBean.ID);
  if (!config.enable) return await next();

  // 读取模型实体
  const entities = app.getRefsByTag(EntityComponentID);

  // 注册连接管理器
  const connection = await createConnection({
    ...config,
    entities,
  });

  // 重载注入逻辑
  for (const metadata of connection.entityMetadatas) {
    const build = metadata.create.bind(metadata);
    metadata.create = (...args) => {
      const entity = build(...args);
      app.resolve(entity);
      return entity;
    };
  }

  // 注册依赖到容器
  app.bind(ConnectionBean.ID).toValue(connection);
  const { manager } = connection;

  // 注册数据仓库
  for (const entity of entities) {
    const repoRef = getEntityRepositoryRef(entity);
    if (!repoRef) continue;
    const { id, target } = repoRef;
    app.bind(target).toFactory(() => manager.getCustomRepository(target));
    if (id) app.alias(target, id);
  }

  // 执行应用启动
  await next();
});
